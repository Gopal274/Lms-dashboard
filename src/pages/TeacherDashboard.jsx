import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { Loader2 } from "lucide-react";

// ── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:"#070B14", s0:"#0D1526", s1:"#111E35", s2:"#172238",
  border:"#1A2A45", borderH:"#243550",
  teal:"#00C9A7", tealD:"#00C9A715",
  amber:"#F59E0B", amberD:"#F59E0B15",
  violet:"#7C3AED", violetD:"#7C3AED18",
  rose:"#F43F5E", roseD:"#F43F5E18",
  sky:"#38BDF8", skyD:"#38BDF815",
  green:"#22C55E", greenD:"#22C55E15",
  orange:"#FF6B1A", orangeD:"#FF6B1A15",
  text:"#E2ECF8", sub:"#4A6080", dim:"#243550",
};

// ── DATA MOCKS ───────────────────────────────────────────────────────────────
const BATCHES_MOCK = [
  { id:"jee25a", name:"JEE 2025 – Batch A", subject:"Physics", students:9800,  color:T.teal   },
  { id:"jee25b", name:"JEE 2025 – Batch B", subject:"Physics", students:8400,  color:T.sky    },
  { id:"jee26",  name:"JEE 2026",           subject:"Physics", students:12400, color:T.amber  },
  { id:"crash",  name:"JEE Crash Course",   subject:"Physics", students:4200,  color:T.violet },
];

const scheduleToday = [
  { time:"10:00 AM", topic:"Electromagnetic Induction – Faraday's Law", batch:"JEE 2025 A", duration:90, status:"done",     viewers:9800  },
  { time:"01:00 PM", topic:"Mutual Inductance & Transformers",            batch:"JEE 2025 B", duration:75, status:"done",     viewers:8400  },
  { time:"04:00 PM", topic:"Alternating Current Circuits",                batch:"JEE 2026",   duration:90, status:"live",     viewers:12400 },
  { time:"07:00 PM", topic:"LC Oscillations & RLC Circuit",               batch:"JEE 2025 A", duration:90, status:"upcoming", viewers:0     },
  { time:"09:00 PM", topic:"Doubt Clearing Session",                      batch:"All Batches",duration:60, status:"upcoming", viewers:0     },
];

const weekEng = [
  {d:"Mon",watch:88,complete:72,doubt:14},{d:"Tue",watch:91,complete:68,doubt:21},
  {d:"Wed",watch:84,complete:74,doubt:18},{d:"Thu",watch:93,complete:79,doubt:9},
  {d:"Fri",watch:87,complete:71,doubt:23},{d:"Sat",watch:96,complete:83,doubt:11},
  {d:"Sun",watch:78,complete:65,doubt:7},
];

const topStudents = [
  {name:"Arjun Mehta",   score:98.4,progress:94,doubts:12,streak:38,badge:"🏆"},
  {name:"Priya Kumari",  score:97.1,progress:92,doubts:8, streak:41,badge:"🥈"},
  {name:"Rahul Sharma",  score:96.8,progress:89,doubts:19,streak:29,badge:"🥉"},
  {name:"Sneha Reddy",   score:95.2,progress:91,doubts:6, streak:35,badge:"⭐"},
  {name:"Karan Thakur",  score:94.7,progress:87,doubts:14,streak:22,badge:"⭐"},
  {name:"Ananya Iyer",   score:93.9,progress:88,doubts:11,streak:18,badge:"⭐"},
];

