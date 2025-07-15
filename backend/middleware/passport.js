import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user.model.js";

// Configuration de la stratégie locale
passport.use(
  new LocalStrategy(
    {
      usernameField: "username", // On utilise le champ username pour l'authentification
      passwordField: "password"
    },
    async (username, password, done) => {
      try {
        // Rechercher l'utilisateur par username
        const user = await User.findOne({ username });
        
        if (!user) {
          return done(null, false, { message: "Utilisateur non trouvé" });
        }
        
        // Vérifier si le mot de passe est "admin" (pas de hachage)
        if (password !== "admin") {
          return done(null, false, { message: "Mot de passe incorrect" });
        }
        
        // Vérifier si l'utilisateur est actif
        if (!user.isActive) {
          return done(null, false, { message: "Votre compte n'est pas encore activé. Veuillez contacter l'administrateur." });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Sérialisation de l'utilisateur pour la session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Désérialisation de l'utilisateur depuis la session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport; 