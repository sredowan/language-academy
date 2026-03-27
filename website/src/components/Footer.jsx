import React from 'react';
import Link from 'next/link';
import { Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">
                LA
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Language Academy</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Empowering students in Bangladesh to achieve their global dreams through world-class PTE and IELTS coaching.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Globe size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/courses" className="text-sm hover:text-primary transition-colors">Find a Course</Link></li>
              <li><Link href="/about" className="text-sm hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-sm hover:text-primary transition-colors">Success Stories</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Portals</h3>
            <ul className="space-y-3">
              <li><a href="http://localhost:3000/student/login" className="text-sm hover:text-primary transition-colors">Student Login</a></li>
              <li><a href="http://localhost:3000/teacher/" className="text-sm hover:text-primary transition-colors">Teacher Portal</a></li>
              <li><a href="http://localhost:3000/admin/" className="text-sm hover:text-primary transition-colors">Admin Dashboard</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400">House 12, Road 4, Dhanmondi, Dhaka 1205, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span className="text-sm text-slate-400">+880 17 0000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span className="text-sm text-slate-400">hello@languageacademy.com.bd</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Language Academy BD. Built by Renetech. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
