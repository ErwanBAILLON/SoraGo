import databasePostgresql from "../db";

// Types pour le statut de réservation (correspond à l'enum reservation_status)
export type ReservationStatus = 'pending' | 'confirmed' | 'canceled' | 'in_progress' | 'completed';

// Interface pour représenter une réservation
export interface Reservation {
  id?: number;
  user_id: number;
  vehicle_id: number;
  start_date: Date;
  expected_end_date: Date;
  actual_end_date?: Date | null;
  status: ReservationStatus;
  created_at?: Date;
}

// Interface pour les mises à jour de réservation
export interface ReservationUpdate {
  vehicle_id?: number;
  start_date?: Date;
  expected_end_date?: Date;
  actual_end_date?: Date | null;
  status?: ReservationStatus;
}

// Interface pour une réservation avec détails
export interface ReservationWithDetails extends Reservation {
  username?: string;
  user_email?: string;
  vehicle_model?: string;
  vehicle_type?: 'car' | 'motorcycle' | 'boat';
  brand_name?: string;
  location_city?: string;
}

const reservationsModel = {
  /**
   * Récupère toutes les réservations avec détails
   */
  async getAll(): Promise<ReservationWithDetails[]> {
    try {
      const reservations = await databasePostgresql.manyOrNone(`
        SELECT 
          r.id, r.user_id, r.vehicle_id, r.start_date, r.expected_end_date, 
          r.actual_end_date, r.status, r.created_at,
          u.username, u.email AS user_email,
          v.model AS vehicle_model, v.type AS vehicle_type,
          b.name AS brand_name,
          l.city AS location_city
        FROM 
          reservation r
        INNER JOIN 
          "user" u ON r.user_id = u.id
        INNER JOIN 
          vehicle v ON r.vehicle_id = v.id
        INNER JOIN 
          brand b ON v.brand_id = b.id
        LEFT JOIN 
          parking p ON v.id = p.vehicle_id
        LEFT JOIN 
          location l ON p.location_id = l.id
        ORDER BY 
          r.start_date DESC
      `);
      return reservations;
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      throw error;
    }
  },

  /**
   * Récupère les réservations d'un utilisateur spécifique
   */
  async getByUserId(userId: number): Promise<ReservationWithDetails[]> {
    try {
      const reservations = await databasePostgresql.manyOrNone(`
        SELECT 
          r.id, r.user_id, r.vehicle_id, r.start_date, r.expected_end_date, 
          r.actual_end_date, r.status, r.created_at,
          u.username, u.email AS user_email,
          v.model AS vehicle_model, v.type AS vehicle_type,
          b.name AS brand_name,
          l.city AS location_city
        FROM 
          reservation r
        INNER JOIN 
          "user" u ON r.user_id = u.id
        INNER JOIN 
          vehicle v ON r.vehicle_id = v.id
        INNER JOIN 
          brand b ON v.brand_id = b.id
        LEFT JOIN 
          parking p ON v.id = p.vehicle_id
        LEFT JOIN 
          location l ON p.location_id = l.id
        WHERE 
          r.user_id = $1
        ORDER BY 
          r.start_date DESC
      `, [userId]);
      return reservations;
    } catch (error) {
      console.error(`Erreur lors de la récupération des réservations de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère une réservation spécifique avec détails
   */
  async getById(id: number): Promise<ReservationWithDetails | null> {
    try {
      const reservation = await databasePostgresql.oneOrNone(`
        SELECT 
          r.id, r.user_id, r.vehicle_id, r.start_date, r.expected_end_date, 
          r.actual_end_date, r.status, r.created_at,
          u.username, u.email AS user_email,
          v.model AS vehicle_model, v.type AS vehicle_type,
          b.name AS brand_name,
          l.city AS location_city
        FROM 
          reservation r
        INNER JOIN 
          "user" u ON r.user_id = u.id
        INNER JOIN 
          vehicle v ON r.vehicle_id = v.id
        INNER JOIN 
          brand b ON v.brand_id = b.id
        LEFT JOIN 
          parking p ON v.id = p.vehicle_id
        LEFT JOIN 
          location l ON p.location_id = l.id
        WHERE 
          r.id = $1
      `, [id]);
      
      return reservation;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la réservation id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un véhicule est disponible pour une période donnée
   */
  async isVehicleAvailable(vehicleId: number, startDate: Date, endDate: Date, excludeReservationId?: number): Promise<boolean> {
    try {
      // Vérifier si le véhicule est marqué comme disponible dans la table vehicle
      const vehicleCheckQuery = `
        SELECT available FROM vehicle WHERE id = $1
      `;
      const vehicleStatus = await databasePostgresql.oneOrNone(vehicleCheckQuery, [vehicleId]);
      
      if (!vehicleStatus || !vehicleStatus.available) {
        return false;
      }
      
      // Vérifier s'il y a des réservations existantes pour ce véhicule pendant la période demandée
      let query = `
        SELECT COUNT(*) 
        FROM reservation 
        WHERE vehicle_id = $1 
          AND status NOT IN ('canceled', 'completed')
          AND NOT (
            expected_end_date < $2 
            OR start_date > $3
          )
      `;
      
      let params = [vehicleId, startDate, endDate];
      
      // Exclure la réservation actuelle en cas de mise à jour
      if (excludeReservationId) {
        query += ` AND id != $4`;
        params.push(excludeReservationId);
      }
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) === 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification de disponibilité du véhicule ${vehicleId}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle réservation
   */
  async create(reservationData: Reservation): Promise<Reservation> {
    try {
      return await databasePostgresql.tx(async t => {
        // Créer la réservation
        const newReservation = await t.one(`
          INSERT INTO reservation (
            id, user_id, vehicle_id, start_date, expected_end_date, 
            actual_end_date, status, created_at
          ) VALUES (
            COALESCE($1, nextval('reservation_id_seq')), $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP
          )
          RETURNING id, user_id, vehicle_id, start_date, expected_end_date, actual_end_date, status, created_at
        `, [
          reservationData.id || null,
          reservationData.user_id,
          reservationData.vehicle_id,
          reservationData.start_date,
          reservationData.expected_end_date,
          reservationData.actual_end_date || null,
          reservationData.status || 'pending'
        ]);

        // Si la réservation est confirmée, mettre à jour la disponibilité du véhicule
        if (reservationData.status === 'confirmed' || reservationData.status === 'in_progress') {
          await t.none(`
            UPDATE vehicle
            SET available = FALSE
            WHERE id = $1
          `, [reservationData.vehicle_id]);
        }
        
        return newReservation;
      });
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      throw error;
    }
  },

  /**
   * Met à jour une réservation existante
   */
  async update(id: number, reservationData: ReservationUpdate): Promise<Reservation | null> {
    try {
      // Vérifier si la réservation existe
      const existingReservation = await databasePostgresql.oneOrNone('SELECT * FROM reservation WHERE id = $1', [id]);
      if (!existingReservation) {
        return null;
      }

      return await databasePostgresql.tx(async t => {
        // Préparer les champs à mettre à jour
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (reservationData.vehicle_id !== undefined) {
          updateFields.push(`vehicle_id = $${paramCount}`);
          updateValues.push(reservationData.vehicle_id);
          paramCount++;
        }

        if (reservationData.start_date !== undefined) {
          updateFields.push(`start_date = $${paramCount}`);
          updateValues.push(reservationData.start_date);
          paramCount++;
        }

        if (reservationData.expected_end_date !== undefined) {
          updateFields.push(`expected_end_date = $${paramCount}`);
          updateValues.push(reservationData.expected_end_date);
          paramCount++;
        }

        if (reservationData.actual_end_date !== undefined) {
          updateFields.push(`actual_end_date = $${paramCount}`);
          updateValues.push(reservationData.actual_end_date);
          paramCount++;
        }

        if (reservationData.status !== undefined) {
          updateFields.push(`status = $${paramCount}`);
          updateValues.push(reservationData.status);
          paramCount++;
        }

        // Si aucun champ à mettre à jour, retourner la réservation existante
        if (updateFields.length === 0) {
          return existingReservation;
        }

        // Ajouter l'ID à la fin des valeurs pour la clause WHERE
        updateValues.push(id);

        // Construire et exécuter la requête SQL
        const updatedReservation = await t.one(`
          UPDATE reservation 
          SET ${updateFields.join(', ')} 
          WHERE id = $${paramCount}
          RETURNING id, user_id, vehicle_id, start_date, expected_end_date, actual_end_date, status, created_at
        `, updateValues);

        // Si le statut passe à "completed" ou "canceled", rendre le véhicule disponible
        if (
          reservationData.status === 'completed' || 
          reservationData.status === 'canceled'
        ) {
          await t.none(`
            UPDATE vehicle
            SET available = TRUE
            WHERE id = $1
          `, [updatedReservation.vehicle_id]);
        }
        // Si le statut passe à "confirmed" ou "in_progress", rendre le véhicule indisponible
        else if (
          reservationData.status === 'confirmed' ||
          reservationData.status === 'in_progress'
        ) {
          await t.none(`
            UPDATE vehicle
            SET available = FALSE
            WHERE id = $1
          `, [updatedReservation.vehicle_id]);
        }

        return updatedReservation;
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la réservation id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime ou annule une réservation
   */
  async delete(id: number, forceDelete: boolean = false): Promise<boolean> {
    try {
      return await databasePostgresql.tx(async t => {
        // Récupérer la réservation actuelle
        const reservation = await t.oneOrNone('SELECT * FROM reservation WHERE id = $1', [id]);
        
        if (!reservation) {
          return false;
        }
        
        if (forceDelete) {
          // Vérifier s'il y a des paiements associés
          const paymentReferences = await t.oneOrNone(
            `SELECT COUNT(*) FROM payment WHERE reservation_id = $1`,
            [id]
          );

          if (paymentReferences && parseInt(paymentReferences.count) > 0) {
            // Si des paiements sont associés, ne pas permettre la suppression forcée
            throw new Error(`La réservation id=${id} a des paiements associés et ne peut pas être supprimée complètement.`);
          }
          
          // Supprimer la réservation
          const result = await t.result('DELETE FROM reservation WHERE id = $1', [id]);
          
          // Mettre à jour la disponibilité du véhicule si nécessaire
          if (result.rowCount > 0 && ['confirmed', 'in_progress'].includes(reservation.status)) {
            await t.none(`
              UPDATE vehicle
              SET available = TRUE
              WHERE id = $1
            `, [reservation.vehicle_id]);
          }
          
          return result.rowCount > 0;
        } else {
          // Mettre à jour le statut à "canceled"
          const result = await t.result(`
            UPDATE reservation
            SET status = 'canceled'
            WHERE id = $1
          `, [id]);
          
          // Mettre à jour la disponibilité du véhicule si nécessaire
          if (result.rowCount > 0 && ['confirmed', 'in_progress'].includes(reservation.status)) {
            await t.none(`
              UPDATE vehicle
              SET available = TRUE
              WHERE id = $1
            `, [reservation.vehicle_id]);
          }
          
          return result.rowCount > 0;
        }
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression/annulation de la réservation id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si l'utilisateur et le véhicule existent
   */
  async validateReferences(userId: number, vehicleId: number): Promise<{ userValid: boolean, vehicleValid: boolean }> {
    try {
      const user = await databasePostgresql.oneOrNone('SELECT id FROM "user" WHERE id = $1', [userId]);
      const vehicle = await databasePostgresql.oneOrNone('SELECT id FROM vehicle WHERE id = $1', [vehicleId]);
      
      return {
        userValid: user !== null,
        vehicleValid: vehicle !== null
      };
    } catch (error) {
      console.error('Erreur lors de la validation des références:', error);
      throw error;
    }
  },
  
  /**
   * Vérifie si un utilisateur a l'autorisation d'accéder à une réservation
   */
  async canUserAccessReservation(userId: number, reservationId: number, isAdmin: boolean): Promise<boolean> {
    try {
      // Les administrateurs peuvent toujours accéder à toutes les réservations
      if (isAdmin) {
        return true;
      }
      
      // Pour les utilisateurs réguliers, vérifier qu'ils sont propriétaires de la réservation
      const reservation = await databasePostgresql.oneOrNone(
        'SELECT user_id FROM reservation WHERE id = $1',
        [reservationId]
      );
      
      return reservation !== null && reservation.user_id === userId;
    } catch (error) {
      console.error(`Erreur lors de la vérification des droits d'accès à la réservation:`, error);
      throw error;
    }
  }
};

export default reservationsModel;
