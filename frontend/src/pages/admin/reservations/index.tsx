import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { 
  FiSearch, FiFilter, FiCalendar, FiUser, FiTruck, 
  FiMoreVertical, FiCheck, FiX,
  FiExternalLink, FiMessageSquare
} from 'react-icons/fi';

interface Reservation {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  vehicle: {
    id: number;
    brand: string;
    model: string;
    type: string;
  };
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled';
  total_price: number;
  created_at: string;
  pickup_location: string;
  return_location: string;
}

const ReservationsPage: NextPage = () => {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActions, setShowActions] = useState<number | null>(null);
  
  // Date filters
  const [dateFilter, setDateFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 10;

  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      const statuses: Reservation['status'][] = ['pending', 'confirmed', 'in_progress', 'completed', 'canceled'];
      const locations = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse', 'Nice'];
      const vehicleTypes = ['car', 'motorcycle', 'boat'];
      const vehicleBrands = {
        car: ['Tesla', 'BMW', 'Mercedes', 'Audi', 'Renault'],
        motorcycle: ['Harley-Davidson', 'Honda', 'Yamaha', 'Ducati'],
        boat: ['Bayliner', 'Sea Ray', 'Jeanneau', 'Bénéteau']
      };
      const vehicleModels = {
        Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
        BMW: ['i8', 'i3', 'X5', 'M4'],
        Mercedes: ['EQC', 'GLA', 'C-Class'],
        Audi: ['e-tron', 'A4', 'Q5'],
        Renault: ['ZOE', 'Clio', 'Megane'],
        'Harley-Davidson': ['Street Glide', 'Fat Boy', 'Iron 883'],
        Honda: ['CB650R', 'Africa Twin', 'Goldwing'],
        Yamaha: ['MT-07', 'R1', 'Tracer 900'],
        Ducati: ['Panigale', 'Monster', 'Diavel'],
        Bayliner: ['Element', 'VR5', 'Trophy'],
        'Sea Ray': ['Sundancer', 'SLX', 'SDX'],
        Jeanneau: ['Cap Camarat', 'Merry Fisher', 'Leader'],
        Bénéteau: ['Flyer', 'Antares', 'Gran Turismo']
      };

      const mockReservations: Reservation[] = Array.from({ length: 50 }, (_, i) => {
        const creationDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
        // Dates de début et de fin (quelque part entre aujourd'hui et +30 jours)
        const statusValue = statuses[Math.floor(Math.random() * statuses.length)];
        const today = new Date();
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);
        
        const startDate = new Date(today.getTime() + Math.random() * (thirtyDaysFromNow.getTime() - today.getTime()));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 10) + 1); // Durée de 1 à 10 jours
        
        const pickupLocation = locations[Math.floor(Math.random() * locations.length)];
        let returnLocation = pickupLocation;
        // 20% de chance d'avoir un lieu de retour différent
        if (Math.random() < 0.2) {
          do {
            returnLocation = locations[Math.floor(Math.random() * locations.length)];
          } while (returnLocation === pickupLocation);
        }

        // Sélection aléatoire de véhicule
        const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)] as keyof typeof vehicleBrands;
        const brand = vehicleBrands[type][Math.floor(Math.random() * vehicleBrands[type].length)];
        const model = vehicleModels[brand as keyof typeof vehicleModels][Math.floor(Math.random() * vehicleModels[brand as keyof typeof vehicleModels].length)];

        return {
          id: i + 1,
          user: {
            id: Math.floor(Math.random() * 100) + 1,
            name: `Client ${i + 1}`,
            email: `client${i + 1}@example.com`
          },
          vehicle: {
            id: Math.floor(Math.random() * 100) + 1,
            brand,
            model,
            type,
          },
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: statusValue,
          total_price: Math.floor(Math.random() * 500) + 100,
          created_at: creationDate.toISOString(),
          pickup_location: pickupLocation,
          return_location: returnLocation
        };
      });
      
      setReservations(mockReservations);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrage des réservations
  const getFilteredReservations = () => {
    return reservations.filter(reservation => {
      const searchFields = [
        reservation.user.name,
        reservation.user.email,
        `${reservation.vehicle.brand} ${reservation.vehicle.model}`,
        reservation.pickup_location,
        reservation.return_location,
        `#${reservation.id}`
      ];
      
      const matchesSearch = searchFields.some(field => 
        field.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesStatus = 
        statusFilter === 'all' || 
        reservation.status === statusFilter;
      
      // Filtre de date
      let matchesDate = true;
      if (dateFilter === 'custom') {
        if (fromDate) {
          matchesDate = matchesDate && reservation.start_date >= fromDate;
        }
        if (toDate) {
          matchesDate = matchesDate && reservation.end_date <= toDate;
        }
      } else if (dateFilter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0];
        matchesDate = reservation.start_date >= today;
      } else if (dateFilter === 'ongoing') {
        const today = new Date().toISOString().split('T')[0];
        matchesDate = reservation.start_date <= today && reservation.end_date >= today;
      } else if (dateFilter === 'past') {
        const today = new Date().toISOString().split('T')[0];
        matchesDate = reservation.end_date < today;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  };
  
  const filteredReservations = getFilteredReservations();
  
  // Pagination
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation);
  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculer la durée de la réservation
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Gestion des actions pour chaque réservation
  const handleViewDetails = (reservationId: number) => {
    router.push(`/admin/reservations/${reservationId}`);
    setShowActions(null);
  };

  const handleConfirm = (reservationId: number) => {
    // Dans une application réelle, vous feriez un appel API ici
    setReservations(prevReservations => 
      prevReservations.map(res => 
        res.id === reservationId ? { ...res, status: 'confirmed' } : res
      )
    );
    setShowActions(null);
  };

  const handleCancel = (reservationId: number) => {
    if (window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      setReservations(prevReservations => 
        prevReservations.map(res => 
          res.id === reservationId ? { ...res, status: 'canceled' } : res
        )
      );
      setShowActions(null);
    }
  };

  const handleContactUser = (userId: number) => {
    router.push(`/admin/messages/new?userId=${userId}`);
    setShowActions(null);
  };

  // Obtenir la couleur et le texte en fonction du statut
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'canceled': return 'Annulée';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Réservations</h1>
            <p className="text-muted-foreground">Gérez les réservations de véhicules</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Total: {reservations.length}</span>
          </div>
        </div>
      </MotionDiv>

      {/* Filters and Search */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card p-4 rounded-xl shadow-sm mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une réservation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="status-filter" className="sr-only">Filtrer par statut</label>
            <div className="flex items-center space-x-2">
              <FiFilter className="h-5 w-5 text-muted-foreground" />
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full border border-border rounded-lg py-2 px-3 bg-background focus:ring-primary focus:border-primary"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminées</option>
                <option value="canceled">Annulées</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="date-filter" className="sr-only">Filtrer par date</label>
            <div className="flex items-center space-x-2">
              <FiCalendar className="h-5 w-5 text-muted-foreground" />
              <select
                id="date-filter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="block w-full border border-border rounded-lg py-2 px-3 bg-background focus:ring-primary focus:border-primary"
              >
                <option value="all">Toutes les dates</option>
                <option value="upcoming">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="past">Passées</option>
                <option value="custom">Personnalisé...</option>
              </select>
            </div>
          </div>

          {dateFilter === 'custom' && (
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="from-date" className="block text-sm font-medium text-foreground mb-1">
                  Du
                </label>
                <input
                  type="date"
                  id="from-date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="block w-full border border-border rounded-lg py-2 px-3 bg-background focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="to-date" className="block text-sm font-medium text-foreground mb-1">
                  Au
                </label>
                <input
                  type="date"
                  id="to-date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="block w-full border border-border rounded-lg py-2 px-3 bg-background focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>
      </MotionDiv>

      {/* Reservations Table */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card rounded-xl shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-foreground">Chargement des réservations...</p>
            </div>
          </div>
        ) : currentReservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FiCalendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucune réservation trouvée</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Aucune réservation ne correspond à vos critères de recherche.
              Essayez de modifier vos filtres.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Réservation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {currentReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FiCalendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">#{reservation.id.toString().padStart(5, '0')}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(reservation.created_at.split('T')[0])}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="rounded-full bg-blue-100 p-1.5 mr-2">
                          <FiUser className="h-3.5 w-3.5 text-blue-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{reservation.user.name}</div>
                          <div className="text-xs text-muted-foreground">{reservation.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="rounded-full bg-green-100 p-1.5 mr-2">
                          <FiTruck className="h-3.5 w-3.5 text-green-700" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {reservation.vehicle.brand} {reservation.vehicle.model}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {reservation.vehicle.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        {formatDate(reservation.start_date)} - {formatDate(reservation.end_date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {calculateDuration(reservation.start_date, reservation.end_date)} jour(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {reservation.total_price.toLocaleString('fr-FR')} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        onClick={() => setShowActions(showActions === reservation.id ? null : reservation.id)} 
                        className="text-foreground hover:text-primary focus:outline-none"
                      >
                        <FiMoreVertical className="h-5 w-5" />
                      </button>
                      
                      {showActions === reservation.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border"
                          onClick={() => setShowActions(null)}
                        >
                          <div className="py-1">
                            <button 
                              onClick={() => handleViewDetails(reservation.id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                            >
                              <FiExternalLink className="mr-3 h-4 w-4" />
                              Voir détails
                            </button>
                            
                            {reservation.status === 'pending' && (
                              <button 
                                onClick={() => handleConfirm(reservation.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                <FiCheck className="mr-3 h-4 w-4" />
                                Confirmer
                              </button>
                            )}
                            {reservation.status !== 'canceled' && (
                              <button 
                                onClick={() => handleCancel(reservation.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                <FiX className="mr-3 h-4 w-4" />
                                Annuler
                              </button>
                            )}
                            <button 
                              onClick={() => handleContactUser(reservation.user.id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                            >
                              <FiMessageSquare className="mr-3 h-4 w-4" />
                              Contacter le client
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MotionDiv>

      {/* Pagination */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-between items-center mt-6"
      >
        <div>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
          >
            Précédent
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} sur {totalPages}
        </div>
        <div>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      </MotionDiv>
    </AdminLayout>
  );
};

export default ReservationsPage;