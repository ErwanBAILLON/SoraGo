import express, { Request, Response } from 'express';
import locationsModel, { LocationUpdate } from '../models/rents';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /locations - Récupérer toutes les locations
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const locations = await locationsModel.getAll();
    res.status(200).json({
      success: true,
      message: 'Liste des locations récupérée avec succès',
      data: locations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des locations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des locations'
    });
  }
});

/**
 * GET /locations/:id - Récupérer une location spécifique
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    const location = await locationsModel.getById(locationId);
    
    if (!location) {
      res.status(404).json({
        success: false,
        message: 'Location non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Location récupérée avec succès',
      data: location
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de la location:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la location'
    });
  }
});

/**
 * POST /locations - Créer une nouvelle location
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { id, city, address, country } = req.body;
    
    // Validation des données
    if (!city || !address || !country) {
      res.status(400).json({
        success: false,
        message: 'Les champs city, address et country sont obligatoires'
      });
      return;
    }

    // Vérifier si l'adresse existe déjà
    const addressExists = await locationsModel.addressExists(address, city);
    if (addressExists) {
      res.status(400).json({
        success: false,
        message: 'Cette adresse existe déjà à cette ville'
      });
      return;
    }

    // Créer la location
    const newLocation = await locationsModel.create({
      id,
      city,
      address,
      country
    });

    res.status(201).json({
      success: true,
      message: 'Location créée avec succès',
      data: newLocation
    });
  } catch (error) {
    console.error('Erreur lors de la création de la location:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la location'
    });
  }
});

/**
 * PUT /locations/:id - Mettre à jour une location
 * Restreint aux administrateurs
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    const { city, address, country } = req.body;
    
    // Vérifier si au moins un champ est fourni
    if (!city && !address && !country) {
      res.status(400).json({
        success: false,
        message: 'Au moins un champ à modifier doit être fourni'
      });
      return;
    }

    // Si l'adresse ou la ville est modifiée, vérifier si la nouvelle combinaison existe déjà
    if (address && city) {
      const addressExists = await locationsModel.addressExists(address, city, locationId);
      if (addressExists) {
        res.status(400).json({
          success: false,
          message: 'Cette adresse existe déjà à cette ville'
        });
        return;
      }
    }

    // Mettre à jour la location
    const updateData: LocationUpdate = {};
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (country !== undefined) updateData.country = country;

    const updatedLocation = await locationsModel.update(locationId, updateData);
    
    if (!updatedLocation) {
      res.status(404).json({
        success: false,
        message: 'Location non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Location mise à jour avec succès',
      data: updatedLocation
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la location:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la location'
    });
  }
});

/**
 * DELETE /locations/:id - Supprimer une location
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id);
    
    try {
      const deleted = await locationsModel.delete(locationId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Location non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Location supprimée avec succès'
      });
    } catch (error) {
      // Vérifier si l'erreur est due à des références existantes
      if (error instanceof Error && error.message.includes('référencée')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la location:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la location'
    });
  }
});

export default router;
