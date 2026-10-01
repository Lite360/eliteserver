import React, { useState } from 'react';
import {
  ShieldCheck,
  Package,
  Key,
  Server,
  Globe,
  AlertTriangle,
  Terminal,
  Activity,
  Users,
  Settings,
  Search,
  Bell,
  Menu,
  X
} from 'lucide-react';
import {
  mockProducts,
  mockAccessKeys,
  mockInstallations,
  mockSecurityEvents,
  mockRemoteCommands
} from './mockData';
import type { Product, AccessKey, Installation, SecurityEvent, RemoteCommand } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // State Management
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>(mockAccessKeys);
  const [installations, setInstallations] = useState<Installation[]>(mockInstallations);
  const [securityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [remoteCommands, setRemoteCommands] = useState<RemoteCommand[]>(mockRemoteCommands);

  // Modals & Controls
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState<boolean>(false);
  const [newKeyProductId, setNewKeyProductId] = useState<string>(products[0]?.id || '');
  const [newKeyDomain, setNewKeyDomain] = useState<string>('');

  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdSlug, setNewProdSlug] = useState<string>('');
  const [newProdVersion, setNewProdVersion] = useState<string>('1.0.0');

  // Confirmation Modal state for Remote Actions
  const [confirmAction, setConfirmAction] = useState<{
    type: 'REMOVE_APPLICATION_FILES' | 'REMOVE_APPLICATION_DATABASE' | 'REVOKE_ACCESS' | 'LOCK_APPLICATION';
    installation: Installation;
  } | null>(null);
  const [typedConfirmation, setTypedConfirmation] = useState<string>('');

  // Handlers
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyDomain) return;

    const prod = products.find(p => p.id === newKeyProductId);
    const newKeyObj: AccessKey = {
      id: `key_${Date.now()}`,
      key: `ED-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      product_id: newKeyProductId,
      product_name: prod?.name || 'Unknown Product',
      authorized_domain: newKeyDomain.trim().toLowerCase(),
      status: 'active',
      activation_limit: 1,
      expires_at: null,
      created_at: new Date().toISOString()
    };

    setAccessKeys([newKeyObj, ...accessKeys]);
    setIsNewKeyModalOpen(false);
    setNewKeyDomain('');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const newProd: Product = {
      id: `prod_${Date.now()}`,
      name: newProdName,
      slug: newProdSlug || newProdName.toLowerCase().replace(/\s+/g, '-'),
      description: 'Newly created software product protected by EliteGuard.',
      version: newProdVersion,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProducts([...products, newProd]);
    setIsNewProductModalOpen(false);
    setNewProdName('');
  };

  const handleExecuteRemoteAction = () => {
    if (!confirmAction) return;

    const reqType = confirmAction.type === 'REMOVE_APPLICATION_FILES' ? 'REMOVE' :
      confirmAction.type === 'REMOVE_APPLICATION_DATABASE' ? 'DELETE DATABASE' :
        confirmAction.type;

    if (typedConfirmation !== reqType) {
      alert(`Confirmation string mismatch. Expected: "${reqType}"`);
      return;
    }

    const newCmd: RemoteCommand = {
      id: `CMD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      installation_id: confirmAction.installation.id,
      domain: confirmAction.installation.domain,
      command_type: confirmAction.type,
      command_status: 'pending',
      command_payload: { initiated_by: 'Super Admin', timestamp: new Date().toISOString() },
      command_signature: `sig_${Math.random().toString(36).substring(2, 12)}`,
      created_by: 'admin@elitedevs.com',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      executed_at: null,
      result: null
    };

    setRemoteCommands([newCmd, ...remoteCommands]);

    if (confirmAction.type === 'LOCK_APPLICATION' || confirmAction.type === 'REVOKE_ACCESS') {
      setInstallations(installations.map(inst =>
        inst.id === confirmAction.installation.id
          ? { ...inst, status: confirmAction.type === 'LOCK_APPLICATION' ? 'locked' : 'revoked' }
          : inst
      ));
    }

    setConfirmAction(null);
    setTypedConfirmation('');
    alert(`Remote action command ${newCmd.id} (${confirmAction.type}) successfully issued!`);
  };

  const totalProducts = products.length;
  const activeKeys = accessKeys.filter(k => k.status === 'active').length;
  const activeInstallations = installations.filter(i => i.status === 'active').length;
  const unauthorizedInstallations = installations.filter(i => i.status === 'domain_mismatch').length;

  return (
    <div className="flex h-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">

      {/* Sidebar Navigation */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#121827] border-r border-slate-800 transition-all duration-300 flex flex-col z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-lg tracking-tight text-white">ELITE<span className="text-blue-500">GUARD</span></span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-widest uppercase">Elite Developers</span>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white p-1 rounded">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'keys', label: 'Access Keys', icon: Key },
            { id: 'installations', label: 'Installations', icon: Server },
            { id: 'domains', label: 'Domains', icon: Globe },
            { id: 'events', label: 'Security Events', icon: AlertTriangle },
            { id: 'commands', label: 'Remote Actions', icon: Terminal },
            { id: 'logs', label: 'Activity Logs', icon: Activity },
            { id: 'admins', label: 'Administrators', icon: Users },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              AD
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Super Administrator</p>
                <p className="text-[10px] text-slate-400 truncate">admin@elitedevs.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="h-16 bg-[#121827]/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search access keys, domains, installations..."
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Neon DB & Vercel API Active</span>
            </div>
            <button className="relative text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Platform Overview</h1>
                <p className="text-xs text-slate-400">Monitor distributed PHP applications and security status in real-time.</p>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Products', value: totalProducts, sub: 'Active protected applications', icon: Package, color: 'text-blue-400' },
                  { title: 'Active Access Keys', value: activeKeys, sub: 'Keys authorized for deployment', icon: Key, color: 'text-emerald-400' },
                  { title: 'Active Installations', value: activeInstallations, sub: 'Verified active domains', icon: Server, color: 'text-indigo-400' },
                  { title: 'Unauthorized Attempts', value: unauthorizedInstallations, sub: 'Domain mismatches locked', icon: AlertTriangle, color: 'text-rose-400' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-[#121827] border border-slate-800 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="mt-3">
                        <span className="text-2xl font-bold text-white">{stat.value}</span>
                        <p className="text-[11px] text-slate-500 mt-1">{stat.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recent Security Activity Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#121827] border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                      <Server className="w-4 h-4 text-blue-400" />
                      <span>Recent Active Installations</span>
                    </h2>
                    <button onClick={() => setActiveTab('installations')} className="text-xs text-blue-400 hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/60 text-slate-400 font-medium uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Domain</th>
                          <th className="p-3">Product</th>
                          <th className="p-3">PHP / Script</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Last Seen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {installations.map((inst) => (
                          <tr key={inst.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-medium text-white">{inst.domain}</td>
                            <td className="p-3 text-slate-400">{inst.product_name}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-400">PHP {inst.php_version} / v{inst.script_version}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${inst.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  inst.status === 'domain_mismatch' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                {inst.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500 text-[11px]">{new Date(inst.last_seen_at).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Security Feed */}
                <div className="bg-[#121827] border border-slate-800 rounded-xl p-5 flex flex-col">
                  <h2 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Security Events Feed</span>
                  </h2>
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px]">
                    {securityEvents.map((evt) => (
                      <div key={evt.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-rose-400">{evt.event_type}</span>
                          <span className="text-[10px] text-slate-500">{new Date(evt.created_at).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-300 mt-1 font-medium">{evt.domain}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">IP: {evt.ip_address}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Protected Products</h1>
                  <p className="text-xs text-slate-400">Manage products integrated with EliteGuard system.</p>
                </div>
                <button
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
                >
                  + Add Product
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {products.map(prod => (
                  <div key={prod.id} className="bg-[#121827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                          {prod.slug}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">v{prod.version}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-3">{prod.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{prod.description}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                      <span>Status: <strong className="text-emerald-400">{prod.status}</strong></span>
                      <button className="text-blue-400 hover:underline">Edit Releases</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACCESS KEYS TAB */}
          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Access Keys Management</h1>
                  <p className="text-xs text-slate-400">Generate and bind unique embedded access keys to domain licenses.</p>
                </div>
                <button
                  onClick={() => setIsNewKeyModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition"
                >
                  + Generate Access Key
                </button>
              </div>

              <div className="bg-[#121827] border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Access Key</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Authorized Domain</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Created Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {accessKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-mono font-bold text-white">{key.key}</td>
                        <td className="p-3.5 text-slate-300">{key.product_name}</td>
                        <td className="p-3.5 font-medium text-slate-300">{key.authorized_domain}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${key.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              key.status === 'suspended' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            {key.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{new Date(key.created_at).toLocaleDateString()}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setAccessKeys(accessKeys.map(k => k.id === key.id ? { ...k, status: k.status === 'active' ? 'suspended' : 'active' } : k))}
                            className="text-slate-400 hover:text-white"
                          >
                            {key.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* INSTALLATIONS & REMOTE ACTIONS TAB */}
          {(activeTab === 'installations' || activeTab === 'commands') && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {activeTab === 'installations' ? 'Registered Installations' : 'Remote Actions & Commands'}
                </h1>
                <p className="text-xs text-slate-400">
                  Perform installation-specific administrative actions with explicit dual authentication.
                </p>
              </div>

              <div className="bg-[#121827] border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Installation ID</th>
                      <th className="p-3.5">Domain</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">IP / Server</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Remote Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {installations.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-mono text-slate-400">{inst.id}</td>
                        <td className="p-3.5 font-bold text-white">{inst.domain}</td>
                        <td className="p-3.5 text-slate-300">{inst.product_name}</td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">{inst.ip_address}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${inst.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              inst.status === 'domain_mismatch' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                'bg-slate-700 text-slate-300'
                            }`}>
                            {inst.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setConfirmAction({ type: 'LOCK_APPLICATION', installation: inst })}
                            className="bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                          >
                            Lock
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'REMOVE_APPLICATION_FILES', installation: inst })}
                            className="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                          >
                            Remove Files
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'REMOVE_APPLICATION_DATABASE', installation: inst })}
                            className="bg-rose-900/40 text-rose-300 hover:bg-rose-800 hover:text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                          >
                            Drop DB
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* NEW ACCESS KEY MODAL */}
      {isNewKeyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121827] border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Generate Access Key</h3>
              <button onClick={() => setIsNewKeyModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateKey} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Product</label>
                <select
                  value={newKeyProductId}
                  onChange={(e) => setNewKeyProductId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.slug})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Authorized Domain</label>
                <input
                  type="text"
                  placeholder="e.g. customerdomain.com"
                  value={newKeyDomain}
                  onChange={(e) => setNewKeyDomain(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNewKeyModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Generate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121827] border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Add Protected Product</h3>
              <button onClick={() => setIsNewProductModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Elite VTU System"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Slug</label>
                <input
                  type="text"
                  placeholder="e.g. vtu-pro"
                  value={newProdSlug}
                  onChange={(e) => setNewProdSlug(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Version</label>
                <input
                  type="text"
                  value={newProdVersion}
                  onChange={(e) => setNewProdVersion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNewProductModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR DESTRUCTIVE / REMOTE ACTIONS */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121827] border border-rose-500/40 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Explicit Action Confirmation Required</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are issuing a remote command <strong className="text-rose-400">{confirmAction.type}</strong> for target domain:
              <br />
              <span className="font-mono text-sm font-bold text-white underline mt-1 block">{confirmAction.installation.domain}</span>
            </p>

            <div className="bg-rose-950/40 border border-rose-800/40 p-3 rounded-lg text-[11px] text-rose-300">
              {confirmAction.type === 'REMOVE_APPLICATION_FILES' && 'This will trigger the customer PHP script to permanently remove application files on the next check.'}
              {confirmAction.type === 'REMOVE_APPLICATION_DATABASE' && 'This will drop configured database tables associated with this application installation.'}
              {confirmAction.type === 'LOCK_APPLICATION' && 'This will force the application into a locked state displaying ACCESS RESTRICTED.'}
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 font-medium">
                To confirm, type <span className="font-mono font-bold text-white">{
                  confirmAction.type === 'REMOVE_APPLICATION_FILES' ? 'REMOVE' :
                    confirmAction.type === 'REMOVE_APPLICATION_DATABASE' ? 'DELETE DATABASE' :
                      confirmAction.type
                }</span> below:
              </label>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                placeholder="Type confirmation here..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                onClick={() => { setConfirmAction(null); setTypedConfirmation(''); }}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRemoteAction}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
              >
                Confirm Remote Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
