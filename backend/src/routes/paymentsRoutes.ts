import express, { Request, Response } from 'express';
import paymentsModel, { PaymentUpdate } from '../models/payments';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /payments - Récupérer la liste des paiements
 * Les administrateurs peuvent voir tous les paiements
 * Les utilisateurs normaux ne peuvent voir que leurs propres paiements
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    let payments;
    
    // Les administrateurs peuvent voir tous les paiements
    if (req.user?.isAdmin) {
      payments = await paymentsModel.getAll();
    } else {
      // Les utilisateurs normaux ne peuvent voir que leurs propres paiements
      payments = await paymentsModel.getByUserId(req.user!.id);
    }
    
    res.status(200).json({
      success: true,
      message: 'Liste des paiements récupérée avec succès',
      data: payments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paiements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des paiements'
    });
  }
});

/**
 * GET /payments/:id - Récupérer un paiement spécifique
 * Les administrateurs peuvent voir n'importe quel paiement
 * Les utilisateurs normaux ne peuvent voir que leurs propres paiements
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    
    // Vérifier que l'utilisateur a le droit d'accéder à ce paiement
    const canAccess = await paymentsModel.canUserAccessPayment(req.user!.id, paymentId, req.user!.isAdmin);
    if (!canAccess) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous ne pouvez consulter que vos propres paiements'
      });
      return;
    }
    
    const payment = await paymentsModel.getById(paymentId);
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Paiement récupéré avec succès',
      data: payment
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du paiement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du paiement'
    });
  }
});

/**
 * POST /payments - Créer un nouveau paiement
 * Les utilisateurs peuvent créer des paiements pour leurs propres réservations/abonnements
 * Les administrateurs peuvent créer des paiements pour n'importe quel utilisateur
 */
router.post('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const { 
      user_id, 
      amount, 
      method, 
      status, 
      subscription_id, 
      reservation_id 
    } = req.body;
    
    // Validation des données
    if (!amount || !method) {
      res.status(400).json({
        success: false,
        message: 'Les champs amount et method sont obligatoires'
      });
      return;
    }

    if (amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Le montant doit être supérieur à zéro'
      });
      return;
    }

    // Vérifier que l'utilisateur n'essaie pas de créer un paiement pour quelqu'un d'autre
    const targetUserId = user_id || req.user!.id;
    if (!req.user?.isAdmin && targetUserId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Vous ne pouvez créer un paiement que pour vous-même'
      });
      return;
    }

    // Vérifier que soit subscription_id soit reservation_id est fourni, mais pas les deux
    if ((!subscription_id && !reservation_id) || (subscription_id && reservation_id)) {
      res.status(400).json({
        success: false,
        message: 'Fournir soit subscription_id soit reservation_id, mais pas les deux'
      });
      return;
    }

    // Valider que les références existent
    const { 
      userValid, 
      reservationValid, 
      subscriptionValid,
      reservationUserId,
      subscriptionUserId
    } = await paymentsModel.validateReferences(
      targetUserId, 
      reservation_id, 
      subscription_id
    );

    if (!userValid) {
      res.status(400).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    if (reservation_id && reservationValid === false) {
      res.status(400).json({
        success: false,
        message: 'Réservation non trouvée'
      });
      return;
    }

    if (subscription_id && subscriptionValid === false) {
      res.status(400).json({
        success: false,
        message: 'Abonnement non trouvé'
      });
      return;
    }

    // Vérifier que la réservation ou l'abonnement appartient bien à l'utilisateur (sauf admin)
    if (!req.user?.isAdmin) {
      if (reservation_id && reservationUserId !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: 'Cette réservation ne vous appartient pas'
        });
        return;
      }

      if (subscription_id && subscriptionUserId !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: 'Cet abonnement ne vous appartient pas'
        });
        return;
      }
    }

    // Vérifier que la méthode de paiement est valide
    const validMethods = ['credit_card', 'paypal', 'bank_transfer'];
    if (!validMethods.includes(method)) {
      res.status(400).json({
        success: false,
        message: 'Méthode de paiement invalide'
      });
      return;
    }

    // Vérifier que le statut est valide s'il est fourni
    if (status) {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Statut de paiement invalide'
        });
        return;
      }

      // Pour les utilisateurs normaux, le statut initial ne peut être que "pending"
      if (!req.user?.isAdmin && status !== 'pending') {
        res.status(403).json({
          success: false,
          message: 'Vous ne pouvez créer que des paiements en attente'
        });
        return;
      }
    }

    // Créer le paiement
    const newPayment = await paymentsModel.create({
      user_id: targetUserId,
      amount,
      method,
      status: status || 'pending',
      subscription_id: subscription_id || null,
      reservation_id: reservation_id || null
    });

    res.status(201).json({
      success: true,
      message: 'Paiement créé avec succès',
      data: newPayment
    });
  } catch (error) {
    console.error('Erreur lors de la création du paiement:', error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('fois à un abonnement et à une réservation')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du paiement'
    });
  }
});

