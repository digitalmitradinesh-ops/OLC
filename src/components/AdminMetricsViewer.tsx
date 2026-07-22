import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  BarChart3, 
  MapPin, 
  Percent, 
  Zap, 
  Globe2, 
  CreditCard, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Smartphone, 
  Lock, 
  FileText, 
  Tag, 
  Undo2, 
  CheckCircle, 
  RefreshCw, 
  Plus, 
  Download, 
  LockKeyhole,
  Check,
  AlertTriangle,
  Code,
  Copy,
  Mail,
  MessageSquare,
  Save,
  Send,
  EyeOff,
  Settings2
} from 'lucide-react';

interface AnalyticsData {
  dau: number;
  mau: number;
  totalRevenue: number;
  totalViews: number;
  conversionRate: number;
  premiumSalesCount: number;
  topCategories: { category: string; count: number; percentage: number }[];
  topCities: { city: string; listings: number; revenue: number }[];
  trafficSources: { source: string; percentage: number; count: number }[];
}

const INITIAL_ANALYTICS: AnalyticsData = {
  dau: 14250,
  mau: 185000,
  totalRevenue: 248500,
  totalViews: 412500,
  conversionRate: 4.8,
  premiumSalesCount: 382,
  topCategories: [
    { category: 'Mobiles & Tablets', count: 450, percentage: 35 },
    { category: 'Vehicles', count: 320, percentage: 25 },
    { category: 'Property', count: 210, percentage: 16 },
    { category: 'Electronics & Appliances', count: 180, percentage: 14 },
    { category: 'Home & Furniture', count: 130, percentage: 10 }
  ],
  topCities: [
    { city: 'Connaught Place, New Delhi', listings: 420, revenue: 105000 },
    { city: 'Bandra West, Mumbai', listings: 350, revenue: 84000 },
    { city: 'Koramangala, Bengaluru', listings: 280, revenue: 38500 },
    { city: 'Adyar, Chennai', listings: 150, revenue: 13000 },
    { city: 'Andheri West, Mumbai', listings: 90, revenue: 8000 }
  ],
  trafficSources: [
    { source: 'Google Organic Search', percentage: 45, count: 83250 },
    { source: 'Direct URL Navigation', percentage: 28, count: 51800 },
    { source: 'Social Media (Instagram/FB)', percentage: 15, count: 27750 },
    { source: 'Referral & Partner Sites', percentage: 12, count: 22200 }
  ]
};

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  expires: string;
  isActive: boolean;
}

const INITIAL_COUPONS: Coupon[] = [
  { code: 'FESTIVE50', type: 'percentage', value: 50, expires: '2026-12-31', isActive: true },
  { code: 'BOOST100', type: 'fixed', value: 100, expires: '2026-09-30', isActive: true },
  { code: 'WELCOME20', type: 'percentage', value: 20, expires: '2026-08-15', isActive: true }
];

interface SecurityLog {
  timestamp: string;
  type: 'SUCCESS' | 'WARN' | 'BLOCKED';
  event: string;
  ip: string;
  endpoint: string;
}

interface AdminMetricsViewerProps {
  token?: string | null;
}

