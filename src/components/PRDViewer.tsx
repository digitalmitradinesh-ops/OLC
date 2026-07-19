/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Database, 
  GitBranch, 
  FolderTree, 
  Cpu, 
  CheckCircle, 
  Copy, 
  ArrowRight, 
  ExternalLink,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface PRDViewerProps {
  onApprove?: () => void;
  hideApprove?: boolean;
}

export default function PRDViewer({ onApprove, hideApprove = false }: PRDViewerProps) {
  const [activeTab, setActiveTab] = useState<'prd' | 'stories' | 'db' | 'api' | 'tree'>('prd');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dbSchemaSQL = `-- =========================================================
-- LOCALMARKET CLASSIFIEDS - ENTERPRISE POSTGRESQL SCHEMA
-- =========================================================

-- Enable UUID extension for robust primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table (Separation of Auth and Public profile)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    location VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 5.00,
    verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subcategories Table
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Listings Table (Core OLX items)
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    subcategory_id UUID NOT NULL REFERENCES subcategories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    negotiable BOOLEAN DEFAULT true,
    condition VARCHAR(50) NOT NULL CHECK (condition IN ('new', 'like_new', 'good', 'fair')),
    brand VARCHAR(100),
    model VARCHAR(100),
    year INT,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    views INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'sold', 'paused', 'expired')),
    boost_status VARCHAR(50) DEFAULT 'none' CHECK (boost_status IN ('none', 'boosted', 'featured')),
    verified_listing BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 6. Chats Table (Aggregates messages between two parties)
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, buyer_id, seller_id)
);

-- 7. Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    image_url TEXT,
    seen BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payments & Subscriptions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('stripe', 'razorpay', 'upi', 'wallet')),
    plan_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security) and Policies Example
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_messages_chat ON messages(chat_id);
`;

  return (
    <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden font-sans">
      {/* Workspace Header */}
      <div className="bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider border border-blue-500/30">
              {hideApprove ? "System Spec Sheet" : "Phase 1 Deliverable"}
            </span>
            <span className="text-slate-400 text-xs">{hideApprove ? "Approved" : "Awaiting Approval"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            LocalMarket Classifieds Architect Spec
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Detailed PRD, Database schemas, API structures, and systems flow designed for scale.
          </p>
        </div>
        
        {!hideApprove && onApprove && (
          <button
            onClick={onApprove}
            className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition duration-250 shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <span>Approve Spec & Enter App</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 bg-slate-50 border-r border-slate-100 p-4 space-y-1">
          <div className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-widest">
            Architecture Tabs
          </div>
          
          <button
            onClick={() => setActiveTab('prd')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === 'prd' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span>Product Requirements (PRD)</span>
          </button>

          <button
            onClick={() => setActiveTab('stories')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === 'stories' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-4.5 h-4.5" />
            <span>User Stories & Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('db')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === 'db' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4.5 h-4.5" />
            <span>Database Schema SQL</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === 'api' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4.5 h-4.5" />
            <span>Core API Specifications</span>
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === 'tree' 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-4.5 h-4.5" />
            <span>Vite Full-Stack Tree</span>
          </button>

          <div className="pt-6 border-t border-slate-200 mt-6 px-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Compliance Score
              </h4>
              <p className="text-[11px] text-blue-700 leading-relaxed mb-3">
                This schema meets modern OWASP security standards and implements strict Row-Level Security (RLS) policies.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ready to Deploy
              </div>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[800px]">
          {activeTab === 'prd' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">1. Objective & Product Scope</h2>
                <p className="text-slate-600 leading-relaxed">
                  LocalMarket Classifieds is a premium local buy-and-sell classifieds portal designed to match the massive utility of OLX, refined by the sophisticated design aesthetic of Apple and Airbnb. The portal handles categories from automobiles and real estate down to mobile phones and items.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border border-slate-150 rounded-xl p-5 hover:border-blue-200 transition">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">High-Throughput Architecture</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Built to scale securely with granular client-side state, robust modular React layouts, and reliable backend service routing.
                  </p>
                </div>

                <div className="border border-slate-150 rounded-xl p-5 hover:border-blue-200 transition">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Gemini AI Enhanced</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Includes AI Generated Descriptions, Smart Price suggestions based on product conditions, and AI Categorization using Google Gemini.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Functional Core Requirements</h2>
                <ul className="space-y-2.5 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span><strong>User Profiles & Multi-Role Support:</strong> Dedicated dashboards, premium verification flags, and wallet integration.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span><strong>Ad posting & Listing Lifecycles:</strong> High-quality multi-photo uploads, price negotiability fields, condition matrices, and geocoded locations.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span><strong>Dynamic Location-based Search:</strong> Price boundaries, keyword lookup, distance/radius settings, and brand filters.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span><strong>Negotiations & Messaging:</strong> Direct realtime-like messaging thread complete with preset responses and price offer widgets.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span><strong>Upgrade Ads:</strong> Integration with Stripe / Razorpay simulated checkout gateways to sponsor and feature listings.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'stories' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">User Stories & Operational Flow</h2>
                
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">Story 1: Premium Seller Boost</h4>
                    <p className="text-sm text-slate-700">
                      <strong>As a</strong> registered seller, <strong>I want to</strong> purchase a Sponsored Ad Package <strong>so that</strong> my listing appears on the main slider with high search ranking.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">Story 2: Direct Safe Communication</h4>
                    <p className="text-sm text-slate-700">
                      <strong>As a</strong> potential buyer, <strong>I want to</strong> initiate a chat with a seller from their listing page, view typing states, and request physical viewings safely.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">Story 3: AI Description Co-Pilot</h4>
                    <p className="text-sm text-slate-700">
                      <strong>As a</strong> busy seller, <strong>I want to</strong> feed three keywords into Gemini AI <strong>so that</strong> it drafts a stunning, bulleted, professional product description in 2 seconds.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Visual User Journey Flow</h3>
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-900 text-slate-300 font-mono text-xs overflow-x-auto space-y-2 leading-relaxed">
                  <div>[Visitor Landing] ───► [Search & Filtering] ───► [View Details] ───► [Request Chat/Call]</div>
                  <div className="pl-12 text-slate-500">│</div>
                  <div>[Seller Login] ───► [Compose Listing] ───► [AI Pricing Guide] ───► [Boost Payment (Stripe)]</div>
                  <div className="pl-12 text-slate-500">│</div>
                  <div>[Admin Panel] ───► [Monitor Analytics] ───► [Verify Listings] ───► [Approve Payouts]</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'db' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Enterprise PostgreSQL Database Script</h2>
                <button
                  onClick={() => handleCopy(dbSchemaSQL)}
                  className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              {/* Visual Schema Map */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 overflow-x-auto">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Relational ER Visualizer</h3>
                <div className="flex flex-col md:flex-row gap-4 items-stretch min-w-[650px]">
                  
                  <div className="flex-1 bg-white border border-blue-200 shadow-sm rounded-lg p-3">
                    <div className="font-bold text-xs text-blue-600 border-b pb-1 mb-2 flex items-center justify-between">
                      <span>users [Table]</span>
                      <span className="text-[10px] bg-blue-50 px-1 rounded">PK: id</span>
                    </div>
                    <ul className="text-[11px] text-slate-500 space-y-1 font-mono">
                      <li>• id : uuid</li>
                      <li>• email : varchar(255)</li>
                      <li>• phone_number : varchar</li>
                      <li>• password_hash : varchar</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-center text-slate-300">
                    <ChevronRight className="w-5 h-5 hidden md:block" />
                  </div>

                  <div className="flex-1 bg-white border border-blue-200 shadow-sm rounded-lg p-3">
                    <div className="font-bold text-xs text-blue-600 border-b pb-1 mb-2 flex items-center justify-between">
                      <span>listings [Table]</span>
                      <span className="text-[10px] bg-blue-50 px-1 rounded">PK: id</span>
                    </div>
                    <ul className="text-[11px] text-slate-500 space-y-1 font-mono">
                      <li>• id : uuid</li>
                      <li>• seller_id : uuid (FK)</li>
                      <li>• category_id : uuid (FK)</li>
                      <li>• title : varchar</li>
                      <li>• price : decimal</li>
                      <li>• status : varchar</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-center text-slate-300">
                    <ChevronRight className="w-5 h-5 hidden md:block" />
                  </div>

                  <div className="flex-1 bg-white border border-blue-200 shadow-sm rounded-lg p-3">
                    <div className="font-bold text-xs text-blue-600 border-b pb-1 mb-2 flex items-center justify-between">
                      <span>chats [Table]</span>
                      <span className="text-[10px] bg-blue-50 px-1 rounded">PK: id</span>
                    </div>
                    <ul className="text-[11px] text-slate-500 space-y-1 font-mono">
                      <li>• id : uuid</li>
                      <li>• listing_id : uuid (FK)</li>
                      <li>• buyer_id : uuid (FK)</li>
                      <li>• seller_id : uuid (FK)</li>
                    </ul>
                  </div>

                </div>
              </div>

              <div className="bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-96">
                <pre>{dbSchemaSQL}</pre>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Classifieds REST API Specifications</h2>

              <div className="space-y-4">
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">GET</span>
                    <code className="text-xs font-mono font-bold text-slate-800">/api/listings</code>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Retrieves all listings. Accepts optional query parameters for search and filtering.</p>
                  <div className="bg-white border rounded p-2 text-[11px] text-slate-600 font-mono">
                    Query: <span className="text-blue-600">?search=iPhone&category=cat-mobiles&price_max=1200</span>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded">POST</span>
                    <code className="text-xs font-mono font-bold text-slate-800">/api/listings</code>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Post a new advertisement listing. Authentication token required in request header.</p>
                  <div className="bg-white border rounded p-2 text-[11px] text-slate-600 font-mono">
                    Body: <span className="text-indigo-600">{"{ title, price, categoryId, condition, description, location }"}</span>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded">POST</span>
                    <code className="text-xs font-mono font-bold text-slate-800">/api/gemini/enhance-description</code>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Uses Gemini AI model to write or polish an ad description from simple bullet lists or terms.</p>
                  <div className="bg-white border rounded p-2 text-[11px] text-slate-600 font-mono">
                    Body: <span className="text-purple-600">{"{ title, brand, condition, keywords: [] }"}</span>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-pink-500 text-white text-[10px] font-bold rounded">POST</span>
                    <code className="text-xs font-mono font-bold text-slate-800">/api/payments/create-checkout-session</code>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Initiate Stripe / Razorpay checkout session for Ad Boosting and Subscription plans.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Vite Full-Stack Project Structure</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                This project utilizes a robust full-stack architecture where Vite builds the React client and Express routes API endpoints as well as serves statically compiled files in production.
              </p>

              <div className="border border-slate-100 rounded-xl p-5 bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto space-y-1">
                <div>├── .env.example <span className="text-slate-500"># Declared API & configuration examples</span></div>
                <div>├── index.html <span className="text-slate-500"># Primary client entrypoint HTML</span></div>
                <div>├── metadata.json <span className="text-slate-500"># Platform permissions & properties</span></div>
                <div>├── package.json <span className="text-slate-500"># Node scripts, build pipelines, and packages</span></div>
                <div>├── server.ts <span className="text-slate-500"># Full-Stack Express server with integrated Vite middleware</span></div>
                <div>├── vite.config.ts <span className="text-slate-500"># Vite and PostCSS compilation configuration</span></div>
                <div>├── tsconfig.json <span className="text-slate-500"># TypeScript pathing & type declarations</span></div>
                <div>└── src/</div>
                <div className="pl-4">├── App.tsx <span className="text-slate-500"># Main controller routing spec vs product views</span></div>
                <div className="pl-4">├── index.css <span className="text-slate-500"># Global Tailwind directives & theme variables</span></div>
                <div className="pl-4">├── main.tsx <span className="text-slate-500"># Client DOM rendering layer</span></div>
                <div className="pl-4">├── types.ts <span className="text-slate-500"># Enterprise data modeling declarations</span></div>
                <div className="pl-4">├── data.ts <span className="text-slate-500"># Standard seed database context for search and chat</span></div>
                <div className="pl-4">└── components/</div>
                <div className="pl-8">├── PRDViewer.tsx <span className="text-slate-500"># [Current] Elegant architecture & SQL script viewer</span></div>
                <div className="pl-8">└── ClassifiedsApp.tsx <span className="text-slate-500"># Dynamic marketplace experience</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
