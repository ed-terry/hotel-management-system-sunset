import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { initializeDatabase } from './db';
import authRoutes from './auth/routes';
import { AuthService } from './auth/authService';

// Load environment variables
dotenv.config();

async function startApolloServer() {
    // Required logic for integrating with Express
    const app = express();
    const httpServer = http.createServer(app);

    // Initialize database connection
    await initializeDatabase();

    // Create default admin user
    await AuthService.createDefaultAdmin();

    // Set up CORS
    const corsOptions = {
        origin: [
            process.env.CLIENT_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003'
        ],
        credentials: true,
    };

    app.use(cors(corsOptions));
    app.use(json());

    // Add auth routes
    app.use('/auth', authRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Create Apollo server
    const server = new ApolloServer({
        typeDefs,
        resolvers: resolvers as any,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    // Start the server
    await server.start();

    // Set up GraphQL middleware with authentication context
    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                const token = req.headers.authorization?.replace('Bearer ', '');
                let user = null;

                if (token) {
                    try {
                        user = await AuthService.validateToken(token);
                    } catch (error) {
                        // Token is invalid, user remains null
                    }
                }

                return { user, token };
            },
        }),
    );

    // Cleanup expired sessions every hour
    setInterval(() => {
        AuthService.cleanupExpiredSessions().catch(console.error);
    }, 60 * 60 * 1000);

    // Start the server
    const PORT = process.env.PORT || 4000;
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🔐 Auth endpoints available at http://localhost:${PORT}/auth`);
}

startApolloServer().catch((error) => {
    console.error('Failed to start server:', error);
});
