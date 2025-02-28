import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { 
  FiPlus, FiSearch, FiMapPin, FiMoreVertical, 
  FiEdit, FiTrash2, FiUsers, FiTruck, 
  FiX,
  FiCheck
} from 'react-icons/fi';

interface Location {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  active: boolean;
  vehicle_count: number;
  current_rentals: number;
  created_at: string;
}

const LocationsPage: NextPage = () => {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActions, setShowActions] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, active, inactive

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const locationsPerPage = 10;

  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      const cities = [
        'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 
        'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'
      ];
      
      const mockLocations: Location[] = Array.from({ length: 25 }, (_, i) => {
        const city = cities[Math.floor(Math.random() * cities.length)];
        return {
          id: i + 1,
          name: `${city} ${i % 3 === 0 ? 'Centre' : i % 3 === 1 ? 'Gare' : 'Aéroport'}`,
          address: `${Math.floor(Math.random() * 200) + 1} ${i % 2 === 0 ? 'Avenue' : 'Boulevard'} ${['des Champs', 'de la République', 'Saint-Michel', 'Victor Hugo'][Math.floor(Math.random() * 4)]}`,
          city,
          postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'France',
          coordinates: {
            lat: 48.8566 + (Math.random() * 2 - 1),
            lng: 2.3522 + (Math.random() * 2 - 1)
          },
          active: Math.random() > 0.2,
          vehicle_count: Math.floor(Math.random() * 30) + 5,
          current_rentals: Math.floor(Math.random() * 10),
          created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
        };
      });
      
      setLocations(mockLocations);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrage des emplacements
  const filteredLocations = locations.filter(location => {
    const matchesSearch = 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.postal_code.includes(searchTerm);
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'active') return matchesSearch && location.active;
    if (activeFilter === 'inactive') return matchesSearch && !location.active;
    
    return matchesSearch;
  });
  
  // Pagination
  const indexOfLastLocation = currentPage * locationsPerPage;
  const indexOfFirstLocation = indexOfLastLocation - locationsPerPage;
  const currentLocations = filteredLocations.slice(indexOfFirstLocation, indexOfLastLocation);
  const totalPages = Math.ceil(filteredLocations.length / locationsPerPage);

  // Formater la date
  // const formatDate = (dateString: string) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('fr-FR', {
  //     day: 'numeric',
  //     month: 'long',
  //     year: 'numeric'
  //   });
  // };

  // Gestion des actions pour chaque emplacement
  const handleEdit = (locationId: number) => {
    router.push(`/admin/locations/${locationId}/edit`);
    setShowActions(null);
  };

  const handleDelete = (locationId: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet emplacement ?')) {
      setLocations(locations.filter(location => location.id !== locationId));
      setShowActions(null);
    }
  };

  const toggleLocationStatus = (locationId: number) => {
    setLocations(prevLocations => 
      prevLocations.map(loc => 
        loc.id === locationId ? { ...loc, active: !loc.active } : loc
      )
    );
    setShowActions(null);
  };

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
              <h1 className="text-2xl font-bold text-foreground">Emplacements</h1>
              <p className="text-muted-foreground">Gérez les emplacements de location de véhicules</p>
            </div>
            <button
              onClick={() => router.push('/admin/locations/new')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FiPlus className="h-5 w-5" />
              <span>Ajouter un emplacement</span>
            </button>
          </div>
        </div>
      </MotionDiv>

      {/* Filters and Search */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-card p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un emplacement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:border-primary"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeFilter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background text-foreground hover:bg-primary/10'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeFilter === 'active' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background text-foreground hover:bg-primary/10'
                }`}
              >
                Actifs
              </button>
              <button
                onClick={() => setActiveFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  activeFilter === 'inactive' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background text-foreground hover:bg-primary/10'
                }`}
              >
                Inactifs
              </button>
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Locations Table */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-foreground">Chargement des emplacements...</p>
              </div>
            </div>
          ) : currentLocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FiMapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun emplacement trouvé</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Aucun emplacement ne correspond à vos critères de recherche.
                Essayez de modifier vos filtres ou d&apos;ajouter de nouveaux emplacements.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ville</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Véhicules</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {currentLocations.map((location) => (
                    <tr key={location.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FiMapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground">{location.name}</div>
                            <div className="text-xs text-muted-foreground">{location.postal_code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{location.address}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">{location.city}</div>
                        <div className="text-xs text-muted-foreground">{location.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <div className="flex items-center">
                            <FiTruck className="text-muted-foreground mr-1.5 h-4 w-4" />
                            <span className="text-sm text-foreground">{location.vehicle_count}</span>
                          </div>
                          <div className="flex items-center">
                            <FiUsers className="text-muted-foreground mr-1.5 h-4 w-4" />
                            <span className="text-sm text-foreground">{location.current_rentals}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          location.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {location.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                        <button 
                          onClick={() => setShowActions(showActions === location.id ? null : location.id)} 
                          className="text-foreground hover:text-primary focus:outline-none"
                        >
                          <FiMoreVertical className="h-5 w-5" />
                        </button>
                        
                        {showActions === location.id && (
                          <div 
                            className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border"
                            onClick={() => setShowActions(null)}
                          >
                            <div className="py-1">
                              <button 
                                onClick={() => handleEdit(location.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                <FiEdit className="mr-3 h-4 w-4" />
                                Modifier
                              </button>
                              <button 
                                onClick={() => toggleLocationStatus(location.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                {location.active ? (
                                  <>
                                    <FiX className="mr-3 h-4 w-4 text-red-500" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <FiCheck className="mr-3 h-4 w-4 text-green-500" />
                                    Activer
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => handleDelete(location.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 className="mr-3 h-4 w-4" />
                                Supprimer
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
          
          {/* Pagination */}
          {!loading && filteredLocations.length > 0 && (
            <div className="px-6 py-4 bg-card border-t border-border flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Affichage de <span className="font-medium">{indexOfFirstLocation + 1}</span> à <span className="font-medium">{Math.min(indexOfLastLocation, filteredLocations.length)}</span> sur <span className="font-medium">{filteredLocations.length}</span> emplacements
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </MotionDiv>
    </AdminLayout>
  );
};

export default LocationsPage;
