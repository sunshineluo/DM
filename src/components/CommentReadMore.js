import { useState } from "react";

const CommentReadMore = ({ text, maxCharCount }) => {
  const [showFullText, setShowFullText] = useState(false);
  const shouldTruncate = text && text.length > maxCharCount;

  const truncatedText = shouldTruncate
    ? text.slice(0, maxCharCount) + "..."
    : text;

  const toggleShowFullText = () => {
    setShowFullText(!showFullText);
  };

  return (
    <div className="text-lg md:text-xl sm:text-xl font-medium leading-normal md:leading-normal sm:leading-relaxed">
      <p>{showFullText || !shouldTruncate ? text : truncatedText || ""}</p>
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

export default CommentReadMore;
