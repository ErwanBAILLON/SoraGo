import express, { Request, Response } from 'express';
import subscriptionPlansModel, { SubscriptionPlanUpdate } from '../models/subscriptionPlans';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /subscription-plans - Récupérer tous les plans d'abonnement
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const plans = await subscriptionPlansModel.getAll();
    res.status(200).json({
      success: true,
      message: 'Liste des plans d\'abonnement récupérée avec succès',
      data: plans
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des plans d\'abonnement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des plans d\'abonnement'
    });
  }
});

/**
 * GET /subscription-plans/:id - Récupérer un plan d'abonnement spécifique
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.id);
    const plan = await subscriptionPlansModel.getById(planId);
    
    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Plan d\'abonnement non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Plan d\'abonnement récupéré avec succès',
      data: plan
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du plan d'abonnement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du plan d\'abonnement'
    });
  }
});

/**
 * POST /subscription-plans - Créer un nouveau plan d'abonnement
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { id, name, price, vehicles } = req.body;
    
    // Validation des données
    if (!name || price === undefined) {
      res.status(400).json({
        success: false,
        message: 'Les champs name et price sont obligatoires'
      });
      return;
    }

    if (price < 0) {
      res.status(400).json({
        success: false,
        message: 'Le prix doit être un nombre positif'
      });
      return;
    }

    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Au moins un véhicule doit être associé au plan'
      });
      return;
    }

    // Vérifier la validité des types de véhicules
    const validTypes = ['car', 'motorcycle', 'boat'];
    const validCategories = ['sedan', 'suv', 'no_license', 'city_car', 'coupe', null];

    const invalidVehicleType = vehicles.some(v => !validTypes.includes(v.vehicle_type));
    if (invalidVehicleType) {
      res.status(400).json({
        success: false,
        message: 'Type de véhicule invalide. Types valides: car, motorcycle, boat'
      });
      return;
    }

    const invalidCategory = vehicles.some(v => v.category && !validCategories.includes(v.category));
    if (invalidCategory) {
      res.status(400).json({
        success: false,
        message: 'Catégorie de véhicule invalide. Catégories valides: sedan, suv, no_license, city_car, coupe'
      });
      return;
    }

    // Vérifier si le nom existe déjà
    const nameExists = await subscriptionPlansModel.nameExists(name);
    if (nameExists) {
      res.status(400).json({
        success: false,
        message: 'Un plan avec ce nom existe déjà'
      });
      return;
    }

    // Créer le plan d'abonnement
    const newPlan = await subscriptionPlansModel.create(
      { id, name, price },
      vehicles
    );

    res.status(201).json({
      success: true,
      message: 'Plan d\'abonnement créé avec succès',
      data: newPlan
    });
  } catch (error) {
    console.error('Erreur lors de la création du plan d\'abonnement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du plan d\'abonnement'
    });
  }
});

/**
 * PUT /subscription-plans/:id - Mettre à jour un plan d'abonnement
 * Restreint aux administrateurs
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.id);
    const { name, price, vehicles } = req.body;
    
    // Vérifier si au moins un champ est fourni
    if (name === undefined && price === undefined && !vehicles) {
      res.status(400).json({
        success: false,
        message: 'Au moins un champ à modifier doit être fourni (name, price ou vehicles)'
      });
      return;
    }

    // Valider le prix s'il est fourni
    if (price !== undefined && price < 0) {
      res.status(400).json({
        success: false,
        message: 'Le prix doit être un nombre positif'
      });
      return;
    }

    // Valider les véhicules s'ils sont fournis
    if (vehicles) {
      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Au moins un véhicule doit être associé au plan'
        });
        return;
      }

      // Vérifier la validité des types de véhicules
      const validTypes = ['car', 'motorcycle', 'boat'];
      const validCategories = ['sedan', 'suv', 'no_license', 'city_car', 'coupe', null];

      const invalidVehicleType = vehicles.some(v => !validTypes.includes(v.vehicle_type));
      if (invalidVehicleType) {
        res.status(400).json({
          success: false,
          message: 'Type de véhicule invalide. Types valides: car, motorcycle, boat'
        });
        return;
      }

      const invalidCategory = vehicles.some(v => v.category && !validCategories.includes(v.category));
      if (invalidCategory) {
        res.status(400).json({
          success: false,
          message: 'Catégorie de véhicule invalide. Catégories valides: sedan, suv, no_license, city_car, coupe'
        });
        return;
      }
    }

    // Vérifier si le nom existe déjà
    if (name) {
      const nameExists = await subscriptionPlansModel.nameExists(name, planId);
      if (nameExists) {
        res.status(400).json({
          success: false,
          message: 'Un autre plan avec ce nom existe déjà'
        });
        return;
      }
    }

    // Mettre à jour le plan d'abonnement
    const updateData: SubscriptionPlanUpdate = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;

    const updatedPlan = await subscriptionPlansModel.update(planId, updateData, vehicles);
    
    if (!updatedPlan) {
      res.status(404).json({
        success: false,
        message: 'Plan d\'abonnement non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Plan d\'abonnement mis à jour avec succès',
      data: updatedPlan
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du plan d'abonnement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du plan d\'abonnement'
    });
  }
});

/**
 * DELETE /subscription-plans/:id - Supprimer un plan d'abonnement
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const planId = parseInt(req.params.id);
    
    try {
      const deleted = await subscriptionPlansModel.delete(planId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Plan d\'abonnement non trouvé'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Plan d\'abonnement supprimé avec succès'
      });
    } catch (error) {
      // Vérifier si l'erreur est due à des références existantes
      if (error instanceof Error && error.message.includes('utilisé')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du plan d'abonnement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du plan d\'abonnement'
    });
  }
});

export default router;
