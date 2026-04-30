"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      setError("Username සහ Password ඇතුළත් කරන්න.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // 1. Login + nav-config parallel ව fetch
      const [loginRes, navRes] = await Promise.all([
        fetch(`${API}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }),
        fetch(`${API}/api/nav-config`),
      ]);

      const loginData = await loginRes.json();

      if (!loginRes.ok || !loginData.success) {
        setError(loginData.message || "Invalid username or password.");
        setLoading(false);
        return;
      }

      // 2. Save user data
      const isAdmin = loginData.isAdmin as boolean;
      const mainTabs: string[] = loginData.mainTabs || [];
      const subTabs:  string[] = loginData.subTabs  || [];

      localStorage.setItem("isLoggedIn",   "true");
      localStorage.setItem("username",     loginData.username);
      localStorage.setItem("fullName",     loginData.fullName     || "");
      localStorage.setItem("designation",  loginData.designation  || "");
      localStorage.setItem("isAdmin",      isAdmin ? "true" : "false");
      localStorage.setItem("mainTabs",     JSON.stringify(mainTabs));
      localStorage.setItem("subTabs",      JSON.stringify(subTabs));

      // 3. Pre-cache nav tabs so layouts load instantly
      try {
        const navData = await navRes.json();
        if (Array.isArray(navData)) {
          // Navbar cache
          const navbarItems = isAdmin
            ? navData
            : navData.filter((item: any) =>
                mainTabs.some((t: string) => t.toLowerCase() === item.label.toLowerCase())
              );
          localStorage.setItem("tabs_cache_navbar", JSON.stringify(navbarItems));

          // Per-section tab caches
          for (const section of navData) {
            const base = section.label.toLowerCase().replace(/\s+/g, "-");
            const allSubs: string[] = section.subs || [];
            const filtered = isAdmin
              ? allSubs
              : allSubs.filter((s: string) =>
                  subTabs.some((a: string) => a.toLowerCase() === s.toLowerCase())
                );
            const formatted = filtered.map((sub: string) => ({
              name: sub,
              href: `/${base}/${sub.toLowerCase().trim().replace(/\s+/g, "-")}`,
            }));
            localStorage.setItem(`tabs_cache_${base}`, JSON.stringify(formatted));
          }

          // Settings always gets Profile + Security
          const settingsBase = [
            { name: "Profile",  href: "/settings/profile"  },
            { name: "Security", href: "/settings/security" },
          ];
          const settingsCached = localStorage.getItem("tabs_cache_settings");
          const existingExtra = settingsCached
            ? JSON.parse(settingsCached).filter(
                (t: any) => !settingsBase.some(s => s.href === t.href)
              )
            : [];
          localStorage.setItem("tabs_cache_settings", JSON.stringify([...settingsBase, ...existingExtra]));
        }
      } catch {}

      // 4. Redirect
      if (isAdmin) {
        router.push("/dashboard");
      } else if (mainTabs.length > 0) {
        router.push(`/${mainTabs[0].toLowerCase().replace(/\s+/g, "-")}`);
      } else {
        setError("ඔබට කිසිදු access permissions නොමැත. Admin හා සම්බන්ධ වන්න.");
        setLoading(false);
      }

    } catch {
      setError("Server එකට connect වෙන්න බැරිය. Backend running දැයි check කරන්න.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <header className="h-[70px] w-full bg-blue-950 border-b border-green-700 flex items-center justify-between px-6">
        <h1 className="text-green-400 font-bold text-xl tracking-widest">BASTEL PVT LTD</h1>
        <span className="text-gray-500 text-sm border border-gray-700 px-3 py-1 rounded">Not logged in</span>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="bg-blue-950 border border-green-800 p-8 rounded-xl shadow-2xl w-[400px]">
          <div className="text-center mb-6">
            <h2 className="text-green-400 font-bold text-2xl tracking-widest">BASTEL PVT LTD</h2>
            <p className="text-gray-400 text-xs mt-1">High Security Monitoring System</p>
            <div className="w-16 h-px bg-green-700 mx-auto mt-3" />
          </div>

          <div className="bg-blue-900/50 border border-blue-700 rounded p-3 mb-5 text-center">
            <p className="text-blue-300 text-xs">🔒 Authorized personnel only. Please confirm your identity.</p>
          </div>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full mb-3 p-3 bg-gray-900 border border-green-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            className="w-full mb-4 p-3 bg-gray-900 border border-green-800 rounded text-white placeholder-gray-500 focus:outline-none focus:border-green-400 transition"
          />

          {error && (
            <div className="bg-red-900/40 border border-red-700 rounded p-2 mb-3 text-center">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded hover:bg-green-600 font-bold tracking-widest transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "LOGIN"}
          </button>

          <p className="text-gray-600 text-xs text-center mt-4">
            Unauthorized access is strictly prohibited and monitored.
          </p>
        </div>
      </main>

      <footer className="h-[70px] w-full bg-blue-950 border-t border-green-700 flex flex-col items-center justify-center">
        <p className="text-green-500 text-xs tracking-widest">⚠ HIGH SECURITY SYSTEM — Unauthorized access strictly prohibited</p>
        <p className="text-gray-500 text-xs mt-1">BASTEL PVT LTD — Version 1.2.0</p>
      </footer>
    </div>
  );
}
