import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { useAuth } from "../context/AuthContext";
import TeacherDashboard from "./TeacherDashboard";
import api from "../lib/api";

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
  redDim:   "#EF444422",
  yellow:   "#F59E0B",
  yellowDim:"#F59E0B22",
  blue:     "#3B82F6",
  text:     "#E2ECF8",
  muted:    "#4A6080",
  dim:      "#243550",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const enrollmentData = [
  {m:"Aug",enroll:12400,active:9800,revenue:18.2},
  {m:"Sep",enroll:15600,active:12100,revenue:23.1},
  {m:"Oct",enroll:19200,active:15400,revenue:28.7},
  {m:"Nov",enroll:16800,active:13200,revenue:24.5},
  {m:"Dec",enroll:13100,active:10500,revenue:19.8},
  {m:"Jan",enroll:22400,active:18900,revenue:34.2},
  {m:"Feb",enroll:28700,active:24100,revenue:43.6},
  {m:"Mar",enroll:31200,active:26800,revenue:47.9},
  {m:"Apr",enroll:34800,active:29400,revenue:52.3},
];

const watchTimeData = [
  {d:"Mon",hrs:18400},{d:"Tue",hrs:22100},{d:"Wed",hrs:19800},
  {d:"Thu",hrs:24300},{d:"Fri",hrs:21600},{d:"Sat",hrs:31200},{d:"Sun",hrs:28900},
];

const batchData = [
  {name:"JEE 2025",value:38,color:C.orange},
  {name:"NEET 2025",value:29,color:C.cyan},
  {name:"JEE 2026",value:19,color:C.blue},
  {name:"Class 11",value:9,color:C.green},
  {name:"Others",value:5,color:C.yellow},
];

const revenueBreakdown = [
  {m:"Jan",sub:28.4,oneTime:5.8},{m:"Feb",sub:34.1,oneTime:9.5},
  {m:"Mar",sub:38.6,oneTime:9.3},{m:"Apr",sub:43.2,oneTime:9.1},
];

const topCourses = [
  {name:"JEE Physics - Waves & Optics",students:48200,completion:73,rating:4.9,trend:"+12%"},
  {name:"NEET Biology - Human Physiology",students:41700,completion:68,rating:4.8,trend:"+8%"},
  {name:"JEE Maths - Calculus Masterclass",students:39100,completion:61,rating:4.7,trend:"+15%"},
  {name:"NEET Chemistry - Organic Chemistry",students:36800,completion:59,rating:4.8,trend:"+6%"},
  {name:"JEE Chemistry - Electrochemistry",students:28400,completion:71,rating:4.6,trend:"+3%"},
];

const liveClasses = [
  {subject:"Physics",topic:"Electromagnetic Induction",teacher:"Prateek Sir",viewers:12400,status:"live",batch:"JEE 2025",start:"4:00 PM"},
  {subject:"Biology",topic:"Nervous System & Brain",teacher:"Anupam Sir",viewers:9800,status:"live",batch:"NEET 2025",start:"4:30 PM"},
  {subject:"Mathematics",topic:"Integration Techniques",teacher:"Sachin Sir",viewers:7200,status:"live",batch:"JEE 2026",start:"5:00 PM"},
];

const recentDoubt = [
  {student:"Arjun M.",doubt:"In SHM, how do you derive velocity-position relation?",time:"2m",status:"ai",subject:"Physics"},
  {student:"Priya K.",doubt:"Difference between Mitosis and Meiosis in cell division count?",time:"4m",status:"resolved",subject:"Biology"},
  {student:"Rahul S.",doubt:"Why does limit of sin(x)/x = 1 as x→0?",time:"7m",status:"pending",subject:"Maths"},
  {student:"Sneha R.",doubt:"Hybridisation of SF6 molecule?",time:"9m",status:"ai",subject:"Chemistry"},
  {student:"Karan T.",doubt:"Derive work-energy theorem from Newton's 2nd law?",time:"12m",status:"resolved",subject:"Physics"},
];

