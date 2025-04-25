// Necessary packages:
// Install: npm install axios

const fs = require('fs');
const readline = require('readline');
const axios = require('axios');

// Settings
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'YOUR_WEBHOOK_URL';
const LOGFILE_NAME = 'PATH_TO_YOUR_LOG_FILE.log.txt'; // Replace with your log file path
const MAX_PLAYERS = 128;

if (!WEBHOOK_URL) {
    console.error("Erro: Variável de ambiente WEBHOOK_URL não configurada.");
    process.exit(1);
}

if (!fs.existsSync(LOGFILE_NAME)) {
    console.error(`Error: Log file '${LOGFILE_NAME}' not found.`);
    process.exit(1);
}

console.log(`Starting to process the log file '${LOGFILE_NAME}'...`);

// Variables to track player connections
let connectedPlayers = new Map();
let currentPlayers = 0;
let processedLines = new Set();
let lastFileSize = 0;

// Function to send messages to Discord
async function sendToDiscord(embed) {
    const payload = {
        username: "Log Monitor",
        embeds: [embed] // Send just one embed
    };

    try {
        await axios.post(WEBHOOK_URL, payload);
    } catch (error) {
        console.error("Error sending discord message:", error.message);
    }
}

// Function to process each line of the log
async function processLine(line) {
    if (processedLines.has(line)) return; // Avoid processing the same line multiple times
    processedLines.add(line);

    if (line.includes("[Chat]") || line.includes("[MP] State: running")) return;

    const match = line.match(/\[MP\] (.*) (connected|disconnected)/);
    if (!match) return;

    let playerName = match[1];
    const action = match[2];

    if (playerName === "Steam") return; // Ignore Steam messages

    if (playerName.startsWith("PRF")) {
        playerName = `🚔 ${playerName}`;
    }

    let embed = null;

    if (action === "connected") {
        if (!connectedPlayers.has(playerName)) {
            connectedPlayers.set(playerName, true);
            currentPlayers++;

            embed = {
                description: `**${playerName}** connected (${currentPlayers}/${MAX_PLAYERS})`,
                color: 3066993 // green
            };
            await sendToDiscord(embed);
        }
    } else if (action === "disconnected") {
        if (connectedPlayers.has(playerName)) {
            connectedPlayers.delete(playerName);
            currentPlayers--;

            embed = {
                description: `**${playerName}** disconnected (${currentPlayers}/${MAX_PLAYERS})`,
                color: 15158332 // red
            };
            await sendToDiscord(embed);
        }
    }
}

// Restart the state when the log is rewritten
function resetState() {
    console.log("Log rewitten. Restarting players count...");
    connectedPlayers = new Map();
    currentPlayers = 0;
    processedLines = new Set();
}

// Process the initial state of the log file
console.log("Process whole log file...");
const rl = readline.createInterface({
    input: fs.createReadStream(LOGFILE_NAME),
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    processLine(line);
});

rl.on('close', async () => {
    console.log("Realtime log monitoring...");
    fs.watchFile(LOGFILE_NAME, { interval: 1000 }, (curr, prev) => {
        if (curr.size < lastFileSize) {
            resetState();
        }
        lastFileSize = curr.size;

        const stream = fs.createReadStream(LOGFILE_NAME, { start: prev.size });
        const rlTail = readline.createInterface({
            input: stream,
            output: process.stdout,
            terminal: false
        });

        rlTail.on('line', async (line) => {
            await processLine(line);
        });
    });
});

