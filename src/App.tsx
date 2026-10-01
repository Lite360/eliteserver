import React, { useState, useMemo } from 'react';
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
  Settings as SettingsIcon,
  Search,
  Bell,
  Menu,
  X,
  Plus,
  RefreshCw,
  Lock,
  Trash2,
  Database,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  Save,
  Check,
  Ban
} from 'lucide-react';
import {
  mockProducts,
  mockAccessKeys,
  mockInstallations,
  mockSecurityEvents,
  mockRemoteCommands,
  mockActivityLogs,
  mockAdministrators
} from './mockData';
import type {
  Product,
  AccessKey,
  Installation,
  SecurityEvent,
  RemoteCommand,
  ActivityLog,
  Administrator
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Core Data States
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [accessKeys, setAccessKeys] = useState<AccessKey[]>(mockAccessKeys);
  const [installations, setInstallations] = useState<Installation[]>(mockInstallations);
  const [securityEvents] = useState<SecurityEvent[]>(mockSecurityEvents);
  const [remoteCommands, setRemoteCommands] = useState<RemoteCommand[]>(mockRemoteCommands);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [administrators, setAdministrators] = useState<Administrator[]>(mockAdministrators);

  // Selected Detail Modal / Drawer
  const [selectedInstallation, setSelectedInstallation] = useState<Installation | null>(null);

  // Modals
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState<boolean>(false);
  const [newKeyProductId, setNewKeyProductId] = useState<string>(products[0]?.id || '');
  const [newKeyDomain, setNewKeyDomain] = useState<string>('');

  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newProdSlug, setNewProdSlug] = useState<string>('');
  const [newProdVersion, setNewProdVersion] = useState<string>('1.0.0');
  const [newProdDesc, setNewProdDesc] = useState<string>('');

  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState<boolean>(false);
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminRole, setNewAdminRole] = useState<'super_admin' | 'admin'>('admin');

  // Confirmation Modal state for Remote Actions & Destructive Actions
  const [confirmAction, setConfirmAction] = useState<{
    type: 'REMOVE_APPLICATION_FILES' | 'REMOVE_APPLICATION_DATABASE' | 'REVOKE_ACCESS' | 'LOCK_APPLICATION' | 'FORCE_RECHECK';
    installation: Installation;
  } | null>(null);
  const [typedConfirmation, setTypedConfirmation] = useState<string>('');

  // Settings State
  const [settings, setSettings] = useState({
    defaultRecheckIntervalHours: 6,
    strictDomainValidation: true,
    autoLockOnDomainMismatch: true,
    twoFactorEnforcement: false,
    signatureSecretConfigured: true,
    webhookUrl: 'https://api.elitedevs.com/webhooks/security-alerts',
    maintenanceMode: false
  });
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handlers
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyDomain) return;

    const prod = products.find(p => p.id === newKeyProductId);
    const newKeyStr = `ED-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newKeyObj: AccessKey = {
      id: `key_${Date.now()}`,
      key: newKeyStr,
      product_id: newKeyProductId,
      product_name: prod?.name || 'Unknown Product',
      authorized_domain: newKeyDomain.trim().toLowerCase(),
      status: 'active',
      activation_limit: 1,
      expires_at: null,
      created_at: new Date().toISOString()
    };

    setAccessKeys([newKeyObj, ...accessKeys]);

    // Log activity
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      administrator_id: 'admin_1',
      administrator_email: 'admin@elitedevs.com',
      action: 'ACCESS_KEY_GENERATED',
      resource_type: 'access_key',
      resource_id: newKeyObj.id,
      metadata: { key: newKeyStr, domain: newKeyDomain, product: prod?.name },
      ip_address: '105.112.54.12',
      created_at: new Date().toISOString()
    };
    setActivityLogs([newLog, ...activityLogs]);

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
      description: newProdDesc || 'Newly created software product protected by EliteGuard.',
      version: newProdVersion || '1.0.0',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProducts([...products, newProd]);

    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      administrator_id: 'admin_1',
      administrator_email: 'admin@elitedevs.com',
      action: 'PRODUCT_CREATED',
      resource_type: 'product',
      resource_id: newProd.id,
      metadata: { name: newProd.name, version: newProd.version },
      ip_address: '105.112.54.12',
      created_at: new Date().toISOString()
    };
    setActivityLogs([newLog, ...activityLogs]);

    setIsNewProductModalOpen(false);
    setNewProdName('');
    setNewProdSlug('');
    setNewProdDesc('');
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;

    const newAdmin: Administrator = {
      id: `admin_${Date.now()}`,
      email: newAdminEmail.trim().toLowerCase(),
      role: newAdminRole,
      two_factor_enabled: false,
      status: 'active',
      created_at: new Date().toISOString(),
      last_login_at: null
    };

    setAdministrators([...administrators, newAdmin]);

    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      administrator_id: 'admin_1',
      administrator_email: 'admin@elitedevs.com',
      action: 'ADMINISTRATOR_INVITED',
      resource_type: 'administrator',
      resource_id: newAdmin.id,
      metadata: { email: newAdmin.email, role: newAdmin.role },
      ip_address: '105.112.54.12',
      created_at: new Date().toISOString()
    };
    setActivityLogs([newLog, ...activityLogs]);

    setIsNewAdminModalOpen(false);
    setNewAdminEmail('');
  };

  const handleExecuteRemoteAction = () => {
    if (!confirmAction) return;

    const isHighRisk = confirmAction.type === 'REMOVE_APPLICATION_FILES' || confirmAction.type === 'REMOVE_APPLICATION_DATABASE';
    const reqType = confirmAction.type === 'REMOVE_APPLICATION_FILES' ? 'REMOVE' :
      confirmAction.type === 'REMOVE_APPLICATION_DATABASE' ? 'DELETE DATABASE' :
        confirmAction.type === 'LOCK_APPLICATION' ? 'LOCK' :
          confirmAction.type === 'REVOKE_ACCESS' ? 'REVOKE' :
            'CONFIRM';

    if (isHighRisk || confirmAction.type === 'LOCK_APPLICATION' || confirmAction.type === 'REVOKE_ACCESS') {
      if (typedConfirmation.trim() !== reqType) {
        alert(`Confirmation string mismatch. Expected: "${reqType}"`);
        return;
      }
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

    // Update installation status if applicable
    if (confirmAction.type === 'LOCK_APPLICATION' || confirmAction.type === 'REVOKE_ACCESS') {
      const nextStatus = confirmAction.type === 'LOCK_APPLICATION' ? 'locked' : 'revoked';
      setInstallations(installations.map(inst =>
        inst.id === confirmAction.installation.id
          ? { ...inst, status: nextStatus }
          : inst
      ));
      if (selectedInstallation && selectedInstallation.id === confirmAction.installation.id) {
        setSelectedInstallation({ ...selectedInstallation, status: nextStatus });
      }
    }

    // Add activity log
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      administrator_id: 'admin_1',
      administrator_email: 'admin@elitedevs.com',
      action: 'REMOTE_COMMAND_ISSUED',
      resource_type: 'remote_command',
      resource_id: newCmd.id,
      metadata: { command_type: confirmAction.type, installation_id: confirmAction.installation.id, domain: confirmAction.installation.domain },
      ip_address: '105.112.54.12',
      created_at: new Date().toISOString()
    };
    setActivityLogs([newLog, ...activityLogs]);

    const targetInst = confirmAction.installation;
    const actionType = confirmAction.type;
    setConfirmAction(null);
    setTypedConfirmation('');
    alert(`Remote action command ${newCmd.id} (${actionType}) successfully queued for ${targetInst.domain}!`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      administrator_id: 'admin_1',
      administrator_email: 'admin@elitedevs.com',
      action: 'SETTINGS_UPDATED',
      resource_type: 'settings',
      resource_id: 'global_config',
      metadata: { ...settings },
      ip_address: '105.112.54.12',
      created_at: new Date().toISOString()
    };
    setActivityLogs([newLog, ...activityLogs]);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Filtered views based on search query
  const q = searchQuery.toLowerCase().trim();

  const filteredInstallations = useMemo(() => {
    if (!q) return installations;
    return installations.filter(i =>
      i.domain.toLowerCase().includes(q) ||
      i.id.toLowerCase().includes(q) ||
      i.product_name.toLowerCase().includes(q) ||
      i.access_key.toLowerCase().includes(q) ||
      i.ip_address.toLowerCase().includes(q)
    );
  }, [installations, q]);

  const filteredAccessKeys = useMemo(() => {
    if (!q) return accessKeys;
    return accessKeys.filter(k =>
      k.key.toLowerCase().includes(q) ||
      k.authorized_domain.toLowerCase().includes(q) ||
      (k.product_name && k.product_name.toLowerCase().includes(q))
    );
  }, [accessKeys, q]);

  const filteredSecurityEvents = useMemo(() => {
    if (!q) return securityEvents;
    return securityEvents.filter(e =>
      e.domain.toLowerCase().includes(q) ||
      e.event_type.toLowerCase().includes(q) ||
      e.ip_address.toLowerCase().includes(q) ||
      (e.installation_id && e.installation_id.toLowerCase().includes(q))
    );
  }, [securityEvents, q]);

  const filteredActivityLogs = useMemo(() => {
    if (!q) return activityLogs;
    return activityLogs.filter(l =>
      l.administrator_email.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.resource_type.toLowerCase().includes(q) ||
      l.resource_id.toLowerCase().includes(q)
    );
  }, [activityLogs, q]);

  const filteredProducts = useMemo(() => {
    if (!q) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [products, q]);

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
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-bold shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <span className="font-bold text-lg tracking-tight text-white block truncate">ELITE<span className="text-blue-500">GUARD</span></span>
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
            { id: 'events', label: 'Security Events', icon: AlertTriangle, badge: securityEvents.length },
            { id: 'commands', label: 'Remote Actions', icon: Terminal },
            { id: 'logs', label: 'Activity Logs', icon: Clock },
            { id: 'admins', label: 'Administrators', icon: Users },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </div>
                {sidebarOpen && item.badge && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
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
        <header className="h-16 bg-[#121827]/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center space-x-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search keys, domains, installations, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Neon DB & Vercel API Active</span>
            </div>
            <button
              onClick={() => setActiveTab('events')}
              className="relative text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
            >
              <Bell className="w-5 h-5" />
              {securityEvents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic View Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* 1. DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Platform Overview</h1>
                <p className="text-xs text-slate-400">Monitor distributed PHP applications and security status in real-time.</p>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Total Products', value: totalProducts, sub: 'Active protected applications', icon: Package, color: 'text-blue-400', tab: 'products' },
                  { title: 'Active Access Keys', value: activeKeys, sub: 'Keys authorized for deployment', icon: Key, color: 'text-emerald-400', tab: 'keys' },
                  { title: 'Active Installations', value: activeInstallations, sub: 'Verified active domains', icon: Server, color: 'text-indigo-400', tab: 'installations' },
                  { title: 'Unauthorized Attempts', value: unauthorizedInstallations, sub: 'Domain mismatches locked', icon: AlertTriangle, color: 'text-rose-400', tab: 'events' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveTab(stat.tab)}
                      className="bg-[#121827] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition cursor-pointer"
                    >
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
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {installations.slice(0, 4).map((inst) => (
                          <tr key={inst.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-medium text-white">
                              <button onClick={() => setSelectedInstallation(inst)} className="hover:text-blue-400 text-left font-bold">
                                {inst.domain}
                              </button>
                            </td>
                            <td className="p-3 text-slate-400">{inst.product_name}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-400">PHP {inst.php_version} / v{inst.script_version}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${inst.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  inst.status === 'domain_mismatch' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    inst.status === 'locked' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                      'bg-slate-700 text-slate-300'
                                }`}>
                                {inst.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedInstallation(inst)}
                                className="text-blue-400 hover:text-blue-300 font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Security Feed */}
                <div className="bg-[#121827] border border-slate-800 rounded-xl p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Security Events Feed</span>
                    </h2>
                    <button onClick={() => setActiveTab('events')} className="text-xs text-blue-400 hover:underline">All Events</button>
                  </div>
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

          {/* 2. PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Protected Products</h1>
                  <p className="text-xs text-slate-400">Manage products integrated with EliteGuard software protection.</p>
                </div>
                <button
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredProducts.map(prod => (
                  <div key={prod.id} className="bg-[#121827] border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-mono">
                          {prod.slug}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">v{prod.version}</span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-3">{prod.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{prod.description}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                      <span>Status: <strong className="text-emerald-400 uppercase">{prod.status}</strong></span>
                      <button
                        onClick={() => {
                          setNewKeyProductId(prod.id);
                          setIsNewKeyModalOpen(true);
                        }}
                        className="text-blue-400 hover:underline flex items-center space-x-1"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Issue Key</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ACCESS KEYS TAB */}
          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Access Keys Management</h1>
                  <p className="text-xs text-slate-400">Generate and bind unique embedded access keys to domain licenses.</p>
                </div>
                <button
                  onClick={() => setIsNewKeyModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Access Key</span>
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
                    {filteredAccessKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-mono font-bold text-white">
                          <div className="flex items-center space-x-2">
                            <span>{key.key}</span>
                            <button
                              onClick={() => copyToClipboard(key.key, key.id)}
                              className="text-slate-500 hover:text-blue-400"
                              title="Copy key"
                            >
                              {copiedKey === key.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
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
                            className="text-slate-400 hover:text-white font-medium"
                          >
                            {key.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          {key.status !== 'revoked' && (
                            <button
                              onClick={() => setAccessKeys(accessKeys.map(k => k.id === key.id ? { ...k, status: 'revoked' } : k))}
                              className="text-rose-400 hover:text-rose-300 font-medium ml-2"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. INSTALLATIONS TAB */}
          {activeTab === 'installations' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Registered Installations</h1>
                <p className="text-xs text-slate-400">
                  All active, mismatched, and locked client script installations in the wild.
                </p>
              </div>

              <div className="bg-[#121827] border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Installation ID</th>
                      <th className="p-3.5">Domain</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">PHP / Server</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Last Seen</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredInstallations.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-mono text-slate-400">{inst.id}</td>
                        <td className="p-3.5 font-bold text-white">
                          <button
                            onClick={() => setSelectedInstallation(inst)}
                            className="hover:text-blue-400 text-left font-bold"
                          >
                            {inst.domain}
                          </button>
                        </td>
                        <td className="p-3.5 text-slate-300">{inst.product_name}</td>
                        <td className="p-3.5 text-slate-400 font-mono text-[11px]">{inst.php_version} ({inst.server_software})</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${inst.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              inst.status === 'domain_mismatch' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                inst.status === 'locked' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  'bg-slate-700 text-slate-300'
                            }`}>
                            {inst.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">{new Date(inst.last_seen_at).toLocaleString()}</td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedInstallation(inst)}
                            className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'FORCE_RECHECK', installation: inst })}
                            className="bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                            title="Force remote revalidation on next check"
                          >
                            Recheck
                          </button>
                          <button
                            onClick={() => setConfirmAction({ type: 'LOCK_APPLICATION', installation: inst })}
                            className="bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                          >
                            Lock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. DOMAINS TAB */}
          {activeTab === 'domains' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Domain Authorization Registry</h1>
                <p className="text-xs text-slate-400">
                  Comprehensive audit of all authorized and unauthorized domains calling the licensing API.
                </p>
              </div>

              <div className="bg-[#121827] border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Domain</th>
                      <th className="p-3.5">Assigned Product</th>
                      <th className="p-3.5">Active Key</th>
                      <th className="p-3.5">Linked Installation</th>
                      <th className="p-3.5">Authorization Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {accessKeys.map((key) => {
                      const linkedInst = installations.find(i => i.access_key === key.key || i.domain === key.authorized_domain);
                      const isMismatch = linkedInst && linkedInst.domain !== key.authorized_domain;
                      return (
                        <tr key={key.id} className="hover:bg-slate-800/30">
                          <td className="p-3.5 font-bold text-white">
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-blue-400" />
                              <span>{key.authorized_domain}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300">{key.product_name}</td>
                          <td className="p-3.5 font-mono text-slate-400">{key.key}</td>
                          <td className="p-3.5 font-mono text-slate-400">
                            {linkedInst ? (
                              <button
                                onClick={() => setSelectedInstallation(linkedInst)}
                                className="text-blue-400 hover:underline"
                              >
                                {linkedInst.id}
                              </button>
                            ) : (
                              <span className="text-slate-600">None</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {isMismatch ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                                Domain Mismatch
                              </span>
                            ) : key.status === 'active' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                Authorized
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                                {key.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            {linkedInst && (
                              <button
                                onClick={() => setSelectedInstallation(linkedInst)}
                                className="text-blue-400 hover:text-blue-300 font-medium"
                              >
                                View Installation
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. SECURITY EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Security Events Log</h1>
                  <p className="text-xs text-slate-400">
                    Real-time detection events: domain spoofing, invalid signature attempts, and revocation triggers.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
                    {securityEvents.length} Total Incidents
                  </span>
                </div>
              </div>

              <div className="bg-[#121827] border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Event Type</th>
                      <th className="p-3.5">Target Domain</th>
                      <th className="p-3.5">Source IP</th>
                      <th className="p-3.5">Installation ID</th>
                      <th className="p-3.5">Details / Metadata</th>
                      <th className="p-3.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSecurityEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${evt.event_type === 'DOMAIN_MISMATCH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              evt.event_type === 'INVALID_ACCESS_KEY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                            {evt.event_type}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">{evt.domain}</td>
                        <td className="p-3.5 font-mono text-slate-400">{evt.ip_address}</td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {evt.installation_id || <span className="text-slate-600">N/A</span>}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                          {JSON.stringify(evt.metadata)}
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">{new Date(evt.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. REMOTE ACTIONS TAB */}
          {activeTab === 'commands' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Remote Command Queue & Controls</h1>
                <p className="text-xs text-slate-400">
                  Signed HMAC remote instruction queue for executing isolation, file wipe, and database reset actions.
                </p>
              </div>

              {/* Execution Controls Table */}
              <div className="bg-[#121827] border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/40">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Command Queue</h3>
                </div>
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Command ID</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Target Domain</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Issued By</th>
                      <th className="p-3.5">Created At</th>
                      <th className="p-3.5">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {remoteCommands.map((cmd) => (
                      <tr key={cmd.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-mono text-blue-400 font-semibold">{cmd.id}</td>
                        <td className="p-3.5 font-semibold text-white">{cmd.command_type}</td>
                        <td className="p-3.5 text-slate-300">{cmd.domain}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${cmd.command_status === 'executed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              cmd.command_status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                            {cmd.command_status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">{cmd.created_by}</td>
                        <td className="p-3.5 text-slate-500 text-[11px]">{new Date(cmd.created_at).toLocaleString()}</td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400">
                          {cmd.result ? JSON.stringify(cmd.result) : <span className="text-slate-600">Pending Execution</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-[#121827] border border-slate-800 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">Execute Remote Command On Installation</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Select an active installation from the table below to issue cryptographic commands:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Domain</th>
                        <th className="p-3">Installation ID</th>
                        <th className="p-3">Product</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Available Commands</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {installations.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-800/30">
                          <td className="p-3 font-bold text-white">{inst.domain}</td>
                          <td className="p-3 font-mono text-slate-400">{inst.id}</td>
                          <td className="p-3 text-slate-300">{inst.product_name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${inst.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {inst.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => setConfirmAction({ type: 'FORCE_RECHECK', installation: inst })}
                              className="bg-slate-800 text-slate-300 hover:bg-slate-700 px-2 py-1 rounded text-[10px] font-semibold"
                            >
                              Force Recheck
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'LOCK_APPLICATION', installation: inst })}
                              className="bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white px-2 py-1 rounded text-[10px] font-semibold"
                            >
                              Lock
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'REVOKE_ACCESS', installation: inst })}
                              className="bg-rose-700/20 text-rose-400 hover:bg-rose-700 hover:text-white px-2 py-1 rounded text-[10px] font-semibold"
                            >
                              Revoke
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'REMOVE_APPLICATION_FILES', installation: inst })}
                              className="bg-rose-900/40 text-rose-300 hover:bg-rose-900 hover:text-white px-2 py-1 rounded text-[10px] font-semibold"
                            >
                              Wipe Files
                            </button>
                            <button
                              onClick={() => setConfirmAction({ type: 'REMOVE_APPLICATION_DATABASE', installation: inst })}
                              className="bg-red-950 text-red-400 hover:bg-red-900 hover:text-white px-2 py-1 rounded text-[10px] font-semibold"
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
            </div>
          )}

          {/* 8. ACTIVITY LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Administrative Activity Audit Logs</h1>
                <p className="text-xs text-slate-400">
                  Immutable audit trail of administrator actions, key generation, and remote commands.
                </p>
              </div>

              <div className="bg-[#121827] border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Administrator</th>
                      <th className="p-3.5">Target Resource</th>
                      <th className="p-3.5">Payload Metadata</th>
                      <th className="p-3.5">IP Address</th>
                      <th className="p-3.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredActivityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-bold text-white">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300 font-medium">{log.administrator_email}</td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {log.resource_type}: {log.resource_id}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                          {JSON.stringify(log.metadata)}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">{log.ip_address}</td>
                        <td className="p-3.5 text-slate-500 text-[11px]">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. ADMINISTRATORS TAB */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Platform Administrators</h1>
                  <p className="text-xs text-slate-400">
                    Manage system administrators, permissions, and 2FA authentication requirements.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewAdminModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-2 rounded-lg transition flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite Administrator</span>
                </button>
              </div>

              <div className="bg-[#121827] border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-medium uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Two-Factor Authentication</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Last Login</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {administrators.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-800/30">
                        <td className="p-3.5 font-medium text-white">{admin.email}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${admin.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-700 text-slate-300'}`}>
                            {admin.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {admin.two_factor_enabled ? (
                            <span className="flex items-center space-x-1 text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Enabled</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-amber-400">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Disabled</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {admin.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString() : 'Never'}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setAdministrators(administrators.map(a => a.id === admin.id ? { ...a, two_factor_enabled: !a.two_factor_enabled } : a));
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            Toggle 2FA
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Platform Configuration</h1>
                <p className="text-xs text-slate-400">
                  Global security enforcement, re-validation intervals, and HMAC signature settings.
                </p>
              </div>

              {settingsSaved && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Platform configuration successfully saved and synchronized.</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="bg-[#121827] border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Licensing & Re-Validation Rules</h3>
                  <p className="text-xs text-slate-400 mb-4">Configure background heartbeat and security quarantine policies.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Default Recheck Interval (Hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="168"
                        value={settings.defaultRecheckIntervalHours}
                        onChange={(e) => setSettings({ ...settings, defaultRecheckIntervalHours: parseInt(e.target.value) || 6 })}
                        className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">Clients perform non-blocking asynchronous license validation at this interval.</p>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <input
                        type="checkbox"
                        id="strictDomain"
                        checked={settings.strictDomainValidation}
                        onChange={(e) => setSettings({ ...settings, strictDomainValidation: e.target.checked })}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <label htmlFor="strictDomain" className="text-xs font-semibold text-slate-300 cursor-pointer">
                        Strict Domain Matching (Rejects IP hostnames, subdomains without wildcard)
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoLock"
                        checked={settings.autoLockOnDomainMismatch}
                        onChange={(e) => setSettings({ ...settings, autoLockOnDomainMismatch: e.target.checked })}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <label htmlFor="autoLock" className="text-xs font-semibold text-slate-300 cursor-pointer">
                        Auto-quarantine application upon detected unauthorized domain migration
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-1">Cryptographic & Secret Keys</h3>
                  <p className="text-xs text-slate-400 mb-4">HMAC SHA-256 signature verification for remote commands.</p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        System Signature Key (HMAC Secret)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="password"
                          value="••••••••••••••••••••••••••••••••••••••••"
                          disabled
                          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-500 text-xs font-mono"
                        />
                        <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                          Configured in Vercel Env
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Security Webhook Alert URL
                      </label>
                      <input
                        type="url"
                        value={settings.webhookUrl}
                        onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Platform Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* INSTALLATION DETAIL MODAL / DRAWER */}
      {selectedInstallation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121827] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  <span>Installation Details: {selectedInstallation.domain}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Installation ID: <span className="font-mono text-slate-300">{selectedInstallation.id}</span></p>
              </div>
              <button
                onClick={() => setSelectedInstallation(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Protected Product</span>
                <span className="text-white font-semibold mt-1 block">{selectedInstallation.product_name}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Current Status</span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedInstallation.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {selectedInstallation.status}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Bound Access Key</span>
                <span className="text-slate-200 font-mono text-[11px] mt-1 block">{selectedInstallation.access_key}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Server IP Address</span>
                <span className="text-slate-200 font-mono text-[11px] mt-1 block">{selectedInstallation.ip_address}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">PHP Environment</span>
                <span className="text-slate-200 font-mono text-[11px] mt-1 block">PHP {selectedInstallation.php_version} ({selectedInstallation.server_software})</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Script Version</span>
                <span className="text-slate-200 font-mono text-[11px] mt-1 block">v{selectedInstallation.script_version}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">First Registered</span>
                <span className="text-slate-400 text-[11px] mt-1 block">{new Date(selectedInstallation.first_seen_at).toLocaleString()}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">Last Heartbeat</span>
                <span className="text-slate-400 text-[11px] mt-1 block">{new Date(selectedInstallation.last_seen_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Administrative Remote Operations</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setConfirmAction({ type: 'FORCE_RECHECK', installation: selectedInstallation })}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Force Revalidation</span>
                </button>
                <button
                  onClick={() => setConfirmAction({ type: 'LOCK_APPLICATION', installation: selectedInstallation })}
                  className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Application</span>
                </button>
                <button
                  onClick={() => setConfirmAction({ type: 'REVOKE_ACCESS', installation: selectedInstallation })}
                  className="bg-rose-700/20 hover:bg-rose-700 text-rose-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Revoke License</span>
                </button>
                <button
                  onClick={() => setConfirmAction({ type: 'REMOVE_APPLICATION_FILES', installation: selectedInstallation })}
                  className="bg-rose-900/30 hover:bg-rose-900 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Wipe Source Files</span>
                </button>
                <button
                  onClick={() => setConfirmAction({ type: 'REMOVE_APPLICATION_DATABASE', installation: selectedInstallation })}
                  className="bg-red-950 hover:bg-red-900 text-red-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Drop DB Tables</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNewKeyModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Generate Key</button>
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Initial Version</label>
                <input
                  type="text"
                  value={newProdVersion}
                  onChange={(e) => setNewProdVersion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Brief summary of this PHP application..."
                  rows={2}
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

      {/* NEW ADMINISTRATOR MODAL */}
      {isNewAdminModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121827] border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Invite Platform Administrator</h3>
              <button onClick={() => setIsNewAdminModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Administrator Email</label>
                <input
                  type="email"
                  placeholder="e.g. devops@elitedevs.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Role & Permissions</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as 'super_admin' | 'admin')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="admin">Administrator (Standard)</option>
                  <option value="super_admin">Super Administrator (Full Root)</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsNewAdminModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">Send Invite</button>
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
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Explicit Action Confirmation Required</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are issuing a remote command <strong className="text-rose-400">{confirmAction.type}</strong> for target domain:
              <br />
              <span className="font-mono text-sm font-bold text-white underline mt-1 block">{confirmAction.installation.domain}</span>
            </p>

            <div className="bg-rose-950/40 border border-rose-800/40 p-3 rounded-lg text-[11px] text-rose-300">
              {confirmAction.type === 'REMOVE_APPLICATION_FILES' && 'This will trigger the client PHP script to permanently wipe the local source codebase on the next validation heartbeat.'}
              {confirmAction.type === 'REMOVE_APPLICATION_DATABASE' && 'This will trigger dropping configured application database tables on the customer installation.'}
              {confirmAction.type === 'LOCK_APPLICATION' && 'This will force the customer application into locked state displaying an ACCESS RESTRICTED screen.'}
              {confirmAction.type === 'REVOKE_ACCESS' && 'This will mark the license key permanently revoked and immediately prevent subsequent execution.'}
              {confirmAction.type === 'FORCE_RECHECK' && 'This will signal the application to ignore local TTL caching and re-verify its license signature immediately.'}
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-slate-300 font-medium">
                To confirm, type <span className="font-mono font-bold text-white">{
                  confirmAction.type === 'REMOVE_APPLICATION_FILES' ? 'REMOVE' :
                    confirmAction.type === 'REMOVE_APPLICATION_DATABASE' ? 'DELETE DATABASE' :
                      confirmAction.type === 'LOCK_APPLICATION' ? 'LOCK' :
                        confirmAction.type === 'REVOKE_ACCESS' ? 'REVOKE' :
                          'CONFIRM'
                }</span> below:
              </label>
              <input
                type="text"
                value={typedConfirmation}
                onChange={(e) => setTypedConfirmation(e.target.value)}
                placeholder="Type confirmation string here..."
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
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
