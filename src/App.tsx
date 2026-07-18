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
  const [activeViewMode, setActiveViewMode] = useState<'architect' | 'product'>('architect');
  const [approvedSpecs, setApprovedSpecs] = useState(false);

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

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        {activeViewMode === 'architect' ? (
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
            <PRDViewer onApprove={handleApproveSpec} />
          </div>
        ) : (
          <div className="flex-1 animate-fade-in">
            {/* Soft reminder if specs aren't approved yet */}
            {!approvedSpecs && (
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
                if (logoSize) localStorage.setItem('website_logo_size', logoSize);
                if (logoShape) localStorage.setItem('website_logo_shape', logoShape);
                if (logoFit) localStorage.setItem('website_logo_fit', logoFit);
                if (logoBg) localStorage.setItem('website_logo_bg', logoBg);
              }}
            />
          </div>
        )}
      </div>

      {/* Workspace Simple Footer */}
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

    </div>
  );
}
