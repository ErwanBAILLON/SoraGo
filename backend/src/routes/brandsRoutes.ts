import express, { Request, Response } from 'express';
import brandsModel, { BrandUpdate } from '../models/brands';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /brands - Récupérer toutes les marques
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const brands = await brandsModel.getAll();
    res.status(200).json({
      success: true,
      message: 'Liste des marques récupérée avec succès',
      data: brands
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des marques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des marques'
    });
  }
});

/**
 * GET /brands/:id - Récupérer une marque spécifique
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const brand = await brandsModel.getById(brandId);
    
    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Marque non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Marque récupérée avec succès',
      data: brand
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de la marque:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la marque'
    });
  }
});

/**
 * POST /brands - Créer une nouvelle marque
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;
    
    // Validation des données
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Le nom de la marque est obligatoire'
      });
      return;
    }

    // Vérifier si la marque existe déjà
    const nameExists = await brandsModel.nameExists(name);
    if (nameExists) {
      res.status(400).json({
        success: false,
        message: 'Cette marque existe déjà'
      });
      return;
    }

    // Créer la marque
    const newBrand = await brandsModel.create({
      id,
      name
    });

    res.status(201).json({
      success: true,
      message: 'Marque créée avec succès',
      data: newBrand
    });
  } catch (error) {
    console.error('Erreur lors de la création de la marque:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la marque'
    });
  }
});

/**
 * PUT /brands/:id - Mettre à jour une marque
 * Restreint aux administrateurs
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    const { name } = req.body;
    
    // Vérifier si un nom est fourni
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Le nom de la marque est obligatoire'
      });
      return;
    }

    // Vérifier si le nom existe déjà
    const nameExists = await brandsModel.nameExists(name, brandId);
    if (nameExists) {
      res.status(400).json({
        success: false,
        message: 'Ce nom de marque existe déjà'
      });
      return;
    }

    // Mettre à jour la marque
    const updatedBrand = await brandsModel.update(brandId, { name });
    
    if (!updatedBrand) {
      res.status(404).json({
        success: false,
        message: 'Marque non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Marque mise à jour avec succès',
      data: updatedBrand
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la marque:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la marque'
    });
  }
});

/**
 * DELETE /brands/:id - Supprimer une marque
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);
    
    try {
      const deleted = await brandsModel.delete(brandId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Marque non trouvée'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Marque supprimée avec succès'
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
    console.error(`Erreur lors de la suppression de la marque:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la marque'
    });
  }
});

export default router;
