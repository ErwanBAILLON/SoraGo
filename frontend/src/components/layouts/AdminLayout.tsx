import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiHome, FiUsers, FiTruck, FiCalendar, FiCreditCard, 
  FiPackage, FiMapPin, FiBarChart2, FiSettings, FiLogOut,
  FiMenu, FiX, FiBell, FiSearch, FiHelpCircle, FiUser
} from 'react-icons/fi';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    { name: 'Tableau de bord', href: '/admin/dashboard', icon: FiHome },
    { name: 'Utilisateurs', href: '/admin/users', icon: FiUsers },
    { name: 'Véhicules', href: '/admin/vehicles', icon: FiTruck },
    { name: 'Réservations', href: '/admin/reservations', icon: FiCalendar },
    { name: 'Paiements', href: '/admin/payments', icon: FiCreditCard },
    { name: 'Abonnements', href: '/admin/subscriptions', icon: FiPackage },
    { name: 'Emplacements', href: '/admin/locations', icon: FiMapPin },
    { name: 'Rapports', href: '/admin/reports', icon: FiBarChart2 },
    { name: 'Paramètres', href: '/admin/settings', icon: FiSettings }
  ];

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-full bg-contrast text-contrast-foreground transform transition-transform duration-300 ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-contrast-foreground/10">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">SoraGo Admin</span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="h-[calc(100%-4rem)] overflow-y-auto py-4 px-2">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-contrast-foreground/70 hover:bg-contrast-foreground/10'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 px-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-contrast-foreground/70 hover:bg-contrast-foreground/10 rounded-md"
            >
              <FiLogOut className="mr-3 h-5 w-5" />
              Se déconnecter
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border h-16 flex items-center px-4 lg:px-6 sticky top-0 z-10">
          <button
            className="lg:hidden mr-4"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <FiMenu className="h-6 w-6" />
          </button>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-md flex-1">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Rechercher..."
              />
            </div>
            <button type="submit" className="sr-only">Rechercher</button>
          </form>

          <div className="flex-1 md:flex-none" />

          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-foreground hover:bg-muted relative">
              <FiBell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-accent border-2 border-card"></span>
            </button>
            <button className="p-1 rounded-full text-foreground hover:bg-muted">
              <FiHelpCircle className="h-6 w-6" />
            </button>
            <div className="border-l border-border h-6 mx-2"></div>
            <div className="flex items-center">
              <button 
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted"
                onClick={() => router.push('/admin/profile')}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <FiUser className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium text-sm hidden md:inline-block">
                  {user?.username || 'Admin'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SoraGo Administration. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;