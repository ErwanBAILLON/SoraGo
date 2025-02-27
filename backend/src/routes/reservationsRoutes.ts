import express, { Request, Response } from 'express';
import reservationsModel, { ReservationUpdate } from '../models/reservations';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /reservations - Récupérer la liste des réservations
 * Les administrateurs peuvent voir toutes les réservations
 * Les utilisateurs normaux ne peuvent voir que leurs propres réservations
 */
router.get('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    let reservations;
    
    // Les administrateurs peuvent voir toutes les réservations
    if (req.user?.isAdmin) {
      reservations = await reservationsModel.getAll();
    } else {
      // Les utilisateurs normaux ne peuvent voir que leurs propres réservations
      reservations = await reservationsModel.getByUserId(req.user!.id);
    }
    
    res.status(200).json({
      success: true,
      message: 'Liste des réservations récupérée avec succès',
      data: reservations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des réservations'
    });
  }
});

/**
 * GET /reservations/:id - Récupérer une réservation spécifique
 * Les administrateurs peuvent voir n'importe quelle réservation
 * Les utilisateurs normaux ne peuvent voir que leurs propres réservations
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const reservationId = parseInt(req.params.id);
    
    // Vérifier que l'utilisateur a le droit d'accéder à cette réservation
    const canAccess = await reservationsModel.canUserAccessReservation(req.user!.id, reservationId, req.user!.isAdmin);
    if (!canAccess) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous ne pouvez consulter que vos propres réservations'
      });
      return;
    }
    
    const reservation = await reservationsModel.getById(reservationId);
    
    if (!reservation) {
      res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Réservation récupérée avec succès',
      data: reservation
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de la réservation:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la réservation'
    });
  }
});

/**
 * POST /reservations - Créer une nouvelle réservation
 * Accessible à tous les utilisateurs authentifiés
 */
router.post('/', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const { vehicle_id, start_date, expected_end_date, status } = req.body;
    
    // Validation des données
    if (!vehicle_id || !start_date || !expected_end_date) {
      res.status(400).json({
        success: false,
        message: 'Les champs vehicle_id, start_date et expected_end_date sont obligatoires'
      });
      return;
    }

    // Convertir les chaînes de dates en objets Date
    const parsedStartDate = new Date(start_date);
    const parsedEndDate = new Date(expected_end_date);
    
    // Vérifier que les dates sont valides
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Formats de date invalides'
      });
      return;
    }
    
    // Vérifier que la date de début est dans le futur
    if (parsedStartDate < new Date()) {
      res.status(400).json({
        success: false,
        message: 'La date de début doit être dans le futur'
      });
      return;
    }
    
    // Vérifier que la date de fin est après la date de début
    if (parsedEndDate <= parsedStartDate) {
      res.status(400).json({
        success: false,
        message: 'La date de fin doit être postérieure à la date de début'
      });
      return;
    }
    
    // Vérifier les références (utilisateur et véhicule)
    const { userValid, vehicleValid } = await reservationsModel.validateReferences(req.user!.id, vehicle_id);
    
    if (!userValid) {
      res.status(400).json({
        success: false,
        message: 'Utilisateur invalide'
      });
      return;
    }

    if (!vehicleValid) {
      res.status(400).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
      return;
    }
    
    // Vérifier si le véhicule est disponible pour la période demandée
    const isAvailable = await reservationsModel.isVehicleAvailable(vehicle_id, parsedStartDate, parsedEndDate);
    if (!isAvailable) {
      res.status(400).json({
        success: false,
        message: 'Le véhicule n\'est pas disponible pour la période demandée'
      });
      return;
    }

    // Seul un admin peut créer une réservation avec un statut spécifique
    // Les utilisateurs normaux créent toujours avec statut "pending"
    const reservationStatus = req.user!.isAdmin && status ? status : 'pending';
    
    // Créer la réservation
    const newReservation = await reservationsModel.create({
      user_id: req.user!.id,
      vehicle_id,
      start_date: parsedStartDate,
      expected_end_date: parsedEndDate,
      status: reservationStatus
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès',
      data: newReservation
    });
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la réservation'
    });
  }
});

/**
 * PUT /reservations/:id - Mettre à jour une réservation
 * Les administrateurs peuvent mettre à jour n'importe quelle réservation
 * Les utilisateurs normaux peuvent uniquement annuler leurs propres réservations
 */
