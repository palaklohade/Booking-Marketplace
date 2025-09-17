import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { summary, description, start, end, attendees } = req.body;

    // Setup OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const event = {
      summary,
      description,
      start: { dateTime: start, timeZone: "Asia/Kolkata" },
      end: { dateTime: end, timeZone: "Asia/Kolkata" },
      attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 30 },
          { method: "popup", minutes: 10 },
        ],
      },
      conferenceData: {
        createRequest: { requestId: Date.now().toString() },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    return res.status(200).json({ hangoutLink: response.data.hangoutLink });
  } catch (err) {
    console.error("Error creating Google Calendar event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
}