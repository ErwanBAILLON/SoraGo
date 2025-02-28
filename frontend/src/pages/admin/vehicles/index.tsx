import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { FiPlus, FiSearch, FiFilter, FiTruck, FiMoreVertical, FiEdit, FiTrash2, FiMap } from 'react-icons/fi';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  type: 'car' | 'motorcycle' | 'boat';
  category?: string;
  available: boolean;
  mileage: number;
  created_at: string;
  location: string;
}

const VehiclesPage: NextPage = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, unavailable
  const [typeFilter, setTypeFilter] = useState('all'); // all, car, motorcycle, boat
  const [showActions, setShowActions] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 10;

  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      const vehicleTypes = ['car', 'motorcycle', 'boat'] as const;
      const carCategories = ['sedan', 'suv', 'no_license', 'city_car', 'coupe'];
      const carBrands = ['Tesla', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Renault', 'Toyota'];
      const locations = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille'];
      
      const mockVehicles: Vehicle[] = Array.from({ length: 50 }, (_, i) => {
        const type = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
        return {
          id: i + 1,
          brand: carBrands[Math.floor(Math.random() * carBrands.length)],
          model: `Model ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`,
          type,
          category: type === 'car' ? carCategories[Math.floor(Math.random() * carCategories.length)] : undefined,
          available: Math.random() > 0.3,
          mileage: Math.floor(Math.random() * 100000),
          created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
          location: locations[Math.floor(Math.random() * locations.length)]
        };
      });
      
      setVehicles(mockVehicles);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrage des véhicules
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAvailability = 
      filter === 'all' ||
      (filter === 'available' && vehicle.available) ||
      (filter === 'unavailable' && !vehicle.available);
    
    const matchesType =
      typeFilter === 'all' ||
      vehicle.type === typeFilter;
    
    return matchesSearch && matchesAvailability && matchesType;
  });
  
  // Pagination
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Gestion des actions pour chaque véhicule
  const handleEdit = (vehicleId: number) => {
    router.push(`/admin/vehicles/${vehicleId}/edit`);
    setShowActions(null);
  };

  const handleDelete = (vehicleId: number) => {
    // Dans une application réelle, vous afficheriez probablement une confirmation avant de supprimer
    if (window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) {
      // Simuler une suppression
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
      setShowActions(null);
    }
  };

  // Traduire le type de véhicule
  const getVehicleTypeText = (type: string) => {
    switch (type) {
      case 'car': return 'Voiture';
      case 'motorcycle': return 'Moto';
      case 'boat': return 'Bateau';
      default: return type;
    }
  };

  // Traduire la catégorie du véhicule
  const getVehicleCategoryText = (category: string) => {
    switch (category) {
      case 'sedan': return 'Berline';
      case 'suv': return 'SUV';
      case 'no_license': return 'Sans permis';
      case 'city_car': return 'Citadine';
      case 'coupe': return 'Coupé';
      default: return category;
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
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Véhicules</h1>
            <p className="text-muted-foreground">Gérez tous les véhicules de la flotte</p>
          </div>
          <button
            onClick={() => router.push('/admin/vehicles/new')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiPlus className="h-5 w-5" />
            <span>Ajouter un véhicule</span>
          </button>
        </div>
      </MotionDiv>

      {/* Filters and Search */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card p-4 rounded-xl shadow-sm mb-6"
      >
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FiFilter className="h-5 w-5 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-border rounded-lg py-2 px-3 bg-background focus:ring-primary focus:border-primary"
            >
              <option value="all">Tous les véhicules</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Indisponibles</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <FiTruck className="h-5 w-5 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-border rounded-lg py-2 px-3 bg-background focus:ring-primary focus:border-primary"
            >
              <option value="all">Tous les types</option>
              <option value="car">Voitures</option>
              <option value="motorcycle">Motos</option>
              <option value="boat">Bateaux</option>
            </select>
          </div>
        </div>
      </MotionDiv>

      {/* Vehicles Table */}
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
              <p className="text-foreground">Chargement des véhicules...</p>
            </div>
          </div>
        ) : currentVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FiTruck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun véhicule trouvé</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Aucun véhicule ne correspond à vos critères de recherche.
              Essayez de modifier vos filtres ou d&apos;ajouter de nouveaux véhicules.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kilométrage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lieu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date d&apos;ajout</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {currentVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FiTruck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{vehicle.brand} {vehicle.model}</div>
                          {vehicle.category && (
                            <div className="text-xs text-muted-foreground">
                              {getVehicleCategoryText(vehicle.category)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{getVehicleTypeText(vehicle.type)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{vehicle.mileage.toLocaleString('fr-FR')} km</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiMap className="text-muted-foreground mr-1.5 h-4 w-4" />
                        <span className="text-sm text-foreground">{vehicle.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        vehicle.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {vehicle.available ? 'Disponible' : 'Indisponible'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{formatDate(vehicle.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        onClick={() => setShowActions(showActions === vehicle.id ? null : vehicle.id)} 
                        className="text-foreground hover:text-primary focus:outline-none"
                      >
                        <FiMoreVertical className="h-5 w-5" />
                      </button>
                      
                      {showActions === vehicle.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border"
                          onClick={() => setShowActions(null)}
                        >
                          <div className="py-1">
                            <button 
                              onClick={() => handleEdit(vehicle.id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                            >
                              <FiEdit className="mr-3 h-4 w-4" />
                              Modifier
                            </button>
                            <button 
                              onClick={() => handleDelete(vehicle.id)}
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
        {!loading && filteredVehicles.length > 0 && (
          <div className="px-6 py-4 bg-card border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage de <span className="font-medium">{indexOfFirstVehicle + 1}</span> à <span className="font-medium">{Math.min(indexOfLastVehicle, filteredVehicles.length)}</span> sur <span className="font-medium">{filteredVehicles.length}</span> véhicules
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
      </MotionDiv>
    </AdminLayout>
  );
};

export default VehiclesPage;