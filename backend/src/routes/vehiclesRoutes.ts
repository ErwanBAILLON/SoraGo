import express, { Request, Response } from 'express';
import vehiclesModel, { VehicleUpdate } from '../models/vehicles';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /vehicles - Récupérer la liste des véhicules
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const vehicles = await vehiclesModel.getAll();
    res.status(200).json({
      success: true,
      message: 'Liste des véhicules récupérée avec succès',
      data: vehicles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des véhicules'
    });
  }
});

/**
 * GET /vehicles/available - Récupérer la liste des véhicules disponibles
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/available', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const vehicles = await vehiclesModel.getAvailable();
    res.status(200).json({
      success: true,
      message: 'Liste des véhicules disponibles récupérée avec succès',
      data: vehicles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules disponibles:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des véhicules disponibles'
    });
  }
});

/**
 * GET /vehicles/:id - Récupérer un véhicule spécifique
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.id);
    const vehicle = await vehiclesModel.getById(vehicleId);
    
    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Véhicule récupéré avec succès',
      data: vehicle
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du véhicule:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du véhicule'
    });
  }
});

/**
 * POST /vehicles - Créer un nouveau véhicule
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { 
      id, type, brand_id, model, specification_id, 
      category, available, mileage, location_id 
    } = req.body;
    
    // Validation des données
    if (!type || !brand_id || !model || !specification_id) {
      res.status(400).json({
        success: false,
        message: 'Les champs type, brand_id, model, et specification_id sont obligatoires'
      });
      return;
    }

    // Vérifier si le type est valide
    const validTypes = ['car', 'motorcycle', 'boat'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Type de véhicule invalide. Les types valides sont: car, motorcycle, boat'
      });
      return;
    }

    // Vérifier si la catégorie est valide pour un véhicule de type 'car'
    if (type === 'car' && category) {
      const validCategories = ['sedan', 'suv', 'no_license', 'city_car', 'coupe'];
      if (!validCategories.includes(category)) {
        res.status(400).json({
          success: false,
          message: 'Catégorie invalide pour une voiture. Les catégories valides sont: sedan, suv, no_license, city_car, coupe'
        });
        return;
      }
    }

    // Vérifier si les IDs de marque et spécification sont valides
    const { brandValid, specificationValid } = await vehiclesModel.validateReferences(brand_id, specification_id);
    
    if (!brandValid) {
      res.status(400).json({
        success: false,
        message: 'Marque non trouvée'
      });
      return;
    }

    if (!specificationValid) {
      res.status(400).json({
        success: false,
        message: 'Spécification non trouvée'
      });
      return;
    }

    // Vérifier si le modèle existe déjà pour cette marque
    const modelExists = await vehiclesModel.modelExists(brand_id, model);
    if (modelExists) {
      res.status(400).json({
        success: false,
        message: 'Un véhicule avec cette marque et ce modèle existe déjà'
      });
      return;
    }

    // Créer le véhicule
    const newVehicle = await vehiclesModel.create({
      id,
      type,
      brand_id,
      model,
      specification_id,
      category,
      available,
      mileage
    }, location_id);

    res.status(201).json({
      success: true,
      message: 'Véhicule créé avec succès',
      data: newVehicle
    });
  } catch (error) {
    console.error('Erreur lors de la création du véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du véhicule'
    });
  }
});

/**
 * PUT /vehicles/:id - Mettre à jour un véhicule
 * Restreint aux administrateurs
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.id);
    const { 
      type, brand_id, model, specification_id, 
      category, available, mileage, location_id 
    } = req.body;
    
    // Vérifier si au moins un champ est fourni
    if (!type && !brand_id && !model && !specification_id && 
        category === undefined && available === undefined && 
        mileage === undefined && location_id === undefined) {
      res.status(400).json({
        success: false,
        message: 'Au moins un champ à modifier doit être fourni'
      });
      return;
    }

    // Vérifier si le type est valide s'il est fourni
    if (type) {
      const validTypes = ['car', 'motorcycle', 'boat'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Type de véhicule invalide. Les types valides sont: car, motorcycle, boat'
        });
        return;
      }
    }

    // Vérifier si la catégorie est valide pour un véhicule de type 'car' si elle est fournie
    if (category) {
      // Récupérer le véhicule actuel pour connaître son type
      const currentVehicle = await vehiclesModel.getById(vehicleId);
      if (!currentVehicle) {
        res.status(404).json({
          success: false,
          message: 'Véhicule non trouvé'
        });
        return;
      }

      const vehicleType = type || currentVehicle.type;
      
      if (vehicleType === 'car') {
        const validCategories = ['sedan', 'suv', 'no_license', 'city_car', 'coupe'];
        if (!validCategories.includes(category)) {
          res.status(400).json({
            success: false,
            message: 'Catégorie invalide pour une voiture. Les catégories valides sont: sedan, suv, no_license, city_car, coupe'
          });
          return;
        }
      }
    }

    // Vérifier si les IDs de marque et spécification sont valides s'ils sont fournis
    if (brand_id || specification_id) {
      const brandToCheck = brand_id || (await vehiclesModel.getById(vehicleId))?.brand_id;
      const specToCheck = specification_id || (await vehiclesModel.getById(vehicleId))?.specification_id;
      
      if (!brandToCheck || !specToCheck) {
        res.status(404).json({
          success: false,
          message: 'Véhicule non trouvé ou références invalides'
        });
        return;
      }

      const { brandValid, specificationValid } = await vehiclesModel.validateReferences(brandToCheck, specToCheck);
      
      if (brand_id && !brandValid) {
        res.status(400).json({
          success: false,
          message: 'Marque non trouvée'
        });
        return;
      }

      if (specification_id && !specificationValid) {
        res.status(400).json({
          success: false,
          message: 'Spécification non trouvée'
        });
        return;
      }
    }

    // Vérifier si le modèle existe déjà pour cette marque si le modèle ou la marque est modifié
    if (model || brand_id) {
      const currentVehicle = await vehiclesModel.getById(vehicleId);
      if (!currentVehicle) {
        res.status(404).json({
          success: false,
          message: 'Véhicule non trouvé'
        });
        return;
      }

      const modelToCheck = model || currentVehicle.model;
      const brandToCheck = brand_id || currentVehicle.brand_id;

      const modelExists = await vehiclesModel.modelExists(brandToCheck, modelToCheck, vehicleId);
      if (modelExists) {
        res.status(400).json({
          success: false,
          message: 'Un véhicule avec cette marque et ce modèle existe déjà'
        });
        return;
      }
    }

    // Mettre à jour le véhicule
    const updateData: VehicleUpdate = {};
    if (type !== undefined) updateData.type = type;
    if (brand_id !== undefined) updateData.brand_id = brand_id;
    if (model !== undefined) updateData.model = model;
    if (specification_id !== undefined) updateData.specification_id = specification_id;
    if (category !== undefined) updateData.category = category;
    if (available !== undefined) updateData.available = available;
    if (mileage !== undefined) updateData.mileage = mileage;

    const updatedVehicle = await vehiclesModel.update(vehicleId, updateData, location_id);
    
    if (!updatedVehicle) {
      res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Véhicule mis à jour avec succès',
      data: updatedVehicle
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du véhicule:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du véhicule'
    });
  }
});

/**
 * DELETE /vehicles/:id - Supprimer un véhicule
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const vehicleId = parseInt(req.params.id);
    
    try {
      const deleted = await vehiclesModel.delete(vehicleId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Véhicule non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Véhicule supprimé avec succès'
      });
    } catch (error) {
      // Vérifier si l'erreur est due à des références existantes
      if (error instanceof Error && error.message.includes('référencé')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du véhicule:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du véhicule'
    });
  }
});

export default router;
