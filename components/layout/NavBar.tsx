'use client'
import React from 'react'
import { useAuth, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Container from './Container';

const NavBar = () => {
  const router = useRouter()
  const { userId } = useAuth()
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <Container>
        <nav className="z-50 bg-white/90 backdrop-blur-md shadow-md sticky top-0 left-0 w-full">
          <div className="container mx-auto px-4 py-3">
            {/* Three-column layout */}
            <div className="grid grid-cols-3 items-center">
              {/* Logo Section */}
              <div className="flex items-center space-x-3" onClick={() => router.push('/')}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 200 200"
                  width="50"
                  height="50"
                  className="transform transition-transform hover:scale-110"
                >
                  <defs>
                    <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#8A4FFF" }} />
                      <stop offset="100%" style={{ stopColor: "#3CECFF" }} />
                    </linearGradient>
                  </defs>
                  <rect width="200" height="200" fill="url(#modernGradient)" rx="40" />
                  <g transform="translate(50, 60) scale(0.7)">
                    <path
                      d="M20 60 C40 30, 100 30, 120 60 C140 90, 100 120, 80 150 C60 180, 20 120, 20 60"
                      fill="white"
                      opacity="0.9"
                    />
                    <path
                      d="M80 20 C100 -10, 160 -10, 180 20 C200 50, 160 80, 140 110 C120 140, 80 80, 80 20"
                      fill="white"
                      opacity="0.7"
                    />
                  </g>
                </svg>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
                  Chattr
                </span>
              </div>

              {/* Centered Navigation */}
              <div className="flex justify-center">
                <ul className="flex items-center space-x-8">
                  <li className="relative group">
                    <a className="text-gray-600 hover:text-purple-600 font-medium px-2 py-1 transition-colors duration-200">
                      Home
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
                    </a>
                  </li>
                  <li className="relative group">
                    <a className="text-gray-600 hover:text-purple-600 font-medium px-2 py-1 transition-colors duration-200">
                      Blog
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
                    </a>
                  </li>
                  <li className="relative group">
                    <a className="text-gray-600 hover:text-purple-600 font-medium px-2 py-1 transition-colors duration-200">
                      About
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
                    </a>
                  </li>
                  <li className="relative group">
                    <a className="text-gray-600 hover:text-purple-600 font-medium px-2 py-1 transition-colors duration-200">
                      Support
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Right Section: Search and User */}
              <div className="flex items-center justify-end space-x-4">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-48 rounded-full pl-8 pr-4 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 bg-white/80"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                {/* Login Button with Dropdown */}
                <div className="dropdown dropdown-end">
                  <UserButton />
                  {!userId &&
                    <button onClick={() => router.push('/sign-in')} className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:from-purple-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-105">
                      Login
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        </nav>
      </Container>
    </div>
  );
}

export default NavBar;
