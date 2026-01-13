import React, { useState } from "react";
import axios from "axios";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

function Chatbot({ onActivitySuggestion }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm here to support your mental health. How are you feeling today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});

  // Collect user data for activity suggestions
  const collectData = (text) => {
    // Simple keyword extraction (customize as needed)
    const moodKeywords = ["sad", "happy", "anxious", "stressed", "tired", "excited"];
    const found = moodKeywords.find((kw) => text.toLowerCase().includes(kw));
    if (found) {
      setUserData((prev) => ({ ...prev, mood: found }));
    }
  };

  // Suggest activities based on user data
  const suggestActivity = (data) => {
    let suggestion = "Would you like to try a breathing exercise?";
    if (data.mood === "sad") suggestion = "How about journaling or listening to uplifting music?";
    if (data.mood === "anxious") suggestion = "Would you like a short mindfulness meditation?";
    if (data.mood === "tired") suggestion = "Maybe a gentle walk or some stretching could help.";
    if (onActivitySuggestion) onActivitySuggestion(suggestion);
    setMessages((msgs) => [...msgs, { sender: "bot", text: suggestion }]);
  };

  // Send message to Gemini API
  const sendMessage = async (text) => {
    setLoading(true);
    collectData(text);

    // Build conversation context
    const context = messages.map((msg) => ({
      role: msg.sender === "bot" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    context.push({ role: "user", parts: [{ text }] });

    try {
      const res = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: context
        }
      );
      const botReply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here for you.";
      setMessages((msgs) => [...msgs, { sender: "user", text }, { sender: "bot", text: botReply }]);
      suggestActivity(userData);
    } catch (err) {
      setMessages((msgs) => [...msgs, { sender: "user", text }, { sender: "bot", text: "Sorry, I couldn't process that. Please try again." }]);
    }
    setLoading(false);
    setInput("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>MindSync Chatbot</h2>
      <div style={{ minHeight: 200, marginBottom: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === "bot" ? "left" : "right", margin: "8px 0" }}>
            <span style={{ background: msg.sender === "bot" ? "#e0f7fa" : "#c8e6c9", padding: "6px 12px", borderRadius: 12 }}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask me anything..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button type="submit" disabled={loading || !input.trim()} style={{ padding: "8px 16px", borderRadius: 8 }}>
          Send
        </button>
      </form>
      {loading && <div>Thinking...</div>}
    </div>
  );
}

export default Chatbot;