const recordedLectures = [
  {id:1,title:"Electromagnetic Induction – Part 1: Faraday's Law",batch:"JEE 2025 A",chapter:"EMI",views:"2.1L",duration:"1h 28m",date:"Apr 18",size:"4.2 GB",status:"published",rating:4.9,completion:81},
  {id:2,title:"Electromagnetic Induction – Part 2: Lenz's Law",   batch:"JEE 2025 A",chapter:"EMI",views:"1.9L",duration:"1h 14m",date:"Apr 17",size:"3.8 GB",status:"published",rating:4.8,completion:76},
  {id:3,title:"Mutual Inductance & Transformers",                  batch:"JEE 2025 B",chapter:"EMI",views:"1.6L",duration:"1h 18m",date:"Apr 16",size:"4.0 GB",status:"published",rating:4.7,completion:73},
  {id:4,title:"AC Circuits – Impedance & Phasors",                batch:"JEE 2026",  chapter:"AC",  views:"0.9L",duration:"1h 32m",date:"Apr 15",size:"4.6 GB",status:"processing",rating:0,  completion:0 },
  {id:5,title:"LC Oscillations Deep Dive",                        batch:"JEE 2025 A",chapter:"AC",  views:"—",  duration:"1h 10m",date:"Apr 14",size:"3.4 GB",status:"draft",     rating:0,  completion:0 },
];

const dppList = [
  {id:1,title:"DPP #14 – Faraday's Law & Flux",          batch:"JEE 2025 A",chapter:"EMI",   questions:20,submitted:7840,total:9800, avgScore:68, dueDate:"Apr 21",status:"active",  topScore:98},
  {id:2,title:"DPP #13 – Electrostatics Practice Set",   batch:"JEE 2025 B",chapter:"Electro",questions:25,submitted:6200,total:8400, avgScore:72, dueDate:"Apr 20",status:"active",  topScore:100},
  {id:3,title:"DPP #12 – Magnetism Numericals",          batch:"JEE 2026",  chapter:"Magnets",questions:18,submitted:11400,total:12400,avgScore:61, dueDate:"Apr 19",status:"closed",  topScore:96},
  {id:4,title:"DPP #15 – AC Circuits (New)",             batch:"JEE 2026",  chapter:"AC",     questions:22,submitted:0,    total:12400,avgScore:0,  dueDate:"Apr 24",status:"draft",   topScore:0 },
  {id:5,title:"DPP #11 – Current Electricity",           batch:"JEE 2025 A",chapter:"Curr.El",questions:30,submitted:9800, total:9800, avgScore:77, dueDate:"Apr 14",status:"closed",  topScore:100},
];

const notesList = [
  {id:1,title:"Electromagnetic Induction – Handwritten Notes",  batch:"All Batches", type:"PDF",  pages:28,downloads:"3.2L",date:"Apr 18",size:"8.4 MB"},
  {id:2,title:"AC Circuits Formula Sheet",                      batch:"JEE 2025 A",  type:"PDF",  pages:4, downloads:"1.9L",date:"Apr 15",size:"1.2 MB"},
  {id:3,title:"Magnetism Mind Map",                             batch:"JEE 2026",    type:"Image",pages:2, downloads:"2.1L",date:"Apr 10",size:"3.6 MB"},
  {id:4,title:"Optics Complete Notes",                          batch:"All Batches", type:"PDF",  pages:42,downloads:"4.4L",date:"Apr 2", size:"14 MB" },
];

const testList = [
  {id:1,title:"Chapter Test – EMI & AC Circuits",  batch:"JEE 2025 A",questions:30,duration:60,scheduled:"Apr 22, 8 PM",status:"scheduled",avgScore:0  },
  {id:2,title:"Full Syllabus Mock – April",        batch:"All Batches",questions:90,duration:180,scheduled:"Apr 25, 10 AM",status:"scheduled",avgScore:0 },
  {id:3,title:"Chapter Test – Magnetism",          batch:"JEE 2026",  questions:25,duration:45,scheduled:"Apr 18",         status:"completed",avgScore:74},
  {id:4,title:"Quick Quiz – Faraday's Law",        batch:"JEE 2025 B",questions:10,duration:15,scheduled:"Apr 16",         status:"completed",avgScore:82},
];

const earningsData = [
  {m:"Nov",earn:2.1},{m:"Dec",earn:2.4},{m:"Jan",earn:3.1},
  {m:"Feb",earn:3.8},{m:"Mar",earn:4.2},{m:"Apr",earn:4.6},
];

