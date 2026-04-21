import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#06090F", s0:"#0C1220", s1:"#111B2E", s2:"#172238",
  border:"#1E2F4A", borderH:"#2A4060",
  teal:"#00C9A7", tealD:"#00C9A715",
  amber:"#F59E0B", amberD:"#F59E0B15",
  violet:"#7C3AED", violetD:"#7C3AED18",
  rose:"#F43F5E", roseD:"#F43F5E18",
  sky:"#38BDF8", skyD:"#38BDF815",
  green:"#22C55E", greenD:"#22C55E15",
  orange:"#FB923C", orangeD:"#FB923C15",
  text:"#DCE8F5", sub:"#5B7A99", dim:"#1E2F4A",
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const BATCHES = [
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

const navItems = [
  {id:"home",       icon:"⊡", label:"Dashboard"    },
  {id:"schedule",   icon:"◫", label:"Schedule"      },
  {id:"live",       icon:"◉", label:"Go Live"       },
  {id:"recorded",   icon:"▶", label:"Rec. Lectures" },
  {id:"dpp",        icon:"◧", label:"DPP"           },
  {id:"notes",      icon:"◨", label:"Notes"         },
  {id:"tests",      icon:"◈", label:"Tests"         },
  {id:"doubts",     icon:"◎", label:"Doubts"        },
  {id:"students",   icon:"▣", label:"My Students"  },
  {id:"earnings",   icon:"◆", label:"Earnings"      },
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
    letterSpacing:"0.5px",fontFamily:"'JetBrains Mono',monospace",
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
      padding:"10px 14px",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>
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
      cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",
      transition:"all 0.15s",whiteSpace:"nowrap",
    }}
      onMouseEnter={e=>{e.currentTarget.style.background=color+"33"}}
      onMouseLeave={e=>{e.currentTarget.style.background=variant==="fill"?color+"22":"transparent"}}
    >{children}</button>
  );
};

