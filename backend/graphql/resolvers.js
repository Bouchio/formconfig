import User from "../models/user.model.js";
import FormConfig from "../models/formConfig.model.js";

const resolvers = {
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
  },
};

export default resolvers;