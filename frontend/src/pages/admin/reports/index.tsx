import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { 
  FiDownload, FiCalendar, FiPieChart, FiTrendingUp, 
  FiTruck, FiUsers, FiCreditCard, FiMapPin
} from 'react-icons/fi';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const ReportsPage: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats overview
  const [overviewStats, setOverviewStats] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    averageReservationValue: 0,
    reservationCompletion: 0,
    activeUsers: 0,
    fleetUtilization: 0
  });

  // Couleurs pour les graphiques
  const COLORS = ['#3498DB', '#F39C12', '#2ECC71', '#9B59B6', '#E74C3C'];

  // Données simulées
  const revenueData = [
    { date: '2023-01', value: 56000 },
    { date: '2023-02', value: 62000 },
    { date: '2023-03', value: 58000 },
    { date: '2023-04', value: 71000 },
    { date: '2023-05', value: 79000 },
    { date: '2023-06', value: 94000 }
  ];

  const reservationStatusData = [
    { name: 'Terminées', value: 65 },
    { name: 'En cours', value: 15 },
    { name: 'Annulées', value: 8 },
    { name: 'En attente', value: 12 }
  ];

  const vehicleTypeData = [
    { name: 'Voitures', value: 70 },
    { name: 'Motos', value: 20 },
    { name: 'Bateaux', value: 10 }
  ];

  const popularLocationsData = [
    { name: 'Paris', value: 240 },
    { name: 'Lyon', value: 180 },
    { name: 'Marseille', value: 150 },
    { name: 'Bordeaux', value: 120 },
    { name: 'Nice', value: 100 }
  ];

  const userGrowthData = [
    { month: 'Jan', users: 1000 },
    { month: 'Fév', users: 1300 },
    { month: 'Mar', users: 1600 },
    { month: 'Avr', users: 2100 },
    { month: 'Mai', users: 2400 },
    { month: 'Juin', users: 2800 }
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setOverviewStats({
        totalReservations: 2847,
        totalRevenue: 420000,
        averageReservationValue: 148,
        reservationCompletion: 82,
        activeUsers: 1250,
        fleetUtilization: 74
      });
      setLoading(false);
    }, 1000);
  }, []);

  // Fonction pour formater les montants
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Fonction pour générer un fichier de rapport (simulé)
  const generateReport = (reportType: string) => {
    alert(`Rapport de type "${reportType}" généré et prêt à être téléchargé`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen-minus-header">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-foreground">Chargement des rapports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rapports et Statistiques</h1>
              <p className="text-muted-foreground">Analysez les performances de votre business</p>
            </div>
            <div className="flex space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
              >
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="90days">90 derniers jours</option>
                <option value="1year">1 an</option>
                <option value="all">Tout</option>
              </select>
              <button
                onClick={() => generateReport('full')}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 flex items-center space-x-2 text-sm"
              >
                <FiDownload className="h-4 w-4" />
                <span>Télécharger le rapport</span>
              </button>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Stats Cards */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-3">
                <FiCalendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Réservations</p>
                <h3 className="text-foreground text-xl font-bold">{overviewStats.totalReservations}</h3>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-accent/10 p-3">
                <FiCreditCard className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Revenus</p>
                <h3 className="text-foreground text-xl font-bold">{formatCurrency(overviewStats.totalRevenue)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-contrast/10 p-3">
                <FiTrendingUp className="h-6 w-6 text-contrast" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Valeur moy.</p>
                <h3 className="text-foreground text-xl font-bold">{formatCurrency(overviewStats.averageReservationValue)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-green-100 p-3">
                <FiPieChart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Taux de complétion</p>
                <h3 className="text-foreground text-xl font-bold">{overviewStats.reservationCompletion}%</h3>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-blue-100 p-3">
                <FiUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Utilisateurs actifs</p>
                <h3 className="text-foreground text-xl font-bold">{overviewStats.activeUsers}</h3>
              </div>
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-purple-100 p-3">
                <FiTruck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Utilisation flotte</p>
                <h3 className="text-foreground text-xl font-bold">{overviewStats.fleetUtilization}%</h3>
              </div>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Tabs Navigation */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-6 border-b border-border">
          <div className="flex space-x-6 overflow-x-auto">
            <button
              className={`py-2 px-1 border-b-2 ${activeTab === 'overview' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('overview')}
            >
              Vue d&apos;ensemble
            </button>
            <button
              className={`py-2 px-1 border-b-2 ${activeTab === 'revenue' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('revenue')}
            >
              Revenus
            </button>
            <button
              className={`py-2 px-1 border-b-2 ${activeTab === 'users' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('users')}
            >
              Utilisateurs
            </button>
            <button
              className={`py-2 px-1 border-b-2 ${activeTab === 'vehicles' 
                ? 'border-primary text-primary font-medium' 
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('vehicles')}
            >
              Véhicules
            </button>
          </div>
        </div>
      </MotionDiv>

      {/* Tab Content */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Overview */}
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <FiTrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Évolution des revenus
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={revenueData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(value) => value.split('-')[1]} />
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

              {/* Status Distribution */}
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <FiPieChart className="mr-2 h-5 w-5 text-primary" />
                  Statuts des réservations
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reservationStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {reservationStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Pourcentage']}
                        contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                        labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Vehicle Distribution */}
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <FiTruck className="mr-2 h-5 w-5 text-primary" />
                  Types de véhicules
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vehicleTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {vehicleTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Pourcentage']}
                        contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-card p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <FiMapPin className="mr-2 h-5 w-5 text-primary" />
                  Top emplacements
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularLocationsData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
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
                        formatter={(value) => [value, 'Réservations']}
                        contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                      />
                      <Bar dataKey="value" fill="#F39C12" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Analyse détaillée des revenus</h2>
            <p className="text-muted-foreground mb-4">Visualisation complète des revenus par période, type de véhicule et localisation.</p>
            
            <div className="h-96 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={tick => formatCurrency(tick)}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Revenus"]}
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Legend />
                  <defs>
                    <linearGradient id="colorRevenueDetail" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3498DB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3498DB" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Revenus mensuels"
                    stroke="#3498DB" 
                    strokeWidth={2}
                    fill="url(#colorRevenueDetail)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom export actions */}
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => generateReport('revenue_pdf')} 
                className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted flex items-center space-x-2"
              >
                <FiDownload className="h-4 w-4" />
                <span>Exporter en PDF</span>
              </button>
              <button 
                onClick={() => generateReport('revenue_csv')}
                className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted flex items-center space-x-2"
              >
                <FiDownload className="h-4 w-4" />
                <span>Exporter en CSV</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Analytique des utilisateurs</h2>
            <p className="text-muted-foreground mb-4">Suivi de la croissance et de l&apos;activité des utilisateurs.</p>
            
            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userGrowthData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    name="Utilisateurs actifs" 
                    stroke="#3498DB" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => generateReport('users_pdf')} 
                className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted flex items-center space-x-2"
              >
                <FiDownload className="h-4 w-4" />
                <span>Exporter en PDF</span>
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'vehicles' && (
          <div className="bg-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-6">Performance des véhicules</h2>
            <p className="text-muted-foreground mb-4">Analyse du taux d&apos;utilisation et de la rentabilité des véhicules.</p>
            
            <div className="h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vehicleTypeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Utilisation']}
                    contentStyle={{ borderRadius: '8px', backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                  />
                  <Bar dataKey="value" name="Taux d'utilisation" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => generateReport('vehicles_pdf')} 
                className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-muted flex items-center space-x-2"
              >
                <FiDownload className="h-4 w-4" />
                <span>Exporter en PDF</span>
              </button>
            </div>
          </div>
        )}
      </MotionDiv>

      <div className="mt-8 px-6 py-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Les statistiques et rapports sont mis à jour toutes les 24 heures. Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;