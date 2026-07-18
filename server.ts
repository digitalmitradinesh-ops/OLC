/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Secure Crypto Helper Functions
const AUTH_SECRET_SALT = process.env.AUTH_SECRET_SALT || 'secure_salt_classifieds_app_2026';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateSessionToken(userId: string, role: string): string {
  const payload = `${userId}:${role}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET_SALT).update(payload).digest('hex');
  return `${btoa(payload)}.${signature}`;
}

function verifySessionToken(token: string): { userId: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const payloadEncoded = parts[0];
    const signature = parts[1];
    
    const payload = atob(payloadEncoded);
    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET_SALT).update(payload).digest('hex');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const [userId, role, timestampStr] = payload.split(':');
    const timestamp = parseInt(timestampStr, 10);
    
    // Check for expiration (e.g., 24 hours)
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return { userId, role };
  } catch (e) {
    return null;
  }
}

// User accounts database definition
interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  phone: string;
  fullName: string;
  avatarUrl: string;
  profilePhotoUrl?: string;
  location: string;
  role: 'buyer' | 'seller' | 'business' | 'dealer' | 'shop' | 'property_agent' | 'car_dealer' | 'admin' | 'moderator';
  rating: number;
  joinedDate: string;
  verified: boolean;
  isPremium: boolean;
  walletBalance: number;
  managerPermissions?: {
    manageListings: boolean;
    manageCategories: boolean;
    manageBranding: boolean;
    viewMetrics: boolean;
  };
  status?: 'active' | 'suspended';
}

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-curr',
    email: 'digitalmitradinesh@gmail.com',
    passwordHash: hashPassword('Admin@123'),
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
  },
  {
    id: 'user-1',
    email: 'marcus.vance@example.com',
    passwordHash: hashPassword('Seller@123'),
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
    id: 'user-4',
    email: 'sarah.j@example.com',
    passwordHash: hashPassword('Buyer@123'),
    phone: '+1 (555) 013-5791',
    fullName: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    location: 'Indiranagar, Bengaluru (560038)',
    role: 'buyer',
    rating: 4.9,
    joinedDate: '2025-07-01',
    verified: false,
    isPremium: false,
    walletBalance: 3200.00
  },
  {
    id: 'user-mod',
    email: 'moderator@example.com',
    passwordHash: hashPassword('Mod@123'),
    phone: '+1 (555) 018-9999',
    fullName: 'Alex Miller',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    location: 'Adyar, Chennai (600020)',
    role: 'moderator',
    rating: 4.5,
    joinedDate: '2024-08-10',
    verified: true,
    isPremium: false,
    walletBalance: 8000.00,
    managerPermissions: {
      manageListings: true,
      manageCategories: true,
      manageBranding: false,
      viewMetrics: false
    },
    status: 'active'
  },
  {
    id: 'user-biz',
    email: 'business@example.com',
    passwordHash: hashPassword('Biz@123'),
    phone: '+91 98765 43210',
    fullName: 'Reliance Digital Store',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    location: 'Sector 62, Noida (201301)',
    role: 'business',
    rating: 4.7,
    joinedDate: '2025-01-20',
    verified: true,
    isPremium: true,
    walletBalance: 50000.00
  },
  {
    id: 'user-dealer',
    email: 'dealer@example.com',
    passwordHash: hashPassword('Dealer@123'),
    phone: '+91 99999 88888',
    fullName: 'Apex Wholesale Distributors',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    location: 'Okhla Phase 3, New Delhi (110020)',
    role: 'dealer',
    rating: 4.6,
    joinedDate: '2024-11-05',
    verified: true,
    isPremium: false,
    walletBalance: 32000.00
  },
  {
    id: 'user-shop',
    email: 'shop@example.com',
    passwordHash: hashPassword('Shop@123'),
    phone: '+91 88888 77777',
    fullName: 'Royal Furniture Hub',
    avatarUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=150&auto=format&fit=crop&q=80',
    location: 'Kirti Nagar, New Delhi (110015)',
    role: 'shop',
    rating: 4.8,
    joinedDate: '2023-09-12',
    verified: true,
    isPremium: true,
    walletBalance: 18000.00
  },
  {
    id: 'user-agent',
    email: 'agent@example.com',
    passwordHash: hashPassword('Agent@123'),
    phone: '+91 77777 66666',
    fullName: 'Gupta Estates Realty',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    location: 'Gurugram Sector 45, Haryana (122003)',
    role: 'property_agent',
    rating: 4.9,
    joinedDate: '2024-02-14',
    verified: true,
    isPremium: true,
    walletBalance: 45000.00
  },
  {
    id: 'user-cardealer',
    email: 'cardealer@example.com',
    passwordHash: hashPassword('Car@123'),
    phone: '+91 66666 55555',
    fullName: 'Express Premium Wheels',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    location: 'Dwarka Sector 10, New Delhi (110075)',
    role: 'car_dealer',
    rating: 4.8,
    joinedDate: '2025-03-01',
    verified: true,
    isPremium: true,
    walletBalance: 75000.00
  }
];

// In-memory accounts storage
const userAccountsMap = new Map<string, UserAccount>();
DEFAULT_ACCOUNTS.forEach(acc => userAccountsMap.set(acc.email.toLowerCase(), acc));

// Custom Gemini API Keys stored per Admin Email ID
const adminGeminiKeysMap = new Map<string, string>();

// Initialize default admin key from process.env if available
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  adminGeminiKeysMap.set('digitalmitradinesh@gmail.com', process.env.GEMINI_API_KEY);
}

// Function to resolve the active API Key
function getActiveGeminiApiKey(): string | undefined {
  // Check the default admin email key first
  const defaultKey = adminGeminiKeysMap.get('digitalmitradinesh@gmail.com');
  if (defaultKey && defaultKey !== 'MY_GEMINI_API_KEY' && defaultKey.trim() !== '') {
    return defaultKey;
  }
  
  // Or check any other admin-defined keys
  for (const [email, key] of adminGeminiKeysMap.entries()) {
    if (key && key !== 'MY_GEMINI_API_KEY' && key.trim() !== '') {
      return key;
    }
  }

  // Fallback to process.env
  return process.env.GEMINI_API_KEY;
}

// Dynamic robots.txt Router endpoint for crawler bots
app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /chats/

Sitemap: ${protocol}://${host}/sitemap.xml
`);
});

