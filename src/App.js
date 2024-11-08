// src/App.js
import React from "react";
import DragAndDrop from "./DragAndDrop";
import AnimatedCursor from "react-animated-cursor"

function App() {
  return (
    <div className="App">
      <AnimatedCursor
        innerSize={8}
        outerSize={35}
        innerScale={1}
        outerScale={2}
        outerAlpha={0}
        showSystemCursor={false}
        hasBlendMode={true}
        outerStyle={{
          border: '3px solid var(--cursor-color)'
        }}
        innerStyle={{
          backgroundColor: 'var(--cursor-color)'
        }}
      />
      <DragAndDrop />
    </div>
  );
}

export default App;
