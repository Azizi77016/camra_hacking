# camra_hacking
# Telegram Camera Capture

A simple web application to capture photos and send them to a Telegram bot. This project is designed to run on [Glitch](https://glitch.com/).

## Activation Steps

1. **Run the Project on Glitch**
   - Import this repository into a new Glitch project.
   - Open the `.env` file in your Glitch project and define the following environment variables:
     ```env
     TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
     TELEGRAM_CHAT_ID=<your-telegram-chat-id>
     GLITCH_PROJECT_URL=<your-glitch-project-url>
     ```
     - Replace `<your-telegram-bot-token>` with your Telegram bot token (create one using [BotFather](https://core.telegram.org/bots#botfather)).
     - Replace `<your-telegram-chat-id>` with the chat ID where you want to send photos.
     - Replace `<your-glitch-project-url>` with your Glitch project's public URL for uptime monitoring (optional).

2. **Access the Application**
   - Once the project is running, the application will be accessible via the Glitch project URL.

## Features

- Capture photos using the device camera.
- Upload photos to the server.
- Send photos directly to a specified Telegram chat.
- Monitor server uptime logs via Telegram bot commands.
- Manage photo uploads and display them in Telegram.

## Telegram Bot Commands

- `/start`: Displays the main menu.
- `/uploads`: Lists and sends all uploaded photos to the Telegram chat.
- `/uptimelog`: Displays the server uptime logs.
- `/help`: Provides a guide to available commands.

---

Feel free to contribute by submitting issues or pull requests. If you encounter any problems, please let me know!
