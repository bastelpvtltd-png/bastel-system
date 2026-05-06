"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  useEffect(() => {
    // Settings always goes to profile - no permission needed for own profile
    router.replace("/settings/profile");
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-green-400 text-xs tracking-widest animate-pulse">LOADING...</div>
    </div>
  );
}
