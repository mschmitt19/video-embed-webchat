<a  href="https://www.twilio.com">
<img  src="https://static0.twilio.com/marketing/bundles/marketing/img/logos/wordmark-red.svg"  alt="Twilio"  width="250"  />
</a>

# Twilio Video Session Embed in _Webchat React App_

This repository demonstrates how to embed a Twilio Video Session inside the Twilio Webchat React App for a `1:1` video room between customer and agent.

This solution adds on multiple custom components relating to Twilio Video into the pre-existing [Twilio Webchat React App](https://github.com/twilio/twilio-webchat-react-app) example. From the [README](https://github.com/twilio/twilio-webchat-react-app/blob/main/README.md):

```
Twilio Webchat React App is an application that demonstrates a website chat widget built for Flex Conversations. It uses Twilio's Conversations JS SDK, Twilio Paste Design library, the Flex WebChats endpoint, and the Create React App.
```

---

## Functionality Overview

Within this web chat example, when a video session is initiated by the Agent (within Flex plugin), a special message is rendered with a button for the customer to click to join the video session. Once clicked, the video session appears within the webchat header. The customer will not be connected to the video session until the agent joins the room.

**Note**: this webchat add-on builds off the [Chat to Video Escalation Flex Plugin](https://github.com/mschmitt19/plugin-video-in-flex), which is required to setup and test this video embed functionality.

---

## Setup Instructions

To setup and test embedding video into the Webchat React app, this requires setting up the [Chat to Video Escalation Flex Plugin](https://github.com/mschmitt19/plugin-video-in-flex), deploying the associated `Twilio Functions & Assets`, then setting up the Webchat example in this repo.

### Chat to Video Flex Plugin

To setup the Chat to Video Flex Plugin, please visit [this repository](https://github.com/mschmitt19/plugin-video-in-flex) and follow the instructions outlined in the README.

At the end of setup, you should have your Twilio Functions & Assets deployed and the Flex plugin running.

### Webchat Configuration

For detailed instructions on getting this repository configured and running (webchat), please see the [Twilio Webchat React App README](https://github.com/twilio/twilio-webchat-react-app/blob/main/README.md).

---

## Changelog

### 1.0.0

**August 31, 2022**

-   Updated README & Initial Commits
