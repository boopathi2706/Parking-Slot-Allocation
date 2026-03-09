const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log(`[AUTH CONTROLLER] JWT_SECRET available: ${!!process.env.JWT_SECRET}`);

exports.register = async (req, res) => {
  try {
    const { email, password, companyName, username, whatsappNumber } = req.body;
    console.log(`[REGISTER] Request received for: ${username} (${email})`);

    // 1. Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[REGISTER] Failed: Email ${email} already exists`);
      return res.status(400).json({ message: "This email is already used" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save User
    const newUser = new User({
      companyName,
      username,
      email,
      password: hashedPassword,
      whatsappNumber
    });

    const savedUser = await newUser.save();
    console.log(`[REGISTER] User saved successfully: ${savedUser._id}`);

    // 4. Initialize Dashboard for User
    const Dashboard = require('../models/Dashboard');
    const newDashboard = new Dashboard({
      user: savedUser._id,
      totalSlots: 0,
      freeSlots: 0,
      filledSlots: 0,
      todaysEntry: 0,
      todaysRevenue: 0,
      totalProfit: 0
    });
    const savedDashboard = await newDashboard.save();
    console.log(`[REGISTER] Dashboard initialized successfully:`, savedDashboard);

    // 4. Generate JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      token,
      message: "Registration successful"
    });

  } catch (error) {
    console.error(`[REGISTER] Error: ${error.message}`);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`[LOGIN] Request for: ${username}`);

    // 1. Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`[LOGIN] Failed: User ${username} not found`);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[LOGIN] Failed: Incorrect password for ${username}`);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 3. Create JWT Token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log(`[LOGIN] Success: ${username}`);
    res.status(200).json({
      success: true,
      token,
      message: "Login successful"
    });

  } catch (error) {
    console.error(`[LOGIN] Error: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};