const radarData = [
  {subject:"Clarity",A:92},{subject:"Pace",A:87},{subject:"Examples",A:96},
  {subject:"Coverage",A:89},{subject:"Engagement",A:94},{subject:"Doubt Res.",A:91},
];

const myDoubts = [
  {student:"Vikram P.", q:"In LCR circuit at resonance, why does impedance equal R only?",     time:"5m",  subject:"AC Circuits",   priority:"high"},
  {student:"Meera S.",  q:"Difference between self-inductance and mutual inductance?",           time:"11m", subject:"EMI",           priority:"med" },
  {student:"Aditya K.", q:"Why does energy stored in inductor equal ½LI²?",                    time:"18m", subject:"EMI",           priority:"high"},
  {student:"Riya T.",   q:"Direction of induced EMF using Lenz's law in 3D problems?",          time:"24m", subject:"Faraday's Law", priority:"med" },
  {student:"Saurabh N.",q:"What is displacement current and why did Maxwell introduce it?",    time:"31m", subject:"EM Waves",      priority:"low" },
];

// ── SHARED UI ─────────────────────────────────────────────────────────────────
const Card = ({children,style={},glow}) => (
  <div style={{background:T.s0,border:`1px solid ${glow?glow+"44":T.border}`,
    borderRadius:14,padding:"18px 20px",
    boxShadow:glow?`0 0 28px ${glow}0D`:"none",...style}}>{children}</div>
);

const Chip = ({children,color}) => (
  <span style={{background:color+"20",color,border:`1px solid ${color}44`,
    fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,
    letterSpacing:"0.5px",fontFamily:"'Martian Mono',monospace",
    whiteSpace:"nowrap"}}>{children}</span>
);

const Pct = ({value,color,height=5}) => (
  <div style={{width:"100%",height,background:T.s2,borderRadius:height}}>
    <div style={{width:`${Math.max(0,Math.min(100,value))}%`,height:"100%",
      background:color,borderRadius:height,transition:"width 1s ease"}}/>
  </div>
);

const Tip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:8,
      padding:"10px 14px",fontSize:12,fontFamily:"'Martian Mono',monospace"}}>
      <div style={{color:T.sub,marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color,marginBottom:2}}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const SectionHeader = ({title,sub,action}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
    <div>
      <div style={{fontSize:15,fontWeight:800,color:T.text,
        fontFamily:"'Syne',sans-serif",letterSpacing:"-0.3px"}}>{title}</div>
      {sub && <div style={{fontSize:11,color:T.sub,marginTop:2}}>{sub}</div>}
    </div>
    {action}
  </div>
);

const Btn = ({children,color=T.teal,onClick,variant="fill",size="md"}) => {
  const pad = size==="sm"?"4px 10px":"8px 16px";
  const fs = size==="sm"?11:12;
  return (
    <button onClick={onClick} style={{
      background:variant==="fill"?color+"22":"transparent",
      border:`1px solid ${color}${variant==="fill"?"55":"44"}`,
      color,padding:pad,borderRadius:7,fontSize:fs,fontWeight:700,
      cursor:"pointer",fontFamily:"'Martian Mono',monospace",
      transition:"all 0.15s",whiteSpace:"nowrap",
    }}
      onMouseEnter={e=>{e.currentTarget.style.background=color+"33"}}
      onMouseLeave={e=>{e.currentTarget.style.background=variant==="fill"?color+"22":"transparent"}}
    >{children}</button>
  );
};

const statusColor = {published:T.green,processing:T.amber,draft:T.sub,
  active:T.teal,closed:T.sub,scheduled:T.sky,completed:T.green};

// ── PANELS ────────────────────────────────────────────────────────────────────

