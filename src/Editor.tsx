import { useState, useEffect } from "react";

export function Editor({ initialContent, onContentUpdate }) {
  const [content, setContent] = useState<string>(initialContent);

  const onChange = (event) => {
    const content = event.target.value;
    setContent(content);
    onContentUpdate(content);
  };

  // Invoke the event emitter right away, to inform the caller
  // about an initial result.
  useEffect(() => {
    onContentUpdate(initialContent);
  }, []);

  return (
    <label>
      Query
      <textarea value={content} onChange={onChange} />
    </label>
  );
}