const TableHeader = ({cols}) => (
  <div style={{display:"grid",gridTemplateColumns:cols,
    padding:"8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:2}}>
    {["Title","Batch","Chapter","Views","Duration","Date","Status","Action"].slice(0,cols.split(" ").length).map((h,i)=>(
      <div key={i} style={{fontSize:10,color:T.sub,fontWeight:700,
        fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.5px"}}>{h.toUpperCase()}</div>
    ))}
  </div>
);

const statusColor = {published:T.green,processing:T.amber,draft:T.sub,
  active:T.teal,closed:T.sub,scheduled:T.sky,completed:T.green};

// ── PANELS ────────────────────────────────────────────────────────────────────

/* ── HOME ── */
function HomePanel({setNav}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Hero */}
      <Card glow={T.teal} style={{background:`linear-gradient(135deg,${T.s1},${T.s2})`,
        padding:"24px 26px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-30,top:-30,width:200,height:200,
          borderRadius:"50%",background:T.teal+"08",pointerEvents:"none"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:12,color:T.sub,fontFamily:"'JetBrains Mono',monospace",
              marginBottom:8,letterSpacing:"0.8px"}}>GOOD AFTERNOON, TEACHER</div>
            <div style={{fontSize:30,fontWeight:800,color:T.text,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-1px",lineHeight:1.1}}>
              Prateek Sir 👋
            </div>
            <div style={{fontSize:13,color:T.sub,marginTop:8}}>
              <span style={{color:T.rose,fontWeight:700}}>1 class LIVE now</span> ·{" "}
              <span style={{color:T.amber,fontWeight:700}}>5 pending doubts</span> ·{" "}
              <span style={{color:T.teal,fontWeight:700}}>2 DPPs due today</span>
            </div>
            <div style={{display:"flex",gap:10,marginTop:14}}>
              <Btn color={T.rose} onClick={()=>setNav("live")}>● Go Live Now</Btn>
              <Btn color={T.teal} onClick={()=>setNav("dpp")} variant="outline">+ Create DPP</Btn>
              <Btn color={T.sky}  onClick={()=>setNav("recorded")} variant="outline">↑ Upload Lecture</Btn>
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            {[{v:`🔥42`,l:"Day Streak",c:T.amber},{v:`#2`,l:"Educator Rank",c:T.teal}].map((s,i)=>(
              <div key={i} style={{background:s.c+"22",border:`1px solid ${s.c}44`,
                borderRadius:10,padding:"12px 16px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:800,color:s.c,
                  fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</div>
                <div style={{fontSize:10,color:T.sub,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:0,marginTop:20,
          borderTop:`1px solid ${T.border}`,paddingTop:16}}>
          {[
            {l:"My Students",v:"48,200",c:T.teal},
            {l:"Avg Rating",  v:"★ 4.9", c:T.amber},
            {l:"Videos Live", v:"63",    c:T.sky},
            {l:"DPPs Created",v:"47",    c:T.violet},
            {l:"Earnings MTD",v:"₹4.6Cr",c:T.green},
          ].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center",
              borderRight:i<4?`1px solid ${T.border}`:"none"}}>
              <div style={{fontSize:16,fontWeight:800,color:s.c,
                fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</div>
              <div style={{fontSize:11,color:T.sub,marginTop:3}}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Grid */}
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:14}}>
        {/* Today schedule */}
        <Card>
          <SectionHeader title="Today's Schedule" sub="Apr 20, 2026"
            action={<Chip color={T.sky}>5 Classes</Chip>}/>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {scheduleToday.map((cls,i)=>{
              const sc = {live:{c:T.rose,lbl:"● LIVE"},done:{c:T.sub,lbl:"✓ DONE"},upcoming:{c:T.teal,lbl:"◷ SOON"}};
              const m = sc[cls.status];
              return (
                <div key={i} style={{display:"flex",gap:12,alignItems:"center",
                  padding:"11px 12px",borderRadius:10,
                  background:cls.status==="live"?T.roseD:T.s1,
                  border:`1px solid ${cls.status==="live"?T.rose+"44":T.border}`}}>
                  <div style={{minWidth:62,textAlign:"center"}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text,
                      fontFamily:"'JetBrains Mono',monospace"}}>{cls.time}</div>
                    <div style={{fontSize:10,color:T.sub}}>{cls.duration}min</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:2}}>{cls.topic}</div>
                    <Chip color={T.sky}>{cls.batch}</Chip>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <Chip color={m.c}>{m.lbl}</Chip>
                    {cls.status==="live" && (
                      <div style={{fontSize:11,color:T.rose,marginTop:4,
                        fontFamily:"'JetBrains Mono',monospace"}}>
                        {cls.viewers.toLocaleString()} 👁
                      </div>
                    )}
                    {cls.status==="upcoming" && (
                      <Btn size="sm" color={T.teal} onClick={()=>setNav("live")}>Go Live</Btn>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <SectionHeader title="This Week's Engagement" sub="Watch % · Completion %"/>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={weekEng}>
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
            {topStudents.slice(0,3).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?12:0}}>
                <span style={{fontSize:18}}>{s.badge}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>{s.name}</div>
                  <Pct value={s.progress} color={T.teal} height={3}/>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:T.amber,
                  fontFamily:"'JetBrains Mono',monospace"}}>{s.score}%</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── GO LIVE ── */
function GoLivePanel() {
  const [step, setStep] = useState(1); // 1=select batch, 2=setup, 3=live
  const [selBatch, setSelBatch] = useState(null);
  const [topic, setTopic] = useState("");
  const [desc, setDesc] = useState("");
  const [enableChat, setEnableChat] = useState(true);
  const [enableRecording, setEnableRecording] = useState(true);
  const [enableDPP, setEnableDPP] = useState(false);
  const [liveMin, setLiveMin] = useState(0);

  useEffect(()=>{
    if(step!==3) return;
    const t = setInterval(()=>setLiveMin(m=>m+1),60000);
    return ()=>clearInterval(t);
  },[step]);

  const inputStyle = {
    background:T.s1,border:`1px solid ${T.border}`,borderRadius:8,
    color:T.text,padding:"10px 14px",fontSize:13,width:"100%",
    fontFamily:"'JetBrains Mono',monospace",outline:"none",
  };
  const Toggle = ({on,onChange,label,sub}) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
      padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
      <div>
        <div style={{fontSize:13,color:T.text,fontWeight:600}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:T.sub,marginTop:2}}>{sub}</div>}
      </div>
      <div onClick={()=>onChange(!on)} style={{
        width:42,height:24,borderRadius:12,
        background:on?T.teal:T.s2,border:`1px solid ${on?T.teal:T.border}`,
        cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
        <div style={{position:"absolute",top:3,left:on?20:3,width:16,height:16,
          borderRadius:"50%",background:on?T.bg:T.sub,transition:"left 0.2s"}}/>
      </div>
    </div>
  );

  if(step===3 && selBatch) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card glow={T.rose} style={{background:`linear-gradient(135deg,${T.s1},${T.roseD})`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:14,height:14,borderRadius:"50%",background:T.rose,
              animation:"livePulse 1.2s ease-in-out infinite"}}/>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:T.text,fontFamily:"'Syne',sans-serif"}}>
                LIVE – {topic || "Class in Progress"}
              </div>
              <div style={{fontSize:12,color:T.sub,marginTop:3}}>
                <span style={{color:selBatch.color,fontWeight:700}}>{selBatch.name}</span>
                {" · "}{selBatch.subject}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:24,fontWeight:800,color:T.rose,
                fontFamily:"'JetBrains Mono',monospace"}}>
                {selBatch.students.toLocaleString()}
              </div>
              <div style={{fontSize:11,color:T.sub}}>Watching now</div>
            </div>
            <Btn color={T.rose} onClick={()=>setStep(1)}>■ End Class</Btn>
          </div>
        </div>
        <div style={{display:"flex",gap:0,marginTop:18,
          paddingTop:14,borderTop:`1px solid ${T.border}`}}>
          {[
            {l:"Duration",v:`${liveMin} min`,c:T.text},
            {l:"Chat Msgs",v:"1,284",c:T.teal},
            {l:"Reactions",v:"8,421",c:T.amber},
            {l:"Doubts Raised",v:"47",c:T.rose},
          ].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center",
              borderRight:i<3?`1px solid ${T.border}`:"none"}}>
              <div style={{fontSize:18,fontWeight:800,color:s.c,
                fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</div>
              <div style={{fontSize:10,color:T.sub,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
        <Card>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14,
            fontFamily:"'Syne',sans-serif"}}>Live Chat</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:240,overflowY:"auto"}}>
            {["Arjun: Sir, please explain the sign convention","Priya: Sir can you do one more example",
              "Rahul: 🔥🔥🔥","Meera: Sir what is the formula for Motional EMF?",
              "Karan: Please slow down a bit","Sneha: Sir amazing explanation!",
              "Vikram: Sir please do numericals"].map((m,i)=>(
              <div key={i} style={{fontSize:12,color:i%3===0?T.teal:T.sub,
                background:T.s1,padding:"7px 10px",borderRadius:7}}>{m}</div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginTop:10}}>
            <input placeholder="Reply to chat..." style={{...inputStyle,flex:1,padding:"7px 10px",fontSize:12}}/>
            <Btn size="sm" color={T.teal}>Send</Btn>
          </div>
        </Card>

        <Card>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14,
            fontFamily:"'Syne',sans-serif"}}>Live Doubts</div>
          {["In SHM how is velocity max at equilibrium?","Why is EMF negative in Faraday's law?",
            "What is back EMF in motors?"].map((q,i)=>(
            <div key={i} style={{background:i===0?T.roseD:T.s1,border:`1px solid ${i===0?T.rose+"33":T.border}`,
              borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{fontSize:12,color:T.text,marginBottom:6,lineHeight:1.5}}>{q}</div>
              <div style={{display:"flex",gap:6}}>
                <Btn size="sm" color={T.teal}>Answer</Btn>
                <Btn size="sm" color={T.sub} variant="outline">Skip</Btn>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:14,
            fontFamily:"'Syne',sans-serif"}}>Live Poll / Quiz</div>
          <Btn color={T.violet} onClick={()=>{}}>+ Launch Quick Poll</Btn>
          <div style={{marginTop:14,padding:"12px",background:T.s1,borderRadius:8,
            border:`1px solid ${T.border}`}}>
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:10}}>
              Q: What is the SI unit of EMF?
            </div>
            {[{opt:"Volt",pct:78},{opt:"Ampere",pct:12},{opt:"Ohm",pct:7},{opt:"Weber",pct:3}].map((o,i)=>(
              <div key={i} style={{marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:11,color:i===0?T.teal:T.sub}}>{o.opt}</span>
                  <span style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{o.pct}%</span>
                </div>
                <Pct value={o.pct} color={i===0?T.teal:T.s2} height={4}/>
              </div>
            ))}
            <div style={{fontSize:11,color:T.sub,marginTop:8}}>1,284 responses · 94% correct</div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{maxWidth:760,margin:"0 auto",display:"flex",flexDirection:"column",gap:14}}>
      {/* Steps */}
      <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:4}}>
        {["Select Batch","Class Setup","Go Live"].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:"50%",
                background:step>i+1?T.green:step===i+1?T.teal:T.s2,
                border:`1px solid ${step>=i+1?T.teal:T.border}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:700,color:step>=i+1?T.bg:T.sub}}>
                {step>i+1?"✓":i+1}
              </div>
              <span style={{fontSize:12,color:step===i+1?T.teal:T.sub,
                fontFamily:"'JetBrains Mono',monospace",fontWeight:step===i+1?700:400}}>{s}</span>
            </div>
            {i<2 && <div style={{width:40,height:1,background:T.border,margin:"0 10px"}}/>}
          </div>
        ))}
      </div>

      {step===1 && (
        <Card>
          <SectionHeader title="Select Batch for Live Class"
            sub="Choose which batch you are going live for"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {BATCHES.map(b=>(
              <div key={b.id} onClick={()=>setSelBatch(b)}
                style={{padding:"18px 20px",borderRadius:12,cursor:"pointer",
                  background:selBatch?.id===b.id?b.color+"18":T.s1,
                  border:`2px solid ${selBatch?.id===b.id?b.color:T.border}`,
                  transition:"all 0.15s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:800,color:T.text,
                      fontFamily:"'Syne',sans-serif",marginBottom:4}}>{b.name}</div>
                    <div style={{fontSize:12,color:T.sub}}>{b.subject}</div>
                  </div>
                  <Chip color={b.color}>{b.students.toLocaleString()} students</Chip>
                </div>
                <div style={{marginTop:14,height:2,
                  background:`linear-gradient(90deg,${b.color},${b.color}00)`,borderRadius:1}}/>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,display:"flex",justifyContent:"flex-end"}}>
            <Btn color={T.teal} onClick={()=>selBatch&&setStep(2)}>
              Continue →
            </Btn>
          </div>
        </Card>
      )}

      {step===2 && selBatch && (
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,
            padding:"12px 14px",background:selBatch.color+"18",borderRadius:10,
            border:`1px solid ${selBatch.color}44`}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:selBatch.color}}/>
            <span style={{fontSize:13,fontWeight:700,color:selBatch.color}}>{selBatch.name}</span>
            <span style={{fontSize:12,color:T.sub}}>· {selBatch.students.toLocaleString()} students enrolled</span>
            <Btn size="sm" color={T.sub} onClick={()=>setStep(1)}>Change</Btn>
          </div>

          <SectionHeader title="Class Setup"/>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            <div>
              <label style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:"0.5px",display:"block",marginBottom:6}}>CLASS TOPIC *</label>
              <input value={topic} onChange={e=>setTopic(e.target.value)}
                placeholder="e.g. Alternating Current – Impedance & Phasors"
                style={inputStyle}/>
            </div>
            <div>
              <label style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace",
                letterSpacing:"0.5px",display:"block",marginBottom:6}}>DESCRIPTION (optional)</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)}
                placeholder="What will students learn in this class?"
                rows={3} style={{...inputStyle,resize:"none"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace",
                  letterSpacing:"0.5px",display:"block",marginBottom:6}}>CHAPTER</label>
                <select style={{...inputStyle}}>
                  {["Electromagnetic Induction","AC Circuits","Magnetism","Electrostatics","Optics"].map(c=>(
                    <option key={c} style={{background:T.s1}}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace",
                  letterSpacing:"0.5px",display:"block",marginBottom:6}}>ESTIMATED DURATION</label>
                <select style={{...inputStyle}}>
                  {["60 minutes","75 minutes","90 minutes","120 minutes"].map(d=>(
                    <option key={d} style={{background:T.s1}}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:12,
            fontFamily:"'Syne',sans-serif"}}>Class Settings</div>
          <Toggle on={enableChat}      onChange={setEnableChat}
            label="Live Chat" sub="Students can send messages during class"/>
          <Toggle on={enableRecording} onChange={setEnableRecording}
            label="Auto Record" sub="Save as recorded lecture after class ends"/>
          <Toggle on={enableDPP}       onChange={setEnableDPP}
            label="Attach DPP" sub="Link a DPP sheet to be released after class"/>

          {enableDPP && (
            <div style={{padding:"12px 14px",background:T.violetD,borderRadius:8,
              border:`1px solid ${T.violet}44`,marginTop:8}}>
              <div style={{fontSize:12,color:T.violet,marginBottom:8,fontWeight:600}}>
                Select DPP to attach
              </div>
              <select style={{...inputStyle,borderColor:T.violet+"44"}}>
                {dppList.filter(d=>d.status==="draft"||d.status==="active").map(d=>(
                  <option key={d.id} style={{background:T.s1}}>{d.title}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn color={T.sub} onClick={()=>setStep(1)} variant="outline">← Back</Btn>
            <Btn color={T.rose} onClick={()=>topic&&setStep(3)}>
              🔴 Start Live Class
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── RECORDED LECTURES ── */
function RecordedPanel() {
  const [filter, setFilter] = useState("All");
  const batches = ["All",...BATCHES.map(b=>b.name.split("–")[0].trim())];
  const filtered = filter==="All" ? recordedLectures
    : recordedLectures.filter(r=>r.batch.includes(filter.replace(" ","").slice(0,6)));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {l:"Total Videos",  v:"63",      c:T.teal},
          {l:"Total Views",   v:"14.2L",   c:T.amber},
          {l:"Avg Completion",v:"76.4%",   c:T.green},
          {l:"Storage Used",  v:"248 GB",  c:T.sky},
        ].map((s,i)=>(
          <Card key={i} glow={s.c}>
            <div style={{fontSize:10,color:T.sub,letterSpacing:"0.8px",marginBottom:8,
              fontFamily:"'JetBrains Mono',monospace"}}>{s.l.toUpperCase()}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.c,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-1px"}}>{s.v}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <SectionHeader title="Recorded Lectures" sub="Manage and track your video content"/>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{display:"flex",gap:6}}>
              {batches.map(b=>(
                <button key={b} onClick={()=>setFilter(b)}
                  style={{background:filter===b?T.teal+"22":"transparent",
                    border:`1px solid ${filter===b?T.teal:T.border}`,
                    color:filter===b?T.teal:T.sub,padding:"4px 10px",borderRadius:5,
                    fontSize:11,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",
                    whiteSpace:"nowrap"}}>{b}</button>
              ))}
            </div>
            <Btn color={T.teal}>↑ Upload Video</Btn>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"3fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
          padding:"8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:4}}>
          {["Title & Batch","Chapter","Views","Duration","Completion","Date","Status"].map(h=>(
            <div key={h} style={{fontSize:10,color:T.sub,fontWeight:700,
              fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.4px"}}>{h.toUpperCase()}</div>
          ))}
        </div>
        {filtered.map((r,i)=>(
          <div key={r.id} style={{display:"grid",gridTemplateColumns:"3fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
            padding:"14px 12px",borderRadius:8,alignItems:"center",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.s1}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:3}}>{r.title}</div>
              <Chip color={T.sky}>{r.batch}</Chip>
            </div>
            <Chip color={T.violet}>{r.chapter}</Chip>
            <div style={{fontSize:13,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{r.views}</div>
            <div style={{fontSize:12,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{r.duration}</div>
            <div>
              {r.completion>0?(
                <>
                  <div style={{fontSize:11,color:T.teal,marginBottom:3,
                    fontFamily:"'JetBrains Mono',monospace"}}>{r.completion}%</div>
                  <Pct value={r.completion} color={T.teal} height={4}/>
                </>
              ):<span style={{color:T.sub,fontSize:11}}>—</span>}
            </div>
            <div style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{r.date}</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <Chip color={statusColor[r.status]||T.sub}>{r.status.toUpperCase()}</Chip>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── DPP ── */
function DPPPanel() {
  const [showCreate, setShowCreate] = useState(false);
  const [dppTitle, setDppTitle]     = useState("");
  const [dppBatch, setDppBatch]     = useState(BATCHES[0].id);
  const [dppQ,     setDppQ]         = useState("20");
  const inputStyle = {background:T.s1,border:`1px solid ${T.border}`,borderRadius:8,
    color:T.text,padding:"9px 12px",fontSize:12,fontFamily:"'JetBrains Mono',monospace",outline:"none"};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {l:"DPPs Created", v:"47",    c:T.teal},
          {l:"Avg Submission",v:"82%",  c:T.amber},
          {l:"Avg Score",    v:"71.4%", c:T.green},
          {l:"Active DPPs",  v:"2",     c:T.rose},
        ].map((s,i)=>(
          <Card key={i} glow={s.c}>
            <div style={{fontSize:10,color:T.sub,letterSpacing:"0.8px",marginBottom:8,
              fontFamily:"'JetBrains Mono',monospace"}}>{s.l.toUpperCase()}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.c,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-1px"}}>{s.v}</div>
          </Card>
        ))}
      </div>

      {showCreate && (
        <Card glow={T.violet} style={{border:`1px solid ${T.violet}44`}}>
          <SectionHeader title="Create New DPP"
            action={<Btn size="sm" color={T.sub} onClick={()=>setShowCreate(false)}>✕ Cancel</Btn>}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{fontSize:10,color:T.sub,letterSpacing:"0.5px",display:"block",
                marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>DPP TITLE *</label>
              <input value={dppTitle} onChange={e=>setDppTitle(e.target.value)}
                placeholder="e.g. DPP #15 – AC Circuits" style={{...inputStyle,width:"100%"}}/>
            </div>
            <div>
              <label style={{fontSize:10,color:T.sub,letterSpacing:"0.5px",display:"block",
                marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>BATCH *</label>
              <select value={dppBatch} onChange={e=>setDppBatch(e.target.value)}
                style={{...inputStyle,width:"100%"}}>
                {BATCHES.map(b=>(
                  <option key={b.id} value={b.id} style={{background:T.s1}}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{fontSize:10,color:T.sub,letterSpacing:"0.5px",display:"block",
                marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>CHAPTER</label>
              <select style={{...inputStyle,width:"100%"}}>
                {["EMI","AC Circuits","Magnetism","Electrostatics","Optics","Modern Physics"].map(c=>(
                  <option key={c} style={{background:T.s1}}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{fontSize:10,color:T.sub,letterSpacing:"0.5px",display:"block",
                marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>NO. OF QUESTIONS</label>
              <input value={dppQ} onChange={e=>setDppQ(e.target.value)}
                type="number" min="5" max="60" style={{...inputStyle,width:"100%"}}/>
            </div>
            <div>
              <label style={{fontSize:10,color:T.sub,letterSpacing:"0.5px",display:"block",
                marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>DUE DATE</label>
              <input type="date" defaultValue="2026-04-24"
                style={{...inputStyle,width:"100%"}}/>
            </div>
            <div>
              <label style={{fontSize:10,color:T.sub,letterSpacing:"0.5px",display:"block",
                marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>MARKS PER Q</label>
              <select style={{...inputStyle,width:"100%"}}>
                {["4 Marks","3 Marks","2 Marks","1 Mark"].map(m=>(
                  <option key={m} style={{background:T.s1}}>{m}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{padding:"12px 14px",background:T.amberD,borderRadius:8,
            border:`1px solid ${T.amber}33`,marginBottom:12}}>
            <div style={{fontSize:12,color:T.amber,fontWeight:600,marginBottom:4}}>Question Upload</div>
            <div style={{fontSize:12,color:T.sub}}>
              Upload PDF or add questions manually after creating the DPP shell.
            </div>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn color={T.sub} variant="outline" onClick={()=>setShowCreate(false)}>Save as Draft</Btn>
            <Btn color={T.violet}>Create & Publish DPP</Btn>
          </div>
        </Card>
      )}

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <SectionHeader title="All DPPs" sub="Track submissions and performance"/>
          <Btn color={T.violet} onClick={()=>setShowCreate(true)}>+ Create DPP</Btn>
        </div>
        <div style={{display:"grid",
          gridTemplateColumns:"2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
          padding:"8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:4}}>
          {["Title","Batch","Questions","Submitted","Avg Score","Due","Status"].map(h=>(
            <div key={h} style={{fontSize:10,color:T.sub,fontWeight:700,
              fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.4px"}}>{h.toUpperCase()}</div>
          ))}
        </div>
        {dppList.map((d,i)=>{
          const subPct = d.total>0?Math.round((d.submitted/d.total)*100):0;
          return (
            <div key={d.id} style={{display:"grid",
              gridTemplateColumns:"2.5fr 1.5fr 1fr 1fr 1fr 1fr 1fr",
              padding:"13px 12px",borderRadius:8,alignItems:"center",transition:"background 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.s1}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:3}}>{d.title}</div>
                <Chip color={T.violet}>{d.chapter}</Chip>
              </div>
              <Chip color={T.sky}>{d.batch}</Chip>
              <div style={{fontSize:13,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{d.questions}</div>
              <div>
                {d.status!=="draft"?(
                  <>
                    <div style={{fontSize:11,color:T.amber,marginBottom:3,
                      fontFamily:"'JetBrains Mono',monospace"}}>{subPct}%</div>
                    <Pct value={subPct} color={T.amber} height={4}/>
                  </>
                ):<span style={{color:T.sub,fontSize:11}}>—</span>}
              </div>
              <div style={{fontSize:13,fontWeight:700,
                color:d.avgScore>70?T.green:d.avgScore>0?T.amber:T.sub,
                fontFamily:"'JetBrains Mono',monospace"}}>
                {d.avgScore>0?`${d.avgScore}%`:"—"}
              </div>
              <div style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{d.dueDate}</div>
              <Chip color={statusColor[d.status]||T.sub}>{d.status.toUpperCase()}</Chip>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ── NOTES ── */
function NotesPanel() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <SectionHeader title="Study Material & Notes" sub="PDFs, images, formula sheets"/>
          <Btn color={T.sky}>↑ Upload Material</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {notesList.map((n,i)=>(
            <div key={i} style={{display:"flex",gap:12,padding:"14px",background:T.s1,
              borderRadius:10,border:`1px solid ${T.border}`,transition:"border-color 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.sky+"66"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
              <div style={{width:44,height:44,borderRadius:8,
                background:n.type==="PDF"?T.roseD:T.skyD,
                border:`1px solid ${n.type==="PDF"?T.rose+"33":T.sky+"33"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:20,flexShrink:0}}>
                {n.type==="PDF"?"📄":"🖼"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:4,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <Chip color={T.sky}>{n.batch}</Chip>
                  <span style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>
                    {n.pages}pg · {n.size}
                  </span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                  <span style={{fontSize:11,color:T.teal,fontFamily:"'JetBrains Mono',monospace"}}>
                    ↓ {n.downloads}
                  </span>
                  <span style={{fontSize:11,color:T.sub}}>{n.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── TESTS ── */
function TestsPanel() {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {l:"Tests Created",v:"18",    c:T.sky},
          {l:"Scheduled",    v:"2",     c:T.amber},
          {l:"Avg Score",    v:"74.2%", c:T.green},
          {l:"Top Score",    v:"100%",  c:T.teal},
        ].map((s,i)=>(
          <Card key={i} glow={s.c}>
            <div style={{fontSize:10,color:T.sub,letterSpacing:"0.8px",marginBottom:8,
              fontFamily:"'JetBrains Mono',monospace"}}>{s.l.toUpperCase()}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.c,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-1px"}}>{s.v}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <SectionHeader title="Chapter Tests & Mocks"/>
          <Btn color={T.sky}>+ Create Test</Btn>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2.5fr 1.5fr 1fr 1fr 1fr 1fr",
          padding:"8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:4}}>
          {["Test Title","Batch","Questions","Duration","Scheduled","Status"].map(h=>(
            <div key={h} style={{fontSize:10,color:T.sub,fontWeight:700,
              fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.4px"}}>{h.toUpperCase()}</div>
          ))}
        </div>
        {testList.map((t,i)=>(
          <div key={t.id} style={{display:"grid",gridTemplateColumns:"2.5fr 1.5fr 1fr 1fr 1fr 1fr",
            padding:"14px 12px",borderRadius:8,alignItems:"center",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.s1}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:3}}>{t.title}</div>
              {t.status==="completed" && (
                <span style={{fontSize:11,color:T.green,fontFamily:"'JetBrains Mono',monospace"}}>
                  Avg: {t.avgScore}%
                </span>
              )}
            </div>
            <Chip color={T.sky}>{t.batch}</Chip>
            <div style={{fontSize:13,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>{t.questions} Q</div>
            <div style={{fontSize:12,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{t.duration} min</div>
            <div style={{fontSize:11,color:T.sub}}>{t.scheduled}</div>
            <Chip color={statusColor[t.status]||T.sub}>{t.status.toUpperCase()}</Chip>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── DOUBTS ── */
function DoubtsPanel() {
  const [filter,setFilter]=useState("All");
  const filtered=filter==="All"?myDoubts:myDoubts.filter(d=>d.priority===filter.toLowerCase()||d.subject===filter);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {l:"My Queue",      v:"5",      c:T.rose},
          {l:"AI Resolved",  v:"68%",    c:T.teal},
          {l:"Avg Response", v:"4.2 min",c:T.amber},
          {l:">10 min old",  v:"2",      c:T.orange},
        ].map((s,i)=>(
          <Card key={i} glow={s.c}>
            <div style={{fontSize:10,color:T.sub,letterSpacing:"0.8px",marginBottom:8,
              fontFamily:"'JetBrains Mono',monospace"}}>{s.l.toUpperCase()}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.c,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-1px"}}>{s.v}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <SectionHeader title="Pending Doubts" sub="Prioritized for your review"/>
          <div style={{display:"flex",gap:6}}>
            {["All","High","EMI","AC Circuits","EM Waves"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{background:filter===f?T.teal+"22":"transparent",
                  border:`1px solid ${filter===f?T.teal:T.border}`,
                  color:filter===f?T.teal:T.sub,padding:"4px 10px",borderRadius:5,
                  fontSize:11,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{f}</button>
            ))}
          </div>
        </div>
        {filtered.map((d,i)=>(
          <div key={i} style={{display:"flex",gap:14,padding:"16px 14px",borderRadius:10,
            marginBottom:8,background:d.priority==="high"?T.roseD:T.s1,
            border:`1px solid ${d.priority==="high"?T.rose+"44":T.border}`}}>
            <div style={{width:40,height:40,borderRadius:10,background:T.s2,
              border:`1px solid ${T.border}`,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:18,flexShrink:0}}>⚡</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700,color:T.text}}>{d.student}</span>
                  <Chip color={T.teal}>{d.subject}</Chip>
                  {d.priority==="high"&&<Chip color={T.rose}>URGENT</Chip>}
                </div>
                <span style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{d.time} ago</span>
              </div>
              <div style={{fontSize:13,color:T.sub,lineHeight:1.6,marginBottom:10}}>{d.q}</div>
              <div style={{display:"flex",gap:8}}>
                <Btn size="sm" color={T.teal}>Answer ↗</Btn>
                <Btn size="sm" color={T.sub} variant="outline">Assign</Btn>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── STUDENTS ── */
function StudentsPanel(){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {l:"Total Enrolled",   v:"48,200",c:T.teal,sub:"3 batches"},
          {l:"Avg Score",        v:"74.8%", c:T.amber,sub:"+3.2% this month"},
          {l:"At-Risk",          v:"1,284", c:T.rose, sub:"< 50% progress"},
          {l:"Completion Rate",  v:"68.4%", c:T.green,sub:"JEE 2025 avg"},
        ].map((s,i)=>(
          <Card key={i} glow={s.c}>
            <div style={{fontSize:10,color:T.sub,letterSpacing:"0.8px",marginBottom:8,
              fontFamily:"'JetBrains Mono',monospace"}}>{s.l.toUpperCase()}</div>
            <div style={{fontSize:26,fontWeight:800,color:s.c,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-1px"}}>{s.v}</div>
            <div style={{fontSize:11,color:T.sub,marginTop:4}}>{s.sub}</div>
          </Card>
        ))}
      </div>
      <Card>
        <SectionHeader title="Student Leaderboard"/>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",
          padding:"8px 12px",borderBottom:`1px solid ${T.border}`,marginBottom:4}}>
          {["Student","Score","Progress","Doubts","Streak"].map(h=>(
            <div key={h} style={{fontSize:10,color:T.sub,fontWeight:700,
              fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.4px"}}>{h.toUpperCase()}</div>
          ))}
        </div>
        {topStudents.map((s,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",
            padding:"12px 12px",borderRadius:8,alignItems:"center",transition:"background 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.s1}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>{s.badge}</span>
              <span style={{fontSize:13,fontWeight:600,color:T.text}}>{s.name}</span>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:T.amber,
              fontFamily:"'JetBrains Mono',monospace"}}>{s.score}</div>
            <div>
              <div style={{fontSize:11,color:T.teal,marginBottom:3,
                fontFamily:"'JetBrains Mono',monospace"}}>{s.progress}%</div>
              <Pct value={s.progress} color={T.teal}/>
            </div>
            <div style={{fontSize:12,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{s.doubts}</div>
            <Chip color={T.amber}>🔥{s.streak}d</Chip>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── EARNINGS ── */
function EarningsPanel(){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {l:"MTD Earnings",   v:"₹4.6 Cr", c:T.green,sub:"+10% vs last month"},
          {l:"Total Lifetime", v:"₹38.4 Cr",c:T.teal, sub:"since Jan 2022"},
          {l:"Pending Payout", v:"₹1.2 Cr", c:T.amber,sub:"releases May 1"},
        ].map((s,i)=>(
          <Card key={i} glow={s.c}>
            <div style={{fontSize:10,color:T.sub,letterSpacing:"0.8px",marginBottom:8,
              fontFamily:"'JetBrains Mono',monospace"}}>{s.l.toUpperCase()}</div>
            <div style={{fontSize:28,fontWeight:800,color:s.c,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-1px"}}>{s.v}</div>
            <div style={{fontSize:11,color:T.sub,marginTop:4}}>{s.sub}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14}}>
        <Card>
          <SectionHeader title="Monthly Earnings Trend"/>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={T.green} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={T.green} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
              <XAxis dataKey="m" tick={{fill:T.sub,fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.sub,fontSize:11}} axisLine={false} tickLine={false}
                tickFormatter={v=>`₹${v}Cr`}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="earn" name="₹ Cr" stroke={T.green}
                strokeWidth={2.5} fill="url(#gG)"/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <SectionHeader title="Teaching Rating" sub="Student feedback"/>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={T.border}/>
              <PolarAngleAxis dataKey="subject" tick={{fill:T.sub,fontSize:10}}/>
              <Radar name="Score" dataKey="A" stroke={T.teal}
                fill={T.teal} fillOpacity={0.2} strokeWidth={2}/>
              <Tooltip content={<Tip/>}/>
            </RadarChart>
          </ResponsiveContainer>
          <div style={{textAlign:"center",marginTop:4}}>
            <div style={{fontSize:32,fontWeight:800,color:T.amber,
              fontFamily:"'Syne',sans-serif"}}>★ 4.9</div>
            <div style={{fontSize:11,color:T.sub}}>8,420 reviews</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const [nav, setNav] = useState("home");
  const [time, setTime] = useState(new Date());
  const [collapsed, setCollapsed] = useState(false);

  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);

  const panels = {
    home:     <HomePanel setNav={setNav}/>,
    schedule: <HomePanel setNav={setNav}/>,
    live:     <GoLivePanel/>,
    recorded: <RecordedPanel/>,
    dpp:      <DPPPanel/>,
    notes:    <NotesPanel/>,
    tests:    <TestsPanel/>,
    doubts:   <DoubtsPanel/>,
    students: <StudentsPanel/>,
    earnings: <EarningsPanel/>,
  };

  return (
    <div style={{display:"flex",height:"100vh",background:T.bg,overflow:"hidden",
      fontFamily:"'Syne',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${T.dim};border-radius:2px;}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.8)}}
        .panel{animation:fadeSlide 0.25s ease both;}
        .nav-r{transition:all 0.15s;cursor:pointer;border-radius:9px;}
        .nav-r:hover{background:${T.s2}!important;}
      `}</style>

      {/* Sidebar */}
      <div style={{width:collapsed?58:228,background:T.s0,borderRight:`1px solid ${T.border}`,
        display:"flex",flexDirection:"column",flexShrink:0,
        transition:"width 0.2s ease",overflow:"hidden"}}>
        {/* Logo */}
        <div style={{padding:"16px 14px",borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",gap:10,whiteSpace:"nowrap"}}>
          <div style={{width:34,height:34,borderRadius:9,flexShrink:0,
            background:`linear-gradient(135deg,${T.teal},${T.sky})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:16,fontWeight:800,color:"#06090F"}}>P</div>
          {!collapsed&&(
            <div>
              <div style={{fontSize:14,fontWeight:800,color:T.text,
                letterSpacing:"-0.3px",fontFamily:"'Syne',sans-serif"}}>PW Teacher</div>
              <div style={{fontSize:10,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>Physics · JEE</div>
            </div>
          )}
        </div>
        {/* Avatar card */}
        {!collapsed&&(
          <div style={{margin:"12px 10px",padding:"12px",background:T.s1,
            borderRadius:10,border:`1px solid ${T.border}`}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                background:`linear-gradient(135deg,${T.teal},${T.amber})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,fontWeight:800,color:"#06090F"}}>PJ</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:T.text}}>Prateek Sir</div>
                <div style={{display:"flex",gap:6,marginTop:3}}>
                  <Chip color={T.amber}>★ 4.9</Chip>
                  <Chip color={T.rose}>● LIVE</Chip>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Nav */}
        <nav style={{flex:1,padding:"4px 8px",overflowY:"auto"}}>
          {navItems.map(item=>{
            const active=nav===item.id;
            const isLive=item.id==="live";
            return (
              <div key={item.id} className="nav-r"
                onClick={()=>setNav(item.id)}
                style={{display:"flex",alignItems:"center",gap:10,
                  padding:collapsed?"10px 12px":"8px 12px",marginBottom:2,
                  justifyContent:collapsed?"center":"flex-start",
                  background:active?T.tealD:isLive?T.roseD:"transparent",
                  color:active?T.teal:isLive?T.rose:T.sub,
                  border:active?`1px solid ${T.teal}33`:isLive?`1px solid ${T.rose}33`:"1px solid transparent",
                  whiteSpace:"nowrap"}}>
                <span style={{fontSize:15,flexShrink:0}}>{item.icon}</span>
                {!collapsed&&(
                  <span style={{fontSize:12,fontWeight:active||isLive?700:500,
                    fontFamily:"'JetBrains Mono',monospace"}}>{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>
        <div style={{padding:"10px 8px",borderTop:`1px solid ${T.border}`}}>
          <div className="nav-r"
            onClick={()=>setCollapsed(!collapsed)}
            style={{display:"flex",alignItems:"center",justifyContent:collapsed?"center":"flex-start",
              gap:10,padding:"8px 12px",color:T.sub,whiteSpace:"nowrap"}}>
            <span style={{fontSize:13}}>{collapsed?"▷":"◁"}</span>
            {!collapsed&&<span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>Collapse</span>}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Header */}
        <div style={{height:56,background:T.s0,borderBottom:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"0 24px",flexShrink:0}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:T.text,
              fontFamily:"'Syne',sans-serif",letterSpacing:"-0.3px"}}>
              {navItems.find(n=>n.id===nav)?.label}
            </div>
            <div style={{fontSize:11,color:T.sub,fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>
              {time.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
              {" · "}{time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Btn color={T.rose} onClick={()=>setNav("live")}>● Go Live</Btn>
            <Btn color={T.violet} onClick={()=>setNav("dpp")}>+ DPP</Btn>
            <Btn color={T.sky} onClick={()=>setNav("recorded")}>↑ Upload</Btn>
            <div style={{position:"relative",cursor:"pointer"}}>
              <div style={{width:34,height:34,borderRadius:8,background:T.s1,
                border:`1px solid ${T.border}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:14}}>🔔</div>
              <div style={{position:"absolute",top:7,right:7,width:7,height:7,
                borderRadius:"50%",background:T.rose,border:`2px solid ${T.s0}`}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,background:T.s1,
              border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px 5px 7px",cursor:"pointer"}}>
              <div style={{width:24,height:24,borderRadius:"50%",
                background:`linear-gradient(135deg,${T.teal},${T.amber})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:10,fontWeight:800,color:"#06090F"}}>PJ</div>
              <span style={{fontSize:12,color:T.text,fontFamily:"'JetBrains Mono',monospace"}}>Prateek Sir</span>
              <span style={{fontSize:10,color:T.sub}}>▾</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}} className="panel" key={nav}>
          {panels[nav]}
        </div>

        {/* Footer */}
        <div style={{height:26,background:T.s0,borderTop:`1px solid ${T.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"0 20px",flexShrink:0}}>
          <div style={{display:"flex",gap:16}}>
            {[{l:"Stream",ok:true},{l:"CDN",ok:true},{l:"Recording",ok:true},{l:"Doubt Engine",ok:true}].map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:s.ok?T.green:T.rose}}/>
                <span style={{fontSize:10,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>{s.l}</span>
              </div>
            ))}
          </div>
          <span style={{fontSize:10,color:T.sub,fontFamily:"'JetBrains Mono',monospace"}}>
            PW Teacher Console v4.2 · ap-south-1
          </span>
        </div>
      </div>
    </div>
  );
}

