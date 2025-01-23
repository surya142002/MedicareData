import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { logUserActivity } from "./analyticsController.js";

/**
 * Registers a new user in the system.
 * - Validates that email and password are provided.
 * - Checks for duplicate email.
 * - Hashes the password and creates a new user.
 * - Logs user registration activity.
 *
 * @param {object} req - HTTP request object containing user details.
 * @param {object} res - HTTP response object.
 */
export const register = async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the user
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      role: "user",
    });

    // Log user registration activity
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown IP";
    await logUserActivity(user.id, "register", "User registered", ipAddress);

    // Log user registration
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, role: user.role },
    });

    return { user }; // Return user for logging
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
};

/**
 * Authenticates a user by validating email and password.
 * - Issues a JWT token upon successful authentication.
 * - Logs user login activity.
 *
 * @param {object} req - HTTP request object containing email and password.
 * @param {object} res - HTTP response object.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password is valid
    const isPasswordValid = user.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    // Return error if password is invalid
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Log user login activity
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "Unknown IP";
    await logUserActivity(user.id, "login", "User logged in", ipAddress);

    // Send response here
    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    return res
      .status(500)
      .json({
        message: "An error occurred during login",
        error: error.message,
      });
  }
};

/**
 * Validates a JWT token to verify user authentication.
 * - Checks if the token is valid and not expired.
 *
 * @param {object} req - HTTP request object containing the token in headers.
 * @param {object} res - HTTP response object.
 */
export const validateToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify token and return user data
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    console.error("Token validation failed:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};
