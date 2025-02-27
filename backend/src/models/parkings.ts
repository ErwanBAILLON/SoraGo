import databasePostgresql from "../db";

// Interface pour représenter un parking
export interface Parking {
  id?: number;
  vehicle_id: number;
  location_id: number;
}

// Interface pour les mises à jour de parking
export interface ParkingUpdate {
  vehicle_id?: number;
  location_id?: number;
}

// Interface pour représenter un parking avec détails (jointures)
export interface ParkingWithDetails extends Parking {
  vehicle_type?: string;
  vehicle_model?: string;
  brand_name?: string;
  location_city?: string;
  location_address?: string;
  location_country?: string;
}

const parkingsModel = {
  /**
   * Récupère tous les parkings avec détails
   */
  async getAll(): Promise<ParkingWithDetails[]> {
    try {
      const parkings = await databasePostgresql.manyOrNone(`
        SELECT 
          p.id, p.vehicle_id, p.location_id,
          v.type AS vehicle_type, v.model AS vehicle_model,
          b.name AS brand_name,
          l.city AS location_city, l.address AS location_address, l.country AS location_country
        FROM 
          parking p
        LEFT JOIN 
          vehicle v ON p.vehicle_id = v.id
        LEFT JOIN 
          brand b ON v.brand_id = b.id
        LEFT JOIN 
          location l ON p.location_id = l.id
        ORDER BY 
          p.id
      `);
      return parkings;
    } catch (error) {
      console.error('Erreur lors de la récupération des parkings:', error);
      throw error;
    }
  },

  /**
   * Récupère un parking spécifique avec détails
   */
  async getById(id: number): Promise<ParkingWithDetails | null> {
    try {
      const parking = await databasePostgresql.oneOrNone(`
        SELECT 
          p.id, p.vehicle_id, p.location_id,
          v.type AS vehicle_type, v.model AS vehicle_model,
          b.name AS brand_name,
          l.city AS location_city, l.address AS location_address, l.country AS location_country
        FROM 
          parking p
        LEFT JOIN 
          vehicle v ON p.vehicle_id = v.id
        LEFT JOIN 
          brand b ON v.brand_id = b.id
        LEFT JOIN 
          location l ON p.location_id = l.id
        WHERE 
          p.id = $1
      `, [id]);
      
      return parking;
    } catch (error) {
      console.error(`Erreur lors de la récupération du parking id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle association de parking
   */
  async create(parkingData: Parking): Promise<Parking> {
    try {
      const newParking = await databasePostgresql.one(`
        INSERT INTO parking (id, vehicle_id, location_id)
        VALUES (COALESCE($1, nextval('parking_id_seq')), $2, $3)
        RETURNING id, vehicle_id, location_id
      `, [parkingData.id || null, parkingData.vehicle_id, parkingData.location_id]);
      
      return newParking;
    } catch (error) {
      console.error("Erreur lors de la création du parking:", error);
      throw error;
    }
  },

  /**
   * Met à jour une association de parking existante
   */
  async update(id: number, parkingData: ParkingUpdate): Promise<Parking | null> {
    try {
      // Vérifier si le parking existe
      const existingParking = await databasePostgresql.oneOrNone('SELECT * FROM parking WHERE id = $1', [id]);
      if (!existingParking) {
        return null;
      }

      // Préparer les champs à mettre à jour
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (parkingData.vehicle_id !== undefined) {
        updateFields.push(`vehicle_id = $${paramCount}`);
        updateValues.push(parkingData.vehicle_id);
        paramCount++;
      }

      if (parkingData.location_id !== undefined) {
        updateFields.push(`location_id = $${paramCount}`);
        updateValues.push(parkingData.location_id);
        paramCount++;
      }

      // Si aucun champ à mettre à jour, retourner le parking existant
      if (updateFields.length === 0) {
        return existingParking;
      }

      // Ajouter l'ID à la fin des valeurs pour la clause WHERE
      updateValues.push(id);

      // Construire et exécuter la requête SQL
      const updatedParking = await databasePostgresql.one(`
        UPDATE parking 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCount}
        RETURNING id, vehicle_id, location_id
      `, updateValues);

      return updatedParking;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du parking id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une association de parking
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await databasePostgresql.result(
        `DELETE FROM parking WHERE id = $1`,
        [id]
      );
      
      // Renvoie true si au moins une ligne a été supprimée
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression du parking id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un véhicule est déjà assigné à un parking
   */
  async isVehicleAssigned(vehicleId: number, excludeParkingId?: number): Promise<boolean> {
    try {
      const query = excludeParkingId 
        ? `SELECT COUNT(*) FROM parking WHERE vehicle_id = $1 AND id != $2`
        : `SELECT COUNT(*) FROM parking WHERE vehicle_id = $1`;
      
      const params = excludeParkingId ? [vehicleId, excludeParkingId] : [vehicleId];
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification du véhicule id=${vehicleId} en parking:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si le véhicule et l'emplacement existent
   */
  async validateReferences(vehicleId: number, locationId: number): Promise<{ vehicleValid: boolean, locationValid: boolean }> {
    try {
      const vehicle = await databasePostgresql.oneOrNone('SELECT id FROM vehicle WHERE id = $1', [vehicleId]);
      const location = await databasePostgresql.oneOrNone('SELECT id FROM location WHERE id = $1', [locationId]);
      
      return {
        vehicleValid: vehicle !== null,
        locationValid: location !== null
      };
    } catch (error) {
      console.error('Erreur lors de la validation des références:', error);
      throw error;
    }
  }
};

export default parkingsModel;
