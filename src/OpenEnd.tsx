import { useState, useRef, useEffect } from "react";

type TKeyPressEventData = {
  keyCode: number;
  keyCodeChar: string;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
};

type TMouseEventData = {
  target: {
    type: string;
    attributes: { [key: string]: string }[];
  };
};

type TEventData = {
  value: string;
};

interface IOpenEndProps {
  onEvent: (value: Partial<PerformanceMark>[]) => void;
}

const OpenEnd = ({ onEvent }: IOpenEndProps) => {
  const initialTime = useRef(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [marksData, setMarksData] = useState<Partial<PerformanceMark>[]>([]);

  const updateTimingWithNewMark = (
    mark: PerformanceMark,
    detail?: TKeyPressEventData | TMouseEventData | TEventData,
  ) => {
    const { name, startTime } = mark.toJSON();
    setMarksData((prevState) => [
      ...prevState,
      {
        name,
        timestamp: Math.round(
          startTime - initialTime.current + Number.EPSILON * 100,
        ),
        details: detail,
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
    onEvent(marksData);
  }, [marksData]);

  useEffect(() => {
    initialTime.current = performance.now();
    performance.setResourceTimingBufferSize(50000);
    const textareaEl = textAreaRef.current;

    const handleKeyPress = (evt: KeyboardEvent) => {
      const { type, keyCode, timeStamp, shiftKey, altKey, ctrlKey } = evt;
      const mark = performance.mark(`textarea:${type}`, {
        detail: { keyCode, timeStamp, shiftKey, altKey, ctrlKey },
      });

      updateTimingWithNewMark(mark, {
        keyCode,
        keyCodeChar: String.fromCharCode(keyCode),
        shiftKey,
        altKey,
        ctrlKey,
      });
    };

    const handleMouseEvent = (evt: MouseEvent) => {
      const mark = performance.mark(`mouseevent:${evt.type}`);
      const domElement: EventTarget | null = evt.target;

      updateTimingWithNewMark(mark, {
        target: {
          type: (domElement as HTMLObjectElement)?.type ?? "unknown",
          attributes: [
            ...Array.from((domElement as HTMLElement).attributes)
              .filter((node) => node.name !== "style")
              .map((node) => ({
                name: node.name,
                value: node.value,
              })),
          ],
        },
      });
    };

    const handleInputEvent = (evt: Event) => {
      const mark = performance.mark(`textarea:${evt.type}`);
      updateTimingWithNewMark(mark, {
        value: (evt.target as HTMLTextAreaElement).value ?? "",
      });
    };

    const handlePasteEvent = (evt: ClipboardEvent) => {
      const mark = performance.mark(`textarea:${evt.type}`);
      updateTimingWithNewMark(mark, {
        value: evt?.clipboardData?.getData("text") ?? "",
      });
    };

    textareaEl?.addEventListener("keydown", handleKeyPress);
    textareaEl?.addEventListener("keyup", handleKeyPress);
    textareaEl?.addEventListener("click", handleMouseEvent);
    textareaEl?.addEventListener("contextmenu", handleMouseEvent);
    textareaEl?.addEventListener("dblclick", handleMouseEvent);
    textareaEl?.addEventListener("paste", handlePasteEvent);
    textareaEl?.addEventListener("input", handleInputEvent);

    return () => {
      textareaEl?.removeEventListener("keydown", handleKeyPress);
      textareaEl?.removeEventListener("keyup", handleKeyPress);
      textareaEl?.removeEventListener("click", handleMouseEvent);
      textareaEl?.removeEventListener("contextmenu", handleMouseEvent);
      textareaEl?.removeEventListener("dblclick", handleMouseEvent);
      textareaEl?.removeEventListener("paste", handlePasteEvent);
      textareaEl?.removeEventListener("input", handleInputEvent);
    };
  }, []);

  return (
    <textarea
      id="open_end_textarea"
      ref={textAreaRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={{ width: "90vw", height: 100, margin: 10 }}
    ></textarea>
  );
};

export default OpenEnd;
