# Guide de Déploiement: VM Proxmox avec Docker

Ce guide explique comment déployer Barde Lingo sur une VM Proxmox en utilisant des conteneurs Docker avec une base de données externe.

## Architecture

Cette application utilise une architecture multi-conteneurs Docker:
- **app**: PHP-FPM 8.4 + Laravel + Reverb + Queue Workers (Supervisor)
- **nginx**: Serveur web Nginx (proxy vers PHP-FPM et WebSocket)
- **redis**: Cache Redis
- **PostgreSQL**: Base de données externe (hors Docker)

## Prérequis

- Serveur Proxmox VE
- Base de données PostgreSQL externe (version 16+)
- Nom de domaine (optionnel mais recommandé)
- Accès SSH à votre VM Proxmox

## Étape 1: Préparer la VM Proxmox

### Créer une VM Ubuntu
1. Dans l'interface web Proxmox, créez une nouvelle VM:
   - **OS**: Ubuntu 22.04 ou 24.04 LTS
   - **CPU**: 2+ cœurs
   - **RAM**: 4GB minimum (8GB recommandé)
   - **Disque**: 30GB minimum
   - **Réseau**: Bridge vers votre réseau

2. Démarrez la VM et complétez l'installation d'Ubuntu

### Configuration initiale de la VM
Connectez-vous en SSH à votre VM et exécutez:

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les outils essentiels
sudo apt install -y git curl wget nano ufw

# Configurer le pare-feu
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Reverb WebSocket
sudo ufw enable
```

## Étape 2: Installer Docker

```bash
# Supprimer les anciennes versions de Docker
sudo apt remove -y docker docker-engine docker.io containerd runc

# Installer les dépendances Docker
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Ajouter la clé GPG officielle de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Configurer le dépôt Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker

# Vérifier l'installation
docker --version
docker compose version
```

## Étape 3: Préparer la base de données externe

Sur votre serveur PostgreSQL, créez la base de données et l'utilisateur:

```sql
-- Se connecter à PostgreSQL en tant que superuser
CREATE DATABASE barde_lingo;
CREATE USER barde_lingo WITH ENCRYPTED PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON DATABASE barde_lingo TO barde_lingo;

-- Se connecter à la base barde_lingo
\c barde_lingo

