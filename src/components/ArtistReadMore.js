import { useState } from "react";

const ArReadMore = ({ text, maxCharCount }) => {
  const [showFullText, setShowFullText] = useState(false);
  const shouldTruncate = text && text.length > maxCharCount;

  const truncatedText = shouldTruncate
    ? text.slice(0, maxCharCount) + "..."
    : text;

  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <div>
      <p className="transition-all duration-500 mt-4 opacity-75 text-base md:text-lg sm:text-xl leading-normal md:leading-normal sm:leading-relaxed">
        {showFullText || !shouldTruncate ? text : truncatedText || ""}
      </p>
      {shouldTruncate && (
        <button
          className="text-red-600 font-medium"
          onClick={toggleShowFullText}
        >
          {showFullText ? "收起" : "详情"}
        </button>
      )}
    </div>
  );
};

export default ArReadMore;