import express, { Request, Response } from 'express';
import returnLogsModel, { ReturnLogUpdate } from '../models/returnLogs';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /return-logs - Récupérer la liste des logs de retour
 * Les administrateurs peuvent voir tous les logs
 * Les utilisateurs normaux ne peuvent pas accéder à cette route
 */
router.get('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    // Filtrer par ID de réservation si fourni
    const reservationId = req.query.reservation_id ? parseInt(req.query.reservation_id as string) : undefined;
    
    let returnLogs;
    if (reservationId) {
      returnLogs = await returnLogsModel.getByReservationId(reservationId);
    } else {
      returnLogs = await returnLogsModel.getAll();
    }
    
    res.status(200).json({
      success: true,
      message: 'Liste des logs de retour récupérée avec succès',
      data: returnLogs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs de retour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des logs de retour'
    });
  }
});

/**
 * GET /return-logs/:id - Récupérer un log de retour spécifique
 * Les administrateurs peuvent voir n'importe quel log
 * Les utilisateurs normaux peuvent voir uniquement les logs liés à leurs réservations
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const returnLogId = parseInt(req.params.id);
    
    // Vérifier que l'utilisateur a le droit d'accéder à ce log
    const canAccess = await returnLogsModel.canUserAccessReturnLog(req.user!.id, returnLogId, req.user!.isAdmin);
    if (!canAccess) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous pouvez consulter uniquement les logs liés à vos réservations'
      });
      return;
    }
    
    const returnLog = await returnLogsModel.getById(returnLogId);
    
    if (!returnLog) {
      res.status(404).json({
        success: false,
        message: 'Log de retour non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Log de retour récupéré avec succès',
      data: returnLog
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération du log de retour:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du log de retour'
    });
  }
});

/**
 * POST /return-logs - Créer un nouveau log de retour
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { 
      reservation_id, 
      return_date, 
      location_id, 
      condition, 
      return_mileage 
    } = req.body;
    
    // Validation des données
    if (!reservation_id || !location_id) {
      res.status(400).json({
        success: false,
        message: 'Les champs reservation_id et location_id sont obligatoires'
      });
      return;
    }

    // Vérifier si la réservation existe et n'est pas déjà terminée
    const reservationCheck = await returnLogsModel.validateReservation(reservation_id);
    if (!reservationCheck.valid) {
      res.status(400).json({
        success: false,
        message: 'Réservation non trouvée'
      });
      return;
    }
    
    if (reservationCheck.status === 'completed' || reservationCheck.status === 'canceled') {
      res.status(400).json({
        success: false,
        message: `La réservation est déjà ${reservationCheck.status === 'completed' ? 'terminée' : 'annulée'}`
      });
      return;
    }
    
    // Vérifier si l'emplacement existe
    const locationValid = await returnLogsModel.validateLocation(location_id);
    if (!locationValid) {
      res.status(400).json({
        success: false,
        message: 'Emplacement non trouvé'
      });
      return;
    }

    // Convertir la date si fournie
    let parsedReturnDate = undefined;
    if (return_date) {
      parsedReturnDate = new Date(return_date);
      if (isNaN(parsedReturnDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Format de date de retour invalide'
        });
        return;
      }
    }

    // Créer le log de retour
    const newReturnLog = await returnLogsModel.create({
      reservation_id,
      return_date: parsedReturnDate,
      location_id,
      condition,
      return_mileage: return_mileage !== undefined ? parseInt(return_mileage as any) : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Log de retour créé avec succès',
      data: newReturnLog
    });
  } catch (error) {
    console.error('Erreur lors de la création du log de retour:', error);
    
    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('est déjà terminée ou annulée')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du log de retour'
    });
  }
});

/**
 * PUT /return-logs/:id - Mettre à jour un log de retour
 * Restreint aux administrateurs
 */
router.put('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const returnLogId = parseInt(req.params.id);
    const { 
      reservation_id, 
      return_date, 
      location_id, 
      condition, 
      return_mileage 
    } = req.body;
    
    // Vérifier si le log existe
    const existingLog = await returnLogsModel.getById(returnLogId);
    if (!existingLog) {
      res.status(404).json({
        success: false,
        message: 'Log de retour non trouvé'
      });
      return;
    }
    
    // Validation des références si fournies
    if (reservation_id !== undefined) {
      const reservationCheck = await returnLogsModel.validateReservation(reservation_id);
      if (!reservationCheck.valid) {
        res.status(400).json({
          success: false,
          message: 'Réservation non trouvée'
        });
        return;
      }
    }
    
    if (location_id !== undefined) {
      const locationValid = await returnLogsModel.validateLocation(location_id);
      if (!locationValid) {
        res.status(400).json({
          success: false,
          message: 'Emplacement non trouvé'
        });
        return;
      }
    }

    // Convertir la date si fournie
    let parsedReturnDate = undefined;
    if (return_date) {
      parsedReturnDate = new Date(return_date);
      if (isNaN(parsedReturnDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Format de date de retour invalide'
        });
        return;
      }
    }

    // Préparer les données de mise à jour
    const updateData: ReturnLogUpdate = {};
    if (reservation_id !== undefined) updateData.reservation_id = reservation_id;
    if (parsedReturnDate !== undefined) updateData.return_date = parsedReturnDate;
    if (location_id !== undefined) updateData.location_id = location_id;
    if (condition !== undefined) updateData.condition = condition;
    if (return_mileage !== undefined) updateData.return_mileage = parseInt(return_mileage as any);

    // Mettre à jour le log
    const updatedReturnLog = await returnLogsModel.update(returnLogId, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Log de retour mis à jour avec succès',
      data: updatedReturnLog
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du log de retour:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du log de retour'
    });
  }
});

/**
 * DELETE /return-logs/:id - Supprimer un log de retour
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const returnLogId = parseInt(req.params.id);
    
    const deleted = await returnLogsModel.delete(returnLogId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Log de retour non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Log de retour supprimé avec succès'
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression du log de retour:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du log de retour'
    });
  }
});

export default router;
