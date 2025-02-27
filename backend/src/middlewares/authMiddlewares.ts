import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète';
const TOKEN_EXPIRATION = '24h';

// Étendre l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        isAdmin: boolean;
        [key: string]: any;
      };
    }
  }
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token d'authentification
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Token manquant'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expiré',
            expired: true
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Token invalide'
        });
      }
      
      // Ajouter les infos de l'utilisateur à la requête
      req.user = decoded as {
        id: number;
        email: string;
        isAdmin: boolean;
        [key: string]: any;
      };
      next();
    });
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'authentification'
    });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est admin
 * Ce middleware doit être utilisé après isAuth
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Vérifie si req.user existe (donc si isAuth a été appelé avant)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentification requise'
    });
  }

  // Vérifie si l'utilisateur est un admin
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Droits administrateur requis'
    });
  }

  next();
};

/**
 * Middleware pour rafraîchir le token si l'utilisateur est toujours actif
 * Ce middleware doit être utilisé après isAuth
 */
export const refreshToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Pas de token, on continue sans rafraîchir
    }

    const token = authHeader.split(' ')[1];
    
    // Vérifier le token sans lever d'exception
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // Token expiré, on ne rafraîchit pas et on continue
          // L'erreur sera traitée par isAuth ultérieurement
          return next();
        }
        // Autre erreur avec le token, on continue sans rafraîchir
        return next();
      }
      
      const user = decoded as {
        id: number;
        email: string;
        isAdmin: boolean;
        exp: number;
        iat: number;
      };

      // Calculer le temps restant avant expiration
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = user.exp - currentTime;
      
      // Rafraîchir le token s'il est encore valide (pour prolonger la session de l'utilisateur actif)
      // On ajoute le nouveau token à l'en-tête de réponse
      if (timeUntilExpiry > 0) {
        const newToken = jwt.sign(
          { id: user.id, email: user.email, isAdmin: user.isAdmin },
          JWT_SECRET,
          { expiresIn: TOKEN_EXPIRATION }
        );
        
        res.setHeader('X-New-Token', newToken);
      }
      
      next();
    });
  } catch (error) {
    // En cas d'erreur, on continue sans rafraîchir le token
    console.error('Erreur lors du rafraîchissement du token:', error);
    next();
  }
};
