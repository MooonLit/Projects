// This file contains API endpoints for interacting with the "events" collection in the MongoDB database
const express = require("express");
const router = express.Router();

const org = process.env.ORG_ID;

// Middleware for authorization. For API calls that require authorization, this middleware checks if the header of API calls have a valid security token. If no security token or invalid security token, then the API call is not made.
const authMiddleWare = require("../auth/authMiddleWare");

// importing data model schemas
const { events, clients, services } = require("../models/models");
const authMiddleware = require("../auth/authMiddleWare");
const { Types } = require("mongoose");
const { ObjectId } = require("mongodb");

router.get("/", authMiddleware, (req, res) => {
  if (!req.org) {
    return res
      .status(400)
      .json({ message: "Organization ID not found in user's token" });
  }

  // Convert the org string to an ObjectId
  const orgId = Types.ObjectId(req.org);

  events
    .find({ org: orgId })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Error fetching events", error });
    });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get("/search", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org);
  const dbQuery = { org: orgId };
  const searchParams = req.query;

  try {
    if (searchParams.searchBy === "name") {
      dbQuery["name"] = {
        $regex: escapeRegex(searchParams.name),
        $options: "i",
      };
    } else if (searchParams.searchBy === "date") {
      const eventDate = new Date(searchParams.eventDate);
      const nextDay = new Date(eventDate);
      nextDay.setDate(eventDate.getDate() + 1);

      dbQuery["date"] = { $gte: eventDate, $lt: nextDay };
    } else {
      return res.status(400).send("Invalid searchBy parameter");
    }
    console.log("Search Params:", searchParams);
    console.log("Database Query:", dbQuery);

    const eventsList = await events.find(dbQuery);
    res.json(eventsList);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// API endpoint to GET single event by ID
router.get("/:id", authMiddleware, (req, res, next) => {
  console.log("Requested ID:", req.params.id);
  console.log("Organization ID from token:", req.org);

  // Check if the id is a valid ObjectId
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send("Invalid ID format");
  }

  const orgId = Types.ObjectId(req.org);

  events.findOne(
    { _id: Types.ObjectId(req.params.id), org: orgId },
    (error, data) => {
      if (error) {
        console.error("Error fetching service:", error);
        return next(error);
      } else if (!data) {
        console.log("Event not found for ID:", req.params.id);
        return res.status(404).send("Event not found");
      } else {
        res.json(data);
      }
    }
  );
});

