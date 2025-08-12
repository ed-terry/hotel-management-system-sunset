import express from 'express';
import { AuthService } from './authService';
import { authenticateToken, requireAdmin, AuthRequest } from './middleware';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await AuthService.login(
            { email, password },
            req.ip,
            req.get('User-Agent')
        );

        res.json(result);
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error instanceof Error ? error.message : 'Login failed' });
    }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            await AuthService.logout(token);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Register endpoint (Admin only)
router.post('/register', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Email, password, first name, and last name are required'
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters long'
            });
        }

        const result = await AuthService.register(
            { email, password, firstName, lastName, role },
            req.user!.id
        );

        res.status(201).json(result);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' });
    }
});

// Validate token endpoint
router.get('/validate', authenticateToken, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const newToken = await AuthService.refreshToken(token);
        res.json({ token: newToken });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Token refresh failed' });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

export default router;
