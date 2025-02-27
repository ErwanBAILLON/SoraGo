import express, { Request, Response } from 'express';
import usersModel, { UserUpdate } from '../models/users';
import { isAuth, isAdmin, refreshToken } from '../middlewares/authMiddlewares';

const router = express.Router();

/**
 * GET /users - Récupérer la liste des utilisateurs
 * Restreint aux administrateurs
 */
router.get('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const users = await usersModel.getAll();
    res.status(200).json({
      success: true,
      message: 'Liste des utilisateurs récupérée avec succès',
      data: users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs'
    });
  }
});

/**
 * GET /users/:id - Récupérer un utilisateur spécifique
 * Accessible par l'administrateur ou l'utilisateur lui-même
 */
router.get('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Vérifier que l'utilisateur demande son propre profil ou est admin
    if (req.user?.id !== userId && !req.user?.isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous ne pouvez consulter que votre propre profil'
      });
      return;
    }

    const user = await usersModel.getById(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur récupéré avec succès',
      data: user
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'utilisateur'
    });
  }
});

/**
 * POST /users - Créer un nouvel utilisateur
 * Restreint aux administrateurs
 */
router.post('/', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const { username, lastname, email, phone, password, is_admin } = req.body;
    
    // Validation des données
    if (!username || !lastname || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Les champs obligatoires sont manquants'
      });
      return;
    }

    // Vérifier si l'email existe déjà
    const emailExists = await usersModel.emailExists(email);
    if (emailExists) {
      res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
      return;
    }

    // Créer l'utilisateur
    const newUser = await usersModel.create({
      username,
      lastname,
      email,
      phone,
      password,
      is_admin
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: newUser
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'utilisateur'
    });
  }
});

/**
 * PUT /users/:id - Mettre à jour un utilisateur
 * Accessible par l'administrateur ou l'utilisateur lui-même
 */
router.put('/:id', [refreshToken, isAuth], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, lastname, email, phone, password, is_admin } = req.body;
    
    // Vérifier que l'utilisateur modifie son propre profil ou est admin
    const isOwnProfile = req.user?.id === userId;
    const canEditAdmin = req.user?.isAdmin;
    
    if (!isOwnProfile && !canEditAdmin) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous ne pouvez modifier que votre propre profil'
      });
      return;
    }

    // Seul un admin peut modifier le status admin d'un compte
    if (is_admin !== undefined && !canEditAdmin) {
      res.status(403).json({
        success: false,
        message: 'Accès refusé. Seul un administrateur peut modifier les droits d\'administration'
      });
      return;
    }

    // Si l'email est modifié, vérifier s'il n'existe pas déjà
    if (email) {
      const emailExists = await usersModel.emailExists(email, userId);
      if (emailExists) {
        res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
        return;
      }
    }

    // Mettre à jour l'utilisateur
    const updateData: UserUpdate = {};
    if (username !== undefined) updateData.username = username;
    if (lastname !== undefined) updateData.lastname = lastname;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password !== undefined) updateData.password = password;
    if (is_admin !== undefined && canEditAdmin) updateData.is_admin = is_admin;

    const updatedUser = await usersModel.update(userId, updateData);
    
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: updatedUser
    });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'utilisateur'
    });
  }
});

/**
 * DELETE /users/:id - Supprimer un utilisateur
 * Restreint aux administrateurs
 */
router.delete('/:id', [refreshToken, isAuth, isAdmin], async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Empêcher un admin de se supprimer lui-même
    if (req.user?.id === userId) {
      res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte.'
      });
      return;
    }
    
    const deleted = await usersModel.delete(userId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'utilisateur:`, error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'utilisateur'
    });
  }
});

export default router;
