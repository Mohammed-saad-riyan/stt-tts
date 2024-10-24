import React, { useState } from "react";
import { pdfContent } from "../public/pdfContent";
import SpeechToText from "./SpeechToText";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/google/flan-t5-large";
const HF_API_KEY = "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"; // Your HF API key
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = "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"; // Replace with your actual Groq API key

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSpeechTranscript = (transcript) => {
    setQuery(transcript);
  };

  const findRelevantContent = (query) => {
    const keywords = query.toLowerCase().split(" ");
    let relevantContent = "";

    Object.entries(pdfContent).forEach(([filename, content]) => {
      const lowerContent = content.toLowerCase();
      if (keywords.some((keyword) => lowerContent.includes(keyword))) {
        relevantContent += `${content}\n\n`;
      }
    });

    return relevantContent.trim();
  };

  const generateAnswerHF = async (query, context) => {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Answer the following question based on the given context. If the answer is not in the context, say "I don't have enough information to answer that question."

Context: ${context}

Question: ${query}

Answer:`,
      }),
    });

    const result = await response.json();
    return result[0].generated_text;
  };

  const generateAnswerGroq = async (query, context) => {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that answers questions based on the given context.",
          },
          {
            role: "user",
            content: `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`,
          },
        ],
        model: "mixtral-8x7b-32768",
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const relevantContent = findRelevantContent(query);

    if (relevantContent) {
      try {
        // You can choose which API to use here, or implement logic to decide
        const generatedAnswer = await generateAnswerHF(query, relevantContent);
        // const generatedAnswer = await generateAnswerGroq(query, relevantContent);
        setAnswer(generatedAnswer);
        speakAnswer(generatedAnswer);
      } catch (error) {
        console.error("Error generating answer:", error);
        setAnswer(
          "Sorry, there was an error generating the answer. Please try again."
        );
      }
    } else {
      setAnswer("I don't have enough information to answer that question.");
    }

    setLoading(false);
  };

  const speakAnswer = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="App">
      <h1>MJCET AWS Cloud Club Q&A System</h1>
      <SpeechToText onTranscript={handleSpeechTranscript} />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Ask a question about MJCET AWS Cloud Club"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>
      {answer && (
        <div>
          <h2>Answer:</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default App;