// Dynamic sitemap.xml Router endpoint containing active catalog taxonomies
app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;
  const now = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/sell', changefreq: 'weekly', priority: '0.8' },
    { loc: '/chats', changefreq: 'daily', priority: '0.6' },
    { loc: '/directory', changefreq: 'weekly', priority: '0.7' }
  ];

  const categories = [
    { slug: 'mobiles', priority: '0.9' },
    { slug: 'vehicles', priority: '0.9' },
    { slug: 'property', priority: '0.9' },
    { slug: 'electronics', priority: '0.9' },
    { slug: 'jobs', priority: '0.8' },
    { slug: 'furniture', priority: '0.8' }
  ];

  const listingIds = ['lst-1', 'lst-2', 'lst-3', 'lst-4', 'lst-5', 'lst-6', 'lst-7', 'lst-8'];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static routes
  staticUrls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${url.loc}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add category routes
  categories.forEach(cat => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/category/${cat.slug}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${cat.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  // Add listing details routes
  listingIds.forEach(id => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/listing/${id}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  res.type('application/xml');
  res.send(xml);
});

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Secure Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const account = userAccountsMap.get(email.toLowerCase());
  if (!account) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Account not found.' });
  }

  if (account.status === 'suspended') {
    return res.status(403).json({ success: false, message: 'Your manager account access has been suspended by the Website Administrator.' });
  }

  const inputHash = hashPassword(password);
  if (account.passwordHash !== inputHash) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
  }

  const token = generateSessionToken(account.id, account.role);
  
  // Return user details (without password hash)
  const { passwordHash, ...userProfile } = account;
  res.json({
    success: true,
    message: 'Authenticated successfully',
    token,
    user: userProfile
  });
});

// Secure Registration Endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName, role, phone, location } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ success: false, message: 'Required fields missing: email, password, fullName, and role are required' });
  }

  if (userAccountsMap.has(email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Email address already registered' });
  }

  const allowedRoles = ['buyer', 'seller', 'admin', 'moderator'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role selection' });
  }

  const newUserId = `user-${Date.now()}`;
  const newAccount: UserAccount = {
    id: newUserId,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    phone: phone || '+91 (555) 000-0000',
    fullName,
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    location: location || 'All India',
    role: role as 'buyer' | 'seller' | 'admin' | 'moderator',
    rating: 5.0,
    joinedDate: new Date().toISOString().split('T')[0],
    verified: false,
    isPremium: false,
    walletBalance: 0.00
  };

  userAccountsMap.set(email.toLowerCase(), newAccount);

  const { passwordHash, ...userProfile } = newAccount;
  res.json({
    success: true,
    message: 'Account created successfully',
    user: userProfile
  });
});

