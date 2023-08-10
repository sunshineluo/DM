import nav from "@/lib/nav.config";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";

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
  const userDataStr = localStorage.getItem("userData");
  const userData = JSON.parse(userDataStr);
  return (
    <div className="">
      <div className="max-w-4xl mx-auto flex flex-row justify-between px-3 md:px-6 sm:px-6 py-6">
        <div className="flex flex-row space-x-4 md:space-x-6 sm:space-x-6">
          {nav.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "rounded-full px-4 md:px-6 sm:px-6 py-1.5 md:py-2 sm:py-2",
                router.asPath === item.href &&
                  "bg-red-600 text-white font-medium"
              )}
            >
              <button>{item.title}</button>
            </Link>
          ))}
        </div>
        <div>
          {userData && userData.data && userData.data.profile && userData.data.profile.userId ?(
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 md:px-6 sm:px-6"
            >
              <img
                src={userData.data.profile.avatarUrl}
                className="w-8 h-8 md:w-9 sm:w-9 md:h-9 sm:h-9 rounded-full"
              />
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="bg-red-600 rounded-xl text-white px-4 md:px-6 sm:px-6 py-1.5 md:py-2 sm:py-2 flex flex-row space-x-2.5"
            >
              <Icon icon="bi:person-circle" className="w-6 h-6" />
              <span>登录</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
