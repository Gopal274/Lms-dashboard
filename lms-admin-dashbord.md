import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from "recharts";

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
  {subject:"Chemistry",topic:"p-Block Elements",teacher:"Vivek Sir",viewers:0,status:"upcoming",batch:"JEE 2025",start:"6:00 PM"},
  {subject:"Physics",topic:"Modern Physics",teacher:"Pankaj Sir",viewers:0,status:"upcoming",batch:"NEET 2025",start:"7:00 PM"},
];

const recentDoubt = [
  {student:"Arjun M.",doubt:"In SHM, how do you derive velocity-position relation?",time:"2m",status:"ai",subject:"Physics"},
  {student:"Priya K.",doubt:"Difference between Mitosis and Meiosis in cell division count?",time:"4m",status:"resolved",subject:"Biology"},
  {student:"Rahul S.",doubt:"Why does limit of sin(x)/x = 1 as x→0?",time:"7m",status:"pending",subject:"Maths"},
  {student:"Sneha R.",doubt:"Hybridisation of SF6 molecule?",time:"9m",status:"ai",subject:"Chemistry"},
  {student:"Karan T.",doubt:"Derive work-energy theorem from Newton's 2nd law?",time:"12m",status:"resolved",subject:"Physics"},
];

const kpis = [
  {label:"Total Students",value:"10.4M",delta:"+18%",deltaPos:true,sub:"vs last month",color:C.cyan,icon:"👥"},
  {label:"Daily Active",value:"5,28,400",delta:"+9.2%",deltaPos:true,sub:"today peak",color:C.orange,icon:"🔥"},
  {label:"Monthly Revenue",value:"₹52.3 Cr",delta:"+23%",deltaPos:true,sub:"Apr 2026",color:C.green,icon:"💰"},
  {label:"Live Now",value:"3 Classes",delta:"29,400",deltaPos:true,sub:"concurrent viewers",color:C.blue,icon:"📡"},
  {label:"Doubt Queue",value:"1,284",delta:"-8%",deltaPos:true,sub:"avg resolve: 4.2 min",color:C.yellow,icon:"❓"},
  {label:"Completion Rate",value:"64.8%",delta:"+2.1%",deltaPos:true,sub:"all active courses",color:C.orange,icon:"✅"},
];

