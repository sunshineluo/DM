import moment from "moment";
import LazyLoad from "react-lazy-load";
import CommentReadMore from "./CommentReadMore";

export default function CommentCard({
  id,
  content,
  user,
  avatar,
  time,
  index,
}) {
  return (
    <div
      key={index}
      className="px-6 md:px-0 sm:px-0 border-b border-neutral-200 dark:border-neutral-800 py-4 flex flex-row space-x-4"
    >
      <LazyLoad offset={100}>
        <img
          src={avatar}
          className="rounded-full w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
        />
      </LazyLoad>

      <div className="flex flex-col space-y-1 mt-1 w-64 md:w-96 sm:w-96">
        <CommentReadMore text={content} maxCharCount={100} />

        <span className="mt-2 text-xs md:text-sm sm:text-base opacity-75 truncate w-64 md:w-96 sm:w-96">
          {user} 评论于 {moment(time).format("YYYY年MM月DD日")}
        </span>
      </div>
    </div>
  );
}
