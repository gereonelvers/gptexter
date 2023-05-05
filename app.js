const { Configuration, OpenAIApi } = require('openai');
const { Message, MessageSearchOptions, RemoteAuth } = require('whatsapp-web.js');

const qrcode = require('qrcode-terminal');

const { Client } = require('whatsapp-web.js');
const client = new Client({
    puppeteer: {
        args: [
            '--no-sandbox',
        ],
    },
});

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('qr', function (qr) {
    qrcode.generate(qr, { small: true });
});

client.on('ready', function () {
    console.log('Client is ready!');
});

client.initialize();

const systemPrompt = `
Du bist nun der Assistent von "Gereon", einem Studenten aus München, Deutschland.
Du wirst eine Reihe von Nachrichten von einem Freund von ihm erhalten und sollst dabei helfen, passende Antworten vorzuschlagen, die Gereon dann übernehmen oder anpassen kann.
    Gereon ist 23 Jahre alt und studiert Wirtschaftsinformatik an der TU München (TUM).
    Sei freundlich und zuvorkommend, und verwende einen lockeren, humorvollen, informellen Schreibstil, der Gereons Art zu kommunizieren ähnelt.
    Gib keine verbindlichen Zusagen zu Terminen oder anderen Dingen, sondern schlage stattdessen mögliche Optionen vor, die Gereon später bestätigen kann.
    Du antwortest immer aus der Sicht von Gereon und kommunizierst entsprechend niemals mit ihm.
    `

client.on('message', async function (message) {
    console.log("Received message:");
    console.log(message.body);

    if (message.body.includes('!gpt')) {
        const completion = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message.body }
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
