const express = require("express");
const cors = require("cors");
const fetch = require('node-fetch'); // Use require with version 2

const app = express();
const port = 3000;

// Enable CORS for all origins (you can specify more restrictive origins if needed)
app.use(cors());

// Body parser middleware for JSON
app.use(express.json());

// Proxy endpoint to forward the request to Semaphore API
app.post("/send-sms", async (req, res) => {
  const { customerPhone, customerName, status } = req.body;

  const apiKey = 'd854e321e04d8e87704d1650a53001d2'; // Your Semaphore API key

  const message = `Hello ${customerName}, your appointment status has been updated to: ${status}. Thank you!`;

  const requestBody = new URLSearchParams({
    apikey: apiKey,
    number: customerPhone,
    message: message,
  });

  try {
    const response = await fetch("https://api.semaphore.co/api/v4/messages", {
      method: "POST",
      body: requestBody,
    });

    const data = await response.json();

    if (data && data[0]?.status === 'Pending') {
      console.log(`SMS sent to ${customerPhone}`);
      return res.json({ success: true, message: 'SMS queued successfully' });
    } else {
      console.error("Error sending SMS: ", data);
      return res.json({ success: false, error: 'Failed to send SMS', details: data });
    }
  } catch (error) {
    console.error("Error sending SMS: ", error);
    return res.json({ success: false, error: 'Failed to send SMS', details: error });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
