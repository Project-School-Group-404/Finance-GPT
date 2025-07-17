import React from "react";
// ...existing code...

const bubbleColors = [
  "#CC66DA",
  "#9929EA",
  "#FAEB92",
  "#CC66DA"
];

export default function LandingPage(props) {
  // ...existing code...
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Animated Bubbles */}
      <div className="animated-bubbles">
        <div
          className="bubble custom-bubble"
          style={{
            width: 220,
            height: 220,
            top: 60,
            left: 80,
            background: `radial-gradient(circle, ${bubbleColors[0]} 0%, transparent 80%)`,
            animation: "bubbleMove1 14s ease-in-out infinite alternate"
          }}
        />
        <div
          className="bubble custom-bubble"
          style={{
            width: 300,
            height: 300,
            top: 300,
            left: "60vw",
            background: `radial-gradient(circle, ${bubbleColors[1]} 0%, transparent 80%)`,
            animation: "bubbleMove2 18s ease-in-out infinite alternate"
          }}
        />
        <div
          className="bubble custom-bubble"
          style={{
            width: 180,
            height: 180,
            top: 500,
            left: "30vw",
            background: `radial-gradient(circle, ${bubbleColors[2]} 0%, transparent 80%)`,
            animation: "bubbleMove3 16s ease-in-out infinite alternate"
          }}
        />
        <div
          className="bubble custom-bubble"
          style={{
            width: 260,
            height: 260,
            top: 120,
            left: "80vw",
            background: `radial-gradient(circle, ${bubbleColors[3]} 0%, transparent 80%)`,
            animation: "bubbleMove4 20s ease-in-out infinite alternate"
          }}
        />
      </div>
      {/* ...existing code for landing page content... */}
    </div>
  );
}