// API endpoint to GET events for which a client is signed up
router.get("/client/:id", authMiddleWare, (req, res, next) => {
  // Assuming 'req.org' is the organization ID string passed through middleware or headers
  const clientId = req.params.id;
  const orgId = new ObjectId(req.org); // Converts string to ObjectId

  events.find({ attendees: clientId, org: orgId }, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// API endpoint to GET events for which a client is not signed up

router.get(
  "/client/:id/not-registered",
  authMiddleware,
  getEventsNotRegisteredForClient
);

async function getEventsNotRegisteredForClient(req, res, next) {
  const clientId = req.params.id;
  const orgId = new ObjectId(req.org); // Correctly use 'new' with ObjectId constructor

  try {
    const eventsNotRegistered = await events.find({
      attendees: { $nin: [new ObjectId(clientId)] }, // Correctly use 'new' with ObjectId for attendees comparison
      org: orgId,
    });
    res.json(eventsNotRegistered);
  } catch (error) {
    console.error(
      "Error fetching non-registered events for client:",
      clientId,
      error
    );
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
}

// API endpoint to GET attendee details for an event
router.get("/attendees/:id", authMiddleware, getAttendeesForEvent);

async function getAttendeesForEvent(req, res, next) {
  try {
    const event = await events.findById(req.params.id).exec();
    if (!event) {
      res.status(404).send("Event not found");
      return;
    }

    if (event.attendees && event.attendees.length > 0) {
      const attendees = await clients
        .find({ _id: { $in: event.attendees } })
        .exec();
      res.json(attendees);
    } else {
      res.json([]); // No attendees to display
    }
  } catch (error) {
    console.error("Error fetching attendees:", error);
    res.status(500).send("Error fetching attendees");
  }
}

router.get("/service/:id", authMiddleWare, async (req, res, next) => {
  const serviceId = req.params.id;
  console.log("Looking for events with service ID:", serviceId);

  if (!Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Invalid Service ID format" });
  }

  try {
    const orgId = Types.ObjectId(req.org); // Make sure req.org is a valid ObjectId
    console.log("Organization ID from token:", orgId);

    const matchingEvents = await events
      .find({
        services: { $in: [serviceId] },
        org: orgId, // Ensure this is the correct field in your schema
      })
      .select({ _id: 1, name: 1, date: 1, "address.line1": 1, status: 1 }) // Added status field here
      .lean();

    if (matchingEvents.length === 0) {
      console.log("No events found for service ID:", serviceId);
      return res
        .status(404)
        .json({ message: "No events found for this service" });
    }

    res.json(matchingEvents);
  } catch (error) {
    console.error("Error fetching events with service:", error);
    next(error);
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org);
  const newEvent = new events({ ...req.body, orgs: [orgId] });

  try {
    await newEvent.save();
    res.status(201).send("New event created successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API endpoint to PUT -> update event
router.delete("/:id", authMiddleware, async (req, res) => {
  const orgId = Types.ObjectId(req.org); // Assuming req.org is the way to get the org ID from the request

  try {
    const eventToDelete = await events.findOne({
      _id: req.params.id,
      org: orgId,
    });
    if (!eventToDelete) {
      return res.status(404).send("Event not found");
    }

    // only delete the event if no clients are signed up
    if (eventToDelete.attendees && eventToDelete.attendees.length === 0) {
      await events.findByIdAndDelete(req.params.id);
      return res.status(200).send("Event deleted successfully");
    } else {
      return res.status(406).send("Event has attendees and can't be deleted.");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API endpoint to PUT -> add attendee to event
router.put("/register", authMiddleware, addAttendeeToEvent);

async function addAttendeeToEvent(req, res, next) {
  const { event, client } = req.query;
  if (!Types.ObjectId.isValid(event) || !Types.ObjectId.isValid(client)) {
    res.status(400).json({ message: "Invalid event or client ID format" });
    return;
  }
  try {
    const updatedEvent = await events.findByIdAndUpdate(
      event,
      { $addToSet: { attendees: client } },
      { new: true }
    );
    if (!updatedEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json({
      message: "Client added to event successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error adding attendee to event:", error);
    next(error); // Pass to error handling middleware
  }
}

// API endpoint to PUT -> remove attendee from event
router.put("/deregister", authMiddleware, removeAttendeeFromEvent);

async function removeAttendeeFromEvent(req, res, next) {
  const { event, client } = req.query;
  if (!Types.ObjectId.isValid(event) || !Types.ObjectId.isValid(client)) {
    res.status(400).json({ message: "Invalid event or client ID format" });
    return;
  }
  try {
    const updatedEvent = await events.findByIdAndUpdate(
      event,
      { $pull: { attendees: client } },
      { new: true }
    );
    if (!updatedEvent) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json({
      message: "Client removed from event successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error removing attendee from event:", error);
    next(error); // Pass to error handling middleware
  }
}

router.put("/:id", authMiddleWare, (req, res, next) => {
  const { org } = req; // Assuming 'org' is provided in the request context, e.g., from middleware
  events.findOne({ _id: req.params.id, org: org }, (error, event) => {
    if (error) {
      return next(error);
    } else if (!event) {
      res.status(404).send("Event not found");
    } else {
      // Only update event if there are no attendees
      if (event.attendees.length === 0) {
        // Update data should come from req.body and should be validated either here or in a middleware
        const updateData = req.body;
        events.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true },
          (error, updatedEvent) => {
            if (error) {
              return next(error);
            } else if (!updatedEvent) {
              res.status(404).send("Event not found");
            } else {
              res.status(200).json(updatedEvent);
            }
          }
        );
      } else {
        res.status(400).send("Event has attendees and can't be updated.");
      }
    }
  });
});

// API endpoint to hard DELETE event by ID
router.delete("/:id", authMiddleWare, (req, res, next) => {
  events.findOne({ _id: req.params.id, org: org }, (error, data) => {
    if (error) {
      return next(error);
    } else if (!data) {
      res.status(400).send("Event not found");
    } else {
      // only delete event if no clients are signed up
      if (data.attendees.length === 0) {
        events.findOneAndDelete(
          { _id: req.params.id, org: org },
          (error, data) => {
            if (error) {
              return next(error);
            } else if (!data) {
              res.status(400).send("Event not found");
            } else {
              res.status(200).send("Event deleted successfully");
            }
          }
        );
      } else {
        res.status(400).send("Event has attendees and can't be deleted.");
      }
    }
  });
});

// GET event attendance for the past two months for dashboard
router.get("/attendance", (req, res, next) => {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  events
    .find({ org: org, date: { $gte: twoMonthsAgo } }, (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    })
    .sort({ date: 1 });
});

module.exports = router;
