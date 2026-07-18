-- ============================================================================
-- SQL Database Schema for LocalMarket Classifieds (Production-Grade PostgreSQL)
-- ============================================================================
-- Fully normalized relational architecture mimicking OLX, Airbnb, Apple,
-- Facebook Marketplace, and Amazon database engines.
--
-- Features:
--   - Strict foreign keys, CHECK constraints, and cascading actions
--   - Optimized multi-column and partial indexes
--   - PostgreSQL Views for business analytics
--   - Triggers for cached rating aggregations and audit tracking
--   - Row-Level Security (RLS) policies for multi-tenant and privacy control
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. GEOGRAPHY TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    iso_code VARCHAR(10) UNIQUE NOT NULL,
    phone_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    country_id INT NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    CONSTRAINT unique_country_state UNIQUE(country_id, name)
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    pincode_prefix VARCHAR(10),
    CONSTRAINT unique_state_city UNIQUE(state_id, name)
);

-- ============================================================================
-- 2. IDENTITY AND ACCESS (USERS & PROFILES)
-- ============================================================================

-- Custom auth users matching Supabase system core
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
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
);

-- ============================================================================
-- 3. CLASSIFIEDS TAXONOMY (CATEGORIES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(100) DEFAULT 'tag',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_category_slug UNIQUE(category_id, slug)
);

-- ============================================================================
-- 4. ADVERTISEMENT BOOSTING PLANS
-- ============================================================================

CREATE TABLE IF NOT EXISTS advertisement_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0.00),
    duration_days INT NOT NULL CHECK (duration_days > 0),
    badge_type VARCHAR(50) DEFAULT 'none' CHECK (badge_type IN ('none', 'gold', 'diamond')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. CLASSIFIED ADS (LISTINGS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS listings (
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
);

CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. COMMUNICATIONS (CHATS & MESSAGES)
-- ============================================================================

CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_chat_session UNIQUE(listing_id, buyer_id, seller_id),
    CONSTRAINT buyer_seller_diff CHECK (buyer_id <> seller_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. REVIEWS AND RATINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating_value INT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT reviewer_reviewee_diff CHECK (reviewer_id <> reviewee_id)
);

CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    criteria VARCHAR(100) NOT NULL CHECK (criteria IN ('accuracy', 'communication', 'pricing', 'honesty')),
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5)
);

-- ============================================================================
-- 8. USER INTERACTION PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS favourites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_favourite UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    details TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('system', 'chat', 'payment', 'listing_approved', 'listing_boost', 'offer')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. PREMIUM SERVICES, PAYMENTS, & PROMOTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
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
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0.00),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_gateway VARCHAR(50) NOT NULL CHECK (payment_gateway IN ('stripe', 'razorpay')),
    gateway_payment_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES advertisement_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_subscription_dates CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    coupon_id INT REFERENCES coupons(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('listing_boost', 'premium_subscription', 'refund')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. AUDITING, CMS, AND GLOBAL SYSTEM CONFIGURATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_settings (
    id SERIAL PRIMARY KEY,
    page_path VARCHAR(255) UNIQUE NOT NULL,
    meta_title VARCHAR(255) NOT NULL,
    meta_description TEXT NOT NULL,
    meta_keywords TEXT,
    og_image_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
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
);

CREATE TABLE IF NOT EXISTS faq (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. INDEXES FOR EXTREME SEARCH QUERY PERFORMANCE
-- ============================================================================

-- Geography performance indexes
CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);

-- Profile search indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating_cache DESC);

-- Listings optimization indexes
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON listings(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_boost ON listings(boost_status) WHERE boost_status <> 'none';

-- Listing image sort optimizations
CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id, sort_order);

