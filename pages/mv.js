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
    <div className="max-w-6xl mx-auto py-8 overflow-hidden px-6 mb-16">
      <Head>{mvData && <title>{mvData.name}</title>}</Head>
      {mvData && (
        <div className="text-xs md:text-base sm:text-base flex flex-row mb-4 justify-between">
          <h2 className="font-medium">{mvData.name}</h2>
          <div className="flex flex-row space-x-6 opacity-75">
            <p>{mvData.artistName}</p>
            <p>{moment(mvData.publishTime).format("YYYY年MM月DD日")}</p>
          </div>
        </div>
      )}
      {mvUrl && (
        <div>
          <video controls src={mvUrl} className="rounded-xl w-full"></video>
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