// Secure Session Verification Endpoint
app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }

  // Find user details
  let foundUser: UserAccount | undefined;
  for (const acc of userAccountsMap.values()) {
    if (acc.id === session.userId) {
      foundUser = acc;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ success: false, message: 'Authenticated user profile not found' });
  }

  const { passwordHash, ...userProfile } = foundUser;
  res.json({
    success: true,
    user: userProfile
  });
});

// Secure Profile Update Endpoint
app.post('/api/auth/update-profile', (req, res) => {
  const { token, fullName, phone, location, avatarUrl, profilePhotoUrl } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const session = verifySessionToken(token);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }

  // Find user details in map
  let foundUser: UserAccount | undefined;
  let emailKey: string | undefined;
  for (const [email, acc] of userAccountsMap.entries()) {
    if (acc.id === session.userId) {
      foundUser = acc;
      emailKey = email;
      break;
    }
  }

  if (!foundUser || !emailKey) {
    return res.status(404).json({ success: false, message: 'User profile not found' });
  }

  // Update allowed fields
  if (fullName !== undefined) foundUser.fullName = fullName;
  if (phone !== undefined) foundUser.phone = phone;
  if (location !== undefined) foundUser.location = location;
  if (avatarUrl !== undefined) foundUser.avatarUrl = avatarUrl;
  if (profilePhotoUrl !== undefined) foundUser.profilePhotoUrl = profilePhotoUrl;
  if (req.body.verified !== undefined) foundUser.verified = req.body.verified;

  // Save back to in-memory store
  userAccountsMap.set(emailKey, foundUser);

  const { passwordHash, ...userProfile } = foundUser;
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: userProfile
  });
});

// Store active OTPs in-memory (expires after 10 minutes)
const pendingOtps = new Map<string, { otp: string; expires: number }>();

// Forgot Password API Endpoint (Email or Mobile OTP)
app.post('/api/auth/forgot-password', (req, res) => {
  const { identifier, method } = req.body; // method is 'email' | 'mobile'

  if (!identifier || !method) {
    return res.status(400).json({ success: false, message: 'Identifier and reset method are required.' });
  }

  // Find user by email or phone
  let foundUser: UserAccount | undefined;
  const searchKey = identifier.trim().toLowerCase();

  for (const acc of userAccountsMap.values()) {
    if (method === 'email' && acc.email.toLowerCase() === searchKey) {
      foundUser = acc;
      break;
    } else if (method === 'mobile') {
      // Normalize phone number comparisons (digits only or direct trim comparison)
      const cleanPhone = acc.phone.replace(/[^0-9]/g, '');
      const cleanInput = identifier.replace(/[^0-9]/g, '');
      if (cleanPhone === cleanInput || acc.phone.trim() === identifier.trim()) {
        foundUser = acc;
        break;
      }
    }
  }

  if (!foundUser) {
    return res.status(404).json({ 
      success: false, 
      message: `No active account found with the registered ${method === 'email' ? 'email address' : 'mobile number'}.` 
    });
  }

  // Generate a random 6-digit OTP code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOtps.set(searchKey, {
    otp: otpCode,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes expiration
  });

  res.json({
    success: true,
    message: `A secure verification code has been dispatched to your ${method === 'email' ? 'email' : 'mobile device'} (simulated).`,
    otp: otpCode, // Send back in sandbox response for seamless client-side verification
    method
  });
});

