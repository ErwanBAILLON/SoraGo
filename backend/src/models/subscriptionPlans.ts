import databasePostgresql from "../db";

// Interface pour représenter un plan d'abonnement
export interface SubscriptionPlan {
  id?: number;
  name: string;
  price: number;
}

// Interface pour les mises à jour de plans d'abonnement
export interface SubscriptionPlanUpdate {
  name?: string;
  price?: number;
}

// Interface pour représenter un véhicule associé à un plan
export interface PlanVehicle {
  id?: number;
  plan_id: number;
  vehicle_type: 'car' | 'motorcycle' | 'boat';
  category?: 'sedan' | 'suv' | 'no_license' | 'city_car' | 'coupe' | null;
}

// Interface pour représenter un plan d'abonnement avec ses véhicules associés
export interface SubscriptionPlanWithVehicles extends SubscriptionPlan {
  vehicles: PlanVehicle[];
}

const subscriptionPlansModel = {
  /**
   * Récupère tous les plans d'abonnement avec leurs véhicules associés
   */
  async getAll(): Promise<SubscriptionPlanWithVehicles[]> {
    try {
      // Récupérer tous les plans
      const plans = await databasePostgresql.manyOrNone(`
        SELECT id, name, price
        FROM subscription_plan
        ORDER BY price
      `);

      // Pour chaque plan, récupérer les véhicules associés
      const plansWithVehicles: SubscriptionPlanWithVehicles[] = [];
      
      for (const plan of plans) {
        const vehicles = await databasePostgresql.manyOrNone(`
          SELECT id, plan_id, vehicle_type, category
          FROM plan_vehicle
          WHERE plan_id = $1
        `, [plan.id]);
        
        plansWithVehicles.push({
          ...plan,
          vehicles
        });
      }
      
      return plansWithVehicles;
    } catch (error) {
      console.error('Erreur lors de la récupération des plans d\'abonnement:', error);
      throw error;
    }
  },

  /**
   * Récupère un plan d'abonnement spécifique avec ses véhicules associés
   */
  async getById(id: number): Promise<SubscriptionPlanWithVehicles | null> {
    try {
      // Récupérer le plan
      const plan = await databasePostgresql.oneOrNone(`
        SELECT id, name, price
        FROM subscription_plan
        WHERE id = $1
      `, [id]);
      
      if (!plan) {
        return null;
      }
      
      // Récupérer les véhicules associés au plan
      const vehicles = await databasePostgresql.manyOrNone(`
        SELECT id, plan_id, vehicle_type, category
        FROM plan_vehicle
        WHERE plan_id = $1
      `, [id]);
      
      return {
        ...plan,
        vehicles
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du plan d'abonnement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau plan d'abonnement avec ses véhicules associés
   */
  async create(
    planData: SubscriptionPlan, 
    vehiclesData: Omit<PlanVehicle, 'plan_id' | 'id'>[]
  ): Promise<SubscriptionPlanWithVehicles> {
    try {
      return await databasePostgresql.tx(async t => {
        // Créer le plan
        const newPlan = await t.one(`
          INSERT INTO subscription_plan (id, name, price)
          VALUES (COALESCE($1, nextval('subscription_plan_id_seq')), $2, $3)
          RETURNING id, name, price
        `, [planData.id || null, planData.name, planData.price]);
        
        // Créer les associations de véhicules
        const vehicles: PlanVehicle[] = [];
        for (const vehicle of vehiclesData) {
          const newVehicle = await t.one(`
            INSERT INTO plan_vehicle (id, plan_id, vehicle_type, category)
            VALUES (nextval('plan_vehicle_id_seq'), $1, $2, $3)
            RETURNING id, plan_id, vehicle_type, category
          `, [newPlan.id, vehicle.vehicle_type, vehicle.category || null]);
          
          vehicles.push(newVehicle);
        }
        
        return {
          ...newPlan,
          vehicles
        };
      });
    } catch (error) {
      console.error("Erreur lors de la création du plan d'abonnement:", error);
      throw error;
    }
  },

  /**
   * Met à jour un plan d'abonnement existant
   */
  async update(
    id: number, 
    planData: SubscriptionPlanUpdate,
    vehiclesData?: Omit<PlanVehicle, 'plan_id' | 'id'>[]
  ): Promise<SubscriptionPlanWithVehicles | null> {
    try {
      // Vérifier si le plan existe
      const existingPlan = await databasePostgresql.oneOrNone('SELECT * FROM subscription_plan WHERE id = $1', [id]);
      if (!existingPlan) {
        return null;
      }

      return await databasePostgresql.tx(async t => {
        // Préparer les champs à mettre à jour pour le plan
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (planData.name !== undefined) {
          updateFields.push(`name = $${paramCount}`);
          updateValues.push(planData.name);
          paramCount++;
        }

        if (planData.price !== undefined) {
          updateFields.push(`price = $${paramCount}`);
          updateValues.push(planData.price);
          paramCount++;
        }

        // Si aucun champ à mettre à jour, utiliser le plan existant
        let updatedPlan = existingPlan;
        
        // Si des champs sont à mettre à jour
        if (updateFields.length > 0) {
          // Ajouter l'ID à la fin des valeurs pour la clause WHERE
          updateValues.push(id);

          // Construire et exécuter la requête SQL
          updatedPlan = await t.one(`
            UPDATE subscription_plan 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING id, name, price
          `, updateValues);
        }

        // Si des véhicules sont fournis, mettre à jour les associations
        if (vehiclesData) {
          // Supprimer les associations existantes
          await t.none('DELETE FROM plan_vehicle WHERE plan_id = $1', [id]);
          
          // Créer les nouvelles associations
          const vehicles: PlanVehicle[] = [];
          for (const vehicle of vehiclesData) {
            const newVehicle = await t.one(`
              INSERT INTO plan_vehicle (id, plan_id, vehicle_type, category)
              VALUES (nextval('plan_vehicle_id_seq'), $1, $2, $3)
              RETURNING id, plan_id, vehicle_type, category
            `, [id, vehicle.vehicle_type, vehicle.category || null]);
            
            vehicles.push(newVehicle);
          }
          
          return {
            ...updatedPlan,
            vehicles
          };
        } else {
          // Si aucun véhicule n'est fourni, récupérer les véhicules existants
          const vehicles = await t.manyOrNone(`
            SELECT id, plan_id, vehicle_type, category
            FROM plan_vehicle
            WHERE plan_id = $1
          `, [id]);
          
          return {
            ...updatedPlan,
            vehicles
          };
        }
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du plan d'abonnement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un plan d'abonnement
   */
  async delete(id: number): Promise<boolean> {
    try {
      return await databasePostgresql.tx(async t => {
        // Vérifier si le plan est utilisé dans des abonnements
        const subscriptionReferences = await t.oneOrNone(
          `SELECT COUNT(*) FROM subscription WHERE plan_id = $1`,
          [id]
        );

        if (subscriptionReferences && parseInt(subscriptionReferences.count) > 0) {
          throw new Error(`Le plan d'abonnement id=${id} est utilisé par des abonnements actifs et ne peut pas être supprimé.`);
        }

        // Supprimer les associations de véhicules
        await t.none('DELETE FROM plan_vehicle WHERE plan_id = $1', [id]);
        
        // Supprimer le plan
        const result = await t.result('DELETE FROM subscription_plan WHERE id = $1', [id]);
        
        // Renvoie true si au moins une ligne a été supprimée
        return result.rowCount > 0;
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression du plan d'abonnement id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un plan d'abonnement existe avec le même nom
   */
  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const query = excludeId 
        ? `SELECT COUNT(*) FROM subscription_plan WHERE name ILIKE $1 AND id != $2`
        : `SELECT COUNT(*) FROM subscription_plan WHERE name ILIKE $1`;
      
      const params = excludeId ? [name, excludeId] : [name];
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification du nom de plan ${name}:`, error);
      throw error;
    }
  }
};

export default subscriptionPlansModel;
