import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Sparkles, 
  Table, 
  Code, 
  Terminal, 
  Layers, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Search, 
  Key, 
  Lock, 
  FileCode,
  Zap,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface SupabaseTable {
  name: string;
  rowsCount: number;
  category: string;
  description: string;
}

interface SqlResponse {
  success: boolean;
  command?: string;
  columns?: string[];
  rows?: any[];
  rowCount?: number;
  durationMs?: number;
  executedSql?: string;
  message?: string;
  error?: string;
}

const PRESET_QUERIES: { label: string; group: string; sql: string }[] = [
  {
    label: 'SELECT * FROM listings',
    group: 'Common Queries',
    sql: `SELECT id, title, category, price, seller_name, location, status, verified, created_at \nFROM listings \nORDER BY created_at DESC \nLIMIT 20;`
  },
  {
    label: 'SELECT * FROM users',
    group: 'Common Queries',
    sql: `SELECT id, email, full_name, phone_number, role, verified, created_at \nFROM users \nORDER BY created_at DESC;`
  },
  {
    label: 'SELECT * FROM categories',
    group: 'Common Queries',
    sql: `SELECT id, name, slug, popular_count \nFROM categories \nORDER BY popular_count DESC;`
  },
  {
    label: 'Create Listings Table',
    group: 'DDL Schema',
    sql: `CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  seller_name VARCHAR(150) NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    label: 'Create User Profiles Table',
    group: 'DDL Schema',
    sql: `CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone_number VARCHAR(20),
  role VARCHAR(20) DEFAULT 'seller',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
  },
  {
    label: 'Enable Row Level Security (RLS)',
    group: 'Security & RLS',
    sql: `-- Enable RLS on public listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Allow public read access for all active listings
CREATE POLICY "Public listings are viewable by everyone" 
ON public.listings FOR SELECT 
USING (status = 'active');

-- Allow authenticated users to insert their own listings
CREATE POLICY "Users can create their own listings" 
ON public.listings FOR INSERT 
WITH CHECK (auth.uid() = seller_id);`
  },
  {
    label: 'Insert New Classified Listing',
    group: 'DML Mutations',
    sql: `INSERT INTO public.listings (title, category, price, seller_name, location, status, verified)
VALUES (
  'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
  'Mobile Phones',
  112000.00,
  'Dinesh Mitra',
  'Connaught Place, New Delhi (110001)',
  'active',
  true
);`
  }
];

