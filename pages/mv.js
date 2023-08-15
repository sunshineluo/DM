import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import moment from "moment";
import { Icon } from "@iconify/react";
import Head from "next/head";

const Mv = () => {
  const [mvData, setMvData] = useState(null);
  const [mvUrl, setMvUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
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
        const response = await axios.get(
          `https://cf233.eu.org/mv/url?id=${id}`
        );
        if (response.data.code === 200) {
          setMvUrl(response.data.data.url);
          setIsLoading(false);
        }
      } catch (error) {
        console.log("An error occurred while fetching MV URL:", error);
      }
    };

    getMvData();
    getMvUrl();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto py-8 overflow-hidden px-0 md:px-6 sm:px-6 mb-20">
      <Head>{mvData && <title>{mvData.name}</title>}</Head>
      {mvUrl && (
        <div>
          <video controls src={mvUrl} className="rounded-none md:rounded-xl sm:rounded-xl w-full"></video>
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
    </div>
  );
};

export default Mv;
