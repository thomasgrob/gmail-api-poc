require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const OAUTH_URL = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
        'https://www.googleapis.com/auth/gmail.modify'
    ]
});

console.log("OAuth URL: ", OAUTH_URL);

// Endpoint for Google OAuth Redirect
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Store tokens in database associated with user
  // For this example, we'll just log them
  console.log('Tokens:', tokens);

  // Set up watch on the user's Gmail
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  gmail.users.watch({
    userId: 'me',
    labelIds: ['INBOX'],
    requestBody: {
      topicName: `projects/${process.env.GCLOUD_PROJECT_ID}/topics/${process.env.PUBSUB_TOPIC}`
    }
  }, (err, response) => {
    if (err) {
      console.error('Error setting up Gmail watch:', err);
      res.status(500).send('Error setting up Gmail watch');
      return;
    }
    console.log('Watch response:', response.data);
    // Watch response: { historyId: 'example', expiration: '1700899685669' }
    // You'll want to handle this in your system to resubscribe before this expires
    res.send('Gmail watch set up successfully');
  });
});

// Endpoint for Pub/Sub push notifications
app.post('/notifications', (req, res) => {
  console.log('Received notification:', req.body);
  
  // Process the Gmail notification
  // ...
  // You would probably want a new auth client here with the stored token for that user above 

  res.status(200).send('Notification processed');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});