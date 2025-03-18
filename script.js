
const ws = new WebSocket('ws://localhost:3000');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message');

// Function to generate random name
const generateRandomName = () => {
    const adjectives = ['Happy', 'Lucky', 'Clever', 'Brave', 'Wise', 'Cool', 'Swift', 'Kind'];
    const nouns = ['Panda', 'Tiger', 'Eagle', 'Lion', 'Dolphin', 'Fox', 'Wolf', 'Bear'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj}${randomNoun}`;
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
            message.textContent = `${data.username} joined the chat`;
            message.style.color = '#888';
        } else if (data.type === 'message') {
            message.textContent = `${data.username}: ${data.text}`;
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
}