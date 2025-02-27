import databasePostgresql from "../db";
import bcrypt from 'bcrypt';

interface User {
  id?: number;
  username: string;
  lastname: string;
  email: string;
  phone?: string;
  password: string;
  is_admin?: boolean;
  created_at?: Date;
}

interface LoginData {
  email: string;
  password: string;
}

const authModel = {
  async signup(userData: User): Promise<User | null> {
    try {
      // Hachage du mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Insertion de l'utilisateur avec le mot de passe haché
      const newUser = await databasePostgresql.one(
        `INSERT INTO "user" (username, lastname, email, phone, password)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, lastname, email, phone, is_admin, created_at`,
        [userData.username, userData.lastname, userData.email, userData.phone || null, hashedPassword]
      );
      
      return newUser;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return null;
    }
  },

  async login(loginData: LoginData): Promise<User | null> {
    try {
      // Récupérer l'utilisateur par email
      const user = await databasePostgresql.oneOrNone(
        `SELECT * FROM "user" WHERE email = $1`,
        [loginData.email]
      );

      // Vérifier si l'utilisateur existe
      if (!user) {
        return null;
      }

      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(loginData.password, user.password);
      if (!validPassword) {
        return null;
      }

      // Retourner l'utilisateur sans le mot de passe
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return null;
    }
  },

  // Pour logout, généralement rien à faire côté base de données
  // car la déconnexion se fait en invalidant le token côté client
  async logout(userId: number): Promise<boolean> {
    // Cette fonction pourrait être utilisée pour des opérations comme
    // l'enregistrement de la déconnexion ou l'invalidation de tokens en base de données
    return true;
  }
};

export default authModel;