import express, { Request, Response } from 'express';
import authModel from '../models/auth';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète';

// Route d'inscription
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, lastname, email, phone, password } = req.body;
    
    // Vérification des données reçues
    if (!username || !lastname || !email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Les champs obligatoires sont manquants' 
      });
      return;
    }

    // Créer un nouvel utilisateur
    const newUser = await authModel.signup({
      username,
      lastname,
      email,
      phone,
      password
    });

    if (!newUser) {
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'inscription' 
      });
      return;
    }

    // Créer et envoyer le token JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, isAdmin: newUser.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: { user: newUser, token }
    });
  } catch (error) {
    console.error('Erreur dans la route signup:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route de connexion
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Vérification des données reçues
    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
      return;
    }

    // Vérifier les identifiants
    const user = await authModel.login({ email, password });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
      return;
    }

    // Créer et envoyer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: { user, token }
    });
  } catch (error) {
    console.error('Erreur dans la route login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Route de déconnexion
router.post('/logout', (req: Request, res: Response) => {
  // La déconnexion côté serveur peut être simple car le token est généralement
  // géré côté client. Vous pourriez implémenter une liste noire de tokens ici.
  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

export default router;
