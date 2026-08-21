import React from 'react';
import { 
  Shield, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  CreditCard,
  UserCheck, 
  Zap, 
  Lock, 
  ShieldCheck, 
  Users, 
  Cookie, 
  RefreshCcw 
} from 'lucide-react';

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#0d9b62] to-[#047787] pt-16 pb-24 px-4 sm:px-6 lg:px-8 text-center rounded-b-[2rem] shadow-sm">
        <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
          <Shield size={16} />
          <span>Your Privacy Matters</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          Privacy <span className="text-[#a4f4e1]">Policy</span>
        </h1>
        <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
          Your privacy matters to us. Learn how we protect your personal information.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 space-y-6">
        
        {/* Intro Box */}
        <div className="bg-[#f0fdf4] rounded-2xl p-6 shadow-sm border border-emerald-50">
          <div className="border-l-4 border-[#0d9b62] pl-4">
            <p className="text-gray-700 leading-relaxed text-[15px]">
              At <strong className="text-[#0d9b62]">NEXCORE ALLIANCE LLP</strong>, we are committed to safeguarding your privacy. This policy explains how we collect, use, and protect your personal information within the Tech Audit platform to ensure a secure and transparent educational management experience.
            </p>
          </div>
        </div>

        {/* 1. Data Collection */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#10b981] p-3 rounded-xl shadow-sm text-white">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#1e293b]">1. Data Collection</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
              <User className="text-[#3b82f6] mb-2" size={24} />
              <span className="text-sm font-medium text-gray-700">Name</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
              <Mail className="text-[#3b82f6] mb-2" size={24} />
              <span className="text-sm font-medium text-gray-700">Email</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
              <Phone className="text-[#3b82f6] mb-2" size={24} />
              <span className="text-sm font-medium text-gray-700">Phone</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-gray-50/50">
              <UserCheck className="text-[#3b82f6] mb-2" size={24} />
              <span className="text-sm font-medium text-gray-700">Role / ID</span>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed text-[15px]">
            We collect only the essential personal data required to provide you with our services. This information helps us manage institute records, student enrollment, and ensure a seamless academic tracking experience.
          </p>
        </div>

        {/* 2. Data Usage */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#3b82f6] p-3 rounded-xl shadow-sm text-white">
              <Zap size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#1e293b]">2. Data Usage</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-white">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0"></div>
              <p className="text-gray-600 text-[15px]">Tracking student attendance, project submissions, and syllabus progress.</p>
            </div>
            <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-white">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0"></div>
              <p className="text-gray-600 text-[15px]">Sending updates regarding institute schedules, assignments, and policies.</p>
            </div>
            <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-white">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0"></div>
              <p className="text-gray-600 text-[15px]">Generating performance analytics and audit reports for administrators.</p>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed text-[15px]">
            Your personal information is used strictly for educational management purposes. We value your trust and ensure your data is used responsibly.
          </p>
        </div>

        {/* 3. Data Security */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#ef4444] p-3 rounded-xl shadow-sm text-white">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#1e293b]">3. Data Security</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-100 rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#10b981]" size={20} />
                <h3 className="font-semibold text-gray-800">Encryption</h3>
              </div>
              <p className="text-gray-500 text-sm">Industry-standard encryption to protect your sensitive information.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#10b981]" size={20} />
                <h3 className="font-semibold text-gray-800">Secure Storage</h3>
              </div>
              <p className="text-gray-500 text-sm">Secure storage systems to prevent unauthorized access.</p>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed text-[15px]">
            We take your data security seriously and have implemented robust measures. Your privacy is our priority, and we continuously enhance our security protocols.
          </p>
        </div>

        {/* 4. Third-Party Sharing */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#8b5cf6] p-3 rounded-xl shadow-sm text-white">
              <Users size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#1e293b]">4. Third-Party Sharing</h2>
          </div>
          <p className="text-gray-600 leading-relaxed text-[15px]">
            Your data is never shared with third parties except for authorized institute management tools or secure hosting providers. We ensure that all third-party service providers adhere to strict educational data protection standards.
          </p>
        </div>

        {/* 5. Cookies */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#f59e0b] p-3 rounded-xl shadow-sm text-white">
              <Cookie size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#1e293b]">5. Cookies</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-white">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0"></div>
              <p className="text-gray-600 text-[15px]">Enhance your browsing experience within the Tech Audit portal.</p>
            </div>
            <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-white">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0"></div>
              <p className="text-gray-600 text-[15px]">Analyze platform usage and improve LMS functionality.</p>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed text-[15px]">
            Our platform uses cookies for various purposes. You can manage your cookie preferences through your browser settings.
          </p>
        </div>

        {/* 6. Policy Updates */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#8b5cf6] p-3 rounded-xl shadow-sm text-white">
              <RefreshCcw size={24} />
            </div>
            <h2 className="text-xl font-bold text-[#1e293b]">6. Policy Updates</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-white">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8b5cf6] shrink-0"></div>
              <p className="text-gray-600 text-[15px]">All updates will be communicated through our platform.</p>
            </div>
            <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 bg-white">
              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8b5cf6] shrink-0"></div>
              <p className="text-gray-600 text-[15px]">We encourage you to review the policy periodically to stay informed.</p>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed text-[15px]">
            NEXCORE ALLIANCE LLP reserves the right to update this privacy policy to reflect changes in our practices or legal requirements.
          </p>
        </div>

        {/* Footer Contact Info */}
        <div className="bg-[#f0fdf4] rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-50 text-center sm:text-left mt-10">
          <p className="text-gray-700 leading-relaxed text-[15px] mb-8">
            If you have any questions or concerns about this policy, please feel free to contact us. At <strong className="text-[#0d9b62]">NEXCORE ALLIANCE LLP</strong>, your privacy and trust are of utmost importance to us.
          </p>

          <div className="border-t border-[#d1fae5] pt-8">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-6 text-[#0d9b62] font-bold text-lg">
              <Mail size={20} />
              <h3>Questions about Privacy?</h3>
            </div>
            
            <p className="text-gray-600 mb-6 text-[15px]">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-[#10b981] p-2.5 rounded-lg text-white">
                  <Mail size={20} />
                </div>
                <span className="text-[#10b981] font-medium">director@nexcorealliance.com</span>
              </div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="bg-[#3b82f6] p-2.5 rounded-lg text-white">
                  <Phone size={20} />
                </div>
                <span className="text-[#10b981] font-medium">+91-8976104646</span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 pt-8 text-gray-500 text-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div>
          <span>Last updated: January 2025</span>
        </div>

      </div>
    </div>
  );
}
