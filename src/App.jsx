import React, { useState } from "react";
import Chatbot from "./components/Chatbot";

function App() {
  const [showChatbot, setShowChatbot] = useState(false);

  const handleActivitySuggestion = (suggestion) => {
    // You can display or log the suggestion here
    console.log("Suggested activity:", suggestion);
  };

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          style={{
            padding: "12px 32px",
            fontSize: "1.2rem",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          Chat with MindSync
        </button>
      )}
      {showChatbot && (
        <div style={{ marginTop: 32 }}>
          <Chatbot onActivitySuggestion={handleActivitySuggestion} />
        </div>
      )}
    </div>
  );
}

export default App;