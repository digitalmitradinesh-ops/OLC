import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  KeyRound, 
  X, 
  Check, 
  SlidersHorizontal,
  Mail,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { UserProfile } from '../types';

interface WebsiteManagersPanelProps {
  token: string | null;
}

export default function WebsiteManagersPanel({ token }: WebsiteManagersPanelProps) {
  const [managers, setManagers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [editingManager, setEditingManager] = useState<UserProfile | null>(null);

  // New Manager fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  
  // Permissions states
  const [manageListings, setManageListings] = useState(true);
  const [manageCategories, setManageCategories] = useState(true);
  const [manageBranding, setManageBranding] = useState(false);
  const [viewMetrics, setViewMetrics] = useState(false);

  // Edit fields (for selected manager)
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editManageListings, setEditManageListings] = useState(false);
  const [editManageCategories, setEditManageCategories] = useState(false);
  const [editManageBranding, setEditManageBranding] = useState(false);
  const [editViewMetrics, setEditViewMetrics] = useState(false);
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');

  // Fetch managers on load
  const fetchManagers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/managers/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.success) {
        setManagers(data.managers);
      } else {
        setErrorMsg(data.message || 'Failed to retrieve website managers list.');
      }
    } catch (err) {
      setErrorMsg('Network error while communicating with system administrator panel.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchManagers();
    }
  }, [token]);

  const resetForm = () => {
    setEmail('');
    setFullName('');
    setPhone('');
    setPassword('');
    setLocation('');
    setManageListings(true);
    setManageCategories(true);
    setManageBranding(false);
    setViewMetrics(false);
    setIsCreating(false);
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !fullName || !password) {
      setErrorMsg('Please specify manager email, full name and a secure password.');
      return;
    }

    try {
      const res = await fetch('/api/admin/managers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          fullName,
          phone,
          location,
          password,
          permissions: {
            manageListings,
            manageCategories,
            manageBranding,
            viewMetrics
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchManagers();
        resetForm();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to establish contact with secure registry.');
    }
  };

  const handleStartEdit = (manager: UserProfile) => {
    setEditingManager(manager);
    setEditFullName(manager.fullName);
    setEditPhone(manager.phone);
    setEditLocation(manager.location || '');
    const perms = manager.managerPermissions || {
      manageListings: true,
      manageCategories: true,
      manageBranding: false,
      viewMetrics: false
    };
    setEditManageListings(perms.manageListings);
    setEditManageCategories(perms.manageCategories);
    setEditManageBranding(perms.manageBranding);
    setEditViewMetrics(perms.viewMetrics);
    setEditStatus(manager.status || 'active');
  };

  const handleUpdateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/managers/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          id: editingManager.id,
          fullName: editFullName,
          phone: editPhone,
          location: editLocation,
          status: editStatus,
          permissions: {
            manageListings: editManageListings,
            manageCategories: editManageCategories,
            manageBranding: editManageBranding,
            viewMetrics: editViewMetrics
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setEditingManager(null);
        fetchManagers();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to transmit manager update settings.');
    }
  };

  const handleDeleteManager = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to revoke website access and permanently delete Website Manager "${name}"?`)) {
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/managers/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, id })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchManagers();
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Failed to revoke manager privileges.');
    }
  };

  return (
    <div className="space-y-6" id="website-managers-control-root">
      {/* Alert Banners */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs shadow-sm" id="manager-error-alert">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <span className="font-extrabold block">Administrator Notice</span>
            {errorMsg}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-800 text-xs shadow-sm animate-fade-in" id="manager-success-alert">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <div>
            <span className="font-extrabold block">Action Succeeded</span>
            {successMsg}
          </div>
        </div>
      )}

      {/* Main Grid: Control Bar and List */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-blue-600" />
            <span>Authorized Website Managers ({managers.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Grant secure granular roles for list moderations, category trees, and aesthetic theme modifications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchManagers}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:text-slate-950 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            title="Reload Manager Registry"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { resetForm(); setIsCreating(true); setEditingManager(null); }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Website Manager</span>
          </button>
        </div>
      </div>

      {/* Adding / Editing Modal Panel overlays or direct cards inside */}
      {(isCreating || editingManager) && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-6 animate-fade-in" id="manager-editor-panel">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-blue-600" />
              <span>{isCreating ? 'Provision Website Manager Access' : 'Modify Manager Privilege Profile'}</span>
            </h4>
            <button 
              onClick={() => { resetForm(); setEditingManager(null); }}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isCreating ? (
            <form onSubmit={handleCreateManager} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="manager@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Password (Secure Login) *</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Assigned Region / Location Scope</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Chennai, Tamil Nadu"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-extrabold uppercase text-slate-900 tracking-wider flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                  <span>Website Administrator Control - Granular Role Permissions</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={manageListings}
                      onChange={e => setManageListings(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-950 block">Manage & Moderate Listings</span>
                      <span className="text-[10px] text-slate-500">Allows approval, editing, deletion and flagging of user classified advertisements.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={manageCategories}
                      onChange={e => setManageCategories(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-950 block">Manage Categories Trees</span>
                      <span className="text-[10px] text-slate-500">Allows creation, renaming, description edits, and nesting of categories and subcategories.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={manageBranding}
                      onChange={e => setManageBranding(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-950 block">Update Branding & Metadata</span>
                      <span className="text-[10px] text-slate-500">Allows customizing theme colors, home page title layouts, website names, and footer credits.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={viewMetrics}
                      onChange={e => setViewMetrics(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-950 block">View Analytics & System Security</span>
                      <span className="text-[10px] text-slate-500">Provides read-only telemetry reports of registered users, revenue tracking, and security alerts.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
                >
                  Provision Secure Credentials
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdateManager} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Email (Immutable)</label>
                  <input
                    type="text"
                    disabled
                    value={editingManager?.email}
                    className="w-full px-4 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={editFullName}
                      onChange={e => setEditFullName(e.target.value)}
                      placeholder="Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Manager Status Control *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditStatus('active')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                        editStatus === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditStatus('suspended')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                        editStatus === 'suspended' 
                          ? 'bg-rose-50 text-rose-700 border-rose-300' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Suspended</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Assigned Region / Location Scope</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={editLocation}
                      onChange={e => setEditLocation(e.target.value)}
                      placeholder="e.g. Chennai, Tamil Nadu"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition outline-none text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3">
                <span className="text-[11px] font-extrabold uppercase text-slate-900 tracking-wider flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
                  <span>Update Website Administrator Control - Granular Role Permissions</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={editManageListings}
                      onChange={e => setEditManageListings(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-950 block">Manage & Moderate Listings</span>
                      <span className="text-[10px] text-slate-500">Allows approval, editing, deletion and flagging of user classified advertisements.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={editManageCategories}
                      onChange={e => setEditManageCategories(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-950 block">Manage Categories Trees</span>
                      <span className="text-[10px] text-slate-500">Allows creation, renaming, description edits, and nesting of categories and subcategories.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={editManageBranding}
                      onChange={e => setEditManageBranding(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-950 block">Update Branding & Metadata</span>
                      <span className="text-[10px] text-slate-500">Allows customizing theme colors, home page title layouts, website names, and footer credits.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={editViewMetrics}
                      onChange={e => setEditViewMetrics(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-950 block">View Analytics & System Security</span>
                      <span className="text-[10px] text-slate-500">Provides read-only telemetry reports of registered users, revenue tracking, and security alerts.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingManager(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
                >
                  Update Manager Profile
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Website Managers Listing Panel */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-semibold">Retrieving secure access lists...</p>
        </div>
      ) : managers.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-400 mx-auto" />
          <h4 className="text-sm font-black text-slate-950">No Sub-Administrators Defined</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Securely invite your team, provision Website Manager credentials, and configure precise access constraints.
          </p>
          <button
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Create First Website Manager Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {managers.map(mgr => {
            const perms = mgr.managerPermissions || {
              manageListings: true,
              manageCategories: true,
              manageBranding: false,
              viewMetrics: false
            };
            const isSuspended = mgr.status === 'suspended';

            return (
              <div 
                key={mgr.id} 
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm space-y-4 hover:shadow transition-all relative ${
                  isSuspended 
                    ? 'border-rose-200 dark:border-rose-950 bg-rose-50/5 dark:bg-rose-950/5' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
                id={`manager-card-${mgr.id}`}
              >
                {/* Manager Main Info */}
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={mgr.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={mgr.fullName}
                      referrerPolicy="no-referrer"
                      className={`w-12 h-12 rounded-2xl object-cover border-2 ${isSuspended ? 'border-rose-400 grayscale' : 'border-slate-200 dark:border-slate-800'}`}
                    />
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${
                      isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}>
                      {isSuspended ? (
                        <X className="w-2 h-2 text-white" />
                      ) : (
                        <Check className="w-2.5 h-2.5 text-white" />
                      )}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-slate-950 dark:text-white leading-none">{mgr.fullName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isSuspended 
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                      }`}>
                        {isSuspended ? 'Suspended' : 'Website Manager'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 leading-none pt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{mgr.email}</span>
                    </p>
                    {mgr.phone && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 leading-none pt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{mgr.phone}</span>
                      </p>
                    )}
                    {mgr.location && (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 leading-none pt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{mgr.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Permissions Breakdown */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Granular Security Privileges</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      {perms.manageListings ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span className={perms.manageListings ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}>Moderate Ads</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {perms.manageCategories ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span className={perms.manageCategories ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}>Category Tree</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {perms.manageBranding ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span className={perms.manageBranding ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}>Theme Branding</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {perms.viewMetrics ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-300" />
                      )}
                      <span className={perms.viewMetrics ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}>System Analytics</span>
                    </div>
                  </div>
                </div>

                {/* Manager Control Actions */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">Joined: {mgr.joinedDate || 'N/A'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(mgr)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Edit & Configure</span>
                    </button>
                    <button
                      onClick={() => handleDeleteManager(mgr.id, mgr.fullName)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                      title="Revoke and Delete Access"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
