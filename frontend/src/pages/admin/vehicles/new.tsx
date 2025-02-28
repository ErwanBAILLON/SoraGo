import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { MotionDiv } from '@/utils/motion';
import { FiSave, FiArrowLeft, FiImage, FiX, FiAlertCircle } from 'react-icons/fi';
import Image from 'next/image';

interface VehicleFormData {
  brand: string;
  model: string;
  type: 'car' | 'motorcycle' | 'boat' | '';
  category: string;
  year: string;
  registration: string;
  mileage: string;
  price_per_day: string;
  location: string;
  description: string;
  available: boolean;
}

const NewVehiclePage: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // État initial du formulaire
  const [formData, setFormData] = useState<VehicleFormData>({
    brand: '',
    model: '',
    type: '',
    category: '',
    year: new Date().getFullYear().toString(),
    registration: '',
    mileage: '0',
    price_per_day: '',
    location: '',
    description: '',
    available: true
  });

  // Les options pour les champs select
  const typeOptions = [
    { value: 'car', label: 'Voiture' },
    { value: 'motorcycle', label: 'Moto' },
    { value: 'boat', label: 'Bateau' }
  ];

  const categoryOptions = {
    car: [
      { value: 'sedan', label: 'Berline' },
      { value: 'suv', label: 'SUV' },
      { value: 'no_license', label: 'Sans permis' },
      { value: 'city_car', label: 'Citadine' },
      { value: 'coupe', label: 'Coupé' }
    ],
    motorcycle: [
      { value: 'sport', label: 'Sport' },
      { value: 'cruiser', label: 'Cruiser' },
      { value: 'touring', label: 'Touring' },
      { value: 'scooter', label: 'Scooter' }
    ],
    boat: [
      { value: 'speedboat', label: 'Bateau à moteur' },
      { value: 'sailboat', label: 'Voilier' },
      { value: 'yacht', label: 'Yacht' },
      { value: 'jet_ski', label: 'Jet ski' }
    ]
  };

  const locations = [
    'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier'
  ];

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Réinitialiser la catégorie si le type change
      ...(name === 'type' && { category: '' })
    }));
  };

  // Gérer le téléchargement d'images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limiter à 5 images
    const maxImages = 5;
    const remainingSlots = maxImages - previewImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setPreviewImages(prev => [...prev, e.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Supprimer une image prévisualisée
  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validation simple
      if (!formData.brand || !formData.model || !formData.type || !formData.price_per_day || !formData.location) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Dans une application réelle, nous enverrions les données à l'API
      // Simulation d'un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Rediriger après un court délai
      setTimeout(() => {
        router.push('/admin/vehicles');
      }, 1500);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Une erreur est survenue lors de la création du véhicule');
      }
      setLoading(false);
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-background hover:bg-muted"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ajouter un véhicule</h1>
            <p className="text-muted-foreground">Créer une nouvelle fiche véhicule dans le système</p>
          </div>
        </div>
      </MotionDiv>

      {/* Success Message */}
      {success && (
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <FiSave className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Le véhicule a été ajouté avec succès. Redirection en cours...
              </p>
            </div>
          </div>
        </MotionDiv>
      )}

      {/* Error Message */}
      {error && (
        <MotionDiv
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </MotionDiv>
      )}

      {/* Form */}
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-card rounded-xl shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Informations du véhicule</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Marque */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-foreground mb-1">
                  Marque<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  placeholder="ex: Tesla"
                  required
                />
              </div>
              
              {/* Modèle */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-foreground mb-1">
                  Modèle<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  placeholder="ex: Model 3"
                  required
                />
              </div>
              
              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
                  Type de véhicule<span className="text-red-500">*</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Catégorie (conditionnelle selon le type) */}
              {formData.type && (
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
                    Catégorie
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categoryOptions[formData.type].map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Année */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-foreground mb-1">
                  Année
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              
              {/* Immatriculation */}
              <div>
                <label htmlFor="registration" className="block text-sm font-medium text-foreground mb-1">
                  Immatriculation
                </label>
                <input
                  type="text"
                  id="registration"
                  name="registration"
                  value={formData.registration}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  placeholder="ex: AB-123-CD"
                />
              </div>
              
              {/* Kilométrage */}
              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-foreground mb-1">
                  Kilométrage
                </label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  min="0"
                />
              </div>
              
              {/* Prix par jour */}
              <div>
                <label htmlFor="price_per_day" className="block text-sm font-medium text-foreground mb-1">
                  Prix par jour (EUR)<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price_per_day"
                  name="price_per_day"
                  value={formData.price_per_day}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              {/* Localisation */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
                  Lieu<span className="text-red-500">*</span>
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Sélectionnez un lieu</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              {/* Disponibilité */}
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary bg-background"
                />
                <label htmlFor="available" className="ml-2 block text-sm font-medium text-foreground">
                  Disponible immédiatement
                </label>
              </div>
            </div>
            
            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                Description du véhicule
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-border rounded-lg py-2 px-3 bg-background text-foreground focus:ring-primary focus:border-primary"
                placeholder="Décrivez les caractéristiques du véhicule..."
              ></textarea>
            </div>

            {/* Images Upload */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-foreground mb-4">
                Photos du véhicule (max 5)
              </label>
              
              {/* Preview des images */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Prévisualisation ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover rounded-lg"
                      />
                      <button 
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {previewImages.length < 5 && (
                <label className="flex justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-background">
                  <div className="space-y-1 text-center">
                    <FiImage className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <label htmlFor="image-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                        <span>Télécharger des images</span>
                        <input 
                          id="image-upload" 
                          name="images" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">ou glissez-déposez</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF jusqu&apos;à 10MB
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-muted border-t border-border flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-border rounded-lg text-foreground bg-background hover:bg-muted"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Enregistrer le véhicule
                </>
              )}
            </button>
          </div>
        </form>
      </MotionDiv>
    </AdminLayout>
  );
};

export default NewVehiclePage;