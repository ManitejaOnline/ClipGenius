"use client";

import React from "react";

interface NavLink {
  href: string;
  label: string;
  isButton?: boolean;
}

const navLinks: NavLink[] = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#start", label: "Try Now", isButton: true },
];

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 bg-gray-900 shadow z-50" role="banner">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg
            className="w-8 h-8 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <span className="text-xl font-bold text-white">ClipGenius</span>
        </div>
        <nav className="space-x-6 text-sm" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={link.isButton 
                ? "bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold transition-colors"
                : "hover:text-blue-400 transition-colors text-gray-300"}
              aria-label={link.label}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar; 