import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { FiPlus, FiSearch, FiFilter, FiUserCheck, FiUserX, FiMoreVertical, FiEdit, FiTrash2 } from 'react-icons/fi';

interface User {
  id: number;
  username: string;
  lastname: string;
  email: string;
  phone?: string;
  is_admin: boolean;
  created_at: string;
}

const UsersPage: NextPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, admin, user
  const [showActions, setShowActions] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        username: `Prénom${i + 1}`,
        lastname: `Nom${i + 1}`,
        email: `user${i + 1}@example.com`,
        phone: i % 3 === 0 ? `+33 ${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}` : undefined,
        is_admin: i % 10 === 0,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
      }));
      
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'admin') return matchesSearch && user.is_admin;
    if (filter === 'user') return matchesSearch && !user.is_admin;
    
    return matchesSearch;
  });
  
  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Gestion des actions pour chaque utilisateur
  const handleEdit = (userId: number) => {
    router.push(`/admin/users/${userId}/edit`);
    setShowActions(null);
  };

  const handleDelete = (userId: number) => {
    // Dans une application réelle, vous afficheriez probablement une confirmation avant de supprimer
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      // Simuler une suppression
      setUsers(users.filter(user => user.id !== userId));
      setShowActions(null);
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
            <h1 className="text-2xl font-bold text-foreground">Utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les utilisateurs de la plateforme</p>
          </div>
          <button
            onClick={() => router.push('/admin/users/new')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiPlus className="h-5 w-5" />
            <span>Ajouter un utilisateur</span>
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
              placeholder="Rechercher un utilisateur..."
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
              <option value="all">Tous les utilisateurs</option>
              <option value="admin">Administrateurs</option>
              <option value="user">Utilisateurs standard</option>
            </select>
          </div>
        </div>
      </MotionDiv>

      {/* Users Table */}
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
              <p className="text-foreground">Chargement des utilisateurs...</p>
            </div>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FiUserX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Aucun utilisateur ne correspond à vos critères de recherche.
              Essayez de modifier vos filtres ou d&apos;ajouter de nouveaux utilisateurs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date d&apos;inscription</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FiUserCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-foreground">{user.username} {user.lastname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.is_admin ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{formatDate(user.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                      <button 
                        onClick={() => setShowActions(showActions === user.id ? null : user.id)} 
                        className="text-foreground hover:text-primary focus:outline-none"
                      >
                        <FiMoreVertical className="h-5 w-5" />
                      </button>
                      
                      {showActions === user.id && (
                        <div 
                          className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg z-10 border border-border"
                          onClick={() => setShowActions(null)}
                        >
                          <div className="py-1">
                            <button 
                              onClick={() => handleEdit(user.id)}
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                            >
                              <FiEdit className="mr-3 h-4 w-4" />
                              Modifier
                            </button>
                            <button 
                              onClick={() => handleDelete(user.id)}
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
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 bg-card border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Affichage de <span className="font-medium">{indexOfFirstUser + 1}</span> à <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> sur <span className="font-medium">{filteredUsers.length}</span> utilisateurs
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

export default UsersPage;
