import { useState, useEffect } from "react";
import "./App.css";
import Package from "../package.json";
import OpenEnd from "./OpenEnd";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import dark from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark";

SyntaxHighlighter.registerLanguage("json", json);

function App() {
  const [openEndEventData, setOpenEndEventData] = useState<
    Partial<PerformanceMark>[]
  >([]);

  useEffect(() => {
    const [pre] = document.getElementsByTagName("pre");
    pre.scrollTop = pre.scrollHeight;
  }, [openEndEventData]);

  return (
    <>
      <div>
        <OpenEnd onEvent={(data) => setOpenEndEventData(data)} />
      </div>
      <div>
        <SyntaxHighlighter
          customStyle={{
            width: "90vw",
            height: "calc(100vh - 300px)",
            margin: 10,
            textAlign: "left",
          }}
          showLineNumbers={true}
          style={dark}
          language="json"
          wrapLongLines={true}
        >
          {JSON.stringify(openEndEventData, null, 4)}
        </SyntaxHighlighter>
      </div>
      <div>
        <i>v{Package.version}</i>
      </div>
    </>
  );
}

export default App;
