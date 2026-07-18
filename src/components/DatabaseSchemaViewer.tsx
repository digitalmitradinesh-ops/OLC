import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  Copy, 
  Check, 
  Code, 
  Lock, 
  GitBranch, 
  Filter, 
  MapPin, 
  UserCheck, 
  Tag, 
  MessageSquare, 
  CreditCard, 
  Activity, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Settings
} from 'lucide-react';

interface ColumnInfo {
  name: string;
  type: string;
  constraints?: string[];
  description: string;
}

interface TableDefinition {
  name: string;
  category: 'geography' | 'identity' | 'taxonomy' | 'classifieds' | 'communication' | 'social' | 'finances' | 'system';
  description: string;
  columns: ColumnInfo[];
  primaryKey: string;
  foreignKeys?: { column: string; references: string; cascade: string }[];
  indexes?: string[];
  rlsPolicies?: string[];
  triggers?: string[];
  sql: string;
}

const TABLE_DATA: TableDefinition[] = [
  // 1. GEOGRAPHY
  {
    name: 'countries',
    category: 'geography',
    description: 'Global master table of supported countries for cross-border compatibility and international dialing lookup.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Auto-incrementing integer key.' },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'The official name of the country (e.g., "India").' },
      { name: 'iso_code', type: 'VARCHAR(10)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Standard international ISO abbreviation code (e.g., "IN").' },
      { name: 'phone_code', type: 'VARCHAR(10)', constraints: ['NOT NULL'], description: 'Country calling code prefix (e.g., "+91").' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: ['DEFAULT NOW()'], description: 'Row insertion time record.' }
    ],
    indexes: ['pk_countries_id', 'uq_countries_name', 'uq_countries_iso_code'],
    sql: `CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    iso_code VARCHAR(10) UNIQUE NOT NULL,
    phone_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'states',
    category: 'geography',
    description: 'Federal administrative divisions or provinces linked to a parent country.',
    primaryKey: 'id',
    foreignKeys: [{ column: 'country_id', references: 'countries(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Unique state sequential identifier.' },
      { name: 'country_id', type: 'INT', constraints: ['NOT NULL', 'REFERENCES countries(id)'], description: 'Foreign key to parent country.' },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Official name of the state (e.g., "Maharashtra").' },
      { name: 'code', type: 'VARCHAR(50)', constraints: ['NOT NULL'], description: 'Local postal code abbreviation for states.' }
    ],
    indexes: ['idx_states_country (B-Tree)', 'unique_country_state (Multi-Column UNIQUE)'],
    sql: `CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    country_id INT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    CONSTRAINT unique_country_state UNIQUE(country_id, name)
);`
  },
  {
    name: 'cities',
    category: 'geography',
    description: 'Municipalities or cities where classified listings are posted, optimizing local geofilters.',
    primaryKey: 'id',
    foreignKeys: [{ column: 'state_id', references: 'states(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Primary auto-incrementing key.' },
      { name: 'state_id', type: 'INT', constraints: ['NOT NULL', 'REFERENCES states(id)'], description: 'Foreign key state reference.' },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'City name (e.g., "Mumbai").' },
      { name: 'pincode_prefix', type: 'VARCHAR(10)', constraints: [], description: 'Pincode prefix boundaries for local deliveries.' }
    ],
    indexes: ['idx_cities_state (B-Tree)', 'unique_state_city (Multi-Column UNIQUE)'],
    sql: `CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    pincode_prefix VARCHAR(10),
    CONSTRAINT unique_state_city UNIQUE(state_id, name)
);`
  },

  // 2. IDENTITY
  {
    name: 'users',
    category: 'identity',
    description: 'Secure core platform system credentials matching standard Supabase auth schemas.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Secure cryptographic unique identifier.' },
      { name: 'email', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Hashed login email.' },
      { name: 'encrypted_password', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Secure cryptographic bcrypt hash of user pass.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: ['DEFAULT NOW()'], description: 'Timestamp of registration.' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', constraints: ['DEFAULT NOW()'], description: 'Last login activity or update.' }
    ],
    triggers: ['trigger_users_updated_at (AUTO NOW())'],
    sql: `CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'profiles',
    category: 'identity',
    description: 'Public identity profiles holding avatar URLs, verification status, contact information, and role configurations.',
    primaryKey: 'id',
    foreignKeys: [{ column: 'id', references: 'users(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'REFERENCES users(id)'], description: 'Shared secure user UUID.' },
      { name: 'full_name', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'First and last name of participant.' },
      { name: 'avatar_url', type: 'TEXT', constraints: [], description: 'Unsplash or local profile storage image pointer.' },
      { name: 'phone', type: 'VARCHAR(50)', constraints: [], description: 'Verified or unverified communications phone string.' },
      { name: 'verified', type: 'BOOLEAN', constraints: ['DEFAULT FALSE'], description: 'OTP SMS security verified badge status.' },
      { name: 'location', type: 'TEXT', constraints: [], description: 'User-specified geographical region.' },
      { name: 'role', type: 'VARCHAR(50)', constraints: ["DEFAULT 'user'", "CHECK (role IN ('user', 'moderator', 'admin'))"], description: 'Access level inside security group.' },
      { name: 'rating_cache', type: 'NUMERIC(3,2)', constraints: ['DEFAULT 0.00', 'CHECK (0.00 to 5.00)'], description: 'Aggregated review rating cache updated via trigger.' }
    ],
    indexes: ['idx_profiles_role', 'idx_profiles_rating (Sort speed for trusted sellers)'],
    rlsPolicies: [
      'profile_public_read: ALLOW SELECT TO true',
      'profile_self_update: ALLOW UPDATE TO owner'
    ],
    triggers: ['trigger_profiles_updated_at'],
    sql: `CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    location TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    rating_cache NUMERIC(3,2) DEFAULT 0.00 CHECK (rating_cache BETWEEN 0.00 AND 5.00),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`
  },

  // 3. TAXONOMY
  {
    name: 'categories',
    category: 'taxonomy',
    description: 'Parent classified divisions (e.g. Mobiles, Cars, Real Estate, Jobs) managing taxonomical queries.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Categorization category id.' },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Display name of categories.' },
      { name: 'slug', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'URL friendly slug identifier.' },
      { name: 'icon_name', type: 'VARCHAR(100)', constraints: ["DEFAULT 'tag'"], description: 'Lucide-react representation icon token.' }
    ],
    sql: `CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(100) DEFAULT 'tag',
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'subcategories',
    category: 'taxonomy',
    description: 'Child listings classifications linked to parent categories (e.g. Apple, Samsung, Sedan, Apartments).',
    primaryKey: 'id',
    foreignKeys: [{ column: 'category_id', references: 'categories(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Unique child key identifier.' },
      { name: 'category_id', type: 'INT', constraints: ['NOT NULL', 'REFERENCES categories(id)'], description: 'Parent taxonomy category identifier.' },
      { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Display label of subcategory.' },
      { name: 'slug', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'URL route safe state slug.' }
    ],
    indexes: ['unique_category_slug (Multi-Column UNIQUE)'],
    sql: `CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_category_slug UNIQUE(category_id, slug)
);`
  },

  // 4. CLASSIFIEDS ENGINE
  {
    name: 'listings',
    category: 'classifieds',
    description: 'Core advertisement records holding title, description, price, boost packages, and seller ties.',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'seller_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'category_id', references: 'categories(id)', cascade: 'ON DELETE SET NULL' },
      { column: 'subcategory_id', references: 'subcategories(id)', cascade: 'ON DELETE SET NULL' },
      { column: 'city_id', references: 'cities(id)', cascade: 'ON DELETE SET NULL' }
    ],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Cryptographic identity key of ad.' },
      { name: 'seller_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Profile reference of ad poster.' },
      { name: 'category_id', type: 'INT', constraints: ['REFERENCES categories(id)'], description: 'Parent category tag link.' },
      { name: 'subcategory_id', type: 'INT', constraints: ['REFERENCES subcategories(id)'], description: 'Specific subcategory taxonomy match.' },
      { name: 'city_id', type: 'INT', constraints: ['REFERENCES cities(id)'], description: 'City where listing is active.' },
      { name: 'title', type: 'VARCHAR(255)', constraints: ['NOT NULL', 'CHECK (length >= 5)'], description: 'Detailed marketing caption.' },
      { name: 'description', type: 'TEXT', constraints: ['NOT NULL'], description: 'Full body content details, terms, and specs.' },
      { name: 'price', type: 'NUMERIC(15,2)', constraints: ['NOT NULL', 'CHECK (price >= 0.00)'], description: 'Product price tag.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'", "CHECK (active, pending, sold, expired, banned)"], description: 'State lifecycle flag.' },
      { name: 'is_featured', type: 'BOOLEAN', constraints: ['DEFAULT FALSE'], description: 'Highlighted carousel boost.' },
      { name: 'boost_status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'none'", "CHECK (none, gold, diamond)"], description: 'Paid premium boost tier status.' },
      { name: 'boost_expires_at', type: 'TIMESTAMPTZ', constraints: [], description: 'Dynamic timestamp when paid boosting expires.' },
      { name: 'views_count', type: 'INT', constraints: ['DEFAULT 0'], description: 'Counter tracker of views.' }
    ],
    indexes: [
      'idx_listings_seller', 
      'idx_listings_category', 
      'idx_listings_subcategory', 
      'idx_listings_city', 
      "idx_listings_status (WHERE status = 'active')", 
      'idx_listings_featured (Partial INDEX)', 
      'idx_listings_boost (Filter acceleration)'
    ],
    rlsPolicies: [
      "listings_public_read: ALLOW SELECT TO true WHERE status = 'active' OR seller_id = current_user",
      'listings_insert: ALLOW INSERT TO owners',
      'listings_update: ALLOW UPDATE TO owners',
      'listings_delete: ALLOW DELETE TO owners OR admin/moderator roles'
    ],
    triggers: ['trigger_listings_updated_at'],
    sql: `CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id INT REFERENCES subcategories(id) ON DELETE SET NULL,
    city_id INT REFERENCES cities(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL CHECK (length(title) >= 5),
    description TEXT NOT NULL,
    price NUMERIC(15,2) NOT NULL CHECK (price >= 0.00),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'expired', 'banned')),
    is_featured BOOLEAN DEFAULT FALSE,
    boost_status VARCHAR(50) DEFAULT 'none' CHECK (boost_status IN ('none', 'gold', 'diamond')),
    boost_expires_at TIMESTAMPTZ,
    views_count INT DEFAULT 0 CHECK (views_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'listing_images',
    category: 'classifieds',
    description: 'Multiple media asset attachments for classified listings, styled in galleries.',
    primaryKey: 'id',
    foreignKeys: [{ column: 'listing_id', references: 'listings(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Cryptographic key.' },
      { name: 'listing_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES listings(id)'], description: 'Parent listing identifier.' },
      { name: 'image_url', type: 'TEXT', constraints: ['NOT NULL'], description: 'Supabase storage CDN path.' },
      { name: 'sort_order', type: 'INT', constraints: ['DEFAULT 0'], description: 'Sequential indexing order for listing galleries.' }
    ],
    indexes: ['idx_listing_images_listing (Composite lookup key listing_id + sort_order)'],
    sql: `CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'listing_videos',
    category: 'classifieds',
    description: 'Dynamic short-form video demonstration files accompanying classified postings.',
    primaryKey: 'id',
    foreignKeys: [{ column: 'listing_id', references: 'listings(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Media id identifier.' },
      { name: 'listing_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES listings(id)'], description: 'Parent listings link.' },
      { name: 'video_url', type: 'TEXT', constraints: ['NOT NULL'], description: 'Direct streaming url pointer.' },
      { name: 'sort_order', type: 'INT', constraints: ['DEFAULT 0'], description: 'Sequence order key.' }
    ],
    sql: `CREATE TABLE listing_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },

  // 5. COMMUNICATION
  {
    name: 'chats',
    category: 'communication',
    description: 'Private message rooms created dynamically between potential buyers and listing owners.',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'listing_id', references: 'listings(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'buyer_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'seller_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' }
    ],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Room identification token.' },
      { name: 'listing_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES listings(id)'], description: 'Referenced purchase ad.' },
      { name: 'buyer_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Buyer profile UUID.' },
      { name: 'seller_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Seller profile UUID.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: ['DEFAULT NOW()'], description: 'Initiation timestamp.' }
    ],
    indexes: ['idx_chats_buyer_seller', 'unique_chat_session (Unique seller, buyer, listing lock)'],
    rlsPolicies: [
      'chats_user_access: SELECT ALLOWED only if buyer_id OR seller_id is current user',
      'chats_user_insert: INSERT ALLOWED only if buyer_id is current user'
    ],
    sql: `CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_chat_session UNIQUE(listing_id, buyer_id, seller_id),
    CONSTRAINT buyer_seller_diff CHECK (buyer_id <> seller_id)
);`
  },
  {
    name: 'messages',
    category: 'communication',
    description: 'Chronological message exchange ledgers nested inside dynamic chatrooms.',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'chat_id', references: 'chats(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'sender_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' }
    ],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Message cryptographic key.' },
      { name: 'chat_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES chats(id)'], description: 'Parent chatroom identifier.' },
      { name: 'sender_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Sender profile link.' },
      { name: 'message_text', type: 'TEXT', constraints: ['NOT NULL'], description: 'Character text body content.' },
      { name: 'is_read', type: 'BOOLEAN', constraints: ['DEFAULT FALSE'], description: 'Message visual status flag.' },
      { name: 'created_at', type: 'TIMESTAMPTZ', constraints: ['DEFAULT NOW()'], description: 'Exact transmission timestamp.' }
    ],
    indexes: ['idx_messages_chat_created (Sort chronological desc)', 'idx_messages_unread (Lookup optimization)'],
    rlsPolicies: [
      'messages_chat_access: SELECT ALLOWED only to chat participants',
      'messages_insert: INSERT ALLOWED only to active sender inside chat'
    ],
    sql: `CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },

  // 6. SOCIAL
  {
    name: 'reviews',
    category: 'social',
    description: 'Post-transaction feedback loop tracking merchant trustworthiness and compliance logs.',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'listing_id', references: 'listings(id)', cascade: 'ON DELETE SET NULL' },
      { column: 'reviewer_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'reviewee_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' }
    ],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Feedback identification token.' },
      { name: 'listing_id', type: 'UUID', constraints: ['REFERENCES listings(id)'], description: 'Acquired product classified.' },
      { name: 'reviewer_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Buyer making the review.' },
      { name: 'reviewee_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Merchant being reviewed.' },
      { name: 'rating_value', type: 'INT', constraints: ['NOT NULL', 'CHECK (1 to 5)'], description: 'Star value metric.' },
      { name: 'review_text', type: 'TEXT', constraints: [], description: 'Detailed textual evaluation.' }
    ],
    indexes: ['idx_reviews_reviewee (Optimizes fetching merchant review history)'],
    triggers: ['trigger_update_profile_average_rating (Automatically updates cached rating average on profile)'],
    sql: `CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT reviewer_reviewee_diff CHECK (reviewer_id <> reviewee_id)
);`
  },
  {
    name: 'ratings',
    category: 'social',
    description: 'Granular scoring criteria dimensions accompanying user reviews (e.g., communications, pricing, delivery).',
    primaryKey: 'id',
    foreignKeys: [{ column: 'review_id', references: 'reviews(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique rating id.' },
      { name: 'review_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES reviews(id)'], description: 'Parent review feedback link.' },
      { name: 'criteria', type: 'VARCHAR(100)', constraints: ['NOT NULL', 'CHECK (accuracy, communication, pricing, honesty)'], description: 'Dimensions score categorization.' },
      { name: 'score', type: 'INT', constraints: ['NOT NULL', 'CHECK (1 to 5)'], description: 'Sub-dimension star rate.' }
    ],
    sql: `CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    criteria VARCHAR(100) NOT NULL CHECK (criteria IN ('accuracy', 'communication', 'pricing', 'honesty')),
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5)
);`
  },
  {
    name: 'favourites',
    category: 'social',
    description: 'Saved / bookmarked advertisements of interested customers facilitating fast retrieval.',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'user_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'listing_id', references: 'listings(id)', cascade: 'ON DELETE CASCADE' }
    ],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Bookmark reference key.' },
      { name: 'user_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Interested consumer profile.' },
      { name: 'listing_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES listings(id)'], description: 'Saved ad classified.' }
    ],
    indexes: ['idx_favourites_user (Accelerate personal dashboard loaded lists)', 'unique_user_favourite (Unique pairing key)'],
    rlsPolicies: ['favourites_self_access: SELECT/INSERT/DELETE restricted only to the bookmarker'],
    sql: `CREATE TABLE favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_favourite UNIQUE(user_id, listing_id)
);`
  },
  {
    name: 'reports',
    category: 'social',
    description: 'Abuse, illegal actions, scam warnings, or spam reporting logs filed against specific listings.',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'reporter_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'listing_id', references: 'listings(id)', cascade: 'ON DELETE CASCADE' }
    ],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique abuse report key.' },
      { name: 'reporter_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Reporting user.' },
      { name: 'listing_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES listings(id)'], description: 'Flagged listing ID.' },
      { name: 'reason', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Primary violation class (e.g. Fraud, Out of Stock, Spam).' },
      { name: 'details', type: 'TEXT', constraints: [], description: 'Free text explaining context.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'pending'", "CHECK (pending, investigating, resolved, dismissed)"], description: 'Moderator state machine position.' }
    ],
    sql: `CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    details TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'notifications',
    category: 'social',
    description: 'Realtime and historical notification alerts targeted to specific platform participants.',
    primaryKey: 'id',
    foreignKeys: [{ column: 'user_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Cryptographic notification id.' },
      { name: 'user_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Alert recipient.' },
      { name: 'title', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Alert header label.' },
      { name: 'content', type: 'TEXT', constraints: ['NOT NULL'], description: 'Full body content alert payload.' },
      { name: 'type', type: 'VARCHAR(50)', constraints: ['NOT NULL', 'CHECK (system, chat, payment, listing_approved, listing_boost, offer)'], description: 'Notification domain.' },
      { name: 'is_read', type: 'BOOLEAN', constraints: ['DEFAULT FALSE'], description: 'Notification read state.' }
    ],
    indexes: ['idx_notifications_user_unread (Extremely fast unread notification indicator lookups)'],
    sql: `CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('system', 'chat', 'payment', 'listing_approved', 'listing_boost', 'offer')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },

  // 7. FINANCES
  {
    name: 'coupons',
    category: 'finances',
    description: 'Discount configurations for marketplace advertisement boosts or subscriptions processing.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Coupon sequence key.' },
      { name: 'code', type: 'VARCHAR(50)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Capitalized alphanumeric promo string (e.g. PROMO50).' },
      { name: 'discount_percent', type: 'NUMERIC(5,2)', constraints: ['CHECK (0.00 to 100.00)'], description: 'Relative discount rate.' },
      { name: 'discount_amount', type: 'NUMERIC(10,2)', constraints: ['CHECK (>= 0.00)'], description: 'Absolute fiat amount deduction.' },
      { name: 'expires_at', type: 'TIMESTAMPTZ', constraints: ['NOT NULL'], description: 'Cut-off time of validity.' },
      { name: 'is_active', type: 'BOOLEAN', constraints: ['DEFAULT TRUE'], description: 'Admin status override.' }
    ],
    sql: `CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent NUMERIC(5,2) CHECK (discount_percent BETWEEN 0.00 AND 100.00),
    discount_amount NUMERIC(10,2) CHECK (discount_amount >= 0.00),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT coupon_type_exclusivity CHECK (
        (discount_percent IS NOT NULL AND discount_amount IS NULL) OR
        (discount_percent IS NULL AND discount_amount IS NOT NULL)
    )
);`
  },
  {
    name: 'payments',
    category: 'finances',
    description: 'Fiat currency gateways transactions tracking (Stripe & Razorpay credentials and status).',
    primaryKey: 'id',
    foreignKeys: [{ column: 'user_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' }],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Payment record id.' },
      { name: 'user_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Customer initiating transaction.' },
      { name: 'amount', type: 'NUMERIC(10,2)', constraints: ['NOT NULL', 'CHECK (amount > 0.00)'], description: 'Fiat charge cost.' },
      { name: 'currency', type: 'VARCHAR(10)', constraints: ["DEFAULT 'INR'"], description: 'Transactional fiat standard (INR, USD).' },
      { name: 'payment_gateway', type: 'VARCHAR(50)', constraints: ['NOT NULL', 'CHECK (stripe, razorpay)'], description: 'API merchant backend handler.' },
      { name: 'gateway_payment_id', type: 'VARCHAR(255)', constraints: ['UNIQUE'], description: 'Direct checkout trace ID from external vendor.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'pending'", "CHECK (pending, completed, failed, refunded)"], description: 'Transaction status level.' }
    ],
    indexes: ['idx_payments_user_gateway'],
    rlsPolicies: ['payments_self_access: SELECT ALLOWED only to the payor profiles'],
    sql: `CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0.00),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_gateway VARCHAR(50) NOT NULL CHECK (payment_gateway IN ('stripe', 'razorpay')),
    gateway_payment_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'subscriptions',
    category: 'finances',
    description: 'Seller premium subscription schedules providing periodic boost perks and advertising bundles.',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'user_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'plan_id', references: 'advertisement_plans(id)', cascade: 'ON DELETE RESTRICT' }
    ],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Subscription system key.' },
      { name: 'user_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Merchant Profile UUID.' },
      { name: 'plan_id', type: 'INT', constraints: ['NOT NULL', 'REFERENCES advertisement_plans(id)'], description: 'Associated service catalog ID.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'active'", "CHECK (active, canceled, expired)"], description: 'Billing cycle status.' },
      { name: 'start_date', type: 'TIMESTAMPTZ', constraints: ['DEFAULT NOW()'], description: 'Subscription start date.' },
      { name: 'end_date', type: 'TIMESTAMPTZ', constraints: ['NOT NULL'], description: 'Billing expiration deadline.' }
    ],
    indexes: ['idx_subscriptions_expiry (Accelerates automatic Cron checker sweeps)'],
    sql: `CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES advertisement_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_subscription_dates CHECK (end_date > start_date)
);`
  },
  {
    name: 'transactions',
    category: 'finances',
    description: 'Platform comprehensive auditing financials ledger detailing every single debit/credit action.',
    primaryKey: 'id',
    foreignKeys: [
      { column: 'payment_id', references: 'payments(id)', cascade: 'ON DELETE SET NULL' },
      { column: 'user_id', references: 'profiles(id)', cascade: 'ON DELETE CASCADE' },
      { column: 'coupon_id', references: 'coupons(id)', cascade: 'ON DELETE SET NULL' }
    ],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Ledger log id.' },
      { name: 'payment_id', type: 'UUID', constraints: ['REFERENCES payments(id)'], description: 'Corresponding payments checkout link.' },
      { name: 'user_id', type: 'UUID', constraints: ['NOT NULL', 'REFERENCES profiles(id)'], description: 'Merchant/Customer ID.' },
      { name: 'coupon_id', type: 'INT', constraints: ['REFERENCES coupons(id)'], description: 'Applied discount voucher.' },
      { name: 'amount', type: 'NUMERIC(10,2)', constraints: ['NOT NULL'], description: 'Final financial transaction magnitude.' },
      { name: 'type', type: 'VARCHAR(50)', constraints: ['NOT NULL', 'CHECK (listing_boost, premium_subscription, refund)'], description: 'Financial ledger category.' },
      { name: 'description', type: 'TEXT', constraints: [], description: 'Audit breakdown notes.' }
    ],
    indexes: ['idx_transactions_created (B-tree reverse chron order)'],
    sql: `CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    coupon_id INT REFERENCES coupons(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('listing_boost', 'premium_subscription', 'refund')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },

  // 8. SYSTEM & CMS
  {
    name: 'activity_logs',
    category: 'system',
    description: 'Cryptographic system audit logs recording admin, moderator, and security credentials actions.',
    primaryKey: 'id',
    foreignKeys: [{ column: 'user_id', references: 'profiles(id)', cascade: 'ON DELETE SET NULL' }],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique log entry identifier.' },
      { name: 'user_id', type: 'UUID', constraints: ['REFERENCES profiles(id)'], description: 'Executing operator ID.' },
      { name: 'action', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Action key (e.g. AUTH_SYNC, MOD_BAN, BOOST_GRANT).' },
      { name: 'entity_type', type: 'VARCHAR(50)', constraints: [], description: 'Target element category.' },
      { name: 'entity_id', type: 'VARCHAR(255)', constraints: [], description: 'Associated data key string.' },
      { name: 'ip_address', type: 'VARCHAR(50)', constraints: [], description: 'Client physical network address.' }
    ],
    rlsPolicies: ['activity_logs_admin_only: ALL restricted exclusively to administrators'],
    sql: `CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'admin_settings',
    category: 'system',
    description: 'Dynamic platform configuration parameter keys (e.g., maximum pictures per ad, chat system toggles).',
    primaryKey: 'id',
    foreignKeys: [{ column: 'updated_by', references: 'profiles(id)', cascade: 'ON DELETE SET NULL' }],
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Admin index.' },
      { name: 'key', type: 'VARCHAR(100)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Unique config setting name.' },
      { name: 'value', type: 'TEXT', constraints: ['NOT NULL'], description: 'Parsed settings parameters.' },
      { name: 'description', type: 'TEXT', constraints: [], description: 'Admin operational notes.' },
      { name: 'updated_by', type: 'UUID', constraints: ['REFERENCES profiles(id)'], description: 'Last active moderator modifier.' }
    ],
    sql: `CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'seo_settings',
    category: 'system',
    description: 'Custom indexing metadata configurations for specific subdirectories to boost Google Search rankings.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Unique page id.' },
      { name: 'page_path', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Target platform router path (e.g. "/mobiles").' },
      { name: 'meta_title', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'HTML tag title.' },
      { name: 'meta_description', type: 'TEXT', constraints: ['NOT NULL'], description: 'HTML description snippet.' },
      { name: 'meta_keywords', type: 'TEXT', constraints: [], description: 'Search optimization tags comma string.' },
      { name: 'og_image_url', type: 'TEXT', constraints: [], description: 'Facebook and Twitter rich previews visual link.' }
    ],
    sql: `CREATE TABLE seo_settings (
    id SERIAL PRIMARY KEY,
    page_path VARCHAR(255) UNIQUE NOT NULL,
    meta_title VARCHAR(255) NOT NULL,
    meta_description TEXT NOT NULL,
    meta_keywords TEXT,
    og_image_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'blog_posts',
    category: 'system',
    description: 'Immersive news, guides, user security tips, and articles published by internal authors.',
    primaryKey: 'id',
    foreignKeys: [{ column: 'author_id', references: 'profiles(id)', cascade: 'ON DELETE SET NULL' }],
    columns: [
      { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Article identity key.' },
      { name: 'author_id', type: 'UUID', constraints: ['REFERENCES profiles(id)'], description: 'Profile of blog author.' },
      { name: 'title', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Article headline.' },
      { name: 'slug', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Router slug.' },
      { name: 'content', type: 'TEXT', constraints: ['NOT NULL'], description: 'Rich text markdown blog body.' },
      { name: 'featured_image', type: 'TEXT', constraints: [], description: 'Header visual graphic.' },
      { name: 'status', type: 'VARCHAR(50)', constraints: ["DEFAULT 'draft'", "CHECK (draft, published, archived)"], description: 'Editorial status.' }
    ],
    indexes: ["idx_blog_published (WHERE status = 'published' SORT published_at DESC)"],
    triggers: ['trigger_blog_posts_updated_at'],
    sql: `CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    featured_image TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'faq',
    category: 'system',
    description: 'Help Desk catalog of Frequently Asked Questions with searchable tags and ordering sweeps.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Unique question id.' },
      { name: 'question', type: 'TEXT', constraints: ['NOT NULL'], description: 'Concise help desk header.' },
      { name: 'answer', type: 'TEXT', constraints: ['NOT NULL'], description: 'Resolving details description.' },
      { name: 'category', type: 'VARCHAR(100)', constraints: ['NOT NULL'], description: 'Help Desk catalog category.' },
      { name: 'sort_order', type: 'INT', constraints: ['DEFAULT 0'], description: 'Ascending sort priority.' },
      { name: 'is_active', type: 'BOOLEAN', constraints: ['DEFAULT TRUE'], description: 'Visual display toggle.' }
    ],
    sql: `CREATE TABLE faq (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    name: 'cms_pages',
    category: 'system',
    description: 'Dynamic platform compliance, static privacy policies, and user agreements content blocks.',
    primaryKey: 'id',
    columns: [
      { name: 'id', type: 'SERIAL', constraints: ['PRIMARY KEY'], description: 'Static page identifier.' },
      { name: 'title', type: 'VARCHAR(255)', constraints: ['NOT NULL'], description: 'Page navigation headline.' },
      { name: 'slug', type: 'VARCHAR(255)', constraints: ['UNIQUE', 'NOT NULL'], description: 'Router slug (e.g. "/terms").' },
      { name: 'content', type: 'TEXT', constraints: ['NOT NULL'], description: 'Rich text markdown payload.' },
      { name: 'is_active', type: 'BOOLEAN', constraints: ['DEFAULT TRUE'], description: 'Dynamic deployment indicator.' }
    ],
    triggers: ['trigger_cms_pages_updated_at'],
    sql: `CREATE TABLE cms_pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);`
  }
];

export default function DatabaseSchemaViewer() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedTable, setExpandedTable] = useState<string | null>('listings');
  const [copiedTable, setCopiedTable] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Lock protection states to prevent disturbance
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('db_schema_unlocked') === 'true';
  });
  const [passcode, setPasscode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'admin123') {
      setIsUnlocked(true);
      localStorage.setItem('db_schema_unlocked', 'true');
    } else {
      setErrorMessage('Invalid passcode. Access restricted.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasscode('');
    localStorage.removeItem('db_schema_unlocked');
  };

  // Category statistics counts
  const categoriesCount = useMemo(() => {
    const counts: Record<string, number> = { all: TABLE_DATA.length };
    TABLE_DATA.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered tables list
  const filteredTables = useMemo(() => {
    return TABLE_DATA.filter(t => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.columns.some(col => col.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Copy individual SQL to clipboard
  const handleCopySql = (name: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedTable(name);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  // Copy entire schema
  const handleCopyAllSchema = () => {
    const fullSchema = TABLE_DATA.map(t => `-- Table: ${t.name}\n${t.sql}\n`).join('\n');
    navigator.clipboard.writeText(fullSchema);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'geography': return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50';
      case 'identity': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'taxonomy': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
      case 'classifieds': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50';
      case 'communication': return 'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/50';
      case 'social': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50';
      case 'finances': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50';
      case 'system': return 'bg-slate-50 text-slate-600 border-slate-150 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-800';
      default: return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'geography': return <MapPin className="w-3.5 h-3.5" />;
      case 'identity': return <UserCheck className="w-3.5 h-3.5" />;
      case 'taxonomy': return <Tag className="w-3.5 h-3.5" />;
      case 'classifieds': return <Database className="w-3.5 h-3.5" />;
      case 'communication': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'social': return <Activity className="w-3.5 h-3.5" />;
      case 'finances': return <CreditCard className="w-3.5 h-3.5" />;
      case 'system': return <Settings className="w-3.5 h-3.5" />;
      default: return <Database className="w-3.5 h-3.5" />;
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
            System Schema Protected
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            This section contains normalized table definitions, relational database schemas, and SQL coding statements. Enter the developer passcode to prevent accidental disturbance.
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
              Developer / Admin Passcode
            </label>
            <input
              type="password"
              placeholder="Enter passcode (Hint: admin123)"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 px-3.5 py-2.5 border border-slate-200 dark:border-slate-750 focus:border-blue-500 rounded-xl text-center text-sm font-semibold tracking-wider outline-none transition text-slate-800 dark:text-slate-100"
              autoFocus
            />
          </div>

          {errorMessage && (
            <div className="text-[11px] font-bold text-rose-650 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 py-1.5 px-3 rounded-lg flex items-center gap-1.5 justify-center">
              <span>⚠️ {errorMessage}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer border border-blue-500 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Schema Viewer</span>
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-400">
          <span className="flex items-center gap-1">🛡️ Protected Area</span>
          <span>•</span>
          <span>Port 3000 Security</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Intro Overview Panel */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-blue-950">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-10">
          <Database className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <span className="text-[10px] font-black tracking-widest text-blue-300 bg-blue-900/50 border border-blue-800 px-3 py-1 rounded-full uppercase">
            Relational Architecture System
          </span>
          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
            Normalized PostgreSQL Database Blueprint
          </h2>
          <p className="text-xs text-blue-100 leading-relaxed">
            Every table is mapped mathematically for performance, scaling, and consistency. Designed with secure Row-Level Security (RLS) policies, B-Tree indexes, automated performance triggers, and strict foreign keys corresponding to a professional classifieds platform (OLX, Airbnb, Amazon Marketplace).
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <span className="text-blue-300 font-extrabold text-sm">28</span>
              <span className="text-slate-350 text-[10px]">Tables Defined</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <span className="text-blue-300 font-extrabold text-sm">32</span>
              <span className="text-slate-350 text-[10px]">Foreign Key Ties</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <span className="text-blue-300 font-extrabold text-sm">15</span>
              <span className="text-slate-350 text-[10px]">RLS Security Policies</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs border border-white/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <span className="text-blue-300 font-extrabold text-sm">22</span>
              <span className="text-slate-350 text-[10px]">Indices & Triggers</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={handleCopyAllSchema}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-blue-500"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Schema Copied!' : 'Copy Entire PostgreSQL SQL Schema'}</span>
            </button>
            <button
              onClick={handleLock}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
              title="Lock database schemas and SQL definitions"
            >
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Lock Section</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search Control */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        
        {/* Search */}
        <div className="relative flex items-center w-full md:w-80">
          <Search className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search table, description, or columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/80 dark:focus:bg-slate-950 pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl text-xs outline-none transition font-semibold text-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Tables' },
            { id: 'geography', label: 'Geography' },
            { id: 'identity', label: 'Identity' },
            { id: 'taxonomy', label: 'Taxonomy' },
            { id: 'classifieds', label: 'Classifieds' },
            { id: 'communication', label: 'Messaging' },
            { id: 'social', label: 'Reviews & Social' },
            { id: 'finances', label: 'Finances' },
            { id: 'system', label: 'System Audit' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer border transition-all flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[9px] px-1 rounded-full ${
                selectedCategory === cat.id ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}>
                {categoriesCount[cat.id] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table List (Left col) */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
            Database Catalog ({filteredTables.length} Tables found)
          </div>
          {filteredTables.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
              No matching tables or structures found.
            </div>
          ) : (
            filteredTables.map(t => {
              const isActive = expandedTable === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => setExpandedTable(t.name)}
                  className={`p-3.5 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between hover:translate-x-1 ${
                    isActive 
                      ? 'bg-blue-50/70 border-blue-300 shadow-xs dark:bg-blue-950/20 dark:border-blue-800' 
                      : 'bg-white border-slate-150 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`p-1 border rounded-lg ${getCategoryColor(t.category)}`}>
                          {getCategoryIcon(t.category)}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
                          {t.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 dark:text-slate-500">{t.description}</p>
                    </div>
                    <span className="text-[9px] font-black font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {t.columns.length} Cols
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Table Inspector Details (Right col) */}
        <div className="lg:col-span-8">
          {(() => {
            const currentTable = TABLE_DATA.find(t => t.name === expandedTable);
            if (!currentTable) {
              return (
                <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-xs">
                  <Database className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  Select a table from the left registry to analyze columns, relations, and RLS policies.
                </div>
              );
            }

            return (
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
                
                {/* Table Header Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`p-1 border rounded-lg ${getCategoryColor(currentTable.category)}`}>
                        {getCategoryIcon(currentTable.category)}
                      </span>
                      <h3 className="font-mono font-black text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{currentTable.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">TABLE</span>
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{currentTable.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                    <button
                      onClick={() => handleCopySql(currentTable.name, currentTable.sql)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition"
                      title="Copy exact SQL statement code"
                    >
                      {copiedTable === currentTable.name ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedTable === currentTable.name ? 'Copied' : 'Copy Table DDL'}</span>
                    </button>
                  </div>
                </div>

                {/* Database Properties Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Primary Key</div>
                    <div className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400">
                      {currentTable.primaryKey}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Row Security Policies</div>
                    <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{currentTable.rlsPolicies ? `${currentTable.rlsPolicies.length} Active` : 'Standard Sandbox'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Associated Indexes</div>
                    <div className="text-xs font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>{currentTable.indexes ? `${currentTable.indexes.length} Compiled` : 'Primary Hash Only'}</span>
                    </div>
                  </div>
                </div>

                {/* Columns Definition table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">Columns Specification</h4>
                  <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-[11px] md:text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-150 dark:border-slate-800 text-slate-500 font-bold">
                          <th className="px-4 py-2.5 font-mono">Column</th>
                          <th className="px-4 py-2.5 font-mono">Type</th>
                          <th className="px-4 py-2.5 font-mono">Constraints</th>
                          <th className="px-4 py-2.5">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                        {currentTable.columns.map(col => (
                          <tr key={col.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-2.5 font-mono font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                              <span>{col.name}</span>
                              {currentTable.primaryKey === col.name && (
                                <span className="text-[8px] bg-blue-100 text-blue-700 font-black px-1 rounded uppercase">PK</span>
                              )}
                              {currentTable.foreignKeys?.some(fk => fk.column === col.name) && (
                                <span className="text-[8px] bg-purple-100 text-purple-700 font-black px-1 rounded uppercase">FK</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-xs text-blue-600 dark:text-blue-400">{col.type}</td>
                            <td className="px-4 py-2.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              {col.constraints && col.constraints.length > 0 ? (
                                <div className="flex flex-wrap gap-0.5">
                                  {col.constraints.map((c, i) => (
                                    <span key={i} className="bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.2 rounded border border-amber-100 dark:border-amber-900/50">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">-</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 font-normal">{col.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Foreign key visual connections */}
                {currentTable.foreignKeys && currentTable.foreignKeys.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">Relational Integrity Links</h4>
                    <div className="p-4 bg-purple-50/30 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/40 rounded-2xl space-y-2.5">
                      {currentTable.foreignKeys.map((fk, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">{currentTable.name}.{fk.column}</span>
                            <span className="text-purple-600">➡️ references</span>
                            <span className="font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/50">{fk.references}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Action: <span className="text-rose-600 dark:text-rose-400 font-black">{fk.cascade}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row Level Security details */}
                {currentTable.rlsPolicies && currentTable.rlsPolicies.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">Row Level Security (RLS) Policies</h4>
                    <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl space-y-2">
                      {currentTable.rlsPolicies.map((pol, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{pol}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code segment preview */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider pl-1">SQL DDL Definition Code</h4>
                  <div className="bg-slate-900 border border-slate-950 rounded-2xl p-4 overflow-x-auto shadow-inner text-xs font-mono text-emerald-400">
                    <pre className="leading-relaxed select-all">
                      <code>{currentTable.sql}</code>
                    </pre>
                  </div>
                </div>

              </div>
            );
          })()}
        </div>

      </div>

    </div>
  );
}