// Reset Password API Endpoint
app.post('/api/auth/reset-password', (req, res) => {
  const { identifier, otp, newPassword } = req.body;

  if (!identifier || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Identifier, verification OTP, and new password are required.' });
  }

  const searchKey = identifier.trim().toLowerCase();
  const pending = pendingOtps.get(searchKey);

  if (!pending) {
    return res.status(400).json({ success: false, message: 'No pending reset request found for this account.' });
  }

  if (pending.expires < Date.now()) {
    pendingOtps.delete(searchKey);
    return res.status(400).json({ success: false, message: 'The verification code has expired. Please request a new one.' });
  }

  if (pending.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your spelling and try again.' });
  }

  // Find the user account to update
  let foundUserKey: string | undefined;
  let foundUser: UserAccount | undefined;

  for (const [email, acc] of userAccountsMap.entries()) {
    if (acc.email.toLowerCase() === searchKey) {
      foundUser = acc;
      foundUserKey = email;
      break;
    } else {
      const cleanPhone = acc.phone.replace(/[^0-9]/g, '');
      const cleanInput = identifier.replace(/[^0-9]/g, '');
      if (cleanPhone === cleanInput || acc.phone.trim() === identifier.trim()) {
        foundUser = acc;
        foundUserKey = email;
        break;
      }
    }
  }

  if (!foundUser || !foundUserKey) {
    return res.status(404).json({ success: false, message: 'The associated user account could not be found.' });
  }

  // Set the new hashed password
  foundUser.passwordHash = hashPassword(newPassword);
  userAccountsMap.set(foundUserKey, foundUser);

  // Clear OTP from memory
  pendingOtps.delete(searchKey);

  res.json({
    success: true,
    message: 'Your password has been reset and cryptographically secured. You can now log in.'
  });
});

// Admin Gemini API Key Configuration Endpoints
app.post('/api/admin/gemini-config', (req, res) => {
  const { token, geminiApiKey } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const session = verifySessionToken(token);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Invalid token or unauthorized access. Admin role required.' });
  }

  let foundUser: UserAccount | undefined;
  for (const acc of userAccountsMap.values()) {
    if (acc.id === session.userId) {
      foundUser = acc;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ success: false, message: 'Admin account not found' });
  }

  const email = foundUser.email.toLowerCase();
  if (geminiApiKey !== undefined) {
    adminGeminiKeysMap.set(email, geminiApiKey.trim());
    return res.json({
      success: true,
      message: `Gemini API Key successfully updated for Admin email: ${email}`,
      hasKey: geminiApiKey.trim() !== ''
    });
  } else {
    return res.status(400).json({ success: false, message: 'geminiApiKey is required' });
  }
});

app.post('/api/admin/get-gemini-config', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const session = verifySessionToken(token);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Invalid token or unauthorized access. Admin role required.' });
  }

  let foundUser: UserAccount | undefined;
  for (const acc of userAccountsMap.values()) {
    if (acc.id === session.userId) {
      foundUser = acc;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ success: false, message: 'Admin account not found' });
  }

  const email = foundUser.email.toLowerCase();
  const rawKey = adminGeminiKeysMap.get(email) || '';
  
  let maskedKey = '';
  if (rawKey) {
    maskedKey = rawKey.length > 8 
      ? `${rawKey.slice(0, 6)}...${rawKey.slice(-4)}` 
      : '••••••••';
  }

  res.json({
    success: true,
    email,
    hasKey: rawKey !== '',
    maskedKey
  });
});

// Admin Website Managers management API Endpoints
app.post('/api/admin/managers/list', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const session = verifySessionToken(token);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Admin role required.' });
  }

  const managers = [];
  for (const acc of userAccountsMap.values()) {
    if (acc.role === 'moderator') {
      const { passwordHash, ...profile } = acc;
      managers.push(profile);
    }
  }
  res.json({ success: true, managers });
});

