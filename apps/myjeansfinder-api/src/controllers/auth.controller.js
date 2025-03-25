const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const user = require('../models/user');
const JWT_SECRET = 'your-secret-key';

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await user.find((user) => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new user({
      name: username,
      email,
      password, //Passwoed hashed by pre-save hook in user model
    });

    // Save user to database
    await newUser.save();

    // Return success response (omit password)
    const { password: _, salt, ...userWithoutPassword } = newUser.toObject();
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await user.find((user) => user.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const PasswordIsValid = await user.comparePassword(password);
    if (!PasswordIsValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: 86400, // 24 hours
      }
    );

    // Return user info and token
    const { password: _, salt, ...userWithoutPassword } = user.toObject();
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
