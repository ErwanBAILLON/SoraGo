import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeaderProps } from './types';

export const Header: React.FC<HeaderProps> = ({ transparent = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(!transparent);

  // Handle scroll effect
  useEffect(() => {
    if (!transparent) return;
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  // Mise à jour des éléments de navigation avec lien vers la page contact
  const navItems = [
    { name: 'About', href: '/#about' },
    { name: 'Features', href: '/#features' },
    { name: 'Plans', href: '/#plans' },
    { name: 'Testimonials', href: '/#testimonials' },
    { name: 'Contact', href: '/contact' },  // Lien modifié pour rediriger vers la page contact
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white text-contrast shadow-md' : 'bg-transparent text-white'
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/brand name that links to home */}
        <Link href="/" className="flex items-center">
          <h1 className={`text-2xl font-bold transition-colors duration-300 ${
            scrolled ? 'text-primary' : 'text-white'
          }`}>
            SoraGo
          </h1>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={`text-sm uppercase tracking-wide font-medium hover:text-accent transition-colors ${
                scrolled ? 'text-contrast' : 'text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-white py-4 px-6 shadow-lg">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-contrast hover:text-accent transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