const navItems = [
  {id:"overview",icon:"⬡",label:"Overview"},
  {id:"students",icon:"◈",label:"Students"},
  {id:"courses",icon:"▣",label:"Courses"},
  {id:"live",icon:"◉",label:"Live Classes"},
  {id:"revenue",icon:"◆",label:"Revenue"},
  {id:"doubts",icon:"◎",label:"Doubts"},
  {id:"content",icon:"▤",label:"Content"},
  {id:"settings",icon:"◌",label:"Settings"},
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
const OverviewPanel = () => (
  <div>
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
          <div style={{ display:"flex", gap:16, fontSize:11, color:C.muted }}>
            <span style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:12, height:2, background:C.orange, display:"inline-block" }} /> Enrolled
            </span>
            <span style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ width:12, height:2, background:C.cyan, display:"inline-block", borderTop:"2px dashed" }} /> Active
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={enrollmentData}>
            <defs>
              <linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.orange} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={C.orange} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={C.cyan} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="m" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}
              tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Area type="monotone" dataKey="enroll" name="Enrolled" stroke={C.orange}
              strokeWidth={2} fill="url(#gOrange)"/>
            <Area type="monotone" dataKey="active" name="Active" stroke={C.cyan}
              strokeWidth={2} fill="url(#gCyan)" strokeDasharray="4 2"/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>
          Batch Distribution
        </div>
        <div style={{ fontSize:11, color:C.muted, marginBottom:16 }}>By enrolled students</div>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={batchData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
              dataKey="value" paddingAngle={3}>
              {batchData.map((e,i) => <Cell key={i} fill={e.color} stroke="none"/>)}
            </Pie>
            <Tooltip content={({active,payload})=>active&&payload?.[0]?(
              <div style={{background:C.raised,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 12px",fontSize:12}}>
                <span style={{color:payload[0].payload.color}}>{payload[0].name}</span>
                <strong style={{color:C.text,marginLeft:8}}>{payload[0].value}%</strong>
              </div>
            ):null}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
          {batchData.map((b,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:b.color }}/>
                <span style={{ fontSize:11, color:C.muted }}>{b.name}</span>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:C.text,
                fontFamily:"'Martian Mono',monospace" }}>{b.value}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Bottom Row */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
      {/* Watch Time */}
      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>
          Weekly Watch Time
        </div>
        <div style={{ fontSize:11, color:C.muted, marginBottom:16 }}>Total hrs streamed this week</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={watchTimeData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="d" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}
              tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="hrs" name="Hours" fill={C.orange} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Live Now */}
      <Card>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif" }}>Live Classes</div>
          <Badge color={C.red}>● {liveClasses.filter(l=>l.status==="live").length} LIVE</Badge>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {liveClasses.slice(0,4).map((lc,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 12px", background:C.raised, borderRadius:8,
              border:`1px solid ${lc.status==="live" ? C.red+"33" : C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <Dot color={lc.status==="live" ? C.red : C.muted} pulse={lc.status==="live"}/>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{lc.teacher}</div>
                  <div style={{ fontSize:10, color:C.muted }}>{lc.subject} · {lc.batch}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                {lc.status==="live"
                  ? <div style={{ fontSize:12, fontWeight:700, color:C.orange,
                      fontFamily:"'Martian Mono',monospace" }}>{lc.viewers.toLocaleString()} 👁</div>
                  : <div style={{ fontSize:11, color:C.muted }}>{lc.start}</div>
                }
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// ─── PANEL: COURSES ───────────────────────────────────────────────────────────
const CoursesPanel = () => (
  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
      {[
        {label:"Total Courses",value:"2,847",sub:"across all batches",color:C.cyan},
        {label:"Videos Published",value:"1.24L",sub:"total content hours: 8,420",color:C.orange},
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
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",
          padding:"8px 12px", borderBottom:`1px solid ${C.border}` }}>
          {["Course","Students","Completion","Rating","Trend"].map(h=>(
            <div key={h} style={{ fontSize:10, color:C.muted, fontWeight:700,
              letterSpacing:"0.8px", fontFamily:"'Martian Mono',monospace" }}>{h.toUpperCase()}</div>
          ))}
        </div>
        {topCourses.map((c,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",
            padding:"14px 12px", borderBottom:`1px solid ${C.border}`,
            transition:"background 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.raised}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{c.name}</div>
            </div>
            <div style={{ fontSize:13, color:C.text, fontFamily:"'Martian Mono',monospace" }}>
              {c.students.toLocaleString()}
            </div>
            <div>
              <div style={{ fontSize:12, color:C.cyan, fontFamily:"'Martian Mono',monospace",
                marginBottom:5 }}>{c.completion}%</div>
              <MiniBar value={c.completion} color={C.cyan}/>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ color:C.yellow }}>★</span>
              <span style={{ fontSize:13, color:C.text,
                fontFamily:"'Martian Mono',monospace" }}>{c.rating}</span>
            </div>
            <Badge color={C.green}>{c.trend}</Badge>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── PANEL: REVENUE ───────────────────────────────────────────────────────────
const RevenuePanel = () => (
  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
      {[
        {label:"MTD Revenue",value:"₹52.3 Cr",delta:"+23%",color:C.green},
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

    <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:12 }}>
      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:18 }}>
          Revenue Breakdown — Last 4 Months
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueBreakdown} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
            <XAxis dataKey="m" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}
              tickFormatter={v=>`₹${v}Cr`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="sub" name="Subscription" fill={C.cyan} radius={[4,4,0,0]} stackId="a"/>
            <Bar dataKey="oneTime" name="One-Time" fill={C.orange} radius={[4,4,0,0]} stackId="a"/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif", marginBottom:4 }}>
          Payment Methods
        </div>
        <div style={{ fontSize:11, color:C.muted, marginBottom:20 }}>This month</div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            {label:"UPI",pct:52,color:C.cyan},
            {label:"Credit/Debit Card",pct:24,color:C.orange},
            {label:"Net Banking",pct:12,color:C.blue},
            {label:"EMI",pct:9,color:C.green},
            {label:"Wallet",pct:3,color:C.yellow},
          ].map((p,i)=>(
            <div key={i}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:12, color:C.muted }}>{p.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.text,
                  fontFamily:"'Martian Mono',monospace" }}>{p.pct}%</span>
              </div>
              <MiniBar value={p.pct} color={p.color}/>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// ─── PANEL: DOUBTS ────────────────────────────────────────────────────────────
const DoubtsPanel = () => (
  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
      {[
        {label:"In Queue",value:"1,284",color:C.yellow},
        {label:"AI Resolved",value:"68.4%",color:C.cyan},
        {label:"Avg Resolve Time",value:"4.2 min",color:C.green},
        {label:"Pending >10min",value:"124",color:C.red},
      ].map((s,i)=>(
        <Card key={i} glow={s.color}>
          <div style={{ fontSize:10, color:C.muted, letterSpacing:"0.8px", marginBottom:8,
            fontFamily:"'Martian Mono',monospace" }}>{s.label.toUpperCase()}</div>
          <div style={{ fontSize:28, fontWeight:800, color:s.color,
            fontFamily:"'Syne',sans-serif", letterSpacing:"-1px" }}>{s.value}</div>
        </Card>
      ))}
    </div>

    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div style={{ fontSize:14, fontWeight:700, color:C.text, fontFamily:"'Syne',sans-serif" }}>
          Live Doubt Feed
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["All","Physics","Chemistry","Biology","Maths"].map(f=>(
            <button key={f} style={{ background:f==="All"?C.orangeDim:"transparent",
              border:`1px solid ${f==="All"?C.orange:C.border}`,
              color:f==="All"?C.orange:C.muted, padding:"4px 10px", borderRadius:5,
              fontSize:11, cursor:"pointer", fontFamily:"'Martian Mono',monospace" }}>{f}</button>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {recentDoubt.map((d,i)=>(
          <div key={i} style={{ display:"flex", gap:14, padding:"14px 12px",
            borderBottom:`1px solid ${C.border}`, transition:"background 0.15s",
            alignItems:"flex-start" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.raised}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:36, height:36, borderRadius:8, background:C.raised,
              border:`1px solid ${C.border}`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:14, flexShrink:0 }}>
              {d.subject==="Physics"?"⚡":d.subject==="Biology"?"🧬":d.subject==="Maths"?"∑":"⚗️"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{d.student}</span>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <Badge color={
                    d.status==="ai"?C.cyan:d.status==="resolved"?C.green:C.yellow
                  }>{d.status==="ai"?"AI AUTO":d.status==="resolved"?"RESOLVED":"PENDING"}</Badge>
                  <span style={{ fontSize:11, color:C.muted,
                    fontFamily:"'Martian Mono',monospace" }}>{d.time} ago</span>
                </div>
              </div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {d.doubt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PWDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [time, setTime] = useState(new Date());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const panel = {
    overview: <OverviewPanel/>,
    courses: <CoursesPanel/>,
    revenue: <RevenuePanel/>,
    doubts: <DoubtsPanel/>,
    students: <OverviewPanel/>,
    live: <OverviewPanel/>,
    content: <CoursesPanel/>,
    settings: <DoubtsPanel/>,
  }[activeNav];

  return (
    <div style={{ display:"flex", height:"100vh", background:C.bg, overflow:"hidden",
      fontFamily:"'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Martian+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.dim}; border-radius:2px; }
        @keyframes ping {
          0%,100%{opacity:1;transform:scale(1)}
          50%{opacity:0;transform:scale(2.2)}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        .panel-fade { animation: fadeUp 0.3s ease both; }
        .nav-item:hover { background: ${C.raised} !important; color: ${C.text} !important; }
        .nav-item { transition: all 0.15s; cursor:pointer; }
      `}</style>

      {/* Sidebar */}
      <div style={{
        width: collapsed ? 60 : 220,
        background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px 18px", borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:10, whiteSpace:"nowrap" }}>
          <div style={{ width:32, height:32, borderRadius:8,
            background:`linear-gradient(135deg,${C.orange},${C.red})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, fontWeight:800, color:"white", flexShrink:0 }}>P</div>
          {!collapsed && (
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:C.text,
                letterSpacing:"-0.5px" }}>PW Admin</div>
              <div style={{ fontSize:10, color:C.muted, fontFamily:"'Martian Mono',monospace" }}>
                v4.2.0 · PROD
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" }}>
          {navItems.map(item => {
            const active = activeNav === item.id;
            return (
              <div key={item.id} className="nav-item"
                onClick={() => setActiveNav(item.id)}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding: collapsed ? "10px 12px" : "10px 12px",
                  borderRadius:8, marginBottom:2,
                  background: active ? C.orangeDim : "transparent",
                  color: active ? C.orange : C.muted,
                  justifyContent: collapsed ? "center" : "flex-start",
                  whiteSpace:"nowrap",
                  border: active ? `1px solid ${C.orange}33` : "1px solid transparent",
                }}>
                <span style={{ fontSize:15, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ fontSize:13, fontWeight:active?700:500,
                    fontFamily:"'Martian Mono',monospace" }}>{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div style={{ padding:"12px 8px", borderTop:`1px solid ${C.border}` }}>
          <div className="nav-item"
            onClick={() => setCollapsed(!collapsed)}
            style={{ display:"flex", alignItems:"center", justifyContent: collapsed?"center":"flex-start",
              gap:10, padding:"8px 12px", borderRadius:8, color:C.muted, whiteSpace:"nowrap" }}>
            <span style={{ fontSize:14 }}>{collapsed ? "▶" : "◀"}</span>
            {!collapsed && <span style={{ fontSize:12, fontFamily:"'Martian Mono',monospace" }}>Collapse</span>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ height:56, background:C.surface, borderBottom:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 24px", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:C.text, letterSpacing:"-0.5px" }}>
              {navItems.find(n=>n.id===activeNav)?.label}
            </div>
            <div style={{ fontSize:11, color:C.muted, fontFamily:"'Martian Mono',monospace", marginTop:1 }}>
              {time.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
              {" · "}
              {time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Search */}
            <div style={{ display:"flex", alignItems:"center", gap:8,
              background:C.raised, border:`1px solid ${C.border}`,
              borderRadius:8, padding:"7px 12px" }}>
              <span style={{ color:C.muted, fontSize:13 }}>⌕</span>
              <input placeholder="Search students, courses..."
                style={{ background:"transparent", border:"none", outline:"none",
                  color:C.text, fontSize:12, width:180, fontFamily:"'Martian Mono',monospace" }}/>
            </div>
            {/* Notif */}
            <div style={{ position:"relative", cursor:"pointer" }}>
              <div style={{ width:36, height:36, borderRadius:8, background:C.raised,
                border:`1px solid ${C.border}`, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:16 }}>🔔</div>
              <div style={{ position:"absolute", top:6, right:6, width:8, height:8,
                borderRadius:"50%", background:C.red, border:`2px solid ${C.surface}` }}/>
            </div>
            {/* Avatar */}
            <div style={{ display:"flex", alignItems:"center", gap:9,
              background:C.raised, border:`1px solid ${C.border}`,
              borderRadius:8, padding:"6px 12px 6px 8px", cursor:"pointer" }}>
              <div style={{ width:24, height:24, borderRadius:"50%",
                background:`linear-gradient(135deg,${C.orange},${C.cyan})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700, color:"white" }}>A</div>
              <span style={{ fontSize:12, color:C.text,
                fontFamily:"'Martian Mono',monospace" }}>Admin</span>
              <span style={{ fontSize:10, color:C.muted }}>▾</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }} className="panel-fade" key={activeNav}>
          {panel}
        </div>

        {/* Status Bar */}
        <div style={{ height:28, background:C.surface, borderTop:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 20px", flexShrink:0 }}>
          <div style={{ display:"flex", gap:20 }}>
            {[
              {label:"API",status:"ok",color:C.green},
              {label:"CDN",status:"ok",color:C.green},
              {label:"Live Engine",status:"ok",color:C.green},
              {label:"Payment GW",status:"ok",color:C.green},
              {label:"Kafka",status:"degraded",color:C.yellow},
            ].map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Dot color={s.color} pulse={s.status!=="ok"}/>
                <span style={{ fontSize:10, color:C.muted,
                  fontFamily:"'Martian Mono',monospace" }}>{s.label}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize:10, color:C.muted,
            fontFamily:"'Martian Mono',monospace" }}>
            Region: ap-south-1 · SLO 99.94% ↑
          </span>
        </div>
      </div>
    </div>
  );
}

