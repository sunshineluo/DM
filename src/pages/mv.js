import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";
import LazyLoad from "react-lazy-load";
import Heading from "@/components/Heading";
import CommentCard from "@/components/CommentCard";

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
        <div className="mt-8 px-6 md:px-0 sm:px-0">
          <h2 className="font-semibold text-2xl md:text-3xl sm:text-4xl">
            {mvData.name}
          </h2>
          <div className="flex flex-row space-x-6 opacity-75 mt-4">
            <p>{mvData.artistName}</p>
            <p>{moment(mvData.publishTime).format("YYYY年MM月DD日")}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Heading>评论({mvComments.length})</Heading>
        <div className="mt-2">
          {mvComments.map((comment, index) => (
            <CommentCard
              key={index}
              content={comment.content}
              index={index}
              user={comment.user.nickname}
              avatar={comment.user.avatarUrl}
              time={comment.time}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mv;
