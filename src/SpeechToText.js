import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const SpeechToText = ({ onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const handleListen = () => {
    setIsListening(!isListening);
    if (!isListening) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
    }
  };

  return (
    <div>
      <button onClick={handleListen}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
      <p>{transcript}</p>
    </div>
  );
};

export default SpeechToText;