export default function AdminMetricsViewer({ token }: AdminMetricsViewerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'payments' | 'security' | 'seo' | 'integrations'>('analytics');

  // Integrations settings state
  const [gmailEnabled, setGmailEnabled] = useState(false);
  const [gmailUser, setGmailUser] = useState('');
  const [gmailPass, setGmailPass] = useState('');
  const [showGmailPass, setShowGmailPass] = useState(false);

  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappProvider, setWhatsappProvider] = useState<'twilio' | 'whatsapp_cloud_api' | 'sandbox'>('sandbox');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [whatsappApiToken, setWhatsappApiToken] = useState('');
  const [showWhatsappToken, setShowWhatsappToken] = useState(false);
  const [whatsappAccountId, setWhatsappAccountId] = useState('');
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState('');
  const [whatsappSandboxRecipient, setWhatsappSandboxRecipient] = useState('');

  // Tester states
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [savingIntegrations, setSavingIntegrations] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWhatsapp, setTestingWhatsapp] = useState(false);
  const [integrationMsg, setIntegrationMsg] = useState('');
  const [integrationError, setIntegrationError] = useState('');

  // Setup Guide active tab state
  const [activeGuideTab, setActiveGuideTab] = useState<'gmail' | 'twilio' | 'meta'>('gmail');

  useEffect(() => {
    if (!token) return;
    const fetchIntegrations = async () => {
      setLoadingIntegrations(true);
      try {
        const response = await fetch('/api/admin/get-integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        const data = await response.json();
        if (data.success && data.config) {
          const c = data.config;
          setGmailEnabled(c.gmail?.enabled || false);
          setGmailUser(c.gmail?.user || '');
          setGmailPass(c.gmail?.pass || '');
          setWhatsappEnabled(c.whatsapp?.enabled || false);
          setWhatsappProvider(c.whatsapp?.provider || 'sandbox');
          setWhatsappPhone(c.whatsapp?.whatsappPhone || '');
          setWhatsappApiToken(c.whatsapp?.apiToken || '');
          setWhatsappAccountId(c.whatsapp?.accountId || '');
          setWhatsappPhoneNumberId(c.whatsapp?.phoneNumberId || '');
          setWhatsappSandboxRecipient(c.whatsapp?.sandboxRecipient || '');
        }
      } catch (err) {
        console.error('Failed to load integrations', err);
      } finally {
        setLoadingIntegrations(false);
      }
    };
    fetchIntegrations();
  }, [token]);

  const handleSaveIntegrations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingIntegrations(true);
    setIntegrationMsg('');
    setIntegrationError('');
    try {
      const response = await fetch('/api/admin/save-integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          config: {
            gmail: {
              enabled: gmailEnabled,
              user: gmailUser,
              pass: gmailPass
            },
            whatsapp: {
              enabled: whatsappEnabled,
              provider: whatsappProvider,
              whatsappPhone,
              apiToken: whatsappApiToken,
              accountId: whatsappAccountId,
              phoneNumberId: whatsappPhoneNumberId,
              sandboxRecipient: whatsappSandboxRecipient
            }
          }
        })
      });
      const data = await response.json();
      if (data.success) {
        setIntegrationMsg('Configurations saved successfully!');
        setTimeout(() => setIntegrationMsg(''), 4000);
      } else {
        setIntegrationError(data.message || 'Failed to save configurations');
      }
    } catch (err) {
      setIntegrationError('Failed to connect to integration server.');
    } finally {
      setSavingIntegrations(false);
    }
  };

  const handleTestEmail = async () => {
    if (!token) return;
    if (!testEmail) {
      setIntegrationError('Please enter a test email address first.');
      return;
    }
    setTestingEmail(true);
    setIntegrationMsg('');
    setIntegrationError('');
    try {
      const response = await fetch('/api/admin/integrations/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, testEmail })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIntegrationMsg(data.message);
      } else {
        setIntegrationError(data.message || 'SMTP Email dispatch failed.');
      }
    } catch (err: any) {
      setIntegrationError('Email test request failed: ' + err.message);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestWhatsapp = async () => {
    if (!token) return;
    if (!testPhone) {
      setIntegrationError('Please enter a test phone number first.');
      return;
    }
    setTestingWhatsapp(true);
    setIntegrationMsg('');
    setIntegrationError('');
    try {
      const response = await fetch('/api/admin/integrations/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, testPhone })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIntegrationMsg(data.message);
      } else {
        setIntegrationError(data.message || 'WhatsApp OTP dispatch failed.');
      }
    } catch (err: any) {
      setIntegrationError('WhatsApp test request failed: ' + err.message);
    } finally {
      setTestingWhatsapp(false);
    }
  };
  
  // Interactive SEO Dashboard states
  const [selectedSeoPage, setSelectedSeoPage] = useState<'home' | 'iphone' | 'furniture' | 'category'>('home');
  const [robotsDisallowAdmin, setRobotsDisallowAdmin] = useState(true);
  const [robotsDisallowChats, setRobotsDisallowChats] = useState(true);
  const [robotsDisallowApi, setRobotsDisallowApi] = useState(true);
  const [robotsAllowGooglebotImage, setRobotsAllowGooglebotImage] = useState(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Performance / Core Web Vitals optimization state factors
  const [perfLazyLoad, setPerfLazyLoad] = useState(true);
  const [perfCriticalCss, setPerfCriticalCss] = useState(false);
  const [perfGzip, setPerfGzip] = useState(true);
  const [perfWebp, setPerfWebp] = useState(false);
  const [perfCloudflare, setPerfCloudflare] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsData>(INITIAL_ANALYTICS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponVal, setNewCouponVal] = useState(15);
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  
  // Payment Simulator states
  const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'stripe' | 'upi'>('stripe');
  const [paymentAmount, setPaymentAmount] = useState<number>(1299);
  const [selectedPlan, setSelectedPlan] = useState<string>('Premium Feature Slot');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [invoiceGST, setInvoiceGST] = useState<number>(18); // 18% standard GST
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'refunded'>('idle');
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [paymentHistory, setPaymentHistory] = useState<any[]>([
    { id: 'INV-7634', plan: 'Premium Feature Slot', amount: 1299, gateway: 'stripe', status: 'Completed', date: '2026-07-16', gst: 198.15, net: 1100.85 },
    { id: 'INV-7521', plan: 'Ad Booster Pack', amount: 499, gateway: 'razorpay', status: 'Completed', date: '2026-07-15', gst: 76.12, net: 422.88 },
    { id: 'INV-7490', plan: 'Premium Feature Slot', amount: 649.50, gateway: 'upi', status: 'Refunded', date: '2026-07-14', gst: 99.08, net: 550.42 }
  ]);

  // Security simulator states
  const [otpPhone, setOtpPhone] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpStatus, setOtpStatus] = useState<'idle' | 'sending' | 'sent' | 'verified' | 'error'>('idle');
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
    { timestamp: '11:12:04', type: 'SUCCESS', event: 'JWT token validated for user-curr', ip: '103.45.19.220', endpoint: '/api/v1/user/profile' },
    { timestamp: '11:10:45', type: 'WARN', event: 'Rate limit threshold 80% reached', ip: '45.122.90.11', endpoint: '/api/v1/listings/search' },
    { timestamp: '11:08:15', type: 'BLOCKED', event: 'SQL injection attempt pattern blocked in query', ip: '198.51.100.42', endpoint: '/api/v1/listings/filter' },
    { timestamp: '11:05:00', type: 'SUCCESS', event: 'XSS Filter sanitized input field "description"', ip: '103.45.19.220', endpoint: '/api/v1/listings/create' },
    { timestamp: '11:02:12', type: 'SUCCESS', event: 'CSRF security token handshake verified', ip: '103.45.19.220', endpoint: '/api/v1/listings/boost' }
  ]);

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    const codeUpper = newCouponCode.trim().toUpperCase();
    if (coupons.some(c => c.code === codeUpper)) {
      alert('Coupon code already exists.');
      return;
    }
    const newC: Coupon = {
      code: codeUpper,
      type: newCouponType,
      value: Number(newCouponVal),
      expires: '2026-12-31',
      isActive: true
    };
    setCoupons([newC, ...coupons]);
    setNewCouponCode('');
  };

  const handleApplyCoupon = () => {
    const coupon = coupons.find(c => c.code === appliedCoupon.trim().toUpperCase() && c.isActive);
    if (coupon) {
      if (coupon.type === 'percentage') {
        const discount = (paymentAmount * coupon.value) / 100;
        setDiscountAmount(discount);
      } else {
        setDiscountAmount(Math.min(coupon.value, paymentAmount));
      }
    } else {
      setDiscountAmount(0);
      alert('Invalid or expired coupon code!');
    }
  };

  const simulatePayment = () => {
    setPaymentStatus('processing');
    setTimeout(() => {
      const finalAmount = paymentAmount - discountAmount;
      const gstVal = Number(((finalAmount * (invoiceGST / 100)) / (1 + invoiceGST / 100)).toFixed(2));
      const netVal = Number((finalAmount - gstVal).toFixed(2));
      const newInvId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newInvoice = {
        id: newInvId,
        plan: selectedPlan,
        amount: finalAmount,
        gateway: selectedGateway,
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
        gst: gstVal,
        net: netVal
      };

      setPaymentHistory([newInvoice, ...paymentHistory]);
      setInvoiceId(newInvId);
      setPaymentStatus('success');

      // Log security event
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newSecLog: SecurityLog = {
        timestamp: timeStr,
        type: 'SUCCESS',
        event: `Secure checkout payment verified. Token: tok_${Math.random().toString(36).substring(7)}`,
        ip: '103.45.19.220',
        endpoint: '/api/v1/payments/verify'
      };
      setSecurityLogs([newSecLog, ...securityLogs]);
    }, 1500);
  };

  const simulateRefund = (id: string) => {
    setPaymentHistory(paymentHistory.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Refunded' };
      }
      return p;
    }));
    
    // Log security event
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newSecLog: SecurityLog = {
      timestamp: timeStr,
      type: 'WARN',
      event: `Refund processed successfully for ${id}. Gateway confirmation received.`,
      ip: '103.45.19.220',
      endpoint: '/api/v1/payments/refund'
    };
    setSecurityLogs([newSecLog, ...securityLogs]);
  };

  const handleSendOtp = () => {
    setOtpStatus('sending');
    setTimeout(() => {
      setOtpSent(true);
      setOtpStatus('sent');
      setOtpCode('4819'); // Mock correct code
    }, 1200);
  };

  const handleVerifyOtp = (code: string) => {
    if (code === '4819') {
      setOtpStatus('verified');
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setSecurityLogs([
        { timestamp: timeStr, type: 'SUCCESS', event: `MFA SMS OTP Verified for phone ${otpPhone}`, ip: '103.45.19.220', endpoint: '/api/v1/auth/otp-verify' },
        ...securityLogs
      ]);
    } else {
      setOtpStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Subtabs navigation inside the admin dashboard */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Real-time Analytics Portal</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'payments'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Gateway & Invoicing</span>
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'security'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security, JWT & RLS Shield</span>
        </button>

        <button
          onClick={() => setActiveSubTab('seo')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'seo'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>SEO & Web Vitals</span>
        </button>

        <button
          onClick={() => setActiveSubTab('integrations')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'integrations'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>OTP & SMTP Integrations</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. ANALYTICS PORTAL */}
      {/* ========================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Daily Active Users (DAU)</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{analytics.dau.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md">+5.2%</span>
              </div>
              <p className="text-[10px] text-slate-400">Monthly active users (MAU): {analytics.mau.toLocaleString()}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Platform Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">₹{analytics.totalRevenue.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md">+14%</span>
              </div>
              <p className="text-[10px] text-slate-400">Direct sales commission, boosts & plans</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Listing Views Tracker</span>
                <Eye className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{analytics.totalViews.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/20 px-1.5 py-0.5 rounded-md">8.4k avg/hr</span>
              </div>
              <p className="text-[10px] text-slate-400">Total consumer page impressions</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Lead Conversion Rate</span>
                <Percent className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{analytics.conversionRate}%</span>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-md">+0.8%</span>
              </div>
              <p className="text-[10px] text-slate-400">Views-to-chat conversion metrics</p>
            </div>

          </div>

          {/* Graphical Analytics Distribution Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Top Categories Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  Top Marketplace Categories
                </h3>
                <p className="text-[11px] text-slate-400">Listing distribution across taxonomical divisions.</p>
              </div>

              <div className="space-y-3 pt-2">
                {analytics.topCategories.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{c.category}</span>
                      <span className="font-bold">{c.count} ads ({c.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${c.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cities Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Top Cities & Revenue Nodes
                </h3>
                <p className="text-[11px] text-slate-400">Demographic insights and location performance.</p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics.topCities.map((city, i) => (
                  <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-white">{city.city}</div>
                      <div className="text-[10px] text-slate-400">{city.listings} listings active</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white">₹{city.revenue.toLocaleString()}</div>
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.2 rounded">Premium Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-purple-500" />
                  Inbound Traffic Acquisition
                </h3>
                <p className="text-[11px] text-slate-400">Marketing attribution and navigation routes.</p>
              </div>

              <div className="space-y-3 pt-2">
                {analytics.trafficSources.map((source, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{source.source}</span>
                      <span className="font-bold">{source.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono text-right">{source.count.toLocaleString()} visits</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Metrics for Premium Sales Tracker */}
          <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-950 shadow-md">
            <div className="space-y-1">
              <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Premium Booster Checkout Funnel</div>
              <h4 className="text-sm font-black">Conversion & Premium Boost sales tracker matches target model SLA</h4>
              <p className="text-xs text-blue-100">382 boosters sold this cycle with an average checkout order value of ₹640 (Stripe + Razorpay routing).</p>
            </div>
            <div className="bg-white/10 border border-white/10 px-4 py-2 rounded-xl shrink-0 text-center font-mono text-xs">
              <div className="text-[9px] text-blue-300">Conversion Multiplier</div>
              <div className="text-base font-black text-emerald-400">10.2x Normal View rate</div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PAYMENT GATEWAY & INVOICING */}
      {/* ========================================================= */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Payment simulator panel */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  Interactive Gateway Sandbox & Invoice Generator
                </h3>
                <p className="text-xs text-slate-400">Simulate checkouts via multi-channel gateways with real-time tax breakdown (GST) and vouchers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Selector values */}
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Premium Package</label>
                    <select 
                      className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedPlan(val);
                        if (val.includes('Feature')) {
                          setPaymentAmount(1299);
                        } else if (val.includes('Booster')) {
                          setPaymentAmount(499);
                        } else {
                          setPaymentAmount(249);
                        }
                        setDiscountAmount(0);
                        setPaymentStatus('idle');
                      }}
                    >
                      <option value="Premium Feature Slot">Premium Feature Slot (₹1,299)</option>
                      <option value="Ad Booster Pack">Ad Booster Pack (₹499)</option>
                      <option value="Basic Gold Highlights">Basic Gold Highlights (₹249)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Gateway Service</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'stripe', name: 'Stripe API' },
                        { id: 'razorpay', name: 'Razorpay' },
                        { id: 'upi', name: 'UPI Gateway' }
                      ].map(g => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setSelectedGateway(g.id as any)}
                          className={`p-2.5 text-[11px] font-black rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer ${
                            selectedGateway === g.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-extrabold'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{g.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coupon implementation */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Apply Discount Coupon</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={appliedCoupon} 
                        onChange={(e) => setAppliedCoupon(e.target.value)}
                        placeholder="e.g. FESTIVE50" 
                        className="flex-1 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700"
                      />
                      <button 
                        type="button"
                        onClick={handleApplyCoupon}
                        className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3.5 rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer transition"
                      >
                        Apply
                      </button>
                    </div>
                    {discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ Coupon active! Saved ₹{discountAmount}</span>
                    )}
                  </div>

                </div>

                {/* Live Invoice Preview Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-700 pb-2 text-center">
                    <div className="font-extrabold uppercase text-[10px] tracking-widest text-slate-400">Invoice Draft & Breakdown</div>
                    <span className="text-[9px] text-slate-400">LocalMarket classifieds, India</span>
                  </div>

                  <div className="space-y-1.5 leading-relaxed font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Package Item:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{selectedPlan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Value:</span>
                      <span>₹{(paymentAmount - discountAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-rose-500">
                      <span>GST Component ({invoiceGST}%):</span>
                      <span>₹{((paymentAmount - discountAmount) * (invoiceGST / 100) / (1 + invoiceGST / 100)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 font-black text-slate-900 dark:text-white text-xs">
                      <span>Total Payable:</span>
                      <span>₹{(paymentAmount - discountAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {paymentStatus === 'idle' && (
                      <button
                        type="button"
                        onClick={simulatePayment}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Checkout via {selectedGateway.toUpperCase()}</span>
                      </button>
                    )}

                    {paymentStatus === 'processing' && (
                      <div className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-center rounded-xl text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Authorizing secure gateway tokens...</span>
                      </div>
                    )}

                    {paymentStatus === 'success' && (
                      <div className="space-y-2">
                        <div className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-center rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Transaction Successful</span>
                        </div>
                        <div className="text-[10px] text-center text-slate-400">
                          Invoice ID: <span className="font-bold text-slate-600 dark:text-slate-300">{invoiceId}</span> (Receipt dispatched)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Coupons manager card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Tag className="w-4.5 h-4.5 text-amber-500" />
                  Coupons & Promotion Codes
                </h3>
                <p className="text-xs text-slate-400">Provision active discounts for checkout.</p>
              </div>

              <form onSubmit={handleAddCoupon} className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="NEWCODE30"
                    className="flex-1 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2 border border-slate-200 dark:border-slate-700"
                  />
                  <input 
                    type="number" 
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    className="w-16 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2 border border-slate-200 dark:border-slate-700 text-center"
                    min="1"
                    max="1000"
                  />
                  <select
                    value={newCouponType}
                    onChange={(e: any) => setNewCouponType(e.target.value)}
                    className="text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₹</option>
                  </select>
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-2.5 flex items-center justify-center cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="space-y-2 pt-2">
                {coupons.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-800 dark:text-white">
                        {c.code}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.type === 'percentage' ? `${c.value}% off` : `₹${c.value} off`}</span>
                    </div>
                    <button
                      onClick={() => {
                        setCoupons(coupons.map((item, idx) => {
                          if (idx === i) return { ...item, isActive: !item.isActive };
                          return item;
                        }));
                      }}
                      className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        c.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Transaction Ledger Table with Refund operations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Relational Payment Ledger & Refund Auditing</h3>
              <p className="text-xs text-slate-400 font-medium">Audit logs of all captured checkout records. Administrators can initiate immediate gateway refunds.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-2.5">Invoice ID</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Gateway Service</th>
                    <th className="py-2.5">Net Price (Base)</th>
                    <th className="py-2.5">GST (18%)</th>
                    <th className="py-2.5">Total Captured</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Refund Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {paymentHistory.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{p.id}</td>
                      <td className="py-3 text-[11px] text-slate-400">{p.date}</td>
                      <td className="py-3 uppercase text-[10px] font-bold text-slate-500">{p.gateway}</td>
                      <td className="py-3">₹{p.net?.toLocaleString()}</td>
                      <td className="py-3 text-rose-500">₹{p.gst?.toLocaleString()}</td>
                      <td className="py-3 font-black text-slate-900 dark:text-white">₹{p.amount.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          p.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                        }`}>{p.status}</span>
                      </td>
                      <td className="py-3 text-right">
                        {p.status === 'Completed' ? (
                          <button
                            onClick={() => simulateRefund(p.id)}
                            className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer"
                          >
                            Initiate Refund
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Refunded Successfully</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SECURITY & JWT MONITOR */}
      {/* ========================================================= */}
      {activeSubTab === 'security' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Security Checklist Status matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'JWT Authentication', desc: 'Secure tokens handshake active', icon: <Key className="w-4 h-4 text-emerald-500" /> },
              { title: 'HTTPS & SSL Security', desc: 'SHA-256 Transport active', icon: <Lock className="w-4 h-4 text-emerald-500" /> },
              { title: 'CSRF & XSS Protection', desc: 'Active payload interceptors', icon: <Shield className="w-4 h-4 text-emerald-500" /> },
              { title: 'SQL Injection Guard', desc: 'PostgreSQL Prepared Statements', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> }
            ].map((shield, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider">{shield.title}</h4>
                  {shield.icon}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{shield.desc}</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Enforced & Healthy</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* MFA Phone OTP simulator card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-4.5 h-4.5 text-blue-500" />
                  Multi-Factor SMS OTP Verification
                </h3>
                <p className="text-xs text-slate-400">Test login security flows using simulated phone verification OTP challenges.</p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                  <input 
                    type="text" 
                    value={otpPhone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    {otpStatus === 'sending' ? 'Dispatching secure token...' : 'Send SMS OTP Token'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-xl text-[10px] border border-amber-100 dark:border-amber-900/50 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Security sandbox mock OTP token dispatched! Enter code <strong>4819</strong> to complete handshake.</span>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 4-digit code"
                        maxLength={4}
                        className="flex-1 text-center text-xs font-black tracking-widest bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white rounded-xl p-2 border border-slate-200 dark:border-slate-700 text-slate-800"
                      />
                      <button 
                        type="button"
                        onClick={() => handleVerifyOtp(otpCode)}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer transition"
                      >
                        Verify Code
                      </button>
                    </div>

                    {otpStatus === 'verified' && (
                      <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 justify-center">
                        <CheckCircle className="w-4 h-4" />
                        <span>MFA Security Verified successfully!</span>
                      </div>
                    )}
                    {otpStatus === 'error' && (
                      <div className="text-xs text-rose-600 font-bold text-center">✕ Incorrect OTP token. Please try again.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Role-Based Access Matrix & RLS status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <LockKeyhole className="w-4.5 h-4.5 text-purple-500" />
                  Role-Based Access Control (RBAC)
                </h3>
                <p className="text-xs text-slate-400">PostgreSQL Row-Level Security policy checks corresponding to platform hierarchy.</p>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 font-bold text-slate-400 uppercase tracking-widest">
                  <span>Resource</span>
                  <div className="flex gap-4">
                    <span>Buyer</span>
                    <span>Seller</span>
                    <span>Admin</span>
                  </div>
                </div>

                {[
                  { name: 'Browse/Search Listings', b: '✓', s: '✓', a: '✓' },
                  { name: 'Post/Delete Own Ads', b: '✕', s: '✓', a: '✓' },
                  { name: 'Flag / Report Abuse', b: '✓', s: '✓', a: '✓' },
                  { name: 'Trigger Refunds', b: '✕', s: '✕', a: '✓' },
                  { name: 'Delete Any Listing', b: '✕', s: '✕', a: '✓' }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/40 text-slate-600 dark:text-slate-300">
                    <span>{row.name}</span>
                    <div className="flex gap-8 pr-1 font-extrabold font-mono text-slate-800 dark:text-white">
                      <span className={row.b === '✓' ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'}>{row.b}</span>
                      <span className={row.s === '✓' ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'}>{row.s}</span>
                      <span className={row.a === '✓' ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-600'}>{row.a}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capture Rate limit and captha details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-4.5 h-4.5 text-blue-500" />
                  Threat Mitigation Parameters
                </h3>
                <p className="text-xs text-slate-400">Parameters set on API routes to mitigate bot traffic and DDoS attacks.</p>
              </div>

              <div className="space-y-3 pt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span>Rate Limit (All Endpoints):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">100 req / 1 min</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span>Max File Upload Size:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">5 MB (Secure S3 CDN)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span>Password Hashing Algorithm:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">bcrypt (12 rounds)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                  <span>CAPTCHA Protection:</span>
                  <span className="font-bold text-emerald-600">Google reCAPTCHA v3</span>
                </div>
              </div>
            </div>

          </div>

          {/* Secure Live Event Audit log */}
          <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-blue-500" />
                Live Intrusion Detection System & Security Log Feed
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="space-y-2 text-[11px] font-mono leading-relaxed text-slate-400">
              {securityLogs.map((log, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px] shrink-0 font-semibold">[{log.timestamp}]</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase shrink-0 ${
                      log.type === 'SUCCESS' ? 'bg-emerald-950/40 text-emerald-500 border border-emerald-900/30' :
                      log.type === 'WARN' ? 'bg-amber-950/40 text-amber-500 border border-amber-900/30' :
                      'bg-rose-950/40 text-rose-500 border border-rose-900/30'
                    }`}>{log.type}</span>
                    <span className="text-slate-300 text-xs">{log.event}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold self-end sm:self-auto">
                    IP: <span className="text-slate-400">{log.ip}</span> • Endpoint: <span className="text-slate-400">{log.endpoint}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* 4. SEO & WEB VITALS CONTROL ROOM */}
      {/* ========================================================= */}
      {activeSubTab === 'seo' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 border border-blue-100 dark:border-slate-800 p-5 rounded-2xl">
            <div className="flex gap-3 items-start">
              <Globe2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Active SEO Engine & Web Core Analytics Center</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  LocalMarket classifieds platform is engineered for immediate Google search discoverability. We generate <strong>Dynamic Meta Tags</strong>, <strong>Canonical URLs</strong>, and rich <strong>Schema.org JSON-LD structured data</strong> automatically as pages render. Sitemaps and crawler access rules are dynamically dispatched.
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <a href="/robots.txt" target="_blank" className="text-[10px] font-black bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-xs transition">
                    View Live Robots.txt →
                  </a>
                  <a href="/sitemap.xml" target="_blank" className="text-[10px] font-black bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-xs transition">
                    View Dynamic Sitemap.xml →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Core Web Vitals Interactive speed scoreboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Optimizer Switchboard */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Speed Optimization Settings
                </h4>
                <p className="text-[11px] text-slate-400">Toggle performance enhancements to optimize Core Web Vitals (CWV) diagnostics.</p>
              </div>

              <div className="space-y-3.5 pt-2">
                
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Image lazy-loading (`loading="lazy"`)</span>
                    <span className="text-[10px] text-slate-400">Sets explicit aspect-ratios to prevent layout shifts.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPerfLazyLoad(!perfLazyLoad)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${perfLazyLoad ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${perfLazyLoad ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Extract Critical Inline CSS</span>
                    <span className="text-[10px] text-slate-400">Inlines viewport CSS, reducing render-blocking steps.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPerfCriticalCss(!perfCriticalCss)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${perfCriticalCss ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${perfCriticalCss ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Gzip / Brotli Compression</span>
                    <span className="text-[10px] text-slate-400">Compresses HTML, JS bundles, and static assets.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPerfGzip(!perfGzip)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${perfGzip ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${perfGzip ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Convert Photos to Next-Gen WebP</span>
                    <span className="text-[10px] text-slate-400">Scales listing images dynamically using CDN logic.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPerfWebp(!perfWebp)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${perfWebp ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${perfWebp ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Edge HTML caching (Cloudflare CDN)</span>
                    <span className="text-[10px] text-slate-400">Caches index response globally for sub-100ms TTFB.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPerfCloudflare(!perfCloudflare)}
                    className={`w-10 h-6 rounded-full transition-all relative shrink-0 cursor-pointer ${perfCloudflare ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${perfCloudflare ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>

              </div>
            </div>

            {/* Core Web Vitals Diagnostic scoring panel */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Lighthouse Performance Report</h4>
                  <p className="text-[11px] text-slate-400">Live generated Google CrUX speed diagnostics corresponding to optimized rules.</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black ${
                    (60 + (perfLazyLoad ? 15 : 0) + (perfCriticalCss ? 10 : 0) + (perfGzip ? 8 : 0) + (perfWebp ? 5 : 0) + (perfCloudflare ? 7 : 0)) >= 90
                      ? 'text-emerald-500' : 'text-amber-500'
                  }`}>
                    {60 + (perfLazyLoad ? 15 : 0) + (perfCriticalCss ? 10 : 0) + (perfGzip ? 8 : 0) + (perfWebp ? 5 : 0) + (perfCloudflare ? 7 : 0)}/100
                  </div>
                  <span className="text-[9px] text-slate-400 uppercase font-black">Performance Score</span>
                </div>
              </div>

              {/* Progress visual indicator bar */}
              <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div 
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                    (60 + (perfLazyLoad ? 15 : 0) + (perfCriticalCss ? 10 : 0) + (perfGzip ? 8 : 0) + (perfWebp ? 5 : 0) + (perfCloudflare ? 7 : 0)) >= 90
                      ? 'from-emerald-400 to-emerald-600' : 'from-amber-400 to-amber-600'
                  }`}
                  style={{ width: `${60 + (perfLazyLoad ? 15 : 0) + (perfCriticalCss ? 10 : 0) + (perfGzip ? 8 : 0) + (perfWebp ? 5 : 0) + (perfCloudflare ? 7 : 0)}%` }}
                ></div>
              </div>

              {/* Grid of Key Web Vitals Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                
                {/* LCP */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">LCP</span>
                  <div className={`text-base font-black ${perfLazyLoad ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {perfLazyLoad ? '1.1s' : '2.8s'}
                  </div>
                  <span className="text-[8px] font-bold block text-slate-400">Largest Paint</span>
                  <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold ${perfLazyLoad ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'}`}>
                    {perfLazyLoad ? 'Good' : 'Needs Imp.'}
                  </span>
                </div>

                {/* FID */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">FID</span>
                  <div className={`text-base font-black ${perfCriticalCss ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {perfCriticalCss ? '12ms' : '82ms'}
                  </div>
                  <span className="text-[8px] font-bold block text-slate-400">Input Delay</span>
                  <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold ${perfCriticalCss ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'}`}>
                    Good
                  </span>
                </div>

                {/* CLS */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">CLS</span>
                  <div className={`text-base font-black ${perfLazyLoad ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {perfLazyLoad ? '0.01' : '0.19'}
                  </div>
                  <span className="text-[8px] font-bold block text-slate-400">Layout Shift</span>
                  <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold ${perfLazyLoad ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'}`}>
                    {perfLazyLoad ? 'Good' : 'Poor'}
                  </span>
                </div>

                {/* INP */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">INP</span>
                  <div className="text-base font-black text-emerald-600">35ms</div>
                  <span className="text-[8px] font-bold block text-slate-400">Interaction</span>
                  <span className="text-[8px] px-1 py-0.2 rounded font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20">
                    Good
                  </span>
                </div>

                {/* TTFB */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/80 text-center space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">TTFB</span>
                  <div className={`text-base font-black ${perfCloudflare ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {perfCloudflare ? '85ms' : '280ms'}
                  </div>
                  <span className="text-[8px] font-bold block text-slate-400">First Byte Time</span>
                  <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold ${perfCloudflare ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'}`}>
                    {perfCloudflare ? 'Good' : 'Needs Imp.'}
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* Dynamic Head Tags Sandbox & Schema inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Realtime Head Selector */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Code className="w-4.5 h-4.5 text-blue-500" />
                    Dynamic HTML Header & Meta Tag Inspector
                  </h4>
                  <p className="text-[11px] text-slate-400">Simulate catalog navigation to check dynamically injected meta tags.</p>
                </div>
              </div>

              {/* Selector toggles */}
              <div className="flex gap-1.5 border border-slate-100 dark:border-slate-800 p-1 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                {[
                  { id: 'home', label: 'Homepage' },
                  { id: 'iphone', label: 'iPhone ad' },
                  { id: 'furniture', label: 'Teak Sofa' },
                  { id: 'category', label: 'Mobiles category' }
                ].map(page => (
                  <button
                    key={page.id}
                    onClick={() => setSelectedSeoPage(page.id as any)}
                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition cursor-pointer ${
                      selectedSeoPage === page.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>

              {/* Head Meta Tags Preview Box */}
              <div className="p-4 bg-slate-950 text-slate-300 rounded-2xl font-mono text-[11px] border border-slate-800 space-y-2 leading-relaxed max-h-80 overflow-y-auto">
                <div className="text-slate-500 border-b border-slate-850 pb-1.5 text-[10px] tracking-widest font-black uppercase">
                  &lt;head&gt; elements preview
                </div>

                {/* Title tag */}
                <div>
                  <span className="text-rose-400">&lt;title&gt;</span>
                  <span className="text-white font-bold">
                    {selectedSeoPage === 'home' && "LocalMarket | India's #1 Premium Classifieds & Realtime Marketplace"}
                    {selectedSeoPage === 'iphone' && "iPhone 15 Pro Max - 256GB - Titanium Blue (Unopened) - ₹95,000 | LocalMarket"}
                    {selectedSeoPage === 'furniture' && "Premium Teak Wood L-Shaped Sofa Set - ₹42,000 | LocalMarket"}
                    {selectedSeoPage === 'category' && "Buy & Sell in Mobiles & Tablets | LocalMarket classifieds"}
                  </span>
                  <span className="text-rose-400">&lt;/title&gt;</span>
                </div>

                {/* Description tag */}
                <div>
                  <span className="text-emerald-400">&lt;meta</span>
                  <span className="text-purple-400"> name=</span>
                  <span className="text-amber-300">"description"</span>
                  <span className="text-purple-400"> content=</span>
                  <span className="text-amber-300">
                    {selectedSeoPage === 'home' && '"Discover premium second-hand goods, certified vehicles, properties, furniture, and jobs on India\'s leading real-time marketplace. Safe transactions, verified..."'}
                    {selectedSeoPage === 'iphone' && '"Selling a brand new, sealed iPhone 15 Pro Max 256GB in Natural Titanium. Comes with official Apple 1-year warranty. Receipts available. Firm price..."'}
                    {selectedSeoPage === 'furniture' && '"Selling our premium, custom-made L-shaped 5-seater sofa set made of genuine seasoned teak wood. Styled with high-density premium foam..."'}
                    {selectedSeoPage === 'category' && '"Browse premium items and active classified classified ads in Mobiles & Tablets. Uncover the best bargains on Mobile Phones, Tablets, Accessories."'}
                  </span>
                  <span className="text-emerald-400">/&gt;</span>
                </div>

                {/* Canonical URL */}
                <div>
                  <span className="text-emerald-400">&lt;link</span>
                  <span className="text-purple-400"> rel=</span>
                  <span className="text-amber-300">"canonical"</span>
                  <span className="text-purple-400"> href=</span>
                  <span className="text-amber-300">
                    {selectedSeoPage === 'home' && '"https://localmarket-india.com/"'}
                    {selectedSeoPage === 'iphone' && '"https://localmarket-india.com/listing/lst-1"'}
                    {selectedSeoPage === 'furniture' && '"https://localmarket-india.com/listing/lst-3"'}
                    {selectedSeoPage === 'category' && '"https://localmarket-india.com/category/mobiles"'}
                  </span>
                  <span className="text-emerald-400">/&gt;</span>
                </div>

                {/* Open Graph Tags */}
                <div className="pt-2 border-t border-dashed border-slate-900 space-y-1">
                  <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Open Graph (Facebook / LinkedIn)</div>
                  
                  <div>
                    <span className="text-emerald-400">&lt;meta</span>
                    <span className="text-purple-400"> property=</span>
                    <span className="text-amber-300">"og:title"</span>
                    <span className="text-purple-400"> content=</span>
                    <span className="text-amber-300">
                      {selectedSeoPage === 'home' && '"LocalMarket | India\'s #1 Premium Classifieds"'}
                      {selectedSeoPage === 'iphone' && '"iPhone 15 Pro Max - 256GB - Titanium Blue (Unopened)"'}
                      {selectedSeoPage === 'furniture' && '"Premium Teak Wood L-Shaped Sofa Set"'}
                      {selectedSeoPage === 'category' && '"Buy & Sell in Mobiles & Tablets"'}
                    </span>
                    <span className="text-emerald-400">/&gt;</span>
                  </div>

                  <div>
                    <span className="text-emerald-400">&lt;meta</span>
                    <span className="text-purple-400"> property=</span>
                    <span className="text-amber-300">"og:image"</span>
                    <span className="text-purple-400"> content=</span>
                    <span className="text-amber-300">
                      {selectedSeoPage === 'home' && '"https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800"'}
                      {selectedSeoPage === 'iphone' && '"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"'}
                      {selectedSeoPage === 'furniture' && '"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400"'}
                      {selectedSeoPage === 'category' && '"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"'}
                    </span>
                    <span className="text-emerald-400">/&gt;</span>
                  </div>
                </div>

                {/* Twitter Cards */}
                <div className="pt-2 border-t border-dashed border-slate-900 space-y-1">
                  <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Twitter Cards (X share)</div>
                  
                  <div>
                    <span className="text-emerald-400">&lt;meta</span>
                    <span className="text-purple-400"> name=</span>
                    <span className="text-amber-300">"twitter:card"</span>
                    <span className="text-purple-400"> content=</span>
                    <span className="text-amber-300">"summary_large_image"</span>
                    <span className="text-emerald-400">/&gt;</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Schema.org Generator & Copier */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4.5 h-4.5 text-purple-500" />
                    Schema.org Structured Data (JSON-LD)
                  </h4>
                  <p className="text-[11px] text-slate-400">Dynamic Google search engine rich-snippet metadata generation.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const text = selectedSeoPage === 'home' ? 'Home Schema JSON' : 'Product Schema JSON';
                    setCopiedType('schema');
                    setTimeout(() => setCopiedType(null), 2000);
                    navigator.clipboard.writeText(
                      JSON.stringify(
                        selectedSeoPage === 'home' ? {
                          "@context": "https://schema.org",
                          "@type": "WebSite",
                          "name": "LocalMarket Classifieds",
                          "url": "https://localmarket-india.com/"
                        } : {
                          "@context": "https://schema.org",
                          "@type": "Product",
                          "name": "iPhone 15 Pro Max",
                          "offers": { "@type": "Offer", "price": 95000, "priceCurrency": "INR" }
                        }, null, 2
                      )
                    );
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'schema' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="text-[10px] font-bold">{copiedType === 'schema' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* JSON-LD Text Block */}
              <div className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-[10.5px] border border-slate-800 space-y-1.5 leading-relaxed overflow-x-auto max-h-80 overflow-y-auto">
                <span className="text-rose-400 font-bold block">&lt;script type="application/ld+json"&gt;</span>
                
                {selectedSeoPage === 'home' && (
                  <pre className="text-slate-300 font-mono">
{`{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "LocalMarket Classifieds",
  "url": "https://localmarket-india.com/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://localmarket-india.com/?search={q}",
    "query-input": "required name=q"
  }
}`}
                  </pre>
                )}

                {selectedSeoPage === 'iphone' && (
                  <pre className="text-slate-300 font-mono">
{`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "iPhone 15 Pro Max - 256GB - Titanium Blue (Unopened)",
  "image": [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
  ],
  "description": "Selling a brand new, sealed iPhone 15 Pro Max 256GB in Natural Titanium.",
  "brand": {
    "@type": "Brand",
    "name": "Apple"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": 95000,
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Person",
      "name": "Marcus Vance"
    }
  }
}`}
                  </pre>
                )}

                {selectedSeoPage === 'furniture' && (
                  <pre className="text-slate-300 font-mono">
{`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Teak Wood L-Shaped Sofa Set",
  "image": [
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400"
  ],
  "description": "Selling our premium, custom-made L-shaped sofa set made of genuine teak wood.",
  "brand": {
    "@type": "Brand",
    "name": "Royal Furniture Hub"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": 42000,
    "itemCondition": "https://schema.org/UsedCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Person",
      "name": "Royal Furniture Hub"
    }
  }
}`}
                  </pre>
                )}

                {selectedSeoPage === 'category' && (
                  <pre className="text-slate-300 font-mono">
{`{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://localmarket-india.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Mobiles & Tablets",
      "item": "https://localmarket-india.com/category/mobiles"
    }
  ]
}`}
                  </pre>
                )}

                <span className="text-rose-400 font-bold block">&lt;/script&gt;</span>
              </div>
            </div>

          </div>

          {/* Dynamic Robots.txt and Sitemap.xml Sandbox */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Robots.txt Control room */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
                  Robots.txt Crawl Control Sandbox
                </h4>
                <p className="text-[11px] text-slate-400">Define search index inclusion guidelines for user-agents and crawling spiders.</p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Disallow Admin (/admin/)</span>
                  <button 
                    onClick={() => setRobotsDisallowAdmin(!robotsDisallowAdmin)}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer transition ${robotsDisallowAdmin ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                  >
                    {robotsDisallowAdmin ? 'Disallowed' : 'Allowed'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Disallow Private Chats (/chats/)</span>
                  <button 
                    onClick={() => setRobotsDisallowChats(!robotsDisallowChats)}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer transition ${robotsDisallowChats ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                  >
                    {robotsDisallowChats ? 'Disallowed' : 'Allowed'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Disallow Server API (/api/)</span>
                  <button 
                    onClick={() => setRobotsDisallowApi(!robotsDisallowApi)}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer transition ${robotsDisallowApi ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                  >
                    {robotsDisallowApi ? 'Disallowed' : 'Allowed'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/40">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Googlebot-Image access</span>
                  <button 
                    onClick={() => setRobotsAllowGooglebotImage(!robotsAllowGooglebotImage)}
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded cursor-pointer transition ${robotsAllowGooglebotImage ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}
                  >
                    {robotsAllowGooglebotImage ? 'Allowed' : 'Disallowed'}
                  </button>
                </div>

              </div>

              {/* Live Robots.txt visual rendering */}
              <div className="p-4 bg-slate-950 text-slate-300 rounded-2xl font-mono text-[11px] border border-slate-850 space-y-1">
                <div className="text-[9px] text-slate-600 font-black uppercase tracking-wider mb-2">Generated live robots.txt output</div>
                <div>User-agent: *</div>
                <div>Allow: /</div>
                {robotsDisallowAdmin && <div className="text-rose-400">Disallow: /admin/</div>}
                {robotsDisallowChats && <div className="text-rose-400">Disallow: /chats/</div>}
                {robotsDisallowApi && <div className="text-rose-400">Disallow: /api/</div>}
                
                {robotsAllowGooglebotImage && (
                  <div className="pt-2 text-emerald-400">
                    <div>User-agent: Googlebot-Image</div>
                    <div>Allow: /</div>
                  </div>
                )}
                
                <div className="pt-2 text-blue-400">
                  Sitemap: https://localmarket-india.com/sitemap.xml
                </div>
              </div>
            </div>

            {/* Sitemap.xml file generator */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4.5 h-4.5 text-blue-500" />
                    Interactive Dynamic Sitemap.xml Node Ledger
                  </h4>
                  <p className="text-[11px] text-slate-400">Catalog routing map loaded instantly by Googlebot indexes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCopiedType('sitemap');
                    setTimeout(() => setCopiedType(null), 2000);
                    navigator.clipboard.writeText(
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://localmarket-india.com/</loc>
    <lastmod>2026-07-16</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://localmarket-india.com/sell</loc>
    <lastmod>2026-07-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`
                    );
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'sitemap' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span className="text-[10px] font-bold">{copiedType === 'sitemap' ? 'Copied XML' : 'Copy sitemap'}</span>
                </button>
              </div>

              {/* Sitemap nodes list */}
              <div className="p-4 bg-slate-950 text-slate-300 rounded-2xl font-mono text-[10px] border border-slate-850 max-h-56 overflow-y-auto leading-relaxed">
                <span className="text-slate-500 block">&lt;?xml version="1.0" encoding="UTF-8"?&gt;</span>
                <span className="text-blue-400 block">&lt;urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"&gt;</span>
                
                {[
                  { loc: '/', freq: 'daily', p: '1.0' },
                  { loc: '/sell', freq: 'weekly', p: '0.8' },
                  { loc: '/chats', freq: 'daily', p: '0.6' },
                  { loc: '/directory', freq: 'weekly', p: '0.7' },
                  { loc: '/category/mobiles', freq: 'daily', p: '0.9' },
                  { loc: '/category/vehicles', freq: 'daily', p: '0.9' },
                  { loc: '/listing/lst-1', freq: 'weekly', p: '0.7' },
                  { loc: '/listing/lst-3', freq: 'weekly', p: '0.7' }
                ].map((node, i) => (
                  <div key={i} className="pl-4 border-l border-slate-850 my-1">
                    <span className="text-rose-400">&lt;url&gt;</span>
                    <div className="pl-4">
                      <span className="text-purple-400">&lt;loc&gt;</span>
                      <span className="text-white">https://localmarket-india.com{node.loc}</span>
                      <span className="text-purple-400">&lt;/loc&gt;</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-purple-400">&lt;changefreq&gt;</span>
                      <span className="text-white">{node.freq}</span>
                      <span className="text-purple-400">&lt;/changefreq&gt;</span>
                    </div>
                    <div className="pl-4">
                      <span className="text-purple-400">&lt;priority&gt;</span>
                      <span className="text-emerald-400 font-bold">{node.p}</span>
                      <span className="text-purple-400">&lt;/priority&gt;</span>
                    </div>
                    <span className="text-rose-400">&lt;/url&gt;</span>
                  </div>
                ))}

                <span className="text-blue-400 block">&lt;/urlset&gt;</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'integrations' && (
        <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
          {/* Header Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-blue-500" />
              Dynamic Communications Manager
            </h3>
            <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
              Connect and verify your real <strong>Gmail SMTP</strong> email delivery credentials and <strong>WhatsApp OTP API Gateway</strong> (supports Twilio & Meta WhatsApp Business Cloud API) directly from this Admin Panel.
            </p>
          </div>

          <form onSubmit={handleSaveIntegrations} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. GMAIL SMTP CONTAINER */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Gmail Account Connector</h4>
                      <p className="text-[11px] text-slate-400">Dispatch real secure password recovery OTP codes via Gmail</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={gmailEnabled}
                      onChange={(e) => setGmailEnabled(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className={`space-y-3 ${!gmailEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gmail Address</label>
                    <input 
                      type="email" 
                      value={gmailUser}
                      onChange={(e) => setGmailUser(e.target.value)}
                      placeholder="e.g. your-email@gmail.com"
                      disabled={!gmailEnabled}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Google App Password (16-char)</label>
                    <div className="relative">
                      <input 
                        type={showGmailPass ? "text" : "password"} 
                        value={gmailPass}
                        onChange={(e) => setGmailPass(e.target.value)}
                        placeholder="e.g. abcd efgh ijkl mnop"
                        disabled={!gmailEnabled}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 pr-10 border border-slate-200 dark:border-slate-700 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGmailPass(!showGmailPass)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      *Generate this in Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords. Do NOT enter your normal account login password.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. WHATSAPP OTP GATEWAY */}
              <div id="whatsapp-credentials-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4 transition-all duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        WhatsApp OTP Gateway
                        {whatsappProvider === 'twilio' && <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-extrabold uppercase">Twilio Active</span>}
                        {whatsappProvider === 'whatsapp_cloud_api' && <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-extrabold uppercase">Meta Cloud API</span>}
                      </h4>
                      <p className="text-[11px] text-slate-400">Deliver user SMS/WhatsApp OTP verify challenges instantly</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={whatsappEnabled}
                      onChange={(e) => setWhatsappEnabled(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className={`space-y-3 ${!whatsappEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Gateway Provider</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold lowercase">(Select Twilio to paste Account SID & Auth Token)</span>
                    </label>
                    <select
                      value={whatsappProvider}
                      onChange={(e: any) => setWhatsappProvider(e.target.value)}
                      disabled={!whatsappEnabled}
                      className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 border-2 border-blue-200 dark:border-blue-900/60 focus:border-blue-500"
                    >
                      <option value="sandbox">Sandbox Simulator Mode (Local bypass)</option>
                      <option value="twilio">Twilio WhatsApp Business Gateway (SID, Token & Phone)</option>
                      <option value="whatsapp_cloud_api">Meta WhatsApp Cloud API (Direct)</option>
                    </select>
                  </div>

                  {whatsappProvider === 'twilio' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Twilio Account SID</label>
                          <input 
                            type="text" 
                            value={whatsappAccountId}
                            onChange={(e) => setWhatsappAccountId(e.target.value)}
                            placeholder="ACxxxxxxxxxxxxxxxxxxxx"
                            disabled={!whatsappEnabled}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sender WhatsApp Number</label>
                          <input 
                            type="text" 
                            value={whatsappPhone}
                            onChange={(e) => setWhatsappPhone(e.target.value)}
                            placeholder="+14155238886"
                            disabled={!whatsappEnabled}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Twilio Auth Token</label>
                        <div className="relative">
                          <input 
                            type={showWhatsappToken ? "text" : "password"} 
                            value={whatsappApiToken}
                            onChange={(e) => setWhatsappApiToken(e.target.value)}
                            placeholder="Twilio Auth Token secret"
                            disabled={!whatsappEnabled}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 pr-10 border border-slate-200 dark:border-slate-700 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWhatsappToken(!showWhatsappToken)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {whatsappProvider === 'whatsapp_cloud_api' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number ID</label>
                          <input 
                            type="text" 
                            value={whatsappPhoneNumberId}
                            onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                            placeholder="15-digit Phone Number ID"
                            disabled={!whatsappEnabled}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Business Account ID</label>
                          <input 
                            type="text" 
                            value={whatsappAccountId}
                            onChange={(e) => setWhatsappAccountId(e.target.value)}
                            placeholder="15-digit Account ID"
                            disabled={!whatsappEnabled}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meta Permanent API Bearer Token</label>
                        <div className="relative">
                          <input 
                            type={showWhatsappToken ? "text" : "password"} 
                            value={whatsappApiToken}
                            onChange={(e) => setWhatsappApiToken(e.target.value)}
                            placeholder="EAAGxxxxx..."
                            disabled={!whatsappEnabled}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white rounded-xl p-2.5 pr-10 border border-slate-200 dark:border-slate-700 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWhatsappToken(!showWhatsappToken)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Configure this in your Facebook Developer Dashboard under WhatsApp Cloud API settings.
                        </p>
                      </div>
                    </>
                  )}

                  {whatsappProvider === 'sandbox' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1.5 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-normal">
                      <p className="font-bold text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Developer Sandbox Bypass Mode Active
                      </p>
                      <p>
                        No real messages will be sent. Secure code delivery is simulated client-side. Complete verification instantly using the provided on-screen dialogs or logs.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* MESSAGE FEEDBACK TOAST/ALERT IN PANEL */}
            {integrationMsg && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>{integrationMsg}</span>
              </div>
            )}
            {integrationError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>{integrationError}</span>
              </div>
            )}

            {/* SAVE BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingIntegrations || loadingIntegrations}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                {savingIntegrations ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving configurations...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Integration Credentials</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* 3. VERIFICATION & LIVE INTEGRATION TEST BENCH */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                Dynamic Communications Live Test Bench
              </h4>
              <p className="text-xs text-slate-400">Trigger manual end-to-end sandbox or live OTP checks to confirm Gmail SMTP or WhatsApp API status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Test Email Form */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-red-500" />
                  Test Gmail OTP Dispatch
                </h5>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Recipient email address"
                    className="flex-1 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {testingEmail ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send Test</span>
                  </button>
                </div>
              </div>

              {/* Test WhatsApp Form */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  Test WhatsApp OTP Dispatch
                </h5>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="Recipient mobile with country code"
                    className="flex-1 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl p-2.5 border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={handleTestWhatsapp}
                    disabled={testingWhatsapp}
                    className="px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {testingWhatsapp ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send Test</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 4. STEP-BY-STEP SETUP GUIDES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-500" />
                  Integration Setup Manual & Step-by-Step Guides
                </h4>
                <p className="text-xs text-slate-400">Interactive checklists and credentials generation instructions for the Admin.</p>
              </div>

              {/* Guide Tabs Selector */}
              <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('gmail')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    activeGuideTab === 'gmail'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Gmail SMTP
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('twilio')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    activeGuideTab === 'twilio'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Twilio WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGuideTab('meta')}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                    activeGuideTab === 'meta'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Meta Cloud API
                </button>
              </div>
            </div>

            {/* GMAIL SMTP GUIDE */}
            {activeGuideTab === 'gmail' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                <div className="flex items-start gap-3 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                  <Mail className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white mb-1">Gmail SMTP Verification Pipeline</h5>
                    <p>Secures password-less logins and listing updates by dispatching real 6-digit alphanumeric authentication codes straight to the user's inbox.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">1</span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Enable 2-Step Verification</p>
                      <p>Open your Google Account page, navigate to the <strong>Security</strong> tab, locate <strong>2-Step Verification</strong>, and activate it for your Google Account.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">2</span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Create an App Password</p>
                      <p>Under 2-Step Verification settings, scroll to the bottom and select <strong>App Passwords</strong>. Enter a name (e.g. "Classifieds Marketplace") and click Create. Copy the generated <strong>16-character code</strong> (looks like: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-red-500 font-bold">abcd efgh ijkl mnop</code>).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">3</span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Configure Credentials & Toggle Enable</p>
                      <p>Paste your Gmail address and the 16-character App Password into the connector form above, check the <strong>Gmail Connector Enable Switch</strong>, and hit Save.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TWILIO WHATSAPP GUIDE */}
            {activeGuideTab === 'twilio' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                <div className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Interactive Setup Shortcut</p>
                    <p className="text-xs font-extrabold text-white">Ready to paste Twilio credentials?</p>
                    <p className="text-[11px] text-blue-100/90">Clicking below automatically selects Twilio in the form above and jumps to input fields.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappEnabled(true);
                      setWhatsappProvider('twilio');
                      const el = document.getElementById('whatsapp-credentials-card');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-black text-xs rounded-xl shadow-sm transition cursor-pointer shrink-0 flex items-center gap-1.5 border-none"
                  >
                    <Settings2 className="w-4 h-4 text-blue-600" />
                    Open Twilio Input Form Above
                  </button>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <MessageSquare className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white mb-1">Twilio WhatsApp Sandbox Setup</h5>
                    <p>Deliver secure OTP challenge codes instantly to users on WhatsApp via Twilio's compliant global communications gateway.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">1</span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Extract API Keys from Twilio Console</p>
                      <p>Sign up/Log in to the <strong>Twilio Console</strong>. Locate your <strong>Account SID</strong> and <strong>Auth Token</strong> on the primary dashboard and copy them.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">2</span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Register recipient on Twilio WhatsApp Sandbox</p>
                      <p>Go to <strong>Messaging &gt; Try It Out &gt; Send a WhatsApp Message</strong>. Scan the QR code or send the designated sandbox phrase (e.g. <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-emerald-500">join bounds-some</code>) to the Twilio Sandbox WhatsApp number (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-bold">+1 415 523 8886</code>).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">3</span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Save Credentials & Dispatch Test</p>
                      <p>Fill in <strong>Account SID</strong>, <strong>Auth Token</strong>, and sender number (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">+14155238886</code>) in the <strong>WhatsApp OTP Gateway</strong> card above, then click <strong>Save Integration Credentials</strong>.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">Finished entering details?</span>
                  <button
                    type="button"
                    onClick={handleSaveIntegrations}
                    disabled={savingIntegrations || loadingIntegrations}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md cursor-pointer border-none"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Credentials Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* META CLOUD API GUIDE */}
            {activeGuideTab === 'meta' && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                <div className="p-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Interactive Setup Shortcut</p>
                    <p className="text-xs font-extrabold text-white">Ready to paste Meta Cloud API credentials?</p>
                    <p className="text-[11px] text-emerald-100/90">Clicking below automatically selects Meta Cloud API in the form above and jumps to input fields.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappEnabled(true);
                      setWhatsappProvider('whatsapp_cloud_api');
                      const el = document.getElementById('whatsapp-credentials-card');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-4 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 font-black text-xs rounded-xl shadow-sm transition cursor-pointer shrink-0 flex items-center gap-1.5 border-none"
                  >
                    <Settings2 className="w-4 h-4 text-emerald-600" />
                    Open Meta Input Form Above
                  </button>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-white mb-1">Meta WhatsApp Cloud API Integration</h5>
                    <p>Industrial, highly optimized delivery direct from Meta servers (highest deliverability SLA, no third-party branding).</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">1</span>
                    <div>
                      <p className="font-semibold text-slate-805 dark:text-slate-200">Configure Facebook App</p>
                      <p>Visit <strong>Meta for Developers</strong>, click <strong>My Apps</strong>, click <strong>Create App</strong>, choose the <strong>Business</strong> type, and select <strong>WhatsApp</strong> as your product.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">2</span>
                    <div>
                      <p className="font-semibold text-slate-805 dark:text-slate-200">Acquire Account & Phone IDs</p>
                      <p>In the Left Sidebar, open <strong>WhatsApp &gt; API Setup</strong>. Copy your <strong>Phone Number ID</strong> (15-digit code) and your <strong>WhatsApp Business Account ID</strong> (15-digit code).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0">3</span>
                    <div>
                      <p className="font-semibold text-slate-805 dark:text-slate-200">Generate Permanent Bearer Token & Save</p>
                      <p>In your Meta Business Manager console, under <strong>Users &gt; System Users</strong>, add a system user, assign <strong>WhatsApp Business</strong> access, and generate a permanent token. Paste into the form above and click Save.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">Finished entering details?</span>
                  <button
                    type="button"
                    onClick={handleSaveIntegrations}
                    disabled={savingIntegrations || loadingIntegrations}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-md cursor-pointer border-none"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Credentials Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
