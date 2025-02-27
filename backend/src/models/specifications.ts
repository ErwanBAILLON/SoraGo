import databasePostgresql from "../db";

// Interface pour représenter une spécification
export interface Specification {
  id?: number;
  weight: number;
  length: number;
  width: number;
  height: number;
}

// Interface pour les mises à jour de spécifications
export interface SpecificationUpdate {
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
}

const specificationsModel = {
  /**
   * Récupère toutes les spécifications
   */
  async getAll(): Promise<Specification[]> {
    try {
      const specifications = await databasePostgresql.manyOrNone(
        `SELECT id, weight, length, width, height
         FROM specification
         ORDER BY id`
      );
      return specifications;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécifications:', error);
      throw error;
    }
  },

  /**
   * Récupère une spécification par son ID
   */
  async getById(id: number): Promise<Specification | null> {
    try {
      const specification = await databasePostgresql.oneOrNone(
        `SELECT id, weight, length, width, height
         FROM specification 
         WHERE id = $1`,
        [id]
      );
      return specification;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la spécification id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle spécification
   */
  async create(specData: Specification): Promise<Specification> {
    try {
      // Utiliser une séquence pour l'id ou permettre l'insertion d'un ID personnalisé
      const newSpecification = await databasePostgresql.one(
        `INSERT INTO specification (id, weight, length, width, height)
         VALUES (COALESCE($1, nextval('specification_id_seq')), $2, $3, $4, $5)
         RETURNING id, weight, length, width, height`,
        [specData.id || null, specData.weight, specData.length, specData.width, specData.height]
      );
      
      return newSpecification;
    } catch (error) {
      console.error("Erreur lors de la création de la spécification:", error);
      throw error;
    }
  },

  /**
   * Met à jour une spécification existante
   */
  async update(id: number, specData: SpecificationUpdate): Promise<Specification | null> {
    try {
      // Vérifier si la spécification existe
      const existingSpec = await databasePostgresql.oneOrNone('SELECT * FROM specification WHERE id = $1', [id]);
      if (!existingSpec) {
        return null;
      }

      // Préparer les champs à mettre à jour
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (specData.weight !== undefined) {
        updateFields.push(`weight = $${paramCount}`);
        updateValues.push(specData.weight);
        paramCount++;
      }

      if (specData.length !== undefined) {
        updateFields.push(`length = $${paramCount}`);
        updateValues.push(specData.length);
        paramCount++;
      }

      if (specData.width !== undefined) {
        updateFields.push(`width = $${paramCount}`);
        updateValues.push(specData.width);
        paramCount++;
      }

      if (specData.height !== undefined) {
        updateFields.push(`height = $${paramCount}`);
        updateValues.push(specData.height);
        paramCount++;
      }

      // Si aucun champ à mettre à jour, retourner la spécification existante
      if (updateFields.length === 0) {
        return existingSpec;
      }

      // Ajouter l'ID à la fin des valeurs pour la clause WHERE
      updateValues.push(id);

      // Construire et exécuter la requête SQL
      const updatedSpec = await databasePostgresql.one(
        `UPDATE specification 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramCount}
         RETURNING id, weight, length, width, height`,
        updateValues
      );

      return updatedSpec;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la spécification id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une spécification
   */
  async delete(id: number): Promise<boolean> {
    try {
      // Vérifier s'il y a des références à cette spécification dans la table vehicle
      const references = await databasePostgresql.oneOrNone(
        `SELECT COUNT(*) FROM vehicle WHERE specification_id = $1`,
        [id]
      );

      if (references && parseInt(references.count) > 0) {
        throw new Error(`La spécification id=${id} est référencée dans la table des véhicules et ne peut pas être supprimée.`);
      }

      const result = await databasePostgresql.result(
        `DELETE FROM specification WHERE id = $1`,
        [id]
      );
      
      // Renvoie true si au moins une ligne a été supprimée
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la spécification id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si une spécification identique existe déjà
   */
  async specificationExists(weight: number, length: number, width: number, height: number, excludeId?: number): Promise<boolean> {
    try {
      const query = excludeId 
        ? `SELECT COUNT(*) FROM specification WHERE weight = $1 AND length = $2 AND width = $3 AND height = $4 AND id != $5`
        : `SELECT COUNT(*) FROM specification WHERE weight = $1 AND length = $2 AND width = $3 AND height = $4`;
      
      const params = excludeId ? [weight, length, width, height, excludeId] : [weight, length, width, height];
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'existence de la spécification:`, error);
      throw error;
    }
  }
};

export default specificationsModel;
