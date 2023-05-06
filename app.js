/*
 * GPT-WhatsApp: A WhatsApp bot that uses GPT-4 to generate human-like responses to messages.
 * Built with OpenAI API and whatsapp-web.js
 */

const { Configuration, OpenAIApi } = require('openai');
const { Client, RemoteAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');

// Initialize OpenAI API configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// GPT-4 assistant system prompt
const systemPrompt = process.env.PROMPT;

// Auto-response state for each user
const autoResponseState = {};

mongoose.connect(process.env.MONGO_URL).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        puppeteer: {
            args: [
                '--no-sandbox',
            ],
        },
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 600000
        })
    });

    // Event handlers
    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });
    client.on('ready', () => {
        console.log('Client is ready!');
    });
    client.on('remote_session_saved', () => {
        console.log('Saved session login!');
    });
    client.on('message', handleMessage);
    client.initialize();


// Helper functions

    function handleMessage(message) {
        console.log("Received message:", message.body);

        if (message.body.toLowerCase().includes('!gpt')) {
            toggleAutoResponse(message);
        }

        if (autoResponseState[message.from]) {
            generateAndSendResponse(message);
        }
    }

    async function generateAndSendResponse(message) {
        const messages = await fetchAndPrepareMessages(message);
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages,
        });

        if (completion && completion.data && completion.data.choices[0] && completion.data.choices[0].message) {
            const response = completion.data.choices[0].message.content;
            console.log("Generated Response:", response);
            await client.sendMessage(message.from, response);
        }
    }

    function toggleAutoResponse(message) {
        if (typeof autoResponseState[message.from] === 'undefined') {
            // Initialize user's auto-response state if not set
            autoResponseState[message.from] = false;
        } else {
            autoResponseState[message.from] = !autoResponseState[message.from];
        }
        console.log('Auto response toggled for user:', message.from, autoResponseState[message.from]);
    }

    async function fetchAndPrepareMessages(message) {
        const searchOptions = { limit: 20 };
        const messages = await (await message.getChat()).fetchMessages(searchOptions);
        const apiMessages = [{ role: "system", content: systemPrompt }];

        messages.reverse().forEach((msg) => {
            const role = msg.author === message.from ? 'user' : 'assistant';
            apiMessages.push({ role, content: msg.body });
        });

        return apiMessages;
    }
});