router.put('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const reservationId = parseInt(req.params.id);
    const { vehicle_id, start_date, expected_end_date, actual_end_date, status } = req.body;
    
    // Récupérer la réservation existante
    const existingReservation = await reservationsModel.getById(reservationId);
    if (!existingReservation) {
      res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
      return;
    }
    
    // Vérifier que l'utilisateur a le droit d'accéder à cette réservation
    const isUserOwner = existingReservation.user_id === req.user!.id;
    const isUserAdmin = req.user!.isAdmin;
    
    if (!isUserOwner && !isUserAdmin) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous pouvez uniquement modifier vos propres réservations'
      });
      return;
    }
    
    // Pour les utilisateurs non-admin, limiter les modifications possibles
    if (!isUserAdmin) {
      // Utilisateurs normaux peuvent seulement annuler leurs réservations
      if (status !== 'canceled' || Object.keys(req.body).length > 1) {
        res.status(403).json({
          success: false,
          message: 'Vous pouvez uniquement annuler votre réservation'
        });
        return;
      }
    }
    
    // Préparer les données de mise à jour
    const updateData: ReservationUpdate = {};
    
    // Convertir et valider les dates si elles sont fournies
    if (start_date) {
      const parsedStartDate = new Date(start_date);
      if (isNaN(parsedStartDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Format de date de début invalide'
        });
        return;
      }
      updateData.start_date = parsedStartDate;
    }
    
    if (expected_end_date) {
      const parsedEndDate = new Date(expected_end_date);
      if (isNaN(parsedEndDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Format de date de fin prévue invalide'
        });
        return;
      }
      updateData.expected_end_date = parsedEndDate;
    }
    
    if (actual_end_date) {
      const parsedActualEndDate = new Date(actual_end_date);
      if (isNaN(parsedActualEndDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Format de date de fin réelle invalide'
        });
        return;
      }
      updateData.actual_end_date = parsedActualEndDate;
    }
    
    // Pour les admins, permettre la mise à jour d'autres champs
    if (isUserAdmin) {
      if (vehicle_id !== undefined) updateData.vehicle_id = vehicle_id;
      if (status !== undefined) updateData.status = status;
      
      // Si le véhicule est modifié, vérifier qu'il existe
      if (vehicle_id !== undefined) {
        const { vehicleValid } = await reservationsModel.validateReferences(existingReservation.user_id, vehicle_id);
        if (!vehicleValid) {
          res.status(400).json({
            success: false,
            message: 'Véhicule non trouvé'
          });
          return;
        }
      }
      
      // Si les dates sont modifiées, vérifier la disponibilité du véhicule
      if ((start_date || expected_end_date) && vehicle_id !== undefined) {
        const finalStartDate = updateData.start_date || existingReservation.start_date;
        const finalEndDate = updateData.expected_end_date || existingReservation.expected_end_date;
        const finalVehicleId = updateData.vehicle_id || existingReservation.vehicle_id;
        
        const isAvailable = await reservationsModel.isVehicleAvailable(
          finalVehicleId, 
          finalStartDate, 
          finalEndDate,
          reservationId
        );
        
        if (!isAvailable) {
          res.status(400).json({
            success: false,
            message: 'Le véhicule n\'est pas disponible pour la période demandée'
          });
          return;
        }
      }
    } else {
      // Pour les utilisateurs normaux, uniquement permettre l'annulation
      updateData.status = 'canceled';
    }
    
    // Mettre à jour la réservation
    const updatedReservation = await reservationsModel.update(reservationId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour avec succès',
      data: updatedReservation
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la réservation:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la réservation'
    });
  }
});

/**
 * DELETE /reservations/:id - Annuler/supprimer une réservation
 * Les administrateurs peuvent forcer la suppression (si pas de paiement associé)
 * Les utilisateurs normaux peuvent uniquement annuler leurs propres réservations
 */
router.delete('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const reservationId = parseInt(req.params.id);
    const forceDelete = req.query.force === 'true' && req.user!.isAdmin;
    
    // Récupérer la réservation existante
    const existingReservation = await reservationsModel.getById(reservationId);
    if (!existingReservation) {
      res.status(404).json({
        success: false,
        message: 'Réservation non trouvée'
      });
      return;
    }
    
    // Vérifier que l'utilisateur a le droit d'accéder à cette réservation
    const isUserOwner = existingReservation.user_id === req.user!.id;
    const isUserAdmin = req.user!.isAdmin;
    
    if (!isUserOwner && !isUserAdmin) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous pouvez uniquement annuler vos propres réservations'
      });
      return;
    }
    
    // Supprimer ou annuler la réservation
    try {
      const deleted = await reservationsModel.delete(reservationId, forceDelete);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Réservation non trouvée ou déjà supprimée'
        });
        return;
      }
      
      const action = forceDelete ? 'supprimée' : 'annulée';
      res.status(200).json({
        success: true,
        message: `Réservation ${action} avec succès`
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('paiements associés')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression/annulation de la réservation:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression/annulation de la réservation'
    });
  }
});

export default router;