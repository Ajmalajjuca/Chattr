"use client"
import React, { useState } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import Container from './Container';

const NavBar = () => {
  const router = useRouter();
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/' },
    { name: 'About', href: '/' },
    { name: 'Support', href: '/' }
  ];

  return (
    <div className="min-h-[4rem] bg-gradient-to-br from-blue-50 to-indigo-100">
      <Container>
        <nav className="z-50 bg-white/90 backdrop-blur-md shadow-md sticky top-0 left-0 w-full">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo Section */}
              <div className="flex items-center flex-shrink-0" onClick={() => router.push('/')}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                  className="w-10 h-10 sm:w-12 sm:h-12 transform transition-transform hover:scale-110"
                >
                  <defs>
                    <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#8A4FFF" }} />
                      <stop offset="100%" style={{ stopColor: "#3CECFF" }} />
                    </linearGradient>
                  </defs>
                  <rect width="200" height="200" fill="url(#modernGradient)" rx="40" />
                  <g transform="translate(50, 60) scale(0.7)">
                    <path d="M20 60 C40 30, 100 30, 120 60 C140 90, 100 120, 80 150 C60 180, 20 120, 20 60" fill="white" opacity="0.9" />
                    <path d="M80 20 C100 -10, 160 -10, 180 20 C200 50, 160 80, 140 110 C120 140, 80 80, 80 20" fill="white" opacity="0.7" />
                  </g>
                </svg>
                <span className="ml-2 text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                  Chattr
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-center flex-1">
                <div className="flex space-x-8">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="relative group px-3 py-2 text-gray-600 hover:text-purple-600 font-medium transition-colors duration-200"
                    >
                      {link.name}
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Desktop Right Section */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-48 lg:w-64 rounded-full pl-8 pr-4 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-white/80"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center space-x-4">
                  <UserButton />
                  {!userId && (
                    <button
                      onClick={() => router.push('/sign-in')}
                      className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:from-purple-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center md:hidden">
                {userId && <UserButton />}
                <button title='open'
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="ml-2 p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100"
                >
                  <Search className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="ml-2 p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Search Bar */}
            {isSearchOpen && (
              <div className="md:hidden px-2 py-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full rounded-full pl-8 pr-4 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-white/80"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            )}

            {/* Mobile Navigation Menu */}
            {isOpen && (
              <div className="md:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  ))}
                  {!userId && (
                    <button
                      onClick={() => router.push('/sign-in')}
                      className="w-full mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:from-purple-700 hover:to-blue-600 transition-all duration-200"
                    >
                      Login
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>
      </Container>
    </div>
  );
};

export default NavBar;