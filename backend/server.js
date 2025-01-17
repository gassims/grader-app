const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRouter = require("./api/form-submit.js");
const app = express();
require("dotenv").config();

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log("Incoming Request:", {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
  });
  next();
});

const whitelist = process.env.WHITELIST_ORIGINS
  ? process.env.WHITELIST_ORIGINS.split(",")
  : [];

// Enhanced CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin matches the allowed origin
      if (
        whitelist.indexOf(origin) !== -1 ||
        whitelist.some((allowedOrigin) => origin.startsWith(allowedOrigin))
      ) {
        return callback(null, true);
      }

      console.log("Rejected Origin:", origin);
      console.log("Allowed Origin:", whitelist);

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["POST", "GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/api", apiRouter);

// Optional: Add a simple GET route to verify server is working
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    error: "An unexpected error occurred",
    details: err.message,
  });
});

// Conditional check for local development
if (process.env.NODE_ENV === "local") {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server Listening on port ${port}`));
}

module.exports = app;
