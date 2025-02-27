import databasePostgresql from "../db";
import bcrypt from 'bcrypt';

// Interface pour représenter un utilisateur
export interface User {
  id?: number;
  username: string;
  lastname: string;
  email: string;
  phone?: string;
  password?: string;
  is_admin?: boolean;
  created_at?: Date;
}

// Interface pour les mises à jour d'utilisateurs
export interface UserUpdate {
  username?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  password?: string;
  is_admin?: boolean;
}

const usersModel = {
  /**
   * Récupère tous les utilisateurs
   */
  async getAll(): Promise<User[]> {
    try {
      // Ne pas renvoyer le mot de passe
      const users = await databasePostgresql.manyOrNone(
        `SELECT id, username, lastname, email, phone, is_admin, created_at 
         FROM "user"
         ORDER BY id`
      );
      return users;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  /**
   * Récupère un utilisateur par son ID
   */
  async getById(id: number): Promise<User | null> {
    try {
      const user = await databasePostgresql.oneOrNone(
        `SELECT id, username, lastname, email, phone, is_admin, created_at 
         FROM "user" 
         WHERE id = $1`,
        [id]
      );
      return user;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouvel utilisateur
   */
  async create(userData: User): Promise<User | null> {
    try {
      // Hachage du mot de passe
      const saltRounds = 10;
      const hashedPassword = userData.password ? await bcrypt.hash(userData.password, saltRounds) : null;

      if (!hashedPassword) {
        throw new Error("Mot de passe requis pour la création d'un utilisateur");
      }

      // Insertion de l'utilisateur avec le mot de passe haché
      const newUser = await databasePostgresql.one(
        `INSERT INTO "user" (username, lastname, email, phone, password, is_admin)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, username, lastname, email, phone, is_admin, created_at`,
        [
          userData.username, 
          userData.lastname, 
          userData.email, 
          userData.phone || null, 
          hashedPassword, 
          userData.is_admin || false
        ]
      );
      
      return newUser;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  },

  /**
   * Met à jour un utilisateur existant
   */
  async update(id: number, userData: UserUpdate): Promise<User | null> {
    try {
      // Vérifier si l'utilisateur existe
      const existingUser = await databasePostgresql.oneOrNone('SELECT * FROM "user" WHERE id = $1', [id]);
      if (!existingUser) {
        return null;
      }

      // Préparer les champs à mettre à jour
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (userData.username !== undefined) {
        updateFields.push(`username = $${paramCount}`);
        updateValues.push(userData.username);
        paramCount++;
      }

      if (userData.lastname !== undefined) {
        updateFields.push(`lastname = $${paramCount}`);
        updateValues.push(userData.lastname);
        paramCount++;
      }

      if (userData.email !== undefined) {
        updateFields.push(`email = $${paramCount}`);
        updateValues.push(userData.email);
        paramCount++;
      }

      if (userData.phone !== undefined) {
        updateFields.push(`phone = $${paramCount}`);
        updateValues.push(userData.phone);
        paramCount++;
      }

      if (userData.password !== undefined) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        updateFields.push(`password = $${paramCount}`);
        updateValues.push(hashedPassword);
        paramCount++;
      }

      if (userData.is_admin !== undefined) {
        updateFields.push(`is_admin = $${paramCount}`);
        updateValues.push(userData.is_admin);
        paramCount++;
      }

      // Si aucun champ à mettre à jour, retourner l'utilisateur existant
      if (updateFields.length === 0) {
        return {
          id: existingUser.id,
          username: existingUser.username,
          lastname: existingUser.lastname,
          email: existingUser.email,
          phone: existingUser.phone,
          is_admin: existingUser.is_admin,
          created_at: existingUser.created_at
        };
      }

      // Ajouter l'ID à la fin des valeurs pour la clause WHERE
      updateValues.push(id);

      // Construire et exécuter la requête SQL
      const updatedUser = await databasePostgresql.one(
        `UPDATE "user" 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramCount}
         RETURNING id, username, lastname, email, phone, is_admin, created_at`,
        updateValues
      );

      return updatedUser;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un utilisateur
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await databasePostgresql.result(
        `DELETE FROM "user" WHERE id = $1`,
        [id]
      );
      
      // Renvoie true si au moins une ligne a été supprimée
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur id=${id}:`, error);
      throw error;
    }
  },

  /**
   * Vérifie si un email est déjà utilisé
   */
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const query = excludeId 
        ? `SELECT COUNT(*) FROM "user" WHERE email = $1 AND id != $2`
        : `SELECT COUNT(*) FROM "user" WHERE email = $1`;
      
      const params = excludeId ? [email, excludeId] : [email];
      
      const result = await databasePostgresql.one(query, params);
      return parseInt(result.count) > 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification de l'email ${email}:`, error);
      throw error;
    }
  }
};

export default usersModel;
