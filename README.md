# Gmail Integration POC

This proof of concept demonstrates how to integrate Google OAuth for Gmail access and set up notifications for incoming emails using Node.js, Express, and the Google API.

## Prerequisites

- Node.js installed.
- A Google Cloud project with Gmail API enabled.
- OAuth credentials created for the project.
- A Google Cloud Pub/Sub topic created for Gmail notifications.
- Setup permissions for the topic:
    - Principal: gmail-api-push@system.gserviceaccount.com
    - Role: Pub/Sub Publisher