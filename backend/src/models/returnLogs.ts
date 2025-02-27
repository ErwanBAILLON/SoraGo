import databasePostgresql from "../db";

// Interface pour représenter un log de retour
export interface ReturnLog {
  id?: number;
  reservation_id: number;
  return_date?: Date;
  location_id: number;
  condition?: string;
  return_mileage?: number;
}

// Interface pour les mises à jour de log de retour
export interface ReturnLogUpdate {
  reservation_id?: number;
  return_date?: Date;
  location_id?: number;
  condition?: string;
  return_mileage?: number;
}

// Interface pour un log de retour avec détails
export interface ReturnLogWithDetails extends ReturnLog {
  username?: string;
  user_id?: number;
  vehicle_id?: number;
  vehicle_model?: string;
  location_city?: string;
  location_address?: string;
  reservation_status?: string;
}

const returnLogsModel = {
  /**
   * Récupère tous les logs de retour avec détails
   */
  async getAll(): Promise<ReturnLogWithDetails[]> {
    try {
      const returnLogs = await databasePostgresql.manyOrNone(`
        SELECT 
          rl.id, rl.reservation_id, rl.return_date, rl.location_id, rl.condition, rl.return_mileage,
          r.user_id, r.vehicle_id, r.status AS reservation_status,
          u.username,
          v.model AS vehicle_model,
          l.city AS location_city, l.address AS location_address
        FROM 
          return_log rl
        INNER JOIN 
          reservation r ON rl.reservation_id = r.id
        INNER JOIN 
          "user" u ON r.user_id = u.id
        INNER JOIN 
          vehicle v ON r.vehicle_id = v.id
        INNER JOIN 
          location l ON rl.location_id = l.id
        ORDER BY 
          rl.return_date DESC
      `);
      return returnLogs;
    } catch (error) {
      console.error('Erreur lors de la récupération des logs de retour:', error);
      throw error;
    }
  },

  /**
   * Récupère les logs de retour d'une réservation spécifique
   */
  async getByReservationId(reservationId: number): Promise<ReturnLogWithDetails[]> {
    try {
      const returnLogs = await databasePostgresql.manyOrNone(`
        SELECT 
          rl.id, rl.reservation_id, rl.return_date, rl.location_id, rl.condition, rl.return_mileage,
          r.user_id, r.vehicle_id, r.status AS reservation_status,
          u.username,
          v.model AS vehicle_model,
          l.city AS location_city, l.address AS location_address
        FROM 
          return_log rl
        INNER JOIN 
          reservation r ON rl.reservation_id = r.id
        INNER JOIN 
          "user" u ON r.user_id = u.id
        INNER JOIN 
          vehicle v ON r.vehicle_id = v.id
        INNER JOIN 
          location l ON rl.location_id = l.id
        WHERE 
          rl.reservation_id = $1
        ORDER BY 
          rl.return_date DESC
      `, [reservationId]);
      return returnLogs;
    } catch (error) {
      console.error(`Erreur lors de la récupération des logs de retour pour la réservation ${reservationId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un log de retour spécifique avec détails
   */
  async getById(id: number): Promise<ReturnLogWithDetails | null> {
    try {
      const returnLog = await databasePostgresql.oneOrNone(`
        SELECT 
          rl.id, rl.reservation_id, rl.return_date, rl.location_id, rl.condition, rl.return_mileage,
          r.user_id, r.vehicle_id, r.status AS reservation_status,
          u.username,
          v.model AS vehicle_model,
          l.city AS location_city, l.address AS location_address
        FROM 
          return_log rl
        INNER JOIN 
          reservation r ON rl.reservation_id = r.id
        INNER JOIN 
          "user" u ON r.user_id = u.id
        INNER JOIN 
          vehicle v ON r.vehicle_id = v.id
        INNER JOIN 
          location l ON rl.location_id = l.id
        WHERE 
          rl.id = $1
      `, [id]);
      
      return returnLog;
    } catch (error) {
      console.error(`Erreur lors de la récupération du log de retour id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau log de retour et met à jour la réservation et le véhicule
   */
  async create(returnLogData: ReturnLog): Promise<ReturnLogWithDetails> {
    try {
      return await databasePostgresql.tx(async t => {
        // Récupérer les informations de la réservation
        const reservation = await t.one(`
          SELECT r.*, v.mileage as current_mileage
          FROM reservation r
          JOIN vehicle v ON r.vehicle_id = v.id
          WHERE r.id = $1
        `, [returnLogData.reservation_id]);

        if (reservation.status === 'completed' || reservation.status === 'canceled') {
          throw new Error(`La réservation id=${returnLogData.reservation_id} est déjà terminée ou annulée.`);
        }

        // Utiliser la date actuelle si non fournie
        const returnDate = returnLogData.return_date || new Date();

        // Créer le log de retour
        const newReturnLog = await t.one(`
          INSERT INTO return_log (
            id, reservation_id, return_date, location_id, condition, return_mileage
          ) VALUES (
            COALESCE($1, nextval('return_log_id_seq')), $2, $3, $4, $5, $6
          )
          RETURNING id, reservation_id, return_date, location_id, condition, return_mileage
        `, [
          returnLogData.id || null,
          returnLogData.reservation_id,
          returnDate,
          returnLogData.location_id,
          returnLogData.condition || 'good',
          returnLogData.return_mileage || reservation.current_mileage
        ]);

        // Mettre à jour la réservation comme complétée
        await t.none(`
          UPDATE reservation
          SET status = 'completed', actual_end_date = $1
          WHERE id = $2
        `, [returnDate, returnLogData.reservation_id]);

        // Mettre à jour la disponibilité et le kilométrage du véhicule
        await t.none(`
          UPDATE vehicle
          SET available = TRUE, mileage = $1
          WHERE id = $2
        `, [returnLogData.return_mileage || reservation.current_mileage, reservation.vehicle_id]);

        // Récupérer les détails complets pour le retour
        const returnLogWithDetails = await t.one(`
          SELECT 
            rl.id, rl.reservation_id, rl.return_date, rl.location_id, rl.condition, rl.return_mileage,
            r.user_id, r.vehicle_id, r.status AS reservation_status,
            u.username,
            v.model AS vehicle_model,
            l.city AS location_city, l.address AS location_address
          FROM 
            return_log rl
          INNER JOIN 
            reservation r ON rl.reservation_id = r.id
          INNER JOIN 
            "user" u ON r.user_id = u.id
          INNER JOIN 
            vehicle v ON r.vehicle_id = v.id
          INNER JOIN 
            location l ON rl.location_id = l.id
          WHERE 
            rl.id = $1
        `, [newReturnLog.id]);
        
        return returnLogWithDetails;
      });
    } catch (error) {
      console.error("Erreur lors de la création du log de retour:", error);
      throw error;
    }
  },

  /**
   * Met à jour un log de retour existant
   */
  async update(id: number, returnLogData: ReturnLogUpdate): Promise<ReturnLogWithDetails | null> {
    try {
      // Vérifier si le log existe
      const existingLog = await databasePostgresql.oneOrNone('SELECT * FROM return_log WHERE id = $1', [id]);
      if (!existingLog) {
        return null;
      }

      return await databasePostgresql.tx(async t => {
        // Préparer les champs à mettre à jour
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (returnLogData.reservation_id !== undefined) {
          updateFields.push(`reservation_id = $${paramCount}`);
          updateValues.push(returnLogData.reservation_id);
          paramCount++;
        }

        if (returnLogData.return_date !== undefined) {
          updateFields.push(`return_date = $${paramCount}`);
          updateValues.push(returnLogData.return_date);
          paramCount++;
        }

        if (returnLogData.location_id !== undefined) {
          updateFields.push(`location_id = $${paramCount}`);
          updateValues.push(returnLogData.location_id);
          paramCount++;
        }

        if (returnLogData.condition !== undefined) {
          updateFields.push(`condition = $${paramCount}`);
          updateValues.push(returnLogData.condition);
          paramCount++;
        }

        if (returnLogData.return_mileage !== undefined) {
          updateFields.push(`return_mileage = $${paramCount}`);
          updateValues.push(returnLogData.return_mileage);
          paramCount++;
        }

        // Si aucun champ à mettre à jour, retourner le log existant avec détails
        if (updateFields.length === 0) {
          return await t.oneOrNone(`
            SELECT 
              rl.id, rl.reservation_id, rl.return_date, rl.location_id, rl.condition, rl.return_mileage,
              r.user_id, r.vehicle_id, r.status AS reservation_status,
              u.username,
              v.model AS vehicle_model,
              l.city AS location_city, l.address AS location_address
            FROM 
              return_log rl
            INNER JOIN 
              reservation r ON rl.reservation_id = r.id
            INNER JOIN 
              "user" u ON r.user_id = u.id
            INNER JOIN 
              vehicle v ON r.vehicle_id = v.id
            INNER JOIN 
              location l ON rl.location_id = l.id
            WHERE 
              rl.id = $1
          `, [id]);
        }

        // Ajouter l'ID à la fin des valeurs pour la clause WHERE
        updateValues.push(id);

        // Construire et exécuter la requête SQL
        await t.none(`
          UPDATE return_log 
          SET ${updateFields.join(', ')} 
          WHERE id = $${paramCount}
        `, updateValues);

        // Si le kilométrage est mis à jour, mettre également à jour le kilométrage du véhicule
        if (returnLogData.return_mileage !== undefined) {
          // Récupérer l'ID du véhicule à partir de la réservation
          const reservationId = returnLogData.reservation_id || existingLog.reservation_id;
          const reservation = await t.one(`
            SELECT vehicle_id FROM reservation WHERE id = $1
          `, [reservationId]);

          // Mettre à jour le kilométrage du véhicule
          await t.none(`
            UPDATE vehicle
            SET mileage = $1
            WHERE id = $2
          `, [returnLogData.return_mileage, reservation.vehicle_id]);
        }

        // Récupérer le log mis à jour avec détails
        const updatedReturnLog = await t.oneOrNone(`
          SELECT 
            rl.id, rl.reservation_id, rl.return_date, rl.location_id, rl.condition, rl.return_mileage,
            r.user_id, r.vehicle_id, r.status AS reservation_status,
            u.username,
            v.model AS vehicle_model,
            l.city AS location_city, l.address AS location_address
          FROM 
            return_log rl
          INNER JOIN 
            reservation r ON rl.reservation_id = r.id
          INNER JOIN 
            "user" u ON r.user_id = u.id
          INNER JOIN 
            vehicle v ON r.vehicle_id = v.id
          INNER JOIN 
            location l ON rl.location_id = l.id
          WHERE 
            rl.id = $1
        `, [id]);

        return updatedReturnLog;
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du log de retour id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un log de retour
   */
  async delete(id: number): Promise<boolean> {
    try {
      return await databasePostgresql.tx(async t => {
        // Récupérer le log pour obtenir les informations de réservation
        const returnLog = await t.oneOrNone(`
          SELECT rl.*, r.vehicle_id 
          FROM return_log rl
          JOIN reservation r ON rl.reservation_id = r.id
          WHERE rl.id = $1
        `, [id]);
        
        if (!returnLog) {
          return false;
        }

        // Supprimer le log
        await t.none('DELETE FROM return_log WHERE id = $1', [id]);
        
        // Mettre à jour la réservation pour la remettre en cours
        await t.none(`
          UPDATE reservation
          SET status = 'in_progress', actual_end_date = NULL
          WHERE id = $1
        `, [returnLog.reservation_id]);

        // Rendre le véhicule non disponible à nouveau
        await t.none(`
          UPDATE vehicle
          SET available = FALSE
          WHERE id = $1
        `, [returnLog.vehicle_id]);
        
        return true;
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression du log de retour id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si une réservation existe et n'est pas déjà terminée ou annulée
   */
  async validateReservation(reservationId: number): Promise<{ 
    valid: boolean, 
    status?: string,
    vehicleId?: number,
    userId?: number
  }> {
    try {
      const reservation = await databasePostgresql.oneOrNone(`
        SELECT id, status, vehicle_id, user_id
        FROM reservation
        WHERE id = $1
      `, [reservationId]);
      
      if (!reservation) {
        return { valid: false };
      }
      
      return { 
        valid: true, 
        status: reservation.status,
        vehicleId: reservation.vehicle_id,
        userId: reservation.user_id
      };
    } catch (error) {
      console.error(`Erreur lors de la validation de la réservation ${reservationId}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un emplacement existe
   */
  async validateLocation(locationId: number): Promise<boolean> {
    try {
      const location = await databasePostgresql.oneOrNone(`
        SELECT id FROM location WHERE id = $1
      `, [locationId]);
      
      return location !== null;
    } catch (error) {
      console.error(`Erreur lors de la validation de l'emplacement ${locationId}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un utilisateur a l'autorisation d'accéder à un log de retour
   */
  async canUserAccessReturnLog(userId: number, returnLogId: number, isAdmin: boolean): Promise<boolean> {
    try {
      // Les administrateurs peuvent toujours accéder à tous les logs
      if (isAdmin) {
        return true;
      }
      
      // Pour les utilisateurs réguliers, vérifier qu'ils sont liés à la réservation
      const returnLog = await databasePostgresql.oneOrNone(`
        SELECT rl.id, r.user_id
        FROM return_log rl
        JOIN reservation r ON rl.reservation_id = r.id
        WHERE rl.id = $1
      `, [returnLogId]);
      
      return returnLog !== null && returnLog.user_id === userId;
    } catch (error) {
      console.error(`Erreur lors de la vérification des droits d'accès au log de retour:`, error);
      throw error;
    }
  }
};

export default returnLogsModel;
