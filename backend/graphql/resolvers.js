import User from "../models/user.model.js";
import FormConfig from "../models/formConfig.model.js";
import { GraphQLJSON } from 'graphql-type-json';

const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    users: async () => {
      return await User.find();
    },
    user: async (_, { id }) => {
      const user = await User.findById(id);
      if (!user) throw new Error("User not found");
      return user;
    },
    formConfigs: async () => {
      return await FormConfig.find();
    },
    formConfig: async (_, { id }) => {
      const formConfig = await FormConfig.findById(id);
      if (!formConfig) throw new Error("Form config not found");
      return formConfig;
    },
    formConfigByName: async (_, { formName }) => {
      const formConfig = await FormConfig.findOne({ formName });
      if (!formConfig) throw new Error("Form config not found");
      return formConfig;
    },
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Non authentifié");
      }
      return user;
    },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      return await User.create(input);
    },
    updateUser: async (_, { id, input }) => {
      const user = await User.findByIdAndUpdate(id, input, { new: true });
      if (!user) throw new Error("User not found");
      return user;
    },
    deleteUser: async (_, { id }) => {
      const user = await User.findByIdAndDelete(id);
      if (!user) throw new Error("User not found");
      return user;
    },
    createDraftUser: async () => {
      return await User.create({ isActive: false });
    },
    createFormConfig: async (_, { input }) => {
      try {
        return await FormConfig.create(input);
      } catch (error) {
        if (error.code === 11000) {
          throw new Error("Form name already exists");
        }
        throw new Error("Failed to create FormConfig: " + error.message);
      }
    },
    updateFormConfig: async (_, { id, input }) => {
      const formConfig = await FormConfig.findByIdAndUpdate(id, input, { new: true });
      if (!formConfig) throw new Error("Form config not found");
      return formConfig;
    },
    deleteFormConfig: async (_, { id }) => {
      const formConfig = await FormConfig.findByIdAndDelete(id);
      if (!formConfig) throw new Error("Form config not found");
      return formConfig;
    },
    login: async (_, { input }, { req }) => {
      return new Promise((resolve) => {
        // Créer une fonction d'authentification personnalisée
        const authenticateUser = async () => {
          try {
            // Rechercher l'utilisateur par username
            const user = await User.findOne({ username: input.username });
            
            if (!user) {
              return resolve({
                success: false,
                message: "Nom d'utilisateur ou mot de passe incorrect",
                user: null
              });
            }
            
            // Vérifier le mot de passe (toujours "admin")
            if (input.password !== "admin") {
              return resolve({
                success: false,
                message: "Nom d'utilisateur ou mot de passe incorrect",
                user: null
              });
            }
            
            // Authentifier l'utilisateur avec Passport
            req.login(user, (err) => {
              if (err) {
                return resolve({
                  success: false,
                  message: "Erreur lors de la connexion",
                  user: null
                });
              }
              
              resolve({
                success: true,
                message: "Connexion réussie",
                user: user
              });
            });
          } catch (error) {
            resolve({
              success: false,
              message: "Erreur lors de la connexion",
              user: null
            });
          }
        };
        
        authenticateUser();
      });
    },
    logout: async (_, __, { req }) => {
      return new Promise((resolve) => {
        req.logout((err) => {
          if (err) {
            resolve({
              success: false,
              message: "Erreur lors de la déconnexion",
              user: null
            });
          }
          
          resolve({
            success: true,
            message: "Déconnexion réussie",
            user: null
          });
        });
      });
    },
  },
};

export default resolvers;