import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedNavbarProps {
    canRegister?: boolean;
}

export default function AnimatedNavbar({
    canRegister = true,
}: AnimatedNavbarProps) {
    const { auth, name } = usePage<SharedData>().props;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
    const [lastScrollY, setLastScrollY] = useState(0);
    const navRef = useRef<HTMLElement>(null);
    const logoRef = useRef<HTMLDivElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Determine scroll direction
                    if (currentScrollY > lastScrollY && currentScrollY > 100) {
                        setScrollDirection('down');
                    } else {
                        setScrollDirection('up');
                    }
                    setLastScrollY(currentScrollY);

                    // Update scrolled state
                    const shouldBeScrolled = currentScrollY > 50;
                    if (shouldBeScrolled !== isScrolled) {
                        setIsScrolled(shouldBeScrolled);
                        
                        // Animate navbar transformation
                        if (navRef.current) {
                            gsap.to(navRef.current, {
                                y: shouldBeScrolled && scrollDirection === 'down' && currentScrollY > 200 ? -100 : 0,
                                duration: 0.3,
                                ease: 'power2.out',
                            });
                        }
                    }

                    if (currentScrollY > 50 && isMobileMenuOpen) {
                        setIsMobileMenuOpen(false);
                    }

                    ticking = false;
                });

                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initial animation on mount
        if (navRef.current && logoRef.current && linksRef.current && buttonsRef.current) {
            const tl = gsap.timeline();
            
            tl.fromTo(
                logoRef.current,
                { opacity: 0, x: -50, scale: 0.8 },
                { opacity: 1, x: 0, scale: 1, duration: 1, ease: 'power3.out' }
            )
            .fromTo(
                linksRef.current.children,
                { opacity: 0, y: -30, rotateX: -90 },
                {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'back.out(1.2)',
                },
                '-=0.6'
            )
            .fromTo(
                buttonsRef.current.children,
                { opacity: 0, scale: 0, rotate: -180 },
                {
                    opacity: 1,
                    scale: 1,
                    rotate: 0,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: 'elastic.out(1, 0.6)',
                },
                '-=0.5'
            );
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobileMenuOpen, isScrolled, lastScrollY, scrollDirection]);

    useEffect(() => {
        // Animate mobile menu
        if (mobileMenuRef.current) {
            if (isMobileMenuOpen) {
                const tl = gsap.timeline();
                
                tl.fromTo(
                    mobileMenuRef.current,
                    { opacity: 0, y: -30, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
                )
                .fromTo(
                    mobileMenuRef.current.querySelectorAll('.mobile-menu-item'),
                    { opacity: 0, x: -30, rotateY: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        rotateY: 0,
                        duration: 0.5,
                        stagger: 0.08,
                        ease: 'power2.out',
                    },
                    '-=0.2'
                );
            } else {
                gsap.to(mobileMenuRef.current, {
                    opacity: 0,
                    y: -20,
                    duration: 0.2,
                    ease: 'power2.in',
                });
            }
        }
    }, [isMobileMenuOpen]);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            // Smooth animated scroll
            const targetPosition = element.offsetTop - 100;
            
            gsap.to(window, {
                scrollTo: { y: targetPosition, autoKill: true },
                duration: 1.2,
                ease: 'power3.inOut',
            });
            
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <>
            <nav
                ref={navRef}
                className={`fixed right-0 left-0 z-50 mx-auto transition-all duration-500 ${
                    isScrolled
                        ? 'top-4 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-7xl rounded-2xl border border-gray-200 bg-white/90 shadow-xl backdrop-blur-md dark:border-gray-800 dark:bg-[#1a1a1a]/90'
                        : 'top-0 w-full bg-white/50 backdrop-blur-sm dark:bg-[#0a0a0a]/50'
                }`}
            >
                <div
                    className={`mx-auto flex items-center justify-between transition-all duration-300 ${
                        isScrolled ? 'px-4 sm:px-6 py-3' : 'px-4 sm:px-6 lg:px-8 py-4'
                    }`}
                >
                    {/* Logo - Left */}
                    <div ref={logoRef} className="flex items-center gap-2 sm:gap-3">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-600 shadow-md dark:bg-purple-500">
                            <span className="text-lg sm:text-xl font-bold text-white">
                                B
                            </span>
                        </div>
                        <span className="text-lg sm:text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                            {name || 'BardeLingo'}
                        </span>
                    </div>

                    {/* Desktop Navigation Links - Center */}
                    <div
                        ref={linksRef}
                        className="hidden lg:flex items-center gap-6 xl:gap-8"
                    >
                        <button
                            onClick={() => scrollToSection('features')}
                            className="text-sm font-medium text-[#1b1b18] transition-all hover:text-purple-600 hover:scale-105 dark:text-[#EDEDEC] dark:hover:text-purple-400"
                        >
                            Features
                        </button>
                        <button
                            onClick={() => scrollToSection('courses')}
                            className="text-sm font-medium text-[#1b1b18] transition-all hover:text-purple-600 hover:scale-105 dark:text-[#EDEDEC] dark:hover:text-purple-400"
                        >
                            Courses
                        </button>
                        <button
                            onClick={() => scrollToSection('about')}
                            className="text-sm font-medium text-[#1b1b18] transition-all hover:text-purple-600 hover:scale-105 dark:text-[#EDEDEC] dark:hover:text-purple-400"
                        >
                            About
                        </button>
                    </div>

                    {/* Right Side - Auth Buttons + Mobile Menu */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Desktop Auth Buttons */}
                        <div ref={buttonsRef} className="hidden sm:flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-block rounded-full border border-gray-200 bg-white px-4 sm:px-6 py-2 text-xs sm:text-sm leading-normal font-medium text-[#1b1b18] transition-all hover:border-gray-300 hover:shadow-lg hover:scale-105 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-[#EDEDEC] dark:hover:border-gray-600"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="hidden md:inline-block rounded-full border border-transparent px-4 sm:px-6 py-2 text-xs sm:text-sm leading-normal font-medium text-[#1b1b18] transition-all hover:text-purple-600 hover:scale-105 dark:text-[#EDEDEC] dark:hover:text-purple-400"
                                    >
                                        Login
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-block rounded-full bg-purple-600 px-4 sm:px-6 py-2 text-xs sm:text-sm leading-normal font-medium text-white transition-all hover:shadow-xl hover:scale-105 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    ref={mobileMenuRef}
                    className={`fixed inset-x-0 z-40 lg:hidden ${
                        isScrolled ? 'top-20' : 'top-16'
                    }`}
                >
                    <div className="mx-4 rounded-2xl border border-gray-200 bg-white/95 p-6 shadow-2xl backdrop-blur-md dark:border-gray-800 dark:bg-[#1a1a1a]/95">
                        {/* Mobile Navigation Links */}
                        <div className="space-y-4 mb-6">
                            <button
                                onClick={() => scrollToSection('features')}
                                className="mobile-menu-item block w-full text-left px-4 py-3 text-base font-medium text-[#1b1b18] rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:text-[#EDEDEC] dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection('courses')}
                                className="mobile-menu-item block w-full text-left px-4 py-3 text-base font-medium text-[#1b1b18] rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:text-[#EDEDEC] dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
                            >
                                Courses
                            </button>
                            <button
                                onClick={() => scrollToSection('about')}
                                className="mobile-menu-item block w-full text-left px-4 py-3 text-base font-medium text-[#1b1b18] rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:text-[#EDEDEC] dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
                            >
                                About
                            </button>
                        </div>

                        {/* Mobile Auth Buttons */}
                        <div className="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="mobile-menu-item block w-full rounded-full border border-gray-200 bg-white px-6 py-3 text-center text-sm font-medium text-[#1b1b18] transition-all hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-[#EDEDEC] dark:hover:border-gray-600"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="mobile-menu-item block w-full rounded-full border border-gray-200 bg-white px-6 py-3 text-center text-sm font-medium text-[#1b1b18] transition-all hover:border-purple-600 hover:text-purple-600 dark:border-gray-700 dark:bg-[#1a1a1a] dark:text-[#EDEDEC] dark:hover:border-purple-500 dark:hover:text-purple-400"
                                    >
                                        Login
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="mobile-menu-item block w-full rounded-full bg-purple-600 px-6 py-3 text-center text-sm font-medium text-white transition-all hover:bg-purple-700 hover:shadow-xl dark:bg-purple-500 dark:hover:bg-purple-600"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
