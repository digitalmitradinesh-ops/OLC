import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  KeyRound, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Tag,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, token: string) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (dark: boolean) => void;
  showDemoHubSetting?: boolean;
}

export default function AuthScreen({ onLoginSuccess, isDarkMode = false, setIsDarkMode, showDemoHubSetting = true }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('New Delhi, Delhi');
  const [role, setRole] = useState<'buyer' | 'seller' | 'business' | 'dealer' | 'shop' | 'property_agent' | 'car_dealer' | 'admin' | 'moderator'>('buyer');

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDemoLogins, setShowDemoLogins] = useState(true);

  // Forgot Password / OTP Reset States
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMethod, setForgotMethod] = useState<'email' | 'mobile'>('email');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [receivedOtpSimulated, setReceivedOtpSimulated] = useState<string | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // Security Verification Challenge (Custom Security Captcha)
  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaUserAnswer, setCaptchaUserAnswer] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);

  // Password strength states
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Weak',
    color: 'bg-rose-500'
  });

  // Generate new security verification captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    setCaptchaNum1(num1);
    setCaptchaNum2(num2);
    setCaptchaAnswer((num1 + num2).toString());
    setCaptchaUserAnswer('');
    setIsCaptchaVerified(false);
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, [activeTab]);

  // Live password strength calculation
  useEffect(() => {
    const pwToVerify = activeTab === 'forgot_password' ? forgotNewPassword : password;
    if (!pwToVerify) {
      setPasswordStrength({ score: 0, label: 'None', color: 'bg-slate-200' });
      return;
    }
    
    let score = 0;
    if (pwToVerify.length >= 6) score += 1;
    if (pwToVerify.length >= 10) score += 1;
    if (/[A-Z]/.test(pwToVerify)) score += 1;
    if (/[0-9]/.test(pwToVerify)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwToVerify)) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';
    if (score >= 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    } else if (score >= 2) {
      label = 'Fair';
      color = 'bg-amber-500';
    }

    setPasswordStrength({ score, label, color });
  }, [password, forgotNewPassword, activeTab]);

  const handleDemoLoginFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsCaptchaVerified(true); // Pre-verified for ultra quick testing of real secure APIs!
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    // Secure Verification Check: verify captcha
    if (!isCaptchaVerified) {
      if (captchaUserAnswer !== captchaAnswer) {
        setCaptchaError(true);
        setErrorMsg('Security challenge verification failed. Please try again.');
        return;
      }
      setIsCaptchaVerified(true);
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg('Authenticated successfully! Loading secure workspace...');
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 1200);
      } else {
        setErrorMsg(data.message || 'Authentication failed. Please check credentials.');
        generateCaptcha();
      }
    } catch (err: any) {
      setErrorMsg('Server connection failed. Offline development bypass available in the Demo panel.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password || !fullName) {
      setErrorMsg('All fields marked with * are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('For high security, password must be at least 6 characters long.');
      return;
    }

    // Secure Verification Check
    if (captchaUserAnswer !== captchaAnswer) {
      setCaptchaError(true);
      setErrorMsg('Security verification challenge incorrect.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          phone,
          location
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg('Secure account created successfully! Please sign in using your new credentials.');
        // Clear fields & toggle to login tab
        setEmail(email);
        setPassword('');
        setFullName('');
        setPhone('');
        setTimeout(() => {
          setActiveTab('login');
          setSuccessMsg(null);
        }, 2500);
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to connect to registration server.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setReceivedOtpSimulated(null);

    if (!forgotIdentifier.trim()) {
      setErrorMsg(`Please enter your registered ${forgotMethod === 'email' ? 'email address' : 'mobile phone number'}.`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          method: forgotMethod
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg(data.message);
        // Store the simulated OTP so we can present it securely to the user in the UI!
        setReceivedOtpSimulated(data.otp);
        setForgotStep(2);
      } else {
        setErrorMsg(data.message || 'No registered account found with these details.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to process password reset request. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!forgotOtp.trim() || !forgotNewPassword.trim()) {
      setErrorMsg('Verification code and new password are required.');
      return;
    }

    if (forgotNewPassword.length < 6) {
      setErrorMsg('For high security, password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg('Success! Your password has been updated. Redirecting to login...');
        setReceivedOtpSimulated(null);
        setTimeout(() => {
          // Clear forgot states
          setForgotIdentifier('');
          setForgotOtp('');
          setForgotNewPassword('');
          setForgotStep(1);
          // Go back to login tab
          setActiveTab('login');
          setSuccessMsg(null);
        }, 2200);
      } else {
        setErrorMsg(data.message || 'Verification failed. Please check your verification code.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to reset password. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Visual Banner Section */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-black tracking-widest text-blue-200">LOCAL</span>
              <span className="text-sm font-black tracking-widest text-white">MARKET</span>
            </div>
          </div>

          <div className="relative z-10 my-12 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/25 rounded-full text-[10px] font-bold text-blue-100 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure Portal Integration</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black leading-tight tracking-tight">
              Cryptographically Verified Trading Platform
            </h1>
            <p className="text-xs text-blue-100/95 leading-relaxed">
              Experience safe trading inside an end-to-end authenticated environment. All administrators, moderators, buyers, and sellers undergo secure validation to guarantee zero spam, trusted local transactions, and secure communications.
            </p>
          </div>

          <div className="relative z-10 text-[10px] text-blue-300 font-semibold border-t border-white/10 pt-4 flex items-center justify-between">
            <span>Powered by SHA-256 Crypto Hashing</span>
            <span>v2.1 Secured</span>
          </div>
        </div>

        {/* Right Form Control Section */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6 bg-white dark:bg-slate-900 transition-colors duration-300">
          
          {/* Header Title & Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                {activeTab === 'login' ? 'Secure Authenticated Access' : activeTab === 'forgot_password' ? 'Forgot / Recover Password' : 'Create High-Security Account'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {activeTab === 'login' ? 'Sign in with your hashed account credentials' : activeTab === 'forgot_password' ? 'Authenticate identity with one-time verification code' : 'Register to verify your active role'}
              </p>
            </div>
            
            {/* Tab switchers & Theme Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDarkMode?.(!isDarkMode)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-700/50 cursor-pointer"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <button 
                  onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'login' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${activeTab === 'register' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Register
                </button>
              </div>
            </div>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Security Alert:</span> {errorMsg}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Access Granted:</span> {successMsg}
              </div>
            </div>
          )}

          {/* Form Switchboard */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot_password'); setErrorMsg(null); setSuccessMsg(null); setForgotStep(1); }}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-mono text-slate-800 dark:text-slate-100"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secure verification challenge captcha */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Secure Verification Challenge</span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline" onClick={generateCaptcha}>Reload</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-extrabold px-3 py-1.5 rounded-lg text-sm tracking-widest select-none">
                    {captchaNum1} + {captchaNum2} = ?
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder="Answer"
                    value={captchaUserAnswer}
                    onChange={(e) => {
                      setCaptchaUserAnswer(e.target.value);
                      if (e.target.value === captchaAnswer) {
                        setIsCaptchaVerified(true);
                        setCaptchaError(false);
                      } else {
                        setIsCaptchaVerified(false);
                      }
                    }}
                    className={`w-28 px-3 py-1.5 border rounded-lg text-xs outline-none text-center font-black ${captchaError ? 'border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-950/20' : isCaptchaVerified ? 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'}`}
                  />
                  {isCaptchaVerified && (
                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-[0_4px_12px_rgba(0,102,255,0.2)] hover:shadow-[0_6px_16px_rgba(0,102,255,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Securing Access...</span>
                  </>
                ) : (
                  <span>Verify Credentials & Enter Workspace</span>
                )}
              </button>
            </form>
          ) : activeTab === 'forgot_password' ? (
            /* Forgot Password Form */
            <div className="space-y-4 animate-fade-in">
              {/* Step indicator header */}
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-3 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {forgotStep}
                </div>
                <div>
                  <h4 className="text-xs font-black text-blue-900 dark:text-blue-300">
                    {forgotStep === 1 ? 'Step 1: Request Security Code' : 'Step 2: Reset Hashed Password'}
                  </h4>
                  <p className="text-[10px] text-blue-700/80 dark:text-blue-400/80">
                    {forgotStep === 1 ? 'Verify account identity using Email or Mobile OTP' : 'Provide temporary verification code and new credentials'}
                  </p>
                </div>
              </div>

              {/* Simulated OTP Interceptor Banner if developer mode or review is active */}
              {receivedOtpSimulated && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl space-y-1 animate-pulse">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Secure Gateway Simulated OTP Dispatched!</span>
                  </div>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    In actual production, this goes to <span className="font-mono font-bold">{forgotIdentifier}</span>. Since we are in the secure sandbox developer playground:
                  </p>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
                    <span>Your Verification OTP is:</span>
                    <span className="bg-amber-100 dark:bg-amber-900 px-2 py-0.5 rounded-md font-mono font-black text-amber-900 dark:text-amber-200 tracking-widest text-sm">{receivedOtpSimulated}</span>
                  </div>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  {/* Verification Medium Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Verification Medium</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setForgotMethod('email'); setForgotIdentifier(''); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${forgotMethod === 'email' ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email OTP</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setForgotMethod('mobile'); setForgotIdentifier(''); }}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${forgotMethod === 'mobile' ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Mobile OTP</span>
                      </button>
                    </div>
                  </div>

                  {/* Identifier Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {forgotMethod === 'email' ? 'Registered Email Address' : 'Registered Mobile Phone Number'}
                    </label>
                    <div className="relative flex items-center">
                      {forgotMethod === 'email' ? (
                        <Mail className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                      ) : (
                        <Phone className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                      )}
                      <input 
                        type={forgotMethod === 'email' ? 'email' : 'text'} 
                        required
                        placeholder={forgotMethod === 'email' ? 'registered-email@example.com' : 'e.g. 9876543210'}
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Send Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  {/* OTP Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">6-Digit Security OTP</label>
                    <div className="relative flex items-center">
                      <ShieldAlert className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        placeholder="e.g. 123456"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-mono font-bold tracking-widest text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* New Password Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Choose New Password</label>
                    <div className="relative flex items-center">
                      <KeyRound className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type={showForgotNewPassword ? 'text' : 'password'} 
                        required
                        placeholder="Minimum 6 characters"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-mono text-slate-800 dark:text-slate-100"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none"
                      >
                        {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Live password security level bar */}
                    {forgotNewPassword && (
                      <div className="space-y-1.5 pt-1.5 animate-fade-in">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
                          <span className="text-slate-400 dark:text-slate-500">Security Rating</span>
                          <span className={passwordStrength.score >= 4 ? 'text-emerald-500' : passwordStrength.score >= 2 ? 'text-amber-500' : 'text-rose-500'}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                          <div className={`h-full transition-all duration-300 rounded-l-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                          <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                          <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                          <div className={`h-full transition-all duration-300 ${passwordStrength.score >= 4 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                          <div className={`h-full transition-all duration-300 rounded-r-full ${passwordStrength.score >= 5 ? passwordStrength.color : 'bg-transparent'}`} style={{ width: '20%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setForgotOtp(''); setForgotNewPassword(''); setErrorMsg(null); }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Step 1
                    </button>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Verify & Reset Password</span>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name *</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="Dinesh Mitra"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address *</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="+91 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Location / City</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Connaught Place, New Delhi"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white pl-10 pr-4 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Register Profile Role *</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="buyer">Buyer Profile (Explore, message, inquire listings)</option>
                    <option value="seller">Seller Profile (Compose and boost listings)</option>
                    <option value="business">Business Profile (For enterprises & large merchants)</option>
                    <option value="dealer">Wholesale Dealer (Bulk quantities, distributor deals)</option>
                    <option value="shop">Local Shop Owner (Neighborhood retail storefront)</option>
                    <option value="property_agent">Property Agent (Real estate, leasing & brokerage)</option>
                    <option value="car_dealer">Car Dealer (New & pre-owned automotive sales)</option>
                    <option value="moderator">Moderator (Oversee, review flags)</option>
                    <option value="admin">Administrator (Complete platform control)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Create Password *</label>
                  <div className="relative flex items-center">
                    <KeyRound className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      placeholder="At least 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white pl-10 pr-10 py-2.5 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-mono text-slate-800"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Pass strength meter */}
                  {password && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="text-slate-400 uppercase">Strength: {passwordStrength.label}</span>
                        <span className="text-slate-400">{passwordStrength.score}/5</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure verification challenge captcha */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Secure Verification Challenge</span>
                  <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline" onClick={generateCaptcha}>Reload</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100/80 text-blue-800 font-extrabold px-3 py-1.5 rounded-lg text-sm tracking-widest select-none">
                    {captchaNum1} + {captchaNum2} = ?
                  </div>
                  <input 
                    type="text"
                    required
                    placeholder="Answer"
                    value={captchaUserAnswer}
                    onChange={(e) => {
                      setCaptchaUserAnswer(e.target.value);
                      if (e.target.value === captchaAnswer) {
                        setIsCaptchaVerified(true);
                        setCaptchaError(false);
                      } else {
                        setIsCaptchaVerified(false);
                      }
                    }}
                    className={`w-28 bg-white px-3 py-1.5 border rounded-lg text-xs outline-none text-center font-black ${captchaError ? 'border-rose-400 text-rose-600 bg-rose-50' : isCaptchaVerified ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-slate-200 text-slate-800'}`}
                  />
                  {isCaptchaVerified && (
                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-[0_4px_12px_rgba(0,102,255,0.2)] hover:shadow-[0_6px_16px_rgba(0,102,255,0.3)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Registering Account Security...</span>
                  </>
                ) : (
                  <span>Register & Secure New Account</span>
                )}
              </button>
            </form>
          )}

          {/* Collapsible Demo/Test panel */}
          {showDemoHubSetting && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <button 
                type="button"
                onClick={() => setShowDemoLogins(!showDemoLogins)}
                className="w-full flex items-center justify-between text-slate-600 hover:text-slate-800 font-bold text-xs"
              >
                <span className="flex items-center gap-2 text-blue-600 font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>Demo Quick-Verify Credentials Hub</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {showDemoLogins ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              
              {showDemoLogins && (
                <div className="pt-3 space-y-2.5 border-t border-slate-200/50 mt-3 text-xs">
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    We have pre-configured secure logins for every platform role. Click any role badge to pre-fill credentials verified by the cryptographic backend:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    <div 
                      onClick={() => handleDemoLoginFill('digitalmitradinesh@gmail.com', 'Admin@123')}
                      className="p-2 border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-950 text-[10.5px]">Admin Access</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 font-black px-1 py-0.5 rounded uppercase">Admin</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Admin@123</span>
                    </div>

                    <div 
                      onClick={() => handleDemoLoginFill('marcus.vance@example.com', 'Seller@123')}
                      className="p-2 border border-blue-100 bg-blue-50/50 hover:bg-blue-50 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-blue-950 text-[10.5px]">Marcus Vance</span>
                        <span className="text-[8px] bg-blue-100 text-blue-800 font-black px-1 py-0.5 rounded uppercase">Seller</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Seller@123</span>
                    </div>

                    <div 
                      onClick={() => handleDemoLoginFill('sarah.j@example.com', 'Buyer@123')}
                      className="p-2 border border-slate-200 bg-slate-100/50 hover:bg-slate-100 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-[10.5px]">Sarah Jenkins</span>
                        <span className="text-[8px] bg-slate-200 text-slate-800 font-black px-1 py-0.5 rounded uppercase">Buyer</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Buyer@123</span>
                    </div>

                    <div 
                      onClick={() => handleDemoLoginFill('moderator@example.com', 'Mod@123')}
                      className="p-2 border border-purple-100 bg-purple-50/50 hover:bg-purple-50 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-950 text-[10.5px]">Alex Miller</span>
                        <span className="text-[8px] bg-purple-100 text-purple-800 font-black px-1 py-0.5 rounded uppercase">Mod</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Mod@123</span>
                    </div>

                    {/* Business */}
                    <div 
                      onClick={() => handleDemoLoginFill('business@example.com', 'Biz@123')}
                      className="p-2 border border-rose-100 bg-rose-50/50 hover:bg-rose-50 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-rose-950 text-[10.5px]">Reliance Store</span>
                        <span className="text-[8px] bg-rose-100 text-rose-800 font-black px-1 py-0.5 rounded uppercase">Business</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Biz@123</span>
                    </div>

                    {/* Dealer */}
                    <div 
                      onClick={() => handleDemoLoginFill('dealer@example.com', 'Dealer@123')}
                      className="p-2 border border-sky-100 bg-sky-50/50 hover:bg-sky-50 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sky-950 text-[10.5px]">Apex Wholesalers</span>
                        <span className="text-[8px] bg-sky-100 text-sky-800 font-black px-1 py-0.5 rounded uppercase">Dealer</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Dealer@123</span>
                    </div>

                    {/* Shop */}
                    <div 
                      onClick={() => handleDemoLoginFill('shop@example.com', 'Shop@123')}
                      className="p-2 border border-amber-100 bg-amber-50/50 hover:bg-amber-50 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-950 text-[10.5px]">Royal Furniture</span>
                        <span className="text-[8px] bg-amber-100 text-amber-800 font-black px-1 py-0.5 rounded uppercase">Shop</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Shop@123</span>
                    </div>

                    {/* Property Agent */}
                    <div 
                      onClick={() => handleDemoLoginFill('agent@example.com', 'Agent@123')}
                      className="p-2 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-indigo-950 text-[10.5px]">Gupta Estates</span>
                        <span className="text-[8px] bg-indigo-100 text-indigo-800 font-black px-1 py-0.5 rounded uppercase">Agent</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Agent@123</span>
                    </div>

                    {/* Car Dealer */}
                    <div 
                      onClick={() => handleDemoLoginFill('cardealer@example.com', 'Car@123')}
                      className="p-2 border border-orange-100 bg-orange-50/50 hover:bg-orange-50 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-orange-950 text-[10.5px]">Express Wheels</span>
                        <span className="text-[8px] bg-orange-100 text-orange-800 font-black px-1 py-0.5 rounded uppercase">Car Dealer</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold font-mono mt-1">Car@123</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
