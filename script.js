function toggleChatbot() {
    const chatbot = document.querySelector('.chatbot');
    chatbot.style.display = chatbot.style.display === 'none' || chatbot.style.display === '' ? 'flex' : 'none';
}

async function sendMessage() {
    const inputField = document.querySelector('#chatbot-textarea');
    const userMessage = inputField.value.trim();
    
    if (userMessage === "") return;

    addUserMessage(userMessage);
    inputField.value = ""; // Clear input field
    inputField.style.height = "auto"; // Reset height after sending

    const loadingMessage = createLoadingMessage();
    document.querySelector('.chatbot-messages').appendChild(loadingMessage);

    try {
        const response = await fetch("http://127.0.0.1:8001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        addBotMessage(data.response);
    } catch (error) {
        console.error("Error:", error);
        addBotMessage("An error occurred. Please try again later.");
    }

    loadingMessage.remove();
}

// Helper function to add a user's message to the chat
function addUserMessage(text) {
    const messages = document.querySelector('.chatbot-messages');

    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message-user';

    const userIcon = document.createElement('img');
    userIcon.src = 'user.png';
    userIcon.alt = 'User';

    const userText = document.createElement('div');
    userText.className = 'text';
    userText.textContent = text;

    userMessageDiv.appendChild(userText);
    userMessageDiv.appendChild(userIcon);
    messages.appendChild(userMessageDiv);

    messages.scrollTop = messages.scrollHeight; // Scroll to the latest message
}

// Helper function to add a bot's message to the chat
function addBotMessage(text) {
    const messages = document.querySelector('.chatbot-messages');

    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'message-bot';

    const botIcon = document.createElement('img');
    botIcon.src = 'bot.jpg';
    botIcon.alt = 'Bot';

    const botText = document.createElement('div');
    botText.className = 'text';
    botText.textContent = text;

    botMessageDiv.appendChild(botIcon);
    botMessageDiv.appendChild(botText);
    messages.appendChild(botMessageDiv);

    messages.scrollTop = messages.scrollHeight; // Scroll to the latest message
}

// Helper function to create a loading message
function createLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message-bot';
    loadingDiv.innerHTML = `
        <img src="bot.jpg" alt="Bot">
        <div class="text">Thinking...</div>
    `;
    return loadingDiv;
}

document.addEventListener('DOMContentLoaded', function () {
    const inputField = document.querySelector('.chatbot-input textarea');

    inputField.addEventListener('keypress', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default form submission
            sendMessage(); // Call the function to send the message
        }
    });
});

// Load trending topics (for your homepage section)
function loadTrendingTopics() {
    const trendingContainer = document.getElementById('trending-container');
    const apiData = [
        {
            title: "Breakthrough in Cancer Research",
            image: "medical.jpg",
            summary: "Scientists have developed a promising new therapy showing significant progress in treating advanced cancers."
        },
        {
            title: "Global Climate Summit 2024",
            image: "global_climate.png",
            summary: "World leaders convene to tackle pressing climate issues and pledge a record-breaking $1 trillion for green initiatives."
        },
        {
            title: "Mars Mission: Human Habitats in Space",
            image: "mars.jpg",
            summary: "NASA unveils plans to establish the first human habitats on Mars by 2030. Here's what we know so far."
        },
        {
            title: "Gukesh: The Youngest Chess King Crowned",
            image: "chess.jpg",
            summary: "Gukesh Dommaraju, at 18, becomes the youngest World Chess Champion, marking a new era in chess history."
        }
    ];

    apiData.forEach(topic => {
        const card = document.createElement('div');
        card.className = 'card';

        const image = document.createElement('img');
        image.src = topic.image;
        image.alt = topic.title;

        const content = document.createElement('div');
        content.className = 'card-content';

        const title = document.createElement('h3');
        title.textContent = topic.title;

        const summary = document.createElement('p');
        summary.textContent = topic.summary;

        content.appendChild(title);
        content.appendChild(summary);
        card.appendChild(image);
        card.appendChild(content);
        trendingContainer.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadTrendingTopics);



