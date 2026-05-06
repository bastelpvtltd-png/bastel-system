"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccessDeniedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Already logged in නම් - back ට
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn) {
      router.replace("/dashboard");
      return;
    }

    // Countdown → login
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.replace("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <header className="h-[70px] w-full bg-blue-950 border-b border-red-800 flex items-center justify-between px-6">
        <h1 className="text-green-400 font-bold text-xl tracking-widest">BASTEL PVT LTD</h1>
        <span className="text-red-400 text-sm border border-red-800 px-3 py-1 rounded">⚠ ACCESS DENIED</span>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="bg-blue-950 border border-red-800 p-10 rounded-xl shadow-2xl w-[480px] text-center">
          
          {/* Warning icon */}
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          
          <h2 className="text-red-400 font-bold text-2xl tracking-widest mb-2">
            ACCESS DENIED
          </h2>
          
          <div className="w-16 h-px bg-red-700 mx-auto mb-6" />

          <div className="bg-red-900/20 border border-red-800 rounded p-4 mb-6">
            <p className="text-red-300 text-sm leading-relaxed">
              ඔබට මෙම පිටුවට ප්‍රවේශ වීමට අවසර නොමැත.
            </p>
            <p className="text-red-300 text-sm mt-1">
              You are not authorized to access this page.
            </p>
            <p className="text-gray-500 text-xs mt-3">
              This attempt has been logged and monitored.
            </p>
          </div>

          <p className="text-gray-400 text-sm mb-6">
            Redirecting to login in{" "}
            <span className="text-red-400 font-bold text-lg">{countdown}</span>
            {" "}seconds...
          </p>

          <button
            onClick={() => router.replace("/")}
            className="w-full bg-green-700 text-white py-3 rounded hover:bg-green-600 font-bold tracking-widest transition"
          >
            LOGIN NOW
          </button>
        </div>
      </main>

      <footer className="h-[70px] w-full bg-blue-950 border-t border-red-800 flex flex-col items-center justify-center">
        <p className="text-red-500 text-xs tracking-widest">
          ⚠ UNAUTHORIZED ACCESS ATTEMPT DETECTED
        </p>
        <p className="text-gray-500 text-xs mt-1">BASTEL PVT LTD — Security System</p>
      </footer>
    </div>
  );
}
