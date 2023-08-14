import nav from "@/lib/nav.config";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const router = useRouter();
  if (router.asPath.includes("/playlist")) {
    router.asPath = "/";
  }
  if (router.asPath.includes("/login")) {
    router.asPath = "/";
  }
  if (router.asPath.includes("/dashboard")) {
    router.asPath = "/";
  }
  if (router.asPath.includes("/highquality")) {
    router.asPath = "/";
  }
  if (router.asPath.includes("/newsongs")) {
    router.asPath = "/";
  }
  if (router.asPath.includes("/album")) {
    router.asPath = "/";
  }
  if (router.asPath.includes("/mv")) {
    router.asPath = "/";
  }
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);
  const { theme, setTheme } = useTheme();

  const goBack = () => {
    router.back();
  };

  const goRefresh = () => {
    router.reload(); // 前进到指定 URL
  };
  return (
    <div className="">
      <div className="flex flex-row max-w-6xl mx-auto px-4 space-x-4 md:space-x-12 sm:space-x-16">
        <div className="flex-row py-6 space-x-3 md:space-x-6 sm:space-x-7 flex">
          <button onClick={goBack}>
            <Icon
              icon="heroicons:arrow-uturn-left-20-solid"
              className="w-4 h-4 md:w-6 md:h-6 sm:w-6 sm:h-6 opacity-75"
            />
          </button>

          <button onClick={goRefresh}>
            <Icon
              icon="heroicons:arrow-path-20-solid"
              className="w-4 h-4 md:w-6 md:h-6 sm:w-6 sm:h-6 opacity-75"
            />
          </button>
        </div>
        <div className="max-w-5xl w-full mx-auto flex flex-row justify-between py-6">
          <div className="flex flex-row space-x-2 md:space-x-6 sm:space-x-6">
            {nav.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "rounded-full px-2.5 md:px-6 sm:px-6 py-1.5",
                  router.asPath === item.href
                    ? "bg-red-600 text-white font-medium"
                    : ""
                )}
              >
                <button className="text-sm md:text-base sm:text-base">
                  {item.title}
                </button>
              </Link>
            ))}
          </div>
          <div className="flex flex-row space-x-2 md:space-x-4 sm:space-x-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className=""
            >
              <Icon
                icon="bi:circle-half"
                className="w-4 h-4 md:w-5 md:h-5 sm:w-5 sm:h-5 opacity-75"
              />
            </button>
            <div>
              {userData &&
              userData.data &&
              userData.data.profile &&
              userData.data.profile.userId ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="border-[1.5px] border-neutral-300 dark:border-neutral-700 px-1 flex flex-row space-x-1 rounded-full py-0.5 md:py-0 sm:py-0 bg-neutral-200/75 dark:bg-neutral-800/75"
                >
                  <img
                    src={userData.data.profile.avatarUrl}
                    className="w-7 h-7 md:h-8 sm:h-8 md:w-8 sm:w-8 rounded-full"
                  />
                  <span className="text-sm md:text-base sm:text-base opacity-75 mt-1 mr-1">
                    {userData.data.profile.nickname}
                  </span>
                  <span className="w-2" />
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="bg-red-600 rounded-xl text-sm md:text-base sm:text-base text-white px-2 md:px-4 sm:px-6 py-1.5 flex flex-row space-x-2.5"
                >
                  <Icon icon="bi:person-circle" className="w-4 h-4 mt-0.5 md:mt-[0.925rem] sm:mt-0 md:w-5 md:h-5 sm:w-6 sm:h-6" />
                  <span>登录</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
