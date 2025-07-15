import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import session from "express-session";
import passport from "./middleware/passport.js";
import typeDefs from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";
import mongoose from "mongoose";

dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Connexion à MongoDB avec Mongoose
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ Connected to MongoDB with Mongoose");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  // Configuration CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Middleware pour parser le JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configuration des sessions
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Mettre à true en production avec HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
      }
    })
  );

  // Initialisation de Passport
  app.use(passport.initialize());
  app.use(passport.session());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  app.use(
    "/graphql",
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        return { req, user: req.user };
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