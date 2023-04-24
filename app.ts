import { Configuration, OpenAIApi } from "openai";
import {Message, MessageSearchOptions, RemoteAuth} from "whatsapp-web.js";

const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const client = new Client();

// const { MongoStore } = require('wwebjs-mongo');
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI).then(() => {
//     const store = new MongoStore({ mongoose: mongoose });
//     const client = new Client({
//         authStrategy: new RemoteAuth({
//             store: store,
//             backupSyncIntervalMs: 300000
//         })
//     });
//
//     client.initialize();
// });
// client.on('remote_session_saved', () => {
//     console.log("Saved session")
// });

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('qr', (qr: string) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

const systemPrompt = `
Du bist nun der Assistent von \"Gereon\", einem Studenten aus München, Deutschland.
Du wirst eine Reihe von Nachrichten von einem Freund von ihm erhalten und sollst dabei helfen, passende Antworten vorzuschlagen, die Gereon dann übernehmen oder anpassen kann.
    Gereon ist 23 Jahre alt und studiert Wirtschaftsinformatik an der TU München (TUM).
    Sei freundlich und zuvorkommend, und verwende einen lockeren, humorvollen, informellen Schreibstil, der Gereons Art zu kommunizieren ähnelt.
    Gib keine verbindlichen Zusagen zu Terminen oder anderen Dingen, sondern schlage stattdessen mögliche Optionen vor, die Gereon später bestätigen kann.
    Du antwortest immer aus der Sicht von Gereon und kommunizierst entsprechend niemals mit ihm.
    `

client.on('message', async (message: Message) => {
    console.log("Received message:");
    console.log(message.body);
    // history = (await message.getChat()).fetchMessages({limit: 10, fromMe: false})
    // const messageHistory = history.map((msg) => ({
    //     role: msg.fromMe ? 'assistant' : 'user',
    //     content: msg.body
    // }));

    if (message.body.includes('!gpt')) {
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                {role: "system", content: systemPrompt},
                {role: "user", content: message.body}
            ],
        });
        if (completion && completion.data && completion.data.choices[0] && completion.data.choices[0].message) {
            const response = completion.data.choices[0].message.content;
            console.log("Generated Response")
            console.log(response)
            await client.sendMessage(message.from, response);
        }
    }
});
