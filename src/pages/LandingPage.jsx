import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, BookOpen, BarChart3, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-100 py-4 px-6 sm:px-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#0F3C8A] p-2 rounded-lg">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-[#0F3C8A] tracking-tight">Tech Audit</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#0F3C8A] transition-colors">
            Login
          </Link>
          <Link to="/student/signup" className="text-sm font-semibold bg-[#FF6B00] text-white px-4 py-2 rounded-lg hover:bg-[#e66000] transition-colors shadow-sm">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 py-16 sm:py-24">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A2540] tracking-tight mb-6 max-w-4xl">
          The All-in-One <span className="text-[#0F3C8A]">Educational Audit</span> Platform
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl leading-relaxed">
          Streamline syllabus tracking, manage attendance, deploy assignments, and monitor student performance with comprehensive, real-time analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/login" className="px-8 py-3 bg-[#0F3C8A] text-white rounded-xl font-semibold hover:bg-[#0b2c66] transition-all shadow-md text-lg">
            Access Dashboard
          </Link>
          <Link to="/student/signup" className="px-8 py-3 bg-white text-[#0F3C8A] border-2 border-[#0F3C8A] rounded-xl font-semibold hover:bg-gray-50 transition-all text-lg">
            Join as Student
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full px-4 text-left mt-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-[#0F3C8A]">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#0A2540]">Role-Based Access</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Dedicated interfaces and controls for students, teachers, and administrators to focus on what matters most.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center text-[#FF6B00]">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#0A2540]">Syllabus & Assignments</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Track academic progress through an integrated LMS, assignment workflows, and syllabus management.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-[#0F3C8A]">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#0A2540]">Deep Analytics</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Generate performance reports, track batch engagement, and audit overall institute effectiveness with ease.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Nexcore Alliance LLP. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/private-policy" className="text-gray-500 hover:text-[#0F3C8A] font-medium transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
