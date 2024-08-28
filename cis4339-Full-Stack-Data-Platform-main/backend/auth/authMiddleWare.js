const jwt = require("jsonwebtoken");

// Middleware to authenticate and decode JWT tokens in HTTP requests
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Check if the authorization header exists or if it starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token from the header
  if (!token) {
    return res.status(401).json({ msg: "Token could not be extracted" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token with the JWT secret

    // Set the organization ID and user details in the request object from the decoded token
    req.org = decoded.org;
    req.user = decoded;
    console.log("Decoded JWT: ", decoded); // Log the decoded JWT for debugging purposes

    next(); // Continue to the next middleware
  } catch (error) {
    console.error("JWT Verification Error:", error); // Log the error if token verification fails
    return res
      .status(401)
      .json({ msg: "Token is not valid", error: error.message }); // Respond with an error if the token is invalid
  }
};

module.exports = authMiddleware;
