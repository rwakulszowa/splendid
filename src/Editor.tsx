import { useState, useEffect } from "react";

export function Editor({
  initialContent,
  onContentUpdate,
}: {
  initialContent: string;
  onContentUpdate: (content: string) => void;
}) {
  const [content, setContent] = useState<string>(initialContent);

  // Invoke the event emitter right away, to inform the caller
  // about an initial result.
  useEffect(() => {
    onContentUpdate(initialContent);
  }, []);

  return (
    <textarea
      id="editor-input"
      className="w-full h-full"
      value={content}
      onChange={(event) => {
        const content = event.target.value;
        setContent(content);
        onContentUpdate(content);
      }}
    />
  );
}
