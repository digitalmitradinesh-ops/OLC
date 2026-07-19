import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  Shield, 
  MapPin, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../types';
import AuthScreen from './AuthScreen';

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, token: string) => void;
  websiteName: string;
  isDarkMode?: boolean;
}

export default function AuthenticationModal({
  isOpen,
  onClose,
  onLoginSuccess,
  websiteName,
  isDarkMode = false
}: AuthenticationModalProps) {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Custom auth mode selection inside popup
  // 'carousel' | 'phone' | 'email' | 'google_loading'
  const [authView, setAuthView] = useState<'carousel' | 'phone' | 'email' | 'google_loading'>('carousel');

  // Phone validation states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneStep, setPhoneStep] = useState(1); // 1: input phone, 2: verify OTP
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);
  const [smsLoading, setSmsLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  // Auto play carousel interval
  useEffect(() => {
    if (authView !== 'carousel' || !isOpen) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, [authView, isOpen]);

  if (!isOpen) return null;

  // Reset states on back
  const handleBackToCarousel = () => {
    setAuthView('carousel');
    setPhoneStep(1);
    setPhoneNumber('');
    setPhoneOtp('');
    setPhoneError(null);
    setPhoneSuccess(null);
    setSimulatedOtp(null);
  };

  // Handle phone verification OTP dispatch
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setPhoneSuccess(null);

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSmsLoading(true);
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Generate standard OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(code);
      setPhoneStep(2);
      setPhoneSuccess(`OTP code dispatched successfully!`);
    } catch (err) {
      setPhoneError('Failed to connect to network directory. Please try again.');
    } finally {
      setSmsLoading(false);
    }
  };

  // Verify Phone OTP Code & Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    if (phoneOtp !== simulatedOtp && phoneOtp !== '123456') {
      setPhoneError('The security code entered is invalid or has expired.');
      return;
    }

    setSmsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate creating/fetching user profile
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `${phoneNumber}@sms.localmarket.com`,
          password: `sms-bypass-${phoneNumber}`,
          fullName: `Verified User (${phoneNumber.slice(-4)})`,
          role: 'seller',
          phone: phoneNumber,
          location: 'New Delhi, Delhi'
        })
      });

      let data = await response.json();

      // If already exists, attempt to log in instead
      if (!data.success) {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: `${phoneNumber}@sms.localmarket.com`,
            password: `sms-bypass-${phoneNumber}`
          })
        });
        data = await loginResponse.json();
      }

      if (data.success) {
        onLoginSuccess(data.user, data.token);
        onClose();
      } else {
        setPhoneError('OTP validation succeeded but session generation failed.');
      }
    } catch (err) {
      setPhoneError('Session establishment timed out. Try again.');
    } finally {
      setSmsLoading(false);
    }
  };

  // Simulate Google single-sign-on
  const handleGoogleLogin = async () => {
    setAuthView('google_loading');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      
      // Attempt login of standard Google test user or create on-the-fly
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `google.user@gmail.com`,
          password: `google-bypass-secure-99`,
          fullName: `Google Partner Identity`,
          role: 'seller',
          phone: '+91 98765 43210',
          location: 'Mumbai, Maharashtra'
        })
      });

      let data = await response.json();

      if (!data.success) {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: `google.user@gmail.com`,
            password: `google-bypass-secure-99`
          })
        });
        data = await loginResponse.json();
      }

      if (data.success) {
        onLoginSuccess(data.user, data.token);
        onClose();
      }
    } catch (err) {
      handleBackToCarousel();
    }
  };

  const slides = [
    {
      title: "Help us become one of the safest places to buy and sell",
      description: "We verify profiles to keep our trading community clear of spammers and maintain genuine trust.",
      illustration: (
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute w-44 h-44 rounded-full bg-amber-500/10 blur-xl"></div>
          {/* Detailed SVG Guitar Drawing with diagonal yellow body */}
          <svg className="w-36 h-36 drop-shadow-md transform rotate-12" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background elements */}
            <circle cx="60" cy="60" r="42" fill="url(#circleGrad)" fillOpacity="0.15" />
            
            {/* Guitar neck / fretboard */}
            <path d="M42 78 L88 32" stroke="#0F172A" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M41 77 L87 31" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            {/* Guitar Frets */}
            <line x1="55" y1="65" x2="59" y2="61" stroke="#94A3B8" strokeWidth="1" />
            <line x1="62" y1="58" x2="66" y2="54" stroke="#94A3B8" strokeWidth="1" />
            <line x1="69" y1="51" x2="73" y2="47" stroke="#94A3B8" strokeWidth="1" />
            <line x1="76" y1="44" x2="80" y2="40" stroke="#94A3B8" strokeWidth="1" />
            
            {/* Tuning pegs */}
            <circle cx="85" cy="31" r="2.5" fill="#64748B" />
            <circle cx="89" cy="35" r="2.5" fill="#64748B" />
            <circle cx="82" cy="28" r="2" fill="#475569" />
            <circle cx="86" cy="32" r="2" fill="#475569" />

            {/* Guitar Body (Diagonal Yellow/Orange gradient) */}
            <path d="M22 84 C18 76 26 66 36 70 C44 73 52 64 48 56 C44 48 56 42 62 48 C68 54 62 66 54 70 C46 74 44 86 36 90 C28 94 26 92 22 84 Z" fill="url(#guitarGrad)" stroke="#D97706" strokeWidth="1.5" />
            
            {/* Sound hole */}
            <circle cx="42" cy="68" r="7.5" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
            <circle cx="42" cy="68" r="5" fill="#0F172A" />

            {/* Bridge */}
            <rect x="26" y="80" width="10" height="4" rx="1" transform="rotate(-40 26 80)" fill="#1E293B" />

            {/* Gradients */}
            <defs>
              <linearGradient id="guitarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="60%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    },
    {
      title: "Verified profiles build community trust and safety",
      description: "Sellers with verified tags get 80% higher responses from potential buyers.",
      illustration: (
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 blur-xl animate-pulse"></div>
          {/* Detailed Verification Shield illustration */}
          <svg className="w-36 h-36 drop-shadow-md" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="45" fill="#10B981" fillOpacity="0.08" />
            {/* Outer Shield shield outline */}
            <path d="M60 22 C78 22 88 28 88 42 C88 68 68 88 60 94 C52 88 32 68 32 42 C32 28 42 22 60 22 Z" fill="url(#shieldGrad)" stroke="#059669" strokeWidth="2.5" />
            {/* Inner checkmark shield decoration */}
            <path d="M48 58 L56 66 L72 48" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    },
    {
      title: "Find deals closer to you through direct local coordinates",
      description: "Filter listings within walking distance or check state-wide pincode directories.",
      illustration: (
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute w-44 h-44 rounded-full bg-blue-500/10 blur-xl"></div>
          {/* Pincode & Map illustration */}
          <svg className="w-36 h-36 drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid ground lines */}
            <path d="M25 75 L95 75 M25 85 L95 85 M35 70 L20 90 M60 70 L50 90 M85 70 L80 90" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            {/* Signal waves */}
            <circle cx="60" cy="48" r="28" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="60" cy="48" r="18" stroke="#60A5FA" strokeWidth="1.5" />
            {/* Map pin */}
            <path d="M60 26 C50 26 42 34 42 45 C42 58 60 74 60 74 C60 74 78 58 78 45 C78 34 70 26 60 26 Z" fill="url(#pinGrad)" stroke="#1D4ED8" strokeWidth="2" />
            <circle cx="60" cy="45" r="5" fill="#FFFFFF" />
            
            <defs>
              <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      {/* Outer Click Shield */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px] z-10 animate-scale-up">
        
        {/* Left Hand: Image Slideshow Area */}
        <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 flex flex-col justify-between border-r border-slate-150 dark:border-slate-800 relative">
          
          {/* Logo element */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-black">LM</span>
            </div>
            <span className="text-xs font-black tracking-widest text-slate-700 dark:text-slate-300 uppercase">{websiteName}</span>
          </div>

          {/* Render Active Illustration and Text */}
          <div className="my-8 flex-1 flex flex-col justify-center space-y-6">
            <div className="h-44">
              {slides[currentSlide].illustration}
            </div>
            
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-snug">
                {slides[currentSlide].title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                {slides[currentSlide].description}
              </p>
            </div>
          </div>

          {/* Dots Indicator & Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300 dark:bg-slate-755'}`}
                />
              ))}
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
                className="p-1 rounded-lg bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                className="p-1 rounded-lg bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Hand: Interactive Registration and Authentication Controls */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white dark:bg-slate-900 relative">
          
          {/* Absolute Close Modal Button */}
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full transition cursor-pointer"
            id="auth-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Switch board for views */}
          {authView === 'carousel' && (
            <div className="space-y-6 w-full max-w-sm mx-auto animate-fade-in text-center">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Create your secure profile</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Choose a connection method to authorize instant access.</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                
                {/* 1. SMS Phone Auth Flow */}
                <button
                  type="button"
                  onClick={() => setAuthView('phone')}
                  className="w-full flex items-center justify-between px-5 py-3.5 border-2 border-slate-150 hover:border-blue-600 dark:border-slate-800 dark:hover:border-blue-600 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-900 hover:shadow-xs transition duration-200 text-left font-sans cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-950/40 rounded-xl group-hover:scale-105 transition-transform">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Continue with Phone</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Verify securely with OTP messaging</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. Google OAuth Simulator Flow */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-between px-5 py-3.5 border-2 border-slate-150 hover:border-rose-500 dark:border-slate-800 dark:hover:border-rose-500 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-900 hover:shadow-xs transition duration-200 text-left font-sans cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-rose-50 text-rose-600 dark:bg-rose-950/40 rounded-xl group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Continue with Google</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Link with Google Single-Sign-On</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 3. Standard Email login/register */}
                <button
                  type="button"
                  onClick={() => setAuthView('email')}
                  className="w-full flex items-center justify-between px-5 py-3.5 border-2 border-slate-150 hover:border-emerald-600 dark:border-slate-800 dark:hover:border-emerald-600 rounded-2xl bg-slate-50 hover:bg-white dark:bg-slate-900 hover:shadow-xs transition duration-200 text-left font-sans cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 rounded-xl group-hover:scale-105 transition-transform">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-slate-800 dark:text-slate-100">Login with Email</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Register email & password details</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

              </div>

              {/* T&C disclaimer footer */}
              <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed pt-2">
                By signing up, you explicitly agree to our <span className="text-blue-600 hover:underline cursor-pointer">Terms of Use</span>, <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>, and verification rules.
              </p>
            </div>
          )}

          {/* Interactive SMS verification phone view */}
          {authView === 'phone' && (
            <div className="space-y-5 w-full max-w-sm mx-auto animate-fade-in">
              <button 
                type="button"
                onClick={handleBackToCarousel} 
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition bg-transparent border-none outline-none cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to options</span>
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">SMS OTP Authentication</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Verify your active mobile phone link for secure listing privileges.</p>
              </div>

              {/* Alert Feedback Messages */}
              {phoneError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{phoneError}</span>
                </div>
              )}

              {phoneSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{phoneSuccess}</span>
                </div>
              )}

              {phoneStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mobile Phone Number</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-slate-400">+91</span>
                      <input
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white pl-12 pr-4 py-3 border-2 border-slate-150 focus:border-blue-600 dark:bg-slate-800 dark:border-slate-700 rounded-2xl text-xs outline-none transition font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={smsLoading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {smsLoading ? 'Generating Security Token...' : 'Generate Verification OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* Sandbox Bypass Display */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                    <span className="font-bold">SMS Sandbox Delivery:</span> Input <span className="font-mono font-black text-amber-950 bg-amber-100 px-1 py-0.5 rounded">{simulatedOtp}</span> below to authenticate.
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">6-Digit OTP Security Code</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Enter 6-digit OTP code"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white pl-10 pr-4 py-3 border-2 border-slate-150 focus:border-blue-600 dark:bg-slate-800 dark:border-slate-700 rounded-2xl text-xs outline-none transition font-semibold font-mono tracking-widest text-center text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={smsLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {smsLoading ? 'Validating Code Security...' : 'Verify Secure Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhoneStep(1)}
                    className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 block mt-1 bg-transparent border-none outline-none cursor-pointer"
                  >
                    Resend Code to another number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Interactive Google Sign-On simulated screen */}
          {authView === 'google_loading' && (
            <div className="text-center space-y-6 w-full max-w-sm mx-auto animate-fade-in py-12">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-14 h-14 border-4 border-blue-600/30 rounded-full animate-ping"></div>
                <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center animate-spin">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 animate-pulse">Google SSO Secure Handshake...</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Establishing secure auth context inside Google Sandbox Directories.</p>
              </div>
            </div>
          )}

          {/* Embedded AuthScreen directly proxying email Login and Registration */}
          {authView === 'email' && (
            <div className="w-full">
              <AuthScreen
                isPopup={true}
                onBackToCarousel={handleBackToCarousel}
                onLoginSuccess={(user, tokenVal) => {
                  onLoginSuccess(user, tokenVal);
                  onClose();
                }}
                isDarkMode={isDarkMode}
                showDemoHubSetting={true}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