-- Accorder les privilèges sur le schéma (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO barde_lingo;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO barde_lingo;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO barde_lingo;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO barde_lingo;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO barde_lingo;
```

### Configurer PostgreSQL pour l'accès distant

Éditez `postgresql.conf`:
```conf
listen_addresses = '*'  # ou une IP spécifique
```

Éditez `pg_hba.conf` pour autoriser l'IP de votre VM:
```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    barde_lingo     barde_lingo     IP_DE_VOTRE_VM/32      scram-sha-256
```

Redémarrez PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Étape 4: Déployer l'application sur la VM

### Cloner le dépôt
```bash
cd /opt
sudo git clone https://github.com/VOTRE_USERNAME/barde_lingo.git
sudo chown -R $USER:$USER barde_lingo
cd barde_lingo
```

### Configurer l'environnement
```bash
# Copier l'exemple de production
cp .env.production.example .env

# Éditer le fichier d'environnement
nano .env
```

Mettez à jour ces valeurs critiques dans `.env`:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://votre-domaine-ou-ip.com
APP_KEY=  # Sera généré à l'étape suivante

# Base de données (votre PostgreSQL externe)
DB_HOST=ip-de-votre-db-externe
DB_PORT=5432
DB_DATABASE=barde_lingo
DB_USERNAME=barde_lingo
DB_PASSWORD=votre-mot-de-passe-securise

# Redis (conteneur Docker)
REDIS_HOST=redis

# Reverb WebSocket
REVERB_HOST="votre-domaine-ou-ip.com"
REVERB_SCHEME=http  # Changez en https si vous utilisez SSL
```

### Générer la clé d'application
```bash
# Démarrer temporairement le conteneur app pour générer la clé
docker compose -f docker-compose.production.yml run --rm app php artisan key:generate --show
```

Copiez la clé générée et collez-la dans votre fichier `.env` comme `APP_KEY=base64:...`

### Construire et démarrer les conteneurs
```bash
# Construire l'image Docker
docker compose -f docker-compose.production.yml build

# Démarrer tous les services
docker compose -f docker-compose.production.yml up -d

# Vérifier le statut des conteneurs
docker compose -f docker-compose.production.yml ps
```

### Exécuter les migrations de base de données
```bash
docker compose -f docker-compose.production.yml exec app php artisan migrate --force
```

### Optimiser l'application
```bash
docker compose -f docker-compose.production.yml exec app php artisan config:cache
docker compose -f docker-compose.production.yml exec app php artisan route:cache
docker compose -f docker-compose.production.yml exec app php artisan view:cache
docker compose -f docker-compose.production.yml exec app php artisan event:cache
```

### Remplir la base de données (Optionnel)
```bash
docker compose -f docker-compose.production.yml exec app php artisan db:seed
```

## Étape 5: Configurer SSL avec Certbot (Optionnel mais Recommandé)

Pour activer HTTPS avec Let's Encrypt:

```bash
# Installer Certbot sur l'hôte
sudo apt install -y certbot

# Obtenir le certificat (arrêtez nginx d'abord)
docker compose -f docker-compose.production.yml stop nginx

sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com

# Les certificats seront dans /etc/letsencrypt/live/votre-domaine.com/
```

Créez la configuration SSL pour Nginx:
```bash
nano docker/nginx/ssl.conf
```

```nginx
server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;
    
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /var/www/public;
    index index.php;
    
    client_max_body_size 100M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_read_timeout 600;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}
```

Mettez à jour `docker-compose.production.yml` pour monter les certificats:
```yaml
  nginx:
    volumes:
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./docker/nginx/ssl.conf:/etc/nginx/conf.d/ssl.conf
      - ./docker/nginx/reverb.conf:/etc/nginx/conf.d/reverb.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - app_public:/var/www/public:ro
      - ./storage/logs/nginx:/var/log/nginx
```

Mettez à jour `.env`:
```env
APP_URL=https://votre-domaine.com
REVERB_SCHEME=https
```

Redémarrez:
```bash
docker compose -f docker-compose.production.yml up -d
```

### Renouvellement Automatique SSL

Créez un cron job pour renouveler les certificats:
```bash
sudo crontab -e
```

Ajoutez:
```cron
0 3 * * * certbot renew --quiet --deploy-hook "cd /opt/barde_lingo && docker compose -f docker-compose.production.yml restart nginx"
```

## Étape 6: Script de déploiement automatisé

Le script `deploy-docker.sh` inclus gère les mises à jour. Rendez-le exécutable:

```bash
chmod +x deploy-docker.sh
```

Pour déployer les mises à jour:
```bash
./deploy-docker.sh
```

## Surveillance & Maintenance

### Consulter les logs
```bash
# Tous les conteneurs
docker compose -f docker-compose.production.yml logs -f

# Logs de l'application
docker compose -f docker-compose.production.yml logs -f app

# Logs Nginx
docker compose -f docker-compose.production.yml logs -f nginx
cat storage/logs/nginx/access.log
cat storage/logs/nginx/error.log

# Logs Reverb
docker compose -f docker-compose.production.yml exec app tail -f storage/logs/reverb.log

# Logs Queue Worker
docker compose -f docker-compose.production.yml exec app tail -f storage/logs/worker.log

# Logs Laravel
docker compose -f docker-compose.production.yml exec app tail -f storage/logs/laravel.log
```

### Redémarrer les services
```bash
# Redémarrer tous les conteneurs
docker compose -f docker-compose.production.yml restart

# Redémarrer un service spécifique
docker compose -f docker-compose.production.yml restart app
docker compose -f docker-compose.production.yml restart nginx
docker compose -f docker-compose.production.yml restart redis

# Vérifier le statut
docker compose -f docker-compose.production.yml ps

# Vérifier la santé des conteneurs
docker compose -f docker-compose.production.yml ps --format json | jq '.[].Health'
```

### Sauvegardes de base de données
```bash
# Sauvegarder la base de données externe
pg_dump -h votre-db-host -U barde_lingo barde_lingo > backup_$(date +%Y%m%d).sql

# Ou depuis la VM
docker compose -f docker-compose.production.yml exec app php artisan backup:run
```

### Mettre à jour l'application
```bash
cd /opt/barde_lingo
./deploy-docker.sh
```

## Dépannage

### Le conteneur ne démarre pas
```bash
# Vérifier les logs
docker compose -f docker-compose.production.yml logs app
docker compose -f docker-compose.production.yml logs nginx

# Vérifier si les ports sont disponibles
sudo netstat -tlnp | grep -E '80|8080|6379|9000'
```

### Impossible de se connecter à la base de données
```bash
# Tester depuis le conteneur
docker compose -f docker-compose.production.yml exec app php artisan tinker
>>> DB::connection()->getPdo();

# Tester la connexion PostgreSQL
docker compose -f docker-compose.production.yml exec app php -r "
  \$conn = pg_connect('host=IP_DB port=5432 dbname=barde_lingo user=barde_lingo password=MOT_DE_PASSE');
  echo \$conn ? 'Connexion OK' : 'Échec connexion';
"
```

### Problèmes de permissions
```bash
# Corriger les permissions de storage
docker compose -f docker-compose.production.yml exec app chown -R www-data:www-data /var/www/storage
docker compose -f docker-compose.production.yml exec app chmod -R 755 /var/www/storage
```

### Vider les caches
```bash
docker compose -f docker-compose.production.yml exec app php artisan cache:clear
docker compose -f docker-compose.production.yml exec app php artisan config:clear
docker compose -f docker-compose.production.yml exec app php artisan route:clear
docker compose -f docker-compose.production.yml exec app php artisan view:clear
```

### Nginx ne fonctionne pas
```bash
# Vérifier la configuration Nginx
docker compose -f docker-compose.production.yml exec nginx nginx -t

# Recharger Nginx
docker compose -f docker-compose.production.yml exec nginx nginx -s reload
```

## Bonnes pratiques de sécurité

1. **Changer les mots de passe par défaut** dans `.env`
2. **Définir APP_DEBUG=false** en production
3. **Utiliser HTTPS** avec des certificats SSL valides
4. **Restreindre l'accès à la base de données** à l'IP de la VM uniquement
5. **Sauvegardes régulières** de la base de données et du storage
6. **Garder les images Docker à jour**
7. **Surveiller les logs** pour détecter les activités suspectes
8. **Utiliser des règles de pare-feu strictes**

## Optimisation des performances

1. **Activer OPcache** (déjà configuré dans le Dockerfile)
2. **Utiliser le cache Redis** (configuré dans l'env de production)
3. **Mettre en file d'attente les tâches longues**
4. **Augmenter le nombre de workers de file d'attente** si nécessaire
5. **Surveiller l'utilisation des ressources**
6. **Cache Nginx** (configuré avec volumes)

```bash
# Vérifier l'utilisation des ressources
docker stats

# Augmenter les workers de file d'attente
# Éditez docker/supervisor/supervisord.conf et changez numprocs

# Vider le cache Nginx
docker compose -f docker-compose.production.yml exec nginx sh -c "rm -rf /var/cache/nginx/*"
docker compose -f docker-compose.production.yml restart nginx

# Optimiser Redis
docker compose -f docker-compose.production.yml exec redis redis-cli INFO memory
docker compose -f docker-compose.production.yml exec redis redis-cli BGSAVE
```

## Commandes utiles

```bash
# Entrer dans un conteneur
docker compose -f docker-compose.production.yml exec app bash
docker compose -f docker-compose.production.yml exec nginx sh

# Exécuter des commandes Artisan
docker compose -f docker-compose.production.yml exec app php artisan tinker
docker compose -f docker-compose.production.yml exec app php artisan queue:work --once
docker compose -f docker-compose.production.yml exec app php artisan reverb:restart

# Vérifier les processus Supervisor
docker compose -f docker-compose.production.yml exec app supervisorctl status

# Nettoyer Docker
docker system prune -a --volumes  # ATTENTION: supprime tout ce qui n'est pas utilisé
docker compose -f docker-compose.production.yml down -v  # Supprime les volumes
```

## Support

En cas de problème, vérifiez:
- Logs Laravel: `storage/logs/laravel.log`
- Logs Supervisor: `storage/logs/supervisord.log`
- Logs des conteneurs: `docker compose logs`
- Documentation Laravel: https://laravel.com/docs
