import { useRouter } from "next/router";
import { useEffect } from "react";

const RedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.replace("/browse");
    }, 0);

    // 清除定时器以避免内存泄漏
    return () => clearTimeout(redirectTimer);
  }, []);

  return <div></div>;
};

export default RedirectPage;
