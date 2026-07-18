import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Image as ImageIcon, 
  Sparkles,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  KeyRound,
  Lock
} from 'lucide-react';

// Color math helpers for generating matching theme backgrounds from brand color
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  let r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
  let g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
  let b = parseInt(hex.substring(4, 6), 16) / 255 || 0;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

interface BrandingAdminPanelProps {
  token?: string | null;
  currentName: string;
  currentLogoUrl: string;
  currentCopyright?: string;
  currentPoweredBy?: string;
  currentAddress?: string;
  currentSocials?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  currentThemeColor?: string;
  currentThemeCustomColor?: string;
  currentLogoSize?: string;
  currentLogoShape?: string;
  currentLogoFit?: string;
  currentLogoBg?: string;
  currentLightBgColor?: string;
  currentDarkBgColor?: string;
  currentShowDemoHub?: boolean;
  onSaveBranding: (
    name: string, 
    logoUrl: string, 
    copyright: string, 
    poweredBy: string, 
    address: string,
    socials: {
      facebook: string;
      twitter: string;
      instagram: string;
      linkedin: string;
      youtube: string;
    },
    themeColor: string,
    themeCustomColor: string,
    logoSize: string,
    logoShape: string,
    logoFit: string,
    logoBg: string,
    lightBgColor: string,
    darkBgColor: string,
    showDemoHub: boolean
  ) => void;
  showToast: (msg: string) => void;
}

