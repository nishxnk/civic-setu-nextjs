"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Government Header Strip */}
      <div className="bg-blue-900 text-gray-100 py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <span className="mb-1 md:mb-0">Official Government Portal</span>
          <div className="flex flex-wrap gap-3 text-gray-200 text-xs md:text-sm">
            <a href="#" className="flex items-center gap-1 hover:text-yellow-400">
              <i className="fas fa-globe"></i> Government of India
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-yellow-400">
              <i className="fas fa-star"></i> Digital India Initiative
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-yellow-400">
              <i className="fas fa-shield-alt"></i> Secure & Verified
            </a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <i className="fas fa-landmark text-blue-700 text-3xl"></i>
            <div className="leading-tight">
              <span className="block text-xl font-bold text-gray-800">CivicSetu</span>
              <span className="block text-sm text-gray-500">Government Portal</span>
            </div>
          </Link>

          {/* Menu Items */}
          <ul
            className={`flex flex-col md:flex-row md:items-center absolute md:static bg-white left-0 w-full md:w-auto top-[70px] md:top-auto shadow-md md:shadow-none transition-all duration-300 ease-in-out ${
              menuOpen ? "opacity-100 visible" : "opacity-0 invisible md:visible md:opacity-100"
            }`}
          >
            <li><Link href="/" className="block px-6 py-3 text-gray-700 hover:text-blue-600">Home</Link></li>
            <li><Link href="/about" className="block px-6 py-3 text-gray-700 hover:text-blue-600">About</Link></li>
            <li><Link href="/contact" className="block px-6 py-3 text-gray-700 hover:text-blue-600">Contact</Link></li>
            <li><Link href="/complaint" className="block px-6 py-3 text-gray-700 hover:text-blue-600">Report Issue</Link></li>
            <li>
              <Link href="/login" className="block mx-6 my-3 md:my-0 text-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition">
                Citizen Login
              </Link>
            </li>
          </ul>

          {/* Hamburger */}
          <div
            className="md:hidden flex flex-col gap-1 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="block w-6 h-[2px] bg-gray-700"></span>
            <span className="block w-6 h-[2px] bg-gray-700"></span>
            <span className="block w-6 h-[2px] bg-gray-700"></span>
          </div>
        </div>
      </nav>
    </>
  );
}