app.post('/api/admin/managers/create', (req, res) => {
  const { token, email, password, fullName, phone, location, permissions } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const session = verifySessionToken(token);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Admin role required.' });
  }

  if (!email || !password || !fullName) {
    return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
  }

  if (userAccountsMap.has(email.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
  }

  const newUserId = `user-manager-${Date.now()}`;
  const defaultPermissions = {
    manageListings: true,
    manageCategories: true,
    manageBranding: false,
    viewMetrics: false
  };

  const newManager: UserAccount = {
    id: newUserId,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    phone: phone || '+91 99999 00000',
    fullName,
    avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80`,
    location: location || 'All India',
    role: 'moderator',
    rating: 5.0,
    joinedDate: new Date().toISOString().split('T')[0],
    verified: true,
    isPremium: false,
    walletBalance: 0.00,
    managerPermissions: permissions || defaultPermissions,
    status: 'active'
  };

  userAccountsMap.set(email.toLowerCase(), newManager);

  const { passwordHash, ...profile } = newManager;
  res.json({
    success: true,
    message: 'Website Manager account created successfully and granted secure credentials.',
    manager: profile
  });
});

app.post('/api/admin/managers/update', (req, res) => {
  const { token, id, fullName, phone, location, permissions, status } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const session = verifySessionToken(token);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Admin role required.' });
  }

  if (!id) {
    return res.status(400).json({ success: false, message: 'Website Manager User ID is required.' });
  }

  let foundManagerKey: string | undefined;
  let foundManager: UserAccount | undefined;

  for (const [email, acc] of userAccountsMap.entries()) {
    if (acc.id === id && acc.role === 'moderator') {
      foundManager = acc;
      foundManagerKey = email;
      break;
    }
  }

  if (!foundManager || !foundManagerKey) {
    return res.status(404).json({ success: false, message: 'Website Manager account not found.' });
  }

  if (fullName !== undefined) foundManager.fullName = fullName;
  if (phone !== undefined) foundManager.phone = phone;
  if (location !== undefined) foundManager.location = location;
  if (permissions !== undefined) foundManager.managerPermissions = permissions;
  if (status !== undefined) foundManager.status = status;

  userAccountsMap.set(foundManagerKey, foundManager);

  const { passwordHash, ...profile } = foundManager;
  res.json({
    success: true,
    message: 'Website Manager privileges and profile updated successfully.',
    manager: profile
  });
});

app.post('/api/admin/managers/delete', (req, res) => {
  const { token, id } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const session = verifySessionToken(token);
  if (!session || session.role !== 'admin') {
    return res.status(401).json({ success: false, message: 'Unauthorized access. Admin role required.' });
  }

  if (!id) {
    return res.status(400).json({ success: false, message: 'Website Manager User ID is required.' });
  }

  let foundManagerKey: string | undefined;
  for (const [email, acc] of userAccountsMap.entries()) {
    if (acc.id === id && acc.role === 'moderator') {
      foundManagerKey = email;
      break;
    }
  }

  if (!foundManagerKey) {
    return res.status(404).json({ success: false, message: 'Website Manager account not found.' });
  }

  userAccountsMap.delete(foundManagerKey);
  res.json({
    success: true,
    message: 'Website Manager account and system access deleted and revoked successfully.'
  });
});

// Gemini AI Helper Endpoint (Proxies requests securely from Server-Side)
app.post('/api/gemini/helper', async (req, res) => {
  const { type, title, brand, condition, description } = req.body;
  const apiKey = getActiveGeminiApiKey();

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    console.warn('GEMINI_API_KEY is not configured or is placeholder. Falling back to offline generation.');
    // Graceful offline fallback
    if (type === 'describe') {
      return res.json({
        description: `★ Pristine ${title} ★\n\nCondition: ${condition?.toUpperCase() || 'GOOD'}\nBrand: ${brand || 'Genuine'}\n\nThis high-quality product is ready for immediate purchase. Fully operational, well-maintained, and has absolutely no functional flaws or marks. Pick up locally or request safe viewing.\n\nHighlights:\n- Premium build quality\n- Tested and certified working\n- Fast local delivery/meetup options`
      });
    } else if (type === 'price') {
      return res.json({
        priceRange: `₹${Math.round(100 * 0.85)} - ₹${Math.round(100 * 1.15)}`
      });
    } else if (type === 'category') {
      return res.json({
        categoryName: 'Electronics & Appliances'
      });
    }
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let prompt = '';
    if (type === 'describe') {
      prompt = `Draft a modern, professional, scannable, bulleted advertisement listing description for this product:\nTitle: ${title}\nBrand: ${brand || 'N/A'}\nCondition: ${condition || 'N/A'}.\nEnsure it looks extremely professional, appealing, and ready for an OLX/Facebook Marketplace listing. Do not include pricing, only description features.`;
    } else if (type === 'price') {
      prompt = `Based on current online markets, suggest a fair pricing range in Indian Rupees (low-end to high-end) for a classified listing with these parameters:\nTitle: ${title}\nBrand: ${brand || 'N/A'}\nCondition: ${condition || 'N/A'}.\nFormat the response as only a simple range like "₹Min - ₹Max" with a one-sentence rationale.`;
    } else if (type === 'category') {
      prompt = `Suggest the best single product category from the following list for a classifieds app:\n["Mobiles & Tablets", "Vehicles", "Property", "Electronics & Appliances", "Jobs", "Home & Furniture"]\nProduct: ${title}\nBrand: ${brand || 'N/A'}.\nFormat response as only the category name itself.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const resultText = response.text || '';

    if (type === 'describe') {
      res.json({ description: resultText.trim() });
    } else if (type === 'price') {
      res.json({ priceRange: resultText.trim() });
    } else if (type === 'category') {
      res.json({ categoryName: resultText.trim() });
    } else {
      res.status(400).json({ error: 'Unsupported helper type' });
    }

  } catch (error: any) {
    console.error('Error contacting Gemini service:', error);
    res.status(500).json({ 
      error: 'Failed to generate content from Gemini',
      message: error.message
    });
  }
});

