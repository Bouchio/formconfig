const resolvers = {
  Query: {
    users: async (_, __, { prisma }) => {
      return await prisma.user.findMany();
    },
    user: async (_, { id }, { prisma }) => {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) throw new Error("User not found");
      return user;
    },
  },
  Mutation: {
    createUser: async (_, { input }, { prisma }) => {
      return await prisma.user.create({
        data: input,
      });
    },
    updateUser: async (_, { id, input }, { prisma }) => {
      const user = await prisma.user.update({
        where: { id },
        data: input,
      });
      if (!user) throw new Error("User not found");
      return user;
    },
    deleteUser: async (_, { id }, { prisma }) => {
      const user = await prisma.user.delete({
        where: { id },
      });
      if (!user) throw new Error("User not found");
      return user;
    },
    createDraftUser: async (_, __, { prisma }) => {
      return await prisma.user.create({
        data: {
          isActive: false,
        },
      });
    },
  },
};

export default resolvers;