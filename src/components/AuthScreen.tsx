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
  isPopup?: boolean;
  onBackToCarousel?: () => void;
}

export default function AuthScreen({ 
  onLoginSuccess, 
  isDarkMode = false, 
  setIsDarkMode, 
  showDemoHubSetting = true,
  isPopup = false,
  onBackToCarousel
}: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login OTP States
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [loginOtpChannel, setLoginOtpChannel] = useState<'email' | 'sms'>('email');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginOtpStep, setLoginOtpStep] = useState<1 | 2>(1);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpSimulated, setLoginOtpSimulated] = useState<string | null>(null);

  // Google Simulation States
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  
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
  const [realEmailSent, setRealEmailSent] = useState<boolean>(false);
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

      if (response.status === 502 || response.status === 503) {
        setErrorMsg('Server is currently starting up or restarting. Please try again in 5-10 seconds.');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text);
        setErrorMsg(`Server error (${response.status}). Please try again shortly.`);
        return;
      }

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
      console.error('Login connection error:', err);
      setErrorMsg('Server connection failed. If you just deployed, the server may be restarting. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password || !fullName || !phone) {
      setErrorMsg('All fields marked with * are required (Email, Password, Full Name, and Phone/Mobile Number).');
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

      if (response.status === 502 || response.status === 503) {
        setErrorMsg('Server is currently starting up or restarting. Please try again in 5-10 seconds.');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response on register:', text);
        setErrorMsg(`Server error (${response.status}). Please try again shortly.`);
        return;
      }

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
      console.error('Registration connection error:', err);
      setErrorMsg('Failed to connect to registration server. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  // Handler to request a login verification OTP
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoginOtpSimulated(null);

    if (!loginIdentifier.trim()) {
      setErrorMsg(`Please enter your registered ${loginOtpChannel === 'email' ? 'email address' : 'mobile phone number'}.`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          method: loginOtpChannel
        })
      });

      if (response.status === 502 || response.status === 503) {
        setErrorMsg('Server is currently starting up or restarting. Please try again in 5-10 seconds.');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response on send-login-otp:', text);
        setErrorMsg(`Server error (${response.status}). Please try again shortly.`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setLoginOtpSimulated(data.otp);
        setLoginOtpStep(2);
      } else {
        setErrorMsg(data.message || 'Failed to dispatch login OTP.');
      }
    } catch (err) {
      setErrorMsg('Failed to establish connection with secure login server.');
    } finally {
      setLoading(false);
    }
  };

  // Handler to verify the login OTP code
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginOtpCode.trim()) {
      setErrorMsg('Please enter the 6-digit login verification OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          otp: loginOtpCode.trim()
        })
      });

      if (response.status === 502 || response.status === 503) {
        setErrorMsg('Server is currently starting up or restarting. Please try again in 5-10 seconds.');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response on verify-login-otp:', text);
        setErrorMsg(`Server error (${response.status}). Please try again shortly.`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSuccessMsg('Authenticated successfully via secure OTP! Loading workspace...');
        setLoginOtpSimulated(null);
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 1200);
      } else {
        setErrorMsg(data.message || 'OTP verification failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Failed to verify OTP with secure server.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for Google SSO login simulation
  const handleGoogleSsoLogin = async (googleEmailAddress: string, googleDisplayName?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowGooglePrompt(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmailAddress.trim(),
          fullName: googleDisplayName || googleEmailAddress.split('@')[0],
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        })
      });

      if (response.status === 502 || response.status === 503) {
        setErrorMsg('Server is currently starting up or restarting. Please try again in 5-10 seconds.');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response on google sso:', text);
        setErrorMsg(`Server error (${response.status}). Please try again shortly.`);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSuccessMsg('Google Single Sign-In completed successfully! Synchronizing system details...');
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
        }, 1200);
      } else {
        setErrorMsg(data.message || 'Google SSO verification failed.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to Google validation servers.');
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
    setRealEmailSent(false);
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

      if (response.status === 502 || response.status === 503) {
        setErrorMsg('Server is currently starting up or restarting. Please try again in 5-10 seconds.');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response on forgot-password:', text);
        setErrorMsg(`Server error (${response.status}). Please try again shortly.`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSuccessMsg(data.message);
        // Store the simulated OTP so we can present it securely to the user in the UI!
        setReceivedOtpSimulated(data.otp);
        if (data.realEmailSent) {
          setRealEmailSent(true);
        }
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

  const renderGooglePromptUI = () => {
    if (!showGooglePrompt) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mx-auto">
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
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Sign in with Google</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select an account to proceed to our secure app</p>
          </div>

          <div className="space-y-2.5">
            {/* Active Admin Account Quick Option */}
            <button
              type="button"
              onClick={() => handleGoogleSsoLogin('digitalmitradinesh@gmail.com', 'Dinesh Mitra')}
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-3 transition text-left cursor-pointer"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Dinesh avatar"
                className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">Dinesh Mitra (Admin)</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">digitalmitradinesh@gmail.com</p>
              </div>
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 shrink-0">Admin Link</span>
            </button>

            {/* Or Custom Google Account Input */}
            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider block text-center">Or use another account</span>
            </div>

            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Google Email Address</label>
                <input
                  type="email"
                  placeholder="username@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2 border rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={googleCustomName}
                  onChange={(e) => setGoogleCustomName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2 border rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowGooglePrompt(false)}
              className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!googleCustomEmail}
              onClick={() => handleGoogleSsoLogin(googleCustomEmail, googleCustomName)}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer border-none"
            >
              Authorize & Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderLoginFormUI = () => {
    return (
      <div className="space-y-4">
        {/* Login Method Sub-Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <button
            type="button"
            onClick={() => { setLoginMethod('password'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === 'password'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-100 dark:border-slate-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Password Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('otp'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMethod === 'otp'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-100 dark:border-slate-800'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            OTP / SMS Login
          </button>
        </div>

        {loginMethod === 'password' ? (
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
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setActiveTab('forgot_password'); setErrorMsg(null); }}
                  className="text-[10px] text-blue-600 hover:underline font-bold bg-transparent border-none outline-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-10 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bot-prevention math challenge captcha if needed */}
            {!isCaptchaVerified && (
              <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider">Platform Security Verification</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">CAPTCHA Challenge</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-xs font-black text-slate-700 dark:text-slate-300 tracking-widest select-none border border-slate-200 dark:border-slate-700">
                    {captchaNum1} + {captchaNum2} = ?
                  </div>
                  <input 
                    type="number"
                    required
                    placeholder="Answer"
                    value={captchaUserAnswer}
                    onChange={(e) => {
                      setCaptchaUserAnswer(e.target.value);
                      setCaptchaError(false);
                    }}
                    className={`flex-1 bg-white dark:bg-slate-900 px-3 py-1.5 border ${captchaError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} focus:border-blue-500 rounded-lg text-xs outline-none font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400`}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
            >
              {loading ? 'Decrypting Access Token...' : 'Establish Secure Session'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* OTP Channel Selector */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setLoginOtpChannel('email'); setLoginOtpStep(1); setLoginOtpSimulated(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                  loginOtpChannel === 'email'
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email OTP
              </button>
              <button
                type="button"
                onClick={() => { setLoginOtpChannel('sms'); setLoginOtpStep(1); setLoginOtpSimulated(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                  loginOtpChannel === 'sms'
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Phone className="w-4 h-4" />
                SMS / Mobile OTP
              </button>
            </div>

            {loginOtpStep === 1 ? (
              <form onSubmit={handleSendLoginOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {loginOtpChannel === 'email' ? 'Registered Email Address' : 'Registered Mobile Number'}
                  </label>
                  <div className="relative flex items-center">
                    {loginOtpChannel === 'email' ? (
                      <Mail className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    ) : (
                      <Phone className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    )}
                    <input
                      type={loginOtpChannel === 'email' ? 'email' : 'text'}
                      required
                      placeholder={loginOtpChannel === 'email' ? 'you@example.com' : '+91 XXXXX XXXXX'}
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                >
                  {loading ? 'Dispatched secure handshake...' : `Send Login OTP Code`}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Enter 6-Digit OTP</label>
                  <div className="relative flex items-center">
                    <KeyRound className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="XXXXXX"
                      value={loginOtpCode}
                      onChange={(e) => setLoginOtpCode(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 tracking-widest text-center"
                    />
                  </div>
                </div>

                {loginOtpSimulated && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-1 text-xs">
                    <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-amber-500" />
                      Sandbox Intercepted OTP Code:
                    </div>
                    <div className="font-mono text-base font-black text-amber-900 dark:text-amber-300 tracking-widest text-center bg-white dark:bg-slate-900 py-1.5 rounded-lg border">
                      {loginOtpSimulated}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-relaxed mt-1">
                      In production, this code is transmitted directly via {loginOtpChannel === 'email' ? 'Email' : 'WhatsApp/SMS'}.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setLoginOtpStep(1); setLoginOtpSimulated(null); }}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Change Identity
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
                  >
                    {loading ? 'Authenticating...' : 'Verify & Log In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Branded Google Sign-In button */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Or Sign In with</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <button
          type="button"
          onClick={() => {
            setGoogleCustomEmail('');
            setGoogleCustomName('');
            setShowGooglePrompt(true);
          }}
          className="w-full py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          Login with Google Account
        </button>
      </div>
    );
  };

  if (isPopup) {
    return (
      <div className="w-full max-h-[85vh] overflow-y-auto p-2 sm:p-4 text-left font-sans">
        {onBackToCarousel && (
          <button 
            type="button"
            onClick={onBackToCarousel} 
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-455 dark:hover:text-slate-200 cursor-pointer mb-4 transition-colors border-none bg-transparent outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to login options</span>
          </button>
        )}

        {/* Form controls div content */}
        <div className="space-y-5">
          {/* Header Title & Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {activeTab === 'login' ? 'Secure Authenticated Access' : activeTab === 'forgot_password' ? 'Forgot / Recover Password' : 'Create High-Security Account'}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {activeTab === 'login' ? 'Sign in with your hashed account credentials' : activeTab === 'forgot_password' ? 'Authenticate identity with verification code' : 'Register to verify your active role'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                <button 
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
                  className={`px-3 py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${activeTab === 'login' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
                  className={`px-3 py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${activeTab === 'register' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
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
            renderLoginFormUI()
          ) : activeTab === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Name *</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    placeholder="eg. Ramesh Kumar"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address *</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Password *</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      placeholder="At least 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-10 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Mobile Number *</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="tel" 
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">State / Region</label>
                  <div className="relative flex items-center">
                    <MapPin className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="eg. New Delhi"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-900 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Account Access Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    onClick={() => setRole('buyer')}
                    className={`p-3 border-2 rounded-xl cursor-pointer text-center transition ${role === 'buyer' ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20' : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/55'}`}
                  >
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-200">Buyer</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">I want to discover & trade</span>
                  </div>

                  <div 
                    onClick={() => setRole('seller')}
                    className={`p-3 border-2 rounded-xl cursor-pointer text-center transition ${role === 'seller' ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20' : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/55'}`}
                  >
                    <span className="block text-xs font-black text-slate-800 dark:text-slate-200">Seller</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">I want to post ads</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider font-mono">Solve Security Check *</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">{captchaNum1} + {captchaNum2} = ?</span>
                </div>
                <input 
                  type="number"
                  required
                  placeholder="Answer math verification"
                  value={captchaUserAnswer}
                  onChange={(e) => setCaptchaUserAnswer(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 px-3 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl text-xs outline-none font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                {loading ? 'Registering Secure Profile...' : 'Create Secure Profile Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={forgotStep === 1 ? handleForgotPasswordRequest : handleResetPasswordSubmit} className="space-y-4">
              {forgotStep === 1 ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account Email Identifier</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        placeholder="you@example.com"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full bg-slate-50 pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl text-xs outline-none font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {loading ? 'Request Reset OTP' : 'Request Reset OTP'}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {realEmailSent ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                      <span className="font-bold">Real OTP Code Dispatched:</span> A secure 6-digit verification code has been sent to <span className="font-semibold text-emerald-950">{forgotIdentifier}</span> via Gmail SMTP. Check your inbox!
                    </div>
                  ) : (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                      <span className="font-bold">Sandbox Action Bypass:</span> We have simulated sending a verification code. Input <span className="font-mono font-black text-amber-950 bg-amber-100 px-1 py-0.5 rounded">{receivedOtpSimulated}</span> below to authorize the password overwrite.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Enter OTP Code</label>
                      <input 
                        type="text" 
                        required
                        placeholder="eg. 839102"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="w-full bg-slate-50 px-3 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl text-xs outline-none font-bold font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        required
                        placeholder="Min 6 characters"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full bg-slate-50 px-3 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl text-xs outline-none font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    {loading ? 'Overwriting Password Hash...' : 'Overwrite Secure Password'}
                  </button>
                </div>
              )}
            </form>
          )}

          {renderGooglePromptUI()}
        </div>
      </div>
    );
  }

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
            renderLoginFormUI()
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
                <div className={`p-3 rounded-xl space-y-1 ${realEmailSent ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30' : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 animate-pulse'}`}>
                  {realEmailSent ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Real Gmail OTP Dispatch Successful!</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400">
                        A real email with your secure OTP token has been dispatched to <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{forgotIdentifier}</span>. Please refresh your inbox.
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                        Tip: For sandbox quick testing, the code is also bypassed here: <strong className="font-mono font-black">{receivedOtpSimulated}</strong>
                      </p>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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

                  {/* Admin Password Recovery Helper */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 space-y-2.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Admin Password Recovery Helper</span>
                    </div>
                    <p className="leading-relaxed">
                      Need to recover the Admin credentials via Email or SMS/mobile? Toggle your preferred medium and auto-fill the admin details to request a simulated OTP code instantly:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMethod('email');
                          setForgotIdentifier('digitalmitradinesh@gmail.com');
                        }}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-black transition dark:bg-blue-950/40 dark:hover:bg-blue-950/80 dark:text-blue-300 dark:border-blue-900/50 cursor-pointer"
                      >
                        Auto-fill Admin Email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotMethod('mobile');
                          setForgotIdentifier('+1 (555) 019-2834');
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-black transition dark:bg-emerald-950/40 dark:hover:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-900/50 cursor-pointer"
                      >
                        Auto-fill Admin Mobile
                      </button>
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
              {/* Account Type Selection Highlights */}
              <div className="bg-slate-50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Select Account Profile Type
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`p-3 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${role === 'buyer' ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/25 dark:text-blue-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}
                  >
                    <User className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                    <span>Buyer Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    className={`p-3 rounded-xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${role === 'seller' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600 dark:bg-emerald-950/25 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}
                  >
                    <Tag className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>Seller Profile</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                  {role === 'buyer' 
                    ? 'Perfect for browsing active classified listings, saving favorites, and sending verified buyer messages.'
                    : 'Best for local sellers, stores, businesses, and agents to post classified listings and manage advertisements.'}
                </p>
              </div>

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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Phone Number *</label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 w-4.5 h-4.5 text-slate-400" />
                    <input 
                      type="text" 
                      required
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

          {renderGooglePromptUI()}
        </div>

      </div>
    </div>
  );
}
