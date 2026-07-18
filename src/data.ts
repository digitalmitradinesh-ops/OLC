/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Listing, UserProfile, PremiumPlan, Chat, Message } from './types';

export const CURRENT_USER: UserProfile = {
  id: 'user-curr',
  email: 'digitalmitradinesh@gmail.com',
  phone: '+1 (555) 019-2834',
  fullName: 'Dinesh Mitra',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  location: 'Connaught Place, New Delhi (110001)',
  role: 'admin',
  rating: 4.8,
  joinedDate: 'Jan 2025',
  verified: true,
  isPremium: true,
  walletBalance: 15000.00
};

export const CATEGORIES: Category[] = [
  {
    id: 'cat-mobiles',
    name: 'Mobiles & Tablets',
    slug: 'mobiles',
    icon: 'Smartphone',
    subcategories: [
      { id: 'sub-mob-phones', name: 'Mobile Phones', slug: 'mobile-phones' },
      { id: 'sub-mob-tablets', name: 'Tablets', slug: 'tablets' },
      { id: 'sub-mob-acc', name: 'Accessories', slug: 'accessories' }
    ]
  },
  {
    id: 'cat-vehicles',
    name: 'Vehicles',
    slug: 'vehicles',
    icon: 'Car',
    subcategories: [
      { id: 'sub-veh-cars', name: 'Cars', slug: 'cars' },
      { id: 'sub-veh-bikes', name: 'Motorcycles & Scooters', slug: 'motorcycles' },
      { id: 'sub-veh-parts', name: 'Spare Parts & Accessories', slug: 'spare-parts' }
    ]
  },
  {
    id: 'cat-property',
    name: 'Property',
    slug: 'property',
    icon: 'Home',
    subcategories: [
      { id: 'sub-prop-sale', name: 'For Sale: Houses & Apartments', slug: 'for-sale' },
      { id: 'sub-prop-rent', name: 'For Rent: Houses & Apartments', slug: 'for-rent' },
      { id: 'sub-prop-land', name: 'Land & Plots', slug: 'land-plots' }
    ]
  },
  {
    id: 'cat-electronics',
    name: 'Electronics & Appliances',
    slug: 'electronics',
    icon: 'Tv',
    subcategories: [
      { id: 'sub-elec-tv', name: 'TVs, Video & Audio', slug: 'tvs-audio' },
      { id: 'sub-elec-laptops', name: 'Computers & Laptops', slug: 'computers-laptops' },
      { id: 'sub-elec-cameras', name: 'Cameras & Lenses', slug: 'cameras' }
    ]
  },
  {
    id: 'cat-jobs',
    name: 'Jobs',
    slug: 'jobs',
    icon: 'Briefcase',
    subcategories: [
      { id: 'sub-job-it', name: 'IT & Software Development', slug: 'it-software' },
      { id: 'sub-job-sales', name: 'Sales & Marketing', slug: 'sales-marketing' },
      { id: 'sub-job-admin', name: 'Administrative', slug: 'administrative' }
    ]
  },
  {
    id: 'cat-furniture',
    name: 'Home & Furniture',
    slug: 'furniture',
    icon: 'Armchair',
    subcategories: [
      { id: 'sub-furn-sofa', name: 'Sofa & Dining Sets', slug: 'sofa-dining' },
      { id: 'sub-furn-beds', name: 'Beds & Wardrobes', slug: 'beds-wardrobes' },
      { id: 'sub-furn-decor', name: 'Home Decor & Garden', slug: 'home-decor' }
    ]
  }
];

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'lst-1',
    title: 'iPhone 15 Pro Max - 256GB - Titanium Blue (Unopened)',
    description: 'Selling a brand new, sealed iPhone 15 Pro Max 256GB in Natural Titanium. Comes with official Apple 1-year warranty. Receipts available. Firm price, no trades please.',
    categoryId: 'cat-mobiles',
    subcategoryId: 'sub-mob-phones',
    price: 95000,
    negotiable: false,
    condition: 'new',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    year: 2023,
    location: 'Connaught Place, New Delhi (110001)',
    latitude: 28.6304,
    longitude: 77.2177,
    photos: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-1',
    sellerName: 'Marcus Vance',
    sellerRating: 4.9,
    sellerVerified: true,
    views: 312,
    status: 'active',
    createdDate: '2026-07-15',
    expiryDate: '2026-09-15',
    boostStatus: 'featured',
    verifiedListing: true
  },
  {
    id: 'lst-2',
    title: 'BMW 3 Series 330i M Sport (2021) - Low Mileage',
    description: 'Immaculate 2021 BMW 3 Series 330i with premium M Sport Package. Mineral Grey metallic with black Dakota leather. Only 18,500 miles. Single owner, fully dealer maintained, clean title. Active driver assistance package and premium Harman Kardon surround audio system.',
    categoryId: 'cat-vehicles',
    subcategoryId: 'sub-veh-cars',
    price: 3450000,
    negotiable: true,
    condition: 'like_new',
    brand: 'BMW',
    model: '3 Series 330i',
    year: 2021,
    location: 'Bandra West, Mumbai (400050)',
    latitude: 19.0544,
    longitude: 72.8402,
    photos: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-2',
    sellerName: 'Bay Area Motors',
    sellerRating: 4.7,
    sellerVerified: true,
    views: 894,
    status: 'active',
    createdDate: '2026-07-14',
    expiryDate: '2026-09-14',
    boostStatus: 'boosted',
    verifiedListing: true
  },
  {
    id: 'lst-3',
    title: 'Modern 2BHK Apartment with Balcony & City Views',
    description: 'Beautiful 2 Bedroom, 2 Bathroom condo in SoMa. Features a spacious private balcony overlooking the city skylines. Fully equipped gourmet kitchen with Bosch appliances, quartz countertops, central AC, in-unit laundry, and 1 designated garage parking space. Building amenities include a fully equipped gym and 24/7 concierge.',
    categoryId: 'cat-property',
    subcategoryId: 'sub-prop-sale',
    price: 8500000,
    negotiable: true,
    condition: 'like_new',
    brand: 'Soma Grand',
    model: 'Penthouse B',
    year: 2018,
    location: 'Koramangala, Bengaluru (560034)',
    latitude: 12.9352,
    longitude: 77.6244,
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-3',
    sellerName: 'Apex Properties',
    sellerRating: 4.6,
    sellerVerified: true,
    views: 420,
    status: 'active',
    createdDate: '2026-07-10',
    expiryDate: '2026-10-10',
    boostStatus: 'featured',
    verifiedListing: true
  },
  {
    id: 'lst-4',
    title: 'Mid-Century Modern Leather Sofa',
    description: 'Authentic aniline top-grain Italian leather sofa in Cognac brown. Supported by tapered walnut-finished legs. Comfortably seats three. Extremely comfortable and has developed a beautiful subtle patina over its 2 years of usage. No scratches, tears, or pets.',
    categoryId: 'cat-furniture',
    subcategoryId: 'sub-furn-sofa',
    price: 45000,
    negotiable: true,
    condition: 'good',
    brand: 'Article',
    model: 'Sven',
    year: 2024,
    location: 'Indiranagar, Bengaluru (560038)',
    latitude: 12.9784,
    longitude: 77.6408,
    photos: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-4',
    sellerName: 'Sarah Jenkins',
    sellerRating: 4.9,
    sellerVerified: false,
    views: 185,
    status: 'active',
    createdDate: '2026-07-12',
    expiryDate: '2026-08-12',
    boostStatus: 'none',
    verifiedListing: false
  },
  {
    id: 'lst-5',
    title: 'Sony PlayStation 5 Console (Disc Edition) - 2 Controllers',
    description: 'Perfect condition Sony PS5 Disc edition. Bundled with 2 original DualSense controllers (White and Midnight Black) and all original power/HDMI cables. Includes 3 physical games: Marvel Spider-Man 2, Gran Turismo 7, and God of War Ragnarok. Well cleaned, original box included.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-elec-tv',
    price: 38000,
    negotiable: false,
    condition: 'good',
    brand: 'Sony',
    model: 'PlayStation 5 Disc',
    year: 2022,
    location: 'Andheri West, Mumbai (400053)',
    latitude: 19.1200,
    longitude: 72.8256,
    photos: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-5',
    sellerName: 'David Chen',
    sellerRating: 4.5,
    sellerVerified: false,
    views: 243,
    status: 'active',
    createdDate: '2026-07-13',
    expiryDate: '2026-08-13',
    boostStatus: 'none',
    verifiedListing: false
  },
  {
    id: 'lst-6',
    title: 'Canon EOS R6 Mirrorless Camera (Body Only)',
    description: 'Selling my Canon R6 professional body as I am upgrading. Barely used with a shutter count of only 4,500. Incredible low-light autofocus and 5-axis image stabilization. Comes with original strap, charger, 2 original Canon batteries, and box. Free of any dust or markings.',
    categoryId: 'cat-electronics',
    subcategoryId: 'sub-elec-cameras',
    price: 125000,
    negotiable: true,
    condition: 'like_new',
    brand: 'Canon',
    model: 'EOS R6',
    year: 2021,
    location: 'Adyar, Chennai (600020)',
    latitude: 13.0063,
    longitude: 80.2574,
    photos: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
    ],
    sellerId: 'user-6',
    sellerName: 'Visuals By Leo',
    sellerRating: 5.0,
    sellerVerified: true,
    views: 124,
    status: 'active',
    createdDate: '2026-07-15',
    expiryDate: '2026-08-15',
    boostStatus: 'none',
    verifiedListing: true
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat-1',
    listingId: 'lst-1',
    listingTitle: 'iPhone 15 Pro Max - 256GB',
    listingPrice: 95000,
    listingPhoto: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=150&auto=format&fit=crop&q=80',
    buyerId: 'user-curr',
    buyerName: 'Dinesh Mitra',
    sellerId: 'user-1',
    sellerName: 'Marcus Vance',
    lastMessageText: 'Is the phone available for pickup today?',
    lastMessageTime: '09:30 AM',
    unreadCount: 0
  },
  {
    id: 'chat-2',
    listingId: 'lst-4',
    listingTitle: 'Mid-Century Modern Sofa',
    listingPrice: 45000,
    listingPhoto: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=150&auto=format&fit=crop&q=80',
    buyerId: 'buyer-3',
    buyerName: 'Chloe Albright',
    sellerId: 'user-curr',
    sellerName: 'Dinesh Mitra',
    lastMessageText: 'Hi, would you take ₹40,000 if I pick it up this afternoon?',
    lastMessageTime: 'Yesterday',
    unreadCount: 1
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    chatId: 'chat-1',
    senderId: 'user-curr',
    text: 'Hello Marcus, I am interested in your iPhone 15 Pro. Is it still available?',
    timestamp: '09:15 AM',
    seen: true
  },
  {
    id: 'msg-2',
    chatId: 'chat-1',
    senderId: 'user-1',
    text: 'Hi Dinesh! Yes, it is still available. It is completely brand new and sealed.',
    timestamp: '09:20 AM',
    seen: true
  },
  {
    id: 'msg-3',
    chatId: 'chat-1',
    senderId: 'user-curr',
    text: 'That is great. Where is the pickup location?',
    timestamp: '09:25 AM',
    seen: true
  },
  {
    id: 'msg-4',
    chatId: 'chat-1',
    senderId: 'user-1',
    text: 'We can meet near Powell Street BART Station or inside the Westfield Mall. Safe public place.',
    timestamp: '09:28 AM',
    seen: true
  },
  {
    id: 'msg-5',
    chatId: 'chat-1',
    senderId: 'user-curr',
    text: 'Is the phone available for pickup today?',
    timestamp: '09:30 AM',
    seen: true
  }
];

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'plan-basic',
    name: 'Free Basic',
    price: 0,
    durationDays: 30,
    features: ['Post up to 5 listings', 'Standard Search visibility', 'Standard Support'],
    badgeColor: 'border-slate-300 text-slate-700 bg-slate-50'
  },
  {
    id: 'plan-boost',
    name: 'Ad Booster Pack',
    price: 499,
    durationDays: 14,
    features: ['High priority search ranking', 'Featured "Boosted" tag icon', 'Boost views up to 3x', 'Email alerts to matching buyers'],
    badgeColor: 'border-orange-500 text-orange-600 bg-orange-50'
  },
  {
    id: 'plan-featured',
    name: 'Featured Premium Slot',
    price: 1299,
    durationDays: 30,
    features: ['Displayed on home page Top Slider', 'Stunning Gold Highlight border', 'Max visibility (Up to 10x views)', 'SMS alert campaigns', 'Priority customer support 24/7'],
    badgeColor: 'border-amber-500 text-amber-600 bg-amber-50 shadow-amber-100'
  }
];