export function SupabaseSqlEditor() {
  const [sqlQuery, setSqlQuery] = useState<string>(PRESET_QUERIES[0].sql);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SqlResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [tables, setTables] = useState<SupabaseTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>('listings');
  const [viewMode, setViewMode] = useState<'grid' | 'json'>('grid');
  const [history, setHistory] = useState<string[]>([]);
  const [connectedStatus, setConnectedStatus] = useState<boolean>(true);

  // Load tables on mount
  useEffect(() => {
    fetchTables();
    // Auto execute initial query
    runQuery(PRESET_QUERIES[0].sql);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/supabase/tables');
      const data = await res.json();
      if (data.success && Array.isArray(data.tables)) {
        setTables(data.tables);
      }
    } catch (err) {
      console.error('Failed to load Supabase tables', err);
    }
  };

  const runQuery = async (queryToRun?: string) => {
    const q = (queryToRun || sqlQuery).trim();
    if (!q) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/supabase/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: q })
      });
      const data: SqlResponse = await res.json();
      setResult(data);

      if (data.success) {
        setHistory(prev => [q, ...prev.filter(h => h !== q)].slice(0, 10));
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: err?.message || 'Network or server error executing SQL query'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    if (!result?.rows || result.rows.length === 0) return;
    const cols = result.columns || Object.keys(result.rows[0]);
    const csvContent = [
      cols.join(','),
      ...result.rows.map(row => cols.map(c => JSON.stringify(row[c] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `supabase_query_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Supabase SQL Studio & Query Console
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Interactive PostgreSQL query executor & database engine for project <span className="font-mono text-emerald-400 font-bold">dyiswykbsoxrldwvjqdh</span>
            </p>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-3.5 py-2 rounded-2xl text-xs font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-bold">Connected:</span>
            <span className="text-emerald-400 font-bold truncate max-w-[200px]">dyiswykbsoxrldwvjqdh</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Tables & Presets Explorer */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Query Preset Templates */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Query Presets
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400">{PRESET_QUERIES.length} Presets</span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSqlQuery(preset.sql);
                    runQuery(preset.sql);
                  }}
                  className="w-full text-left p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/60 cursor-pointer group"
                >
                  <span className="truncate text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {preset.label}
                  </span>
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono shrink-0">
                    {preset.group}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table List Explorer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-blue-500" />
                Database Tables
              </h3>
              <button 
                type="button" 
                onClick={fetchTables} 
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                title="Refresh Table Schema"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {tables.map(tbl => (
                <button
                  key={tbl.name}
                  type="button"
                  onClick={() => {
                    setSelectedTable(tbl.name);
                    const q = `SELECT * FROM public.${tbl.name} LIMIT 25;`;
                    setSqlQuery(q);
                    runQuery(q);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between gap-2 border cursor-pointer ${
                    selectedTable === tbl.name 
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-extrabold' 
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Table className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono truncate">{tbl.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 font-bold">
                    {tbl.rowsCount} rows
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Main Column: SQL Editor & Output Table */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Interactive SQL Code Editor Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
            
            {/* Editor Top Bar */}
            <div className="p-3.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono font-bold">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>SQL Query Editor</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-slate-500 font-normal">Press Ctrl+Enter or Cmd+Enter to execute</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Copy SQL Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSqlQuery('')}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Clear Editor"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Clear</span>
                </button>
              </div>
            </div>

            {/* Code Textarea Area */}
            <div className="relative">
              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    runQuery();
                  }
                }}
                placeholder="Type raw PostgreSQL query or schema definition here..."
                className="w-full h-44 p-4 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed outline-none resize-y border-none focus:ring-0 selection:bg-blue-600 selection:text-white"
                spellCheck={false}
              />
            </div>

            {/* Action Toolbar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <div className="text-[10px] text-slate-500 font-mono">
                PostgreSQL 15 • Public Schema
              </div>

              <button
                type="button"
                onClick={() => runQuery()}
                disabled={loading || !sqlQuery.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white text-xs font-black rounded-xl transition duration-150 flex items-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Query...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>RUN QUERY (Ctrl+Enter)</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Results Output Console */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
            
            {/* Header / Stats Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Query Execution Results
                </h3>
              </div>

              {result && result.success && (
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/50 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {result.durationMs || 0}ms
                  </span>

                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500'}`}
                    >
                      Data Table
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('json')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${viewMode === 'json' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500'}`}
                    >
                      JSON Output
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={exportCsv}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer font-bold"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-[10px] hidden sm:inline">CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Executing statement against Supabase instance...
                </p>
              </div>
            ) : result ? (
              result.success ? (
                <div className="space-y-3">
                  
                  {/* Status message */}
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{result.message}</span>
                    </div>
                    <span className="font-mono text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                      {result.command || 'OK'}
                    </span>
                  </div>

                  {/* Table Grid View */}
                  {viewMode === 'grid' && result.rows && result.rows.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-[380px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 z-10">
                          <tr>
                            <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-400">#</th>
                            {(result.columns || Object.keys(result.rows[0])).map((col) => (
                              <th key={col} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 font-extrabold truncate">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                          {result.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-2 px-3 border-r border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold">
                                {idx + 1}
                              </td>
                              {(result.columns || Object.keys(result.rows[0])).map((col) => {
                                const val = row[col];
                                const isBool = typeof val === 'boolean';
                                return (
                                  <td key={col} className="py-2 px-3 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap truncate max-w-[240px]">
                                    {isBool ? (
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${val ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                                        {String(val)}
                                      </span>
                                    ) : val === null || val === undefined ? (
                                      <span className="text-slate-400 italic">null</span>
                                    ) : (
                                      String(val)
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : viewMode === 'json' ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto font-mono text-xs text-emerald-400 max-h-[350px]">
                      <pre>{JSON.stringify(result.rows || result, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Query executed cleanly. No tabular rows returned.
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>SQL Query Execution Failed</span>
                  </div>
                  <div className="font-mono text-xs text-rose-800 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/30 whitespace-pre-wrap">
                    {result.error}
                  </div>
                </div>
              )
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                <Code className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                <div>Run a SQL query above to inspect database tables and results.</div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
