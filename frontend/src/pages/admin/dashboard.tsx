import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { 
  FiUsers, FiTruck, FiCalendar, FiCreditCard, 
  FiAlertTriangle, FiMapPin, FiSettings
} from 'react-icons/fi';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const AdminDashboard: NextPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    vehicleCount: 0,
    activeReservations: 0,
    pendingReservations: 0,
    totalRevenue: 0,
    availableVehicles: 0
  });

  // Données simulées pour les graphiques
  const revenueData = [
    { month: 'Jan', value: 12500 },
    { month: 'Fév', value: 18200 },
    { month: 'Mar', value: 15800 },
    { month: 'Avr', value: 21000 },
    { month: 'Mai', value: 24600 },
    { month: 'Juin', value: 28900 }
  ];
  
  const reservationTypeData = [
    { name: 'Voitures', value: 65 },
    { name: 'Motos', value: 15 },
    { name: 'Bateaux', value: 20 },
  ];

  const vehicleUsageData = [
    { name: 'Tesla Model 3', usage: 95 },
    { name: 'BMW i8', usage: 85 },
    { name: 'Audi e-tron', usage: 72 },
    { name: 'Nissan Leaf', usage: 68 },
    { name: 'Renault Zoe', usage: 63 },
  ];

  const locationData = [
    { name: 'Paris', count: 124 },
    { name: 'Lyon', count: 85 },
    { name: 'Marseille', count: 78 },
    { name: 'Bordeaux', count: 54 },
    { name: 'Lille', count: 42 },
  ];
  
  // Couleurs pour les graphiques
  const COLORS = ['#3498DB', '#F39C12', '#2ECC71', '#9B59B6', '#E74C3C'];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!isLoading && user && !user.is_admin) {
      router.push('/dashboard');
      return;
    }

    // Simuler le chargement des statistiques du tableau de bord
    setTimeout(() => {
      setStats({
        userCount: 2847,
        vehicleCount: 432,
        activeReservations: 178,
        pendingReservations: 43,
        totalRevenue: 128750,
        availableVehicles: 312
      });
      setLoading(false);
    }, 1000);
  }, [user, isLoading, router]);

  // Fonction pour formater les montants
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Alerte simulée pour les véhicules nécessitant une maintenance
  const maintenanceAlerts = [
    { id: 1, vehicle: 'Tesla Model S', issue: 'Entretien programmé', dueDate: '2023-07-15' },
    { id: 2, vehicle: 'BMW i3', issue: 'Problème batterie', dueDate: '2023-07-10' }
  ];

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen-minus-header">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-foreground">Chargement du tableau de bord...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* En-tête avec bienvenue */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord administrateur</h1>
          <p className="text-muted-foreground">Bienvenue, {user?.username}. Voici un aperçu des statistiques globales de la plateforme.</p>
        </div>
      </MotionDiv>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-3">
                <FiUsers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Utilisateurs</p>
                <h3 className="text-foreground text-xl font-bold">{stats.userCount}</h3>
              </div>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-3">
                <FiTruck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Véhicules</p>
                <h3 className="text-foreground text-xl font-bold">{stats.vehicleCount}</h3>
              </div>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-accent/10 p-3">
                <FiCalendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Réservations actives</p>
                <h3 className="text-foreground text-xl font-bold">{stats.activeReservations}</h3>
              </div>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-amber-100 p-3">
                <FiCalendar className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Réservations en attente</p>
                <h3 className="text-foreground text-xl font-bold">{stats.pendingReservations}</h3>
              </div>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-green-100 p-3">
                <FiCreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Revenus totaux</p>
                <h3 className="text-foreground text-xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
              </div>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-green-100 p-3">
                <FiTruck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Véhicules disponibles</p>
                <h3 className="text-foreground text-xl font-bold">{stats.availableVehicles}</h3>
              </div>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Main Content - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Revenus mensuels</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={tick => formatCurrency(tick)}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Revenus"]}
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3498DB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3498DB" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3498DB" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MotionDiv>

        {/* Vehicle Type Distribution */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Distribution des réservations par type de véhicule</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reservationTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reservationTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Réservations']}
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Second Row - More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Vehicle Usage */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Top 5 véhicules les plus utilisés (%)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vehicleUsageData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Taux d\'utilisation']}
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Bar dataKey="usage" fill="#3498DB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MotionDiv>

        {/* Reservations by Location */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Réservations par ville</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={locationData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [value, 'Réservations']}
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Bar dataKey="count" fill="#F39C12" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </MotionDiv>
      </div>

      {/* Third Row - Alerts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Maintenance Alerts */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="bg-card p-6 rounded-xl shadow-sm lg:col-span-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Alertes de maintenance</h2>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {maintenanceAlerts.length} urgentes
              </span>
            </div>
            
            <div className="space-y-4">
              {maintenanceAlerts.map((alert) => (
                <div key={alert.id} className="p-4 bg-background border border-border rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <FiAlertTriangle className="text-amber-500 w-5 h-5" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-foreground">{alert.vehicle}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{alert.issue}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-red-600">
                          À traiter avant {new Date(alert.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => router.push('/admin/maintenance')}
                className="w-full text-sm text-primary font-medium hover:underline mt-2"
              >
                Voir toutes les alertes de maintenance
              </button>
            </div>
          </div>
        </MotionDiv>
        
        {/* Quick Actions */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
        >
          <div className="bg-card p-6 rounded-xl shadow-sm lg:col-span-2">
            <h2 className="text-xl font-semibold text-foreground mb-6">Actions rapides</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/admin/vehicles/new')}
                className="flex items-center p-4 bg-background border border-border rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="rounded-full bg-primary/10 p-3 mr-4">
                  <FiTruck className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Ajouter un véhicule</h3>
                  <p className="text-sm text-muted-foreground">Enregistrer un nouveau véhicule dans la flotte</p>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/admin/users/new')}
                className="flex items-center p-4 bg-background border border-border rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="rounded-full bg-primary/10 p-3 mr-4">
                  <FiUsers className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Ajouter un utilisateur</h3>
                  <p className="text-sm text-muted-foreground">Créer un nouveau compte utilisateur</p>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/admin/locations')}
                className="flex items-center p-4 bg-background border border-border rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="rounded-full bg-accent/10 p-3 mr-4">
                  <FiMapPin className="h-6 w-6 text-accent" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Gérer les sites</h3>
                  <p className="text-sm text-muted-foreground">Consulter et modifier les sites de location</p>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/admin/settings')}
                className="flex items-center p-4 bg-background border border-border rounded-lg hover:bg-primary/5 transition-colors"
              >
                <div className="rounded-full bg-contrast/10 p-3 mr-4">
                  <FiSettings className="h-6 w-6 text-contrast" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-foreground">Paramètres</h3>
                  <p className="text-sm text-muted-foreground">Configurer les paramètres de la plateforme</p>
                </div>
              </button>
            </div>
          </div>
        </MotionDiv>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
