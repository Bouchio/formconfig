import mongoose from 'mongoose';
import Workflow from '../models/workflow.model.js';

// Configuration de la connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/form-builder';

async function createSampleWorkflow() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connecté à MongoDB');

    // Supprimer les workflows existants pour éviter les doublons
    await Workflow.deleteMany({ name: 'Validation Utilisateur' });

    const sampleWorkflow = new Workflow({
      name: 'Validation Utilisateur',
      description: 'Workflow pour approuver la création de nouveaux utilisateurs',
      trigger: 'USER_CREATED',
      isActive: true,
      steps: [
        {
          order: 1,
          allowedRoles: ['RH'],
          actions: [
            {
              name: 'approve',
              nextStep: 2,
              stateChanges: [
                {
                  field: 'isActive',
                  value: true
                }
              ],
              allowMessage: true
            },
            {
              name: 'reject',
              nextStep: 'end',
              stateChanges: [],
              allowMessage: true
            }
          ]
        },
        {
          order: 2,
          allowedRoles: ['Directeur'],
          actions: [
            {
              name: 'approve',
              nextStep: 'end',
              stateChanges: [],
              allowMessage: true
            },
            {
              name: 'reject',
              nextStep: 1,
              stateChanges: [
                {
                  field: 'isActive',
                  value: false
                }
              ],
              allowMessage: true
            }
          ]
        }
      ]
    });

    await sampleWorkflow.save();
    console.log('Workflow d\'exemple créé avec succès:', sampleWorkflow.name);
    console.log('ID du workflow:', sampleWorkflow._id);

  } catch (error) {
    console.error('Erreur lors de la création du workflow:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleWorkflow();
}

export default createSampleWorkflow; 