import express, { Request, Response } from 'express';
import specificationsModel, { SpecificationUpdate } from '../models/specifications';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /specifications - Récupérer toutes les spécifications
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const specifications = await specificationsModel.getAll();
    res.status(200).json({
      success: true,
      message: 'Liste des spécifications récupérée avec succès',
      data: specifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des spécifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des spécifications'
    });
  }
});

/**
 * GET /specifications/:id - Récupérer une spécification spécifique
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const specId = parseInt(req.params.id);
    const specification = await specificationsModel.getById(specId);
    
    if (!specification) {
      res.status(404).json({
        success: false,
        message: 'Spécification non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Spécification récupérée avec succès',
      data: specification
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de la spécification:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la spécification'
    });
  }
});

/**
 * POST /specifications - Créer une nouvelle spécification
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { id, weight, length, width, height } = req.body;
    
    // Validation des données
    if (weight === undefined || length === undefined || width === undefined || height === undefined) {
      res.status(400).json({
        success: false,
        message: 'Tous les champs de dimensions sont obligatoires (weight, length, width, height)'
      });
      return;
    }

    // Valider que les valeurs sont des nombres positifs
    if (weight <= 0 || length <= 0 || width <= 0 || height <= 0) {
      res.status(400).json({
        success: false,
        message: 'Toutes les dimensions doivent être des valeurs positives'
      });
      return;
    }

    // Vérifier si une spécification identique existe déjà
    const specExists = await specificationsModel.specificationExists(weight, length, width, height);
    if (specExists) {
      res.status(400).json({
        success: false,
        message: 'Une spécification identique existe déjà'
      });
      return;
    }

    // Créer la spécification
    const newSpec = await specificationsModel.create({
      id,
      weight,
      length,
      width,
      height
    });

    res.status(201).json({
      success: true,
      message: 'Spécification créée avec succès',
      data: newSpec
    });
  } catch (error) {
    console.error('Erreur lors de la création de la spécification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la spécification'
    });
  }
});

/**
 * PUT /specifications/:id - Mettre à jour une spécification
 * Restreint aux administrateurs
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const specId = parseInt(req.params.id);
    const { weight, length, width, height } = req.body;
    
    // Vérifier si au moins un champ est fourni
    if (weight === undefined && length === undefined && width === undefined && height === undefined) {
      res.status(400).json({
        success: false,
        message: 'Au moins une dimension à modifier doit être fournie'
      });
      return;
    }

    // Valider que les valeurs fournies sont positives
    if ((weight !== undefined && weight <= 0) || 
        (length !== undefined && length <= 0) || 
        (width !== undefined && width <= 0) || 
        (height !== undefined && height <= 0)) {
      res.status(400).json({
        success: false,
        message: 'Toutes les dimensions doivent être des valeurs positives'
      });
      return;
    }

    // Obtenir les valeurs actuelles pour vérifier les doublons
    const currentSpec = await specificationsModel.getById(specId);
    if (!currentSpec) {
      res.status(404).json({
        success: false,
        message: 'Spécification non trouvée'
      });
      return;
    }

    const newWeight = weight !== undefined ? weight : currentSpec.weight;
    const newLength = length !== undefined ? length : currentSpec.length;
    const newWidth = width !== undefined ? width : currentSpec.width;
    const newHeight = height !== undefined ? height : currentSpec.height;

    // Vérifier si une spécification identique existe déjà
    const specExists = await specificationsModel.specificationExists(newWeight, newLength, newWidth, newHeight, specId);
    if (specExists) {
      res.status(400).json({
        success: false,
        message: 'Une spécification avec ces dimensions existe déjà'
      });
      return;
    }

    // Mettre à jour la spécification
    const updateData: SpecificationUpdate = {};
    if (weight !== undefined) updateData.weight = weight;
    if (length !== undefined) updateData.length = length;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;

    const updatedSpec = await specificationsModel.update(specId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Spécification mise à jour avec succès',
      data: updatedSpec
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la spécification:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la spécification'
    });
  }
});

/**
 * DELETE /specifications/:id - Supprimer une spécification
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const specId = parseInt(req.params.id);
    
    try {
      const deleted = await specificationsModel.delete(specId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Spécification non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Spécification supprimée avec succès'
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
    console.error(`Erreur lors de la suppression de la spécification:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la spécification'
    });
  }
});

export default router;
