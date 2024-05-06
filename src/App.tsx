import { useState, useRef, useEffect } from "react";
import "./App.css";

type TKeyPressEventData = {
  type: string;
  keyCode: number;
  key: string;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
};

function App() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const focusTime = useRef(0);
  const [keyTimingData, setKeyTimingData] = useState<PerformanceMark[]>([]);

  const updateTimingWithNewMark = (
    mark: PerformanceMark,
    detail?: TKeyPressEventData,
  ) => {
    setKeyTimingData((prevState) => [
      ...prevState,
      {
        ...mark.toJSON(),
        startTime: mark.startTime - focusTime.current,
        detail,
      },
    ]);
  };

  const handleFocus = () => {
    focusTime.current = performance.now();
    const mark = performance.mark("textarea:focus");
    updateTimingWithNewMark(mark);
  };

  const handleBlur = () => {
    const mark = performance.mark(`textarea:blur`);
    updateTimingWithNewMark(mark);
    performance.clearMarks();
  };

  useEffect(() => {
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
        key: String.fromCharCode(keyCode),
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
    document.body.addEventListener("click", handleMouseEvent);
    document.body.addEventListener("dblclick", handleMouseEvent);

    return () => {
      textareaEl?.removeEventListener("keydown", handleKeyPress);
      textareaEl?.removeEventListener("keyup", handleKeyPress);
      document.body.removeEventListener("click", handleMouseEvent);
      document.body.removeEventListener("dblclick", handleMouseEvent);
    };
  }, []);

  return (
    <>
      <div>
        <textarea
          ref={textAreaRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ width: 300, height: 100, margin: 10 }}
        ></textarea>
      </div>
      <div>
        <textarea
          readOnly
          value={JSON.stringify(keyTimingData, null, 4)}
          style={{ width: 300, height: 100, margin: 10 }}
        ></textarea>
      </div>
    </>
  );
}

export default App;
