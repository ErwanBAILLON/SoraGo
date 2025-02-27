import databasePostgresql from "../db";

// Interface pour représenter une association plan/véhicule
export interface PlanVehicle {
  id?: number;
  plan_id: number;
  vehicle_type: 'car' | 'motorcycle' | 'boat';
  category?: 'sedan' | 'suv' | 'no_license' | 'city_car' | 'coupe' | null;
}

// Interface pour les mises à jour d'association plan/véhicule
export interface PlanVehicleUpdate {
  plan_id?: number;
  vehicle_type?: 'car' | 'motorcycle' | 'boat';
  category?: 'sedan' | 'suv' | 'no_license' | 'city_car' | 'coupe' | null;
}

// Interface pour une association plan/véhicule avec détails du plan
export interface PlanVehicleWithDetails extends PlanVehicle {
  plan_name?: string;
  plan_price?: number;
}

const planVehiclesModel = {
  /**
   * Récupère toutes les associations plan/véhicule avec détails
   */
  async getAll(): Promise<PlanVehicleWithDetails[]> {
    try {
      const planVehicles = await databasePostgresql.manyOrNone(`
        SELECT 
          pv.id, pv.plan_id, pv.vehicle_type, pv.category,
          sp.name AS plan_name, sp.price AS plan_price
        FROM 
          plan_vehicle pv
        INNER JOIN 
          subscription_plan sp ON pv.plan_id = sp.id
        ORDER BY 
          pv.id
      `);
      return planVehicles;
    } catch (error) {
      console.error('Erreur lors de la récupération des associations plan/véhicule:', error);
      throw error;
    }
  },

  /**
   * Récupère les associations plan/véhicule pour un plan spécifique
   */
  async getByPlanId(planId: number): Promise<PlanVehicleWithDetails[]> {
    try {
      const planVehicles = await databasePostgresql.manyOrNone(`
        SELECT 
          pv.id, pv.plan_id, pv.vehicle_type, pv.category,
          sp.name AS plan_name, sp.price AS plan_price
        FROM 
          plan_vehicle pv
        INNER JOIN 
          subscription_plan sp ON pv.plan_id = sp.id
        WHERE 
          pv.plan_id = $1
        ORDER BY 
          pv.id
      `, [planId]);
      return planVehicles;
    } catch (error) {
      console.error(`Erreur lors de la récupération des associations pour le plan ${planId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère une association plan/véhicule spécifique avec détails
   */
  async getById(id: number): Promise<PlanVehicleWithDetails | null> {
    try {
      const planVehicle = await databasePostgresql.oneOrNone(`
        SELECT 
          pv.id, pv.plan_id, pv.vehicle_type, pv.category,
          sp.name AS plan_name, sp.price AS plan_price
        FROM 
          plan_vehicle pv
        INNER JOIN 
          subscription_plan sp ON pv.plan_id = sp.id
        WHERE 
          pv.id = $1
      `, [id]);
      
      return planVehicle;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'association plan/véhicule id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle association plan/véhicule
   */
  async create(planVehicleData: PlanVehicle): Promise<PlanVehicle> {
    try {
      const newPlanVehicle = await databasePostgresql.one(`
        INSERT INTO plan_vehicle (id, plan_id, vehicle_type, category)
        VALUES (COALESCE($1, nextval('plan_vehicle_id_seq')), $2, $3, $4)
        RETURNING id, plan_id, vehicle_type, category
      `, [
        planVehicleData.id || null, 
        planVehicleData.plan_id, 
        planVehicleData.vehicle_type, 
        planVehicleData.category || null
      ]);
      
      return newPlanVehicle;
    } catch (error) {
      console.error("Erreur lors de la création de l'association plan/véhicule:", error);
      throw error;
    }
  },

  /**
   * Met à jour une association plan/véhicule existante
   */
  async update(id: number, planVehicleData: PlanVehicleUpdate): Promise<PlanVehicle | null> {
    try {
      // Vérifier si l'association existe
      const existingPlanVehicle = await databasePostgresql.oneOrNone('SELECT * FROM plan_vehicle WHERE id = $1', [id]);
      if (!existingPlanVehicle) {
        return null;
      }

      // Préparer les champs à mettre à jour
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (planVehicleData.plan_id !== undefined) {
        updateFields.push(`plan_id = $${paramCount}`);
        updateValues.push(planVehicleData.plan_id);
        paramCount++;
      }

      if (planVehicleData.vehicle_type !== undefined) {
        updateFields.push(`vehicle_type = $${paramCount}`);
        updateValues.push(planVehicleData.vehicle_type);
        paramCount++;
      }

      if (planVehicleData.category !== undefined) {
        updateFields.push(`category = $${paramCount}`);
        updateValues.push(planVehicleData.category);
        paramCount++;
      }

      // Si aucun champ à mettre à jour, retourner l'association existante
      if (updateFields.length === 0) {
        return existingPlanVehicle;
      }

      // Ajouter l'ID à la fin des valeurs pour la clause WHERE
      updateValues.push(id);

      // Construire et exécuter la requête SQL
      const updatedPlanVehicle = await databasePostgresql.one(`
        UPDATE plan_vehicle 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING id, plan_id, vehicle_type, category
      `, updateValues);

      return updatedPlanVehicle;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'association plan/véhicule id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une association plan/véhicule
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await databasePostgresql.result(
        `DELETE FROM plan_vehicle WHERE id = $1`,
        [id]
      );
      
      // Renvoie true si au moins une ligne a été supprimée
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'association plan/véhicule id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si le plan existe
   */
  async planExists(planId: number): Promise<boolean> {
    try {
      const result = await databasePostgresql.oneOrNone(
        'SELECT id FROM subscription_plan WHERE id = $1',
        [planId]
      );
      
      return result !== null;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'existence du plan id=${planId}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si une association similaire existe déjà pour ce plan
   */
  async associationExists(planId: number, vehicleType: string, category?: string | null, excludeId?: number): Promise<boolean> {
    try {
      let query, params;
      
      if (category) {
        // Vérifier avec category
        query = excludeId 
          ? `SELECT COUNT(*) FROM plan_vehicle WHERE plan_id = $1 AND vehicle_type = $2 AND category = $3 AND id != $4`
          : `SELECT COUNT(*) FROM plan_vehicle WHERE plan_id = $1 AND vehicle_type = $2 AND category = $3`;
        
        params = excludeId ? [planId, vehicleType, category, excludeId] : [planId, vehicleType, category];
      } else {
        // Vérifier sans category (category est null)
        query = excludeId 
          ? `SELECT COUNT(*) FROM plan_vehicle WHERE plan_id = $1 AND vehicle_type = $2 AND category IS NULL AND id != $3`
          : `SELECT COUNT(*) FROM plan_vehicle WHERE plan_id = $1 AND vehicle_type = $2 AND category IS NULL`;
        
        params = excludeId ? [planId, vehicleType, excludeId] : [planId, vehicleType];
      }
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'association pour plan=${planId}, type=${vehicleType}:`, error);
      throw error;
    }
  }
};

export default planVehiclesModel;
