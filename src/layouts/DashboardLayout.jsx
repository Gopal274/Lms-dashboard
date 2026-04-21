import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Loader2, Bell, Check, Search } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "../components/ui/popover";
import { Badge } from "../components/ui/badge";
import api from "../lib/api";
import io from "socket.io-client";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:       "#070B14",
  surface:  "#0D1526",
  raised:   "#111E35",
  border:   "#1A2A45",
  borderHi: "#243550",
  orange:   "#FF6B1A",
  cyan:     "#00D4C8",
  green:    "#22C55E",
  red:      "#EF4444",
  text:     "#E2ECF8",
  muted:    "#4A6080",
  dim:      "#243550",
};

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [time, setTime] = useState(new Date());
  const socketRef = useRef();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "teacher"))) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
        fetchNotifications();
        socketRef.current = io("http://localhost:8000");
        socketRef.current.emit("register", user._id);

        socketRef.current.on("new_notification", (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => socketRef.current.disconnect();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notification/get-all-notifications");
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => n.status === "unread").length);
      }
    } catch (e) {
      console.error("Failed to fetch notifications");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
        await api.put(`/notification/update-notification/${id}`);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: "read" } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
        console.error(e);
    }
  };

  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (path === "dashboard") return "Overview";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (loading || !user) {
    return (
      <div style={{ display: "flex", height: "screen", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <Loader2 style={{ height: 40, width: 40, animation: "spin 2s linear infinite", color: C.orange }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden", fontFamily: "'Syne', sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{ height: 64, background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>
              {getPageTitle()}
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Martian Mono', monospace", marginTop: 2 }}>
              {time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              {" · "}
              {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px" }}>
              <Search size={14} style={{ color: C.muted }} />
              <input placeholder="Quick search..." style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 12, width: 150, fontFamily: "'Martian Mono', monospace" }} />
            </div>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <button style={{ position: "relative", cursor: "pointer", background: C.raised, border: `1px solid ${C.border}`, borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: C.text }}>
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <div style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: "50%", background: C.red, border: `2px solid ${C.surface}` }} />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent style={{ width: 320, padding: 0, marginRight: 24, marginTop: 8, background: C.surface, border: `1px solid ${C.borderHi}`, color: C.text, boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                <div style={{ padding: 16, borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800 }}>Notifications</h3>
                  <Badge style={{ background: C.orangeDim, color: C.orange, border: `1px solid ${C.orange}33` }}>{unreadCount} New</Badge>
                </div>
                <div style={{ maxHeight: 380, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: C.muted, fontSize: 12 }}>No notifications yet.</div>
                  ) : (
                    notifications.map((notif, i) => (
                      <div key={notif._id || i} style={{ padding: 16, borderBottom: `1px solid ${C.border}`, background: notif.status === 'unread' ? C.raised : 'transparent', position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <h4 style={{ fontSize: 12, fontWeight: 700, color: notif.status === 'unread' ? C.orange : C.text }}>{notif.title}</h4>
                          <span style={{ fontSize: 10, color: C.muted }}>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{notif.message}</p>
                        {notif.status === 'unread' && (
                          <button onClick={() => handleMarkAsRead(notif._id)} style={{ position: "absolute", right: 12, bottom: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: 4, color: C.green, cursor: "pointer" }}>
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div style={{ padding: 10, borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
                  <button style={{ fontSize: 11, fontWeight: 700, color: C.orange, background: "none", border: "none", cursor: "pointer" }}>Clear All</button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.raised, border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 12px 6px 8px", cursor: "pointer" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.orange}, ${C.red})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "white" }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1 }}>{user.name}</span>
                <span style={{ fontSize: 9, color: C.muted, fontFamily: "'Martian Mono', monospace", marginTop: 2 }}>{user.role.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Outlet />
          </div>
        </main>
        
        {/* Footer Bar */}
        <footer style={{ height: 28, background: C.surface, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 16 }}>
             <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
                <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Martian Mono', monospace" }}>API OK</span>
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
                <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Martian Mono', monospace" }}>SOCKET OK</span>
             </div>
          </div>
          <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Martian Mono', monospace" }}>v4.2.0 · {user.role.toUpperCase()} CONSOLE</span>
        </footer>
      </div>
    </div>
  );
}

