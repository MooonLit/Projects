const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define an optional address schema to structure address data consistently across collections
const addressSchema = new Schema({
  line1: String, // Address line 1
  line2: String, // Address line 2 (optional)
  city: { type: String, required: true }, // City, required field
  county: String, // County, optional field
  zip: String, // Postal code, optional field
});

// Define a schema for organizations
const orgDataSchema = new Schema(
  {
    name: { type: String, required: true }, // Organization name, required field
  },
  {
    collection: "orgs", // Explicitly define which collection to use in MongoDB
  }
);

// Define a schema for user data
const userDataSchema = new Schema(
  {
    username: { type: String, required: true }, // Username, required field
    password: { type: String, required: true }, // User password, required field
    role: {
      // Define user roles
      type: String,
      required: true,
      enum: {
        values: ["viewer", "editor"], // Only 'viewer' or 'editor' roles allowed
        message: "{VALUE} is not supported", // Custom error message if an invalid role is provided
      },
    },
    org: { type: mongoose.Schema.Types.ObjectId, ref: "org", required: true }, // Reference to the organization, required field
  },
  {
    collection: "users", // Specify the MongoDB collection for users
  }
);

// Define a schema for client data
const clientDataSchema = new Schema(
  {
    firstName: { type: String, required: true }, // Client's first name, required field
    middleName: String, // Client's middle name, optional field
    lastName: { type: String, required: true }, // Client's last name, required field
    email: String, // Client's email, optional field
    phoneNumber: {
      // Structure for phone numbers
      primary: { type: String, required: true }, // Primary phone number, required field
      alternate: String, // Alternate phone number, optional field
    },
    address: addressSchema, // Embed the address schema defined above
    orgs: {
      // List of organizations the client is associated with
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "org" }],
      required: true,
      validate: [
        (org) => org.length > 0, // Custom validator to ensure at least one organization is associated
        "At least one organization is required",
      ],
    },
  },
  {
    collection: "clients", // Specify the MongoDB collection for clients
  }
);

// Define a schema for event data
const eventDataSchema = new Schema(
  {
    org: { type: mongoose.Schema.Types.ObjectId, required: true }, // Organization ID, required field
    name: { type: String, required: true }, // Event name, required field
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "services" }], // List of associated services
    date: { type: Date, required: true }, // Date of the event, required field
    address: addressSchema, // Embed the same address schema
    description: String, // Optional description of the event
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "clients" }], // List of clients attending the event
  },
  {
    collection: "events", // Specify the MongoDB collection for events
  }
);

// Define a schema for service data
const serviceDataSchema = new Schema(
  {
    name: { type: String, required: true, unique: false, index: true }, // Service name, required, indexed for search optimization
    description: { type: String }, // Description of the service, optional field
    status: {
      // Status of the service
      type: String,
      enum: ["active", "inactive"], // Restrict to 'active' or 'inactive'
      required: true,
    },
    org: {
      // Reference to organization
      type: mongoose.Schema.Types.ObjectId,
      ref: "org",
      required: true,
      index: true, // Index this field for faster querying
    },
  },
  {
    collection: "services", // Specify the MongoDB collection for services
    timestamps: true, // Enable automatic creation of createdAt and updatedAt fields
  }
);

// Create a unique compound index on service name and organization ID to ensure uniqueness within an organization
serviceDataSchema.index({ name: 1, org: 1 }, { unique: true });

// Export models
module.exports = {
  clients: mongoose.model("clients", clientDataSchema),
  users: mongoose.model("users", userDataSchema),
  orgs: mongoose.model("orgs", orgDataSchema), // Exporting orgs model with 'orgs' collection
  events: mongoose.model("events", eventDataSchema),
  services: mongoose.model("services", serviceDataSchema),
};
