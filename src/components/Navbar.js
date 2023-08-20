import nav from "@/lib/nav.config";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useState } from "react";
import { motion } from "framer-motion";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  if (router.asPath.includes("/playlist")) {
    router.asPath = "/listen-now";
  }
  if (router.asPath.includes("/login")) {
    router.asPath = "/browse";
  }
  if (router.asPath.includes("/dashboard")) {
    router.asPath = "/browse";
  }
  if (router.asPath.includes("/highquality")) {
    router.asPath = "/browse";
  }
  if (router.asPath.includes("/newsongs")) {
    router.asPath = "/browse";
  }
  if (router.asPath.includes("/album")) {
    router.asPath = "/listen-now";
  }
  if (router.asPath.includes("/mv")) {
    router.asPath = "/listen-now";
  }
  if (router.asPath.includes("/search")) {
    router.asPath = "/browse";
  }
  if (router.asPath.includes("/artist")) {
    router.asPath = "/listen-now";
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
      <div className="hidden md:flex sm:flex max-w-7xl w-full mx-auto flex-row justify-between px-6 py-6">
        <div className="flex flex-row space-x-2 md:space-x-6 sm:space-x-6">
          {nav.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "rounded-xl px-2.5 md:px-6 sm:px-6 py-1.5",
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
        <div className="flex flex-row space-x-4 md:space-x-6 sm:space-x-8">
          <button onClick={() => router.push("/search")}>
            <Icon
              icon="bi:search"
              className="w-4 h-4 md:w-5 md:h-5 sm:w-5 sm:h-5 opacity-75"
            />
          </button>
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
                className="px-1 flex flex-row space-x-1 rounded-full py-0.5 md:py-0 sm:py-0 "
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
                className="bg-red-600 rounded-xl text-sm md:text-base sm:text-base text-white px-2 md:px-4 sm:px-6 py-1.5 flex flex-row space-x-1 md:space-x-2 sm:space-x-2.5"
              >
                <Icon
                  icon="bi:person-circle"
                  className="w-4 h-4 mt-0.5 md:mt-[0.0925rem] sm:mt-0 md:w-5 md:h-5 sm:w-6 sm:h-6"
                />
                <span>登录</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "fixed w-full top-0 border-b border-neutral-200/50 dark:border-neutral-800/50",
          open
            ? "bg-neutral-50 dark:bg-neutral-950 h-screen z-[99999]"
            : "bg-neutral-50/75 dark:bg-neutral-950/75 backdrop-blur-3xl z-[60]"
        )}
      >
        <div className="flex md:hidden sm:hidden flex-row justify-between px-6 py-2.5">
          <button onClick={() => setOpen(!open)}>
            {!open ? (
              <Icon icon="tabler:menu" className="text-red-600 w-7 h-7" />
            ) : (
              <Icon icon="ph:x-bold" className="text-red-600 w-7 h-7" />
            )}
          </button>
          <button onClick={() => router.push("/browse")}>
            <h1 className="font-semibold text-xl h-7">
              <span className="text-red-600">DM</span> Music
            </h1>
          </button>
          {userData &&
          userData.data &&
          userData.data.profile &&
          userData.data.profile.userId ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-1 flex flex-row space-x-1 rounded-full py-0.5 md:py-0 sm:py-0 "
            >
              <img
                src={userData.data.profile.avatarUrl}
                className="w-7 h-7 rounded-full"
              />
              <span className="w-2" />
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-red-600"
            >
              <Icon icon="bi:person-circle" className="w-6 h-6git" />
            </button>
          )}
        </div>
        {open && (
          <div className="flex flex-col space-y-6">
            <div className="flex flex-row justify-start w-full border-b border-neutral-200 dark:border-neutral-800 py-4">
              <form onClick={() => router.push("/search")} className="px-6">
                <Icon
                  icon="bi:search"
                  className="absolute opacity-75 w-5 h-5 mt-2.5 md:mt-3 sm:mt-3 ml-2.5"
                />
                <input
                  type="search"
                  onClick={() => {
                    router.push("/search");
                    setOpen(false);
                  }}
                  placeholder="好音乐一搜即得"
                  className="bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 border-neutral-200 w-full md:w-[32rem] sm:w-[36rem] px-10 py-1.5 md:py-2 sm:py-2 focus:outline-none text-lg md:text-xl sm:text-xl focus:ring-2 focus:ring-red-600 border-[1.5px] rounded-xl"
                />
                <button type="submit" className="hidden">
                  Search
                </button>{" "}
              </form>
            </div>
            <div className="px-8 flex flex-col space-y-4">
              {nav.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(!open)}
                  className={cn(
                    "px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 rounded-none"
                  )}
                >
                  <button className="text-lg opacity-90">{item.title}</button>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-col space-y-2">
              <h1 className="text-sm text-center opacity-75">主题</h1>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-center flex justify-center"
              >
                <Icon icon="bi:circle-half" className="w-5 h-5 mt-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
