// src/components/LoadingScreen.jsx
import React, { useEffect, useState } from "react";
import "./loadingScreen.css";

const LoadingScreen = ({ onFinish }) => {
  const [videoSrc, setVideoSrc] = useState(null);
  const [timeoutDuration, setTimeoutDuration] = useState(4000); // default

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      setVideoSrc("/logo-intro.mp4");
      setTimeoutDuration(4000); // 4 seconds
      localStorage.setItem("hasVisited", "true");
    } else {
      setVideoSrc("/typewriter-intro.mp4");
      setTimeoutDuration(2000); // 2 seconds
    }
  }, []);

  useEffect(() => {
    if (videoSrc) {
      const timeout = setTimeout(() => {
        onFinish();
      }, timeoutDuration);

      return () => clearTimeout(timeout);
    }
  }, [videoSrc, timeoutDuration, onFinish]);

  return (
    <div className="loading-screen">
      <video
        className="loading-video"
        src={videoSrc}
        autoPlay
        muted
        playsInline
      ></video>
    </div>
  );
};

export default LoadingScreen;
