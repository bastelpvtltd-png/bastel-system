"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const user = localStorage.getItem("username");
    if (!loggedIn) {
      router.push("/");
    } else {
      setUsername(user || "");
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    router.push("/");
  }

  return { username, handleLogout };
}