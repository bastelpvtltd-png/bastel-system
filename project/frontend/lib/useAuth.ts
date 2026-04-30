"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    const user = localStorage.getItem("username");
    const admin = localStorage.getItem("isAdmin") === "true";

    if (!loggedIn) {
      // Not logged in - clear everything and send to login
      localStorage.clear();
      router.replace("/");
    } else {
      setUsername(user || "");
      setIsAdmin(admin);
      setAuthChecked(true);
    }
  }, []);

  function handleLogout() {
    localStorage.clear();
    router.replace("/");
  }

  return { username, isAdmin, authChecked, handleLogout };
}
