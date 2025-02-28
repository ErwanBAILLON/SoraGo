import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, FiCalendar, FiTruck, FiCreditCard, FiUser, 
  FiLogOut, FiMenu, FiBell, FiSettings
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications] = useState([
    "Votre réservation de Tesla Model 3 est confirmée",
    "Nouveau rabais de 15% sur tous les abonnements"
  ]);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: FiHome },
    { name: 'Réservations', href: '/dashboard/reservations', icon: FiCalendar },
    { name: 'Véhicules', href: '/vehicles', icon: FiTruck },
    { name: 'Abonnements', href: '/dashboard/subscriptions', icon: FiCreditCard },
    { name: 'Mon profil', href: '/dashboard/profile', icon: FiUser },
  ];

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 z-20 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden" onClick={() => setSidebarOpen(false)}></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-center h-16 border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold text-indigo-600">SoraGo</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive(item.href)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors`}
            >
              <item.icon
                className={`${
                  isActive(item.href) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 flex-shrink-0 h-5 w-5 transition-colors`}
              />
              {item.name}
            </Link>
          ))}
          
          <div className="pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={logout}
              className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 w-full"
            >
              <FiLogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Déconnexion
            </button>
          </div>
        </nav>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                >
                  <FiMenu className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 lg:ml-0"></div>

              {/* User actions */}
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative rounded-full p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                  >
                    <FiBell className="h-6 w-6" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </button>
                  
                  {/* Notification dropdown */}
                  <AnimatePresence>
                    {notificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                      >
                        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="py-1">
                            <div className="px-4 py-2 border-b border-gray-100">
                              <p className="text-sm font-medium text-gray-900">Notifications</p>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {notifications.map((notification, index) => (
                                <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                                  <p className="text-sm text-gray-700">{notification}</p>
                                  <p className="text-xs text-gray-500 mt-1">Il y a quelques instants</p>
                                </div>
                              ))}
                              {notifications.length === 0 && (
                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                  Aucune notification
                                </div>
                              )}
                            </div>
                            {notifications.length > 0 && (
                              <div className="border-t border-gray-100 px-4 py-2">
                                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                  Marquer tout comme lu
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings */}
                <button 
                  className="rounded-full p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <FiSettings className="h-6 w-6" />
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="max-w-xs bg-indigo-100 rounded-full flex items-center text-sm focus:outline-none"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-indigo-500 text-white">
                      {user?.username.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  
                  {/* Profile menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                      >
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="py-1">
                            <div className="px-4 py-2 border-b border-gray-100">
                              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                            <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                              Votre Profil
                            </Link>
                            <button
                              onClick={logout}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Se déconnecter
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;