import express, { Request, Response } from 'express';
import parkingsModel, { ParkingUpdate } from '../models/parkings';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /parkings - Récupérer la liste des parkings
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const parkings = await parkingsModel.getAll();
    res.status(200).json({
      success: true,
      message: 'Liste des parkings récupérée avec succès',
      data: parkings
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des parkings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des parkings'
    });
  }
});

/**
 * GET /parkings/:id - Détail d'un parking spécifique
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const parkingId = parseInt(req.params.id);
    const parking = await parkingsModel.getById(parkingId);
    
    if (!parking) {
      res.status(404).json({
        success: false,
        message: 'Parking non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Parking récupéré avec succès',
      data: parking
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du parking:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du parking'
    });
  }
});

/**
 * POST /parkings - Associer un véhicule à un emplacement
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { id, vehicle_id, location_id } = req.body;
    
    // Validation des données
    if (!vehicle_id || !location_id) {
      res.status(400).json({
        success: false,
        message: 'Les champs vehicle_id et location_id sont obligatoires'
      });
      return;
    }

    // Vérifier si le véhicule et l'emplacement existent
    const { vehicleValid, locationValid } = await parkingsModel.validateReferences(vehicle_id, location_id);
    
    if (!vehicleValid) {
      res.status(400).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
      return;
    }

    if (!locationValid) {
      res.status(400).json({
        success: false,
        message: 'Emplacement non trouvé'
      });
      return;
    }

    // Vérifier si le véhicule est déjà assigné à un autre parking
    const isVehicleAssigned = await parkingsModel.isVehicleAssigned(vehicle_id);
    if (isVehicleAssigned) {
      res.status(400).json({
        success: false,
        message: 'Ce véhicule est déjà assigné à un emplacement de parking'
      });
      return;
    }

    // Créer l'association parking
    const newParking = await parkingsModel.create({
      id,
      vehicle_id,
      location_id
    });

    res.status(201).json({
      success: true,
      message: 'Association parking créée avec succès',
      data: newParking
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'association parking:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'association parking'
    });
  }
});

/**
 * PUT /parkings/:id - Mettre à jour une association de parking
 * Restreint aux administrateurs
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const parkingId = parseInt(req.params.id);
    const { vehicle_id, location_id } = req.body;
    
    // Vérifier si au moins un champ est fourni
    if (vehicle_id === undefined && location_id === undefined) {
      res.status(400).json({
        success: false,
        message: 'Au moins un champ à modifier doit être fourni (vehicle_id ou location_id)'
      });
      return;
    }

    // Récupérer le parking actuel
    const currentParking = await parkingsModel.getById(parkingId);
    if (!currentParking) {
      res.status(404).json({
        success: false,
        message: 'Parking non trouvé'
      });
      return;
    }

    // Validation des références si elles sont fournies
    if (vehicle_id !== undefined || location_id !== undefined) {
      const vehicleToCheck = vehicle_id !== undefined ? vehicle_id : currentParking.vehicle_id;
      const locationToCheck = location_id !== undefined ? location_id : currentParking.location_id;

      const { vehicleValid, locationValid } = await parkingsModel.validateReferences(vehicleToCheck, locationToCheck);
      
      if (vehicle_id !== undefined && !vehicleValid) {
        res.status(400).json({
          success: false,
          message: 'Véhicule non trouvé'
        });
        return;
      }

      if (location_id !== undefined && !locationValid) {
        res.status(400).json({
          success: false,
          message: 'Emplacement non trouvé'
        });
        return;
      }
    }

    // Vérifier si le nouveau véhicule n'est pas déjà assigné à un autre parking
    if (vehicle_id !== undefined && vehicle_id !== currentParking.vehicle_id) {
      const isVehicleAssigned = await parkingsModel.isVehicleAssigned(vehicle_id, parkingId);
      if (isVehicleAssigned) {
        res.status(400).json({
          success: false,
          message: 'Ce véhicule est déjà assigné à un autre emplacement de parking'
        });
        return;
      }
    }

    // Mettre à jour le parking
    const updateData: ParkingUpdate = {};
    if (vehicle_id !== undefined) updateData.vehicle_id = vehicle_id;
    if (location_id !== undefined) updateData.location_id = location_id;

    const updatedParking = await parkingsModel.update(parkingId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Association parking mise à jour avec succès',
      data: updatedParking
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du parking:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du parking'
    });
  }
});

/**
 * DELETE /parkings/:id - Supprimer une association de parking
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const parkingId = parseInt(req.params.id);
    
    const deleted = await parkingsModel.delete(parkingId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Parking non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Association parking supprimée avec succès'
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression du parking:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du parking'
    });
  }
});

export default router;