export function TeacherHomePanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, batchesRes] = await Promise.all([
          api.get("/analytics/get-overview-stats"),
          api.get("/batch/get-batches")
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (batchesRes.data.success) setBatches(batchesRes.data.batches);
      } catch (e) { 
        console.error(e); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="panel-fade" style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Hero */}
      <Card glow={T.teal} style={{background:`linear-gradient(135deg,${T.s1},${T.s2})`,
        padding:"24px 26px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:200,height:200,
          borderRadius:"50%",background:T.teal+"08",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:11,color:T.sub,fontFamily:"'Martian Mono',monospace",
              marginBottom:8,letterSpacing:"0.8px"}}>GOOD AFTERNOON, TEACHER</div>
            <div style={{fontSize:30,fontWeight:800,color:T.text,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-1px",lineHeight:1.1}}>
              {user?.name} 👋
            </div>
            <div style={{fontSize:13,color:T.sub,marginTop:8}}>
              <span style={{color:T.rose,fontWeight:700}}>{stats?.liveNow || 0} class LIVE now</span> ·{" "}
              <span style={{color:T.amber,fontWeight:700}}>{stats?.pendingDoubts || 0} pending doubts</span> ·{" "}
              <span style={{color:T.teal,fontWeight:700}}>{stats?.dppsDueToday || 0} DPPs due today</span>
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            {[{v:`🔥${user?.streak || 0}`,l:"Day Streak",c:T.amber},{v:`#${stats?.rank || "--"}`,l:"Educator Rank",c:T.teal}].map((s,i)=>(
              <div key={i} style={{background:s.c+"22",border:`1px solid ${s.c}44`,
                borderRadius:10,padding:"12px 16px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:800,color:s.c,
                  fontFamily:"'Martian Mono',monospace"}}>{s.v}</div>
                <div style={{fontSize:10,color:T.sub,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:0,marginTop:20,
          borderTop:`1px solid ${T.border}`,paddingTop:16}}>
          {[
            {l:"My Students",v: stats?.totalStudents?.toLocaleString() || "0",c:T.teal},
            {l:"Avg Rating",  v:`★ ${stats?.avgRating || "0.0"}`, c:T.amber},
            {l:"Videos Live", v: stats?.totalVideos || "0",    c:T.sky},
            {l:"DPPs Created",v: stats?.totalDpps || "0",    c:T.violet},
            {l:"Earnings MTD",v: `₹${(stats?.earningsMTD / 10000000).toFixed(1)}Cr` || "₹0Cr",c:T.green},
          ].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center",
              borderRight:i<4?`1px solid ${T.border}`:"none"}}>
              <div style={{fontSize:16,fontWeight:800,color:s.c,
                fontFamily:"'Martian Mono',monospace"}}>{s.v}</div>
              <div style={{fontSize:11,color:T.sub,marginTop:3}}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grid */}
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:14}}>
        {/* Today schedule */}
        <Card>
          <SectionHeader title="Today's Schedule" sub={new Date().toLocaleDateString()}
            action={<Chip color={T.sky}>{stats?.todayClasses?.length || 0} Classes</Chip>}/>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {stats?.todayClasses?.length > 0 ? stats.todayClasses.map((cls,i)=>{
              const sc = {live:{c:T.rose,lbl:"● LIVE"},done:{c:T.sub,lbl:"✓ DONE"},upcoming:{c:T.teal,lbl:"◷ SOON"}};
              const m = sc[cls.status] || sc.upcoming;
              return (
                <div key={i} style={{display:"flex",gap:12,alignItems:"center",
                  padding:"11px 12px",borderRadius:10,
                  background:cls.status==="live"?T.roseD:T.s1,
                  border:`1px solid ${cls.status==="live"?T.rose+"44":T.border}`}}>
                  <div style={{minWidth:62,textAlign:"center"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text,
                      fontFamily:"'Martian Mono',monospace"}}>{cls.time}</div>
                    <div style={{fontSize:10,color:T.sub}}>{cls.duration}min</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:2}}>{cls.topic}</div>
                    <Chip color={T.sky}>{cls.batchName}</Chip>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <Chip color={m.c}>{m.lbl}</Chip>
                  </div>
                </div>
              );
            }) : (
              <div style={{padding:20, textAlign:'center', color:T.sub, fontSize:12}}>No classes scheduled for today</div>
            )}
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SectionHeader title="This Week's Engagement" sub="Watch % · Completion %"/>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={stats?.engagementData || []}>
                <defs>
                  <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.teal} stopOpacity={0.3}/>
                    <stop offset="100%" stopColor={T.teal} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                <XAxis dataKey="d" tick={{fill:T.sub,fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:T.sub,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip content={<Tip/>}/>
                <Area type="monotone" dataKey="watch" name="Watch%" stroke={T.teal}
                  strokeWidth={2} fill="url(#gT)"/>
                <Line type="monotone" dataKey="complete" name="Complete%" stroke={T.amber}
                  strokeWidth={1.5} dot={false} strokeDasharray="3 2"/>
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <SectionHeader title="Top Performers"/>
            {stats?.topPerformers?.length > 0 ? stats.topPerformers.slice(0,3).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?12:0}}>
                <span style={{fontSize:18}}>{i === 0 ? "🏆" : i === 1 ? "🥈" : "🥉"}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>{s.name}</div>
                  <Pct value={s.progress} color={T.teal} height={3}/>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:T.amber,
                  fontFamily:"'Martian Mono',monospace"}}>{s.score}%</div>
              </div>
            )) : (
              <div style={{padding:10, textAlign:'center', color:T.sub, fontSize:11}}>No data available</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export function GoLivePanel() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [batches, setBatches] = useState([]);
  const [selBatch, setSelBatch] = useState(null);
  const [topic, setTopic] = useState("");
  const [liveMin, setLiveMin] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const { data } = await api.get("/batch/get-batches");
        if (data.success) setBatches(data.batches);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  useEffect(()=>{
    if(step!==3) return;
    const t = setInterval(()=>setLiveMin(m=>m+1),60000);
    return ()=>clearInterval(t);
  },[step]);

  const startLive = async () => {
    try {
      const { data } = await api.post("/teacher/create-live-session", {
        batchId: selBatch._id,
        title: topic,
        description: `Live session for ${topic}`,
        subjectId: selBatch.subjects?.[0]?.courseId || "General",
        startTime: new Date()
      });
      if (data.success) {
        navigate(`/dashboard/teacher/live/${data.session._id}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to start live session: " + (error.response?.data?.message || error.message));
    }
  };

  const inputStyle = {
    background:T.s1,border:`1px solid ${T.border}`,borderRadius:8,
    color:T.text,padding:"10px 14px",fontSize:13,width:"100%",
    fontFamily:"'Martian Mono',monospace",outline:"none",
  };

  if(step===3 && selBatch) return (
    <div className="panel-fade" style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card glow={T.rose} style={{background:`linear-gradient(135deg,${T.s1},${T.roseD})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:14,height:14,borderRadius:"50%",background:T.rose,
              animation: "pulse 1.5s infinite"}}/>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:T.text,fontFamily:"'Syne',sans-serif"}}>
                LIVE – {topic || "Class in Progress"}
              </div>
              <div style={{fontSize:12,color:T.sub,marginTop:3}}>
                <span style={{color:T.sky,fontWeight:700}}>{selBatch.name}</span>
                {" · "}{selBatch.courseName || "Physics"}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:24,fontWeight:800,color:T.rose,
                fontFamily:"'Martian Mono',monospace"}}>
                {selBatch.totalStudents || 0}
              </div>
              <div style={{fontSize:11,color:T.sub}}>Enrolled students</div>
            </div>
            <Btn color={T.rose} onClick={()=>setStep(1)}>■ End Class</Btn>
          </div>
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Card>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14,
            fontFamily:"'Syne',sans-serif"}}>Live Chat</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:300,overflowY:"auto"}}>
             <div style={{padding:20, textAlign:'center', color:T.sub, fontSize:12}}>Chat will appear here once students join</div>
          </div>
        </Card>

        <Card>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14,
            fontFamily:"'Syne',sans-serif"}}>Live Doubts</div>
           <div style={{padding:20, textAlign:'center', color:T.sub, fontSize:12}}>No doubts asked yet</div>
        </Card>

        <Card>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14,
            fontFamily:"'Syne',sans-serif"}}>Live Poll</div>
          <Btn color={T.violet}>+ Launch Quick Poll</Btn>
          <div style={{marginTop:14,padding:20, textAlign:'center', color:T.sub, fontSize:12}}>Launch a poll to see results</div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="panel-fade" style={{maxWidth:760,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      {step === 1 && (
        <Card>
          <SectionHeader title="Select Batch for Live Class"/>
          {loading ? (
             <div style={{padding:40, textAlign:'center'}}><Loader2 className="animate-spin" style={{margin:'0 auto', color:T.teal}}/></div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {batches.map(b=>(
                <div key={b._id} onClick={()=>setSelBatch(b)}
                  style={{padding:"18px 20px",borderRadius:12,cursor:"pointer",
                    background:selBatch?._id===b._id?T.teal+"18":T.s1,
                    border:`2px solid ${selBatch?._id===b._id?T.teal:T.border}`,
                    transition:"all 0.15s"}}>
                    <div style={{fontSize:15,fontWeight:800,color:T.text,marginBottom:4}}>{b.name}</div>
                    <Chip color={T.teal}>{b.totalStudents || 0} students</Chip>
                </div>
              ))}
            </div>
          )}
          <div style={{marginTop:16,display:"flex",justifyContent:"flex-end"}}>
            <Btn color={T.teal} onClick={()=>selBatch&&setStep(2)}>Continue →</Btn>
          </div>
        </Card>
      )}

      {step === 2 && selBatch && (
        <Card>
          <SectionHeader title="Class Setup"/>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
             <input value={topic} onChange={e=>setTopic(e.target.value)}
                placeholder="Class Topic (e.g. Electromagnetic Induction)" style={inputStyle}/>
             <Btn color={T.rose} onClick={()=>topic&&startLive()}>🔴 Start Live Class</Btn>
             <Btn variant="outline" onClick={()=>setStep(1)}>Cancel</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

export function TeacherRecordedPanel() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const { data } = await api.get("/recording/all");
        if (data.success) setRecordings(data.recordings);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  return (
    <div className="panel-fade" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[{l:"Total Videos",v:recordings.length,c:T.teal},{l:"Total Views",v:"--",c:T.amber},{l:"Avg Completion",v:"--",c:T.green},{l:"Storage",v:"--",c:T.sky}].map((s,i)=>(
          <Card key={i} glow={s.c}>
            <div style={{fontSize:10,color:T.sub,letterSpacing:"0.8px",marginBottom:8}}>{s.l.toUpperCase()}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.c}}>{s.v}</div>
          </Card>
        ))}
      </div>
      <Card>
        <SectionHeader title="Recorded Lectures" action={<Btn color={T.teal}>↑ Upload Video</Btn>}/>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {loading ? (
             <div style={{padding:40, textAlign:'center'}}><Loader2 className="animate-spin" style={{margin:'0 auto', color:T.teal}}/></div>
          ) : recordings.length > 0 ? recordings.map(r=>(
            <div key={r._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:14,background:T.s1,borderRadius:10,border:`1px solid ${T.border}`}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>{r.channelName}</div>
                <div style={{display:"flex",gap:8}}>
                  <Chip color={T.sky}>{r.courseId}</Chip>
                  <span style={{fontSize:11,color:T.sub}}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Chip color={statusColor[r.status] || T.sub}>{r.status.toUpperCase()}</Chip>
            </div>
          )) : (
            <div style={{padding:20, textAlign:'center', color:T.sub, fontSize:12}}>No recordings found</div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function TeacherDashboard() {
  return <TeacherHomePanel />;
}
