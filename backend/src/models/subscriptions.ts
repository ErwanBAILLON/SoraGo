import databasePostgresql from "../db";

// Interface pour représenter un abonnement
export interface Subscription {
  id?: number;
  user_id: number;
  plan_id: number;
  start_date?: Date;
  end_date?: Date;
  archived?: boolean;
}

// Interface pour les mises à jour d'abonnement
export interface SubscriptionUpdate {
  user_id?: number;
  plan_id?: number;
  start_date?: Date;
  end_date?: Date;
  archived?: boolean;
}

// Interface pour un abonnement avec détails
export interface SubscriptionWithDetails extends Subscription {
  username?: string;
  user_email?: string;
  plan_name?: string;
  plan_price?: number;
}

const subscriptionsModel = {
  /**
   * Récupère tous les abonnements avec détails
   */
  async getAll(): Promise<SubscriptionWithDetails[]> {
    try {
      const subscriptions = await databasePostgresql.manyOrNone(`
        SELECT 
          s.id, s.user_id, s.plan_id, s.start_date, s.end_date, s.archived,
          u.username, u.email AS user_email,
          sp.name AS plan_name, sp.price AS plan_price
        FROM 
          subscription s
        INNER JOIN 
          "user" u ON s.user_id = u.id
        INNER JOIN 
          subscription_plan sp ON s.plan_id = sp.id
        ORDER BY 
          s.start_date DESC
      `);
      return subscriptions;
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnements:', error);
      throw error;
    }
  },

  /**
   * Récupère les abonnements d'un utilisateur spécifique
   */
  async getByUserId(userId: number): Promise<SubscriptionWithDetails[]> {
    try {
      const subscriptions = await databasePostgresql.manyOrNone(`
        SELECT 
          s.id, s.user_id, s.plan_id, s.start_date, s.end_date, s.archived,
          u.username, u.email AS user_email,
          sp.name AS plan_name, sp.price AS plan_price
        FROM 
          subscription s
        INNER JOIN 
          "user" u ON s.user_id = u.id
        INNER JOIN 
          subscription_plan sp ON s.plan_id = sp.id
        WHERE 
          s.user_id = $1
        ORDER BY 
          s.start_date DESC
      `, [userId]);
      return subscriptions;
    } catch (error) {
      console.error(`Erreur lors de la récupération des abonnements de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère un abonnement spécifique avec détails
   */
  async getById(id: number): Promise<SubscriptionWithDetails | null> {
    try {
      const subscription = await databasePostgresql.oneOrNone(`
        SELECT 
          s.id, s.user_id, s.plan_id, s.start_date, s.end_date, s.archived,
          u.username, u.email AS user_email,
          sp.name AS plan_name, sp.price AS plan_price
        FROM 
          subscription s
        INNER JOIN 
          "user" u ON s.user_id = u.id
        INNER JOIN 
          subscription_plan sp ON s.plan_id = sp.id
        WHERE 
          s.id = $1
      `, [id]);
      
      return subscription;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'abonnement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un utilisateur a un abonnement actif non archivé
   */
  async hasActiveSubscription(userId: number): Promise<boolean> {
    try {
      const result = await databasePostgresql.oneOrNone(`
        SELECT COUNT(*) 
        FROM subscription 
        WHERE user_id = $1 
          AND archived = FALSE 
          AND end_date > now()
      `, [userId]);
      
      return parseInt(result?.count || '0') > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification d'abonnement actif pour l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel abonnement
   */
  async create(subscriptionData: Subscription): Promise<Subscription> {
    try {
      // Calculer la date de fin en fonction de la date de début (par défaut un mois)
      const startDate = subscriptionData.start_date || new Date();
      const endDate = subscriptionData.end_date || new Date(startDate);
      
      // Si aucune date de fin n'est spécifiée, ajouter un mois par défaut
      if (!subscriptionData.end_date) {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const newSubscription = await databasePostgresql.one(`
        INSERT INTO subscription (id, user_id, plan_id, start_date, end_date, archived)
        VALUES (COALESCE($1, nextval('subscription_id_seq')), $2, $3, $4, $5, $6)
        RETURNING id, user_id, plan_id, start_date, end_date, archived
      `, [
        subscriptionData.id || null, 
        subscriptionData.user_id, 
        subscriptionData.plan_id, 
        startDate, 
        endDate, 
        subscriptionData.archived || false
      ]);
      
      return newSubscription;
    } catch (error) {
      console.error("Erreur lors de la création de l'abonnement:", error);
      throw error;
    }
  },

  /**
   * Met à jour un abonnement existant
   */
  async update(id: number, subscriptionData: SubscriptionUpdate): Promise<Subscription | null> {
    try {
      // Vérifier si l'abonnement existe
      const existingSubscription = await databasePostgresql.oneOrNone('SELECT * FROM subscription WHERE id = $1', [id]);
      if (!existingSubscription) {
        return null;
      }

      // Préparer les champs à mettre à jour
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (subscriptionData.user_id !== undefined) {
        updateFields.push(`user_id = $${paramCount}`);
        updateValues.push(subscriptionData.user_id);
        paramCount++;
      }

      if (subscriptionData.plan_id !== undefined) {
        updateFields.push(`plan_id = $${paramCount}`);
        updateValues.push(subscriptionData.plan_id);
        paramCount++;
      }

      if (subscriptionData.start_date !== undefined) {
        updateFields.push(`start_date = $${paramCount}`);
        updateValues.push(subscriptionData.start_date);
        paramCount++;
      }

      if (subscriptionData.end_date !== undefined) {
        updateFields.push(`end_date = $${paramCount}`);
        updateValues.push(subscriptionData.end_date);
        paramCount++;
      }

      if (subscriptionData.archived !== undefined) {
        updateFields.push(`archived = $${paramCount}`);
        updateValues.push(subscriptionData.archived);
        paramCount++;
      }

      // Si aucun champ à mettre à jour, retourner l'abonnement existant
      if (updateFields.length === 0) {
        return existingSubscription;
      }

      // Ajouter l'ID à la fin des valeurs pour la clause WHERE
      updateValues.push(id);

      // Construire et exécuter la requête SQL
      const updatedSubscription = await databasePostgresql.one(`
        UPDATE subscription 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING id, user_id, plan_id, start_date, end_date, archived
      `, updateValues);

      return updatedSubscription;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'abonnement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Archive un abonnement (alternative à la suppression)
   */
  async archive(id: number): Promise<Subscription | null> {
    try {
      const archivedSubscription = await databasePostgresql.oneOrNone(`
        UPDATE subscription
        SET archived = TRUE
        WHERE id = $1
        RETURNING id, user_id, plan_id, start_date, end_date, archived
      `, [id]);

      return archivedSubscription;
    } catch (error) {
      console.error(`Erreur lors de l'archivage de l'abonnement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un abonnement
   */
  async delete(id: number): Promise<boolean> {
    try {
      return await databasePostgresql.tx(async t => {
        // Vérifier si l'abonnement a des paiements associés
        const paymentReferences = await t.oneOrNone(
          `SELECT COUNT(*) FROM payment WHERE subscription_id = $1`,
          [id]
        );

        if (paymentReferences && parseInt(paymentReferences.count) > 0) {
          // Si des paiements existent, archiver plutôt que supprimer
          await t.none(`
            UPDATE subscription
            SET archived = TRUE
            WHERE id = $1
          `, [id]);
          
          return true;
        } else {
          // Si aucun paiement, supprimer complètement
          const result = await t.result('DELETE FROM subscription WHERE id = $1', [id]);
          return result.rowCount > 0;
        }
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'abonnement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si l'utilisateur et le plan existent
   */
  async validateReferences(userId: number, planId: number): Promise<{ userValid: boolean, planValid: boolean }> {
    try {
      const user = await databasePostgresql.oneOrNone('SELECT id FROM "user" WHERE id = $1', [userId]);
      const plan = await databasePostgresql.oneOrNone('SELECT id FROM subscription_plan WHERE id = $1', [planId]);
      
      return {
        userValid: user !== null,
        planValid: plan !== null
      };
    } catch (error) {
      console.error('Erreur lors de la validation des références:', error);
      throw error;
    }
  }
};

export default subscriptionsModel;
