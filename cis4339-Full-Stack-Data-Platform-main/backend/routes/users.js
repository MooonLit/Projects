const express = require("express");
const router = express.Router(); // Initialize a new router object to handle HTTP routes
const bcrypt = require("bcrypt"); // Import bcrypt for hashing passwords (though not used in the current code)
const jwt = require("jsonwebtoken"); // Import JSON Web Token library to create tokens
const mongoose = require("mongoose"); // Import mongoose to interact with MongoDB

// Define User Schema for MongoDB using Mongoose
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true }, // Username must be provided
    password: { type: String, required: true }, // Password must be provided
    role: {
      type: String,
      required: true,
      enum: ["viewer", "editor"], // Role must be either 'viewer' or 'editor'
    },
    org: { type: mongoose.Schema.Types.ObjectId, ref: "org", required: true }, // Reference to 'org' collection
  },
  {
    collection: "users", // Specify the MongoDB collection to use
  }
);

// Create a Mongoose model from the schema defined above
const User = mongoose.model("User", userSchema);

// API endpoint to handle login requests
router.post("/login", async (req, res) => {
  try {
    // Log the request body to verify incoming data
    console.log(req.body);

    // Find the user by username
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      // Log and respond if no user is found with the given username
      console.log("User not found for username:", req.body.username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Log the stored password and the provided password for debug (not secure in production)
    console.log("Stored password:", user.password);
    console.log("Provided password:", req.body.password);

    // Check if the provided password matches the stored password
    // Note: This should use bcrypt.compare in a real scenario for security
    if (req.body.password !== user.password) {
      // Log password mismatch
      console.log("Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Prepare JWT payload with user details
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role,
      org: user.org.toString(), // Convert MongoDB ObjectId to string
    };
    console.log("JWT Payload:", payload); // Log the payload for debugging

    // Sign the JWT with the secret key and an expiration
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
      (err, token) => {
        if (err) {
          console.error("Error signing token:", err);
          return res.status(500).json({ message: "Error signing token" });
        }
        // Respond with the signed JWT
        res.json({ token });
        console.log("JWT created:", token); // Log the created JWT
      }
    );
  } catch (error) {
    // Log and respond with server error
    console.error("Login error:", error);
    res.status(500).send("Server error");
  }
});

// Export the router module to be used in other parts of the application
module.exports = router;
