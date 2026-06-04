const API_URL = "/api/chat";  // Panggil API internal Vercel

const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let isWaiting = false;

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "ai-message"}`;
    
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerText = isUser ? "👤" : "✨";
    
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerText = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
}

function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message ai-message";
    typingDiv.id = "typingIndicator";
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerText = "✨";
    const typingBubble = document.createElement("div");
    typingBubble.className = "bubble";
    typingBubble.innerHTML = "VeliuxAI sedang mengetik<span class='dot-typing'>...</span>";
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingBubble);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    let count = 0;
    const interval = setInterval(() => {
        if (!document.getElementById("typingIndicator")) {
            clearInterval(interval);
            return;
        }
        count = (count % 3) + 1;
        const dotSpan = typingDiv.querySelector(".dot-typing");
        if (dotSpan) dotSpan.innerText = ".".repeat(count);
    }, 400);
    return interval;
}

function removeTypingIndicator(interval) {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
    if (interval) clearInterval(interval);
}

async function sendToOpenAI(userMessage) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: userMessage })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Gagal menghubungi server");
        }
        
        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("Error:", error);
        return `⚠️ Error: ${error.message}`;
    }
}

async function handleSendMessage() {
    if (isWaiting) return;
    const message = userInput.value.trim();
    if (message === "") return;
    
    isWaiting = true;
    sendBtn.disabled = true;
    userInput.disabled = true;
    
    addMessage(message, true);
    userInput.value = "";
    userInput.style.height = "auto";
    
    const typingInterval = showTypingIndicator();
    const aiReply = await sendToOpenAI(message);
    removeTypingIndicator(typingInterval);
    addMessage(aiReply, false);
    
    isWaiting = false;
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
}

sendBtn.addEventListener("click", handleSendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
});

userInput.focus();