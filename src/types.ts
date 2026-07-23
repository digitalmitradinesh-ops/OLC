/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  profilePhotoUrl?: string;
  location?: string;
  role: 'buyer' | 'seller' | 'business' | 'dealer' | 'shop' | 'property_agent' | 'car_dealer' | 'admin' | 'moderator';
  rating?: number;
  joinedDate?: string;
  verified: boolean;
  isPremium: boolean;
  walletBalance?: number;
  managerPermissions?: {
    manageListings: boolean;
    manageCategories: boolean;
    manageBranding: boolean;
    viewMetrics: boolean;
    manageIntegrations?: boolean;
  };
  status?: 'active' | 'suspended';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  price: number;
  negotiable: boolean;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  brand?: string;
  model?: string;
  year?: number;
  location: string;
  latitude: number;
  longitude: number;
  photos: string[];
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerVerified: boolean;
  views: number;
  status: 'active' | 'pending' | 'sold' | 'paused';
  createdDate: string;
  expiryDate: string;
  boostStatus: 'none' | 'boosted' | 'featured';
  verifiedListing: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  seen: boolean;
}

export interface Chat {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingPhoto: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface SavedSearch {
  id: string;
  query: string;
  filters: Record<string, string | number | boolean>;
  userId: string;
  createdDate: string;
}

export interface Review {
  id: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdDate: string;
}

export interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string[];
  badgeColor: string;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  planName: string;
  status: 'success' | 'failed' | 'pending';
  method: 'stripe' | 'razorpay' | 'upi' | 'wallet';
  date: string;
  invoiceUrl?: string;
}
