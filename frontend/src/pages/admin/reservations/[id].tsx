import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { 
  FiArrowLeft, FiUser, FiTruck,
  FiCreditCard, FiCheck, FiX, FiEdit, FiMessageSquare, 
  FiClipboard, FiInfo, FiAlertCircle, FiClock
} from 'react-icons/fi';
import Image from 'next/image';

interface ReservationDetails {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    created_at: string;
    total_reservations: number;
  };
  vehicle: {
    id: number;
    brand: string;
    model: string;
    type: string;
    category: string;
    year: number;
    registration: string;
    mileage: number;
    price_per_day: number;
    image_url: string;
  };
  start_date: string;
  end_date: string;
  pickup_location: string;
  return_location: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled';
  total_price: number;
  deposit: number;
  created_at: string;
  updated_at: string;
  notes: string;
  additional_options: {
    id: number;
    name: string;
    price: number;
  }[];
  payments: {
    id: number;
    amount: number;
    method: string;
    status: string;
    transaction_id: string;
    date: string;
  }[];
  status_history: {
    status: string;
    changed_at: string;
    changed_by: string;
  }[];
}

const ReservationDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    if (id) {
      setTimeout(() => {
        // Données simulées pour une réservation
        const mockReservation: ReservationDetails = {
          id: Number(id),
          user: {
            id: 123,
            name: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            phone: '+33 6 12 34 56 78',
            address: '123 Avenue des Champs-Élysées, 75008 Paris',
            created_at: '2022-03-15',
            total_reservations: 5
          },
          vehicle: {
            id: 456,
            brand: 'Tesla',
            model: 'Model 3',
            type: 'car',
            category: 'sedan',
            year: 2022,
            registration: 'AB-123-CD',
            mileage: 15000,
            price_per_day: 150,
            image_url: 'https://images.unsplash.com/photo-1617704548623-340376564e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
          },
          start_date: '2023-07-15',
          end_date: '2023-07-20',
          pickup_location: 'Paris',
          return_location: 'Paris',
          status: 'confirmed',
          total_price: 750,
          deposit: 800,
          created_at: '2023-06-30T14:23:45Z',
          updated_at: '2023-07-01T09:15:22Z',
          notes: 'Client régulier, préfère les véhicules électriques.',
          additional_options: [
            { id: 1, name: 'Assurance tous risques', price: 50 },
            { id: 2, name: 'Siège enfant', price: 25 }
          ],
          payments: [
            { id: 1, amount: 750, method: 'carte_credit', status: 'completed', transaction_id: 'TRX123456', date: '2023-06-30T14:25:10Z' },
            { id: 2, amount: 800, method: 'carte_credit', status: 'pending', transaction_id: 'TRX123457', date: '2023-06-30T14:25:30Z' }
          ],
          status_history: [
            { status: 'pending', changed_at: '2023-06-30T14:23:45Z', changed_by: 'Système' },
            { status: 'confirmed', changed_at: '2023-07-01T09:15:22Z', changed_by: 'Admin (Pierre Martin)' }
          ]
        };
        
        setReservation(mockReservation);
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formater le datetime
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleStatusChange = (newStatus: string) => {
    if (!reservation) return;
    
    // Dans une application réelle, vous feriez un appel API ici
    setReservation(prev => {
      if (!prev) return null;
      
      return {
        ...prev,
        status: newStatus as ReservationDetails['status'],
        status_history: [
          ...prev.status_history,
          { 
            status: newStatus, 
            changed_at: new Date().toISOString(), 
            changed_by: 'Admin (Utilisateur actuel)' 
          }
        ]
      };
    });
  };

  const handleContactUser = () => {
    if (!reservation) return;
    router.push(`/admin/messages/new?userId=${reservation.user.id}`);
  };

  const handleEditReservation = () => {
    if (!reservation) return;
    router.push(`/admin/reservations/${reservation.id}/edit`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen-minus-header">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-foreground">Chargement des détails de la réservation...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!reservation) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-screen-minus-header">
          <FiAlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Réservation introuvable</h2>
          <p className="text-muted-foreground mb-6">
            La réservation demandée n&apos;existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => router.push('/admin/reservations')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retourner à la liste des réservations
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header with Back Button and Reservation Info */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-background hover:bg-muted"
            aria-label="Retour"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Réservation #{reservation.id.toString().padStart(5, '0')}
            </h1>
            <p className="text-muted-foreground">
              Créée le {formatDateTime(reservation.created_at)}
            </p>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
              {getStatusText(reservation.status)}
            </span>
          </div>
        </div>
      </MotionDiv>
      
      {/* Action Buttons */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 flex flex-wrap gap-3"
      >
        {reservation.status === 'pending' && (
          <button
            onClick={() => handleStatusChange('confirmed')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <FiCheck className="h-5 w-5" />
            <span>Confirmer</span>
          </button>
        )}
        
        {['pending', 'confirmed'].includes(reservation.status) && (
          <button
            onClick={() => handleStatusChange('canceled')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
          >
            <FiX className="h-5 w-5" />
            <span>Annuler</span>
          </button>
        )}
        
        {reservation.status === 'confirmed' && (
          <button
            onClick={() => handleStatusChange('in_progress')}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center space-x-2"
          >
            <FiClock className="h-5 w-5" />
            <span>Démarrer</span>
          </button>
        )}
        
        {reservation.status === 'in_progress' && (
          <button
            onClick={() => handleStatusChange('completed')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
          >
            <FiCheck className="h-5 w-5" />
            <span>Terminer</span>
          </button>
        )}
        
        {reservation.status !== 'canceled' && reservation.status !== 'completed' && (
          <button
            onClick={handleEditReservation}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 flex items-center space-x-2"
          >
            <FiEdit className="h-5 w-5" />
            <span>Modifier</span>
          </button>
        )}
        
        <button
          onClick={handleContactUser}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 flex items-center space-x-2"
        >
          <FiMessageSquare className="h-5 w-5" />
          <span>Contacter le client</span>
        </button>
      </MotionDiv>
      
      {/* Tab Navigation */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6 border-b border-border"
      >
        <div className="flex space-x-6 overflow-x-auto">
          <button
            className={`py-2 px-1 border-b-2 ${activeTab === 'overview' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('overview')}
          >
            Aperçu
          </button>
          <button
            className={`py-2 px-1 border-b-2 ${activeTab === 'details' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('details')}
          >
            Détails
          </button>
          <button
            className={`py-2 px-1 border-b-2 ${activeTab === 'payments' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('payments')}
          >
            Paiements
          </button>
          <button
            className={`py-2 px-1 border-b-2 ${activeTab === 'history' 
              ? 'border-primary text-primary font-medium' 
              : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('history')}
          >
            Historique
          </button>
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
            {/* Aperçu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Info */}
              <div className="bg-background p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <FiUser className="h-5 w-5" />
                  <span>Informations sur le client</span>
                </h2>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Nom:</span> {reservation.user.name}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Email:</span> {reservation.user.email}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Téléphone:</span> {reservation.user.phone}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Adresse:</span> {reservation.user.address}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Date d&apos;inscription:</span> {formatDate(reservation.user.created_at)}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Total des réservations:</span> {reservation.user.total_reservations}
                </p>
              </div>
              
              {/* Vehicle Info */}
              <div className="bg-background p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <FiTruck className="h-5 w-5" />
                  <span>Informations sur le véhicule</span>
                </h2>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Marque:</span> {reservation.vehicle.brand}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Modèle:</span> {reservation.vehicle.model}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Type:</span> {reservation.vehicle.type}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Catégorie:</span> {reservation.vehicle.category}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Année:</span> {reservation.vehicle.year}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Immatriculation:</span> {reservation.vehicle.registration}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Kilométrage:</span> {reservation.vehicle.mileage} km
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Prix par jour:</span> {reservation.vehicle.price_per_day} €
                </p>
                <Image 
                  src={reservation.vehicle.image_url}
                  alt="Vehicle"
                  width={1170}
                  height={780}
                  className="rounded-lg mt-4"
                />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div>
            {/* Détails */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reservation Info */}
              <div className="bg-background p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <FiClipboard className="h-5 w-5" />
                  <span>Informations sur la réservation</span>
                </h2>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Date de début:</span> {formatDate(reservation.start_date)}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Date de fin:</span> {formatDate(reservation.end_date)}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Durée:</span> {calculateDuration(reservation.start_date, reservation.end_date)} jours
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Lieu de prise en charge:</span> {reservation.pickup_location}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Lieu de retour:</span> {reservation.return_location}
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Prix total:</span> {reservation.total_price} €
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Dépôt:</span> {reservation.deposit} €
                </p>
                <p className="text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Notes:</span> {reservation.notes}
                </p>
              </div>
              
              {/* Additional Options */}
              <div className="bg-background p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                  <FiInfo className="h-5 w-5" />
                  <span>Options supplémentaires</span>
                </h2>
                {reservation.additional_options.length > 0 ? (
                  <ul className="list-disc list-inside text-muted-foreground">
                    {reservation.additional_options.map(option => (
                      <li key={option.id}>
                        <span className="font-medium text-foreground">{option.name}:</span> {option.price} €
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Aucune option supplémentaire.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'payments' && (
          <div>
            {/* Paiements */}
            <div className="bg-background p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <FiCreditCard className="h-5 w-5" />
                <span>Informations sur les paiements</span>
              </h2>
              {reservation.payments.length > 0 ? (
                <ul className="list-disc list-inside text-muted-foreground">
                  {reservation.payments.map(payment => (
                    <li key={payment.id}>
                      <span className="font-medium text-foreground">Montant:</span> {payment.amount} €<br />
                      <span className="font-medium text-foreground">Méthode:</span> {payment.method}<br />
                      <span className="font-medium text-foreground">Statut:</span> {payment.status}<br />
                      <span className="font-medium text-foreground">ID de transaction:</span> {payment.transaction_id}<br />
                      <span className="font-medium text-foreground">Date:</span> {formatDateTime(payment.date)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Aucun paiement effectué.</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div>
            {/* Historique */}
            <div className="bg-background p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
                <FiClock className="h-5 w-5" />
                <span>Historique des statuts</span>
              </h2>
              {reservation.status_history.length > 0 ? (
                <ul className="list-disc list-inside text-muted-foreground">
                  {reservation.status_history.map((history, index) => (
                    <li key={index}>
                      <span className="font-medium text-foreground">Statut:</span> {getStatusText(history.status)}<br />
                      <span className="font-medium text-foreground">Date:</span> {formatDateTime(history.changed_at)}<br />
                      <span className="font-medium text-foreground">Modifié par:</span> {history.changed_by}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Aucun historique de statuts.</p>
              )}
            </div>
          </div>
        )}
      </MotionDiv>
    </AdminLayout>
  );
};

export default ReservationDetailsPage;