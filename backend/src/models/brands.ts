import databasePostgresql from "../db";

// Interface pour représenter une marque
export interface Brand {
  id?: number;
  name: string;
}

// Interface pour les mises à jour de marques
export interface BrandUpdate {
  name?: string;
}

const brandsModel = {
  /**
   * Récupère toutes les marques
   */
  async getAll(): Promise<Brand[]> {
    try {
      const brands = await databasePostgresql.manyOrNone(
        `SELECT id, name
         FROM brand
         ORDER BY name`
      );
      return brands;
    } catch (error) {
      console.error('Erreur lors de la récupération des marques:', error);
      throw error;
    }
  },

  /**
   * Récupère une marque par son ID
   */
  async getById(id: number): Promise<Brand | null> {
    try {
      const brand = await databasePostgresql.oneOrNone(
        `SELECT id, name
         FROM brand 
         WHERE id = $1`,
        [id]
      );
      return brand;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la marque id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle marque
   */
  async create(brandData: Brand): Promise<Brand> {
    try {
      // Utiliser une séquence pour l'id ou permettre l'insertion d'un ID personnalisé
      const newBrand = await databasePostgresql.one(
        `INSERT INTO brand (id, name)
         VALUES (COALESCE($1, nextval('brand_id_seq')), $2)
         RETURNING id, name`,
        [brandData.id || null, brandData.name]
      );
      
      return newBrand;
    } catch (error) {
      console.error("Erreur lors de la création de la marque:", error);
      throw error;
    }
  },

  /**
   * Met à jour une marque existante
   */
  async update(id: number, brandData: BrandUpdate): Promise<Brand | null> {
    try {
      // Vérifier si la marque existe
      const existingBrand = await databasePostgresql.oneOrNone('SELECT * FROM brand WHERE id = $1', [id]);
      if (!existingBrand) {
        return null;
      }

      // Si le nom n'est pas fourni, retourner la marque existante
      if (!brandData.name) {
        return existingBrand;
      }

      // Mettre à jour la marque
      const updatedBrand = await databasePostgresql.one(
        `UPDATE brand 
         SET name = $1
         WHERE id = $2
         RETURNING id, name`,
        [brandData.name, id]
      );

      return updatedBrand;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la marque id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une marque
   */
  async delete(id: number): Promise<boolean> {
    try {
      // Vérifier s'il y a des références à cette marque dans la table vehicle
      const references = await databasePostgresql.oneOrNone(
        `SELECT COUNT(*) FROM vehicle WHERE brand_id = $1`,
        [id]
      );

      if (references && parseInt(references.count) > 0) {
        throw new Error(`La marque id=${id} est référencée dans la table des véhicules et ne peut pas être supprimée.`);
      }

      const result = await databasePostgresql.result(
        `DELETE FROM brand WHERE id = $1`,
        [id]
      );
      
      // Renvoie true si au moins une ligne a été supprimée
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la marque id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si une marque existe déjà avec le même nom
   */
  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const query = excludeId 
        ? `SELECT COUNT(*) FROM brand WHERE name ILIKE $1 AND id != $2`
        : `SELECT COUNT(*) FROM brand WHERE name ILIKE $1`;
      
      const params = excludeId ? [name, excludeId] : [name];
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification du nom de marque ${name}:`, error);
      throw error;
    }
  }
};

export default brandsModel;
