import Workflow from '../models/workflow.model.js';
import WorkflowInstance from '../models/workflowInstance.model.js';
import User from '../models/user.model.js';

class WorkflowService {
  /**
   * Déclenche un workflow pour une entité donnée
   */
  async triggerWorkflow(trigger, entityId, entityType) {
    try {
      const workflow = await Workflow.findOne({ 
        trigger, 
        isActive: true 
      });

      if (!workflow) {
        console.log(`Aucun workflow actif trouvé pour le déclencheur: ${trigger}`);
        return null;
      }

      const workflowInstance = new WorkflowInstance({
        workflowId: workflow._id,
        entityId,
        entityType,
        currentStep: 1,
        status: 'PENDING'
      });

      await workflowInstance.save();
      console.log(`Workflow déclenché: ${workflow.name} pour ${entityType} ${entityId}`);
      
      return workflowInstance;
    } catch (error) {
      console.error('Erreur lors du déclenchement du workflow:', error);
      throw error;
    }
  }

  /**
   * Exécute une action sur une instance de workflow
   */
  async executeAction(instanceId, userId, actionName, message = '') {
    try {
      const instance = await WorkflowInstance.findById(instanceId);

      if (!instance) {
        throw new Error('Instance de workflow non trouvée');
      }

      if (instance.status !== 'PENDING') {
        throw new Error('Cette instance de workflow n\'est plus en attente');
      }

      const workflow = await Workflow.findById(instance.workflowId);
      if (!workflow) {
        throw new Error('Workflow non trouvé');
      }
      const currentStep = workflow.steps.find(step => step.order === instance.currentStep);

      if (!currentStep) {
        throw new Error('Étape actuelle non trouvée dans le workflow');
      }

      const action = currentStep.actions.find(act => act.name === actionName);
      if (!action) {
        throw new Error(`Action '${actionName}' non autorisée pour cette étape`);
      }

      // Vérifier les permissions (l'admin peut tout faire)
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (user.role !== 'Admin' && !currentStep.allowedRoles.includes(user.role)) {
        throw new Error(`Vous n'avez pas les permissions pour exécuter cette action. Rôles autorisés: ${currentStep.allowedRoles.join(', ')}`);
      }

      // Ajouter l'action à l'historique
      instance.history.push({
        stepOrder: instance.currentStep,
        action: actionName,
        userId,
        message
      });

      // Appliquer les changements d'état
      if (action.stateChanges) {
        await this.applyStateChanges(instance.entityId, instance.entityType, action.stateChanges);
      }

      // Déterminer la prochaine étape
      if (action.nextStep === 'end') {
        instance.status = actionName === 'approve' ? 'APPROVED' : 'REJECTED';
      } else {
        instance.currentStep = parseInt(action.nextStep);
      }

      await instance.save();
      console.log(`Action '${actionName}' exécutée sur le workflow ${workflow.name}`);

      // Convertir l'instance pour GraphQL
      const result = {
        id: instance._id.toString(),
        workflowId: instance.workflowId.toString(),
        entityId: instance.entityId.toString(),
        entityType: instance.entityType,
        currentStep: instance.currentStep,
        status: instance.status,
        history: instance.history.map(entry => ({
          stepOrder: entry.stepOrder,
          action: entry.action,
          userId: entry.userId.toString(),
          message: entry.message,
          timestamp: entry.timestamp
        })),
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt
      };

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
      throw error;
    }
  }

  /**
   * Applique les changements d'état à l'entité
   */
  async applyStateChanges(entityId, entityType, stateChanges) {
    try {
      if (entityType === 'User') {
        const user = await User.findById(entityId);
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }

        for (const change of stateChanges) {
          user[change.field] = change.value;
        }

        await user.save();
        console.log(`Changements d'état appliqués à l'utilisateur ${entityId}`);
      }
      // Ajouter d'autres types d'entités ici si nécessaire
    } catch (error) {
      console.error('Erreur lors de l\'application des changements d\'état:', error);
      throw error;
    }
  }

  /**
   * Récupère les instances de workflow en attente pour un utilisateur
   */
  async getPendingInstancesForUser(userId, userRole) {
    try {
      console.log('🔍 Service: getPendingInstancesForUser - userId:', userId, 'role:', userRole);
      
      const instances = await WorkflowInstance.find({ status: 'PENDING' });
      
      console.log('🔍 Service: Found instances:', instances.length);
      console.log('🔍 Service: First instance workflowId:', instances[0]?.workflowId);

      // Convertir les instances pour GraphQL
      const convertInstance = (instance) => ({
        id: instance._id.toString(),
        workflowId: instance.workflowId.toString(),
        entityId: instance.entityId.toString(),
        entityType: instance.entityType,
        currentStep: instance.currentStep,
        status: instance.status,
        history: instance.history.map(entry => ({
          stepOrder: entry.stepOrder,
          action: entry.action,
          userId: entry.userId.toString(),
          message: entry.message,
          timestamp: entry.timestamp
        })),
        createdAt: instance.createdAt,
        updatedAt: instance.updatedAt
      });

      // L'admin peut voir toutes les instances
      if (userRole === 'Admin') {
        console.log('🔍 Service: Admin user, returning all instances');
        return instances.map(convertInstance);
      }

      // Pour les autres rôles, filtrer selon les permissions
      const filteredInstances = [];
      for (const instance of instances) {
        const workflow = await Workflow.findById(instance.workflowId);
        console.log('🔍 Service: Checking instance workflow:', workflow?.name);
        const currentStep = workflow.steps.find(step => step.order === instance.currentStep);
        console.log('🔍 Service: Current step:', currentStep?.order, 'allowed roles:', currentStep?.allowedRoles);
        const hasPermission = currentStep && currentStep.allowedRoles.includes(userRole);
        console.log('🔍 Service: Has permission:', hasPermission);
        if (hasPermission) {
          filteredInstances.push(instance);
        }
      }
      
      console.log('🔍 Service: Filtered instances:', filteredInstances.length);
      return filteredInstances.map(convertInstance);
    } catch (error) {
      console.error('Erreur lors de la récupération des instances en attente:', error);
      throw error;
    }
  }
}

export default new WorkflowService(); 