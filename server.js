// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

// Create public directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
}

// Create script.js file
const scriptContent = `
const ws = new WebSocket('ws://localhost:3000');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message');

// Function to generate random name
const generateRandomName = () => {
    const adjectives = ['Happy', 'Lucky', 'Clever', 'Brave', 'Wise', 'Cool', 'Swift', 'Kind'];
    const nouns = ['Panda', 'Tiger', 'Eagle', 'Lion', 'Dolphin', 'Fox', 'Wolf', 'Bear'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return \`\${randomAdj}\${randomNoun}\`;
};

// User's random name
const username = generateRandomName();

// Send message with Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

ws.onopen = () => {
    const joinMessage = {
        type: 'join',
        username: username
    };
    ws.send(JSON.stringify(joinMessage));
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        const message = document.createElement('p');
        
        if (data.type === 'join') {
            message.textContent = \`\${data.username} joined the chat\`;
            message.style.color = '#888';
        } else if (data.type === 'message') {
            message.textContent = \`\${data.username}: \${data.text}\`;
        }
        
        chatBox.appendChild(message);
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        console.error('Error parsing message:', error);
    }
};

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText) {
        const messageObj = {
            type: 'message',
            username: username,
            text: messageText
        };
        ws.send(JSON.stringify(messageObj));
        messageInput.value = '';
    }
}`;

// Write script.js to public folder
fs.writeFileSync(path.join(__dirname, 'public', 'script.js'), scriptContent);

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            // Broadcast message to all clients
            const broadcastMessage = JSON.stringify(data);
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastMessage);
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));

// public/index.html
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anonymous Chat</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; background: #222; color: white; }
        #chat-box { width: 300px; height: 400px; overflow-y: auto; border: 1px solid #555; margin: 20px auto; padding: 10px; background: #333; }
        input { width: 250px; padding: 5px; }
        button { padding: 5px 10px; background: blue; color: white; border: none; }
    </style>
</head>
<body>
    <h2>Anonymous Chat</h2>
    <div id="chat-box"></div>
    <input type="text" id="message" placeholder="Type a message...">
    <button onclick="sendMessage()">Send</button>
    <script src="/script.js"></script>
</body>
</html>`;

require('fs').writeFileSync(path.join(__dirname, 'public', 'index.html'), htmlContent);
