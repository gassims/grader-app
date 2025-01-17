const express = require("express");
const router = express.Router();
const sanitize = require("sanitize-html");
const emailValidator = require("email-validator");

// Specific route handler with detailed logging
router.post("/form-submit", async (req, res) => {
  console.log("Form Submit Endpoint Reached");
  console.log("Request Body:", req.body);

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  if (!emailValidator.validate(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  const sanitizedEmail = sanitize(email);

  const raw = JSON.stringify({
    email: `${sanitizedEmail}`,
  });

  try {
    const externalApiUrl = process.env.EXTERNAL_API_URL;

    console.log("External API URL:", externalApiUrl);
    console.log("Payload:", raw);

    const externalApiResponse = await fetch(externalApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: raw,
    });

    if (!externalApiResponse.ok) {
      throw new Error(
        `External API request failed: ${externalApiResponse.status}`
      );
    }

    const externalApiData = await externalApiResponse.json();

    res.status(200).json({
      message: "Email submitted successfully!",
      externalApiResponse: externalApiData,
    });
  } catch (error) {
    console.error("Detailed Error:", error);
    res.status(500).json({
      error: "An error occurred while processing the request.",
      details: error.message,
    });
  }
});

module.exports = router;