/**
 * PUT /payments/:id - Mettre à jour un paiement
 * Les utilisateurs normaux ne peuvent pas mettre à jour les paiements
 * Les administrateurs peuvent mettre à jour n'importe quel paiement
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    const { 
      amount, 
      method, 
      status, 
      subscription_id, 
      reservation_id 
    } = req.body;
    
    // Vérifier si le paiement existe
    const existingPayment = await paymentsModel.getById(paymentId);
    if (!existingPayment) {
      res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
      return;
    }

    // Validation des données
    if (amount !== undefined && amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Le montant doit être supérieur à zéro'
      });
      return;
    }

    // Vérifier que la méthode de paiement est valide si elle est fournie
    if (method !== undefined) {
      const validMethods = ['credit_card', 'paypal', 'bank_transfer'];
      if (!validMethods.includes(method)) {
        res.status(400).json({
          success: false,
          message: 'Méthode de paiement invalide'
        });
        return;
      }
    }

    // Vérifier que le statut est valide s'il est fourni
    if (status !== undefined) {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Statut de paiement invalide'
        });
        return;
      }
    }

    // Valider les références si elles sont fournies
    if (subscription_id !== undefined || reservation_id !== undefined) {
      const { 
        reservationValid, 
        subscriptionValid 
      } = await paymentsModel.validateReferences(
        existingPayment.user_id, 
        reservation_id !== undefined ? reservation_id : undefined, 
        subscription_id !== undefined ? subscription_id : undefined
      );

      if (reservation_id !== undefined && reservationValid === false) {
        res.status(400).json({
          success: false,
          message: 'Réservation non trouvée'
        });
        return;
      }

      if (subscription_id !== undefined && subscriptionValid === false) {
        res.status(400).json({
          success: false,
          message: 'Abonnement non trouvé'
        });
        return;
      }
    }

    // Préparer les données de mise à jour
    const updateData: PaymentUpdate = {};
    if (amount !== undefined) updateData.amount = amount;
    if (method !== undefined) updateData.method = method;
    if (status !== undefined) updateData.status = status;
    if (subscription_id !== undefined) updateData.subscription_id = subscription_id;
    if (reservation_id !== undefined) updateData.reservation_id = reservation_id;

    // Mettre à jour le paiement
    try {
      const updatedPayment = await paymentsModel.update(paymentId, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Paiement mis à jour avec succès',
        data: updatedPayment
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('fois à un abonnement et à une réservation')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du paiement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du paiement'
    });
  }
});

/**
 * DELETE /payments/:id - Annuler/supprimer un paiement
 * Les utilisateurs normaux ne peuvent qu'annuler leurs propres paiements en attente
 * Les administrateurs peuvent forcer la suppression de n'importe quel paiement
 */
router.delete('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    const forceDelete = req.query.force === 'true' && req.user!.isAdmin;
    
    // Récupérer le paiement pour vérifier s'il existe et qui en est le propriétaire
    const payment = await paymentsModel.getById(paymentId);
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Paiement non trouvé'
      });
      return;
    }
    
    // Vérifier que l'utilisateur a le droit de supprimer ce paiement
    const isUserOwner = payment.user_id === req.user!.id;
    const isUserAdmin = req.user!.isAdmin;
    
    if (!isUserOwner && !isUserAdmin) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous pouvez uniquement annuler vos propres paiements'
      });
      return;
    }
    
    // Les utilisateurs normaux ne peuvent pas forcer la suppression et ne peuvent annuler 
    // que les paiements en attente
    if (!isUserAdmin && payment.status !== 'pending') {
      res.status(403).json({
        success: false,
        message: 'Vous ne pouvez annuler que les paiements en attente'
      });
      return;
    }
    
    // Supprimer ou annuler le paiement
    const deleted = await paymentsModel.delete(paymentId, forceDelete);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Paiement non trouvé ou déjà supprimé'
      });
      return;
    }

    const action = forceDelete ? 'supprimé' : 
                  (payment.status === 'completed' ? 'remboursé' : 'annulé');
    
    res.status(200).json({
      success: true,
      message: `Paiement ${action} avec succès`
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression/annulation du paiement:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression/annulation du paiement'
    });
  }
});

export default router;