export default function BrandingAdminPanel({
  token,
  currentName,
  currentLogoUrl,
  currentCopyright = '',
  currentPoweredBy = '',
  currentAddress = '',
  currentSocials,
  currentThemeColor = 'blue',
  currentThemeCustomColor = '#0066FF',
  currentLogoSize = 'medium',
  currentLogoShape = 'rounded-xl',
  currentLogoFit = 'contain',
  currentLogoBg = 'transparent',
  currentLightBgColor = '#f8fafc',
  currentDarkBgColor = '#030712',
  currentShowDemoHub = true,
  onSaveBranding,
  showToast
}: BrandingAdminPanelProps) {
  const [websiteName, setWebsiteName] = useState(currentName);
  
  // Gemini API Key config states
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
  const [hasServerKey, setHasServerKey] = useState(false);
  const [maskedServerKey, setMaskedServerKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Fetch the current Gemini config from server on mount
  useEffect(() => {
    const fetchGeminiConfig = async () => {
      if (!token) return;
      setIsLoadingKey(true);
      try {
        const res = await fetch('/api/admin/get-gemini-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await res.json();
        if (data.success) {
          setHasServerKey(data.hasKey);
          setMaskedServerKey(data.maskedKey);
          setAdminEmail(data.email);
        }
      } catch (err) {
        console.error('Failed to load Gemini config:', err);
      } finally {
        setIsLoadingKey(false);
      }
    };

    fetchGeminiConfig();
  }, [token]);

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingKey(true);
    try {
      const res = await fetch('/api/admin/gemini-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, geminiApiKey: geminiApiKeyInput })
      });
      const data = await res.json();
      if (data.success) {
        setHasServerKey(data.hasKey);
        setMaskedServerKey(geminiApiKeyInput ? `${geminiApiKeyInput.slice(0, 6)}...${geminiApiKeyInput.slice(-4)}` : '');
        setGeminiApiKeyInput('');
        showToast(data.message || 'Gemini API Key updated successfully!');
      } else {
        showToast('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Failed to save Gemini Key:', err);
      showToast('Network error saving Gemini Key');
    } finally {
      setIsSavingKey(false);
    }
  };
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [copyright, setCopyright] = useState(currentCopyright || `© 2026 ${currentName} Inc.`);
  const [poweredBy, setPoweredBy] = useState(currentPoweredBy || 'Powered by AI Studio Build');
  const [address, setAddress] = useState(currentAddress || '123, Connaught Place, New Delhi, India');
  
  // Theme selection states
  const [themeColor, setThemeColor] = useState(currentThemeColor);
  const [themeCustomColor, setThemeCustomColor] = useState(currentThemeCustomColor);

  // Background color states
  const [lightBgColor, setLightBgColor] = useState(currentLightBgColor);
  const [darkBgColor, setDarkBgColor] = useState(currentDarkBgColor);
  const [showDemoHub, setShowDemoHub] = useState(currentShowDemoHub);

  // Logo settings states
  const [logoSize, setLogoSize] = useState(currentLogoSize);
  const [logoShape, setLogoShape] = useState(currentLogoShape);
  const [logoFit, setLogoFit] = useState(currentLogoFit);
  const [logoBg, setLogoBg] = useState(currentLogoBg);

  // Social media link states
  const [facebook, setFacebook] = useState(currentSocials?.facebook || 'https://facebook.com');
  const [twitter, setTwitter] = useState(currentSocials?.twitter || 'https://twitter.com');
  const [instagram, setInstagram] = useState(currentSocials?.instagram || 'https://instagram.com');
  const [linkedin, setLinkedin] = useState(currentSocials?.linkedin || 'https://linkedin.com');
  const [youtube, setYoutube] = useState(currentSocials?.youtube || 'https://youtube.com');

  const [isDragging, setIsDragging] = useState(false);
  const [imageDetails, setImageDetails] = useState<{ width: number; height: number; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process and scale/crop any image to exactly 512x512 pixels using HTML Canvas
  const processImageTo512 = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Error: Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Check if it is exactly 512x512
        if (originalWidth === 512 && originalHeight === 512) {
          setImageDetails({ width: 512, height: 512, name: file.name });
          setLogoUrl(event.target?.result as string);
          showToast('Perfect! Image is exactly 512x512px.');
          return;
        }

        // Create HTML5 Canvas to resize/crop to 512x512px
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Center-crop implementation
          const size = Math.min(originalWidth, originalHeight);
          const sourceX = (originalWidth - size) / 2;
          const sourceY = (originalHeight - size) / 2;

          ctx.fillStyle = '#FFFFFF'; // Fill background white in case of transparency
          ctx.fillRect(0, 0, 512, 512);
          
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            size,
            size, // Source crop
            0,
            0,
            512,
            512 // Destination square
          );

          const processedDataUrl = canvas.toDataURL('image/png');
          setLogoUrl(processedDataUrl);
          setImageDetails({ width: originalWidth, height: originalHeight, name: file.name });
          showToast(`Image cropped and resized to exactly 512x512px automatically!`);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageTo512(file);
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
      processImageTo512(file);
    }
  };

  const autoGenerateMatchingBackgrounds = () => {
    let brandHex = themeCustomColor;
    if (themeColor !== 'custom') {
      const presets: Record<string, string> = {
        blue: '#0066FF',
        emerald: '#10B981',
        violet: '#8B5CF6',
        amber: '#F59E0B',
        rose: '#E11D48',
        slate: '#475569'
      };
      brandHex = presets[themeColor] || '#0066FF';
    }

    try {
      const { h, s } = hexToHsl(brandHex);
      // Auto-generate deep dark background: cap saturation at 22%, set lightness to 4% for highly eye-comfortable deep tint
      const generatedDark = hslToHex(h, Math.min(s, 22), 4);
      // Auto-generate soft light background: cap saturation at 12%, set lightness to 98.5% for clean cream/off-white tint
      const generatedLight = hslToHex(h, Math.min(s, 12), 98.5);
      
      setLightBgColor(generatedLight);
      setDarkBgColor(generatedDark);
      showToast('Successfully generated matched background colors based on your website brand color!');
    } catch (e) {
      showToast('Error generating matching backgrounds');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteName.trim()) {
      showToast('Error: Website Name cannot be empty.');
      return;
    }
    onSaveBranding(
      websiteName.trim(),
      logoUrl,
      copyright.trim() || `© 2026 ${websiteName.trim()} Inc.`,
      poweredBy.trim() || 'Powered by AI Studio Build',
      address.trim() || '123, Connaught Place, New Delhi, India',
      {
        facebook: facebook.trim(),
        twitter: twitter.trim(),
        instagram: instagram.trim(),
        linkedin: linkedin.trim(),
        youtube: youtube.trim()
      },
      themeColor,
      themeCustomColor,
      logoSize,
      logoShape,
      logoFit,
      logoBg,
      lightBgColor,
      darkBgColor,
      showDemoHub
    );
  };

  const handleResetToDefault = () => {
    setWebsiteName('LocalMarket');
    setLogoUrl('');
    setCopyright('© 2026 LocalMarket Inc.');
    setPoweredBy('Powered by AI Studio Build');
    setAddress('123, Connaught Place, New Delhi, India');
    setFacebook('https://facebook.com');
    setTwitter('https://twitter.com');
    setInstagram('https://instagram.com');
    setLinkedin('https://linkedin.com');
    setYoutube('https://youtube.com');
    setThemeColor('blue');
    setThemeCustomColor('#0066FF');
    setLogoSize('medium');
    setLogoShape('rounded-xl');
    setLogoFit('contain');
    setLogoBg('transparent');
    setLightBgColor('#f8fafc');
    setDarkBgColor('#030712');
    setImageDetails(null);
    showToast('Branding forms reset to defaults.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden mt-6">
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Customize Website Branding</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              As an Administrator, you can customize the Website Title and upload a custom 512x512 high-resolution logo.
            </p>
          </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Website Name form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Website Title Name
                </label>
                <div className="relative flex items-center">
                  <Globe className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g. MyClassifieds"
                    className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-950 pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                    maxLength={32}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  This sets the brand title rendered in the global header, document title, meta tags, and schema markers.
                </p>
              </div>

              {/* Logo Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Current Logo Preview (Real-time Display Settings)
                </span>
                
                <div className="flex items-center gap-4">
                  <div className={`relative w-20 h-20 border border-slate-200 dark:border-slate-850 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300 ${
                    logoShape === 'circle' ? 'rounded-full' : logoShape === 'none' ? 'rounded-none' : 'rounded-2xl'
                  } ${
                    logoBg === 'brand' ? 'bg-blue-600' : logoBg === 'white' ? 'bg-white' : logoBg === 'dark' ? 'bg-slate-950' : 'bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[size:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] dark:bg-slate-800 bg-slate-100'
                  }`}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Website custom logo" 
                        className={`w-full h-full transition-all duration-300 ${
                          logoFit === 'cover' ? 'object-cover' : logoFit === 'scale-down' ? 'object-scale-down p-1.5' : 'object-contain p-1.5'
                        }`} 
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white text-xs font-black">LM</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[8px] font-mono px-1 py-0.2 rounded font-bold">
                      512px
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">
                      {logoUrl ? 'Custom Branding Active' : 'Default Preset Logo'}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {logoUrl ? 'Using your uploaded high-resolution logo scaled exactly to 512x512 pixels.' : 'The system is using the fallback tag symbol. Upload an image to override.'}
                    </p>
                    {imageDetails && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md w-fit">
                        <CheckCircle className="w-3 h-3" />
                        <span>Source: {imageDetails.width}x{imageDetails.height} px ({imageDetails.name})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Uploader / Drag Drop Zone */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Upload Logo Image (Strict 512x512 Resolution Output)
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 min-h-[180px] ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20'
                    : logoUrl
                    ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/10 dark:bg-emerald-950/5 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Upload className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Drag & drop website logo file, or <span className="text-blue-600 dark:text-blue-400 hover:underline">browse</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Output will be formatted to exactly <strong className="text-slate-600 dark:text-slate-350">512x512 pixels</strong>.
                  </p>
                </div>

                <div className="flex gap-2 text-[10px] font-mono font-semibold bg-blue-50 dark:bg-slate-850 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md mt-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Smart Auto-Crop to 512x512 Active</span>
                </div>
              </div>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoUrl('');
                    setImageDetails(null);
                    showToast('Custom logo removed. Using default LM logo.');
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-500 flex items-center gap-1 cursor-pointer w-fit mt-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove custom logo</span>
                </button>
              )}

              {/* Customizable Logo Display Settings for 512x512 Resolution */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4 mt-4">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Logo Sizing & Display Configurations
                </span>

                {/* Size Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Logo Display Size
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'small', label: 'Small', desc: 'w-10' },
                      { id: 'medium', label: 'Medium', desc: 'w-12' },
                      { id: 'large', label: 'Large', desc: 'w-16' },
                      { id: 'wide', label: 'Wide', desc: 'h-12 w-28' },
                      { id: 'banner', label: 'Banner', desc: 'h-13 w-36' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLogoSize(opt.id)}
                        className={`py-2 px-1 text-center border rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all ${
                          logoSize === opt.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px]'
                        }`}
                      >
                        <span className="text-[10px] block">{opt.label}</span>
                        <span className="text-[8px] opacity-60 font-mono block mt-0.5">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Shape Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Corner Shape
                    </label>
                    <select
                      value={logoShape}
                      onChange={(e) => setLogoShape(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 py-2 px-2.5 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <option value="rounded-xl">Rounded Card</option>
                      <option value="circle">Full Circle</option>
                      <option value="none">Flat Square</option>
                    </select>
                  </div>

                  {/* Image Fit Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Image Fit (512px)
                    </label>
                    <select
                      value={logoFit}
                      onChange={(e) => setLogoFit(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 py-2 px-2.5 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <option value="contain">Contain (Full Logo)</option>
                      <option value="cover">Cover (Fill Container)</option>
                      <option value="scale-down">Scale Down</option>
                    </select>
                  </div>

                  {/* Background Backdrop */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Logo Background
                    </label>
                    <select
                      value={logoBg}
                      onChange={(e) => setLogoBg(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 py-2 px-2.5 rounded-xl text-xs outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      <option value="transparent">Transparent</option>
                      <option value="brand">Brand Theme</option>
                      <option value="white">White Box</option>
                      <option value="dark">Dark Slate</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Color Selection */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>Website Color Theme</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Change the main color theme of the website. Select from beautiful handcrafted presets or pick your own custom brand color.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { id: 'blue', name: 'Classic Blue', color: '#0066FF' },
                { id: 'emerald', name: 'Emerald Green', color: '#10B981' },
                { id: 'violet', name: 'Royal Purple', color: '#8B5CF6' },
                { id: 'amber', name: 'Sunset Amber', color: '#F59E0B' },
                { id: 'rose', name: 'Rose Red', color: '#E11D48' },
                { id: 'slate', name: 'Slate Cyber', color: '#475569' },
                { id: 'custom', name: 'Custom Hex', color: themeCustomColor },
              ].map((theme) => {
                const isActive = themeColor === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setThemeColor(theme.id);
                      if (theme.id !== 'custom') {
                        setThemeCustomColor(theme.color);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 relative ${
                      isActive 
                        ? 'border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 shadow-sm scale-[1.02]' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Circle Swatch */}
                    <div 
                      className="w-7 h-7 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: theme.color }}
                    >
                      {isActive && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                      )}
                    </div>
                    
                    <span className="text-[10px] font-black tracking-tight text-slate-750 dark:text-slate-200 leading-tight">
                      {theme.name}
                    </span>

                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {themeColor === 'custom' && (
              <div className="max-w-xs p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-4 animate-fade-in">
                <div className="relative shrink-0">
                  <input
                    type="color"
                    value={themeCustomColor}
                    onChange={(e) => setThemeCustomColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
                    title="Choose brand primary color"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    Custom Hex Code
                  </label>
                  <input
                    type="text"
                    value={themeCustomColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('#') && val.length <= 7) {
                        setThemeCustomColor(val);
                      } else if (!val.startsWith('#') && val.length <= 6) {
                        setThemeCustomColor('#' + val);
                      }
                    }}
                    placeholder="#0066FF"
                    className="w-full bg-white dark:bg-slate-950 px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-xs font-mono font-bold outline-none uppercase text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Custom Background Colors & Smart Matching */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/30 dark:bg-indigo-950/10 p-4 rounded-2xl border border-indigo-100/40 dark:border-indigo-950/20">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span>Custom Backgrounds & Smart Match Settings</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Change the dark background color (replaces the black background) and light background to any shade, or auto-match them.
                </p>
              </div>
              <button
                type="button"
                onClick={autoGenerateMatchingBackgrounds}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center uppercase tracking-wider cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Match with Brand Color</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dark Mode Background Customization */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Dark Mode Base Color (Replaces Black Background)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Select a preset dark background or use the color picker for a custom dark slate, navy, purple, or deep forest green.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { hex: '#030712', name: 'Pitch Black' },
                    { hex: '#0a0f24', name: 'Midnight Navy' },
                    { hex: '#0c071d', name: 'Amethyst Dark' },
                    { hex: '#050e0a', name: 'Emerald Dark' },
                    { hex: '#130508', name: 'Crimson Dark' },
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setDarkBgColor(preset.hex)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        darkBgColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/60 max-w-xs">
                  <input
                    type="color"
                    value={darkBgColor}
                    onChange={(e) => setDarkBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    title="Choose custom dark mode background color"
                  />
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Custom Dark Hex
                    </label>
                    <input
                      type="text"
                      value={darkBgColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#') && val.length <= 7) {
                          setDarkBgColor(val);
                        } else if (!val.startsWith('#') && val.length <= 6) {
                          setDarkBgColor('#' + val);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-2 py-1 border border-slate-200 dark:border-slate-850 rounded-md text-xs font-mono font-bold outline-none uppercase text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Light Mode Background Customization */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Light Mode Base Color
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure the light mode default background canvas to white, soft cream, ivory, lavender mist or matching pastel tint.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { hex: '#f8fafc', name: 'Snow Slate' },
                    { hex: '#ffffff', name: 'Clean White' },
                    { hex: '#fafaf2', name: 'Warm Cream' },
                    { hex: '#f1f7f5', name: 'Mint Light' },
                    { hex: '#f6f4fa', name: 'Lavender Mist' },
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setLightBgColor(preset.hex)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        lightBgColor.toLowerCase() === preset.hex.toLowerCase()
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800/60 max-w-xs">
                  <input
                    type="color"
                    value={lightBgColor}
                    onChange={(e) => setLightBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                    title="Choose custom light mode background color"
                  />
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      Custom Light Hex
                    </label>
                    <input
                      type="text"
                      value={lightBgColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#') && val.length <= 7) {
                          setLightBgColor(val);
                        } else if (!val.startsWith('#') && val.length <= 6) {
                          setLightBgColor('#' + val);
                        }
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 px-2 py-1 border border-slate-200 dark:border-slate-850 rounded-md text-xs font-mono font-bold outline-none uppercase text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer & Information Customization */}
          <div className="pt-6 border-t border-slate-150 dark:border-slate-800/80 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-250">Footer & Contact Customization</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Configure custom copyright statements, system provider tags, and official address info shown in footers.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={copyright}
                  onChange={(e) => setCopyright(e.target.value)}
                  placeholder="e.g. © 2026 MyClassifieds Inc."
                  className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-950 px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  "Powered By" Tagline
                </label>
                <input
                  type="text"
                  value={poweredBy}
                  onChange={(e) => setPoweredBy(e.target.value)}
                  placeholder="e.g. Powered by AI Studio Build"
                  className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-950 px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Office Address & Contact Details
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123, Connaught Place, New Delhi, India"
                  className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-950 px-3.5 py-2 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100 min-h-[60px] resize-none"
                  required
                />
              </div>
            </div>

            {/* Social Media Links Section */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Social Media URL Controls</h4>
                <p className="text-[10px] text-slate-400">Provide official handles or channel page links to display in the header/footer social menus.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook Link
                  </label>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 px-3 py-2 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Twitter className="w-3.5 h-3.5 text-sky-500" /> Twitter / X Link
                  </label>
                  <input
                    type="url"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://twitter.com/yourusername"
                    className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 px-3 py-2 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" /> Instagram Link
                  </label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourusername"
                    className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 px-3 py-2 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Linkedin className="w-3.5 h-3.5 text-blue-750" /> LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 px-3 py-2 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Youtube className="w-3.5 h-3.5 text-red-650" /> YouTube Channel
                  </label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://youtube.com/c/yourchannel"
                    className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 px-3 py-2 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Demo Credentials Security Settings */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Public Security Options</h4>
              <p className="text-[10px] text-slate-400">Controls for whether demo/test logins are displayed on the public login portal.</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Show Demo Quick-Verify Credentials Hub</div>
                <div className="text-[10px] text-slate-400">Enable this during development or system review. Disable this when launching publicly to prevent unauthorized access.</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={showDemoHub} 
                  onChange={(e) => setShowDemoHub(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-150 dark:border-slate-800">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 rounded-xl cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer tracking-wider uppercase transition-all"
            >
              Save Branding changes
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Gemini API Key Configuration Card */}
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden mt-6">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400" />
              <span>Admin Gemini AI Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure your custom Google Gemini API Key. This key will be used to power all AI listing helpers, semantic searches, and automated moderation for this platform.
            </p>
          </div>
          {adminEmail && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-850 px-3.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[10.5px] font-mono text-slate-600 dark:text-slate-300">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Admin Email: </span>
              <span className="font-bold text-slate-800 dark:text-white">{adminEmail}</span>
            </div>
          )}
        </div>

        {isLoadingKey ? (
          <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500 font-semibold font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Checking secure credentials...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Current Key Status
                </span>
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
                    hasServerKey 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50' 
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50'
                  }`}>
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {hasServerKey ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Active (Custom Key Configured)</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>No Custom Key (Using Env Fallback)</span>
                        </>
                      )}
                    </p>
                    <p className="text-[10.5px] text-slate-500 font-mono">
                      {hasServerKey ? `Masked Token: ${maskedServerKey}` : 'Using system default fallback key'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-950/20 p-4 rounded-2xl space-y-1.5">
                <p className="font-extrabold text-indigo-900 dark:text-indigo-300">How does this work?</p>
                <p>
                  This secure dashboard configures the Google Gemini model endpoints in real-time. The keys are stored safely on the server and never exposed to standard buyers or sellers.
                </p>
                <p>
                  Once saved, the system will instantly route all AI generation requests through your designated API quota. To delete your custom key and return to the system default, simply save an empty key.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveGeminiKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Google Gemini API Key
                </label>
                <div className="relative flex items-center">
                  <KeyRound className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showKeyInput ? "text" : "password"}
                    value={geminiApiKeyInput}
                    onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                    placeholder={hasServerKey ? "Type new key to update or leave empty to delete" : "AIzaSy..."}
                    className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-950 pl-9 pr-20 py-2.5 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-xs outline-none transition font-mono text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(!showKeyInput)}
                    className="absolute right-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer uppercase"
                  >
                    {showKeyInput ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-normal">
                  Format: Must begin with <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 font-bold">AIzaSy</code>. You can obtain one free from Google AI Studio.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {hasServerKey && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (!token) return;
                      setIsSavingKey(true);
                      try {
                        const res = await fetch('/api/admin/gemini-config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ token, geminiApiKey: '' })
                        });
                        const data = await res.json();
                        if (data.success) {
                          setHasServerKey(false);
                          setMaskedServerKey('');
                          setGeminiApiKeyInput('');
                          showToast('Custom Gemini API Key removed successfully!');
                        }
                      } catch (err) {
                        showToast('Network error deleting key');
                      } finally {
                        setIsSavingKey(false);
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                  >
                    Delete Key
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSavingKey}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer tracking-wider uppercase transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingKey ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Save Gemini Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
