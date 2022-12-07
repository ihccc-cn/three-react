import React from "react";

import render from "./render";

function App() {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    render({ canvas: canvasRef.current });
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}

export default App;
