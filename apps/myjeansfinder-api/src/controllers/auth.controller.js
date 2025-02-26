const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = [];
const JWT_SECRET = 'your-secret-key';

exports.register = (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = users.find((user) => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Create a new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
    };

    // Save user (array atm, database later)
    users.push(newUser);

    // Return success response (omit password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const PasswordIsValid = bcrypt.compareSync(password, user.password);
    if (!PasswordIsValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    // Return user info and token
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
};
