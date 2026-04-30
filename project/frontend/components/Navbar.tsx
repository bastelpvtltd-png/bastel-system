"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

interface NavItem { label: string; href: string; subs: string[]; }
interface NavbarProps { username: string; isAdmin?: boolean; onLogout: () => void; }
interface Message { id: number; from_user: string; to_user: string; message: string; timestamp: string; is_read: number; }
interface UserItem { username: string; fullName: string; }

export default function Navbar({ username, isAdmin, onLogout }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Dropdowns
  const [openPanel, setOpenPanel] = useState<"messages" | "mail" | "contact" | "user" | null>(null);

  // Messages state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [inbox, setInbox] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [composeMsg, setComposeMsg] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<"list" | "chat" | "new">("list");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // User profile (for admin dropdown)
  const [profile, setProfile] = useState({ fullName: "", designation: "" });

  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    setMounted(true);
    // Nav items
    try {
      const cached = localStorage.getItem("tabs_cache_navbar");
      if (cached) setNavItems(JSON.parse(cached));
    } catch {}
    const isAdminLocal = localStorage.getItem("isAdmin") === "true";
    const allowedMainTabs: string[] = JSON.parse(localStorage.getItem("mainTabs") || "[]");
    fetch(`${API}/api/nav-config`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const result = isAdminLocal ? data : data.filter((item: NavItem) =>
          allowedMainTabs.some(t => t.toLowerCase() === item.label.toLowerCase())
        );
        localStorage.setItem("tabs_cache_navbar", JSON.stringify(result));
        setNavItems(result);
      }).catch(() => {});

    // Profile
    const u = localStorage.getItem("username") || "";
    setProfile({
      fullName: localStorage.getItem("fullName") || "",
      designation: localStorage.getItem("designation") || "",
    });

    // Users list for messages
    fetch(`${API}/api/messages/users-list`)
      .then(r => r.json())
      .then(d => setUsers((d.users || []).filter((x: UserItem) => x.username !== u)))
      .catch(() => {});

    // Unread poll
    function fetchUnread() {
      if (!u) return;
      fetch(`${API}/api/messages/unread-count`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u }),
      }).then(r => r.json()).then(d => setUnreadCount(d.count || 0)).catch(() => {});
    }
    fetchUnread();
    const iv = setInterval(fetchUnread, 20000);
    return () => clearInterval(iv);
  }, []);

  // Load inbox when messages panel opens
  useEffect(() => {
    if (openPanel !== "messages") return;
    const u = localStorage.getItem("username") || "";
    loadInbox(u);
  }, [openPanel]);

  function loadInbox(u: string) {
    if (!u) return;
    fetch(`${API}/api/messages/inbox`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u }),
    }).then(r => r.json()).then(d => setInbox(d.messages || [])).catch(() => {});
  }

  function loadConversation(other: string) {
    const u = localStorage.getItem("username") || "";
    fetch(`${API}/api/messages/conversation`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user1: u, user2: other }),
    }).then(r => r.json()).then(d => {
      setConversation(d.messages || []);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }).catch(() => {});
  }

  function openChat(user: UserItem) {
    setSelectedUser(user);
    setView("chat");
    loadConversation(user.username);
    // Mark all from this user as read
    inbox.filter(m => m.from_user === user.username && m.is_read == 0).forEach(m =>
      fetch(`${API}/api/messages/mark-read`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id }),
      })
    );
    setInbox(prev => prev.map(m => m.from_user === user.username ? { ...m, is_read: 1 } : m));
    setUnreadCount(prev => Math.max(0, prev - inbox.filter(m => m.from_user === user.username && m.is_read == 0).length));
  }

  async function sendMessage() {
    if (!selectedUser || !composeMsg.trim()) return;
    const u = localStorage.getItem("username") || "";
    setSending(true);
    try {
      const res = await fetch(`${API}/api/messages/send`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from_user: u, to_user: selectedUser.username, message: composeMsg }),
      });
      if (res.ok) {
        setComposeMsg("");
        loadConversation(selectedUser.username);
      }
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(id: number) {
    const u = localStorage.getItem("username") || "";
    await fetch(`${API}/api/messages/delete`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, username: u }),
    });
    setConversation(prev => prev.filter(m => m.id !== id));
  }

  function togglePanel(panel: typeof openPanel) {
    setOpenPanel(prev => prev === panel ? null : panel);
    if (panel === "messages") { setView("list"); setSelectedUser(null); }
  }

  // Unique senders for inbox list
  const senderList = [...new Map(
    inbox.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
         .map(m => [m.from_user, m])
  ).values()];

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchUser.toLowerCase())
  );

  const unreadFromSelected = selectedUser
    ? inbox.filter(m => m.from_user === selectedUser.username && m.is_read == 0).length
    : 0;

  return (
    <>
      <header className="h-[70px] w-full bg-blue-950 border-b border-green-700 flex items-center justify-between px-6 fixed top-0 left-0 z-40">
        <h1 className="text-green-400 font-bold text-xl tracking-widest">BASTEL PVT LTD</h1>

        <div className="flex items-center gap-2" ref={panelRef}>
          {/* Nav tabs */}
          {mounted && navItems.map(item => (
            <button key={item.label}
              onClick={() => router.push(item.href)}
              className={`px-3 py-1 rounded text-sm transition border ${
                pathname.startsWith(item.href)
                  ? "bg-green-700 text-white border-green-500"
                  : "text-green-400 border-green-800 hover:bg-green-900"
              }`}
            >{item.label}</button>
          ))}

          <div className="w-px h-6 bg-green-800 mx-1" />

          {/* MAIL button */}
          <div className="relative">
            <button onClick={() => togglePanel("mail")}
              className={`text-green-400 border px-3 py-1 rounded text-sm transition ${openPanel === "mail" ? "bg-blue-800 border-blue-500" : "border-blue-700 hover:bg-blue-900"}`}>
              ✉ Mail
            </button>
            {openPanel === "mail" && (
              <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-green-800 rounded-lg shadow-2xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-green-900">
                  <span className="text-green-400 font-bold text-sm">Mail</span>
                  <button onClick={() => setOpenPanel(null)} className="text-gray-500 hover:text-red-400 text-lg">✕</button>
                </div>
                <div className="p-4 text-center">
                  <p className="text-5xl mb-3">📬</p>
                  <p className="text-gray-400 text-sm">Mail module coming soon.</p>
                  <p className="text-gray-600 text-xs mt-1">Use Messages for internal communication.</p>
                </div>
              </div>
            )}
          </div>

          {/* MESSAGES button */}
          <div className="relative">
            <button onClick={() => togglePanel("messages")}
              className={`relative text-green-400 border px-3 py-1 rounded text-sm transition ${openPanel === "messages" ? "bg-blue-800 border-blue-500" : "border-blue-700 hover:bg-blue-900"}`}>
              💬 Messages
              {mounted && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {openPanel === "messages" && (
              <div className="absolute right-0 top-10 w-[520px] h-[480px] bg-gray-900 border border-green-800 rounded-lg shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-green-900 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {view !== "list" && (
                      <button onClick={() => { setView("list"); setSelectedUser(null); }}
                        className="text-green-400 hover:text-white text-lg mr-1">←</button>
                    )}
                    <span className="text-green-400 font-bold text-sm">
                      {view === "list" ? "Messages" : view === "new" ? "New Message" : selectedUser?.fullName}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setView("new")}
                      className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded hover:bg-green-700 transition">
                      + New
                    </button>
                    <button onClick={() => setOpenPanel(null)} className="text-gray-500 hover:text-red-400 text-lg">✕</button>
                  </div>
                </div>

                {/* INBOX LIST */}
                {view === "list" && (
                  <div className="flex-1 overflow-y-auto">
                    {senderList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <p className="text-4xl mb-3">💬</p>
                        <p className="text-gray-500 text-sm">No messages yet</p>
                        <button onClick={() => setView("new")}
                          className="mt-4 bg-green-700 text-white px-4 py-2 rounded text-xs hover:bg-green-600">
                          Start a conversation
                        </button>
                      </div>
                    ) : senderList.map(m => {
                      const sender = users.find(u => u.username === m.from_user);
                      const unreadN = inbox.filter(i => i.from_user === m.from_user && i.is_read == 0).length;
                      const displayName = sender?.fullName || m.from_user;
                      return (
                        <button key={m.from_user}
                          onClick={() => openChat({ username: m.from_user, fullName: displayName })}
                          className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition ${selectedUser?.username === m.from_user ? "bg-gray-800" : ""}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className={`text-sm font-bold ${unreadN > 0 ? "text-white" : "text-green-400"}`}>{displayName}</span>
                                {unreadN > 0 && <span className="bg-red-600 text-white text-[9px] px-1.5 rounded-full">{unreadN}</span>}
                              </div>
                              <p className="text-gray-500 text-xs truncate mt-0.5">{m.message}</p>
                              <p className="text-gray-700 text-[10px]">{m.timestamp}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* CHAT VIEW */}
                {view === "chat" && selectedUser && (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {conversation.length === 0 && (
                        <div className="flex items-center justify-center h-full text-gray-600 text-xs">No messages yet. Say hello!</div>
                      )}
                      {conversation.map(m => {
                        const myUser = localStorage.getItem("username") || "";
                        const isMine = m.from_user === myUser;
                        return (
                          <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} group`}>
                            <div className={`relative max-w-[75%] px-3 py-2 rounded-lg text-sm ${isMine ? "bg-green-800 text-white" : "bg-gray-800 text-gray-200 border border-gray-700"}`}>
                              <p>{m.message}</p>
                              <p className="text-[9px] mt-1 opacity-60">{m.timestamp}</p>
                              {isMine && (
                                <button
                                  onClick={() => deleteMessage(m.id)}
                                  className="absolute -top-2 -right-2 hidden group-hover:flex w-5 h-5 bg-red-700 text-white rounded-full items-center justify-center text-[10px] hover:bg-red-600"
                                  title="Delete"
                                >✕</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="px-4 py-3 border-t border-gray-800 flex gap-2 flex-shrink-0">
                      <input
                        value={composeMsg}
                        onChange={e => setComposeMsg(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                        placeholder={`Message ${selectedUser.fullName}...`}
                        className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-green-500 placeholder-gray-600"
                      />
                      <button onClick={sendMessage} disabled={sending || !composeMsg.trim()}
                        className="bg-green-700 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-600 disabled:opacity-40 transition">
                        {sending ? "..." : "Send"}
                      </button>
                    </div>
                  </>
                )}

                {/* NEW MESSAGE */}
                {view === "new" && (
                  <div className="flex-1 flex flex-col p-4">
                    <p className="text-green-500 text-xs mb-3 uppercase tracking-wider">Select recipient</p>
                    <input
                      value={searchUser}
                      onChange={e => setSearchUser(e.target.value)}
                      placeholder="Search by name or username..."
                      className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-green-500 mb-3"
                    />
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {filteredUsers.length === 0 && (
                        <p className="text-gray-600 text-xs text-center mt-8">No users found</p>
                      )}
                      {filteredUsers.map(u => (
                        <button key={u.username}
                          onClick={() => {
                            setSelectedUser(u);
                            setView("chat");
                            loadConversation(u.username);
                            setSearchUser("");
                          }}
                          className="w-full text-left px-3 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-3 transition">
                          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-sm">
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-green-300 text-sm font-bold">{u.fullName}</p>
                            <p className="text-gray-500 text-xs">@{u.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* USERNAME button → profile dropdown */}
          <div className="relative">
            <button onClick={() => togglePanel("user")}
              className={`text-green-400 border px-3 py-1 rounded text-sm transition ${openPanel === "user" ? "bg-blue-800 border-blue-500" : "border-blue-700 hover:bg-blue-900"}`}>
              👤 {mounted ? (username || "...") : "..."}
            </button>
            {openPanel === "user" && mounted && (
              <div className="absolute right-0 top-10 w-64 bg-gray-900 border border-green-800 rounded-lg shadow-2xl z-50">
                <div className="p-4 border-b border-green-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-lg border border-green-500">
                      {(profile.fullName || username)?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{profile.fullName || username}</p>
                      <p className="text-green-400 text-xs">{profile.designation || "—"}</p>
                      <p className="text-gray-500 text-xs">@{username}</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <button
                    onClick={() => { setOpenPanel(null); router.push("/settings/profile"); }}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-green-300 text-sm transition flex items-center gap-2">
                    ✏ Edit Profile / Settings
                  </button>
                  <button
                    onClick={() => { setOpenPanel(null); router.push("/settings/security"); }}
                    className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-blue-300 text-sm transition flex items-center gap-2">
                    🔒 Change Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CONTACT */}
          <div className="relative">
            <button onClick={() => togglePanel("contact")}
              className={`text-white border px-3 py-1 rounded text-sm transition ${openPanel === "contact" ? "bg-green-600 border-green-500" : "bg-green-700 border-green-600 hover:bg-green-600"}`}>
              Contact
            </button>
            {openPanel === "contact" && (
              <div className="absolute right-0 top-10 w-72 bg-gray-900 border border-green-800 rounded-lg shadow-2xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-green-900">
                  <span className="text-green-400 font-bold text-sm">Contact</span>
                  <button onClick={() => setOpenPanel(null)} className="text-gray-500 hover:text-red-400 text-lg">✕</button>
                </div>
                <div className="p-4">
                  <div className="flex gap-2 mb-4">
                    {(["Owner", "Workers"] as const).map(t => (
                      <button key={t}
                        onClick={() => {}}
                        className="flex-1 px-3 py-1 rounded text-xs bg-green-900 text-green-300 hover:bg-green-800 transition">
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="text-gray-300 text-sm space-y-2">
                    <p><span className="text-green-400">Name:</span> Bathiya Kumara</p>
                    <p><span className="text-green-400">Phone:</span> +94 77 000 0000</p>
                    <p><span className="text-green-400">Email:</span> owner@bastel.lk</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={onLogout}
            className="bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
            Logout
          </button>
        </div>
      </header>

      <footer className="h-[70px] w-full bg-blue-950 border-t border-green-700 flex flex-col items-center justify-center fixed bottom-0 left-0 z-40">
        <p className="text-green-500 text-xs tracking-widest">⚠ HIGH SECURITY SYSTEM — Unauthorized access strictly prohibited</p>
        <p className="text-gray-500 text-xs mt-1">BASTEL PVT LTD — Version 1.2.0</p>
      </footer>
    </>
  );
}
