import User from "../models/user.model.js";
import FormConfig from "../models/formConfig.model.js";
import Workflow from "../models/workflow.model.js";
import WorkflowInstance from "../models/workflowInstance.model.js";
import workflowService from "../services/workflowService.js";
import { GraphQLJSON } from 'graphql-type-json';

const resolvers = {
  JSON: GraphQLJSON,
  // Resolvers pour les types complexes
  WorkflowHistoryEntry: {
    user: async (parent) => {
      if (parent.userId) {
        return await User.findById(parent.userId);
      }
      return null;
    }
  },
  WorkflowInstance: {
    workflow: async (parent) => {
      console.log('🔧 Resolver: WorkflowInstance.workflow for parent:', parent.id);
      console.log('🔧 Parent workflowId:', parent.workflowId);
      
      if (parent.workflowId) {
        const workflow = await Workflow.findById(parent.workflowId);
        console.log('🔧 Workflow found:', workflow ? workflow.name : 'null');
        
        if (workflow) {
          const result = {
            id: workflow._id.toString(),
            name: workflow.name,
            description: workflow.description,
            trigger: workflow.trigger,
            steps: workflow.steps,
            isActive: workflow.isActive,
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt
          };
          console.log('🔧 Returning workflow with id:', result.id);
          return result;
        }
      }
      console.log('🔧 Returning null for workflow');
      return null;
    },
    entity: async (parent) => {
      console.log('🔧 Resolver: WorkflowInstance.entity for parent:', parent.id);
      console.log('🔧 Parent entityId:', parent.entityId, 'entityType:', parent.entityType);
      
      if (parent.entityId && parent.entityType === 'User') {
        const user = await User.findById(parent.entityId);
        console.log('🔧 User found:', user ? user.username : 'null');
        if (user) {
          return {
            id: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isActive: user.isActive,
            role: user.role
          };
        }
      }
      console.log('🔧 Returning null for entity');
      return null;
    }
  },
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
      // Queries pour les workflows
  workflows: async () => {
    console.log('🔍 Query: workflows');
    const workflows = await Workflow.find();
    console.log('📋 Workflows found:', workflows.length);
    return workflows;
  },
  workflow: async (_, { id }) => {
    console.log('🔍 Query: workflow with id:', id);
    const workflow = await Workflow.findById(id);
    if (!workflow) throw new Error("Workflow not found");
    console.log('📋 Workflow found:', workflow.name);
    return workflow;
  },
  workflowInstances: async () => {
    console.log('🔍 Query: workflowInstances');
    const instances = await WorkflowInstance.find()
      .populate('entityId')
      .populate('history.userId');
    console.log('📋 Instances found:', instances.length);
    return instances;
  },
  workflowInstance: async (_, { id }) => {
    console.log('🔍 Query: workflowInstance with id:', id);
    const instance = await WorkflowInstance.findById(id)
      .populate('entityId')
      .populate('history.userId');
    if (!instance) throw new Error("Workflow instance not found");
    console.log('📋 Instance found:', instance.id);
    return instance;
  },
  pendingWorkflowInstances: async (_, __, { user }) => {
    console.log('🔍 Query: pendingWorkflowInstances for user:', user?.id, 'role:', user?.role);
    if (!user) {
      throw new Error("Non authentifié");
    }
    const instances = await workflowService.getPendingInstancesForUser(user.id, user.role);
    console.log('📋 Pending instances found:', instances.length);
    return instances;
  },
  },
  Mutation: {
    createUser: async (_, { input }) => {
      const user = await User.create(input);
      
      // Déclencher le workflow d'approbation quand l'utilisateur est totalement créé
      try {
        await workflowService.triggerWorkflow('USER_CREATED', user._id, 'User');
      } catch (error) {
        console.error('Erreur lors du déclenchement du workflow:', error);
        // Ne pas faire échouer la création de l'utilisateur si le workflow échoue
      }
      
      return user;
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
    // Mutations pour les workflows
    createWorkflow: async (_, { input }) => {
      try {
        return await Workflow.create(input);
      } catch (error) {
        throw new Error("Failed to create workflow: " + error.message);
      }
    },
    updateWorkflow: async (_, { id, input }) => {
      const workflow = await Workflow.findByIdAndUpdate(id, input, { new: true });
      if (!workflow) throw new Error("Workflow not found");
      return workflow;
    },
    deleteWorkflow: async (_, { id }) => {
      const workflow = await Workflow.findByIdAndDelete(id);
      if (!workflow) throw new Error("Workflow not found");
      return workflow;
    },
    executeWorkflowAction: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error("Non authentifié");
      }

      try {
        const instance = await workflowService.executeAction(
          input.instanceId,
          user.id,
          input.action,
          input.message
        );

        return {
          success: true,
          message: `Action '${input.action}' exécutée avec succès`,
          instance
        };
      } catch (error) {
        return {
          success: false,
          message: error.message,
          instance: null
        };
      }
    },
  },
};

export default resolvers;