const getKpis = (stats) => [
  {label:"Total Students",value: stats?.users?.toLocaleString() || "10.4M",delta:"+18%",deltaPos:true,sub:"vs last month",color:C.cyan,icon:"👥"},
  {label:"Active Courses",value: stats?.courses || "524",delta:"+9.2%",deltaPos:true,sub:"live courses",color:C.orange,icon:"🔥"},
  {label:"Total Orders",value: stats?.orders?.toLocaleString() || "₹52.3 Cr",delta:"+23%",deltaPos:true,sub:"all time",color:C.green,icon:"💰"},
  {label:"Live Sessions",value:"3 Classes",delta:"29,400",deltaPos:true,sub:"concurrent viewers",color:C.blue,icon:"📡"},
  {label:"Doubt Queue",value:"1,284",delta:"-8%",deltaPos:true,sub:"avg resolve: 4.2 min",color:C.yellow,icon:"❓"},
  {label:"Lessons",value: stats?.lessons || "64.8%",delta:"+2.1%",deltaPos:true,sub:"total content",color:C.orange,icon:"✅"},
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const Card = ({ children, style = {}, glow }) => (
  <div style={{
    background: C.surface,
    border: `1px solid ${glow ? glow + "44" : C.border}`,
    borderRadius: 12,
    padding: "20px 22px",
    boxShadow: glow ? `0 0 24px ${glow}11` : "none",
    ...style,
  }}>{children}</div>
);

const Badge = ({ children, color }) => (
  <span style={{
    background: color + "22", color,
    fontSize: 10, fontWeight: 700,
    padding: "2px 8px", borderRadius: 4,
    letterSpacing: "0.6px", fontFamily: "'Martian Mono', monospace",
  }}>{children}</span>
);

const MiniBar = ({ value, color, max = 100 }) => (
  <div style={{ width: "100%", height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
    <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 2,
      transition: "width 0.8s ease" }} />
  </div>
);

const Dot = ({ color, pulse }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    <span style={{
      display: "inline-block", width: 8, height: 8,
      borderRadius: "50%", background: color,
    }} />
    {pulse && <span style={{
      position: "absolute", top: 0, left: 0,
      width: 8, height: 8, borderRadius: "50%",
      background: color, animation: "ping 1.5s ease-out infinite",
    }} />}
  </span>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.raised, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "10px 14px", fontSize: 12,
      fontFamily: "'Martian Mono', monospace",
    }}>
      <div style={{ color: C.muted, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === "number" && p.value > 1000
            ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ─── PANEL: OVERVIEW ──────────────────────────────────────────────────────────
export const OverviewPanel = ({stats}) => {
  const kpis = getKpis(stats);
  return (
    <div className="panel-fade">
      {/* KPI Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12, marginBottom:20 }}>
        {kpis.map((k,i) => (
          <Card key={i} glow={k.color} style={{ animationDelay:`${i*60}ms` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:11, color:C.muted, fontWeight:600, letterSpacing:"0.8px", marginBottom:8,
                  fontFamily:"'Martian Mono', monospace" }}>{k.label.toUpperCase()}</div>
                <div style={{ fontSize:26, fontWeight:800, color:C.text, fontFamily:"'Syne',sans-serif",
                  letterSpacing:"-1px", lineHeight:1 }}>{k.value}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>{k.sub}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                <span style={{ fontSize:22 }}>{k.icon}</span>
                <Badge color={k.deltaPos ? C.green : C.red}>{k.delta}</Badge>
              </div>
            </div>
            <div style={{ marginTop:14, height:2,
              background:`linear-gradient(90deg,${k.color},${k.color}00)`, borderRadius:1 }} />
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:12, marginBottom:12 }}>
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif" }}>Enrollment & Active Students</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Aug 2025 – Apr 2026</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={enrollmentData}>
              <defs>
                <linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.orange} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={C.orange} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
              <XAxis dataKey="m" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}
                tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="enroll" name="Enrolled" stroke={C.orange}
                strokeWidth={2} fill="url(#gOrange)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>
            Batch Distribution
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={batchData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}>
                {batchData.map((e,i) => <Cell key={i} fill={e.color} stroke="none"/>)}
              </Pie>
              <Tooltip/>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ─── PANEL: COURSES ───────────────────────────────────────────────────────────
export const CoursesPanel = ({stats}) => (
  <div className="panel-fade" style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
      {[
        {label:"Total Courses",value: stats?.courses || "2,847",sub:"across all batches",color:C.cyan},
        {label:"Videos Published",value: stats?.lessons || "1.24L",sub:"total content",color:C.orange},
        {label:"Avg Completion",value:"64.8%",sub:"+2.1% this month",color:C.green},
      ].map((s,i)=>(
        <Card key={i} glow={s.color}>
          <div style={{ fontSize:11, color:C.muted, letterSpacing:"0.8px", marginBottom:8,
            fontFamily:"'Martian Mono',monospace" }}>{s.label.toUpperCase()}</div>
          <div style={{ fontSize:32, fontWeight:800, color:s.color,
            fontFamily:"'Syne',sans-serif", letterSpacing:"-1.5px" }}>{s.value}</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{s.sub}</div>
        </Card>
      ))}
    </div>

    <Card>
      <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:18 }}>
        Top Performing Courses
      </div>
      {topCourses.map((c,i)=>(
        <div key={i} style={{ padding:"14px 12px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.name}</div>
            <div style={{ fontSize:11, color:C.muted }}>{c.students.toLocaleString()} Students</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:12, color:C.cyan }}>{c.completion}% Done</div>
            <Badge color={C.green}>{c.trend}</Badge>
          </div>
        </div>
      ))}
    </Card>
  </div>
);

// ─── PANEL: REVENUE ───────────────────────────────────────────────────────────
export const RevenuePanel = ({stats}) => (
  <div className="panel-fade" style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
      {[
        {label:"MTD Revenue",value: stats?.orders ? `₹${stats.orders} Cr` : "₹52.3 Cr",delta:"+23%",color:C.green},
        {label:"Subscriptions",value:"₹43.2 Cr",delta:"82.6%",color:C.cyan},
        {label:"One-Time Sales",value:"₹9.1 Cr",delta:"17.4%",color:C.orange},
        {label:"Refunds",value:"₹1.2 Cr",delta:"-0.4%",color:C.red},
      ].map((s,i)=>(
        <Card key={i} glow={s.color}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.8px", marginBottom:8,
            fontFamily:"'Martian Mono',monospace" }}>{s.label.toUpperCase()}</div>
          <div style={{ fontSize:24, fontWeight:800, color:C.text,
            fontFamily:"'Syne',sans-serif", letterSpacing:"-1px" }}>{s.value}</div>
          <Badge color={s.color}>{s.delta}</Badge>
        </Card>
      ))}
    </div>
  </div>
);

// ─── PANEL: DOUBTS ────────────────────────────────────────────────────────────
export const DoubtsPanel = () => (
  <div className="panel-fade" style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <Card>
      <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:18 }}>
        Live Doubt Feed
      </div>
      {recentDoubt.map((d,i)=>(
        <div key={i} style={{ display:"flex", gap:14, padding:"14px 12px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{d.student}</span>
              <Badge color={d.status==="ai"?C.cyan:C.green}>{d.status.toUpperCase()}</Badge>
            </div>
            <div style={{ fontSize:12, color:C.muted }}>{d.doubt}</div>
          </div>
        </div>
      ))}
    </Card>
  </div>
);

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/analytics/get-overview-stats");
        if (data.success) setStats(data.stats);
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return <OverviewPanel stats={stats}/>;
}

export default function UnifiedDashboard() {
  const { user } = useAuth();
  if (user?.role === "teacher") {
    return <TeacherDashboard />;
  }
  return <AdminDashboard />;
}