// API Endpoint for AI-powered Semantic Search
app.post('/api/gemini/search', async (req, res) => {
  const { query, listings } = req.body;
  const apiKey = getActiveGeminiApiKey();

  if (!query || !listings || !Array.isArray(listings)) {
    return res.status(400).json({ error: 'Missing query or listings' });
  }

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    // Offline keyword & synonym-based semantic search fallback
    const terms = query.toLowerCase().split(/\s+/);
    const matched = listings.map(l => {
      let score = 0;
      const text = `${l.title} ${l.description} ${l.brand || ''}`.toLowerCase();
      
      // Synonym mappings for robust fallback matching
      const synonyms: Record<string, string[]> = {
        'phone': ['iphone', 'mobile', 'samsung', 'oneplus', 'galaxy', 'ios', 'android'],
        'car': ['vehicle', 'bmw', 'audi', 'maruti', 'honda', 'toyota', 'suv', 'sedan'],
        'laptop': ['computer', 'macbook', 'dell', 'lenovo', 'asus', 'hp', 'pc'],
        'furniture': ['sofa', 'chair', 'table', 'bed', 'wooden', 'couch', 'desk'],
        'gaming': ['playstation', 'xbox', 'ps5', 'rtx', 'graphic', 'console', 'nintendo']
      };

      terms.forEach(term => {
        if (text.includes(term)) {
          score += 10;
        }
        // Check synonym mappings
        for (const [key, words] of Object.entries(synonyms)) {
          if (term === key || key.includes(term)) {
            words.forEach(w => {
              if (text.includes(w)) score += 5;
            });
          }
          if (words.includes(term)) {
            if (text.includes(key)) score += 5;
          }
        }
      });

      return { id: l.id, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

    return res.json({ matches: matched });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const listingSummary = listings.map(l => ({
      id: l.id,
      title: l.title,
      description: l.description.slice(0, 100),
      brand: l.brand || ''
    }));

    const prompt = `You are an AI Search engine for a Classifieds local market app.
Your task is to rank the following listings by how well they semantically match the user's natural language search query.
Query: "${query}"

Listings:
${JSON.stringify(listingSummary, null, 2)}

Return a JSON array of objects, each containing:
- id: the listing id
- score: a match score between 0 and 100 representing relevance

Ensure the output is valid JSON format. Response must contain ONLY the raw JSON block without any markdown formatting.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    let cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const matched = JSON.parse(cleanJson);
    res.json({ matches: matched });

  } catch (error: any) {
    console.error('Gemini search failed, using fuzzy logic:', error);
    // fallback directly
    const terms = query.toLowerCase().split(/\s+/);
    const matched = listings.map(l => {
      let score = 0;
      const text = `${l.title} ${l.description}`.toLowerCase();
      terms.forEach(t => { if (text.includes(t)) score += 20; });
      return { id: l.id, score };
    }).filter(i => i.score > 0);
    res.json({ matches: matched });
  }
});

// API Endpoint for Ad Moderation, Spam, Fraud & Duplicate Detection
app.post('/api/gemini/analyze-ad', async (req, res) => {
  const { title, description, price, condition, brand, otherListings } = req.body;
  const apiKey = getActiveGeminiApiKey();

  const priceNum = parseFloat(price || '0');

  // Intelligent fallback helper
  const runOfflineAnalysis = () => {
    let spamScore = 0;
    let spamReasons: string[] = [];
    let fraudScore = 0;
    let fraudReasons: string[] = [];
    let duplicateDetected = false;
    let duplicateScore = 0;
    let duplicateAdId = null;

    const descLower = (description || '').toLowerCase();
    const titleLower = (title || '').toLowerCase();

    // 1. Spam Checks
    if (/[A-Z]{4,}/.test(title || '')) {
      spamScore += 25;
      spamReasons.push('Title contains excessive uppercase letters.');
    }
    if ((description || '').length < 15) {
      spamScore += 30;
      spamReasons.push('Listing description is suspiciously short.');
    }
    if (/buy now|click here|ref=/.test(descLower)) {
      spamScore += 20;
      spamReasons.push('Contains potential affiliate or external promotional links.');
    }
    if ((descLower.match(/\d{10}/) || []).length > 1) {
      spamScore += 15;
      spamReasons.push('Multiple phone numbers stuffed in description.');
    }

    // 2. Fraud Checks
    if (priceNum < 5000 && (titleLower.includes('iphone') || titleLower.includes('macbook') || titleLower.includes('bmw') || titleLower.includes('ps5') || titleLower.includes('sony'))) {
      fraudScore += 65;
      fraudReasons.push('Luxury or premium brand listed at an unrealistically cheap price.');
    }
    if (descLower.includes('wire transfer') || descLower.includes('advance payment') || descLower.includes('gpay first') || descLower.includes('courier deposit')) {
      fraudScore += 80;
      fraudReasons.push('Seller requests advance payment, deposit, or wire transfers before delivery.');
    }
    if (descLower.includes('no return') && descLower.includes('as is') && fraudScore > 20) {
      fraudScore += 10;
      fraudReasons.push('Strictly unverified local exchange with suspicious waivers.');
    }

    // 3. Duplicate Checks
    if (otherListings && Array.isArray(otherListings)) {
      for (const other of otherListings) {
        if (other.title.toLowerCase() === titleLower) {
          duplicateDetected = true;
          duplicateScore = 100;
          duplicateAdId = other.id;
          break;
        } else {
          // simple check
          const wordsThis = titleLower.split(/\s+/).filter(w => w.length > 3);
          const wordsOther = other.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const common = wordsThis.filter(w => wordsOther.includes(w));
          if (wordsThis.length > 0 && (common.length / wordsThis.length) > 0.75) {
            duplicateDetected = true;
            duplicateScore = Math.round((common.length / wordsThis.length) * 100);
            duplicateAdId = other.id;
            break;
          }
        }
      }
    }

    return {
      spamScore: Math.min(spamScore, 100),
      spamReason: spamReasons.join(' ') || 'Listing text looks clean and compliant.',
      fraudScore: Math.min(fraudScore, 100),
      fraudReason: fraudReasons.join(' ') || 'Standard pricing model. Recommended to complete transaction in public meetup.',
      duplicateDetected,
      duplicateScore,
      duplicateAdId
    };
  };

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return res.json(runOfflineAnalysis());
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const otherSummary = (otherListings || []).slice(0, 8).map((o: any) => ({ id: o.id, title: o.title }));

    const prompt = `Analyze this classified advertisement listing for potential Spam, Fraud/Scams, and Duplicates:
Title: "${title}"
Description: "${description}"
Price: "₹${price}"
Condition: "${condition}"
Brand: "${brand || 'N/A'}"

Compare against other recent active listing titles to check for duplicates:
${JSON.stringify(otherSummary, null, 2)}

Evaluate:
1. "spamScore" (0-100): High score means gibberish, heavy keyword stuffing, affiliate links, or promo spam.
2. "spamReason": Diagnostic reason for spam score.
3. "fraudScore" (0-100): High score means high risk of fraud (e.g. demanding advance wire transfer, cash-on-delivery deposit scam, extremely low prices for highly valued goods).
4. "fraudReason": Diagnostic reason for fraud score.
5. "duplicateDetected" (true/false): If title/description is nearly identical to one of the other listings.
6. "duplicateScore" (0-100): Similarity score with the closest match.
7. "duplicateAdId" (string/null): The ID of the listing it duplicates.

Response MUST be a single raw JSON object with these keys. No markdown backticks, no explanations outside of the JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    let cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);
    res.json(result);

  } catch (error: any) {
    console.error('Gemini ad analysis failed, using fallback:', error);
    res.json(runOfflineAnalysis());
  }
});

// Setup Vite Dev Server / Static Asset Serving
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LocalMarket Classifieds Server] Running on http://localhost:${PORT}`);
  });
}

bootstrap();
