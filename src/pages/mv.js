import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";
import LazyLoad from "react-lazy-load";

const Mv = () => {
  const [mvData, setMvData] = useState(null);
  const [mvUrl, setMvUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mvComments, setMvComments] = useState([]);
  const [isCommentsLoading, setIsCommentLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const getMvData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://cf233.eu.org/mv/detail?mvid=${id}`
      );
      if (response.data.code === 200) {
        setMvData(response.data.data);
      }
    } catch (error) {
      console.log("An error occurred while fetching MV data:", error);
    }
  };

  const getMvUrl = async () => {
    try {
      const response = await axios.get(`https://cf233.eu.org/mv/url?id=${id}`);
      if (response.data.code === 200) {
        setMvUrl(response.data.data.url);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("An error occurred while fetching MV URL:", error);
    }
  };

  const getMvComments = async () => {
    try {
      setIsCommentLoading(true);
      const response = await axios.get(
        `https://cf233.eu.org/comment/mv?id=${id}&limit=100`
      );
      if (response.data.code === 200) {
        setMvComments(response.data.comments);
        setIsCommentLoading(false);
      }
    } catch (error) {
      console.log("An error occurred while fetching MV comments:", error);
    }
  };

  useEffect(() => {
    getMvData();
    getMvUrl();
    getMvComments();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto py-8 overflow-hidden px-0 md:px-6 sm:px-6 mb-20">
      <Head>{mvData && <title>{mvData.name}</title>}</Head>
      {mvUrl && (
        <div>
          <video
            controls
            src={mvUrl}
            className="rounded-none md:rounded-xl sm:rounded-xl w-full"
          ></video>
        </div>
      )}

      {mvData && (
        <div className="px-6 md:px-8 sm:px-8 py-4 md:py-8 sm:py-8 mt-6 rounded-none md:rounded-xl sm:rounded-xl bg-neutral-200 dark:bg-neutral-800">
          <h2 className="text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-xl sm:text-2xl">
            {mvData.name}
          </h2>
          <div className="flex flex-row space-x-6 opacity-75 mt-2">
            <p>{mvData.artistName}</p>
            <p>{moment(mvData.publishTime).format("YYYY年MM月DD日")}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <p className="flex flex-row justify-start -mt-6">
          <Icon icon="eos-icons:loading" className="w-8 h-8" />
        </p>
      )}
      <div className="mt-8">
        <h2 className="mb-6 px-6 md:px-0 sm:px-0 text-neutral-700 dark:text-neutral-300 font-medium text-lg md:text-xl sm:text-2xl">
          评论({mvComments.length})
        </h2>
        {mvComments.map((comment, index) => (
          <div key={index}>
            <div
              className={`flex flex-row space-x-4 w-full rounded-none md:rounded-xl sm:rounded-xl px-6 py-4 ${
                index % 2 === 0 ? "bg-neutral-200 dark:bg-neutral-800" : "odd"
              }`}
            >
              <LazyLoad offset={100}>
                <img
                  src={comment.user.avatarUrl}
                  className="rounded-full w-14 h-14 md:w-16 md:h-16 sm:w-16 sm:h-16"
                />
              </LazyLoad>

              <div className="flex flex-col space-y-1 mt-1">
                <span className="font-medium text-left text-base md:text-lg sm:text-xl truncate w-56 md:w-[27.5rem] sm:w-[36rem]">
                  {comment.content}
                </span>
                <span className="mt-2 text-xs md:text-sm sm:text-base opacity-75 truncate w-64 md:w-96 sm:w-96">
                  {comment.user.nickname} 评论于{" "}
                  {moment(comment.time).format("YYYY年MM月DD日")}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isCommentsLoading && (
          <p className="flex flex-row justify-start mt-6">
            <Icon icon="eos-icons:loading" className="w-8 h-8" />
          </p>
        )}
      </div>
    </div>
  );
};

export default Mv;
