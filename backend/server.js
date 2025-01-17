const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const sanitize = require("sanitize-html");
const emailValidator = require("email-validator");
require("dotenv").config();

app.use(
  cors({
    origin: [process.env.ALLOWED_ORIGIN + ""],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/api/form-submit", async (req, res) => {
  const { email } = req.body;

  if (!emailValidator.validate(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  const sanitizedEmail = sanitize(email);

  const raw = JSON.stringify({
    email: `${sanitizedEmail}`,
  });

  try {
    const externalApiUrl = process.env.EXTERNAL_API_URL;
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

    res.json({
      message: "Email submitted successfully!",
      externalApiResponse: externalApiData,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

app.listen(5000, () => {
  console.log("Server Listening on port 5000");
});
