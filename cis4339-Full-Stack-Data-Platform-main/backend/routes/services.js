const express = require("express");
const router = express.Router(); // Create a router object for managing routes
const { services, events } = require("../models/models"); // Import the Mongoose models for services and events
const authMiddleware = require("../auth/authMiddleWare"); // Middleware to handle authentication and authorization
const { Types } = require("mongoose"); // Utility from Mongoose for handling ObjectId types

// Middleware to validate organization ID on all requests
router.get("/", authMiddleware, (req, res) => {
  if (!req.org) {
    // Check if organization ID is present in user's token, return error if not
    return res
      .status(400)
      .json({ message: "Organization ID not found in user's token" });
  }
  // Convert string organization ID from the token into a MongoDB ObjectId
  const orgId = Types.ObjectId(req.org);

  // Retrieve all services for the given organization
  services
    .find({ org: orgId })
    .then((data) => {
      res.json(data); // Send the retrieved data as a JSON response
    })
    .catch((error) => {
      // Handle errors if the database query fails
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error fetching services", error });
    });
});

// Route to handle search functionality with filters based on query parameters
router.get("/search", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org); // Ensure organization ID is valid
  const dbQuery = { org: orgId }; // Base query includes organization ID
  const searchParams = req.query; // Get search parameters from the query string

  try {
    // Determine the field to search by, and use a regular expression for partial matching
    if (searchParams.searchBy === "name") {
      dbQuery["name"] = {
        $regex: escapeRegex(searchParams.name),
        $options: "i",
      };
    } else if (searchParams.searchBy === "description") {
      dbQuery["description"] = {
        $regex: escapeRegex(searchParams.description),
        $options: "i",
      };
    } else {
      // Handle invalid search parameters
      return res.status(400).send("Invalid searchBy parameter");
    }

    console.log("Search Params:", searchParams); // Log search parameters for debugging
    console.log("Database Query:", dbQuery); // Log the constructed database query for debugging

    const serviceList = await services.find(dbQuery); // Perform the search query
    res.json(serviceList); // Return the list of services as a JSON response
  } catch (err) {
    // Handle errors during search operation
    console.error("Search error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to fetch service details by ID
router.get("/:id", authMiddleware, (req, res, next) => {
  console.log("Requested ID:", req.params.id); // Log requested service ID for debugging
  console.log("Organization ID from token:", req.org); // Log organization ID for debugging

  // Validate the format of the service ID
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid ID format");
  }

  const orgId = Types.ObjectId(req.org); // Convert organization ID to ObjectId

  // Fetch the specific service by ID and organization
  services.findOne(
    { _id: Types.ObjectId(req.params.id), org: orgId },
    (error, data) => {
      if (error) {
        // Handle database query errors
        console.error("Error fetching service:", error);
        return next(error);
      } else if (!data) {
        // Handle case where service is not found
        console.log("Service not found for ID:", req.params.id);
        return res.status(404).send("Service not found");
      } else {
        res.json(data); // Return the service data as a JSON response
      }
    }
  );
});

// Utility function to escape regular expression special characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Route to create a new service
router.post("/", authMiddleware, async (req, res) => {
  // Check if organization ID is present in user's token
  if (!req.org) {
    return res
      .status(400)
      .json({ message: "Organization ID not found in user's token" });
  }

  // Convert organization ID to ObjectId
  const orgId = Types.ObjectId(req.org);

  // Create a new service object based on request body
  const newService = new services({
    name: req.body.name,
    description: req.body.description,
    status: req.body.status,
    org: orgId,
  });

  try {
    // Save the new service to the database
    const savedService = await newService.save();
    res.status(201).json(savedService); // Return the saved service as JSON response
  } catch (error) {
    // Handle errors during service creation
    res.status(500).json({ message: "Error creating service", error });
  }
});

// Route to delete a service by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  console.log("Attempting to delete service with ID:", req.params.id);

  try {
    // Find the service to delete by ID
    const serviceToDelete = await services.findById(req.params.id);
    if (!serviceToDelete) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Remove the service from the database
    await serviceToDelete.remove();
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    // Handle errors during service deletion
    console.error("Error during service deletion:", error);
    res.status(500).json({ message: "Error deleting service", error });
  }
});

// Route to update a service by ID
router.put("/:id", authMiddleware, async (req, res) => {
  // Extract status from request body and separate other update data
  const { status, ...updateData } = req.body;
  const orgId = Types.ObjectId(req.org); // Convert organization ID to ObjectId

  try {
    // Validate status field if provided
    if (status && !["active", "inactive"].includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find and update the service in the database
    const updatedService = await services.findOneAndUpdate(
      { _id: req.params.id, org: orgId },
      { ...updateData, status: status.toLowerCase() },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(updatedService); // Return the updated service as JSON response
  } catch (error) {
    // Handle errors during service update
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Error updating service", error });
  }
});

// Export the router to be used in the main application
module.exports = router;
