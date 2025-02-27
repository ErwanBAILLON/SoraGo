import databasePostgresql from "../db";

// Interface pour représenter un véhicule
export interface Vehicle {
  id?: number;
  type: 'car' | 'motorcycle' | 'boat'; // Correspond au type vehicle_type
  brand_id: number;
  model: string;
  specification_id: number;
  category?: 'sedan' | 'suv' | 'no_license' | 'city_car' | 'coupe' | null; // car_category
  available?: boolean;
  mileage?: number;
  created_at?: Date;
}

// Interface pour les mises à jour de véhicule
export interface VehicleUpdate {
  type?: 'car' | 'motorcycle' | 'boat';
  brand_id?: number;
  model?: string;
  specification_id?: number;
  category?: 'sedan' | 'suv' | 'no_license' | 'city_car' | 'coupe' | null;
  available?: boolean;
  mileage?: number;
}

// Interface pour représenter un véhicule avec des informations complètes (jointures)
export interface VehicleWithDetails extends Vehicle {
  brand_name?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  location_id?: number;
  location_city?: string;
}

const vehiclesModel = {
  /**
   * Récupère tous les véhicules avec leurs détails (marque, spécifications, emplacement)
   */
  async getAll(): Promise<VehicleWithDetails[]> {
    try {
      const vehicles = await databasePostgresql.manyOrNone(`
        SELECT 
          v.id, v.type, v.brand_id, v.model, v.specification_id, v.category, 
          v.available, v.mileage, v.created_at,
          b.name AS brand_name,
          s.weight, s.length, s.width, s.height,
          p.location_id,
          l.city AS location_city
        FROM 
          vehicle v
        LEFT JOIN 
          brand b ON v.brand_id = b.id
        LEFT JOIN 
          specification s ON v.specification_id = s.id
        LEFT JOIN 
          parking p ON v.id = p.vehicle_id
        LEFT JOIN 
          location l ON p.location_id = l.id
        ORDER BY 
          v.id
      `);
      return vehicles;
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      throw error;
    }
  },

  /**
   * Récupère un véhicule par son ID avec ses détails
   */
  async getById(id: number): Promise<VehicleWithDetails | null> {
    try {
      const vehicle = await databasePostgresql.oneOrNone(`
        SELECT 
          v.id, v.type, v.brand_id, v.model, v.specification_id, v.category, 
          v.available, v.mileage, v.created_at,
          b.name AS brand_name,
          s.weight, s.length, s.width, s.height,
          p.location_id,
          l.city AS location_city
        FROM 
          vehicle v
        LEFT JOIN 
          brand b ON v.brand_id = b.id
        LEFT JOIN 
          specification s ON v.specification_id = s.id
        LEFT JOIN 
          parking p ON v.id = p.vehicle_id
        LEFT JOIN 
          location l ON p.location_id = l.id
        WHERE 
          v.id = $1
      `, [id]);
      
      return vehicle;
    } catch (error) {
      console.error(`Erreur lors de la récupération du véhicule id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère tous les véhicules disponibles avec leurs détails
   */
  async getAvailable(): Promise<VehicleWithDetails[]> {
    try {
      const vehicles = await databasePostgresql.manyOrNone(`
        SELECT 
          v.id, v.type, v.brand_id, v.model, v.specification_id, v.category, 
          v.available, v.mileage, v.created_at,
          b.name AS brand_name,
          s.weight, s.length, s.width, s.height,
          p.location_id,
          l.city AS location_city
        FROM 
          vehicle v
        LEFT JOIN 
          brand b ON v.brand_id = b.id
        LEFT JOIN 
          specification s ON v.specification_id = s.id
        LEFT JOIN 
          parking p ON v.id = p.vehicle_id
        LEFT JOIN 
          location l ON p.location_id = l.id
        WHERE 
          v.available = TRUE
        ORDER BY 
          v.id
      `);
      return vehicles;
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules disponibles:', error);
      throw error;
    }
  },

  /**
   * Crée un nouveau véhicule et optionnellement le place dans un parking
   */
  async create(vehicleData: Vehicle, locationId?: number): Promise<Vehicle> {
    try {
      // Utiliser une transaction pour créer le véhicule et l'assigner à un parking si nécessaire
      return await databasePostgresql.tx(async t => {
        // Créer le véhicule
        const newVehicle = await t.one(`
          INSERT INTO vehicle (
            id, type, brand_id, model, specification_id, category, available, mileage
          ) VALUES (
            COALESCE($1, nextval('vehicle_id_seq')), $2, $3, $4, $5, $6, $7, $8
          )
          RETURNING id, type, brand_id, model, specification_id, category, available, mileage, created_at
        `, [
          vehicleData.id || null,
          vehicleData.type,
          vehicleData.brand_id,
          vehicleData.model,
          vehicleData.specification_id,
          vehicleData.category || null,
          vehicleData.available !== undefined ? vehicleData.available : true,
          vehicleData.mileage || 0
        ]);

        // Si un emplacement est fourni, créer une entrée dans la table parking
        if (locationId) {
          await t.none(`
            INSERT INTO parking (id, vehicle_id, location_id)
            VALUES (nextval('parking_id_seq'), $1, $2)
          `, [newVehicle.id, locationId]);
        }

        return newVehicle;
      });
    } catch (error) {
      console.error("Erreur lors de la création du véhicule:", error);
      throw error;
    }
  },

  /**
   * Met à jour un véhicule existant et optionnellement son emplacement
   */
  async update(id: number, vehicleData: VehicleUpdate, locationId?: number): Promise<Vehicle | null> {
    try {
      // Vérifier si le véhicule existe
      const existingVehicle = await databasePostgresql.oneOrNone('SELECT * FROM vehicle WHERE id = $1', [id]);
      if (!existingVehicle) {
        return null;
      }

      return await databasePostgresql.tx(async t => {
        // Préparer les champs à mettre à jour pour le véhicule
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (vehicleData.type !== undefined) {
          updateFields.push(`type = $${paramCount}`);
          updateValues.push(vehicleData.type);
          paramCount++;
        }

        if (vehicleData.brand_id !== undefined) {
          updateFields.push(`brand_id = $${paramCount}`);
          updateValues.push(vehicleData.brand_id);
          paramCount++;
        }

        if (vehicleData.model !== undefined) {
          updateFields.push(`model = $${paramCount}`);
          updateValues.push(vehicleData.model);
          paramCount++;
        }

        if (vehicleData.specification_id !== undefined) {
          updateFields.push(`specification_id = $${paramCount}`);
          updateValues.push(vehicleData.specification_id);
          paramCount++;
        }

        if (vehicleData.category !== undefined) {
          updateFields.push(`category = $${paramCount}`);
          updateValues.push(vehicleData.category);
          paramCount++;
        }

        if (vehicleData.available !== undefined) {
          updateFields.push(`available = $${paramCount}`);
          updateValues.push(vehicleData.available);
          paramCount++;
        }

        if (vehicleData.mileage !== undefined) {
          updateFields.push(`mileage = $${paramCount}`);
          updateValues.push(vehicleData.mileage);
          paramCount++;
        }

        let updatedVehicle = existingVehicle;

        // Si des champs sont à mettre à jour
        if (updateFields.length > 0) {
          // Ajouter l'ID à la fin des valeurs pour la clause WHERE
          updateValues.push(id);

          // Construire et exécuter la requête SQL
          updatedVehicle = await t.one(`
            UPDATE vehicle 
            SET ${updateFields.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING id, type, brand_id, model, specification_id, category, available, mileage, created_at
          `, updateValues);
        }

        // Si un emplacement est fourni, mettre à jour ou créer l'entrée dans la table parking
        if (locationId !== undefined) {
          // Vérifier si le véhicule est déjà dans un parking
          const existingParking = await t.oneOrNone('SELECT * FROM parking WHERE vehicle_id = $1', [id]);
          
          if (existingParking) {
            // Mettre à jour l'emplacement
            await t.none('UPDATE parking SET location_id = $1 WHERE vehicle_id = $2', [locationId, id]);
          } else {
            // Créer une nouvelle entrée de parking
            await t.none(`
              INSERT INTO parking (id, vehicle_id, location_id)
              VALUES (nextval('parking_id_seq'), $1, $2)
            `, [id, locationId]);
          }
        }

        return updatedVehicle;
      });
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du véhicule id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un véhicule
   */
  async delete(id: number): Promise<boolean> {
    try {
      return await databasePostgresql.tx(async t => {
        // Vérifier si le véhicule est référencé dans des réservations
        const reservationReferences = await t.oneOrNone(
          `SELECT COUNT(*) FROM reservation WHERE vehicle_id = $1`,
          [id]
        );

        if (reservationReferences && parseInt(reservationReferences.count) > 0) {
          throw new Error(`Le véhicule id=${id} est référencé dans des réservations et ne peut pas être supprimé.`);
        }

        // Supprimer les entrées de parking associées au véhicule
        await t.none('DELETE FROM parking WHERE vehicle_id = $1', [id]);

        // Supprimer le véhicule
        const result = await t.result('DELETE FROM vehicle WHERE id = $1', [id]);
        
        // Renvoie true si au moins une ligne a été supprimée
        return result.rowCount > 0;
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression du véhicule id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un véhicule existe avec la même marque et le même modèle
   */
  async modelExists(brandId: number, model: string, excludeId?: number): Promise<boolean> {
    try {
      const query = excludeId 
        ? `SELECT COUNT(*) FROM vehicle WHERE brand_id = $1 AND model ILIKE $2 AND id != $3`
        : `SELECT COUNT(*) FROM vehicle WHERE brand_id = $1 AND model ILIKE $2`;
      
      const params = excludeId ? [brandId, model, excludeId] : [brandId, model];
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification du modèle ${model}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si une marque et une spécification existent
   */
  async validateReferences(brandId: number, specificationId: number): Promise<{ brandValid: boolean, specificationValid: boolean }> {
    try {
      const brand = await databasePostgresql.oneOrNone('SELECT id FROM brand WHERE id = $1', [brandId]);
      const specification = await databasePostgresql.oneOrNone('SELECT id FROM specification WHERE id = $1', [specificationId]);
      
      return {
        brandValid: brand !== null,
        specificationValid: specification !== null
      };
    } catch (error) {
      console.error('Erreur lors de la validation des références:', error);
      throw error;
    }
  }
};

export default vehiclesModel;
