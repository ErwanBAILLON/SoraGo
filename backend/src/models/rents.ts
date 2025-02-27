import databasePostgresql from "../db";

// Interface pour représenter une location (emplacement)
export interface Location {
  id?: number;
  city: string;
  address: string;
  country: string;
}

// Interface pour les mises à jour de locations
export interface LocationUpdate {
  city?: string;
  address?: string;
  country?: string;
}

const locationsModel = {
  /**
   * Récupère toutes les locations
   */
  async getAll(): Promise<Location[]> {
    try {
      const locations = await databasePostgresql.manyOrNone(
        `SELECT id, city, address, country
         FROM location
         ORDER BY city, country`
      );
      return locations;
    } catch (error) {
      console.error('Erreur lors de la récupération des locations:', error);
      throw error;
    }
  },

  /**
   * Récupère une location par son ID
   */
  async getById(id: number): Promise<Location | null> {
    try {
      const location = await databasePostgresql.oneOrNone(
        `SELECT id, city, address, country
         FROM location 
         WHERE id = $1`,
        [id]
      );
      return location;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la location id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle location
   */
  async create(locationData: Location): Promise<Location> {
    try {
      // Utiliser une séquence pour l'id ou permettre l'insertion d'un ID personnalisé
      const newLocation = await databasePostgresql.one(
        `INSERT INTO location (id, city, address, country)
         VALUES (COALESCE($1, nextval('location_id_seq')), $2, $3, $4)
         RETURNING id, city, address, country`,
        [locationData.id || null, locationData.city, locationData.address, locationData.country]
      );
      
      return newLocation;
    } catch (error) {
      console.error("Erreur lors de la création de la location:", error);
      throw error;
    }
  },

  /**
   * Met à jour une location existante
   */
  async update(id: number, locationData: LocationUpdate): Promise<Location | null> {
    try {
      // Vérifier si la location existe
      const existingLocation = await databasePostgresql.oneOrNone('SELECT * FROM location WHERE id = $1', [id]);
      if (!existingLocation) {
        return null;
      }

      // Préparer les champs à mettre à jour
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (locationData.city !== undefined) {
        updateFields.push(`city = $${paramCount}`);
        updateValues.push(locationData.city);
        paramCount++;
      }

      if (locationData.address !== undefined) {
        updateFields.push(`address = $${paramCount}`);
        updateValues.push(locationData.address);
        paramCount++;
      }

      if (locationData.country !== undefined) {
        updateFields.push(`country = $${paramCount}`);
        updateValues.push(locationData.country);
        paramCount++;
      }

      // Si aucun champ à mettre à jour, retourner la location existante
      if (updateFields.length === 0) {
        return existingLocation;
      }

      // Ajouter l'ID à la fin des valeurs pour la clause WHERE
      updateValues.push(id);

      // Construire et exécuter la requête SQL
      const updatedLocation = await databasePostgresql.one(
        `UPDATE location 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramCount}
         RETURNING id, city, address, country`,
        updateValues
      );

      return updatedLocation;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la location id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une location
   */
  async delete(id: number): Promise<boolean> {
    try {
      // Vérifier s'il y a des références à cette location dans la table parking
      const references = await databasePostgresql.oneOrNone(
        `SELECT COUNT(*) FROM parking WHERE location_id = $1`,
        [id]
      );

      if (references && parseInt(references.count) > 0) {
        throw new Error(`La location id=${id} est référencée dans d'autres tables et ne peut pas être supprimée.`);
      }

      const result = await databasePostgresql.result(
        `DELETE FROM location WHERE id = $1`,
        [id]
      );
      
      // Renvoie true si au moins une ligne a été supprimée
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la location id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si une location existe déjà avec la même adresse
   */
  async addressExists(address: string, city: string, excludeId?: number): Promise<boolean> {
    try {
      const query = excludeId 
        ? `SELECT COUNT(*) FROM location WHERE address = $1 AND city = $2 AND id != $3`
        : `SELECT COUNT(*) FROM location WHERE address = $1 AND city = $2`;
      
      const params = excludeId ? [address, city, excludeId] : [address, city];
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'adresse ${address}:`, error);
      throw error;
    }
  }
};

export default locationsModel;
