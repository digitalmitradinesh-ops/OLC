/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  Database, 
  Layers, 
  FileCheck, 
  Sparkles, 
  Info,
  HelpCircle,
  Play
} from 'lucide-react';
import PRDViewer from './components/PRDViewer';
import ClassifiedsApp from './components/ClassifiedsApp';

// Helper function to dynamically generate Tailwind theme colors based on a primary Hex color
function getThemeHexes(themeColor: string, customColor: string) {
  const PRESET_HEXES: Record<string, string> = {
    blue: '#0066FF',
    emerald: '#10B981',
    violet: '#8B5CF6',
    amber: '#F59E0B',
    rose: '#E11D48',
    slate: '#475569',
  };

  const primaryHex = themeColor === 'custom' ? customColor : (PRESET_HEXES[themeColor] || '#0066FF');

  const cleanHex = primaryHex.replace('#', '');
  let r = 0, g = 102, b = 255;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }

  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const componentToHex = (c: number) => {
    const hex = clamp(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  const toHex = (red: number, green: number, blue: number) => {
    return '#' + componentToHex(red) + componentToHex(green) + componentToHex(blue);
  };

  const adjust = (factor: number) => {
    if (factor > 0) {
      return toHex(
        r + (255 - r) * factor,
        g + (255 - g) * factor,
        b + (255 - b) * factor
      );
    } else {
      const f = 1 + factor;
      return toHex(r * f, g * f, b * f);
    }
  };

  return {
    50: adjust(0.95),
    100: adjust(0.88),
    200: adjust(0.72),
    500: primaryHex,
    600: adjust(-0.15),
    700: adjust(-0.30),
  };
}

export default function App() {
  // Mode toggles between 'architect' specs view and 'product' marketplace view
  const [activeViewMode, setActiveViewMode] = useState<'architect' | 'product'>('product');
  const [approvedSpecs, setApprovedSpecs] = useState(true);

  // Check if sandbox dev tools should be shown (e.g. ?sandbox=true or ?dev=true)
  const showSandboxTools = useMemo(() => {
    return window.location.search.includes('sandbox=true') || window.location.search.includes('dev=true');
  }, []);

  // Auto-switch to user product page if user scrolls the specs view
  React.useEffect(() => {
    if (activeViewMode === 'architect') {
      const handleScroll = () => {
        if (window.scrollY > 100) {
          setApprovedSpecs(true);
          setActiveViewMode('product');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [activeViewMode]);

  const [websiteName, setWebsiteName] = useState<string>(() => {
    return localStorage.getItem('website_name') || 'LocalMarket';
  });

  const [websiteLogoUrl, setWebsiteLogoUrl] = useState<string>(() => {
    return localStorage.getItem('website_logo_url') || '';
  });

  const [websiteCopyright, setWebsiteCopyright] = useState<string>(() => {
    return localStorage.getItem('website_copyright') || `© 2026 ${websiteName} Inc.`;
  });

  const [websitePoweredBy, setWebsitePoweredBy] = useState<string>(() => {
    return localStorage.getItem('website_powered_by') || 'Powered by AI Studio Build';
  });

  const [websiteAddress, setWebsiteAddress] = useState<string>(() => {
    return localStorage.getItem('website_address') || '123, Connaught Place, New Delhi, India';
  });

  const [websiteThemeColor, setWebsiteThemeColor] = useState<string>(() => {
    return localStorage.getItem('website_theme_color') || 'blue';
  });

  const [websiteThemeCustomColor, setWebsiteThemeCustomColor] = useState<string>(() => {
    return localStorage.getItem('website_theme_custom_color') || '#0066FF';
  });

  // Fetch server-persisted global website branding on mount
  React.useEffect(() => {
    fetch('/api/admin/branding')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch branding');
        return res.json();
      })
      .then(data => {
        if (data && data.name) {
          setWebsiteName(data.name);
          setWebsiteLogoUrl(data.logoUrl || '');
          setWebsiteCopyright(data.copyright || `© 2026 ${data.name} Inc.`);
          setWebsitePoweredBy(data.poweredBy || 'Powered by AI Studio Build');
          setWebsiteAddress(data.address || '');
          if (data.themeColor) setWebsiteThemeColor(data.themeColor);
          if (data.themeCustomColor) setWebsiteThemeCustomColor(data.themeCustomColor);
          
          // Sync with localStorage for synchronous lookups
          localStorage.setItem('website_name', data.name);
          localStorage.setItem('website_logo_url', data.logoUrl || '');
          localStorage.setItem('website_copyright', data.copyright || `© 2026 ${data.name} Inc.`);
          localStorage.setItem('website_powered_by', data.poweredBy || 'Powered by AI Studio Build');
          localStorage.setItem('website_address', data.address || '');
          if (data.themeColor) localStorage.setItem('website_theme_color', data.themeColor);
          if (data.themeCustomColor) localStorage.setItem('website_theme_custom_color', data.themeCustomColor);
          if (data.logoSize) localStorage.setItem('website_logo_size', data.logoSize);
          if (data.logoShape) localStorage.setItem('website_logo_shape', data.logoShape);
          if (data.logoFit) localStorage.setItem('website_logo_fit', data.logoFit);
          if (data.logoBg) localStorage.setItem('website_logo_bg', data.logoBg);
          if (data.lightBgColor) localStorage.setItem('website_light_bg_color', data.lightBgColor);
          if (data.darkBgColor) localStorage.setItem('website_dark_bg_color', data.darkBgColor);
          if (data.lightHeaderColor) localStorage.setItem('website_light_header_color', data.lightHeaderColor);
          if (data.darkHeaderColor) localStorage.setItem('website_dark_header_color', data.darkHeaderColor);
          if (data.showDemoHub !== undefined) localStorage.setItem('website_show_demo_hub', String(data.showDemoHub));
          if (data.titleCase) localStorage.setItem('website_title_case', data.titleCase);
          if (data.aboutUs) localStorage.setItem('website_about_us', data.aboutUs);
          if (data.socials) localStorage.setItem('website_socials', JSON.stringify(data.socials));
        }
      })
      .catch(err => {
        console.error('Error fetching global branding:', err);
      });
  }, []);

  // Dynamically compute custom theme shades based on custom or preset colors
  const themeHexes = useMemo(() => {
    return getThemeHexes(websiteThemeColor, websiteThemeCustomColor);
  }, [websiteThemeColor, websiteThemeCustomColor]);

  const themeStyle = useMemo(() => {
    return {
      '--color-blue-50': themeHexes[50],
      '--color-blue-100': themeHexes[100],
      '--color-blue-200': themeHexes[200],
      '--color-blue-500': themeHexes[500],
      '--color-blue-600': themeHexes[600],
      '--color-blue-700': themeHexes[700],
    } as React.CSSProperties;
  }, [themeHexes]);

  const handleApproveSpec = () => {
    setApprovedSpecs(true);
    setActiveViewMode('product');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-200" style={themeStyle}>
      
      {/* Dev Navigation Top Bar */}
      {showSandboxTools && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-white z-50 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
              {websiteName} Fullstack Sandbox Environment
            </span>
          </div>

          {/* View Mode Selectors */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setActiveViewMode('architect')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeViewMode === 'architect' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architect Specs (Phase 1)</span>
            </button>
            
            <button
              onClick={() => setActiveViewMode('product')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer relative ${
                activeViewMode === 'product' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Interactive Classifieds (Phase 2-4)</span>
              {!approvedSpecs && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {showSandboxTools && activeViewMode === 'architect' ? (
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
            <PRDViewer onApprove={handleApproveSpec} />
          </div>
        ) : (
          <div className="flex-1 animate-fade-in">
            {/* Soft reminder if specs aren't approved yet */}
            {showSandboxTools && !approvedSpecs && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You are exploring the Interactive Classifieds Prototype. You can switch back to the "Architect Specs" tab to inspect the Database Schema or API endpoints anytime.</span>
              </div>
            )}
            <ClassifiedsApp 
              websiteName={websiteName}
              websiteLogoUrl={websiteLogoUrl}
              websiteCopyright={websiteCopyright}
              websitePoweredBy={websitePoweredBy}
              websiteAddress={websiteAddress}
              websiteThemeColor={websiteThemeColor}
              websiteThemeCustomColor={websiteThemeCustomColor}
              onUpdateBranding={(name, logoUrl, copyright, poweredBy, address, socials, themeColor, themeCustomColor, logoSize, logoShape, logoFit, logoBg) => {
                setWebsiteName(name);
                setWebsiteLogoUrl(logoUrl);
                setWebsiteCopyright(copyright);
                setWebsitePoweredBy(poweredBy);
                setWebsiteAddress(address);
                if (themeColor) setWebsiteThemeColor(themeColor);
                if (themeCustomColor) setWebsiteThemeCustomColor(themeCustomColor);
                
                // Save locally to localStorage as immediate backup
                localStorage.setItem('website_name', name);
                localStorage.setItem('website_logo_url', logoUrl);
                localStorage.setItem('website_copyright', copyright);
                localStorage.setItem('website_powered_by', poweredBy);
                localStorage.setItem('website_address', address);
                if (themeColor) localStorage.setItem('website_theme_color', themeColor);
                if (themeCustomColor) localStorage.setItem('website_theme_custom_color', themeCustomColor);
                if (logoSize) localStorage.setItem('website_logo_size', logoSize);
                if (logoShape) localStorage.setItem('website_logo_shape', logoShape);
                if (logoFit) localStorage.setItem('website_logo_fit', logoFit);
                if (logoBg) localStorage.setItem('website_logo_bg', logoBg);
                if (socials) localStorage.setItem('website_socials', JSON.stringify(socials));

                // Save globally to the server backend
                const token = localStorage.getItem('auth_token');
                fetch('/api/admin/branding', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    token,
                    name,
                    logoUrl,
                    copyright,
                    poweredBy,
                    address,
                    socials,
                    themeColor,
                    themeCustomColor,
                    logoSize,
                    logoShape,
                    logoFit,
                    logoBg
                  })
                })
                .then(res => {
                  if (!res.ok) throw new Error('Failed to update backend branding');
                  return res.json();
                })
                .then(resData => {
                  console.log('Branding persisted globally on backend:', resData);
                })
                .catch(err => {
                  console.error('Error persisting global branding:', err);
                });
              }}
            />
          </div>
        )}
      </div>

      {/* Workspace Simple Footer */}
      {showSandboxTools && (
        <footer className="bg-white border-t border-slate-100 py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-slate-400 text-[10px] font-mono">
          <div className="flex items-center gap-2">
            {websiteLogoUrl ? (
              <img src={websiteLogoUrl} alt="Logo" className="w-6 h-6 rounded-md object-contain bg-slate-50 border border-slate-250 p-0.5" />
            ) : (
              <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center text-[8px] text-white font-extrabold font-sans">
                LM
              </div>
            )}
            <span>{websiteCopyright || `© 2026 ${websiteName} Inc.`} | {websitePoweredBy || 'Powered by AI Studio Build'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-300" />
              <span>PostgreSQL Active</span>
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Gemini AI Connected</span>
            </span>
          </div>
        </footer>
      )}

    </div>
  );
}
