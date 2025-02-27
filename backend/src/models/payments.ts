import databasePostgresql from "../db";

// Types pour le statut de paiement et la méthode (correspondant aux enum dans la base de données)
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'paypal' | 'bank_transfer';

// Interface pour représenter un paiement
export interface Payment {
  id?: number;
  user_id: number;
  amount: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  subscription_id?: number | null;
  reservation_id?: number | null;
  created_at?: Date;
}

// Interface pour les mises à jour de paiement
export interface PaymentUpdate {
  amount?: number;
  method?: PaymentMethod;
  status?: PaymentStatus;
  subscription_id?: number | null;
  reservation_id?: number | null;
}

// Interface pour un paiement avec détails
export interface PaymentWithDetails extends Payment {
  username?: string;
  email?: string;
  reservation_status?: string;
  vehicle_model?: string;
  subscription_plan_name?: string;
}

const paymentsModel = {
  /**
   * Récupère tous les paiements avec détails
   */
  async getAll(): Promise<PaymentWithDetails[]> {
    try {
      const payments = await databasePostgresql.manyOrNone(`
        SELECT 
          p.id, p.user_id, p.amount, p.method, p.status, 
          p.subscription_id, p.reservation_id, p.created_at,
          u.username, u.email,
          r.status as reservation_status,
          v.model as vehicle_model,
          sp.name as subscription_plan_name
        FROM 
          payment p
        INNER JOIN 
          "user" u ON p.user_id = u.id
        LEFT JOIN 
          reservation r ON p.reservation_id = r.id
        LEFT JOIN 
          vehicle v ON r.vehicle_id = v.id
        LEFT JOIN 
          subscription s ON p.subscription_id = s.id
        LEFT JOIN 
          subscription_plan sp ON s.plan_id = sp.id
        ORDER BY 
          p.created_at DESC
      `);
      return payments;
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
      throw error;
    }
  },

  /**
   * Récupère les paiements d'un utilisateur spécifique
   */
  async getByUserId(userId: number): Promise<PaymentWithDetails[]> {
    try {
      const payments = await databasePostgresql.manyOrNone(`
        SELECT 
          p.id, p.user_id, p.amount, p.method, p.status, 
          p.subscription_id, p.reservation_id, p.created_at,
          u.username, u.email,
          r.status as reservation_status,
          v.model as vehicle_model,
          sp.name as subscription_plan_name
        FROM 
          payment p
        INNER JOIN 
          "user" u ON p.user_id = u.id
        LEFT JOIN 
          reservation r ON p.reservation_id = r.id
        LEFT JOIN 
          vehicle v ON r.vehicle_id = v.id
        LEFT JOIN 
          subscription s ON p.subscription_id = s.id
        LEFT JOIN 
          subscription_plan sp ON s.plan_id = sp.id
        WHERE 
          p.user_id = $1
        ORDER BY 
          p.created_at DESC
      `, [userId]);
      return payments;
    } catch (error) {
      console.error(`Erreur lors de la récupération des paiements de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un paiement spécifique avec détails
   */
  async getById(id: number): Promise<PaymentWithDetails | null> {
    try {
      const payment = await databasePostgresql.oneOrNone(`
        SELECT 
          p.id, p.user_id, p.amount, p.method, p.status, 
          p.subscription_id, p.reservation_id, p.created_at,
          u.username, u.email,
          r.status as reservation_status,
          v.model as vehicle_model,
          sp.name as subscription_plan_name
        FROM 
          payment p
        INNER JOIN 
          "user" u ON p.user_id = u.id
        LEFT JOIN 
          reservation r ON p.reservation_id = r.id
        LEFT JOIN 
          vehicle v ON r.vehicle_id = v.id
        LEFT JOIN 
          subscription s ON p.subscription_id = s.id
        LEFT JOIN 
          subscription_plan sp ON s.plan_id = sp.id
        WHERE 
          p.id = $1
      `, [id]);
      
      return payment;
    } catch (error) {
      console.error(`Erreur lors de la récupération du paiement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau paiement
   */
  async create(paymentData: Payment): Promise<Payment> {
    try {
      return await databasePostgresql.tx(async t => {
        // S'assurer qu'un seul type de référence est fourni (réservation ou abonnement)
        if (paymentData.subscription_id && paymentData.reservation_id) {
          throw new Error("Un paiement ne peut pas être associé à la fois à un abonnement et à une réservation");
        }
        
        // Si une réservation est associée, mettre à jour son statut si le paiement est complété
        if (paymentData.reservation_id && paymentData.status === 'completed') {
          const reservation = await t.oneOrNone(`
            SELECT status FROM reservation WHERE id = $1
          `, [paymentData.reservation_id]);
          
          if (!reservation) {
            throw new Error(`Réservation id=${paymentData.reservation_id} non trouvée`);
          }
          
          if (reservation.status === 'pending') {
            // Confirmer la réservation si le paiement est complété
            await t.none(`
              UPDATE reservation
              SET status = 'confirmed'
              WHERE id = $1
            `, [paymentData.reservation_id]);
          }
        }

        // Créer le paiement
        const newPayment = await t.one(`
          INSERT INTO payment (
            id, user_id, amount, method, status, subscription_id, reservation_id, created_at
          ) VALUES (
            COALESCE($1, nextval('payment_id_seq')), $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP
          )
          RETURNING id, user_id, amount, method, status, subscription_id, reservation_id, created_at
        `, [
          paymentData.id || null,
          paymentData.user_id,
          paymentData.amount,
          paymentData.method,
          paymentData.status || 'pending',
          paymentData.subscription_id || null,
          paymentData.reservation_id || null
        ]);
        
        return newPayment;
      });
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      throw error;
    }
  },

  /**
   * Met à jour un paiement existant
   */
  async update(id: number, paymentData: PaymentUpdate): Promise<Payment | null> {
    try {
      // Vérifier si le paiement existe
      const existingPayment = await databasePostgresql.oneOrNone('SELECT * FROM payment WHERE id = $1', [id]);
      if (!existingPayment) {
        return null;
      }

      return await databasePostgresql.tx(async t => {
        // Préparer les champs à mettre à jour
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (paymentData.amount !== undefined) {
          updateFields.push(`amount = $${paramCount}`);
          updateValues.push(paymentData.amount);
          paramCount++;
        }

        if (paymentData.method !== undefined) {
          updateFields.push(`method = $${paramCount}`);
          updateValues.push(paymentData.method);
          paramCount++;
        }

        if (paymentData.status !== undefined) {
          updateFields.push(`status = $${paramCount}`);
          updateValues.push(paymentData.status);
          paramCount++;
        }

        if (paymentData.subscription_id !== undefined) {
          updateFields.push(`subscription_id = $${paramCount}`);
          updateValues.push(paymentData.subscription_id);
          paramCount++;
        }

        if (paymentData.reservation_id !== undefined) {
          updateFields.push(`reservation_id = $${paramCount}`);
          updateValues.push(paymentData.reservation_id);
          paramCount++;
        }

        // Si aucun champ à mettre à jour, retourner le paiement existant
        if (updateFields.length === 0) {
          return existingPayment;
        }

        // Vérifier qu'on ne met pas à la fois un abonnement et une réservation
        const newSubscription = 
          paymentData.subscription_id !== undefined ? 
          paymentData.subscription_id : 
          existingPayment.subscription_id;
          
        const newReservation = 
          paymentData.reservation_id !== undefined ? 
          paymentData.reservation_id : 
          existingPayment.reservation_id;
          
        if (newSubscription && newReservation) {
          throw new Error("Un paiement ne peut pas être associé à la fois à un abonnement et à une réservation");
        }

        // Si le statut change à "completed" et qu'il y a une réservation associée
        if (paymentData.status === 'completed' && (paymentData.reservation_id || existingPayment.reservation_id)) {
          const reservationId = paymentData.reservation_id || existingPayment.reservation_id;
          const reservation = await t.oneOrNone(`
            SELECT status FROM reservation WHERE id = $1
          `, [reservationId]);
          
          if (reservation && reservation.status === 'pending') {
            // Confirmer la réservation
            await t.none(`
              UPDATE reservation
              SET status = 'confirmed'
              WHERE id = $1
            `, [reservationId]);
          }
        }

        // Ajouter l'ID à la fin des valeurs pour la clause WHERE
        updateValues.push(id);

        // Construire et exécuter la requête SQL
        const updatedPayment = await t.one(`
          UPDATE payment 
          SET ${updateFields.join(', ')} 
          WHERE id = $${paramCount}
          RETURNING id, user_id, amount, method, status, subscription_id, reservation_id, created_at
        `, updateValues);

        return updatedPayment;
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du paiement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un paiement ou le marque comme remboursé
   */
  async delete(id: number, forceDelete: boolean = false): Promise<boolean> {
    try {
      return await databasePostgresql.tx(async t => {
        // Récupérer le paiement actuel
        const payment = await t.oneOrNone('SELECT * FROM payment WHERE id = $1', [id]);
        
        if (!payment) {
          return false;
        }
        
        if (payment.status === 'completed' && !forceDelete) {
          // Si le paiement est complété, le marquer comme remboursé plutôt que de le supprimer
          await t.none(`
            UPDATE payment
            SET status = 'refunded'
            WHERE id = $1
          `, [id]);
          
          return true;
        } else if (forceDelete) {
          // Supprimer complètement le paiement si forceDelete est true
          // (normalement réservé aux administrateurs)
          const result = await t.result('DELETE FROM payment WHERE id = $1', [id]);
          return result.rowCount > 0;
        } else {
          // Pour les paiements en attente ou échoués, les marquer comme échoués ou les supprimer
          if (payment.status === 'pending') {
            await t.none(`
              UPDATE payment
              SET status = 'failed'
              WHERE id = $1
            `, [id]);
          } else {
            // Pour les paiements déjà marqués comme échoués, les supprimer
            await t.none(`DELETE FROM payment WHERE id = $1`, [id]);
          }
          return true;
        }
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression/annulation du paiement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si l'utilisateur et les références (réservation ou abonnement) existent
   */
  async validateReferences(userId: number, reservationId?: number, subscriptionId?: number): Promise<{ 
    userValid: boolean, 
    reservationValid: boolean | null, 
    subscriptionValid: boolean | null,
    reservationUserId?: number,
    subscriptionUserId?: number
  }> {
    try {
      // Vérifier l'utilisateur
      const user = await databasePostgresql.oneOrNone('SELECT id FROM "user" WHERE id = $1', [userId]);
      const userValid = user !== null;
      
      // Variables pour stocker les résultats
      let reservationValid = null;
      let subscriptionValid = null;
      let reservationUserId = undefined;
      let subscriptionUserId = undefined;

      // Vérifier la réservation si fournie
      if (reservationId) {
        const reservation = await databasePostgresql.oneOrNone(
          'SELECT id, user_id FROM reservation WHERE id = $1', 
          [reservationId]
        );
        reservationValid = reservation !== null;
        if (reservation) {
          reservationUserId = reservation.user_id;
        }
      }

      // Vérifier l'abonnement si fourni
      if (subscriptionId) {
        const subscription = await databasePostgresql.oneOrNone(
          'SELECT id, user_id FROM subscription WHERE id = $1', 
          [subscriptionId]
        );
        subscriptionValid = subscription !== null;
        if (subscription) {
          subscriptionUserId = subscription.user_id;
        }
      }
      
      return { 
        userValid, 
        reservationValid, 
        subscriptionValid,
        reservationUserId,
        subscriptionUserId
      };
    } catch (error) {
      console.error('Erreur lors de la validation des références:', error);
      throw error;
    }
  },
  
  /**
   * Vérifie si un utilisateur a l'autorisation d'accéder à un paiement
   */
  async canUserAccessPayment(userId: number, paymentId: number, isAdmin: boolean): Promise<boolean> {
    try {
      // Les administrateurs peuvent toujours accéder à tous les paiements
      if (isAdmin) {
        return true;
      }
      
      // Pour les utilisateurs réguliers, vérifier qu'ils sont propriétaires du paiement
      const payment = await databasePostgresql.oneOrNone(
        'SELECT user_id FROM payment WHERE id = $1',
        [paymentId]
      );
      
      return payment !== null && payment.user_id === userId;
    } catch (error) {
      console.error(`Erreur lors de la vérification des droits d'accès au paiement:`, error);
      throw error;
    }
  }
};

export default paymentsModel;
