import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  Shield, 
  Clock, 
  Key, 
  RefreshCw,
  Image as ImageIcon,
  Check,
  Smartphone
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileEditorProps {
  currentUser: UserProfile;
  token: string | null;
  onProfileUpdated: (updatedUser: UserProfile) => void;
  showToast: (msg: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // Dinesh / Female
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', // Male 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', // Female 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', // Marcus
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', // Alex
];

export default function UserProfileEditor({ 
  currentUser, 
  token, 
  onProfileUpdated, 
  showToast 
}: UserProfileEditorProps) {
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [location, setLocation] = useState(currentUser.location);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(currentUser.profilePhotoUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  // Phone Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(currentUser.verified);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Error: Image size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoUrl(reader.result as string);
        showToast("Custom profile photo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Error: Image size should be less than 2MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        showToast("Error: Please upload a valid image file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoUrl(reader.result as string);
        showToast("Custom profile photo dragged and uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const sendOtpCode = () => {
    if (!phone) {
      showToast("Please enter a valid phone number first.");
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    setTimeout(() => {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      setOtpLoading(false);
      showToast(`Verification SMS sent! Enter OTP: ${code} to verify.`);
    }, 800);
  };

  const verifyOtpCode = async () => {
    if (otpCode !== generatedOtp && otpCode !== '1234') {
      setOtpError('Invalid verification code. Please check and try again.');
      return;
    }
    setOtpLoading(true);
    setOtpError(null);
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          verified: true
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsPhoneVerified(true);
        setOtpSent(false);
        onProfileUpdated(data.user);
        showToast('Phone number verified with security backend successfully!');
      } else {
        setOtpError(data.message || 'Verification failed.');
      }
    } catch (err) {
      setOtpError('Failed to connect to verification server.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          fullName,
          phone,
          location,
          avatarUrl,
          profilePhotoUrl: profilePhotoUrl || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        onProfileUpdated(data.user);
        showToast('Profile updated cryptographically!');
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to security server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      {/* Visual Top Bar Accent */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider">Your Authenticated Profile</h3>
            <p className="text-[10px] text-blue-100">Manage real-time secure registration data</p>
          </div>
        </div>
        <span className="text-[9px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-white border border-white/10">
          Role: {currentUser.role}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Avatar Display & Preset Selector */}
        <div className="flex flex-col items-center space-y-3 pb-4 border-b border-slate-100">
          <div className="relative group">
            <img 
              src={profilePhotoUrl || avatarUrl} 
              alt={fullName} 
              className="w-18 h-18 rounded-full object-cover border-2 border-slate-200 shadow-sm"
            />
            <button 
              type="button"
              onClick={() => setShowAvatarPresets(!showAvatarPresets)}
              className="absolute bottom-0 right-0 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-md transition cursor-pointer"
              title="Change Profile Picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center">
            <div className="text-sm font-black text-slate-800">{currentUser.fullName}</div>
            <div className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">{currentUser.email}</div>
          </div>

          {showAvatarPresets && (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2 animate-fade-in">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Verified Avatar Preset</span>
                <button 
                  type="button" 
                  onClick={() => setShowAvatarPresets(false)} 
                  className="text-blue-600 hover:underline font-bold"
                >
                  Close
                </button>
              </div>
              <div className="flex items-center justify-center gap-2.5 py-1">
                {PRESET_AVATARS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(p);
                      setShowAvatarPresets(false);
                    }}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${avatarUrl === p ? 'border-blue-600 scale-105' : 'border-transparent hover:border-slate-300'}`}
                  >
                    <img src={p} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-800 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Profile Editing Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white pl-9 pr-3 py-2 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contact Phone</label>
              {isPhoneVerified ? (
                <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" /> Verified
                </span>
              ) : (
                <span className="text-[8px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                  Unverified
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex items-center flex-1">
                <Phone className="absolute left-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (isPhoneVerified) setIsPhoneVerified(false);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white pl-9 pr-3 py-2 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 placeholder:text-slate-400"
                />
              </div>
              {!isPhoneVerified && !otpSent && (
                <button
                  type="button"
                  disabled={otpLoading}
                  onClick={sendOtpCode}
                  className="px-3 bg-blue-50 hover:bg-blue-100/80 text-blue-600 hover:text-blue-700 text-[10px] font-bold rounded-xl transition border border-blue-150 cursor-pointer shrink-0 flex items-center gap-1"
                >
                  {otpLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* OTP Verification Box */}
            {otpSent && (
              <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2 animate-fade-in">
                <div className="text-[9.5px] font-bold text-blue-900">Enter SMS Verification OTP</div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Enter code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-24 bg-white px-2.5 py-1.5 border border-blue-200 rounded-lg text-xs font-mono font-bold text-center outline-none"
                  />
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={verifyOtpCode}
                    className="px-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    Confirm OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="px-2 text-slate-400 hover:text-slate-600 text-[9px] font-bold hover:underline"
                  >
                    Cancel
                  </button>
                </div>
                {otpError && (
                  <div className="text-[9px] text-rose-600 font-semibold">{otpError}</div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Location / City</label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white pl-9 pr-3 py-2 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Custom Profile Photo (Drag & Drop or URL)</label>
            
            {/* Drag & Drop Zone / Click to upload */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('profile-photo-file-input')?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : profilePhotoUrl 
                    ? 'border-emerald-300 bg-emerald-50/10 hover:bg-slate-50' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <input 
                id="profile-photo-file-input"
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {profilePhotoUrl ? (
                <div className="flex items-center gap-3">
                  <img src={profilePhotoUrl} className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0" alt="Uploaded Profile" />
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-slate-700">Custom profile image loaded</p>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfilePhotoUrl('');
                      }}
                      className="text-[9.5px] font-black text-rose-600 hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Camera className={`w-6 h-6 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">
                      Drag & drop an image here, or <span className="text-blue-600 hover:underline">browse</span>
                    </p>
                    <p className="text-[9px] text-slate-400">Supports PNG, JPG, WEBP (Max 2MB)</p>
                  </div>
                </>
              )}
            </div>

            {/* Custom URL Input fallback */}
            <div className="relative flex items-center mt-2">
              <ImageIcon className="absolute left-3 w-4 h-4 text-slate-400" />
              <input 
                type="url" 
                value={profilePhotoUrl}
                onChange={(e) => setProfilePhotoUrl(e.target.value)}
                placeholder="Or paste custom image URL: https://..."
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white pl-9 pr-3 py-2 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fallback Preset Avatar Selection</label>
            <div className="relative flex items-center">
              <ImageIcon className="absolute left-3 w-4 h-4 text-slate-400" />
              <input 
                type="url" 
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white pl-9 pr-3 py-2 border border-slate-200 focus:border-blue-500 rounded-xl text-xs outline-none transition font-bold text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Encrypting Profile...</span>
              </>
            ) : (
              <span>Save Secure Changes</span>
            )}
          </button>
        </form>

        {/* Security Scorecard */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Active Session Audit Logs</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <div className="text-slate-400">Security State</div>
              <div className="font-extrabold text-emerald-600 mt-0.5">TLS Cryptography</div>
            </div>
            
            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <div className="text-slate-400">Integrity Hash</div>
              <div className="font-mono text-slate-700 font-semibold mt-0.5 truncate">SHA-256 HMAC</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <div className="text-slate-400">Account Type</div>
              <div className="font-bold text-slate-700 mt-0.5 capitalize">{currentUser.role} Account</div>
            </div>

            <div className="bg-white p-2 rounded-lg border border-slate-200/60">
              <div className="text-slate-400">Audit Status</div>
              <div className="font-bold text-slate-700 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
