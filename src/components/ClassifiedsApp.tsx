/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Plus, 
  MessageSquare, 
  User, 
  Heart, 
  SlidersHorizontal, 
  Tag, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight, 
  Image as ImageIcon, 
  Sparkles, 
  TrendingUp, 
  Eye, 
  Clock, 
  Phone, 
  Mail,
  Send, 
  X, 
  Check, 
  BarChart3, 
  DollarSign, 
  AlertTriangle, 
  Trash2, 
  RefreshCw,
  Award,
  CreditCard,
  Building,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserPlus,
  KeyRound,
  Settings,
  Sliders,
  CheckCircle,
  Share2,
  Map,
  BookOpen,
  Globe,
  Info,
  LogOut,
  Sun,
  Moon,
  Database,
  Copy,
  Code,
  Lock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Bell,
  BellRing,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing, Category, Chat, Message, PremiumPlan, UserProfile } from '../types';
import { CATEGORIES, INITIAL_LISTINGS, INITIAL_CHATS, INITIAL_MESSAGES, PREMIUM_PLANS, CURRENT_USER, MOCK_USER_PROFILES } from '../data';
import InteractiveMap from './InteractiveMap';
import { INDIA_LOCATIONS, INDIA_STATES_DIRECTORY, findLocationByQuery, PincodeRecord } from '../indiaLocations';
import AuthScreen from './AuthScreen';
import AuthenticationModal from './AuthenticationModal';
import UserProfileEditor from './UserProfileEditor';
import DatabaseSchemaViewer from './DatabaseSchemaViewer';
import AdminMetricsViewer from './AdminMetricsViewer';
import CategoryAdminPanel from './CategoryAdminPanel';
import BrandingAdminPanel from './BrandingAdminPanel';
import WebsiteManagersPanel from './WebsiteManagersPanel';
import PRDViewer from './PRDViewer';

const getAccountAge = (joinedDateStr: string): string => {
  if (!joinedDateStr) return 'Member';
  
  let joinDate: Date;
  if (joinedDateStr.includes('-')) {
    joinDate = new Date(joinedDateStr);
  } else {
    const parts = joinedDateStr.split(' ');
    if (parts.length === 2) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = monthNames.indexOf(parts[0]);
      const year = parseInt(parts[1], 10);
      if (monthIdx !== -1 && !isNaN(year)) {
        joinDate = new Date(year, monthIdx, 1);
      } else {
        joinDate = new Date(joinedDateStr);
      }
    } else {
      joinDate = new Date(joinedDateStr);
    }
  }

  if (isNaN(joinDate.getTime())) {
    return 'Member';
  }

  const currentDate = new Date('2026-07-16'); // Current local date from metadata
  const diffMonths = (currentDate.getFullYear() - joinDate.getFullYear()) * 12 + (currentDate.getMonth() - joinDate.getMonth());

  if (diffMonths < 1) {
    return 'Member for < 1 month';
  } else if (diffMonths < 12) {
    return `Member for ${diffMonths} ${diffMonths === 1 ? 'month' : 'months'}`;
  } else {
    const years = Math.floor(diffMonths / 12);
    return `Member for ${years} ${years === 1 ? 'year' : 'years'}`;
  }
};

const getSellerProfileObj = (sellerId: string, currentUser: UserProfile | null): UserProfile | null => {
  if (currentUser && sellerId === currentUser.id) return currentUser;
  return MOCK_USER_PROFILES.find(p => p.id === sellerId) || null;
};

interface ClassifiedsAppProps {
  websiteName?: string;
  websiteLogoUrl?: string;
  websiteCopyright?: string;
  websitePoweredBy?: string;
  websiteAddress?: string;
  websiteSocials?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  websiteThemeColor?: string;
  websiteThemeCustomColor?: string;
  websiteLogoSize?: string;
  websiteLogoShape?: string;
  websiteLogoFit?: string;
  websiteLogoBg?: string;
  websiteCarouselImages?: string[];
  onUpdateBranding?: (
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
    logoSize?: string,
    logoShape?: string,
    logoFit?: string,
    logoBg?: string,
    carouselImages?: string[]
  ) => void;
}

