import { useState } from "react";

const ReadMore = ({ text, maxCharCount }) => {
  const [showFullText, setShowFullText] = useState(false);
  const shouldTruncate = text && text.length > maxCharCount;

  const truncatedText = shouldTruncate ? text.slice(0, maxCharCount) + "..." : text;

  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <div className="mt-4 opacity-75 text-sm md:text-base sm:text-base leading-normal md:leading-normal sm:leading-relaxed">
      <p>{showFullText || !shouldTruncate ? text : truncatedText || ""}</p>
      {shouldTruncate && (
        <button className="text-red-600 font-medium" onClick={toggleShowFullText}>
          {showFullText ? "收起" : "更多"}
        </button>
      )}
    </div>
  );
};

export default ReadMore;