export const MOCK_USER_PROFILES: UserProfile[] = [
  CURRENT_USER,
  {
    id: 'user-1',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 012-3456',
    fullName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    location: 'Connaught Place, New Delhi (110001)',
    role: 'seller',
    rating: 4.9,
    joinedDate: '2023-05-15',
    verified: true,
    isPremium: true,
    walletBalance: 24500.00
  },
  {
    id: 'user-2',
    email: 'bayarea@example.com',
    phone: '+1 (555) 098-7654',
    fullName: 'Bay Area Motors',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    location: 'Bandra West, Mumbai (400050)',
    role: 'seller',
    rating: 4.7,
    joinedDate: '2024-02-10',
    verified: true,
    isPremium: true,
    walletBalance: 125000.00
  },
  {
    id: 'user-3',
    email: 'apex@example.com',
    phone: '+1 (555) 024-6810',
    fullName: 'Apex Properties',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    location: 'Koramangala, Bengaluru (560034)',
    role: 'seller',
    rating: 4.6,
    joinedDate: '2021-11-20',
    verified: true,
    isPremium: true,
    walletBalance: 87500.00
  },
  {
    id: 'user-4',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 013-5791',
    fullName: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    location: 'Indiranagar, Bengaluru (560038)',
    role: 'seller',
    rating: 4.9,
    joinedDate: '2025-07-01',
    verified: false,
    isPremium: false,
    walletBalance: 3200.00
  },
  {
    id: 'user-5',
    email: 'dchen@example.com',
    phone: '+1 (555) 014-6802',
    fullName: 'David Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    location: 'Andheri West, Mumbai (400053)',
    role: 'seller',
    rating: 4.5,
    joinedDate: '2025-10-12',
    verified: false,
    isPremium: false,
    walletBalance: 1500.00
  },
  {
    id: 'user-6',
    email: 'leo.visuals@example.com',
    phone: '+1 (555) 015-7913',
    fullName: 'Visuals By Leo',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    location: 'Adyar, Chennai (600020)',
    role: 'seller',
    rating: 5.0,
    joinedDate: '2022-09-01',
    verified: true,
    isPremium: true,
    walletBalance: 45000.00
  }
];
