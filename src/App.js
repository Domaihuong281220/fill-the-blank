// src/App.js
import React from "react";
import DragAndDrop from "./DragAndDrop";
import AnimatedCursor from "react-animated-cursor"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import DragAndDropVer2 from "./DragAndDropVer2";

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
      {/* <DragAndDrop /> */}
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/version1" />} />
          <Route exact path="/version1" element={<DragAndDrop />} />
          <Route exact path="/version2" element={<DragAndDropVer2 />} />
        </Routes>
        </Router>
    </div>
  );
}

export default App;
