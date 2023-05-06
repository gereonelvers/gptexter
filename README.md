# gptexter

gptexter is a WhatsApp chatbot that uses GPT-4 to generate human-like responses to messages. This project is built using the OpenAI API and the `whatsapp-web.js` library.

## Features

- Toggle automatic responses for each user with the `!gpt` command
- Store session data in MongoDB for maintaining session persistence

## Prerequisites

- Docker
- MongoDB instance

## Installation

1. Clone the repo:

   ```
   git clone https://github.com/yourusername/gptexter.git
   cd gptexter
   ```

2. Create a `.env` file with:

   ```
   OPENAI_API_KEY=<your_openai_api_key>
   MONGO_URL=<your_mongodb_url>
   PROMPT=<gpt_system_prompt_for_context>
   ```

3. Build the Docker image: `docker build -t my-gptexter .`

## Running

1. Run the app: `docker run -d --name gptexter -p 3000:3000 my-gptexter`
2. Check logs for QR code: `docker logs gptexter`
3. Scan QR code with WhatsApp mobile app.
4. Send `!gpt` to toggle auto-response.
