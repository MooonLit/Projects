const express = require("express");
const router = express.Router(); // Create a new router object to handle routes
const { clients, events } = require("../models/models"); // Import the models needed for clients and events
const { Types } = require("mongoose"); // Import the Types object from mongoose to work with MongoDB ObjectId
const authMiddleware = require("../auth/authMiddleWare"); // Import the authentication middleware to secure routes

// Helper function to escape regex characters in search queries to prevent regex injection
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// GET route for searching clients based on name or phone number, secured with authMiddleware
router.get("/search", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org); // Convert organization ID from token to MongoDB ObjectId
  const dbQuery = { orgs: orgId }; // Basic database query that will be built based on user input
  const searchParams = req.query; // Extract the query parameters from the request

  try {
    // Determine the type of search based on `searchBy` parameter and modify dbQuery accordingly
    if (searchParams.searchBy === "name") {
      // Searching by name involves both first and last names with case-insensitive regex
      dbQuery["$or"] = [
        {
          firstName: {
            $regex: escapeRegex(searchParams.firstName),
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: escapeRegex(searchParams.lastName),
            $options: "i",
          },
        },
      ];
    } else if (searchParams.searchBy === "number") {
      // Searching by phone number with case-insensitive regex
      dbQuery["phoneNumber.primary"] = {
        $regex: escapeRegex(searchParams.phoneNumber),
        $options: "i",
      };
    } else {
      // Return an error if searchBy parameter is invalid
      return res.status(400).send("Invalid searchBy parameter");
    }

    // Execute the query to find matching clients
    const clientsList = await clients.find(dbQuery);
    res.json(clientsList); // Respond with the list of clients found
  } catch (err) {
    console.error("Search error:", err); // Log and handle errors
    res.status(500).send("Internal Server Error");
  }
});

// GET route to fetch all clients for a specific organization, using authMiddleware for security
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orgId = Types.ObjectId(req.org); // Convert the org ID from the token into a MongoDB ObjectId
    const cli = await clients.find({ orgs: orgId }); // Find all clients associated with the orgId
    res.json(cli); // Send the result back to the client as JSON
  } catch (err) {
    res.status(500).send(err.message); // Handle errors such as database connection issues
  }
});

// POST route to create a new client, ensuring request is authenticated
router.post("/", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org); // Ensure the new client is associated with the correct organization
  const newClient = new clients({ ...req.body, orgs: [orgId] }); // Create a new client with orgId included in the organization array

  try {
    await newClient.save(); // Save the new client document to the database
    res.status(201).send("New client created successfully"); // Return success message
  } catch (err) {
    res.status(500).send(err.message); // Handle exceptions, like validation errors or save failures
  }
});

// PUT route to update an existing client's information, secured with authMiddleware
router.put("/:id", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org); // Convert org ID from token to MongoDB ObjectId to ensure correct scope

  try {
    // Update the client specified by id only if they belong to the right organization
    const updatedClient = await clients.findOneAndUpdate(
      { _id: req.params.id, orgs: orgId },
      req.body,
      { new: true, runValidators: true } // Options to return the updated document and run schema validators
    );
    if (!updatedClient) {
      return res.status(404).send("Client not found"); // Handle case where no client is found for the ID
    }
    res.status(200).send("Client updated successfully"); // Respond with a success message
  } catch (err) {
    res.status(500).send(err.message); // Handle errors such as update failures
  }
});

// DELETE route to remove a client, ensuring the client is not signed up for events, authenticated via authMiddleware
router.delete("/:id", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org); // Ensure operations are scoped to the right organization

  try {
    // First check if the client exists and is part of the correct organization
    const clientToDelete = await clients.findOne({
      _id: req.params.id,
      orgs: orgId,
    });
    if (!clientToDelete) {
      return res.status(404).send("Client not found"); // Handle client not found scenario
    }

    // Check if the client is signed up for any events, preventing deletion if they are
    const eventsWithClient = await events.find({
      attendees: req.params.id,
      org: orgId,
    });
    if (eventsWithClient.length > 0) {
      return res
        .status(406)
        .send("Client is signed up for events and can't be deleted.");
    }

    // If no events are found, proceed to delete the client
    await clients.findByIdAndDelete(req.params.id);
    res.status(200).send("Client deleted successfully"); // Confirm deletion with a success message
  } catch (err) {
    res.status(500).send(err.message); // Handle other errors like database issues
  }
});

// GET route to count clients by ZIP code within an organization, protected by authMiddleware
router.get("/byzip", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org); // Convert org ID from token to ObjectId
  try {
    // Aggregate to count clients by ZIP code where ZIP code is defined and non-empty
    const clientCountByZip = await clients.aggregate([
      { $match: { "address.zip": { $exists: true, $ne: "" }, orgs: orgId } },
      { $group: { _id: "$address.zip", count: { $sum: 1 } } }, // Group by ZIP code and count
    ]);
    res.json(clientCountByZip); // Send aggregated data back as JSON
  } catch (err) {
    res.status(500).send(err.message); // Handle potential errors in the aggregation process
  }
});

// GET route to fetch a single client by ID, secured with authMiddleware
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const orgId = Types.ObjectId(req.org); // Ensure client is queried within the correct organization context
    const cli = await clients.findOne({ _id: req.params.id, orgs: orgId }); // Retrieve the specific client by ID
    if (!cli) {
      return res.status(404).send("Client not found"); // Handle not found error if client does not exist
    }
    res.json(cli); // Return the found client data as JSON
  } catch (err) {
    res.status(500).send(err.message); // Handle database connection or query errors
  }
});

module.exports = router;
