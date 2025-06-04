import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";

dotenv.config();

// Sélectionner le client Prisma en fonction de DATABASE_PROVIDER
const provider = process.env.DATABASE_PROVIDER || "mongodb";
let prisma;

if (provider === "postgresql") {
  const { PrismaClient } = await import("./generated/postgresqlClient/index.js");
  prisma = new PrismaClient();
} else {
  const { PrismaClient } = await import("./generated/mongoClient/index.js");
  prisma = new PrismaClient();
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Test de connexion à la base de données
  try {
    console.log(`✅ Prisma connected to ${provider.toUpperCase()}`);
  } catch (error) {
    console.error(`❌ Failed to connect to ${provider.toUpperCase()}:`, error);
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        return { prisma };
      },
    })
  );

  const PORT = process.env.PORT || 4000;
  await new Promise((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
});