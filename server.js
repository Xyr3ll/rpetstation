const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // Use require with version 2

const app = express();
const port = 3000;

// Enable CORS for all origins (you can specify more restrictive origins if needed)
app.use(cors());

// Body parser middleware for JSON
app.use(express.json());

// Proxy endpoint to forward the request to Infobip API
app.post("/send-sms", async (req, res) => {
  const { customerPhone, customerName, status } = req.body;

  const apiKey = "80abfe78942cdf334c1f5c922791b6c4-c24207d8-fa59-4995-b578-104869a2c299"; // Replace with your Infobip API key
  const baseUrl = "https://jjqed4.api.infobip.com";
  const sender = "447491163443";
  const message = `Hello ${customerName}, your appointment status has been updated to: ${status}. Thank you!`;

  const requestBody = {
    messages: [
      {
        destinations: [{ to: customerPhone }],
        from: sender,
        text: message,
      },
    ],
  };

  try {
    const response = await fetch(`${baseUrl}/sms/2/text/advanced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `App ${apiKey}`, // Infobip uses 'App' before the API key
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (response.ok && data.messages?.[0]?.status?.groupName === "PENDING") {
      console.log(`SMS sent to ${customerPhone}`);
      return res.json({ success: true, message: "SMS queued successfully" });
    } else {
      console.error("Error sending SMS: ", data);
      return res.json({
        success: false,
        error: "Failed to send SMS",
        details: data,
      });
    }
  } catch (error) {
    console.error("Error sending SMS: ", error);
    return res.json({ success: false, error: "Failed to send SMS", details: error });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
