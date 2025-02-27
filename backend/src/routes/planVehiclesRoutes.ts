import express, { Request, Response } from 'express';
import planVehiclesModel, { PlanVehicleUpdate } from '../models/planVehicles';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /plan-vehicles - Récupérer la liste des associations plan/véhicule
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    // Filtrer par plan_id si fourni dans les query parameters
    const planId = req.query.plan_id ? parseInt(req.query.plan_id as string) : undefined;
    
    let planVehicles;
    if (planId) {
      planVehicles = await planVehiclesModel.getByPlanId(planId);
    } else {
      planVehicles = await planVehiclesModel.getAll();
    }

    res.status(200).json({
      success: true,
      message: 'Liste des associations plan/véhicule récupérée avec succès',
      data: planVehicles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des associations plan/véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des associations plan/véhicule'
    });
  }
});

/**
 * GET /plan-vehicles/:id - Récupérer une association plan/véhicule spécifique
 * Accessible à tous les utilisateurs authentifiés
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const planVehicleId = parseInt(req.params.id);
    const planVehicle = await planVehiclesModel.getById(planVehicleId);
    
    if (!planVehicle) {
      res.status(404).json({
        success: false,
        message: 'Association plan/véhicule non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Association plan/véhicule récupérée avec succès',
      data: planVehicle
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'association plan/véhicule:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'association plan/véhicule'
    });
  }
});

/**
 * POST /plan-vehicles - Créer une nouvelle association plan/véhicule
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { id, plan_id, vehicle_type, category } = req.body;
    
    // Validation des données
    if (!plan_id || !vehicle_type) {
      res.status(400).json({
        success: false,
        message: 'Les champs plan_id et vehicle_type sont obligatoires'
      });
      return;
    }

    // Vérifier si le plan existe
    const planExists = await planVehiclesModel.planExists(plan_id);
    if (!planExists) {
      res.status(400).json({
        success: false,
        message: 'Plan d\'abonnement non trouvé'
      });
      return;
    }

    // Vérifier si le type de véhicule est valide
    const validVehicleTypes = ['car', 'motorcycle', 'boat'];
    if (!validVehicleTypes.includes(vehicle_type)) {
      res.status(400).json({
        success: false,
        message: 'Type de véhicule invalide. Types valides: car, motorcycle, boat'
      });
      return;
    }

    // Vérifier si la catégorie est valide pour les voitures
    if (vehicle_type === 'car' && category) {
      const validCarCategories = ['sedan', 'suv', 'no_license', 'city_car', 'coupe'];
      if (!validCarCategories.includes(category)) {
        res.status(400).json({
          success: false,
          message: 'Catégorie de voiture invalide. Catégories valides: sedan, suv, no_license, city_car, coupe'
        });
        return;
      }
    }

    // Vérifier si une association similaire existe déjà
    const associationExists = await planVehiclesModel.associationExists(plan_id, vehicle_type, category);
    if (associationExists) {
      res.status(400).json({
        success: false,
        message: 'Une association similaire existe déjà pour ce plan'
      });
      return;
    }

    // Créer l'association
    const newPlanVehicle = await planVehiclesModel.create({
      id,
      plan_id,
      vehicle_type,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Association plan/véhicule créée avec succès',
      data: newPlanVehicle
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'association plan/véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'association plan/véhicule'
    });
  }
});

/**
 * PUT /plan-vehicles/:id - Mettre à jour une association plan/véhicule
 * Restreint aux administrateurs
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const planVehicleId = parseInt(req.params.id);
    const { plan_id, vehicle_type, category } = req.body;
    
    // Vérifier si au moins un champ est fourni
    if (plan_id === undefined && vehicle_type === undefined && category === undefined) {
      res.status(400).json({
        success: false,
        message: 'Au moins un champ à modifier doit être fourni'
      });
      return;
    }

    // Récupérer l'association existante
    const existingPlanVehicle = await planVehiclesModel.getById(planVehicleId);
    if (!existingPlanVehicle) {
      res.status(404).json({
        success: false,
        message: 'Association plan/véhicule non trouvée'
      });
      return;
    }

    // Vérifier si le plan existe s'il est modifié
    if (plan_id !== undefined) {
      const planExists = await planVehiclesModel.planExists(plan_id);
      if (!planExists) {
        res.status(400).json({
          success: false,
          message: 'Plan d\'abonnement non trouvé'
        });
        return;
      }
    }

    // Vérifier si le type de véhicule est valide s'il est modifié
    if (vehicle_type !== undefined) {
      const validVehicleTypes = ['car', 'motorcycle', 'boat'];
      if (!validVehicleTypes.includes(vehicle_type)) {
        res.status(400).json({
          success: false,
          message: 'Type de véhicule invalide. Types valides: car, motorcycle, boat'
        });
        return;
      }
    }

    // Déterminer si la catégorie est valide par rapport au type
    const finalVehicleType = vehicle_type || existingPlanVehicle.vehicle_type;
    
    // Pour les voitures, vérifier la catégorie
    if (category !== undefined && finalVehicleType === 'car') {
      const validCarCategories = ['sedan', 'suv', 'no_license', 'city_car', 'coupe'];
      if (category !== null && !validCarCategories.includes(category)) {
        res.status(400).json({
          success: false,
          message: 'Catégorie de voiture invalide. Catégories valides: sedan, suv, no_license, city_car, coupe'
        });
        return;
      }
    }

    // Pour les types autres que voiture, la catégorie doit être null
    if (category !== undefined && category !== null && finalVehicleType !== 'car') {
      res.status(400).json({
        success: false,
        message: 'La catégorie ne peut être définie que pour les véhicules de type "car"'
      });
      return;
    }

    // Vérifier si une association similaire existe déjà
    const finalPlanId = plan_id || existingPlanVehicle.plan_id;
    const finalCategory = category !== undefined ? category : existingPlanVehicle.category;
    
    const associationExists = await planVehiclesModel.associationExists(
      finalPlanId, 
      finalVehicleType, 
      finalCategory, 
      planVehicleId
    );
    
    if (associationExists) {
      res.status(400).json({
        success: false,
        message: 'Une association similaire existe déjà pour ce plan'
      });
      return;
    }

    // Mettre à jour l'association
    const updateData: PlanVehicleUpdate = {};
    if (plan_id !== undefined) updateData.plan_id = plan_id;
    if (vehicle_type !== undefined) updateData.vehicle_type = vehicle_type;
    if (category !== undefined) updateData.category = category;

    const updatedPlanVehicle = await planVehiclesModel.update(planVehicleId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Association plan/véhicule mise à jour avec succès',
      data: updatedPlanVehicle
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'association plan/véhicule:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'association plan/véhicule'
    });
  }
});

/**
 * DELETE /plan-vehicles/:id - Supprimer une association plan/véhicule
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const planVehicleId = parseInt(req.params.id);
    
    const deleted = await planVehiclesModel.delete(planVehicleId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Association plan/véhicule non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Association plan/véhicule supprimée avec succès'
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'association plan/véhicule:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'association plan/véhicule'
    });
  }
});

export default router;