export default function ClassifiedsApp({
  websiteName: propWebsiteName = 'LocalMarket',
  websiteLogoUrl: propWebsiteLogoUrl = '',
  websiteCopyright: propWebsiteCopyright = '',
  websitePoweredBy: propWebsitePoweredBy = '',
  websiteAddress: propWebsiteAddress = '',
  websiteSocials: propWebsiteSocials,
  websiteThemeColor: propWebsiteThemeColor = 'blue',
  websiteThemeCustomColor: propWebsiteThemeCustomColor = '#0066FF',
  websiteLogoSize: propWebsiteLogoSize = 'medium',
  websiteLogoShape: propWebsiteLogoShape = 'rounded-xl',
  websiteLogoFit: propWebsiteLogoFit = 'contain',
  websiteLogoBg: propWebsiteLogoBg = 'transparent',
  websiteCarouselImages: propWebsiteCarouselImages = [],
  onUpdateBranding
}: ClassifiedsAppProps = {}) {
  // State
  const [shareNotification, setShareNotification] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('local_listings');
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('local_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('local_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  // Simulated notification system states
  const [inAppNotifications, setInAppNotifications] = useState<{
    id: string;
    chatId: string;
    senderName: string;
    listingTitle: string;
    listingPhoto?: string;
    text: string;
    timestamp: string;
  }[]>([]);
  const [simulationEnabled, setSimulationEnabled] = useState<boolean>(() => {
    return localStorage.getItem('simulation_enabled') === 'true';
  });
  const [simulationSound, setSimulationSound] = useState<boolean>(() => {
    return localStorage.getItem('simulation_sound') !== 'false';
  });
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [customSimMsg, setCustomSimMsg] = useState('');
  const [customSimChatId, setCustomSimChatId] = useState('');

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [adminActiveTab, setAdminActiveTab] = useState<'overview' | 'metrics' | 'database' | 'categories' | 'branding' | 'managers' | 'specs'>('overview');

  const [websiteName, setWebsiteName] = useState<string>(() => {
    return propWebsiteName || localStorage.getItem('website_name') || 'LocalMarket';
  });

  const [websiteLogoUrl, setWebsiteLogoUrl] = useState<string>(() => {
    return propWebsiteLogoUrl || localStorage.getItem('website_logo_url') || '';
  });

  const [websiteCopyright, setWebsiteCopyright] = useState<string>(() => {
    return propWebsiteCopyright || localStorage.getItem('website_copyright') || `© 2026 ${websiteName} Inc.`;
  });

  const [websitePoweredBy, setWebsitePoweredBy] = useState<string>(() => {
    return propWebsitePoweredBy || localStorage.getItem('website_powered_by') || 'Powered by AI Studio Build';
  });

  const [websiteAddress, setWebsiteAddress] = useState<string>(() => {
    return propWebsiteAddress || localStorage.getItem('website_address') || '123, Connaught Place, New Delhi, India';
  });

  const [websiteAboutUs, setWebsiteAboutUs] = useState<string>(() => {
    return localStorage.getItem('website_about_us') || `Welcome to ${propWebsiteName || 'LocalMarket'}, India's premier, security-verified localized trading marketplace.

Our mission is to establish trust in classified buying and selling. By utilizing secure authentication, cryptographically verified user profiles, in-memory real-time communication modules, and real pincode integration across all Indian states and pin zones, we provide a seamless localized peer-to-peer trading hub.

Whether you're a local resident decluttering your home, a professional service agency offering technical assistance, or a local store manager reaching nearby buyers, our secure classified engine makes local commerce smooth, safe, and lightning fast.`;
  });

  const [websiteSocials, setWebsiteSocials] = useState<{
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  }>(() => {
    if (propWebsiteSocials) return {
      facebook: propWebsiteSocials.facebook || 'https://facebook.com',
      twitter: propWebsiteSocials.twitter || 'https://twitter.com',
      instagram: propWebsiteSocials.instagram || 'https://instagram.com',
      linkedin: propWebsiteSocials.linkedin || 'https://linkedin.com',
      youtube: propWebsiteSocials.youtube || 'https://youtube.com',
    };
    try {
      const saved = localStorage.getItem('website_socials');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
      youtube: 'https://youtube.com',
    };
  });

  const [websiteShowDemoHub, setWebsiteShowDemoHub] = useState<boolean>(() => {
    return localStorage.getItem('website_show_demo_hub') !== 'false';
  });

  const [websiteThemeColor, setWebsiteThemeColor] = useState<string>(() => {
    return propWebsiteThemeColor || localStorage.getItem('website_theme_color') || 'blue';
  });

  const [websiteThemeCustomColor, setWebsiteThemeCustomColor] = useState<string>(() => {
    return propWebsiteThemeCustomColor || localStorage.getItem('website_theme_custom_color') || '#0066FF';
  });

  const [websiteLightBgColor, setWebsiteLightBgColor] = useState<string>(() => {
    return localStorage.getItem('website_light_bg_color') || '#f8fafc';
  });

  const [websiteDarkBgColor, setWebsiteDarkBgColor] = useState<string>(() => {
    return localStorage.getItem('website_dark_bg_color') || '#030712';
  });

  const [websiteLogoSize, setWebsiteLogoSize] = useState<string>(() => {
    return propWebsiteLogoSize || localStorage.getItem('website_logo_size') || 'medium';
  });

  const [websiteLogoShape, setWebsiteLogoShape] = useState<string>(() => {
    return propWebsiteLogoShape || localStorage.getItem('website_logo_shape') || 'rounded-xl';
  });

  const [websiteLogoFit, setWebsiteLogoFit] = useState<string>(() => {
    return propWebsiteLogoFit || localStorage.getItem('website_logo_fit') || 'contain';
  });

  const [websiteLogoBg, setWebsiteLogoBg] = useState<string>(() => {
    return propWebsiteLogoBg || localStorage.getItem('website_logo_bg') || 'transparent';
  });

  const [websiteTitleCase, setWebsiteTitleCase] = useState<string>(() => {
    return localStorage.getItem('website_title_case') || 'uppercase';
  });

  const [websiteLightHeaderColor, setWebsiteLightHeaderColor] = useState<string>(() => {
    return localStorage.getItem('website_light_header_color') || '#ffffff';
  });

  const [websiteDarkHeaderColor, setWebsiteDarkHeaderColor] = useState<string>(() => {
    return localStorage.getItem('website_dark_header_color') || '#111827';
  });

  const [websiteCarouselImages, setWebsiteCarouselImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('website_carousel_images');
      if (saved) return JSON.parse(saved);
    } catch {}
    return propWebsiteCarouselImages.length > 0 ? propWebsiteCarouselImages : [
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'
    ];
  });

  useEffect(() => {
    if (propWebsiteName) {
      setWebsiteName(propWebsiteName);
    }
  }, [propWebsiteName]);

  useEffect(() => {
    if (propWebsiteCarouselImages && propWebsiteCarouselImages.length > 0) {
      setWebsiteCarouselImages(propWebsiteCarouselImages);
    }
  }, [propWebsiteCarouselImages]);

  useEffect(() => {
    if (propWebsiteLogoUrl !== undefined) {
      setWebsiteLogoUrl(propWebsiteLogoUrl);
    }
  }, [propWebsiteLogoUrl]);

  useEffect(() => {
    if (propWebsiteCopyright) {
      setWebsiteCopyright(propWebsiteCopyright);
    }
  }, [propWebsiteCopyright]);

  useEffect(() => {
    if (propWebsitePoweredBy) {
      setWebsitePoweredBy(propWebsitePoweredBy);
    }
  }, [propWebsitePoweredBy]);

  useEffect(() => {
    if (propWebsiteAddress) {
      setWebsiteAddress(propWebsiteAddress);
    }
  }, [propWebsiteAddress]);

  useEffect(() => {
    if (propWebsiteThemeColor) {
      setWebsiteThemeColor(propWebsiteThemeColor);
    }
  }, [propWebsiteThemeColor]);

  useEffect(() => {
    if (propWebsiteThemeCustomColor) {
      setWebsiteThemeCustomColor(propWebsiteThemeCustomColor);
    }
  }, [propWebsiteThemeCustomColor]);

  useEffect(() => {
    if (propWebsiteLogoSize) {
      setWebsiteLogoSize(propWebsiteLogoSize);
    }
  }, [propWebsiteLogoSize]);

  useEffect(() => {
    if (propWebsiteLogoShape) {
      setWebsiteLogoShape(propWebsiteLogoShape);
    }
  }, [propWebsiteLogoShape]);

  useEffect(() => {
    if (propWebsiteLogoFit) {
      setWebsiteLogoFit(propWebsiteLogoFit);
    }
  }, [propWebsiteLogoFit]);

  useEffect(() => {
    if (propWebsiteLogoBg) {
      setWebsiteLogoBg(propWebsiteLogoBg);
    }
  }, [propWebsiteLogoBg]);

  // Helper functions to generate logo CSS dynamically for high resolution 512x512 logo sizing
  const getLogoContainerClass = (isFooter = false) => {
    let sizeClass = "";
    if (isFooter) {
      switch (websiteLogoSize) {
        case 'small': sizeClass = "w-8 h-8"; break;
        case 'medium': sizeClass = "w-10 h-10"; break;
        case 'large': sizeClass = "w-12 h-12"; break;
        case 'wide': sizeClass = "h-8 w-20"; break;
        case 'banner': sizeClass = "h-9 w-24"; break;
        default: sizeClass = "w-9 h-9";
      }
    } else {
      switch (websiteLogoSize) {
        case 'small': sizeClass = "w-9 h-9 md:w-10 md:h-10"; break;
        case 'medium': sizeClass = "w-11 h-11 md:w-12 md:h-12"; break;
        case 'large': sizeClass = "w-14 h-14 md:w-16 md:h-16"; break;
        case 'wide': sizeClass = "h-10 w-24 md:h-12 md:w-28"; break;
        case 'banner': sizeClass = "h-11 w-28 md:h-13 md:w-36"; break;
        default: sizeClass = "w-11 h-11 md:w-12 md:h-12";
      }
    }

    let bgClass = "";
    switch (websiteLogoBg) {
      case 'brand': bgClass = "bg-blue-600 dark:bg-blue-600"; break;
      case 'white': bgClass = "bg-white border border-slate-200 dark:border-slate-800 shadow-xs"; break;
      case 'dark': bgClass = "bg-slate-900 border border-slate-800 shadow-xs"; break;
      case 'transparent':
      default: bgClass = "bg-transparent";
    }

    let shapeClass = "";
    switch (websiteLogoShape) {
      case 'circle': shapeClass = "rounded-full"; break;
      case 'none': shapeClass = "rounded-none"; break;
      case 'rounded-xl':
      default: shapeClass = "rounded-xl";
    }

    return `${sizeClass} ${bgClass} ${shapeClass} flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300`;
  };

  const getLogoImgClass = () => {
    switch (websiteLogoFit) {
      case 'cover': return "w-full h-full object-cover";
      case 'scale-down': return "w-full h-full object-scale-down p-0.5";
      case 'contain':
      default: return "w-full h-full object-contain p-0.5";
    }
  };

  useEffect(() => {
    if (propWebsiteThemeColor) {
      setWebsiteThemeColor(propWebsiteThemeColor);
    }
  }, [propWebsiteThemeColor]);

  useEffect(() => {
    if (propWebsiteThemeCustomColor) {
      setWebsiteThemeCustomColor(propWebsiteThemeCustomColor);
    }
  }, [propWebsiteThemeCustomColor]);

  useEffect(() => {
    if (propWebsiteName) {
      setWebsiteName(propWebsiteName);
    }
  }, [propWebsiteName]);

  useEffect(() => {
    if (propWebsiteLogoUrl !== undefined) {
      setWebsiteLogoUrl(propWebsiteLogoUrl);
    }
  }, [propWebsiteLogoUrl]);

  useEffect(() => {
    if (propWebsiteCopyright) {
      setWebsiteCopyright(propWebsiteCopyright);
    }
  }, [propWebsiteCopyright]);

  useEffect(() => {
    if (propWebsitePoweredBy) {
      setWebsitePoweredBy(propWebsitePoweredBy);
    }
  }, [propWebsitePoweredBy]);

  useEffect(() => {
    if (propWebsiteAddress) {
      setWebsiteAddress(propWebsiteAddress);
    }
  }, [propWebsiteAddress]);

  useEffect(() => {
    if (propWebsiteSocials) {
      setWebsiteSocials({
        facebook: propWebsiteSocials.facebook || 'https://facebook.com',
        twitter: propWebsiteSocials.twitter || 'https://twitter.com',
        instagram: propWebsiteSocials.instagram || 'https://instagram.com',
        linkedin: propWebsiteSocials.linkedin || 'https://linkedin.com',
        youtube: propWebsiteSocials.youtube || 'https://youtube.com',
      });
    }
  }, [propWebsiteSocials]);

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('local_categories');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('local_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        } else {
          localStorage.removeItem('auth_token');
          setToken(null);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Secure verification offline or server connection failed:', error);
        localStorage.removeItem('auth_token');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    verifySession();
  }, [token]);

  // Nav / View states
  const [currentView, setCurrentView] = useState<'buy' | 'sell' | 'chats' | 'dashboard' | 'admin' | 'directory' | 'privacy' | 'about'>('buy');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  // Keep track of active view, selected chat, chats, and listings in refs for async closures
  const currentViewRef = useRef(currentView);
  const selectedChatRef = useRef(selectedChat);
  const chatsRef = useRef(chats);
  const listingsRef = useRef(listings);

  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    listingsRef.current = listings;
  }, [listings]);

  // Home Carousel active slide index
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    if (websiteCarouselImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex(prev => (prev + 1) % websiteCarouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [websiteCarouselImages]);

  // Authentication popup gating states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingView, setPendingView] = useState<'buy' | 'sell' | 'chats' | 'dashboard' | 'admin' | 'directory' | 'privacy' | 'about' | null>(null);
  const [pendingChatListing, setPendingChatListing] = useState<Listing | null>(null);

  const handleNavigate = (view: 'buy' | 'sell' | 'chats' | 'dashboard' | 'admin' | 'directory' | 'privacy' | 'about') => {
    setSelectedListing(null);
    if (!currentUser && ['sell', 'chats', 'dashboard', 'admin'].includes(view)) {
      setPendingView(view);
      setShowAuthModal(true);
      return;
    }
    setCurrentView(view);
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceMax, setPriceMax] = useState<number>(10000000);
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [searchLocation, setSearchLocation] = useState('Connaught Place, New Delhi (110001)');

  // Autocomplete suggestions states
  const [searchLocationSuggestions, setSearchLocationSuggestions] = useState<PincodeRecord[]>([]);
  const [sellLocationSuggestions, setSellLocationSuggestions] = useState<PincodeRecord[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showSellSuggestions, setShowSellSuggestions] = useState(false);

  // Cascading Location Selector states (Country > State > City > Area)
  const [drilldownState, setDrilldownState] = useState<string>('all');
  const [drilldownCity, setDrilldownCity] = useState<string>('all');
  const [drilldownArea, setDrilldownArea] = useState<string>('all');
  const [locationSearchTab, setLocationSearchTab] = useState<'search' | 'drilldown'>('search');

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('local_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Performance-focused feed states (Infinite Scroll, Pagination, Caching, and CDN Simulator)
  const [feedMode, setFeedMode] = useState<'infinite' | 'pagination'>('pagination');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [visibleCount, setVisibleCount] = useState(6);
  const [queryLatency, setQueryLatency] = useState(0.4); // in ms
  const [cacheStatus, setCacheStatus] = useState<'memory_hit' | 'disk_hit' | 'network_miss'>('memory_hit');
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [isWebpEnabled, setIsWebpEnabled] = useState(true);
  const [isLazyLoadingActive, setIsLazyLoadingActive] = useState(true);

  // Query Cache & Latency simulator effect
  useEffect(() => {
    setIsQueryLoading(true);
    // Reset page cursors to optimize Layout Shifts (CLS)
    setCurrentPage(1);
    setVisibleCount(6);

    const isCachedQuery = searchQuery.length === 0 && selectedCategory === 'all' && priceMax === 10000000 && filterCondition === 'all' && !onlyVerified && searchLocation === 'Connaught Place, New Delhi (110001)';
    
    const timer = setTimeout(() => {
      setIsQueryLoading(false);
      if (isCachedQuery) {
        setQueryLatency(parseFloat((Math.random() * 0.3 + 0.1).toFixed(2))); // 0.1 - 0.4 ms
        setCacheStatus('memory_hit');
      } else {
        const rand = Math.random();
        if (rand < 0.6) {
          setQueryLatency(parseFloat((Math.random() * 0.8 + 0.3).toFixed(2))); // 0.3 - 1.1 ms
          setCacheStatus('disk_hit');
        } else {
          setQueryLatency(parseFloat((Math.random() * 18 + 8).toFixed(1))); // 8 - 26 ms
          setCacheStatus('network_miss');
        }
      }
    }, isCachedQuery ? 50 : 160);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, priceMax, filterCondition, onlyVerified, searchLocation]);

  // Dynamic SEO, Meta Tags & Schema.org Structured Data Generator
  useEffect(() => {
    let title = `${websiteName} | India's #1 Premium Classifieds & Realtime Marketplace`;
    let description = `Discover premium second-hand goods, certified vehicles, properties, furniture, and jobs on India's leading real-time marketplace. Safe transactions, verified sellers, and dynamic search.`;
    let imageUrl = websiteLogoUrl || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800';
    let canonicalUrl = window.location.origin + '/';
    let schemaJson: any = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': `${websiteName} Classifieds`,
      'url': window.location.origin,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${window.location.origin}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    if (selectedListing) {
      title = `${selectedListing.title} - ₹${selectedListing.price.toLocaleString()} | ${websiteName}`;
      description = selectedListing.description.slice(0, 160) + '...';
      imageUrl = selectedListing.photos?.[0] || imageUrl;
      canonicalUrl = `${window.location.origin}/listing/${selectedListing.id}`;
      
      // Structured Data for Product / Classified listing
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': selectedListing.title,
        'image': selectedListing.photos || [imageUrl],
        'description': selectedListing.description,
        'brand': {
          '@type': 'Brand',
          'name': selectedListing.brand || `${websiteName} Verified`
        },
        'offers': {
          '@type': 'Offer',
          'url': canonicalUrl,
          'priceCurrency': 'INR',
          'price': selectedListing.price,
          'itemCondition': selectedListing.condition === 'new' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'Person',
            'name': 'Verified Seller'
          }
        }
      };
    } else if (currentView === 'sell') {
      title = 'Post Free Advertisement | LocalMarket classifieds';
      description = 'Sell your mobile phone, cars, home furniture, apartments, electronics and household items fast. Connect with real buyers in India instantly.';
      canonicalUrl = window.location.origin + '/sell';
    } else if (currentView === 'chats') {
      title = 'Active Discussions & Chats | LocalMarket classifieds';
      description = 'Chat in real-time with verified buyers and sellers on India\'s premier second-hand trading portal.';
      canonicalUrl = window.location.origin + '/chats';
    } else if (selectedCategory && selectedCategory !== 'all') {
      const cat = categories.find(c => c.id === selectedCategory);
      if (cat) {
        title = `Buy & Sell in ${cat.name} | LocalMarket classifieds`;
        description = `Browse premium items and active classified classified ads in ${cat.name}. Uncover the best bargains on ${cat.subcategories.map(s => s.name).join(', ')}.`;
        canonicalUrl = `${window.location.origin}/category/${cat.slug}`;
        
        // Structured Data for Breadcrumbs
        schemaJson = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': window.location.origin
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': cat.name,
              'item': canonicalUrl
            }
          ]
        };
      }
    }

    // Dynamic head injector implementation
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Canonical link
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', linkCanonical.getAttribute('href') || canonicalUrl);

    // Open Graph
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:image': imageUrl,
      'og:url': canonicalUrl,
      'og:type': selectedListing ? 'product' : 'website',
      'og:site_name': 'LocalMarket'
    };
    Object.entries(ogTags).forEach(([prop, content]) => {
      let tag = document.querySelector(`meta[property="${prop}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', prop);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Cards
    const twTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': imageUrl
    };
    Object.entries(twTags).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // JSON-LD Script
    let schemaScript = document.getElementById('schema-jsonld') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'schema-jsonld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaJson, null, 2);

  }, [currentView, selectedListing, selectedCategory]);

  // Post Ad Form states
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('cat-mobiles');
  const [newSubcat, setNewSubcat] = useState('sub-mob-phones');
  const [newCondition, setNewCondition] = useState<'new' | 'like_new' | 'good' | 'fair'>('new');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLocation, setNewLocation] = useState('Connaught Place, New Delhi (110001)');
  const [newPhotos, setNewPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState('');

  // AI helper states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    priceRange?: string;
    suggestedDescription?: string;
    suggestedCategory?: string;
    spamAlert?: boolean;
  } | null>(null);

  // AI Search states
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<{id: string; score: number}[] | null>(null);
  const [isAiSearchLoading, setIsAiSearchLoading] = useState(false);

  // AI Integrity, Moderation, Spam & Fraud Audit states
  const [isAnalyzingIntegrity, setIsAnalyzingIntegrity] = useState(false);
  const [adIntegrityResult, setAdIntegrityResult] = useState<{
    spamScore: number;
    spamReason: string;
    fraudScore: number;
    fraudReason: string;
    duplicateDetected: boolean;
    duplicateScore: number;
    duplicateAdId: string | null;
  } | null>(null);

  // AI Image Enhancer state
  const [isEnhancingImage, setIsEnhancingImage] = useState(false);
  const [enhancedPhotoMap, setEnhancedPhotoMap] = useState<Record<string, string>>({});
  const [selectedPhotoToEnhance, setSelectedPhotoToEnhance] = useState<string | null>(null);
  const [activeEnhanceSlider, setActiveEnhanceSlider] = useState<number>(50); // percentage for split screen

  // Directory & Logistics specific states
  const [selectedState, setSelectedState] = useState<string>('Delhi');
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');
  const [originPincode, setOriginPincode] = useState('110001');
  const [destPincode, setDestPincode] = useState('');
  const [calcResult, setCalcResult] = useState<{distance: number; days: number; cost: number; serviceable: boolean; carrier: string} | null>(null);

  // Payment states
  const [boostingListing, setBoostingListing] = useState<Listing | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'details' | 'success'>('select');

  // New Message State
  const [replyText, setReplyText] = useState('');

  // Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin states
  const [reportedQueue, setReportedQueue] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('local_reported_queue');
    if (saved) return JSON.parse(saved);
    return INITIAL_LISTINGS.slice(0, 2);
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('local_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('local_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('local_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('local_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('local_reported_queue', JSON.stringify(reportedQueue));
  }, [reportedQueue]);

  useEffect(() => {
    localStorage.setItem('simulation_enabled', String(simulationEnabled));
  }, [simulationEnabled]);

  useEffect(() => {
    localStorage.setItem('simulation_sound', String(simulationSound));
  }, [simulationSound]);

  // Background message simulation trigger (Every 45 seconds if enabled)
  useEffect(() => {
    if (!simulationEnabled || !currentUser) return;

    const intervalId = setInterval(() => {
      triggerSimulatedIncomingMessage();
    }, 45000);

    return () => clearInterval(intervalId);
  }, [simulationEnabled, currentUser?.id]);

  // Handle startup deep links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const listingId = params.get('listing');
    if (listingId) {
      const match = listings.find(l => l.id === listingId);
      if (match) {
        setSelectedListing(match);
        setCurrentView('buy');
        // Clear query parameters from URL quietly to avoid re-triggering or messy links
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        showToast(`Loaded shared listing: ${match.title}`);
      }
    }
  }, [listings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mark selected chat as read automatically
  useEffect(() => {
    if (currentView === 'chats' && selectedChat) {
      setChats(prevChats => {
        let changed = false;
        const updated = prevChats.map(c => {
          if (c.id === selectedChat.id && c.unreadCount > 0) {
            changed = true;
            return { ...c, unreadCount: 0 };
          }
          return c;
        });
        return changed ? updated : prevChats;
      });
    }
  }, [currentView, selectedChat]);

  const handleSaveBranding = (
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
    logoSize: string = 'medium',
    logoShape: string = 'rounded-xl',
    logoFit: string = 'contain',
    logoBg: string = 'transparent',
    lightBgColor: string = '#f8fafc',
    darkBgColor: string = '#030712',
    showDemoHub: boolean = true,
    titleCase: string = 'uppercase',
    lightHeaderColor: string = '#ffffff',
    darkHeaderColor: string = '#111827',
    aboutUs: string = '',
    carouselImages: string[] = []
  ) => {
    setWebsiteName(name);
    setWebsiteLogoUrl(logoUrl);
    setWebsiteCopyright(copyright);
    setWebsitePoweredBy(poweredBy);
    setWebsiteAddress(address);
    setWebsiteAboutUs(aboutUs);
    setWebsiteSocials(socials);
    setWebsiteThemeColor(themeColor);
    setWebsiteThemeCustomColor(themeCustomColor);
    setWebsiteLogoSize(logoSize);
    setWebsiteLogoShape(logoShape);
    setWebsiteLogoFit(logoFit);
    setWebsiteLogoBg(logoBg);
    setWebsiteLightBgColor(lightBgColor);
    setWebsiteDarkBgColor(darkBgColor);
    setWebsiteShowDemoHub(showDemoHub);
    setWebsiteTitleCase(titleCase);
    setWebsiteLightHeaderColor(lightHeaderColor);
    setWebsiteDarkHeaderColor(darkHeaderColor);
    setWebsiteCarouselImages(carouselImages);
    localStorage.setItem('website_name', name);
    localStorage.setItem('website_logo_url', logoUrl);
    localStorage.setItem('website_copyright', copyright);
    localStorage.setItem('website_powered_by', poweredBy);
    localStorage.setItem('website_address', address);
    localStorage.setItem('website_about_us', aboutUs);
    localStorage.setItem('website_socials', JSON.stringify(socials));
    localStorage.setItem('website_theme_color', themeColor);
    localStorage.setItem('website_theme_custom_color', themeCustomColor);
    localStorage.setItem('website_logo_size', logoSize);
    localStorage.setItem('website_logo_shape', logoShape);
    localStorage.setItem('website_logo_fit', logoFit);
    localStorage.setItem('website_logo_bg', logoBg);
    localStorage.setItem('website_light_bg_color', lightBgColor);
    localStorage.setItem('website_dark_bg_color', darkBgColor);
    localStorage.setItem('website_light_header_color', lightHeaderColor);
    localStorage.setItem('website_dark_header_color', darkHeaderColor);
    localStorage.setItem('website_show_demo_hub', String(showDemoHub));
    localStorage.setItem('website_title_case', titleCase);
    localStorage.setItem('website_carousel_images', JSON.stringify(carouselImages));
    if (onUpdateBranding) {
      onUpdateBranding(name, logoUrl, copyright, poweredBy, address, socials, themeColor, themeCustomColor, logoSize, logoShape, logoFit, logoBg, carouselImages);
    }
    showToast('Website branding, backgrounds, header colors, custom about-us narrative, custom logo rendering, and theme updated successfully!');
  };

  // Favorite toggle
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
      showToast('Removed from saved items.');
    } else {
      setFavorites([...favorites, id]);
      showToast('Added to saved items!');
    }
  };

  // Post Ad Function with Gemini AI API integration call (if configured)
  const handlePostAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPrice || !newDesc) {
      showToast('Please fill out the primary fields.');
      return;
    }

    const brandImgMap: Record<string, string> = {
      'apple': 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
      'bmw': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80',
      'sony': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      'canon': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
      'article': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80'
    };

    const defaultImg = newPhotos.length > 0 
      ? newPhotos[0] 
      : brandImgMap[newBrand.toLowerCase()] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';

    const newAd: Listing = {
      id: `lst-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      categoryId: newCat,
      subcategoryId: newSubcat,
      price: parseFloat(newPrice),
      negotiable: true,
      condition: newCondition,
      brand: newBrand || undefined,
      model: newModel || undefined,
      location: newLocation,
      latitude: 37.7749,
      longitude: -122.4194,
      photos: newPhotos.length > 0 ? newPhotos : [defaultImg],
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      sellerRating: currentUser.rating,
      sellerVerified: currentUser.verified,
      views: 0,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      boostStatus: 'none',
      verifiedListing: false
    };

    setListings([newAd, ...listings]);
    showToast('Ad published successfully!');
    
    // Reset Form
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setNewBrand('');
    setNewModel('');
    setNewPhotos([]);
    setAiSuggestions(null);

    // Switch to My Listings/Dashboard
    setCurrentView('dashboard');
  };

  // Add Photo url to current post
  const addPhotoUrl = () => {
    if (photoInput && photoInput.startsWith('http')) {
      setNewPhotos([...newPhotos, photoInput]);
      setPhotoInput('');
    } else {
      showToast('Please enter a valid HTTP image URL.');
    }
  };

  // Generate Ad Description or Pricing with Gemini AI proxy
  const callGeminiHelper = async (type: 'describe' | 'price' | 'category') => {
    if (!newTitle) {
      showToast('Please specify an item title first.');
      return;
    }
    setAiLoading(true);
    try {
      const response = await fetch('/api/gemini/helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: newTitle,
          brand: newBrand,
          condition: newCondition,
          description: newDesc
        })
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      
      if (type === 'describe' && data.description) {
        setNewDesc(data.description);
        showToast('Gemini description generated successfully!');
      } else if (type === 'price' && data.priceRange) {
        setAiSuggestions(prev => ({ ...prev, priceRange: data.priceRange }));
        showToast('Suggested price range received!');
      } else if (type === 'category' && data.categoryName) {
        setAiSuggestions(prev => ({ ...prev, suggestedCategory: data.categoryName }));
        
        // Map categoryName to actual category ID
        const catMap: Record<string, string> = {
          'Mobiles & Tablets': 'cat-mobiles',
          'Vehiles': 'cat-vehicles',
          'Vehicles': 'cat-vehicles',
          'Property': 'cat-property',
          'Electronics & Appliances': 'cat-electronics',
          'Jobs': 'cat-jobs',
          'Home & Furniture': 'cat-furniture'
        };
        const catId = catMap[data.categoryName] || catMap[Object.keys(catMap).find(k => k.toLowerCase().includes(data.categoryName.toLowerCase())) || ''];
        if (catId) {
          setNewCat(catId);
          showToast(`AI Auto-selected Category: ${data.categoryName}!`);
        } else {
          showToast(`AI Suggests: ${data.categoryName}`);
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback response inside sandbox if server hasn't rebooted yet or key is empty
      if (type === 'describe') {
        setNewDesc(`★ High Quality ${newTitle} ★\n\nCondition: ${newCondition.toUpperCase()}\n\nGreat value for money. Handled with supreme care, works absolutely perfectly with zero functional issues. Priced competitively for quick sale. Local pickup only.\n\nKey Highlights:\n- Pristine physical state\n- High durability & original build\n- Accessories included if applicable.`);
        showToast('Offline fallback description drafted.');
      } else if (type === 'price') {
        setAiSuggestions(prev => ({ ...prev, priceRange: `₹${Math.round(parseFloat(newPrice || '10000') * 0.8).toLocaleString('en-IN')} - ₹${Math.round(parseFloat(newPrice || '10000') * 1.15).toLocaleString('en-IN')}` }));
        showToast('Offline fallback price calculated.');
      } else if (type === 'category') {
        // Fallback guesser
        const tLower = newTitle.toLowerCase();
        let guessedCat = 'cat-electronics';
        let guessedName = 'Electronics & Appliances';
        if (tLower.includes('phone') || tLower.includes('iphone') || tLower.includes('tablet') || tLower.includes('ipad') || tLower.includes('galaxy')) {
          guessedCat = 'cat-mobiles';
          guessedName = 'Mobiles & Tablets';
        } else if (tLower.includes('car') || tLower.includes('bike') || tLower.includes('motorcycle') || tLower.includes('scooter') || tLower.includes('bmw') || tLower.includes('alloy')) {
          guessedCat = 'cat-vehicles';
          guessedName = 'Vehicles';
        } else if (tLower.includes('house') || tLower.includes('apartment') || tLower.includes('flat') || tLower.includes('rent') || tLower.includes('plot')) {
          guessedCat = 'cat-property';
          guessedName = 'Property';
        } else if (tLower.includes('job') || tLower.includes('developer') || tLower.includes('hiring') || tLower.includes('manager')) {
          guessedCat = 'cat-jobs';
          guessedName = 'Jobs';
        } else if (tLower.includes('sofa') || tLower.includes('bed') || tLower.includes('chair') || tLower.includes('table') || tLower.includes('furniture')) {
          guessedCat = 'cat-furniture';
          guessedName = 'Home & Furniture';
        }
        setNewCat(guessedCat);
        setAiSuggestions(prev => ({ ...prev, suggestedCategory: guessedName }));
        showToast(`AI Auto-selected Category (Local Fallback): ${guessedName}!`);
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger AI semantic search from backend proxy
  const triggerAiSearch = async (queryStr: string) => {
    if (!queryStr.trim()) {
      setAiSearchResults(null);
      return;
    }
    setIsAiSearchLoading(true);
    try {
      const response = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryStr, listings })
      });
      if (response.ok) {
        const data = await response.json();
        setAiSearchResults(data.matches || []);
        showToast("AI Semantic search completed.");
      }
    } catch (err) {
      console.error("AI search failed:", err);
    } finally {
      setIsAiSearchLoading(false);
    }
  };

  useEffect(() => {
    if (isAiSearchActive) {
      const delayDebounce = setTimeout(() => {
        triggerAiSearch(searchQuery);
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      setAiSearchResults(null);
    }
  }, [searchQuery, isAiSearchActive]);

  // AI Integrity Audit Scanner (Spam, Fraud & Duplicates check)
  const runAiIntegrityCheck = async () => {
    if (!newTitle || !newDesc || !newPrice) {
      showToast("Please fill title, price, and description first.");
      return;
    }
    setIsAnalyzingIntegrity(true);
    setAdIntegrityResult(null);
    try {
      const response = await fetch('/api/gemini/analyze-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          price: newPrice,
          condition: newCondition,
          brand: newBrand,
          otherListings: listings
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAdIntegrityResult(data);
        showToast("AI Ad Integrity audit completed!");
      }
    } catch (err) {
      console.error("AI check failed:", err);
    } finally {
      setIsAnalyzingIntegrity(false);
    }
  };

  // Run AI Image Enhancer simulator
  const runImageEnhancer = (url: string) => {
    if (!url) return;
    setIsEnhancingImage(true);
    setSelectedPhotoToEnhance(url);
    setTimeout(() => {
      setIsEnhancingImage(false);
      let enhancedUrl = url;
      if (url.includes('unsplash.com')) {
        enhancedUrl = url.replace(/q=\d+/, 'q=100').replace(/&fit=\w+/, '&fit=crop&sat=18&con=12&sharp=35');
      } else {
        enhancedUrl = url + (url.includes('?') ? '&' : '?') + 'ai_enhanced=true&hdr=active&upscale=4k';
      }
      setEnhancedPhotoMap(prev => ({ ...prev, [url]: enhancedUrl }));
      showToast("AI Studio: Brightness corrected, colors calibrated & upscaled to 4K!");
    }, 1500);
  };

  // Contact Seller / Create Chat
  const startChat = (listing: Listing) => {
    if (!currentUser) {
      setPendingView('chats');
      setPendingChatListing(listing);
      setShowAuthModal(true);
      return;
    }

    if (listing.sellerId === currentUser.id) {
      showToast('You cannot chat with yourself!');
      return;
    }

    const existingChat = chats.find(c => c.listingId === listing.id && c.buyerId === currentUser.id);
    if (existingChat) {
      setSelectedChat(existingChat);
      setCurrentView('chats');
      return;
    }

    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingPhoto: listing.photos[0],
      buyerId: currentUser.id,
      buyerName: currentUser.fullName,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      lastMessageText: `Hi ${listing.sellerName}, is this still available?`,
      lastMessageTime: 'Just now',
      unreadCount: 0
    };

    const welcomeMsg: Message = {
      id: `msg-${Date.now()}`,
      chatId: newChatId,
      senderId: currentUser.id,
      text: `Hi ${listing.sellerName}, is this still available?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: true
    };

    setChats([newChat, ...chats]);
    setMessages([...messages, welcomeMsg]);
    setSelectedChat(newChat);
    setCurrentView('chats');
    showToast('Chat session initialized!');
  };

  // Web Audio chime player for notifications
  const playNotificationSound = () => {
    if (!simulationSound) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playChime = (frequency: number, startTime: number, duration: number) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);
        
        gain.gain.setValueAtTime(0.06, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      playChime(587.33, now, 0.12); // D5
      playChime(880.00, now + 0.08, 0.25); // A5
    } catch (e) {
      console.warn('Audio play blocked or not supported:', e);
    }
  };

  // Realistic buyer messages
  const REALISTIC_SIMULATED_MESSAGES = [
    "Hi, is this still available? I can pick it up today.",
    "I'm very interested in this item! Is the price negotiable?",
    "What is the condition of the item? Any scratches or issues?",
    "Can we meet at a local metro station or a public market?",
    "Are you open to exchange offers, or only cash/UPI?",
    "I can offer ₹{price} for a quick deal. Let me know if that works!",
    "Great. I will be free in the evening. Can we connect around 6 PM?",
    "Could you share a couple of more live photos of the product?",
    "Is the warranty still valid? Do you have the original box/invoice?"
  ];

  // Trigger simulated incoming message in real-time
  const triggerSimulatedIncomingMessage = (customText?: string) => {
    if (!currentUser) return;

    const currentChats = chatsRef.current;
    const currentListings = listingsRef.current;

    const hasChats = currentChats.length > 0;
    const shouldUseExistingChat = hasChats && (Math.random() > 0.4 || !currentListings.length);

    if (shouldUseExistingChat) {
      const randomChat = currentChats[Math.floor(Math.random() * currentChats.length)];
      const isUserBuyer = currentUser.id === randomChat.buyerId;
      const otherId = isUserBuyer ? randomChat.sellerId : randomChat.buyerId;
      const otherName = isUserBuyer ? randomChat.sellerName : randomChat.buyerName;

      let messageText = customText;
      if (!messageText) {
        const randMsg = REALISTIC_SIMULATED_MESSAGES[Math.floor(Math.random() * REALISTIC_SIMULATED_MESSAGES.length)];
        messageText = randMsg.replace('{price}', Math.round(randomChat.listingPrice * 0.85).toLocaleString('en-IN'));
      }

      const newMsg: Message = {
        id: `msg-sim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        chatId: randomChat.id,
        senderId: otherId,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: false
      };

      setMessages(prev => [...prev, newMsg]);

      const isChatOpenAndActive = currentViewRef.current === 'chats' && selectedChatRef.current?.id === randomChat.id;
      
      setChats(prevChats => prevChats.map(c => {
        if (c.id === randomChat.id) {
          return {
            ...c,
            lastMessageText: messageText,
            lastMessageTime: 'Just now',
            unreadCount: isChatOpenAndActive ? 0 : (c.unreadCount || 0) + 1
          };
        }
        return c;
      }));

      if (!isChatOpenAndActive) {
        playNotificationSound();
        const newNotification = {
          id: `notif-${Date.now()}`,
          chatId: randomChat.id,
          senderName: otherName,
          listingTitle: randomChat.listingTitle,
          listingPhoto: randomChat.listingPhoto,
          text: messageText,
          timestamp: 'Just now'
        };
        setInAppNotifications(prev => [newNotification, ...prev]);
        setTimeout(() => {
          setInAppNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 6000);
      }
    } else {
      const userListings = currentListings.filter(l => l.sellerId === currentUser.id);
      let targetListing: Listing;
      let buyerId: string;
      let buyerName: string;
      let sellerId: string;
      let sellerName: string;

      if (userListings.length > 0 && Math.random() > 0.3) {
        targetListing = userListings[Math.floor(Math.random() * userListings.length)];
        const randomNames = ["Aarav Sharma", "Priya Patel", "Rajesh Kumar", "Neha Gupta", "Vikram Singh", "Anjali Verma"];
        buyerName = randomNames[Math.floor(Math.random() * randomNames.length)];
        buyerId = `user-sim-${Math.random().toString(36).substring(2, 8)}`;
        sellerId = currentUser.id;
        sellerName = currentUser.fullName;
      } else {
        const externalListings = currentListings.filter(l => l.sellerId !== currentUser.id);
        if (externalListings.length === 0) return;
        targetListing = externalListings[Math.floor(Math.random() * externalListings.length)];
        buyerId = currentUser.id;
        buyerName = currentUser.fullName;
        sellerId = targetListing.sellerId;
        sellerName = targetListing.sellerName;
      }

      const existingChat = currentChats.find(c => c.listingId === targetListing.id && c.buyerId === buyerId);
      if (existingChat) {
        triggerSimulatedIncomingMessage(customText);
        return;
      }

      const newChatId = `chat-sim-${Date.now()}`;
      
      let messageText = customText;
      if (!messageText) {
        const randMsg = REALISTIC_SIMULATED_MESSAGES[Math.floor(Math.random() * REALISTIC_SIMULATED_MESSAGES.length)];
        messageText = randMsg.replace('{price}', Math.round(targetListing.price * 0.85).toLocaleString('en-IN'));
      }

      const newChat: Chat = {
        id: newChatId,
        listingId: targetListing.id,
        listingTitle: targetListing.title,
        listingPrice: targetListing.price,
        listingPhoto: targetListing.photos && targetListing.photos.length > 0 ? targetListing.photos[0] : '',
        buyerId,
        buyerName,
        sellerId,
        sellerName,
        lastMessageText: messageText,
        lastMessageTime: 'Just now',
        unreadCount: 1
      };

      const newMsg: Message = {
        id: `msg-sim-init-${Date.now()}`,
        chatId: newChatId,
        senderId: buyerId === currentUser.id ? sellerId : buyerId,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: false
      };

      setChats(prev => [newChat, ...prev]);
      setMessages(prev => [...prev, newMsg]);
      playNotificationSound();

      const senderName = buyerId === currentUser.id ? sellerName : buyerName;
      const newNotification = {
        id: `notif-${Date.now()}`,
        chatId: newChatId,
        senderName,
        listingTitle: targetListing.title,
        listingPhoto: targetListing.photos && targetListing.photos.length > 0 ? targetListing.photos[0] : '',
        text: messageText,
        timestamp: 'Just now'
      };
      setInAppNotifications(prev => [newNotification, ...prev]);
      setTimeout(() => {
        setInAppNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 6000);
    }
  };

  // Send message inside chat
  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedChat) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: currentUser.id,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      seen: false
    };

    setMessages([...messages, newMsg]);
    
    // Update last message in Chat preview
    setChats(chats.map(c => {
      if (c.id === selectedChat.id) {
        return {
          ...c,
          lastMessageText: replyText,
          lastMessageTime: 'Just now'
        };
      }
      return c;
    }));

    const targetChatId = selectedChat.id;
    const senderId = selectedChat.sellerId === currentUser.id ? selectedChat.buyerId : selectedChat.sellerId;
    const senderName = selectedChat.sellerId === currentUser.id ? selectedChat.buyerName : selectedChat.sellerName;
    const listingTitle = selectedChat.listingTitle;
    const listingPhoto = selectedChat.listingPhoto;
    const originalText = replyText;

    setReplyText('');

    // Simulated Auto response from seller/buyer after 2 seconds
    setTimeout(() => {
      const autoReplyText = originalText.toLowerCase().includes('price') || originalText.toLowerCase().includes('offer')
        ? "I can lower the price slightly for a fast pickup. What price works for you?"
        : "Yes, we can meet up in a public place. Let me know what time works best!";
      
      const autoMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        chatId: targetChatId,
        senderId: senderId,
        text: autoReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        seen: false
      };

      setMessages(prev => [...prev, autoMsg]);

      // Check if chat is currently active in view
      const isActive = currentViewRef.current === 'chats' && selectedChatRef.current?.id === targetChatId;

      setChats(prevChats => prevChats.map(c => {
        if (c.id === targetChatId) {
          return {
            ...c,
            lastMessageText: autoReplyText,
            lastMessageTime: 'Just now',
            unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1
          };
        }
        return c;
      }));

      if (!isActive) {
        playNotificationSound();
        const newNotification = {
          id: `notif-${Date.now()}`,
          chatId: targetChatId,
          senderName: senderName,
          listingTitle: listingTitle,
          listingPhoto: listingPhoto,
          text: autoReplyText,
          timestamp: 'Just now'
        };
        setInAppNotifications(prev => [newNotification, ...prev]);
        setTimeout(() => {
          setInAppNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 6000);
      }
    }, 2000);
  };

  // Buy Sponsor Package / Boost Listing
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !selectedPlan || !boostingListing) return;

    setListings(listings.map(l => {
      if (l.id === boostingListing.id) {
        return {
          ...l,
          boostStatus: selectedPlan.id === 'plan-featured' ? 'featured' : 'boosted'
        };
      }
      return l;
    }));

    setCheckoutStep('success');
    showToast(`Ad sponsor completed! Standard invoices generated.`);
  };

  // Toggle Listings Views (Active/Sold) in Seller Dashboard
  const markAsSold = (id: string) => {
    setListings(listings.map(l => {
      if (l.id === id) {
        return { ...l, status: l.status === 'sold' ? 'active' : 'sold' };
      }
      return l;
    }));
    showToast('Listing status modified!');
  };

  // Logistics & Postal Serviceability Calculator
  const handleCalculateServiceability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originPincode.trim() || !destPincode.trim()) {
      showToast("Please enter both origin and destination pincodes");
      return;
    }
    
    // Look up pincodes in directory
    const originRecord = INDIA_LOCATIONS.find(loc => loc.pincode === originPincode.trim());
    const destRecord = INDIA_LOCATIONS.find(loc => loc.pincode === destPincode.trim());
    
    let distance = 0;
    let serviceable = true;
    let carrier = "India Post Express Parcel";
    let cost = 40;
    let days = 3;
    
    if (originRecord && destRecord) {
      const latDiff = originRecord.latitude - destRecord.latitude;
      const lngDiff = originRecord.longitude - destRecord.longitude;
      distance = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111);
    } else {
      const hash = (parseInt(originPincode) + parseInt(destPincode)) % 400;
      distance = hash + 120;
    }
    
    if (distance < 50) {
      days = 1;
      cost = 60;
      carrier = "Local Hyperlocal Courier (Delhivery / Dunzo)";
    } else if (distance < 300) {
      days = 2;
      cost = 85;
      carrier = "Blue Dart Ground Express";
    } else if (distance < 1000) {
      days = 3;
      cost = 140;
      carrier = "Express Speed Post (India Post)";
    } else {
      days = 4;
      cost = 210;
      carrier = "DTDC Air Premium Courier";
    }
    
    setCalcResult({
      distance,
      days,
      cost,
      serviceable,
      carrier
    });
    showToast("Postal logistics analyzed successfully!");
  };

  // Filtering Listings
  const filteredListings = listings.filter(l => {
    // Search keyword (Semantic AI Search or basic text)
    let matchesSearch = true;
    if (searchQuery.trim()) {
      if (isAiSearchActive && aiSearchResults) {
        matchesSearch = aiSearchResults.some(res => res.id === l.id && res.score >= 15);
      } else {
        matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (l.brand && l.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        false;
      }
    }
    // Category match
    const matchesCategory = selectedCategory === 'all' || l.categoryId === selectedCategory;
    // Price match
    const matchesPrice = l.price <= priceMax;
    // Condition match
    const matchesCondition = filterCondition === 'all' || l.condition === filterCondition;
    // Verified match
    const matchesVerified = !onlyVerified || l.verifiedListing;
    // Location match (Check if l.location matches searchLocation)
    let matchesLocation = true;
    if (searchLocation && searchLocation !== 'All India') {
      if (drilldownState !== 'all') {
        const pincodeMatch = l.location.match(/\((\d{6})\)/);
        const listingPincode = pincodeMatch ? pincodeMatch[1] : '';
        const locRecord = listingPincode ? INDIA_LOCATIONS.find(loc => loc.pincode === listingPincode) : null;
        
        if (locRecord) {
          // Check state
          const stateMatches = locRecord.state.toLowerCase() === drilldownState.toLowerCase();
          
          // Check city
          let cityMatches = true;
          if (drilldownCity !== 'all') {
            const stateObj = INDIA_STATES_DIRECTORY.find(s => s.stateName.toLowerCase() === drilldownState.toLowerCase());
            const cityObj = stateObj?.cities.find(c => c.cityName.toLowerCase() === drilldownCity.toLowerCase());
            if (cityObj) {
              cityMatches = cityObj.pincodes.some(p => p.code === listingPincode);
            } else {
              cityMatches = locRecord.district.toLowerCase() === drilldownCity.toLowerCase() || 
                            l.location.toLowerCase().includes(drilldownCity.toLowerCase());
            }
          }
          
          // Check area
          let areaMatches = true;
          if (drilldownArea !== 'all') {
            areaMatches = listingPincode === drilldownArea;
          }
          
          matchesLocation = stateMatches && cityMatches && areaMatches;
        } else {
          // Fallback to text matching
          matchesLocation = l.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
                            searchLocation.toLowerCase().includes(l.location.toLowerCase());
        }
      } else {
        // Fallback to normal text/pincode matching
        matchesLocation = l.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
                          searchLocation.toLowerCase().includes(l.location.toLowerCase()) ||
                          (function() {
                            const match = l.location.match(/\((\d{6})\)/);
                            if (match && match[1]) {
                              return searchLocation.includes(match[1]);
                            }
                            return false;
                          })();
      }
    }

    return matchesSearch && matchesCategory && matchesPrice && matchesCondition && matchesVerified && matchesLocation && l.status !== 'paused';
  });

  const displayListings = React.useMemo(() => {
    if (isAiSearchActive && aiSearchResults) {
      return [...filteredListings].sort((a, b) => {
        const scoreA = aiSearchResults.find(item => item.id === a.id)?.score || 0;
        const scoreB = aiSearchResults.find(item => item.id === b.id)?.score || 0;
        return scoreB - scoreA;
      });
    }
    return filteredListings;
  }, [filteredListings, isAiSearchActive, aiSearchResults]);

  const customBackgroundStyles = React.useMemo(() => {
    const hexToHslLocal = (hex: string) => {
      hex = hex.replace(/^#/, '');
      if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      let r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
      let g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
      let b = parseInt(hex.substring(4, 6), 16) / 255 || 0;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
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
    };

    const hslToHexLocal = (h: number, s: number, l: number) => {
      s /= 100; l /= 100;
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
    };

    let darkPanelColor = '#111827';
    let darkInputColor = '#1f2937';
    let darkBorderColor = '#374151';

    try {
      const { h, s, l } = hexToHslLocal(websiteDarkBgColor);
      darkPanelColor = hslToHexLocal(h, Math.min(s + 3, 24), Math.min(l + 5, 14));
      darkInputColor = hslToHexLocal(h, Math.min(s + 5, 26), Math.min(l + 9, 18));
      darkBorderColor = hslToHexLocal(h, Math.min(s + 3, 20), Math.min(l + 12, 22));
    } catch (e) {}

    return (
      <style>{`
        /* Dynamic Light Background Overrides */
        .custom-dynamic-bg {
          background-color: ${websiteLightBgColor} !important;
        }
        /* Dynamic Dark Background Overrides */
        .dark .custom-dynamic-bg {
          background-color: ${websiteDarkBgColor} !important;
        }

        /* High-harmony panel adaptations */
        .dark .bg-slate-950 {
          background-color: ${websiteDarkBgColor} !important;
        }
        .dark .bg-slate-900 {
          background-color: ${darkPanelColor} !important;
        }
        .dark .bg-slate-800 {
          background-color: ${darkInputColor} !important;
        }
        
        /* Harmonious borders and items in dark mode */
        .dark .border-slate-800 {
          border-color: ${darkBorderColor}33 !important;
        }
        .dark .border-slate-850 {
          border-color: ${darkBorderColor}4d !important;
        }

        /* Dynamic Header Overrides */
        .custom-header-bg {
          background-color: ${websiteLightHeaderColor} !important;
        }
        .dark .custom-header-bg {
          background-color: ${websiteDarkHeaderColor} !important;
        }
      `}</style>
    );
  }, [websiteLightBgColor, websiteDarkBgColor, websiteLightHeaderColor, websiteDarkHeaderColor]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-sm font-semibold text-slate-500 animate-pulse">Verifying secure platform access...</div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen custom-dynamic-bg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {customBackgroundStyles}
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-slide-in">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <header className="sticky top-0 z-40 custom-header-bg border-b border-slate-200 dark:border-slate-800 shadow-xs px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors duration-300">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => { setSelectedListing(null); setCurrentView('buy'); }}>
          <div className={getLogoContainerClass(false)}>
            {websiteLogoUrl ? (
              <img src={websiteLogoUrl} alt="Logo" className={getLogoImgClass()} />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                <Tag className="w-5.5 h-5.5 text-white" />
              </div>
            )}
          </div>
          <div>
            {websiteName.toUpperCase() === 'LOCALMARKET' ? (
              <>
                <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white">LOCAL</span>
                <span className="text-lg font-black tracking-tight text-blue-600 dark:text-blue-400">MARKET</span>
              </>
            ) : (
              <span className="text-lg font-black tracking-tight text-blue-600 dark:text-blue-400">
                {websiteTitleCase === 'as_typed' 
                  ? websiteName 
                  : websiteTitleCase === 'lowercase' 
                  ? websiteName.toLowerCase() 
                  : websiteName.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Search bar inside header (Only active on browse mode) */}
        {currentView === 'buy' && !selectedListing && (
          <div className="hidden lg:flex flex-1 max-w-2xl bg-slate-100 rounded-xl px-4 py-2 items-center gap-2.5 border border-transparent focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10 transition-all duration-200">
            <div className="relative flex items-center gap-1.5 text-slate-500 border-r border-slate-200 pr-2.5 max-w-[240px] w-full">
              <MapPin className="w-4 h-4 shrink-0 text-blue-600 animate-pulse" />
              <input 
                type="text" 
                value={searchLocation} 
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchLocation(val);
                  if (val.trim()) {
                    setSearchLocationSuggestions(findLocationByQuery(val));
                  } else {
                    setSearchLocationSuggestions(INDIA_LOCATIONS.slice(0, 5));
                  }
                  setShowSearchSuggestions(true);
                }}
                onFocus={() => {
                  if (searchLocation.trim()) {
                    setSearchLocationSuggestions(findLocationByQuery(searchLocation));
                  } else {
                    setSearchLocationSuggestions(INDIA_LOCATIONS.slice(0, 5));
                  }
                  setShowSearchSuggestions(true);
                }}
                placeholder="PIN code or city..."
                className="bg-transparent text-xs outline-none font-semibold w-full text-slate-800"
              />
              {showSearchSuggestions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSearchSuggestions(false)} />
                  <div className="absolute top-full left-0 mt-3 w-[290px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                    
                    {/* Popover Header Tabs */}
                    <div className="flex bg-slate-50 border-b border-slate-100">
                      <button
                        type="button"
                        onClick={() => setLocationSearchTab('search')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider text-center border-r border-slate-100 ${
                          locationSearchTab === 'search' ? 'bg-white text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        🔍 PIN Search
                      </button>
                      <button
                        type="button"
                        onClick={() => setLocationSearchTab('drilldown')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider text-center ${
                          locationSearchTab === 'drilldown' ? 'bg-white text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {"🌐 Country > State Drill"}
                      </button>
                    </div>

                    {locationSearchTab === 'search' ? (
                      <>
                        <div className="p-2.5 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
                          <span>India Postal Directory</span>
                          <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-bold">Select PIN</span>
                        </div>
                        {searchLocationSuggestions.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500 font-medium">
                            No pincodes or cities found. Try checking state directory.
                          </div>
                        ) : (
                          searchLocationSuggestions.map((item) => (
                            <button
                              key={item.pincode}
                              type="button"
                              onClick={() => {
                                setSearchLocation(`${item.officeName}, ${item.district} (${item.pincode})`);
                                // Sync cascading fields on selection
                                const stateName = item.state;
                                const foundState = INDIA_STATES_DIRECTORY.find(s => s.stateName.toLowerCase() === stateName.toLowerCase());
                                let foundCity = 'all';
                                if (foundState) {
                                  const cityObj = foundState.cities.find(c => c.pincodes.some(p => p.code === item.pincode));
                                  if (cityObj) {
                                    foundCity = cityObj.cityName;
                                  }
                                }
                                setDrilldownState(foundState ? foundState.stateName : 'all');
                                setDrilldownCity(foundCity);
                                setDrilldownArea(item.pincode);
                                setShowSearchSuggestions(false);
                              }}
                              className="w-full text-left p-3 hover:bg-slate-50/80 transition-colors flex items-start gap-2 text-xs"
                            >
                              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-extrabold text-slate-800">{item.officeName}, {item.district}</div>
                                <div className="text-[10px] text-slate-500 font-semibold font-mono">{item.state} • Pincode <span className="font-black text-slate-900">{item.pincode}</span></div>
                              </div>
                            </button>
                          ))
                        )}
                      </>
                    ) : (
                      // Country > State > City > Area Drilldown form
                      <div className="p-3 space-y-2.5 text-xs bg-white">
                        <div className="p-2 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                          <span className="font-extrabold text-blue-900">🇮🇳 Country: India</span>
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase">All India</span>
                        </div>
                        
                        {/* State selector */}
                        <div className="space-y-1">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">State</div>
                          <select
                            value={drilldownState}
                            onChange={(e) => {
                              const s = e.target.value;
                              setDrilldownState(s);
                              setDrilldownCity('all');
                              setDrilldownArea('all');
                              if (s === 'all') {
                                setSearchLocation('All India');
                              } else {
                                setSearchLocation(s);
                              }
                            }}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none bg-slate-50 font-semibold text-slate-800 focus:border-blue-500"
                          >
                            <option value="all">🇮🇳 All States</option>
                            {INDIA_STATES_DIRECTORY.map(s => (
                              <option key={s.stateName} value={s.stateName}>{s.stateName}</option>
                            ))}
                          </select>
                        </div>

                        {/* City selector */}
                        <div className="space-y-1">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">City</div>
                          <select
                            value={drilldownCity}
                            disabled={drilldownState === 'all'}
                            onChange={(e) => {
                              const c = e.target.value;
                              setDrilldownCity(c);
                              setDrilldownArea('all');
                              if (c === 'all') {
                                setSearchLocation(drilldownState);
                              } else {
                                setSearchLocation(`${c}, ${drilldownState}`);
                              }
                            }}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none bg-slate-50 font-semibold text-slate-800 disabled:opacity-50 focus:border-blue-500"
                          >
                            <option value="all">All Cities</option>
                            {drilldownState !== 'all' && INDIA_STATES_DIRECTORY.find(st => st.stateName === drilldownState)?.cities.map(ct => (
                              <option key={ct.cityName} value={ct.cityName}>{ct.cityName}</option>
                            ))}
                          </select>
                        </div>

                        {/* Area selector */}
                        <div className="space-y-1">
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Area / Pincode</div>
                          <select
                            value={drilldownArea}
                            disabled={drilldownCity === 'all'}
                            onChange={(e) => {
                              const code = e.target.value;
                              setDrilldownArea(code);
                              if (code === 'all') {
                                setSearchLocation(`${drilldownCity}, ${drilldownState}`);
                              } else {
                                const stObj = INDIA_STATES_DIRECTORY.find(s => s.stateName === drilldownState);
                                const ctObj = stObj?.cities.find(c => c.cityName === drilldownCity);
                                const pinObj = ctObj?.pincodes.find(p => p.code === code);
                                if (pinObj) {
                                  setSearchLocation(`${pinObj.area}, ${drilldownCity} (${pinObj.code})`);
                                }
                              }
                            }}
                            className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none bg-slate-50 font-semibold text-slate-800 disabled:opacity-50 focus:border-blue-500"
                          >
                            <option value="all">All Areas</option>
                            {drilldownCity !== 'all' && drilldownState !== 'all' && 
                              INDIA_STATES_DIRECTORY.find(s => s.stateName === drilldownState)
                                ?.cities.find(c => c.cityName === drilldownCity)
                                ?.pincodes.map(p => (
                                  <option key={p.code} value={p.code}>{p.area} ({p.code})</option>
                                ))
                            }
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowSearchSuggestions(false);
                            showToast("Hierarchical location applied!");
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition"
                        >
                          Apply Filter
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder={isAiSearchActive ? "Describe what you want (e.g. pristine condition gaming phone below 50k)..." : "Search cars, iPhones, electronics..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full outline-none font-medium text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => {
                setIsAiSearchActive(!isAiSearchActive);
                showToast(!isAiSearchActive ? "AI Semantic Search activated!" : "Standard Keyword search activated.");
              }}
              className={`px-2 py-0.5 text-[8.5px] uppercase tracking-wider font-extrabold rounded-md transition-all duration-200 cursor-pointer shrink-0 border flex items-center gap-1 ${
                isAiSearchActive
                  ? "bg-indigo-600 border-indigo-700 text-white shadow-xs animate-pulse"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
              }`}
              title="Activate semantic match leveraging Gemini AI"
            >
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
              <span>{isAiSearchActive ? "AI SEARCH: ON" : "AI SEARCH: OFF"}</span>
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Dark Mode"
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-all border border-transparent hover:border-blue-100 dark:hover:border-slate-700 shrink-0"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-500 animate-spin-once" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          <button 
            onClick={() => handleNavigate('buy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${currentView === 'buy' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
          >
            Buyer
          </button>
          
          <button 
            onClick={() => handleNavigate('chats')}
            className={`relative p-2 rounded-xl cursor-pointer transition-all ${currentView === 'chats' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MessageSquare className="w-5 h-5" />
            {chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                {chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
              </span>
            )}
          </button>

          {/* Admin panel controls shifted to footer */}

          <button 
            onClick={() => handleNavigate('dashboard')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Seller
          </button>

          <button 
            onClick={() => handleNavigate('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${currentView === 'directory' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Pincode Directory
          </button>

          {/* Post Ad CTA */}
          <button 
            onClick={() => handleNavigate('sell')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-xs transition-all shadow-[0_4px_12px_rgba(0,102,255,0.2)] hover:shadow-[0_6px_16px_rgba(0,102,255,0.3)] cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>POST AD</span>
          </button>

          {/* Login/Logout user session at extreme right corner with a subtle left divider */}
          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 ml-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
                {currentUser.profilePhotoUrl || currentUser.avatarUrl ? (
                  <img src={currentUser.profilePhotoUrl || currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                )}
              </div>
              <div className="hidden md:block text-left shrink-0 max-w-[100px]">
                <div className="text-[10px] font-black leading-none text-slate-800 dark:text-slate-200 truncate">{currentUser.fullName}</div>
                <div className="text-[8px] font-bold leading-none text-slate-400 uppercase tracking-wider mt-0.5 truncate">{currentUser.role}</div>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  setToken(null);
                  setCurrentUser(null);
                  setCurrentView('buy');
                  showToast("Logged out of secure session successfully.");
                }}
                title="Secure Logout"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer transition-all border border-transparent hover:border-rose-100 shrink-0 ml-1"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="border-l border-slate-200 dark:border-slate-800 pl-3 ml-1 shrink-0">
              <button
                onClick={() => {
                  setPendingView(null);
                  setShowAuthModal(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-blue-600/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 bg-slate-50">
        
        {/* 1. DISCOVERY VIEW */}
        {currentView === 'buy' && !selectedListing && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Top Interactive Carousel Slider (configurable up to 6 custom images) */}
            {websiteCarouselImages && websiteCarouselImages.length > 0 && (
              <div id="home-carousel-slider" className="relative w-full h-[220px] md:h-[300px] rounded-[24px] overflow-hidden shadow-lg bg-slate-900 group">
                {/* Background Slides */}
                <div className="absolute inset-0 w-full h-full transition-all duration-700 ease-in-out">
                  <img 
                    src={websiteCarouselImages[activeSlideIndex]} 
                    className="w-full h-full object-cover select-none transition-all duration-700 scale-102 filter brightness-[0.75] dark:brightness-[0.65]" 
                    alt={`Slide ${activeSlideIndex + 1}`}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none"></div>

                {/* Content Overlay */}
                <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-6 md:p-10 text-white z-10 max-w-xl space-y-2 md:space-y-4">
                  <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold rounded-full uppercase tracking-wider w-fit">
                    {activeSlideIndex === 0 ? 'Featured Showcase' : activeSlideIndex === 1 ? 'Safe Trading' : 'Exclusive Collection'}
                  </span>
                  <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
                    {activeSlideIndex === 0 ? 'Discover Premium Local Goods' : activeSlideIndex === 1 ? 'Verified Secure Transactions' : 'Unmatched Real Value Today'}
                  </h2>
                  <p className="text-[11px] md:text-xs text-slate-300 leading-relaxed max-w-sm hidden sm:block">
                    {activeSlideIndex === 0 
                      ? 'Browse, bid, or buy instantly from handpicked local sellers in your exact postal zone. Safe, fast, and reliable.' 
                      : activeSlideIndex === 1 
                      ? 'Every business partner is verified using double-factor authentication. Deal directly without middlemen friction.' 
                      : 'Upgrade to a gold booster package to get your listing on this top slider carousel with 10x maximum user engagement.'}
                  </p>

                  <div className="pt-1 flex items-center gap-3">
                    <button 
                      onClick={() => handleNavigate('sell')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-xs uppercase tracking-wide shadow-md transition cursor-pointer"
                    >
                      Start Selling
                    </button>
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 font-bold rounded-xl text-xs uppercase tracking-wide transition cursor-pointer"
                    >
                      Explore All
                    </button>
                  </div>
                </div>

                {/* Prev & Next Controls */}
                {websiteCarouselImages.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideIndex(prev => (prev - 1 + websiteCarouselImages.length) % websiteCarouselImages.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer focus:outline-none"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlideIndex(prev => (prev + 1) % websiteCarouselImages.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer focus:outline-none"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dot Indicators */}
                {websiteCarouselImages.length > 1 && (
                  <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
                    {websiteCarouselImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeSlideIndex === idx ? 'bg-blue-500 w-6' : 'bg-white/40 hover:bg-white/60'}`}
                      ></button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-Header Categories Selector */}
            <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200 pb-1 scrollbar-none">
              <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-1 py-3 text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative ${selectedCategory === 'all' ? 'text-blue-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-blue-600 after:rounded-full' : 'text-slate-500 hover:text-slate-800'}`}
              >
                ALL CATEGORIES
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-1 py-3 text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative uppercase ${selectedCategory === cat.id ? 'text-blue-600 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-blue-600 after:rounded-full' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Filters and Listings Grid */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Sidebar Filters */}
              <div className="w-full lg:w-64 shrink-0 bg-white border border-slate-100 rounded-2xl p-5 space-y-5 h-fit shadow-sm">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    Filters
                  </span>
                  <button 
                    onClick={() => {
                      setPriceMax(10000000);
                      setFilterCondition('all');
                      setOnlyVerified(false);
                      setSearchQuery('');
                      setDrilldownState('all');
                      setDrilldownCity('all');
                      setDrilldownArea('all');
                      setSearchLocation('All India');
                      showToast("All filters and locations reset!");
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>

                {/* Price Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Max Budget (₹{priceMax.toLocaleString('en-IN')})</label>
                  <input 
                    type="range" 
                    min="500" 
                    max="10000000" 
                    step="500"
                    value={priceMax > 10000000 ? 10000000 : priceMax} 
                    onChange={(e) => setPriceMax(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>₹500</span>
                    <span>₹1,00,00,000+</span>
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Item Condition</label>
                  <select 
                    value={filterCondition} 
                    onChange={(e) => setFilterCondition(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="all">Any Condition</option>
                    <option value="new">New / Unopened</option>
                    <option value="like_new">Like New / Mint</option>
                    <option value="good">Good / Used</option>
                    <option value="fair">Fair / Heavily Used</option>
                  </select>
                </div>

                {/* Verified Sellers Toggle */}
                <div className="flex items-center justify-between pt-2 pb-2">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800">Verified Ads Only</div>
                    <div className="text-[10px] text-slate-400">Show verified items</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={onlyVerified}
                    onChange={(e) => setOnlyVerified(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Hierarchical Location Selector (Country > State > City > Area) */}
                <div className="border-t border-slate-100 pt-4 space-y-3.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">India Location Hierarchy</span>
                  </div>

                  {/* Country Level */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 flex items-center justify-between shadow-2xs">
                      <span>🇮🇳 India (All India)</span>
                      <span className="text-[8px] bg-blue-50 text-blue-600 border border-blue-100 px-1 py-0.5 rounded font-black uppercase">Covered</span>
                    </div>
                  </div>

                  {/* State Level */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">State</label>
                    <select
                      value={drilldownState}
                      onChange={(e) => {
                        const s = e.target.value;
                        setDrilldownState(s);
                        setDrilldownCity('all');
                        setDrilldownArea('all');
                        if (s === 'all') {
                          setSearchLocation('All India');
                        } else {
                          setSearchLocation(s);
                        }
                      }}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none bg-white font-semibold text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition shadow-2xs cursor-pointer"
                    >
                      <option value="all">🇮🇳 All States</option>
                      {INDIA_STATES_DIRECTORY.map(s => (
                        <option key={s.stateName} value={s.stateName}>{s.stateName}</option>
                      ))}
                    </select>
                  </div>

                  {/* City Level */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                    <select
                      value={drilldownCity}
                      disabled={drilldownState === 'all'}
                      onChange={(e) => {
                        const c = e.target.value;
                        setDrilldownCity(c);
                        setDrilldownArea('all');
                        if (c === 'all') {
                          setSearchLocation(drilldownState);
                        } else {
                          setSearchLocation(`${c}, ${drilldownState}`);
                        }
                      }}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 font-semibold text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition shadow-2xs cursor-pointer"
                    >
                      <option value="all">All Cities</option>
                      {drilldownState !== 'all' && INDIA_STATES_DIRECTORY.find(st => st.stateName === drilldownState)?.cities.map(ct => (
                        <option key={ct.cityName} value={ct.cityName}>{ct.cityName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Area Level */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Area & PIN Code</label>
                    <select
                      value={drilldownArea}
                      disabled={drilldownCity === 'all'}
                      onChange={(e) => {
                        const code = e.target.value;
                        setDrilldownArea(code);
                        if (code === 'all') {
                          setSearchLocation(`${drilldownCity}, ${drilldownState}`);
                        } else {
                          const stObj = INDIA_STATES_DIRECTORY.find(s => s.stateName === drilldownState);
                          const ctObj = stObj?.cities.find(c => c.cityName === drilldownCity);
                          const pinObj = ctObj?.pincodes.find(p => p.code === code);
                          if (pinObj) {
                            setSearchLocation(`${pinObj.area}, ${drilldownCity} (${pinObj.code})`);
                          }
                        }
                      }}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400 font-semibold text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition shadow-2xs cursor-pointer"
                    >
                      <option value="all">All Areas</option>
                      {drilldownCity !== 'all' && drilldownState !== 'all' && 
                        INDIA_STATES_DIRECTORY.find(s => s.stateName === drilldownState)
                          ?.cities.find(c => c.cityName === drilldownCity)
                          ?.pincodes.map(p => (
                            <option key={p.code} value={p.code}>{p.area} ({p.code})</option>
                          ))
                      }
                    </select>
                  </div>

                  {/* Reset Location selection shortcut */}
                  {(drilldownState !== 'all' || searchLocation !== 'All India') && (
                    <button
                      type="button"
                      onClick={() => {
                        setDrilldownState('all');
                        setDrilldownCity('all');
                        setDrilldownArea('all');
                        setSearchLocation('All India');
                        showToast("Cleared location filters.");
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all duration-200"
                    >
                      Clear Location Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Listings Grid */}
              <div className="flex-1 space-y-5">
                
                {/* INTERACTIVE PERFORMANCE CENTER (Core Web Vitals, CDN, Caching, Lazy-Loading) */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-blue-500/25 rounded-lg border border-blue-500/40">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                        </span>
                        <h4 className="font-black text-sm uppercase tracking-wider">Dynamic Performance Optimization Engine</h4>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1 leading-snug">Toggle performance modes and measure sub-millisecond query caching resolution times.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-right">
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Query Latency:</span>
                      <span className="text-xs font-mono font-black text-emerald-400">{queryLatency}ms</span>
                    </div>
                  </div>

                  {/* Latency and Caching Status Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Cache Resolver Status</span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`w-2 h-2 rounded-full animate-ping ${
                          cacheStatus === 'memory_hit' ? 'bg-emerald-400' : cacheStatus === 'disk_hit' ? 'bg-blue-400' : 'bg-amber-400'
                        }`}></span>
                        <span className={`text-xs font-black uppercase tracking-wider ${
                          cacheStatus === 'memory_hit' ? 'text-emerald-400' : cacheStatus === 'disk_hit' ? 'text-blue-400' : 'text-amber-400'
                        }`}>
                          {cacheStatus === 'memory_hit' ? 'Memory Cache Hit' : cacheStatus === 'disk_hit' ? 'Local Disk Cache' : 'Platform Direct DB'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400">
                        {cacheStatus === 'memory_hit' ? 'Sub-millisecond query resolved instantly in local memory.' : cacheStatus === 'disk_hit' ? 'Parsed from local fast indexed-db model repository.' : 'Platform cold start db read resolved in real-time.'}
                      </p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Edge POP CDN Delivery</span>
                      <div className="text-xs font-black text-slate-200 pt-0.5 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>Cloudflare Edge DELPOP</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Page cached globally across Delhi edge routers for instant TTFB response.</p>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black">Pre-rendering Context</span>
                      <div className="text-xs font-black text-amber-400 pt-0.5 flex items-center gap-1">
                        <Code className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        <span>SSR & SSG pre-rendered</span>
                      </div>
                      <p className="text-[9px] text-slate-400">Crawler bots parse statically pre-rendered catalog trees with ease.</p>
                    </div>

                  </div>

                  {/* Switchers and Optimizers Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5 text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Feed Mode:</span>
                      <div className="flex bg-white/10 p-1 rounded-lg border border-white/10">
                        <button 
                          type="button"
                          onClick={() => { setFeedMode('pagination'); showToast("Switched to paginated browse view!"); }}
                          className={`px-3 py-1 font-bold rounded-md transition cursor-pointer text-[10px] uppercase tracking-wide ${feedMode === 'pagination' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'}`}
                        >
                          Pagination (6 per page)
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setFeedMode('infinite'); setVisibleCount(6); showToast("Switched to infinite scroll feed!"); }}
                          className={`px-3 py-1 font-bold rounded-md transition cursor-pointer text-[10px] uppercase tracking-wide ${feedMode === 'infinite' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'}`}
                        >
                          Infinite Scroll
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Lazy Loading Toggle */}
                      <button 
                        type="button"
                        onClick={() => { setIsLazyLoadingActive(!isLazyLoadingActive); showToast(isLazyLoadingActive ? "Lazy loading disabled." : "Lazy loading active: CLS layout shifts minimized!"); }}
                        className={`px-2.5 py-1 rounded-lg border font-bold text-[9.5px] uppercase tracking-wider flex items-center gap-1 transition-all ${
                          isLazyLoadingActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isLazyLoadingActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>Lazy Load: {isLazyLoadingActive ? 'ON' : 'OFF'}</span>
                      </button>

                      {/* WebP Format Toggle */}
                      <button 
                        type="button"
                        onClick={() => { setIsWebpEnabled(!isWebpEnabled); showToast(isWebpEnabled ? "Original heavy images enabled." : "WebP compression active: 82% data payload savings!"); }}
                        className={`px-2.5 py-1 rounded-lg border font-bold text-[9.5px] uppercase tracking-wider flex items-center gap-1 transition-all ${
                          isWebpEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isWebpEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>Next-Gen WebP: {isWebpEnabled ? 'ACTIVE' : 'RAW JPG'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Core Web Vitals diagnostics pill */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 border border-slate-100 rounded-xl shadow-xs text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span>Showing <strong className="text-slate-800">{displayListings.length}</strong> listings in <strong className="text-slate-800">{searchLocation}</strong></span>
                    {isQueryLoading && (
                      <span className="flex items-center gap-1 text-blue-600 font-bold ml-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Querying...</span>
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">LCP: <strong className="text-emerald-600 font-black">{isLazyLoadingActive ? '1.1s' : '2.9s'}</strong></span>
                    <span className="flex items-center gap-1">CLS: <strong className="text-emerald-600 font-black">{isLazyLoadingActive ? '0.01' : '0.18'}</strong></span>
                    <span className="flex items-center gap-1">FID: <strong className="text-emerald-600 font-black">12ms</strong></span>
                  </div>
                </div>

                {isQueryLoading ? (
                  /* PERFORMANCE SKELETON LOADER (Demonstrating Fast UI Rendering) */
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3].map(sk => (
                      <div key={sk} className="bg-white border border-slate-100 rounded-2xl h-[360px] overflow-hidden p-4 flex flex-col justify-between animate-pulse">
                        <div className="bg-slate-100 w-full h-40 rounded-xl"></div>
                        <div className="space-y-2 mt-4 flex-1">
                           <div className="bg-slate-100 w-24 h-5 rounded"></div>
                           <div className="bg-slate-100 w-full h-4 rounded"></div>
                           <div className="bg-slate-100 w-3/4 h-4 rounded"></div>
                        </div>
                        <div className="bg-slate-100 w-full h-10 rounded-lg mt-4"></div>
                      </div>
                    ))}
                  </div>
                ) : displayListings.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-800">No matching listings</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      We couldn't find any items matching your budget or search terms. Try adjusting your filters or expanding your keyword terms!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {(feedMode === 'pagination' 
                        ? displayListings.slice((currentPage - 1) * pageSize, currentPage * pageSize) 
                        : displayListings.slice(0, visibleCount)
                      ).map(listing => {
                        const isFeatured = listing.boostStatus === 'featured';
                        const isBoosted = listing.boostStatus === 'boosted';
                        
                        return (
                          <div 
                            key={listing.id}
                            onClick={() => setSelectedListing(listing)}
                            className={`group bg-white border rounded-2xl overflow-hidden cursor-pointer transition hover:shadow-lg flex flex-col relative h-[360px] ${
                              isFeatured ? 'border-amber-400 ring-2 ring-amber-400/25 shadow-amber-50' : 'border-slate-100'
                            }`}
                          >
                            {/* Sponsorship Banner / Boost Tags */}
                            {isFeatured && (
                              <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <Award className="w-3.5 h-3.5" />
                                <span>Featured</span>
                              </span>
                            )}
                            {isBoosted && (
                              <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3 h-3 animate-pulse" />
                                <span>Boosted</span>
                              </span>
                            )}

                            {/* Favorite button */}
                            <button 
                              onClick={(e) => toggleFavorite(listing.id, e)}
                              className="absolute top-3 right-3 z-10 bg-white/95 hover:bg-white p-1.5 rounded-full shadow-md transition"
                            >
                              <Heart className={`w-4 h-4 ${favorites.includes(listing.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                            </button>

                            {/* Image Container with native lazy loading & aspect ratio safety */}
                            <div className="h-44 overflow-hidden bg-slate-100 relative">
                              <img 
                                src={isWebpEnabled ? `${listing.photos[0]}&fm=webp&q=70` : listing.photos[0]} 
                                alt={listing.title}
                                loading={isLazyLoadingActive ? "lazy" : "eager"}
                                width="350"
                                height="176"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              <div className="absolute bottom-2.5 left-2.5 bg-slate-900/70 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                                {listing.condition.replace('_', ' ')}
                              </div>
                              {isWebpEnabled && (
                                <div className="absolute bottom-2.5 right-2.5 bg-emerald-600/90 backdrop-blur-xs px-1.5 py-0.5 rounded-lg text-[8px] font-bold text-white uppercase tracking-wider">
                                  webp (compressed)
                                </div>
                              )}
                            </div>

                            {/* Info Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between">
                                  <span className="text-lg font-black text-slate-900">₹{listing.price.toLocaleString('en-IN')}</span>
                                  {listing.negotiable && (
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-1.5 py-0.5 rounded font-bold">Negotiable</span>
                                  )}
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                                  {listing.title}
                                </h4>
                              </div>

                              <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[120px]">{listing.location}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{listing.createdDate}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* PAGINATION AND INFINITE SCROLL FEED CONTROLS */}
                    <div className="pt-6 border-t border-slate-200/60 flex flex-col items-center justify-center space-y-4">
                      
                      {feedMode === 'pagination' ? (
                        /* Standard Beautiful Pagination Pills */
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                            className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 hover:text-blue-600 border border-slate-200 rounded-xl disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 transition cursor-pointer"
                          >
                            Prev
                          </button>
                          
                          {Array.from({ length: Math.ceil(displayListings.length / pageSize) || 1 }).map((_, idx) => {
                            const pageNum = idx + 1;
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => { setCurrentPage(pageNum); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                                className={`w-8 h-8 text-xs font-black rounded-xl transition cursor-pointer ${
                                  currentPage === pageNum 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            disabled={currentPage >= Math.ceil(displayListings.length / pageSize)}
                            onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                            className="px-3 py-1.5 text-xs font-bold bg-white text-slate-700 hover:text-blue-600 border border-slate-200 rounded-xl disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 transition cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      ) : (
                        /* Infinite Scroll "Load More" Loader */
                        <div className="text-center space-y-2 w-full max-w-xs">
                          {visibleCount < displayListings.length ? (
                            <button
                              type="button"
                              onClick={() => {
                                setVisibleCount(prev => prev + 6);
                                showToast("Simulated dynamic infinite-scroll load complete.");
                              }}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full shadow-md transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5 animate-spin-once" />
                              <span>Load More Listings ({displayListings.length - visibleCount} remaining)</span>
                            </button>
                          ) : (
                            <div className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200/60 py-2 px-4 rounded-xl font-bold uppercase tracking-wider">
                              🎉 All {displayListings.length} listings successfully fetched
                            </div>
                          )}
                          <span className="text-[9px] text-slate-400 block font-mono">
                            Memory cached query resolution optimized for slow 3G devices
                          </span>
                        </div>
                      )}

                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 2. PRODUCT DETAILS VIEW */}
        {currentView === 'buy' && selectedListing && (
          <div className="space-y-6">
            
            {/* Details Actions Top Bar */}
            <div className="flex items-center justify-between">
              {/* Back button */}
              <button 
                onClick={() => setSelectedListing(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition cursor-pointer"
              >
                ← Back to Explore
              </button>

              {/* Share button */}
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}?listing=${selectedListing.id}`;
                  navigator.clipboard.writeText(shareUrl)
                    .then(() => {
                      showToast("Copied shareable listing link to clipboard!");
                    })
                    .catch((err) => {
                      console.error("Failed to copy link:", err);
                      showToast("Could not copy link to clipboard.");
                    });
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 text-slate-700 hover:text-blue-600 text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs"
                title="Copy shareable link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Listing</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Product Info, Description, Images */}
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 [grid-template-areas:'images''map''details''ai''safety']">
                
                {/* Images Carousel */}
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm p-4 [grid-area:images]">
                  <div className="h-96 md:h-[450px] bg-slate-50 rounded-xl overflow-hidden relative">
                    <img 
                      src={selectedListing.photos[0]} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedListing.photos.length > 1 && (
                    <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                      {selectedListing.photos.map((ph, idx) => (
                        <div key={idx} className="w-20 h-16 rounded-lg overflow-hidden border border-slate-100 cursor-pointer hover:border-blue-500">
                          <img src={ph} className="w-full h-full object-cover" alt="" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Map Location */}
                <div className="[grid-area:map]">
                  <InteractiveMap locationName={selectedListing.location} price={selectedListing.price} />
                </div>

                {/* Details / description card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-sm [grid-area:details]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">
                        {selectedListing.condition.replace('_', ' ')}
                      </span>
                      {selectedListing.verifiedListing && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Ad</span>
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight">
                      {selectedListing.title}
                    </h1>
                    <div className="text-2xl font-black text-blue-600">₹{selectedListing.price.toLocaleString('en-IN')}</div>
                  </div>

                  {/* Specifications Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-400 mb-0.5">Category</div>
                      <div className="font-bold text-slate-800 truncate">
                        {categories.find(c => c.id === selectedListing.categoryId)?.name || 'Other'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-0.5">Subcategory</div>
                      <div className="font-bold text-slate-800 truncate">
                        {categories.find(c => c.id === selectedListing.categoryId)?.subcategories.find(s => s.id === selectedListing.subcategoryId)?.name || 'Other'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-0.5">Brand</div>
                      <div className="font-bold text-slate-800">{selectedListing.brand || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-0.5">Model</div>
                      <div className="font-bold text-slate-800">{selectedListing.model || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-0.5">Year</div>
                      <div className="font-bold text-slate-800">{selectedListing.year || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-0.5">Location</div>
                      <div className="font-bold text-slate-800 truncate">{selectedListing.location}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-slate-950">Description</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                      {selectedListing.description}
                    </p>
                  </div>
                </div>

                {/* AI Price suggestions */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-blue-100/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 [grid-area:ai]">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                      Gemini AI Market pricing Suggestion
                    </h4>
                    <p className="text-xs text-indigo-700 max-w-md">
                      Analyzing title, description parameters, conditions, and historic listings in our database to suggest optimal competitive ranges.
                    </p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs px-4 py-3 rounded-xl border border-indigo-200 text-center shadow-sm">
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Suggested Range</div>
                    <div className="text-base font-black text-indigo-900">
                      ₹{Math.round(selectedListing.price * 0.9).toLocaleString('en-IN')} - ₹{Math.round(selectedListing.price * 1.1).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* AI SafetyGuard Integrity Shield */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 [grid-area:safety]">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                      <ShieldAlert className="w-4.5 h-4.5 text-emerald-600" />
                      Gemini AI Buyer SafeGuard Shield
                    </h4>
                    <p className="text-xs text-emerald-700 max-w-md">
                      Real-time scan: Analyzing listing content for potential fraud indicators, redundant duplications, and automated spam behaviors.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1.5 text-[9.5px] font-mono">
                      <span className="flex items-center gap-1 text-emerald-800 bg-white/60 border border-emerald-100 px-2 py-0.5 rounded-md">
                        Spam Risk: <strong className="text-emerald-700">0.05% (Negligible)</strong>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 bg-white/60 border border-emerald-100 px-2 py-0.5 rounded-md">
                        Fraud Heuristic: <strong className="text-emerald-700">Safe / Verified</strong>
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 bg-white/60 border border-emerald-100 px-2 py-0.5 rounded-md">
                        Duplicate Checks: <strong className="text-emerald-700">Unique (Pass)</strong>
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-xs px-4 py-3 rounded-xl border border-emerald-200 text-center shadow-sm shrink-0">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Integrity Index</div>
                    <div className="text-base font-black text-emerald-900">
                      98% Secure
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller details & interactions */}
              <div className="space-y-6">
                
                {/* Seller Card */}
                {(() => {
                  const sellerProf = getSellerProfileObj(selectedListing.sellerId, currentUser);
                  const joinedDateVal = sellerProf ? sellerProf.joinedDate : '2024-01-01';
                  const displayYear = joinedDateVal.includes('-') 
                    ? new Date(joinedDateVal).getFullYear() 
                    : joinedDateVal.split(' ').pop();

                  // Calculate months since join date to determine experience level
                  const getMonthsSinceJoin = (joinedDateStr: string): number => {
                    if (!joinedDateStr) return 0;
                    let joinDate: Date;
                    if (joinedDateStr.includes('-')) {
                      joinDate = new Date(joinedDateStr);
                    } else {
                      const parts = joinedDateStr.split(' ');
                      if (parts.length === 2) {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthIdx = monthNames.indexOf(parts[0]);
                        const year = parseInt(parts[1], 10);
                        if (monthIdx !== -1 && !isNaN(year)) {
                          joinDate = new Date(year, monthIdx, 1);
                        } else {
                          joinDate = new Date(joinedDateStr);
                        }
                      } else {
                        joinDate = new Date(joinedDateStr);
                      }
                    }
                    if (isNaN(joinDate.getTime())) return 0;
                    const currentDate = new Date('2026-07-16');
                    return (currentDate.getFullYear() - joinDate.getFullYear()) * 12 + (currentDate.getMonth() - joinDate.getMonth());
                  };

                  const tenureMonths = getMonthsSinceJoin(joinedDateVal);
                  const sellerListings = listings.filter(l => l.sellerId === selectedListing.sellerId);
                  const totalListingsCount = sellerListings.length;
                  const ratingVal = sellerProf?.rating || selectedListing.sellerRating || 5.0;

                  // Determine dynamic verification level
                  let badgeLabel = 'Verified Member';
                  let badgeColorClass = 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700';
                  let badgeIcon = <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
                  let tooltipDescription = `Standard seller since ${displayYear}. Has ${totalListingsCount} listings posted with a rating of ★${ratingVal}.`;

                  if (ratingVal >= 4.5 && (tenureMonths >= 12 || totalListingsCount >= 4)) {
                    badgeLabel = 'Elite Gold Seller';
                    badgeColorClass = 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/40';
                    badgeIcon = <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
                    tooltipDescription = `Elite top-rated seller! Member for ${getAccountAge(joinedDateVal).replace('Member for ', '')} with an outstanding ★${ratingVal} rating and ${totalListingsCount} premium advertisements.`;
                  } else if (ratingVal >= 4.0 && (tenureMonths >= 3 || totalListingsCount >= 2)) {
                    badgeLabel = 'Rising Star Seller';
                    badgeColorClass = 'bg-indigo-50 text-indigo-700 border-indigo-250 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40';
                    badgeIcon = <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
                    tooltipDescription = `Highly active rising seller. Account age: ${getAccountAge(joinedDateVal).replace('Member for ', '')}, has published ${totalListingsCount} verified listings with strong ★${ratingVal} feedback.`;
                  } else if (selectedListing.sellerVerified || (sellerProf && sellerProf.verified)) {
                    badgeLabel = 'Verified Safe Trader';
                    badgeColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40';
                    badgeIcon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
                    tooltipDescription = `Verified secure profile! Trusted account verified through identity integrity check, with safe transaction records.`;
                  }

                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm text-center">
                      <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Seller Details</h3>
                      
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-16 h-16 bg-blue-500 text-white font-extrabold text-xl rounded-full flex items-center justify-center border border-slate-150 dark:border-slate-800 shadow-sm overflow-hidden shrink-0">
                          {sellerProf && (sellerProf.profilePhotoUrl || sellerProf.avatarUrl) ? (
                            <img 
                              src={sellerProf.profilePhotoUrl || sellerProf.avatarUrl} 
                              alt={selectedListing.sellerName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{selectedListing.sellerName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-base flex items-center justify-center gap-1">
                            {selectedListing.sellerName}
                            {(selectedListing.sellerVerified || (sellerProf && sellerProf.verified)) && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-50 dark:fill-blue-950" />
                            )}
                          </h4>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                            {selectedListing.sellerVerified ? 'Verified Member' : 'Member'} since {displayYear}
                          </div>

                          {/* Member Badge component with interactive Verification Tooltip */}
                          <div className="relative group mt-2 inline-block">
                            <div 
                              id="member-badge" 
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-3xs cursor-help transition-all duration-200 ${badgeColorClass}`}
                            >
                              {badgeIcon}
                              <span>{badgeLabel}</span>
                              <Info className="w-3 h-3 opacity-50 shrink-0 ml-0.5" />
                            </div>

                            {/* Verified Seller Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-64 bg-slate-900 dark:bg-slate-950 text-white text-[11px] font-normal leading-relaxed p-3.5 rounded-xl shadow-xl border border-slate-800 dark:border-slate-800 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 text-center">
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="flex items-center gap-1 font-bold text-xs">
                                  {badgeIcon}
                                  <span className="text-white">{badgeLabel}</span>
                                </div>
                                <p className="text-slate-300 font-medium">{tooltipDescription}</p>
                                <div className="w-full mt-1.5 pt-1.5 border-t border-slate-800 dark:border-slate-800 flex items-center justify-around text-[9px] font-mono text-slate-400">
                                  <div>Age: {getAccountAge(joinedDateVal).replace('Member for ', '')}</div>
                                  <div className="border-r border-slate-800 h-3"></div>
                                  <div>Listings: {totalListingsCount}</div>
                                </div>
                              </div>
                              {/* Tooltip Arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 dark:bg-slate-950 rotate-45 border-r border-b border-slate-800 dark:border-slate-800 -mt-1.5"></div>
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 flex justify-around text-xs border border-slate-100 dark:border-slate-850">
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-200">★ {selectedListing.sellerRating}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">Rating</div>
                        </div>
                        <div className="border-r border-slate-250 dark:border-slate-800"></div>
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-200">{selectedListing.views}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">Ad Views</div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <button 
                          onClick={() => startChat(selectedListing)}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/10 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Chat with Seller</span>
                        </button>

                        <a 
                          href="tel:+15550192834"
                          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call +1 (555) 019-2834</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Safety advice */}
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                    <span>Transaction Safety Tips</span>
                  </div>
                  <ul className="text-[10px] text-amber-700 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Always meet the seller in a busy, well-lit public space.</li>
                    <li>Inspect the physical item thoroughly before parting with cash.</li>
                    <li>Avoid pre-paying via wiring, cheques, or transfers.</li>
                    <li>Trust your instincts. If a luxury car is priced at ₹50,000, it is likely spam.</li>
                  </ul>
                </div>

                {/* Moderation / Report Card */}
                <div className="bg-rose-50/50 border border-rose-200/60 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
                    <span>Report Suspicious Listing</span>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    If this listing is potential spam, fraudulent, contains inappropriate details, or is fake, please report it to our administration team.
                  </p>
                  <button
                    onClick={() => {
                      if (reportedQueue.some(r => r.id === selectedListing.id)) {
                        showToast('This listing has already been reported and is under review.');
                        return;
                      }
                      setReportedQueue([selectedListing, ...reportedQueue]);
                      showToast('Listing reported successfully. Thank you for keeping LocalMarket safe!');
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report Advertisement</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. CHAT MESSAGING INTERFACE */}
        {currentView === 'chats' && (
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-md min-h-[550px] flex">
            
            {/* Chats Thread list */}
            <div className="w-80 border-r border-slate-150 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-150 bg-slate-50/50">
                <h3 className="font-black text-sm text-slate-900">Your Conversations</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Syncing with database</p>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                {chats.map(ch => (
                  <div 
                    key={ch.id}
                    onClick={() => setSelectedChat(ch)}
                    className={`p-3.5 flex gap-3 cursor-pointer hover:bg-slate-50 transition ${selectedChat?.id === ch.id ? 'bg-blue-50/60' : ''}`}
                  >
                    <img src={ch.listingPhoto} className="w-10 h-10 object-cover rounded-lg shrink-0 border" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-800 truncate">{ch.sellerName === currentUser.fullName ? ch.buyerName : ch.sellerName}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {ch.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full shrink-0 animate-bounce">
                              {ch.unreadCount}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400">{ch.lastMessageTime}</span>
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">{ch.listingTitle}</div>
                      <div className="text-xs text-slate-400 truncate mt-1">{ch.lastMessageText}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat conversation details */}
            {selectedChat ? (
              <div className="flex-1 flex flex-col h-[550px]">
                
                {/* Header */}
                <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <img src={selectedChat.listingPhoto} className="w-9 h-9 object-cover rounded-lg border" alt="" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{selectedChat.listingTitle}</h4>
                      <div className="text-[11px] font-black text-blue-600">₹{selectedChat.listingPrice.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-semibold">Online</span>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/30">
                  {messages.filter(m => m.chatId === selectedChat.id).map(msg => {
                    const isMine = msg.senderId === currentUser.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isMine 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-slate-150 text-slate-800 rounded-bl-none'
                        }`}>
                          <p>{msg.text}</p>
                          <div className={`text-[9px] mt-1 text-right ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Reply form */}
                <div className="p-3 border-t border-slate-150 flex gap-2 bg-white">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 border border-slate-200 rounded-xl px-4 text-xs outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition cursor-pointer active:scale-95"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-300" />
                <h4 className="font-bold text-slate-700">No Chat Selected</h4>
                <p className="text-xs max-w-xs leading-relaxed">Select a conversation thread on the left side to handle offers, view location details, or exchange instructions.</p>
              </div>
            )}
          </div>
        )}

        {/* 4. POST AD WORKSPACE */}
        {currentView === 'sell' && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-md">
            <h2 className="text-lg font-black text-slate-900 border-b pb-3 mb-6 flex items-center gap-1.5">
              <Tag className="w-5 h-5 text-blue-600" />
              Publish New Ad Advertisement
            </h2>

            <form onSubmit={handlePostAd} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Ad Title*</label>
                  <input 
                    type="text" 
                    placeholder="e.g. iPhone 15 Pro Max Natural Titanium 256GB"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category*</label>
                  <select 
                    value={newCat} 
                    onChange={(e) => {
                      const catId = e.target.value;
                      setNewCat(catId);
                      const catObj = categories.find(c => c.id === catId);
                      if (catObj && catObj.subcategories && catObj.subcategories.length > 0) {
                        setNewSubcat(catObj.subcategories[0].id);
                      } else {
                        setNewSubcat('');
                      }
                    }}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subcategory*</label>
                  <select 
                    value={newSubcat} 
                    onChange={(e) => setNewSubcat(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white"
                    required
                  >
                    {categories.find(c => c.id === newCat)?.subcategories.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    )) || <option value="">No subcategories available</option>}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Condition*</label>
                  <select 
                    value={newCondition} 
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white"
                  >
                    <option value="new">New / Unopened</option>
                    <option value="like_new">Like New / Mint</option>
                    <option value="good">Good / Used</option>
                    <option value="fair">Fair / Used</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Brand</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apple, BMW, Sony"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Model Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sven, 330i, R6"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Price (₹)*</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 15000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold font-mono text-slate-900 bg-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-1.5 relative">
                  <label className="text-xs font-bold text-slate-700">Location Area / PIN code*</label>
                  <input 
                    type="text" 
                    placeholder="Search PIN code or city in India..."
                    value={newLocation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewLocation(val);
                      if (val.trim()) {
                        setSellLocationSuggestions(findLocationByQuery(val));
                      } else {
                        setSellLocationSuggestions(INDIA_LOCATIONS.slice(0, 5));
                      }
                      setShowSellSuggestions(true);
                    }}
                    onFocus={() => {
                      if (newLocation.trim()) {
                        setSellLocationSuggestions(findLocationByQuery(newLocation));
                      } else {
                        setSellLocationSuggestions(INDIA_LOCATIONS.slice(0, 5));
                      }
                      setShowSellSuggestions(true);
                    }}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white placeholder:text-slate-400"
                    required
                  />
                  {showSellSuggestions && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSellSuggestions(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[220px] overflow-y-auto divide-y divide-slate-100">
                        <div className="p-2.5 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider flex justify-between items-center">
                          <span>India Postal Directory</span>
                          <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-bold">Select PIN</span>
                        </div>
                        {sellLocationSuggestions.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500 font-medium">
                            No pincodes or cities found. Try typing a 6-digit PIN.
                          </div>
                        ) : (
                          sellLocationSuggestions.map((item) => (
                            <button
                              key={item.pincode}
                              type="button"
                              onClick={() => {
                                setNewLocation(`${item.officeName}, ${item.district} (${item.pincode})`);
                                setShowSellSuggestions(false);
                              }}
                              className="w-full text-left p-3 hover:bg-slate-50/80 transition-colors flex items-start gap-2 text-xs"
                            >
                              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                              <div>
                                <div className="font-extrabold text-slate-800">{item.officeName}, {item.district}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{item.state} • Pincode <span className="font-black text-slate-900">{item.pincode}</span></div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Photos Url input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Ad Image URLs</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Paste public image URL here..." 
                    value={photoInput}
                    onChange={(e) => setPhotoInput(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white placeholder:text-slate-400"
                  />
                  <button 
                    type="button"
                    onClick={addPhotoUrl}
                    className="px-4 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {newPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-3.5 pt-1">
                    {newPhotos.map((ph, idx) => {
                      const isEnhanced = !!enhancedPhotoMap[ph];
                      const activeUrl = enhancedPhotoMap[ph] || ph;
                      return (
                        <div key={idx} className="relative w-24 h-20 border rounded-xl overflow-hidden group shadow-2xs">
                          <img src={activeUrl} className="w-full h-full object-cover" alt="" />
                          
                          {/* Enhance badge */}
                          {isEnhanced && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-indigo-600 border border-indigo-700 text-white text-[8px] font-black rounded uppercase tracking-wider shadow-md animate-pulse">
                              Enhanced
                            </span>
                          )}

                          {/* Delete and Enhance overlay */}
                          <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 gap-1.5">
                            <button
                              type="button"
                              onClick={() => runImageEnhancer(ph)}
                              disabled={isEnhancingImage}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[8.5px] rounded-md transition flex items-center gap-0.5 cursor-pointer"
                              title="Enhance image clarity and correct colors"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>{isEnhanced ? "Re-Enhance" : "AI Enhance"}</span>
                            </button>
                            
                            <button 
                              type="button"
                              onClick={() => {
                                setNewPhotos(newPhotos.filter((_, i) => i !== idx));
                                const updatedEnh = { ...enhancedPhotoMap };
                                delete updatedEnh[ph];
                                setEnhancedPhotoMap(updatedEnh);
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[8.5px] rounded-md transition flex items-center gap-0.5 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AI Image Enhancer split-screen comparator */}
                {selectedPhotoToEnhance && (
                  <div className="mt-3 p-4 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-300">AI image Enhancer co-pilot (Before vs After)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPhotoToEnhance(null)}
                        className="text-[10px] text-slate-400 hover:text-white font-bold bg-white/5 px-2 py-1 rounded-lg"
                      >
                        Dismiss Comparator
                      </button>
                    </div>

                    {isEnhancingImage ? (
                      <div className="h-48 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Running advanced brightness alignment & upscaling...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                          {/* Left side (Original) */}
                          <div className="absolute inset-0">
                            <img src={selectedPhotoToEnhance} className="w-full h-full object-cover opacity-85 filter brightness-90 grayscale-[15%]" alt="Original" />
                            <span className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 bg-slate-950/75 text-slate-300 text-[8.5px] font-black rounded uppercase tracking-wider">Before (Raw user input)</span>
                          </div>

                          {/* Right side (Enhanced) */}
                          <div 
                            className="absolute inset-y-0 right-0 overflow-hidden border-l border-indigo-400/80 shadow-2xl transition-all duration-100"
                            style={{ left: `${activeEnhanceSlider}%` }}
                          >
                            <img 
                              src={enhancedPhotoMap[selectedPhotoToEnhance] || selectedPhotoToEnhance} 
                              className="absolute top-0 right-0 h-full object-cover filter brightness-110 saturate-125" 
                              style={{ width: '100%', maxWidth: 'none', right: 0, left: `-${(100 - activeEnhanceSlider) * 3}px` }}
                              alt="Enhanced" 
                            />
                            <span className="absolute bottom-2 right-2 z-10 px-1.5 py-0.5 bg-indigo-600 text-white text-[8.5px] font-black rounded uppercase tracking-wider shadow-md">After (AI crystallized)</span>
                          </div>

                          {/* Slider Handle */}
                          <div 
                            className="absolute inset-y-0 w-0.5 bg-indigo-400 z-20 cursor-ew-resize flex items-center justify-center"
                            style={{ left: `${activeEnhanceSlider}%` }}
                          >
                            <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg border border-white text-[10px] font-black pointer-events-none">
                              ↔
                            </div>
                          </div>
                        </div>

                        {/* Interactive Range slider controller */}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Drag to Compare:</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={activeEnhanceSlider} 
                            onChange={(e) => setActiveEnhanceSlider(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gemini Description Helper */}
              <div className="border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <span className="text-xs font-bold text-indigo-950">Gemini AI Copilot Assistance</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => callGeminiHelper('describe')}
                      disabled={aiLoading}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Draft Description
                    </button>
                    <button 
                      type="button" 
                      onClick={() => callGeminiHelper('price')}
                      disabled={aiLoading}
                      className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] rounded-lg transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Price suggestions
                    </button>
                    <button 
                      type="button" 
                      onClick={() => callGeminiHelper('category')}
                      disabled={aiLoading}
                      className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] rounded-lg transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      Suggest Category
                    </button>
                  </div>
                </div>

                {aiSuggestions?.priceRange && (
                  <div className="bg-white rounded-xl p-3 text-xs border border-indigo-150 text-indigo-900 leading-relaxed font-medium">
                    🎯 <strong>AI price suggest range:</strong> {aiSuggestions.priceRange} (Based on local marketplace analytics).
                  </div>
                )}

                {/* Audit Compliance Integrity Scanner */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={runAiIntegrityCheck}
                    disabled={isAnalyzingIntegrity}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10.5px] uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isAnalyzingIntegrity ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ShieldAlert className="w-4.5 h-4.5 text-emerald-400" />
                    )}
                    <span>{isAnalyzingIntegrity ? "Analyzing Listing Integrity..." : "Run AI Integrity & Spam Audit Scan"}</span>
                  </button>

                  {adIntegrityResult && (
                    <div className="mt-3 p-4 bg-white border rounded-xl shadow-2xs space-y-3.5 text-xs text-slate-700 font-medium">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-extrabold text-slate-900 uppercase text-[9.5px] tracking-wide">Security Assessment scorecard</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          adIntegrityResult.spamScore > 60 || adIntegrityResult.fraudScore > 60
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                          {adIntegrityResult.spamScore > 60 || adIntegrityResult.fraudScore > 60 ? 'Warning: High Risk' : 'Ad Status: Passed compliance'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg space-y-1">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Spam Score Indicator</div>
                          <div className="text-sm font-black text-slate-900">{adIntegrityResult.spamScore}%</div>
                          <p className="text-[10px] text-slate-500 font-medium leading-normal">{adIntegrityResult.spamReason}</p>
                        </div>

                        <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg space-y-1">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fraud & Scam Risk</div>
                           <div className="text-sm font-black text-slate-900">{adIntegrityResult.fraudScore}%</div>
                          <p className="text-[10px] text-slate-500 font-medium leading-normal">{adIntegrityResult.fraudReason}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/20 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-wider">Market Redundancy Engine</div>
                          <p className="text-[10.5px] text-indigo-900 font-semibold mt-0.5">
                            {adIntegrityResult.duplicateDetected 
                              ? "⚠️ Duplicate warning: A near-identical active listing already exists." 
                              : "✓ Unique verification: Listing is completely distinct in our catalog directory."
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Detailed Description*</label>
                  <textarea 
                    rows={6}
                    placeholder="Highlight features, defects, size or warranty details..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-bold text-slate-900 bg-white placeholder:text-slate-400 leading-relaxed"
                    required
                  />
                </div>
              </div>

              <div className="pt-3">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/15 cursor-pointer active:scale-95"
                >
                  Publish Advertisement
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. SELLER DASHBOARD & ANALYTICS */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="text-xs text-slate-400 font-semibold uppercase">Total Listings</div>
                <div className="text-2xl font-black text-slate-900">
                  {listings.filter(l => l.sellerId === currentUser.id).length}
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="text-xs text-slate-400 font-semibold uppercase">Total Ad Views</div>
                <div className="text-2xl font-black text-slate-900">1,432</div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="text-xs text-slate-400 font-semibold uppercase">Pending Offers</div>
                <div className="text-2xl font-black text-slate-900">3</div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="text-xs text-slate-400 font-semibold uppercase">Wallet Balance</div>
                <div className="text-2xl font-black text-slate-900 text-emerald-600">
                  ₹{currentUser.walletBalance.toLocaleString('en-IN')}
                </div>
              </div>

            </div>

            {/* Split layout for Charts & Ads vs Profile Management */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column - Analytics Chart and Ads */}
              <div className="lg:col-span-7 space-y-6">

                {/* Custom SVG Visitor Chart */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Your Monthly Ad Visitor traffic</h3>
                  <p className="text-xs text-slate-400">Visitor volume tracked over last 6 months</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Realtime sync</span>
              </div>

              {/* Chart Graphic using React inline SVG */}
              <div className="h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 600 150">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0066FF" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="#0066FF" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Shaded Area */}
                  <path 
                    d="M 50 120 L 150 70 L 250 90 L 350 45 L 450 60 L 550 20 L 550 140 L 50 140 Z" 
                    fill="url(#chartGradient)" 
                  />

                  {/* Chart Line */}
                  <path 
                    d="M 50 120 L 150 70 L 250 90 L 350 45 L 450 60 L 550 20" 
                    fill="none" 
                    stroke="#0066FF" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />

                  {/* Data Points */}
                  <circle cx="50" cy="120" r="5" fill="#0066FF" stroke="white" strokeWidth="2" />
                  <circle cx="150" cy="70" r="5" fill="#0066FF" stroke="white" strokeWidth="2" />
                  <circle cx="250" cy="90" r="5" fill="#0066FF" stroke="white" strokeWidth="2" />
                  <circle cx="350" cy="45" r="5" fill="#0066FF" stroke="white" strokeWidth="2" />
                  <circle cx="450" cy="60" r="5" fill="#0066FF" stroke="white" strokeWidth="2" />
                  <circle cx="550" cy="20" r="5" fill="#0066FF" stroke="white" strokeWidth="2" />

                  {/* Month Labels */}
                  <text x="50" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Feb</text>
                  <text x="150" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Mar</text>
                  <text x="250" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Apr</text>
                  <text x="350" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">May</text>
                  <text x="450" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Jun</text>
                  <text x="550" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">Jul</text>
                </svg>
              </div>
            </div>

            {/* List Management section */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Manage Your Advertisements</h3>
              
              <div className="divide-y divide-slate-100">
                {listings.filter(l => l.sellerId === currentUser.id).length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">You haven't posted any advertisements yet. Click "Post Ad" to get started!</div>
                ) : (
                  listings.filter(l => l.sellerId === currentUser.id).map(l => (
                    <div key={l.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-3.5">
                        <img src={l.photos[0]} className="w-12 h-12 object-cover rounded-lg border shrink-0" alt="" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{l.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-black text-slate-900">₹{l.price.toLocaleString('en-IN')}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              l.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>{l.status}</span>
                            {l.boostStatus !== 'none' && (
                              <span className="text-[9px] bg-amber-50 text-amber-600 font-bold border border-amber-100 px-1 py-0.2 rounded uppercase">Sponsor Boosted</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => markAsSold(l.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition cursor-pointer"
                        >
                          {l.status === 'sold' ? 'Mark Active' : 'Mark Sold'}
                        </button>
                        
                        {l.status === 'active' && l.boostStatus === 'none' && (
                          <button 
                            onClick={() => { setBoostingListing(l); setSelectedPlan(PREMIUM_PLANS[1]); setCheckoutStep('select'); }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow-sm shadow-amber-500/10"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Boost Visibility
                          </button>
                        )}

                        <button 
                          onClick={() => { setListings(listings.filter(item => item.id !== l.id)); showToast('Listing removed.'); }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div> {/* Closes List Management section card */}
          </div> {/* Closes Left Column */}

          {/* Right Column - Secure Profile Editor */}
          <div className="lg:col-span-5">
            <UserProfileEditor 
              currentUser={currentUser}
              token={token}
              onProfileUpdated={(updatedUser) => setCurrentUser(updatedUser)}
              showToast={showToast}
            />
          </div>

        </div> {/* Closes split layout grid */}

      </div>
        )}

        {/* 6. ADMIN PANEL */}
        {currentView === 'admin' && (
          (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) ? (
            <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-5 shadow-xl my-12 animate-fade-in">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-slate-950 dark:text-slate-100">Administrator Access Required</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You are attempting to access the Administrator Control Panel. Please sign in with an authorized Google Administrator SSO account.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-left text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Google SSO Administrator Verification
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: 'digitalmitradinesh@gmail.com',
                          fullName: 'Dinesh Mitra',
                          isAdminRequest: true
                        })
                      });
                      const data = await res.json();
                      if (data.success) {
                        localStorage.setItem('auth_token', data.token);
                        setToken(data.token);
                        setCurrentUser(data.user);
                        showToast('Authenticated as Administrator via Google SSO!');
                      }
                    } catch (err) {
                      showToast('Failed to connect to Google SSO.');
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-2.5 shadow-md"
                >
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Authorize Admin via Google SSO (digitalmitradinesh@gmail.com)
                </button>
              </div>

              <button
                onClick={() => setCurrentView('buy')}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Return to Safe Directory
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400" />
                  <span>{currentUser.role === 'admin' ? 'Marketplace Administrator Panel' : 'Website Manager Control Panel'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.role === 'admin'
                    ? 'Global system overview, safe transaction audits, report moderation, and verification management.'
                    : 'Aesthetic administration dashboard with custom moderation scopes configured by the system administrator.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{currentUser.role === 'admin' ? 'Admin Session Active' : 'Manager Session Active'}</span>
              </div>
            </div>

            {/* Admin Switcher Tabs */}
            {(() => {
              const allowedTabs = [];
              if (currentUser.role === 'admin') {
                allowedTabs.push(
                  { id: 'overview', label: 'Overview & Moderation', icon: Sliders },
                  { id: 'metrics', label: 'Analytics, Payments & Security', icon: BarChart3 },
                  { id: 'database', label: 'PostgreSQL Relational DB (28 Tables)', icon: Database },
                  { id: 'categories', label: `Manage Categories (${categories.length})`, icon: Tag },
                  { id: 'branding', label: 'Website Branding', icon: Globe },
                  { id: 'managers', label: 'Website Managers Control', icon: ShieldCheck },
                  { id: 'specs', label: 'Architect Specs (PRD & APIs)', icon: BookOpen }
                );
              } else if (currentUser.role === 'moderator') {
                const perms = currentUser.managerPermissions || {
                  manageListings: true,
                  manageCategories: true,
                  manageBranding: false,
                  viewMetrics: false,
                  manageIntegrations: false
                };
                if (perms.manageListings) {
                  allowedTabs.push({ id: 'overview', label: 'Overview & Moderation', icon: Sliders });
                }
                if (perms.viewMetrics || perms.manageIntegrations) {
                  allowedTabs.push({ 
                    id: 'metrics', 
                    label: perms.manageIntegrations ? 'Integrations & Analytics' : 'Analytics & Reports', 
                    icon: BarChart3 
                  });
                }
                if (perms.manageCategories) {
                  allowedTabs.push({ id: 'categories', label: 'Manage Categories', icon: Tag });
                }
                if (perms.manageBranding) {
                  allowedTabs.push({ id: 'branding', label: 'Website Branding', icon: Globe });
                }
              }

              // Auto-fallback if active tab is not allowed
              const activeExists = allowedTabs.some(t => t.id === adminActiveTab);
              if (!activeExists && allowedTabs.length > 0) {
                setTimeout(() => {
                  setAdminActiveTab(allowedTabs[0].id as any);
                }, 0);
              }

              return (
                <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 pb-1 gap-2 md:gap-4">
                  {allowedTabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAdminActiveTab(tab.id as any)}
                        className={`pb-2.5 text-xs md:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                          adminActiveTab === tab.id
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {adminActiveTab === 'overview' && (
              <>
                {/* Quick Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Advertisements</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{listings.length}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">+4 today</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Moderation</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-600">{reportedQueue.length}</span>
                  {reportedQueue.length > 0 ? (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">Action Needed</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">Clean</span>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premium Sponsored Ads</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600">
                    {listings.filter(l => l.boostStatus !== 'none').length}
                  </span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">Active Boost</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Platform Health Check</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    100% Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Main Admin Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Moderation & Flagged Queue */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Pending Reports Queue */}
                <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                        Reported / Flagged Advertisements Queue
                      </h3>
                      <p className="text-[11px] text-slate-400">Items flag-reported by users for spam or incorrect pricing.</p>
                    </div>
                    <span className="text-xs font-black bg-rose-50 text-rose-600 px-2.5 py-1 rounded-lg">
                      {reportedQueue.length} Pending
                    </span>
                  </div>

                  {reportedQueue.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-xs text-slate-800">Moderation Queue is Clean!</h4>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">No advertisements have been flagged for review. LocalMarket is compliant and safe.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {reportedQueue.map(item => (
                        <div key={item.id} className="py-4 flex flex-col md:flex-row items-start justify-between gap-4 first:pt-0 last:pb-0">
                          <div className="flex gap-3.5">
                            <img 
                              src={item.photos[0]} 
                              className="w-16 h-16 object-cover rounded-xl border border-slate-150 shrink-0" 
                              alt="" 
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedListing(item)}>
                                  {item.title}
                                </h4>
                                {item.verifiedListing && (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.2 rounded">Verified</span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                Seller: <span className="font-bold text-slate-700">{item.sellerName}</span> • Price: <span className="font-black text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Report Reason: Flagged for spam description</span>
                              </div>
                            </div>
                          </div>

                          {/* Control actions */}
                          <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-end">
                            <button
                              onClick={() => {
                                // Mark listing as verified and remove from reportedQueue
                                const updatedListings = listings.map(l => {
                                  if (l.id === item.id) {
                                    return { ...l, verifiedListing: true };
                                  }
                                  return l;
                                });
                                setListings(updatedListings);
                                setReportedQueue(reportedQueue.filter(r => r.id !== item.id));
                                showToast(`Ad approved and badge "Verified Ad" awarded to ${item.title}`);
                              }}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="Approve Listing & Grant Verified Status"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve & Verify</span>
                            </button>

                            <button
                              onClick={() => {
                                // Dismiss reported state
                                setReportedQueue(reportedQueue.filter(r => r.id !== item.id));
                                showToast(`Dismissed reports for ${item.title}`);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                              title="Dismiss report & allow active"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Dismiss</span>
                            </button>

                            <button
                              onClick={() => {
                                // Delete listing from listings and reportedQueue
                                setListings(listings.filter(l => l.id !== item.id));
                                setReportedQueue(reportedQueue.filter(r => r.id !== item.id));
                                showToast(`Successfully deleted inappropriate ad listing: ${item.title}`);
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                              title="Delete listing completely from database"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Database Registry Monitor */}
                <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">All Live Advertisements Database</h3>
                    <p className="text-[11px] text-slate-400">Review, query, and toggle verification badging for all live marketplace listings.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-150 text-slate-400 font-bold">
                          <th className="py-2.5">Listing ID</th>
                          <th className="py-2.5">Title</th>
                          <th className="py-2.5">Price</th>
                          <th className="py-2.5">Seller</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5 text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {listings.map(l => (
                          <tr key={l.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-mono text-[10px] text-slate-400">{l.id}</td>
                            <td className="py-3 font-bold text-slate-800">{l.title}</td>
                            <td className="py-3 font-extrabold text-slate-900">₹{l.price.toLocaleString('en-IN')}</td>
                            <td className="py-3">{l.sellerName}</td>
                            <td className="py-3">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                l.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                              }`}>{l.status}</span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  const updated = listings.map(item => {
                                    if (item.id === l.id) {
                                      return { ...item, verifiedListing: !item.verifiedListing };
                                    }
                                    return item;
                                  });
                                  setListings(updated);
                                  showToast(`${l.title} verification status toggled!`);
                                }}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
                                  l.verifiedListing 
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {l.verifiedListing ? '✓ Verified' : 'Mark Verified'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: Platform Users & Roles */}
              <div className="space-y-6">
                
                {/* User Role Management Card */}
                <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Platform Identity & Access Roles</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Mock identities currently active in this workspace container.</p>
                  </div>

                  <div className="space-y-3.5">
                    
                    {/* Current user info */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-3">
                      <div className="flex items-center gap-3">
                        <img src={currentUser.profilePhotoUrl || currentUser.avatarUrl} className="w-10 h-10 object-cover rounded-full border border-white shadow-xs" alt="" />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{currentUser.fullName} (You)</div>
                          <div className="text-[10px] text-slate-500 font-mono">{currentUser.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
                        <span className="text-slate-500">Security Group:</span>
                        <span className="font-extrabold bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] uppercase">
                          {currentUser.role}
                        </span>
                      </div>
                    </div>

                    {/* Standard Mock Users Table */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active User Profiles</h4>
                      
                      <div className="space-y-2">
                        {[
                          { name: 'Sarah Connor', email: 'connor@gmail.com', role: 'seller', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
                          { name: 'Marcus Aurelius', email: 'stoic@gmail.com', role: 'buyer', rating: 4.5, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' },
                          { name: 'Helen of Troy', email: 'helen@gmail.com', role: 'moderator', rating: 5.0, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' }
                        ].map((u, i) => (
                          <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition">
                            <div className="flex items-center gap-2.5">
                              <img src={u.avatar} className="w-8 h-8 object-cover rounded-full shrink-0" alt="" />
                              <div>
                                <div className="text-xs font-bold text-slate-800 leading-none">{u.name}</div>
                                <span className="text-[10px] text-slate-400 leading-none font-mono">{u.email}</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Audit logs & activity telemetry */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 text-slate-300 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Live Audit Log</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="space-y-2 leading-relaxed text-[11px] text-slate-400 font-mono">
                    <div>[08:04:12] AUTH_SYNC: loaded user digitalmitradinesh@gmail.com</div>
                    <div>[08:05:01] DB_INIT: verified connections to local state store</div>
                    <div>[08:06:55] MOD_SYS: initialised reported list queue [Size: {reportedQueue.length}]</div>
                    <div>[08:07:33] CLIENT_OK: applet view port running on port 3000</div>
                  </div>
                </div>

              </div>

            </div>
            
            </>
            )}

            {adminActiveTab === 'metrics' && (
              <AdminMetricsViewer token={token} />
            )}

            {adminActiveTab === 'database' && (
              <DatabaseSchemaViewer />
            )}

            {adminActiveTab === 'categories' && (
              <CategoryAdminPanel 
                categories={categories} 
                onUpdateCategories={setCategories} 
                listings={listings} 
                showToast={showToast} 
              />
            )}

            {adminActiveTab === 'branding' && (
              <BrandingAdminPanel 
                token={token}
                currentName={websiteName}
                currentLogoUrl={websiteLogoUrl}
                currentCopyright={websiteCopyright}
                currentPoweredBy={websitePoweredBy}
                currentAddress={websiteAddress}
                currentSocials={websiteSocials}
                currentThemeColor={websiteThemeColor}
                currentThemeCustomColor={websiteThemeCustomColor}
                currentLogoSize={websiteLogoSize}
                currentLogoShape={websiteLogoShape}
                currentLogoFit={websiteLogoFit}
                currentLogoBg={websiteLogoBg}
                currentLightBgColor={websiteLightBgColor}
                currentDarkBgColor={websiteDarkBgColor}
                currentLightHeaderColor={websiteLightHeaderColor}
                currentDarkHeaderColor={websiteDarkHeaderColor}
                currentShowDemoHub={websiteShowDemoHub}
                currentTitleCase={websiteTitleCase}
                currentAboutUs={websiteAboutUs}
                currentCarouselImages={websiteCarouselImages}
                onSaveBranding={handleSaveBranding}
                showToast={showToast}
              />
            )}

            {adminActiveTab === 'managers' && (
              <WebsiteManagersPanel 
                token={token} 
              />
            )}

            {adminActiveTab === 'specs' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <PRDViewer hideApprove={true} />
              </div>
            )}
          </div>
          )
        )}

        {/* 7. ALL INDIA PINCODE DIRECTORY VIEW */}
        {currentView === 'directory' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            {/* Header section with ambient presentation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-4.5 h-4.5 text-blue-600 animate-spin-slow" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    All India Postal Directory
                  </h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Search, verify and navigate local classified advertisements across pincodes in Indian states and union territories.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocation('Connaught Place, New Delhi (110001)');
                    showToast('Search filters restored to national capital!');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Set Capital Default</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocation('All India');
                    setCurrentView('buy');
                    showToast('Broadcasting searches to entire India!');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Browse All India Ads</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Cards Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase">Covered States</div>
                  <div className="text-lg font-black text-slate-800">{INDIA_STATES_DIRECTORY.length} Regions</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase">Indexed PINs</div>
                  <div className="text-lg font-black text-slate-800">{INDIA_LOCATIONS.length} Pincodes</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase">Active Adverts</div>
                  <div className="text-lg font-black text-slate-800">{listings.length} Listings</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase">Directory Status</div>
                  <div className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Verified Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Interactive Workspaces */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (State Selectors and Quick Info) - 4 cols */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                  <h3 className="font-extrabold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>Select Indian State</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-1">
                    {INDIA_STATES_DIRECTORY.map((stateInfo) => {
                      const isSelected = selectedState === stateInfo.stateName;
                      const count = INDIA_LOCATIONS.filter(loc => loc.state === stateInfo.stateName).length;
                      return (
                        <button
                          key={stateInfo.stateName}
                          type="button"
                          onClick={() => {
                            setSelectedState(stateInfo.stateName);
                            setDirectorySearchQuery('');
                          }}
                          className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between font-bold text-xs cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="truncate">{stateInfo.stateName}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {count} PINs
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Logistics serviceability and shipping delivery calculator widget */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
                      <span>Logistics Delivery Checker</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Check transport costs & transit duration between postal codes.
                    </p>
                  </div>

                  <form onSubmit={handleCalculateServiceability} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">From Pincode</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 110001"
                          value={originPincode}
                          onChange={(e) => setOriginPincode(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">To Pincode</label>
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 400050"
                          value={destPincode}
                          onChange={(e) => setDestPincode(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Check Serviceability</span>
                    </button>
                  </form>

                  {/* Calculations Result */}
                  {calcResult && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3.5 animate-fade-in text-xs">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                        <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Logistics Summary</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded">Serviceable</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 font-medium text-slate-700">
                        <div>
                          <div className="text-[10px] text-slate-400">Estimated Distance</div>
                          <div className="font-bold text-slate-800">{calcResult.distance} Kilometres</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Transit Duration</div>
                          <div className="font-bold text-slate-800">{calcResult.days} {calcResult.days === 1 ? 'Working Day' : 'Working Days'}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Standard Freight</div>
                          <div className="font-bold text-slate-800">₹{calcResult.cost} INR</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Courier Partner</div>
                          <div className="font-bold text-slate-800 text-[10px] truncate">{calcResult.carrier}</div>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 p-2 rounded-lg text-[9px] text-blue-600 font-medium leading-relaxed">
                        Note: Hyperlocal hand delivery is recommended for items within 50km. National parcels are handled by certified air-freight services.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (Directory Search and Pincode List Grid) - 8 cols */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  
                  {/* Search filter row */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-2">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search pincodes, city names or area offices..."
                        value={directorySearchQuery}
                        onChange={(e) => setDirectorySearchQuery(e.target.value)}
                        className="bg-transparent text-xs w-full outline-none font-medium text-slate-800"
                      />
                      {directorySearchQuery && (
                        <button 
                          onClick={() => setDirectorySearchQuery('')} 
                          className="p-0.5 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 font-bold shrink-0 self-center">
                      Selected State: <span className="text-blue-600">{selectedState || 'All of India'}</span>
                    </div>
                  </div>

                  {/* List of Pincodes Grid */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="bg-slate-50/70 p-3 border-b border-slate-150 grid grid-cols-12 gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      <div className="col-span-4">Postal Office & City</div>
                      <div className="col-span-2 text-center">PIN Code</div>
                      <div className="col-span-3">Coordinates (Lat, Lng)</div>
                      <div className="col-span-3 text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
                      {(function() {
                        const filteredPincodes = INDIA_LOCATIONS.filter(loc => {
                          const matchesSearch = loc.officeName.toLowerCase().includes(directorySearchQuery.toLowerCase()) ||
                                                loc.district.toLowerCase().includes(directorySearchQuery.toLowerCase()) ||
                                                loc.pincode.includes(directorySearchQuery);
                          const matchesState = !selectedState || loc.state === selectedState || directorySearchQuery !== '';
                          return matchesSearch && matchesState;
                        });

                        if (filteredPincodes.length === 0) {
                          return (
                            <div className="p-8 text-center text-xs text-slate-400 font-medium space-y-2">
                              <MapPin className="w-8 h-8 mx-auto text-slate-300" />
                              <div>No pincodes found matching "{directorySearchQuery}" in {selectedState}.</div>
                              <button
                                type="button"
                                onClick={() => {
                                  setDirectorySearchQuery('');
                                  setSelectedState('');
                                }}
                                className="text-blue-600 font-bold hover:underline"
                              >
                                Clear search constraints
                              </button>
                            </div>
                          );
                        }

                        return filteredPincodes.map((record) => {
                          const activeAdsCount = listings.filter(l => l.location.includes(record.pincode) || l.location.includes(record.officeName)).length;
                          return (
                            <div 
                              key={record.pincode}
                              className="p-3.5 grid grid-cols-12 gap-2 text-xs items-center hover:bg-slate-50/50 transition-colors"
                            >
                              <div className="col-span-4 space-y-1">
                                <div className="font-extrabold text-slate-800">{record.officeName}</div>
                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                  <span>{record.district}</span>
                                  <span>•</span>
                                  <span>{record.state}</span>
                                </div>
                              </div>

                              <div className="col-span-2 text-center">
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-mono font-black rounded-lg text-xs tracking-tight">
                                  {record.pincode}
                                </span>
                              </div>

                              <div className="col-span-3 text-slate-500 font-mono text-[10px]">
                                {record.latitude.toFixed(4)}° N, {record.longitude.toFixed(4)}° E
                              </div>

                              <div className="col-span-3 flex items-center justify-end gap-2">
                                {activeAdsCount > 0 && (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                                    {activeAdsCount} {activeAdsCount === 1 ? 'Ad' : 'Ads'}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSearchLocation(`${record.officeName}, ${record.district} (${record.pincode})`);
                                    setCurrentView('buy');
                                    showToast(`Filter locked to: ${record.officeName} (${record.pincode})`);
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer shadow-2xs"
                                >
                                  Go to Ads
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Information footer */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-start gap-2.5 text-[10px] text-slate-500 leading-relaxed font-semibold">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <span>
                        This state postal list is powered by the All India Pincode Directory database. When adding classified listings, sellers can select precise area pins to allow buyers to accurately locate local services and compute precise logistics routes.
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* 8. PRIVACY POLICY VIEW */}
        {currentView === 'privacy' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Header section */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                Privacy Policy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Last updated: July 18, 2026 • Secure Client-Side Verified Infrastructure
              </p>
            </div>

            {/* Privacy Policy Content */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs leading-relaxed">
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600">
                  1. Information We Collect
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  We collect information to provide better services to all our users. This includes:
                </p>
                <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-medium">
                  <li><strong>Account Credentials:</strong> Name, email address, phone number, and physical profile address details specified during seller registration.</li>
                  <li><strong>Classified Listings:</strong> Pictures, description, pricing details, and location markers uploaded to the portal.</li>
                  <li><strong>Chat Messages:</strong> Communication logs between buyers and sellers conducted via our encrypted real-time chat gateway.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600">
                  2. How We Use Information
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  The information we collect is strictly utilized for the following core operations:
                </p>
                <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-medium">
                  <li>To verify authentic sellers and listings on our classified platform.</li>
                  <li>To enable direct contact channels between prospective buyers and sellers via integrated chat mechanisms.</li>
                  <li>To match nearby advertisements using client-vetted pincodes and state directory mappings.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600">
                  3. User Autonomy and Control
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  You hold absolute control over your information:
                </p>
                <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 font-medium">
                  <li>Sellers can delete or mark their advertisement listings as "Sold" at any point, permanently withdrawing them from public directories.</li>
                  <li>Users can update their full names, avatar graphics, and local registered addresses via the Edit Profile panel in their Seller Dashboard.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600">
                  4. Security Protocols
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  We employ rigorous client-side and server-side encryption standards. Sensitive data, passwords, and sessions are authorized through secure tokens. Your physical or precise coordinate metrics are never broadcasted to third-party tracking programs without your permission.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600">
                  5. Contact Us
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  If you have questions about this privacy statement or request full deletion of user accounts, please coordinate with our administrator support team at <span className="text-blue-600 font-bold">support@{websiteName.toLowerCase().replace(/\s+/g, '')}.in</span>.
                </p>
              </section>
            </div>

            <div className="flex justify-center pb-6">
              <button
                onClick={() => { setSelectedListing(null); setCurrentView('buy'); }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                Return to Buyer Feed
              </button>
            </div>
          </div>
        )}

        {/* 9. ABOUT US VIEW */}
        {currentView === 'about' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Header section with branding */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-600" />
                About Our Platform
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Verified Local Commerce & Security-First Classified Peer-To-Peer Directory
              </p>
            </div>

            {/* About Us Content block */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 space-y-6 shadow-xs leading-relaxed">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-150 dark:border-slate-800/80">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-blue-900/30">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-450" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">
                    {websiteName} Local Directory
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Empowering local residents, verified dealers, and shops across Indian states.
                  </p>
                </div>
              </div>

              {/* Dynamic Paragraph Rendering */}
              <div className="space-y-5 text-xs md:text-sm text-slate-600 dark:text-slate-350 font-medium leading-relaxed">
                {websiteAboutUs.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i} className="whitespace-pre-line bg-slate-50/50 dark:bg-slate-850/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                    {para}
                  </p>
                ))}
              </div>

              {/* Trust parameters banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-150 dark:border-slate-800/80">
                <div className="p-4 bg-slate-50 dark:bg-slate-850/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 text-center">
                  <span className="block text-xl font-black text-blue-600">100% Real</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mt-1">Verified Sellers Only</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-850/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 text-center">
                  <span className="block text-xl font-black text-emerald-600">Secure</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mt-1">Direct Chat & Pin Lookup</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-850/40 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 text-center">
                  <span className="block text-xl font-black text-indigo-600">Local</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block mt-1">Nearest Area Trades</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pb-6">
              <button
                onClick={() => { setSelectedListing(null); setCurrentView('buy'); }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                Return to Buyer Feed
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Portal Footer Section */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
             {/* Branding & Logo */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className={getLogoContainerClass(true)}>
                  {websiteLogoUrl ? (
                    <img src={websiteLogoUrl} alt="Logo" className={getLogoImgClass()} />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                      <Tag className="w-4.5 h-4.5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-base font-black tracking-tight text-slate-800 dark:text-white uppercase">
                  {websiteName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm font-medium">
                India's #1 premium local buying and selling classifieds portal. Experience immediate buyer matches and secure localized parcel transactions.
              </p>
              {websitePoweredBy && (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-mono">
                  {websitePoweredBy}
                </div>
              )}

              {/* Social Media Row */}
              <div className="pt-2 flex items-center gap-2.5">
                {websiteSocials?.facebook && (
                  <a 
                    href={websiteSocials.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all duration-200"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {websiteSocials?.twitter && (
                  <a 
                    href={websiteSocials.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-500 hover:text-sky-500 transition-all duration-200"
                    title="Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {websiteSocials?.instagram && (
                  <a 
                    href={websiteSocials.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-pink-50 dark:bg-slate-800 dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-500 hover:text-pink-500 transition-all duration-200"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {websiteSocials?.linkedin && (
                  <a 
                    href={websiteSocials.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-500 hover:text-blue-700 transition-all duration-200"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {websiteSocials?.youtube && (
                  <a 
                    href={websiteSocials.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-500 hover:text-red-600 transition-all duration-200"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Quick Navigation</h4>
              <ul className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <li>
                  <button onClick={() => handleNavigate('buy')} className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                    Browse Classifieds Listings
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('sell')} className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                    Post a Free Advertisement
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('chats')} className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                    Live Seller Chatbox
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigate('admin')} className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                    {currentUser?.role === 'admin' ? 'Administrator Controls' : 'Administrator Control Panel'}
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedListing(null); setCurrentView('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">
                    Privacy Policy & Guidelines
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedListing(null); setCurrentView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer text-blue-600 dark:text-blue-400 font-normal">
                    About Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & Address */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Registered Office</h4>
              <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed whitespace-pre-line">{websiteAddress}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>support@{websiteName.toLowerCase().replace(/\s+/g, '')}.in</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Divider */}
          <div className="border-t border-slate-150 dark:border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {websiteCopyright}
            </p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 dark:text-slate-500">
              <span>Secure Port 3000 Ingress</span>
              <span>•</span>
              <span>100% Client Managed Data</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Ad Boost Checkout Modal Dialog */}
      {boostingListing && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Boost Ad Listing Visibility</h3>
                <p className="text-[10px] text-slate-400 truncate max-w-xs">{boostingListing.title}</p>
              </div>
              <button 
                onClick={() => setBoostingListing(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {checkoutStep === 'select' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">1. Choose Premium Plan</h4>
                  <div className="space-y-3">
                    {PREMIUM_PLANS.filter(p => p.price > 0).map(plan => (
                      <div 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`border rounded-2xl p-4 cursor-pointer transition flex items-start gap-3 ${
                          selectedPlan?.id === plan.id ? 'border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/20' : 'border-slate-150 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          checked={selectedPlan?.id === plan.id}
                          onChange={() => setSelectedPlan(plan)}
                          className="mt-1 accent-blue-600"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-xs text-slate-900">{plan.name}</span>
                            <span className="font-extrabold text-xs text-blue-600">${plan.price} / {plan.durationDays} days</span>
                          </div>
                          <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 leading-relaxed">
                            {plan.features.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCheckoutStep('details')}
                    disabled={!selectedPlan}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    Proceed to Payment Gateway
                  </button>
                </div>
              )}

              {checkoutStep === 'details' && selectedPlan && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 mb-2">
                    <span className="text-xs text-slate-500">Upgrade: <strong className="text-slate-800">{selectedPlan.name}</strong></span>
                    <span className="text-xs font-black text-blue-600">₹{selectedPlan.price}</span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Secure Merchant Checkout (Stripe/Razorpay)
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-700 uppercase">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-mono"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">CVV</label>
                        <input 
                          type="password" 
                          placeholder="***"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setCheckoutStep('select')}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition shadow-md active:scale-95 cursor-pointer"
                    >
                      Pay Now (₹{selectedPlan.price})
                    </button>
                  </div>
                </form>
              )}

              {checkoutStep === 'success' && selectedPlan && (
                <div className="text-center p-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-slate-900 text-base">Payment Completed Successfully!</h3>
                    <p className="text-xs text-slate-500">Your advertisement has been prioritized and boosted.</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-left border border-slate-100 font-mono text-[10px] text-slate-500 space-y-1">
                    <div>RECEIPT ID: RCPT-{Date.now().toString().slice(-6)}</div>
                    <div>GATEWAY: Stripe Live Sync</div>
                    <div>PLAN: {selectedPlan.name}</div>
                    <div>AMOUNT: ₹{selectedPlan.price.toLocaleString('en-IN')}</div>
                    <div className="text-emerald-600 font-bold uppercase mt-1">✓ Status: Paid (18% GST Invoiced)</div>
                  </div>

                  <button 
                    onClick={() => { setBoostingListing(null); setCheckoutStep('select'); }}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                  >
                    Close & Return to Dashboard
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Authentication Modal Popup */}
      <AuthenticationModal
        isOpen={showAuthModal}
        pendingView={pendingView}
        onClose={() => {
          setShowAuthModal(false);
          setPendingView(null);
          setPendingChatListing(null);
        }}
        websiteName={websiteName}
        isDarkMode={isDarkMode}
        onLoginSuccess={(user, tokenVal) => {
          localStorage.setItem('auth_token', tokenVal);
          setToken(tokenVal);
          setCurrentUser(user);
          showToast(`Welcome back, ${user.fullName}!`);
          
          // Execute pending navigation if any
          if (pendingView) {
            setCurrentView(pendingView);
            setPendingView(null);
          }
          // Execute pending chat initiation if any
          if (pendingChatListing) {
            // we call startChat with a slight timeout to ensure state is updated
            setTimeout(() => {
              startChat(pendingChatListing);
              setPendingChatListing(null);
            }, 50);
          }
        }}
      />

      {/* In-App Real-Time Notification Center */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 md:px-0">
        <AnimatePresence>
          {inAppNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex gap-3.5 items-start relative hover:shadow-3xl transition duration-200"
            >
              {/* Indicator dot */}
              <span className="absolute top-4 right-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>

              {/* Sender avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0 text-sm border border-blue-50 dark:border-blue-900/40 shadow-xs">
                {notif.senderName.slice(0, 2).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-800 dark:text-white truncate">
                    {notif.senderName}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Just now
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-semibold mt-0.5">
                  on {notif.listingTitle}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-350 line-clamp-2 mt-1.5 font-medium leading-relaxed bg-slate-50/60 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-900/30">
                  "{notif.text}"
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      const foundChat = chats.find(c => c.id === notif.chatId);
                      if (foundChat) {
                        setSelectedChat(foundChat);
                      }
                      setCurrentView('chats');
                      setInAppNotifications(prev => prev.filter(n => n.id !== notif.id));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[10px] rounded-lg transition duration-150 flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Reply Now</span>
                  </button>
                  <button
                    onClick={() => {
                      setInAppNotifications(prev => prev.filter(n => n.id !== notif.id));
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-slate-350 font-bold text-[10px] rounded-lg transition duration-150 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Thumbnail of product */}
              {notif.listingPhoto && (
                <img
                  src={notif.listingPhoto}
                  alt=""
                  className="w-11 h-11 object-cover rounded-xl border border-slate-100 dark:border-slate-800 shrink-0 shadow-xs"
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Interactive Simulation Dashboard / Control Panel */}
      {currentUser && (
        <div className="fixed bottom-6 right-6 z-50">
          <AnimatePresence>
            {isSimulatorOpen ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-2xl p-5 w-80 mb-3 text-left overflow-hidden flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <h3 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Simulation Hub
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsSimulatorOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Automation Toggles */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-900/30">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <BellRing className={`w-3.5 h-3.5 ${simulationEnabled ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span>Background Alerts</span>
                    </div>
                    <button
                      onClick={() => setSimulationEnabled(!simulationEnabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${simulationEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${simulationEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      {simulationSound ? (
                        <Volume2 className="w-3.5 h-3.5 text-blue-500 animate-bounce" />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Audio Chimes</span>
                    </div>
                    <button
                      onClick={() => setSimulationSound(!simulationSound)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${simulationSound ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${simulationSound ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Instant Simulation Action */}
                <button
                  onClick={() => {
                    triggerSimulatedIncomingMessage();
                    showToast("Simulated random message triggered!");
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>⚡ Simulate Random Message</span>
                </button>

                {/* Custom Message Sender Form */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 space-y-2.5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Custom Simulated Message
                  </div>

                  {chats.length > 0 ? (
                    <div className="space-y-2.5">
                      <select
                        value={customSimChatId}
                        onChange={(e) => setCustomSimChatId(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="">-- Select Chat Thread --</option>
                        {chats.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.sellerName === currentUser.fullName ? c.buyerName : c.sellerName} ({c.listingTitle})
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customSimMsg}
                          onChange={(e) => setCustomSimMsg(e.target.value)}
                          placeholder="Type simulated message..."
                          className="flex-1 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customSimMsg.trim()) {
                              triggerSimulatedIncomingMessage(customSimMsg);
                              setCustomSimMsg('');
                              showToast("Custom simulated message sent!");
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (!customSimMsg.trim()) return;
                            triggerSimulatedIncomingMessage(customSimMsg);
                            setCustomSimMsg('');
                            showToast("Custom simulated message sent!");
                          }}
                          disabled={!customSimMsg.trim()}
                          className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 active:scale-95 disabled:opacity-40 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 leading-relaxed">
                      Initialize a chat session from any advertisement card first to enable thread-specific custom testing.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Floaty Button */}
          <button
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className="w-12 h-12 bg-amber-500 hover:bg-amber-600 active:scale-95 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-3xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 relative group"
            title="Open Simulation Settings Hub"
          >
            <BellRing className="w-5.5 h-5.5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-slate-900 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-950 scale-90 opacity-0 group-hover:opacity-100 transition duration-150">
              ⚙️
            </span>
          </button>
        </div>
      )}

    </div>
  );
}
