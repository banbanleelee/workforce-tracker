require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');

// Signup
router.post('/signup', async (req, res) => {
    console.log('Signup endpoint hit');

    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!['teamMember', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Hash password using argon2
        const hashedPassword = await argon2.hash(password);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        console.log('User created successfully with _id:', newUser._id);

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    console.log('Login endpoint hit');

    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role, 
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        console.log('Returning JWT and role:', { token, role: user.role }); // Log the response
        res.json({ token, role: user.role });  
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login error' });
    }
});

// Find the logged-in user's information
router.get('/me', verifyToken(), async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            userId: user._id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
