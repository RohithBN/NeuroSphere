"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";

// Navbar items
const navItems = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "Community", href: "/#community" },
  { name: "About", href: "/#about" },
];

// Dashboard items (for logged-in users)
const dashboardItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "AI Therapist", href: "/therapist" },
  { name: "Journal", href: "/journal" },
  { name: "Community", href: "/community" },
];

export default function Navbar() {
  const { user, logout, userProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-black/25 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center border border-white/20 shadow-lg">
                <span className="text-white font-bold text-xl">N</span>
              </div>
            </Link>
            <Link href="/">
              <span className="text-white font-bold text-lg tracking-tight">NeuroSphere</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              type="button"
              className="text-white hover:text-gray-300 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <MdClose className="h-6 w-6" />
              ) : (
                <MdMenu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex space-x-6">
              {user 
                ? dashboardItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ))
                : navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ))
              }
            </div>
          </div>

          {/* CTA Button / User Profile */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="group relative">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/20 shadow-lg group-hover:border-white/30 transition-all">
                      {userProfile?.photoURL ? (
                        <img src={userProfile.photoURL} alt={userProfile.name} className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-300 text-sm font-medium hidden lg:block">
                      {userProfile?.name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl border border-white/10 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                    <div className="py-2">
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                      >
                        My Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/login"
                  className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-white/10 hover:bg-white/15 text-white py-2 px-4 rounded-full text-sm font-medium border border-white/25 transition-all duration-300 shadow-lg hover:shadow-white/5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black/80 backdrop-blur-xl border-b border-white/10">
            {user 
              ? dashboardItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))
              : navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))
            }
            
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-4 pb-3 border-t border-white/5">
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 bg-white/10 rounded-md text-base font-medium text-white hover:bg-white/15 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}