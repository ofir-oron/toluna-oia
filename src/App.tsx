import { useState, useRef, useEffect } from "react";
import "./App.css";

type TKeyPressEventData = {
  type: string;
  keyCode: number;
  keyCodeChar: string;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
};

function App() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  const initialTime = useRef(0);
  const [keyTimingData, setKeyTimingData] = useState<
    Partial<PerformanceMark>[]
  >([]);

  const updateTimingWithNewMark = (
    mark: PerformanceMark,
    detail?: TKeyPressEventData,
  ) => {
    const { name, startTime } = mark.toJSON();
    setKeyTimingData((prevState) => [
      ...prevState,
      {
        name,
        startTime: startTime - initialTime.current,
        detail,
      },
    ]);
  };

  const handleFocus = () => {
    const mark = performance.mark("textarea:focus");
    updateTimingWithNewMark(mark);
  };

  const handleBlur = () => {
    const mark = performance.mark(`textarea:blur`);
    updateTimingWithNewMark(mark);
    performance.clearMarks();
  };

  useEffect(() => {
    initialTime.current = performance.now();
    performance.setResourceTimingBufferSize(50000);
    const textareaEl = textAreaRef.current;

    const handleKeyPress = (evt: KeyboardEvent) => {
      const { type, keyCode, timeStamp, shiftKey, altKey, ctrlKey } = evt;
      const mark = performance.mark(`textarea:${type}`, {
        detail: { type, keyCode, timeStamp, shiftKey, altKey, ctrlKey },
      });

      updateTimingWithNewMark(mark, {
        type,
        keyCode,
        keyCodeChar: String.fromCharCode(keyCode),
        shiftKey,
        altKey,
        ctrlKey,
      });
    };

    const handleMouseEvent = (evt: MouseEvent) => {
      const mark = performance.mark(`mouseevent:${evt.type}`);
      updateTimingWithNewMark(mark);
    };

    textareaEl?.addEventListener("keydown", handleKeyPress);
    textareaEl?.addEventListener("keyup", handleKeyPress);
    textareaEl?.addEventListener("click", handleMouseEvent);
    textareaEl?.addEventListener("dblclick", handleMouseEvent);

    return () => {
      textareaEl?.removeEventListener("keydown", handleKeyPress);
      textareaEl?.removeEventListener("keyup", handleKeyPress);
      textareaEl?.removeEventListener("click", handleMouseEvent);
      textareaEl?.removeEventListener("dblclick", handleMouseEvent);
    };
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [keyTimingData]);

  return (
    <>
      <div>
        <textarea
          ref={textAreaRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ width: "90vw", height: 100, margin: 10 }}
        ></textarea>
      </div>
      <div>
        <textarea
          ref={outputRef}
          readOnly
          value={JSON.stringify(keyTimingData, null, 4)}
          style={{ width: "90vw", height: "50vh", margin: 10 }}
        ></textarea>
      </div>
    </>
  );
}

export default App;