-- Communication index lookups
CREATE INDEX IF NOT EXISTS idx_chats_buyer_seller ON chats(buyer_id, seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(sender_id, is_read) WHERE is_read = FALSE;

-- Interaction indexes
CREATE INDEX IF NOT EXISTS idx_favourites_user ON favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Payment & accounting indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_gateway ON payments(user_id, gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry ON subscriptions(end_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- CMS indexing
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(status, published_at DESC) WHERE status = 'published';

-- ============================================================================
-- 12. TRIGGERS & PROCEDURES (BUSINESS AUTOMATION)
-- ============================================================================

-- Function to automatically calculate and update a profile's average rating cache
CREATE OR REPLACE FUNCTION update_profile_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET rating_cache = COALESCE((
        SELECT ROUND(AVG(rating_value)::numeric, 2)
        FROM reviews
        WHERE reviewee_id = NEW.reviewee_id
    ), 0.00)
    WHERE id = NEW.reviewee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate rating averages on new reviews or updates
CREATE OR REPLACE TRIGGER trigger_update_profile_average_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_average_rating();


-- Function to update the default updated_at field on state change
CREATE OR REPLACE FUNCTION update_modified_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
CREATE OR REPLACE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp_column();
CREATE OR REPLACE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp_column();
CREATE OR REPLACE TRIGGER trigger_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp_column();
CREATE OR REPLACE TRIGGER trigger_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp_column();
CREATE OR REPLACE TRIGGER trigger_cms_pages_updated_at BEFORE UPDATE ON cms_pages FOR EACH ROW EXECUTE FUNCTION update_modified_timestamp_column();


-- ============================================================================
-- 13. VIEWS (ADVANCED BUSINESS ANALYTICS)
-- ============================================================================

-- Comprehensive Listing Details View combining category, geography, and seller ratings
CREATE OR REPLACE VIEW view_detailed_listings AS
SELECT 
    l.id AS listing_id,
    l.title,
    l.description,
    l.price,
    l.status AS listing_status,
    l.is_featured,
    l.boost_status,
    l.views_count,
    l.created_at AS listing_created_at,
    p.id AS seller_id,
    p.full_name AS seller_name,
    p.rating_cache AS seller_average_rating,
    p.verified AS seller_verified,
    c.name AS category_name,
    sub.name AS subcategory_name,
    city.name AS city_name,
    state.name AS state_name
FROM listings l
LEFT JOIN profiles p ON l.seller_id = p.id
LEFT JOIN categories c ON l.category_id = c.id
LEFT JOIN subcategories sub ON l.subcategory_id = sub.id
LEFT JOIN cities city ON l.city_id = city.id
LEFT JOIN states state ON city.state_id = state.id;


-- Monthly Transaction Financial Ledger Overview
CREATE OR REPLACE VIEW view_monthly_revenue_summary AS
SELECT 
    TO_CHAR(t.created_at, 'YYYY-MM') AS transaction_month,
    t.type AS transaction_type,
    COUNT(t.id) AS total_transactions,
    SUM(t.amount) AS total_revenue_collected,
    AVG(t.amount) AS average_transaction_value
FROM transactions t
GROUP BY TO_CHAR(t.created_at, 'YYYY-MM'), t.type
ORDER BY transaction_month DESC;

-- ============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES FOR SECURE DATA SECURITY
-- ============================================================================

-- Enable RLS across identity and core business tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY profile_public_read ON profiles FOR SELECT USING (true);
CREATE POLICY profile_self_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings Policies
CREATE POLICY listings_public_read ON listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY listings_insert ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY listings_update ON listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY listings_delete ON listings FOR DELETE USING (auth.uid() = seller_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('moderator', 'admin')
));

-- Chats Policies
CREATE POLICY chats_user_access ON chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY chats_user_insert ON chats FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Messages Policies
CREATE POLICY messages_chat_access ON messages FOR SELECT USING (EXISTS (
    SELECT 1 FROM chats WHERE id = chat_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
));
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM chats WHERE id = chat_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
));

-- Favourites Policies
CREATE POLICY favourites_self_access ON favourites FOR ALL USING (auth.uid() = user_id);

-- Payments Policies
CREATE POLICY payments_self_access ON payments FOR SELECT USING (auth.uid() = user_id);

-- Audit/Activity Logs Policy
CREATE POLICY activity_logs_admin_only ON activity_logs FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));
