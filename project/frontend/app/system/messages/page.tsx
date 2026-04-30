"use client";
// Messages eka navbar eke Messages button eken access karanna.
// Direct URL eken aawe redirect karanawa.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function MessagesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/system"); }, []);
  return (
    <div className="flex items-center justify-center h-40">
      <p className="text-green-400 text-xs animate-pulse">Use the Messages button in the top navbar...</p>
    </div>
  );
}
