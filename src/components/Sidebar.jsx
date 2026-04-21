import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Trophy, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut,
  Video,
  FileText,
  MessageSquare
} from "lucide-react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:       "#070B14",
  surface:  "#0D1526",
  raised:   "#111E35",
  border:   "#1A2A45",
  borderHi: "#243550",
  orange:   "#FF6B1A",
  orangeDim:"#FF6B1A33",
  cyan:     "#00D4C8",
  cyanDim:  "#00D4C822",
  green:    "#22C55E",
  greenDim: "#22C55E22",
  red:      "#EF4444",
  text:     "#E2ECF8",
  muted:    "#4A6080",
  dim:      "#243550",
};

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  const adminNavigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
    { name: "Batches", href: "/dashboard/batches", icon: Layers },
    { name: "Exams", href: "/dashboard/tests", icon: Trophy },
    { name: "Subscriptions", href: "/dashboard/plans", icon: CreditCard },
    { name: "Doubts", href: "/dashboard/doubts", icon: MessageSquare },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const teacherNavigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Batches", href: "/dashboard/teacher/batches", icon: Layers },
    { name: "Live Classes", href: "/dashboard/teacher/live", icon: Video },
    { name: "Resources", href: "/dashboard/teacher/resources", icon: FileText },
    { name: "Doubts", href: "/dashboard/doubts", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const navigation = user?.role === "admin" ? adminNavigation : teacherNavigation;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{
      width: collapsed ? 70 : 240,
      background: C.surface,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      transition: "width 0.25s ease",
      flexShrink: 0,
      overflow: "hidden",
      height: "100vh",
      fontFamily: "'Syne', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Martian+Mono:wght@400;500;600;700&display=swap');
        .nav-item:hover { background: ${C.raised} !important; color: ${C.text} !important; }
        .nav-item { transition: all 0.15s; cursor:pointer; text-decoration: none; }
      `}</style>

      {/* Logo */}
      <div style={{ padding:"20px 16px 18px", borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", gap:10, whiteSpace:"nowrap" }}>
        <div style={{ width:36, height:36, borderRadius:10,
          background:`linear-gradient(135deg,${C.orange},${C.red})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, fontWeight:800, color:"white", flexShrink:0 }}>P</div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:C.text,
              letterSpacing:"-0.5px" }}>PW {user?.role === "admin" ? "Admin" : "Teacher"}</div>
            <div style={{ fontSize:10, color:C.muted, fontFamily:"'Martian Mono',monospace" }}>
              v4.2.0 · PROD
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" }}>
        {navigation.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.name} to={item.href} className="nav-item"
              style={{
                display:"flex", alignItems:"center", gap:12,
                padding: "10px 12px",
                borderRadius:8, marginBottom:2,
                background: active ? C.orangeDim : "transparent",
                color: active ? C.orange : C.muted,
                justifyContent: collapsed ? "center" : "flex-start",
                whiteSpace:"nowrap",
                border: active ? `1px solid ${C.orange}33` : "1px solid transparent",
              }}>
              <item.icon size={20} style={{ flexShrink:0 }} />
              {!collapsed && (
                <span style={{ fontSize:13, fontWeight:active?700:500,
                  fontFamily:"'Martian Mono',monospace" }}>{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding:"12px 8px", borderTop:`1px solid ${C.border}` }}>
        <div className="nav-item"
          onClick={() => setCollapsed(!collapsed)}
          style={{ display:"flex", alignItems:"center", justifyContent: collapsed?"center":"flex-start",
            gap:12, padding:"8px 12px", borderRadius:8, color:C.muted, whiteSpace:"nowrap", marginBottom: 4 }}>
          {collapsed ? <LayoutDashboard size={20} /> : <div style={{display:'flex', alignItems:'center', gap: 12}}><LayoutDashboard size={20} /> <span style={{ fontSize:12, fontFamily:"'Martian Mono',monospace" }}>Collapse</span></div>}
        </div>
        
        <div className="nav-item"
          onClick={handleLogout}
          style={{ display:"flex", alignItems:"center", justifyContent: collapsed?"center":"flex-start",
            gap:12, padding:"8px 12px", borderRadius:8, color:C.red, whiteSpace:"nowrap" }}>
          <LogOut size={20} />
          {!collapsed && <span style={{ fontSize:12, fontWeight: 700, fontFamily:"'Martian Mono',monospace" }}>Sign Out</span>}
        </div>
      </div>
    </div>
  );
}
