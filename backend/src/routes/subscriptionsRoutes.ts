import express, { Request, Response } from 'express';
import subscriptionsModel, { SubscriptionUpdate } from '../models/subscriptions';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /subscriptions - Récupérer la liste des abonnements
 * Les administrateurs peuvent voir tous les abonnements
 * Les utilisateurs normaux ne peuvent voir que leurs propres abonnements
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    let subscriptions;
    
    // Les administrateurs peuvent voir tous les abonnements
    if (req.user?.isAdmin) {
      subscriptions = await subscriptionsModel.getAll();
    } else {
      // Les utilisateurs normaux ne peuvent voir que leurs propres abonnements
      subscriptions = await subscriptionsModel.getByUserId(req.user!.id);
    }
    
    res.status(200).json({
      success: true,
      message: 'Liste des abonnements récupérée avec succès',
      data: subscriptions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des abonnements'
    });
  }
});

/**
 * GET /subscriptions/:id - Récupérer un abonnement spécifique
 * Les administrateurs peuvent voir n'importe quel abonnement
 * Les utilisateurs normaux ne peuvent voir que leurs propres abonnements
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const subscriptionId = parseInt(req.params.id);
    const subscription = await subscriptionsModel.getById(subscriptionId);
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Abonnement non trouvé'
      });
      return;
    }

    // Vérifier que l'utilisateur est autorisé à voir cet abonnement
    if (!req.user?.isAdmin && subscription.user_id !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous ne pouvez consulter que vos propres abonnements'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Abonnement récupéré avec succès',
      data: subscription
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'abonnement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'abonnement'
    });
  }
});

/**
 * POST /subscriptions - Créer un nouvel abonnement
 * Les administrateurs peuvent créer des abonnements pour n'importe quel utilisateur
 * Les utilisateurs normaux peuvent uniquement créer un abonnement pour eux-mêmes
 */
router.post('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const { id, user_id, plan_id, start_date, end_date } = req.body;
    
    // Validation des données
    if (!plan_id) {
      res.status(400).json({
        success: false,
        message: 'Le champ plan_id est obligatoire'
      });
      return;
    }

    // Déterminer l'utilisateur pour l'abonnement
    const targetUserId = user_id || req.user!.id;
    
    // Vérifier que l'utilisateur est autorisé à créer cet abonnement
    if (!req.user?.isAdmin && targetUserId !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous ne pouvez créer un abonnement que pour vous-même'
      });
      return;
    }

    // Vérifier si l'utilisateur a déjà un abonnement actif
    const hasActiveSubscription = await subscriptionsModel.hasActiveSubscription(targetUserId);
    if (hasActiveSubscription) {
      res.status(400).json({
        success: false,
        message: 'Cet utilisateur a déjà un abonnement actif'
      });
      return;
    }

    // Vérifier si l'utilisateur et le plan existent
    const { userValid, planValid } = await subscriptionsModel.validateReferences(targetUserId, plan_id);
    
    if (!userValid) {
      res.status(400).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    if (!planValid) {
      res.status(400).json({
        success: false,
        message: 'Plan d\'abonnement non trouvé'
      });
      return;
    }

    // Créer l'abonnement
    const newSubscription = await subscriptionsModel.create({
      id,
      user_id: targetUserId,
      plan_id,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Abonnement créé avec succès',
      data: newSubscription
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'abonnement'
    });
  }
});

/**
 * PUT /subscriptions/:id - Mettre à jour un abonnement
 * Les administrateurs peuvent mettre à jour n'importe quel abonnement
 * Les utilisateurs normaux ne peuvent pas mettre à jour les abonnements
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const subscriptionId = parseInt(req.params.id);
    const { user_id, plan_id, start_date, end_date, archived } = req.body;
    
    // Vérifier si au moins un champ est fourni
    if (user_id === undefined && plan_id === undefined && 
        start_date === undefined && end_date === undefined && 
        archived === undefined) {
      res.status(400).json({
        success: false,
        message: 'Au moins un champ à modifier doit être fourni'
      });
      return;
    }

    // Récupérer l'abonnement existant
    const existingSubscription = await subscriptionsModel.getById(subscriptionId);
    if (!existingSubscription) {
      res.status(404).json({
        success: false,
        message: 'Abonnement non trouvé'
      });
      return;
    }

    // Vérifier les références si elles sont modifiées
    if (user_id !== undefined || plan_id !== undefined) {
      const userIdToCheck = user_id || existingSubscription.user_id;
      const planIdToCheck = plan_id || existingSubscription.plan_id;
      
      const { userValid, planValid } = await subscriptionsModel.validateReferences(userIdToCheck, planIdToCheck);
      
      if (user_id !== undefined && !userValid) {
        res.status(400).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
        return;
      }

      if (plan_id !== undefined && !planValid) {
        res.status(400).json({
          success: false,
          message: 'Plan d\'abonnement non trouvé'
        });
        return;
      }
    }

    // Mettre à jour l'abonnement
    const updateData: SubscriptionUpdate = {};
    if (user_id !== undefined) updateData.user_id = user_id;
    if (plan_id !== undefined) updateData.plan_id = plan_id;
    if (start_date !== undefined) updateData.start_date = new Date(start_date);
    if (end_date !== undefined) updateData.end_date = new Date(end_date);
    if (archived !== undefined) updateData.archived = archived;

    const updatedSubscription = await subscriptionsModel.update(subscriptionId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Abonnement mis à jour avec succès',
      data: updatedSubscription
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'abonnement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'abonnement'
    });
  }
});

/**
 * DELETE /subscriptions/:id - Supprimer un abonnement
 * Restreint aux administrateurs
 * Les abonnements avec des paiements sont archivés plutôt que supprimés
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const subscriptionId = parseInt(req.params.id);
    
    // Récupérer l'abonnement existant
    const existingSubscription = await subscriptionsModel.getById(subscriptionId);
    if (!existingSubscription) {
      res.status(404).json({
        success: false,
        message: 'Abonnement non trouvé'
      });
      return;
    }

    // Supprimer ou archiver l'abonnement
    const deleted = await subscriptionsModel.delete(subscriptionId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Abonnement non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Abonnement supprimé ou archivé avec succès'
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'abonnement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'abonnement'
    });
  }
});

export default router;
