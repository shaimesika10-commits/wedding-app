import { useState } from "react";

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const mockRsvps = [
  { id:1, name:"Dana Cohen",       attending:true,  adults:2, kids:1, allergy:"Gluten-free", note:"So excited for you both! 💕", time:"2h ago" },
  { id:2, name:"Michael Levy",     attending:true,  adults:1, kids:0, allergy:"",            note:"",                           time:"3h ago" },
  { id:3, name:"Sarah & Tom Bar",  attending:true,  adults:2, kids:2, allergy:"Nut allergy", note:"The kids are so excited!",   time:"5h ago" },
  { id:4, name:"Rachel Green",     attending:false, adults:1, kids:0, allergy:"",            note:"So sorry, prior commitment", time:"6h ago" },
  { id:5, name:"The Katz Family",  attending:true,  adults:2, kids:3, allergy:"Vegan",       note:"",                           time:"8h ago" },
  { id:6, name:"Yossi Mizrahi",    attending:true,  adults:1, kids:0, allergy:"",            note:"Congratulations! 🥂",        time:"1d ago" },
];

/* ═══════════════════════════════════════════════
   COLOR THEMES
═══════════════════════════════════════════════ */
const colorThemes = [
  { id:"blush",    name:"Blush Rose",     primary:"#c9707a", light:"#fdeef2", card:"#fffbfc", text:"#3d2028", gold:"#d4848c" },
  { id:"ivory",    name:"Ivory Gold",     primary:"#b8903a", light:"#fdf8f0", card:"#fffdf8", text:"#2e1e0e", gold:"#c8a045" },
  { id:"sage",     name:"Sage Garden",    primary:"#6a8848", light:"#f0f4ea", card:"#f5f9f2", text:"#182010", gold:"#88aa60" },
  { id:"midnight", name:"Midnight Rose",  primary:"#d4849a", light:"#1e1218", card:"#1e1218", text:"#f5e8ec", gold:"#d4849a" },
  { id:"lavender", name:"Lavender Mist",  primary:"#8878b8", light:"#f5f0ff", card:"#fdfbff", text:"#28183d", gold:"#a090c8" },
];

const fontThemes = [
  { id:"cormorant", name:"Cormorant",  display:"'Cormorant Garamond', serif",  body:"'Lato', sans-serif" },
  { id:"playfair",  name:"Playfair",   display:"'Playfair Display', serif",     body:"'Lato', sans-serif" },
  { id:"cinzel",    name:"Cinzel",     display:"'Cinzel', serif",               body:"'Lato', sans-serif" },
  { id:"dancing",   name:"Dancing",    display:"'Dancing Script', cursive",     body:"'Lato', sans-serif" },
  { id:"libre",     name:"Frank Ruhl", display:"'Frank Ruhl Libre', serif",     body:"'Lato', sans-serif" },
];

/* ═══════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@400;600&family=Frank+Ruhl+Libre:wght@300;400;700&family=Lato:wght@300;400;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

    .fade-in { animation: fadeIn 0.6s cubic-bezier(.16,1,.3,1) both; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }

    .sg>* { animation:fadeIn .5s cubic-bezier(.16,1,.3,1) both; }
    .sg>*:nth-child(1){animation-delay:.04s} .sg>*:nth-child(2){animation-delay:.1s}
    .sg>*:nth-child(3){animation-delay:.16s} .sg>*:nth-child(4){animation-delay:.22s}
    .sg>*:nth-child(5){animation-delay:.28s} .sg>*:nth-child(6){animation-delay:.34s}
    .sg>*:nth-child(7){animation-delay:.4s}  .sg>*:nth-child(8){animation-delay:.46s}

    .rose-btn {
      background: linear-gradient(135deg,#c9707a,#d4848c);
      color:#fff; border:none; cursor:pointer;
      font-family:'Cinzel',serif; font-weight:600;
      letter-spacing:1.5px; text-transform:uppercase;
      transition:all .22s; border-radius:50px;
      display:inline-flex; align-items:center; justify-content:center; gap:8px;
      box-shadow:0 6px 20px rgba(200,112,122,.35);
    }
    .rose-btn:hover:not(:disabled){filter:brightness(1.07);transform:translateY(-1px);box-shadow:0 10px 30px rgba(200,112,122,.45);}
    .rose-btn:disabled{opacity:.4;cursor:not-allowed;box-shadow:none;}

    .ghost-btn {
      background:transparent; cursor:pointer; border-radius:50px;
      font-family:'Cinzel',serif; font-weight:400;
      letter-spacing:1.5px; text-transform:uppercase; transition:all .2s;
    }
    .ghost-btn:hover{background:rgba(200,112,122,.07);}

    .step-input {
      width:100%; padding:13px 16px; border-radius:10px; outline:none;
      font-family:'Lato',sans-serif; font-size:15px;
      border:1.5px solid rgba(200,140,155,.25); background:white; color:#3d2028;
      transition:border-color .2s, box-shadow .2s;
    }
    .step-input:focus{border-color:#c9707a;box-shadow:0 0 0 3px rgba(200,112,122,.12);}
    .step-input::placeholder{color:#c0a8a8;}

    .card-white {
      background:white; border:1px solid rgba(200,140,155,.2);
      border-radius:16px; box-shadow:0 8px 32px rgba(200,112,122,.08);
    }

    .tab-bar { display:flex; background:rgba(200,112,122,.06); border-radius:12px; padding:4px; gap:3px; }
    .tab-btn { flex:1; padding:9px 6px; border:none; cursor:pointer; border-radius:9px;
      font-family:'Cinzel',serif; font-size:8.5px; letter-spacing:.12em; text-transform:uppercase; transition:all .2s; }
    .tab-btn.active{background:white;color:#c9707a;box-shadow:0 2px 8px rgba(200,112,122,.15);}
    .tab-btn.inactive{background:transparent;color:#b09898;}

    .progress-bar { display:flex; align-items:center; gap:0; margin-bottom:32px; }
    .prog-step { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; }
    .prog-circle { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center;
      font-family:'Cinzel',serif; font-size:11px; font-weight:600; transition:all .3s; }
    .prog-circle.done  { background:linear-gradient(135deg,#c9707a,#d4848c); color:white; }
    .prog-circle.active{ background:white; border:2px solid #c9707a; color:#c9707a; box-shadow:0 4px 12px rgba(200,112,122,.3); }
    .prog-circle.future{ background:#f5eded; border:2px solid #e8d5d5; color:#c0a8a8; }
    .prog-label { font-family:'Cinzel',serif; font-size:7.5px; letter-spacing:.1em; text-transform:uppercase; }
    .prog-label.done  { color:#c9707a; }
    .prog-label.active{ color:#c9707a; font-weight:700; }
    .prog-label.future{ color:#c0a8a8; }
    .prog-line { flex:1; height:2px; margin-bottom:16px; }
    .prog-line.done  { background:linear-gradient(90deg,#c9707a,#d4848c); }
    .prog-line.future{ background:#f0e0e2; }

    .theme-swatch { width:44px; height:44px; border-radius:10px; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; }
    .theme-swatch:hover{transform:scale(1.1);}
    .theme-swatch.selected{transform:scale(1.15);box-shadow:0 6px 18px rgba(0,0,0,.2);}

    .rsvp-card { background:white; border:1px solid rgba(200,140,155,.2); border-radius:14px; padding:20px; margin-bottom:10px; transition:all .2s; }
    .rsvp-card:hover{box-shadow:0 4px 16px rgba(200,112,122,.1);}

    table { width:100%; border-collapse:collapse; }
    th { background:rgba(200,112,122,.08); padding:10px 14px; text-align:left; font-family:'Cinzel',serif; font-size:9px; letter-spacing:.15em; text-transform:uppercase; color:#c9707a; border-bottom:1px solid rgba(200,140,155,.2); }
    td { padding:10px 14px; font-family:'Lato',sans-serif; font-size:13px; color:#3d2028; border-bottom:1px solid rgba(200,140,155,.1); }
    tr:last-child td{border-bottom:none;}
    tr:hover td{background:rgba(200,112,122,.03);}

    .stat-card { background:white; border:1px solid rgba(200,140,155,.18); border-radius:14px; padding:20px 16px; text-align:center; }
    .stat-num { font-family:'Cormorant Garamond',serif; font-size:44px; font-weight:300; line-height:1; }
    .stat-label { font-family:'Cinzel',serif; font-size:8px; letter-spacing:.18em; text-transform:uppercase; color:#b09898; margin-top:6px; }

    .floral-divider { display:flex; align-items:center; gap:10px; color:rgba(200,112,122,.4); font-size:14px; margin:16px 0; }
    .floral-divider::before,.floral-divider::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(200,112,122,.3),transparent); }

    @media(max-width:768px){
      .hide-mobile{display:none!important;}
      .mob-stack{flex-direction:column!important;}
      .mob-full{width:100%!important;}
      .stats-row{grid-template-columns:1fr 1fr!important;}
    }

    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-thumb{background:rgba(200,112,122,.3);border-radius:2px;}
  `}</style>
);

/* ═══════════════════════════════════════════════
   FLORAL SVG
═══════════════════════════════════════════════ */
const Flower = ({ x=0, y=0, r=10, color="#d4848c", opacity=1 }) => (
  <g transform={"translate("+x+","+y+")"} opacity={opacity}>
    {[0,72,144,216,288].map((deg,i)=>{
      const rad=deg*Math.PI/180;
      const px=Math.cos(rad)*r*0.6, py=Math.sin(rad)*r*0.6;
      return <ellipse key={i} cx={px} cy={py} rx={r*0.42} ry={r*0.28} fill={color} transform={"rotate("+deg+" "+px+" "+py+")"}/>;
    })}
    <circle cx="0" cy="0" r={r*0.22} fill="rgba(255,220,180,0.9)"/>
  </g>
);

const FloralDivider = ({ color="#c9707a" }) => (
  <svg viewBox="0 0 280 28" style={{width:"100%",maxWidth:260,display:"block",margin:"0 auto"}}>
    <line x1="0" y1="14" x2="280" y2="14" stroke={color} strokeWidth="0.5" opacity="0.3"/>
    <Flower x={140} y={14} r={9} color={color} opacity={0.7}/>
    <Flower x={100} y={14} r={5.5} color={color} opacity={0.5}/>
    <Flower x={180} y={14} r={5.5} color={color} opacity={0.5}/>
    <circle cx={60} cy={14} r={2} fill={color} opacity={0.3}/>
    <circle cx={220} cy={14} r={2} fill={color} opacity={0.3}/>
    <circle cx={30} cy={14} r={1.5} fill={color} opacity={0.2}/>
    <circle cx={250} cy={14} r={1.5} fill={color} opacity={0.2}/>
  </svg>
);

/* ═══════════════════════════════════════════════
   INVITATION CARD PREVIEW
═══════════════════════════════════════════════ */
const InvitationCard = ({ inv, colorTheme, fontTheme, onRSVP }) => {
  const C = colorThemes.find(c=>c.id===colorTheme)||colorThemes[0];
  const F = fontThemes.find(f=>f.id===fontTheme)||fontThemes[0];
  const isDark = colorTheme === "midnight";

  return (
    <div style={{
      background:C.card, border:"1px solid "+C.primary+"30",
      borderRadius:16, padding:"44px 36px", textAlign:"center",
      position:"relative", maxWidth:480, margin:"0 auto",
      boxShadow:isDark?"0 30px 80px rgba(0,0,0,.6)":"0 20px 60px rgba(0,0,0,.1)",
      overflow:"hidden",
    }}>
      {/* Corner flowers */}
      <svg style={{position:"absolute",top:0,right:0,pointerEvents:"none"}} width={80} height={80} viewBox="0 0 80 80">
        <g opacity={0.3}>
          <Flower x={65} y={15} r={14} color={C.primary}/>
          <Flower x={40} y={8} r={8} color={C.primary}/>
          <Flower x={72} y={42} r={7} color={C.primary}/>
        </g>
      </svg>
      <svg style={{position:"absolute",top:0,left:0,pointerEvents:"none",transform:"scaleX(-1)"}} width={80} height={80} viewBox="0 0 80 80">
        <g opacity={0.3}>
          <Flower x={65} y={15} r={14} color={C.primary}/>
          <Flower x={40} y={8} r={8} color={C.primary}/>
          <Flower x={72} y={42} r={7} color={C.primary}/>
        </g>
      </svg>
      <svg style={{position:"absolute",bottom:0,left:0,pointerEvents:"none",transform:"rotate(180deg) scaleX(-1)"}} width={80} height={80} viewBox="0 0 80 80">
        <g opacity={0.25}>
          <Flower x={65} y={15} r={12} color={C.primary}/>
          <Flower x={40} y={8} r={7} color={C.primary}/>
        </g>
      </svg>
      <svg style={{position:"absolute",bottom:0,right:0,pointerEvents:"none",transform:"rotate(180deg)"}} width={80} height={80} viewBox="0 0 80 80">
        <g opacity={0.25}>
          <Flower x={65} y={15} r={12} color={C.primary}/>
          <Flower x={40} y={8} r={7} color={C.primary}/>
        </g>
      </svg>

      <div style={{position:"relative",zIndex:1}}>
        {/* Tag */}
        <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:".28em",color:C.gold,marginBottom:16,textTransform:"uppercase",opacity:.8}}>
          ✦ &nbsp; Together We Celebrate &nbsp; ✦
        </div>

        {/* Photo */}
        {inv.photo && (
          <div style={{marginBottom:18}}>
            <div style={{width:110,height:110,borderRadius:"50%",margin:"0 auto",border:"2.5px solid "+C.primary,padding:3}}>
              <img src={inv.photo} alt="couple" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover",display:"block"}}/>
            </div>
          </div>
        )}

        {/* Names */}
        <div style={{fontFamily:F.display,fontSize:46,fontWeight:300,color:C.text,lineHeight:1,letterSpacing:".02em"}}>
          {inv.bride||"Bride"}
        </div>
        <div style={{color:C.gold,fontSize:20,margin:"8px 0",letterSpacing:".2em"}}>✦</div>
        <div style={{fontFamily:F.display,fontSize:46,fontWeight:300,color:C.text,lineHeight:1,letterSpacing:".02em",marginBottom:22}}>
          {inv.groom||"Groom"}
        </div>

        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <FloralDivider color={C.primary}/>
        </div>

        {/* Personal message */}
        {inv.message && (
          <div style={{fontFamily:F.display,fontStyle:"italic",fontSize:15,color:C.text,opacity:.7,lineHeight:1.75,maxWidth:300,margin:"0 auto 18px",whiteSpace:"pre-line"}}>
            {inv.message}
          </div>
        )}

        {/* Date box */}
        <div style={{background:C.primary+"12",border:"1px solid "+C.primary+"25",borderRadius:10,padding:"14px 20px",margin:"0 0 16px"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".22em",color:C.gold,textTransform:"uppercase",marginBottom:5}}>
            ✦ Date of the Celebration ✦
          </div>
          <div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:C.text}}>{inv.date||"Date TBD"}</div>
          <div style={{fontFamily:F.display,fontStyle:"italic",fontSize:14,color:C.text,opacity:.7,marginTop:3}}>{inv.time||""}</div>
        </div>

        {/* Venue */}
        <div style={{fontFamily:F.body,fontSize:14,color:C.text,opacity:.75,lineHeight:1.9,marginBottom:16}}>
          {inv.time && <>{inv.time}<br/></>}
          <span style={{fontWeight:700,opacity:1}}>{inv.venue||"Venue TBD"}</span><br/>
          {inv.address}
        </div>

        {/* Map link */}
        {inv.mapLink && (
          <a href={inv.mapLink} target="_blank" rel="noreferrer" style={{
            display:"inline-flex",alignItems:"center",gap:6,
            fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:".15em",
            color:C.primary,textDecoration:"none",textTransform:"uppercase",
            border:"1px solid "+C.primary+"40",borderRadius:20,padding:"6px 14px",
            marginBottom:16,transition:"all .2s",
          }}>
            📍 &nbsp; Open in Maps
          </a>
        )}

        <div style={{display:"flex",justifyContent:"center",margin:"16px 0"}}>
          <FloralDivider color={C.primary}/>
        </div>

        {onRSVP && (
          <button className="rose-btn" onClick={onRSVP} style={{padding:"13px 32px",fontSize:10,background:"linear-gradient(135deg,"+C.primary+","+C.gold+")"}}>
            ✉ Confirm Attendance
          </button>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function WeddingApp({ user, onLogout }) {
  const [view, setView] = useState("home"); // home | builder | invitation | dashboard
  const [builderStep, setBuilderStep] = useState(1); // 1=details 2=photo+text 3=design 4=preview
  const [rsvps, setRsvps] = useState(mockRsvps);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({ name:"", attending:null, adults:1, kids:0, allergy:"", note:"" });
  const [filterTab, setFilterTab] = useState("all");
  const [dashTab, setDashTab] = useState("list");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [inv, setInv] = useState({
    bride:"", groom:"", date:"", time:"", venue:"", address:"", mapLink:"", message:"", photo:null,
  });
  const [colorTheme, setColorTheme] = useState("blush");
  const [fontTheme, setFontTheme] = useState("cormorant");

  const C = colorThemes.find(c=>c.id===colorTheme)||colorThemes[0];
  const F = fontThemes.find(f=>f.id===fontTheme)||fontThemes[0];

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest";
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const userFirstLetter = userName.charAt(0).toUpperCase();

  const attendingRsvps = rsvps.filter(r=>r.attending);
  const notAttending   = rsvps.filter(r=>!r.attending);
  const totalAdults    = attendingRsvps.reduce((s,r)=>s+r.adults,0);
  const totalKids      = attendingRsvps.reduce((s,r)=>s+r.kids,0);
  const withAllergy    = attendingRsvps.filter(r=>r.allergy);
  const filtered       = filterTab==="all"?rsvps:filterTab==="yes"?attendingRsvps:notAttending;

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if(f) setInv(p=>({...p,photo:URL.createObjectURL(f)}));
  };

  const submitRsvp = () => {
    if(!rsvpForm.name || rsvpForm.attending===null) return;
    setRsvps(p=>[{id:Date.now(),...rsvpForm,time:"Just now"},...p]);
    setRsvpDone(true);
  };

  const exportCSV = () => {
    const headers = ["Name","Attending","Adults","Kids","Allergies","Note"];
    const rows = rsvps.map(r=>[r.name,r.attending?"Yes":"No",r.adults,r.kids,r.allergy,r.note]);
    const csv = [headers,...rows].map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="rsvp-list.csv"; a.click();
  };

  /* ── Topbar ─────────────────────────────────── */
  const Topbar = ({ light=false }) => (
    <div style={{
      position:"sticky",top:0,zIndex:100,
      background:light?"rgba(255,248,250,.96)":"rgba(255,255,255,.96)",
      backdropFilter:"blur(12px)",
      borderBottom:"1px solid rgba(200,140,155,.15)",
      padding:"12px 24px",
      display:"flex",alignItems:"center",justifyContent:"space-between",
    }}>
      <button onClick={()=>setView("home")} style={{
        background:"none",border:"none",cursor:"pointer",
        fontFamily:"'Cormorant Garamond',serif",fontSize:20,
        color:"#c9707a",fontStyle:"italic",letterSpacing:".05em",
        display:"flex",alignItems:"center",gap:6,
      }}>
        🌸 Eternally
      </button>

      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {view!=="builder" && (
          <button className="rose-btn hide-mobile" onClick={()=>{setBuilderStep(1);setView("builder");}} style={{padding:"8px 18px",fontSize:9}}>
            + New Invitation
          </button>
        )}
        {view!=="dashboard" && (
          <button className="ghost-btn hide-mobile" onClick={()=>setView("dashboard")} style={{padding:"8px 16px",fontSize:9,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>
            Dashboard
          </button>
        )}

        {/* User menu */}
        <div style={{position:"relative"}} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>setUserMenuOpen(v=>!v)} style={{
            display:"flex",alignItems:"center",gap:7,
            background:"white",border:"1.5px solid rgba(200,140,155,.3)",
            borderRadius:50,padding:"5px 12px 5px 5px",cursor:"pointer",
            boxShadow:"0 2px 10px rgba(200,112,122,.1)",transition:"all .2s",
          }}>
            {userAvatar
              ? <img src={userAvatar} alt="" style={{width:28,height:28,borderRadius:"50%",objectFit:"cover"}}/>
              : <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#c9707a,#d4848c)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>{userFirstLetter}</div>
            }
            <span className="hide-mobile" style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:".1em",color:"#3d2028",textTransform:"uppercase"}}>
              {userName.split(" ")[0]}
            </span>
            <span style={{fontSize:8,color:"#c9707a",opacity:.6}}>▾</span>
          </button>

          {userMenuOpen && (
            <div style={{
              position:"absolute",top:"calc(100% + 8px)",right:0,
              background:"white",border:"1px solid rgba(200,140,155,.25)",
              borderRadius:14,minWidth:220,zIndex:999,overflow:"hidden",
              boxShadow:"0 20px 50px rgba(200,112,122,.18)",
            }} className="fade-in">
              <div style={{padding:"14px 16px",background:"linear-gradient(135deg,#fff5f7,#fdeef2)",borderBottom:"1px solid rgba(200,140,155,.15)"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {userAvatar
                    ? <img src={userAvatar} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}}/>
                    : <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#c9707a,#d4848c)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:15,fontWeight:700}}>{userFirstLetter}</div>
                  }
                  <div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:10.5,color:"#3d2028",letterSpacing:".08em"}}>{userName}</div>
                    <div style={{fontSize:11,color:"#b09898",marginTop:2,fontFamily:"'Lato',sans-serif"}}>{user?.email}</div>
                  </div>
                </div>
              </div>
              {[
                {icon:"💐",label:"My Invitations",action:()=>{setView("home");setUserMenuOpen(false);}},
                {icon:"📊",label:"Dashboard",action:()=>{setView("dashboard");setUserMenuOpen(false);}},
                {icon:"✏️",label:"Edit Invitation",action:()=>{setBuilderStep(1);setView("builder");setUserMenuOpen(false);}},
              ].map(item=>(
                <div key={item.label} onClick={item.action} style={{padding:"11px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"'Lato',sans-serif",fontSize:13,color:"#3d2028",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(200,112,122,.06)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span>{item.icon}</span>{item.label}
                </div>
              ))}
              <div style={{height:1,background:"rgba(200,140,155,.15)"}}/>
              <div onClick={()=>{setUserMenuOpen(false);onLogout();}} style={{padding:"11px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"'Lato',sans-serif",fontSize:13,color:"#c07070",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(200,100,100,.06)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span>🚪</span> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════
     HOME
  ════════════════════════════════════════════ */
  if(view==="home") return (
    <>
      <GlobalStyles/>
      <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#fff5f7 0%,#fdeef2 40%,#fff8f0 100%)",fontFamily:"'Lato',sans-serif"}}>
        <Topbar/>
        <div className="sg" style={{textAlign:"center",padding:"60px 24px 48px",maxWidth:640,margin:"0 auto"}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:".35em",color:"#c9707a",marginBottom:16,textTransform:"uppercase"}}>
            ✦ &nbsp; Digital Wedding Invitations &nbsp; ✦
          </div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(36px,8vw,62px)",fontWeight:300,color:"#3d2028",lineHeight:1.15,marginBottom:16}}>
            Your love story<br/><em style={{color:"#c9707a"}}>create the perfect invitation now</em>
          </h1>
          <p style={{color:"#8a6068",fontSize:16,lineHeight:1.85,marginBottom:36,maxWidth:480,margin:"0 auto 36px"}}>
            Build a beautiful digital invitation in minutes, share it with your guests, and manage RSVPs — all in one place.
          </p>
          <div style={{display:"flex",gap:13,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="rose-btn" onClick={()=>{setBuilderStep(1);setView("builder");}} style={{padding:"16px 40px",fontSize:11}}>
              🌸 Create Invitation
            </button>
            <button className="ghost-btn" onClick={()=>setView("dashboard")} style={{padding:"15px 34px",fontSize:11,border:"1px solid rgba(200,112,122,.4)",color:"#c9707a"}}>
              📊 View Dashboard
            </button>
          </div>
        </div>

        {/* Mini preview */}
        <div style={{maxWidth:380,margin:"0 auto 60px",padding:"0 20px",opacity:.9,transform:"scale(0.85)",transformOrigin:"top center"}}>
          <InvitationCard inv={{bride:"Isabella",groom:"Alexander",date:"Saturday, June 14th",time:"6:30 PM",venue:"The Grand Palais",address:"Paris, France"}} colorTheme="blush" fontTheme="cormorant" onRSVP={()=>setView("invitation")}/>
        </div>

        {/* Features */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,maxWidth:820,margin:"0 auto",padding:"0 24px 60px"}}>
          {[
            {icon:"✏️",t:"Step-by-Step Builder",d:"Fill in your details, upload your photo, and choose your style"},
            {icon:"🌸",t:"Beautiful Designs",d:"5 colour palettes, 5 font styles — fully customizable"},
            {icon:"✅",t:"Smart RSVPs",d:"Guests confirm attendance, adults, kids, and dietary needs"},
            {icon:"📊",t:"Live Dashboard",d:"See all RSVPs, stats, allergy table, and export to Excel"},
          ].map(f=>(
            <div key={f.t} style={{background:"rgba(255,255,255,.75)",backdropFilter:"blur(8px)",border:"1px solid rgba(200,140,155,.2)",borderRadius:14,padding:"22px 18px"}}>
              <div style={{fontSize:24,marginBottom:10}}>{f.icon}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:9.5,color:"#c9707a",letterSpacing:".1em",marginBottom:7}}>{f.t}</div>
              <div style={{color:"#8a7078",fontSize:13,lineHeight:1.65}}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  /* ════════════════════════════════════════════
     BUILDER — STEP BY STEP WIZARD
  ════════════════════════════════════════════ */
  if(view==="builder") {
    const steps = ["Details","Photo & Text","Design","Preview"];
    const canNext1 = inv.bride && inv.groom && inv.date && inv.venue;
    const canNext2 = true;
    const canNext3 = true;

    return (
      <>
        <GlobalStyles/>
        <div style={{minHeight:"100vh",background:"#fdf8f9",fontFamily:"'Lato',sans-serif"}}>
          <Topbar light/>
          <div style={{maxWidth:680,margin:"0 auto",padding:"32px 20px 80px"}}>

            {/* Progress */}
            <div className="progress-bar sg">
              {steps.map((s,i)=>{
                const st = i+1 < builderStep ? "done" : i+1===builderStep ? "active" : "future";
                return (
                  <>
                    <div key={s} className="prog-step">
                      <div className={"prog-circle "+st}>
                        {st==="done" ? "✓" : i+1}
                      </div>
                      <div className={"prog-label "+st}>{s}</div>
                    </div>
                    {i < steps.length-1 && <div className={"prog-line "+(i+1 < builderStep ? "done":"future")} key={"line"+i}/>}
                  </>
                );
              })}
            </div>

            {/* STEP 1 — Event Details */}
            {builderStep===1 && (
              <div className="card-white fade-in" style={{padding:"32px 28px"}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#3d2028",marginBottom:6}}>Event Details</h2>
                <p style={{color:"#b09898",fontSize:13,marginBottom:28}}>Tell us about your special day</p>
                <div className="sg" style={{display:"flex",flexDirection:"column",gap:18}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="mob-stack">
                    <div>
                      <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:6}}>Bride's Name *</label>
                      <input className="step-input" value={inv.bride} onChange={e=>setInv(p=>({...p,bride:e.target.value}))} placeholder="Isabella"/>
                    </div>
                    <div>
                      <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:6}}>Groom's Name *</label>
                      <input className="step-input" value={inv.groom} onChange={e=>setInv(p=>({...p,groom:e.target.value}))} placeholder="Alexander"/>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}} className="mob-stack">
                    <div>
                      <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:6}}>Wedding Date *</label>
                      <input className="step-input" type="date" value={inv.date} onChange={e=>setInv(p=>({...p,date:e.target.value}))}/>
                    </div>
                    <div>
                      <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:6}}>Time</label>
                      <input className="step-input" type="time" value={inv.time} onChange={e=>setInv(p=>({...p,time:e.target.value}))}/>
                    </div>
                  </div>
                  <div>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:6}}>Venue Name *</label>
                    <input className="step-input" value={inv.venue} onChange={e=>setInv(p=>({...p,venue:e.target.value}))} placeholder="The Grand Palais"/>
                  </div>
                  <div>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:6}}>Full Address</label>
                    <input className="step-input" value={inv.address} onChange={e=>setInv(p=>({...p,address:e.target.value}))} placeholder="12 Flower Street, Tel Aviv"/>
                  </div>
                  <div>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:6}}>
                      📍 Waze / Google Maps Link
                    </label>
                    <input className="step-input" value={inv.mapLink} onChange={e=>setInv(p=>({...p,mapLink:e.target.value}))} placeholder="https://waze.com/ul/..."/>
                    <div style={{fontSize:11,color:"#c0a8a8",marginTop:5}}>Paste a Waze or Google Maps link — guests can open it directly from the invitation</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:28}}>
                  <button className="rose-btn" disabled={!canNext1} onClick={()=>setBuilderStep(2)} style={{padding:"13px 32px",fontSize:10}}>
                    Next: Photo & Text →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Photo & Personal Text */}
            {builderStep===2 && (
              <div className="card-white fade-in" style={{padding:"32px 28px"}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#3d2028",marginBottom:6}}>Photo & Message</h2>
                <p style={{color:"#b09898",fontSize:13,marginBottom:28}}>Add a personal touch to your invitation</p>
                <div className="sg" style={{display:"flex",flexDirection:"column",gap:24}}>
                  {/* Photo upload */}
                  <div>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:12}}>Couple Photo</label>
                    {inv.photo ? (
                      <div style={{display:"flex",alignItems:"center",gap:16}}>
                        <div style={{width:90,height:90,borderRadius:"50%",border:"2.5px solid #c9707a",padding:3}}>
                          <img src={inv.photo} alt="couple" style={{width:"100%",height:"100%",borderRadius:"50%",objectFit:"cover"}}/>
                        </div>
                        <button onClick={()=>setInv(p=>({...p,photo:null}))} style={{background:"none",border:"1px solid rgba(200,100,100,.3)",color:"#c07070",borderRadius:20,padding:"7px 16px",cursor:"pointer",fontSize:12,fontFamily:"'Lato',sans-serif"}}>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:"36px 20px",border:"1.5px dashed rgba(200,140,155,.35)",borderRadius:14,cursor:"pointer",background:"rgba(255,240,244,.4)"}}>
                        <div style={{fontSize:32}}>🌸</div>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:9.5,color:"#c9707a",letterSpacing:".2em",textTransform:"uppercase"}}>Upload Your Photo</div>
                        <div style={{fontSize:12,color:"#b09898",textAlign:"center"}}>A circular portrait will appear on your invitation</div>
                        <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
                      </label>
                    )}
                  </div>

                  {/* Personal message */}
                  <div>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:6}}>Personal Message from the Couple</label>
                    <textarea className="step-input" value={inv.message} onChange={e=>setInv(p=>({...p,message:e.target.value}))}
                      rows={4} placeholder={"Together with their families, we joyfully invite you\nto celebrate the beginning of our new life together..."}
                      style={{resize:"vertical",lineHeight:1.65}}/>
                    <div style={{fontSize:11,color:"#c0a8a8",marginTop:5}}>This appears on the invitation as a personal note from you both</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
                  <button className="ghost-btn" onClick={()=>setBuilderStep(1)} style={{padding:"12px 24px",fontSize:10,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>
                    ← Back
                  </button>
                  <button className="rose-btn" onClick={()=>setBuilderStep(3)} style={{padding:"13px 32px",fontSize:10}}>
                    Next: Design →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — Design */}
            {builderStep===3 && (
              <div className="card-white fade-in" style={{padding:"32px 28px"}}>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#3d2028",marginBottom:6}}>Design Your Invitation</h2>
                <p style={{color:"#b09898",fontSize:13,marginBottom:28}}>Choose your colour palette and font style</p>
                <div className="sg">
                  {/* Color themes */}
                  <div style={{marginBottom:28}}>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:14}}>Colour Palette</label>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      {colorThemes.map(ct=>(
                        <div key={ct.id} onClick={()=>setColorTheme(ct.id)} style={{textAlign:"center",cursor:"pointer"}}>
                          <div className={"theme-swatch"+(colorTheme===ct.id?" selected":"")} style={{background:ct.light,border:"2px solid "+ct.primary+(colorTheme===ct.id?"":"60")}}>
                            <div style={{width:20,height:20,borderRadius:"50%",background:ct.primary}}/>
                          </div>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:7.5,color:colorTheme===ct.id?ct.primary:"#b09898",marginTop:5,letterSpacing:".08em"}}>{ct.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Font themes */}
                  <div>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:".2em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:14}}>Font Style</label>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {fontThemes.map(ft=>(
                        <div key={ft.id} onClick={()=>setFontTheme(ft.id)} style={{
                          display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:12,cursor:"pointer",
                          border:fontTheme===ft.id?"1.5px solid #c9707a":"1px solid rgba(200,140,155,.2)",
                          background:fontTheme===ft.id?"rgba(200,112,122,.05)":"white",transition:"all .18s",
                        }}>
                          <div style={{fontFamily:ft.display,fontSize:22,color:"#3d2028",minWidth:120}}>{inv.bride||"Isabella"} &amp; {inv.groom||"Alexander"}</div>
                          <div>
                            <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:fontTheme===ft.id?"#c9707a":"#8a7078",letterSpacing:".08em"}}>{ft.name}</div>
                          </div>
                          {fontTheme===ft.id && <div style={{marginLeft:"auto",color:"#c9707a"}}>✓</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:28}}>
                  <button className="ghost-btn" onClick={()=>setBuilderStep(2)} style={{padding:"12px 24px",fontSize:10,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>
                    ← Back
                  </button>
                  <button className="rose-btn" onClick={()=>setBuilderStep(4)} style={{padding:"13px 32px",fontSize:10}}>
                    Preview →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 — Preview & Publish */}
            {builderStep===4 && (
              <div className="fade-in">
                <div style={{textAlign:"center",marginBottom:24}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#3d2028",marginBottom:6}}>Your Invitation is Ready! 🎉</div>
                  <p style={{color:"#b09898",fontSize:13}}>Here's how it looks — share the link with your guests</p>
                </div>
                <InvitationCard inv={inv} colorTheme={colorTheme} fontTheme={fontTheme} onRSVP={()=>setView("invitation")}/>
                <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:28,flexWrap:"wrap"}}>
                  <button className="ghost-btn" onClick={()=>setBuilderStep(3)} style={{padding:"12px 24px",fontSize:10,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>
                    ← Edit Design
                  </button>
                  <button className="rose-btn" onClick={()=>setView("invitation")} style={{padding:"13px 28px",fontSize:10}}>
                    📤 Share Invitation
                  </button>
                  <button className="rose-btn" onClick={()=>setView("dashboard")} style={{padding:"13px 28px",fontSize:10,background:"linear-gradient(135deg,#6a8848,#88aa60)"}}>
                    📊 Go to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  /* ════════════════════════════════════════════
     INVITATION PAGE (Guest view)
  ════════════════════════════════════════════ */
  if(view==="invitation") {
    const C2 = colorThemes.find(c=>c.id===colorTheme)||colorThemes[0];
    return (
      <>
        <GlobalStyles/>
        <div style={{minHeight:"100vh",background:"linear-gradient(145deg,"+C2.light+" 0%,#fff 100%)",padding:"24px 16px 80px",fontFamily:"'Lato',sans-serif"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:520,margin:"0 auto 24px"}}>
            <button className="ghost-btn" onClick={()=>setView("home")} style={{padding:"7px 14px",fontSize:9,border:"1px solid "+C2.primary+"40",color:C2.primary}}>← Home</button>
          </div>

          <InvitationCard inv={inv} colorTheme={colorTheme} fontTheme={fontTheme}/>

          {/* RSVP Form */}
          <div style={{maxWidth:500,margin:"32px auto 0"}}>
            <div className="card-white" style={{padding:"32px 28px"}}>
              {rsvpDone ? (
                <div className="fade-in" style={{textAlign:"center",padding:"16px 0"}}>
                  <div style={{fontSize:52,marginBottom:16}}>🌸</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#3d2028",marginBottom:10}}>
                    {rsvpForm.attending ? "We shall see you there! 🥂" : "Thank you for letting us know"}
                  </div>
                  <div style={{color:"#8a6068",fontSize:14,lineHeight:1.85,marginBottom:26}}>
                    {rsvpForm.attending
                      ? "Your attendance has been noted. We look forward to celebrating with you!"
                      : "We're sorry you can't make it. You'll be in our hearts on the day."}
                  </div>
                  <button className="ghost-btn" onClick={()=>{setRsvpDone(false);setRsvpForm({name:"",attending:null,adults:1,kids:0,allergy:"",note:""}); }}
                    style={{padding:"9px 22px",fontSize:9,border:"1px solid rgba(200,112,122,.3)",color:"#c9707a"}}>
                    Submit another response
                  </button>
                </div>
              ) : (
                <div className="sg">
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:".25em",color:C2.gold,textAlign:"center",marginBottom:22,textTransform:"uppercase"}}>
                    ✦ &nbsp; Kindly Confirm Attendance &nbsp; ✦
                  </div>

                  {/* Yes / No */}
                  <div style={{display:"flex",gap:10,marginBottom:20}}>
                    {[
                      {val:true, label:"🌸 Joyfully Accepts",  ac:"rgba(106,154,114,.1)", bc:"#6a9a72"},
                      {val:false,label:"🥀 Regretfully Declines",ac:"rgba(200,100,100,.08)",bc:"#c07878"},
                    ].map(o=>(
                      <button key={String(o.val)} onClick={()=>setRsvpForm(p=>({...p,attending:o.val}))} style={{
                        flex:1,padding:"14px 8px",borderRadius:12,cursor:"pointer",
                        border:rsvpForm.attending===o.val?"1.5px solid "+o.bc:"1px solid rgba(200,140,155,.22)",
                        background:rsvpForm.attending===o.val?o.ac:"white",
                        color:rsvpForm.attending===o.val?o.bc:"#b09898",
                        fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".1em",
                        textTransform:"uppercase",transition:"all .18s",
                      }}>
                        {o.label}
                      </button>
                    ))}
                  </div>

                  {/* Name */}
                  <div style={{marginBottom:14}}>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".18em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:5}}>Full Name *</label>
                    <input className="step-input" value={rsvpForm.name} onChange={e=>setRsvpForm(p=>({...p,name:e.target.value}))} placeholder="Your full name"/>
                  </div>

                  {/* Adults & Kids */}
                  {rsvpForm.attending===true && (
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                      <div>
                        <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".18em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:8}}>Adults 👨‍👩</label>
                        <div style={{display:"flex",gap:6}}>
                          {[1,2,3,4,5].map(n=>(
                            <button key={n} onClick={()=>setRsvpForm(p=>({...p,adults:n}))} style={{
                              width:34,height:34,borderRadius:8,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,transition:"all .15s",
                              border:rsvpForm.adults===n?"1.5px solid #c9707a":"1px solid rgba(200,140,155,.25)",
                              background:rsvpForm.adults===n?"rgba(200,112,122,.1)":"white",
                              color:rsvpForm.adults===n?"#c9707a":"#b09898",
                            }}>{n}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".18em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:8}}>Children 👶</label>
                        <div style={{display:"flex",gap:6}}>
                          {[0,1,2,3,4].map(n=>(
                            <button key={n} onClick={()=>setRsvpForm(p=>({...p,kids:n}))} style={{
                              width:34,height:34,borderRadius:8,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,transition:"all .15s",
                              border:rsvpForm.kids===n?"1.5px solid #c9707a":"1px solid rgba(200,140,155,.25)",
                              background:rsvpForm.kids===n?"rgba(200,112,122,.1)":"white",
                              color:rsvpForm.kids===n?"#c9707a":"#b09898",
                            }}>{n}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  <div style={{marginBottom:14}}>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".18em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:5}}>Allergies & Dietary Requirements</label>
                    <select className="step-input" value={rsvpForm.allergy} onChange={e=>setRsvpForm(p=>({...p,allergy:e.target.value}))}>
                      <option value="">No restrictions</option>
                      <option>Vegetarian</option>
                      <option>Vegan</option>
                      <option>Gluten-free</option>
                      <option>Dairy-free</option>
                      <option>Nut allergy</option>
                      <option>Halal</option>
                      <option>Kosher</option>
                    </select>
                  </div>

                  {/* Note */}
                  <div style={{marginBottom:22}}>
                    <label style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".18em",color:"#b09098",textTransform:"uppercase",display:"block",marginBottom:5}}>Additional Note / Message for the Couple 💌</label>
                    <textarea className="step-input" value={rsvpForm.note} onChange={e=>setRsvpForm(p=>({...p,note:e.target.value}))} rows={2} placeholder="Your warmest wishes…" style={{resize:"none",lineHeight:1.6}}/>
                  </div>

                  <button className="rose-btn" onClick={submitRsvp} disabled={!rsvpForm.name||rsvpForm.attending===null} style={{width:"100%",padding:"15px",fontSize:10}}>
                    ✉ Send My Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ════════════════════════════════════════════
     DASHBOARD
  ════════════════════════════════════════════ */
  if(view==="dashboard") return (
    <>
      <GlobalStyles/>
      <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#fff5f7,#fdeef2 40%,#fff8f0 100%)",fontFamily:"'Lato',sans-serif",paddingBottom:40}}>
        <Topbar light/>

        <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px"}}>

          {/* Header */}
          <div className="sg" style={{marginBottom:24}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:"#3d2028",marginBottom:4}}>
              {inv.bride&&inv.groom ? inv.bride+" & "+inv.groom+" 🌸" : "Your Dashboard"}
            </div>
            {inv.date && <div style={{color:"#b09898",fontSize:14}}>{inv.date} · {inv.venue}</div>}
          </div>

          {/* Stats */}
          <div className="sg" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}} className="stats-row sg">
            {[
              {label:"Total Replies",   value:rsvps.length,         color:"#c9707a"},
              {label:"Attending",       value:attendingRsvps.length, color:"#6a9a72"},
              {label:"Declined",        value:notAttending.length,   color:"#c07878"},
              {label:"Total Adults",    value:totalAdults,           color:"#9a78b8"},
              {label:"Total Children",  value:totalKids,             color:"#e8a050"},
            ].map(s=>(
              <div key={s.label} className="stat-card">
                <div className="stat-num" style={{color:s.color}}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="card-white sg" style={{padding:"18px 20px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:8.5,letterSpacing:".18em",color:"#b09898",textTransform:"uppercase"}}>Response Rate</span>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"#6a9a72"}}>
                {rsvps.length>0?Math.round((attendingRsvps.length/rsvps.length)*100):0}% attending
              </span>
            </div>
            <div style={{background:"rgba(200,112,122,.1)",borderRadius:99,height:8,overflow:"hidden"}}>
              <div style={{width:(rsvps.length>0?(attendingRsvps.length/rsvps.length)*100:0)+"%",height:"100%",background:"linear-gradient(90deg,#c9707a,#d4848c)",borderRadius:99,transition:"width .8s"}}/>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{display:"flex",gap:11,marginBottom:20,flexWrap:"wrap"}} className="sg">
            <button onClick={()=>setView("invitation")} style={{
              background:"linear-gradient(135deg,#25D366,#128C7E)",color:"white",border:"none",
              borderRadius:25,padding:"10px 20px",cursor:"pointer",fontFamily:"'Cinzel',serif",
              fontSize:9,letterSpacing:".1em",boxShadow:"0 4px 14px rgba(37,211,102,.3)",
            }}>
              📱 Share via WhatsApp
            </button>
            <button onClick={exportCSV} style={{
              background:"linear-gradient(135deg,#4a8a6a,#6aaa8a)",color:"white",border:"none",
              borderRadius:25,padding:"10px 20px",cursor:"pointer",fontFamily:"'Cinzel',serif",
              fontSize:9,letterSpacing:".1em",boxShadow:"0 4px 14px rgba(74,138,106,.3)",
            }}>
              📥 Export to Excel / CSV
            </button>
            <button onClick={()=>{setBuilderStep(1);setView("builder");}} style={{
              background:"transparent",color:"#c9707a",border:"1px solid rgba(200,112,122,.35)",
              borderRadius:25,padding:"9px 18px",cursor:"pointer",fontFamily:"'Cinzel',serif",
              fontSize:9,letterSpacing:".1em",
            }}>
              ✏️ Edit Invitation
            </button>
          </div>

          {/* Tabs */}
          <div className="tab-bar sg" style={{marginBottom:18}}>
            {[
              {id:"list",    label:"Guest List"},
              {id:"allergy", label:"Allergies Table"},
              {id:"stats",   label:"Statistics"},
            ].map(tab=>(
              <button key={tab.id} className={"tab-btn "+(dashTab===tab.id?"active":"inactive")} onClick={()=>setDashTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* GUEST LIST TAB */}
          {dashTab==="list" && (
            <div className="card-white fade-in" style={{padding:"20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:".15em",color:"#c9707a",textTransform:"uppercase"}}>
                  🌸 Guest Responses ({rsvps.length})
                </div>
                <div style={{display:"flex",gap:6}}>
                  {[{id:"all",l:"All"},{id:"yes",l:"Attending ("+attendingRsvps.length+")"},{id:"no",l:"Declined ("+notAttending.length+")"}].map(f=>(
                    <button key={f.id} onClick={()=>setFilterTab(f.id)} style={{
                      padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:11,transition:"all .18s",
                      fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:".1em",textTransform:"uppercase",
                      border:filterTab===f.id?"1.5px solid #c9707a":"1px solid rgba(200,140,155,.22)",
                      background:filterTab===f.id?"rgba(200,112,122,.1)":"transparent",
                      color:filterTab===f.id?"#c9707a":"#b09898",
                    }}>{f.l}</button>
                  ))}
                </div>
              </div>

              <div style={{overflowX:"auto"}}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Adults</th>
                      <th>Children</th>
                      <th>Dietary</th>
                      <th>Message</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r=>(
                      <tr key={r.id}>
                        <td style={{fontWeight:600}}>{r.name}</td>
                        <td>
                          <span style={{
                            background:r.attending?"rgba(106,154,114,.12)":"rgba(200,100,100,.1)",
                            color:r.attending?"#6a9a72":"#c07878",
                            padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,
                          }}>
                            {r.attending?"✓ Attending":"✗ Declined"}
                          </span>
                        </td>
                        <td>{r.attending?r.adults:"—"}</td>
                        <td>{r.attending?r.kids:"—"}</td>
                        <td>{r.allergy||<span style={{color:"#c0a8a8"}}>None</span>}</td>
                        <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontStyle:"italic",color:"#8a6068"}}>
                          {r.note||""}
                        </td>
                        <td style={{color:"#c0a8a8",fontSize:12}}>{r.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ALLERGY TAB */}
          {dashTab==="allergy" && (
            <div className="card-white fade-in" style={{padding:"20px"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:".15em",color:"#c9707a",textTransform:"uppercase",marginBottom:16}}>
                🌿 Dietary & Allergy Summary
              </div>
              {withAllergy.length===0 ? (
                <div style={{textAlign:"center",padding:"40px 0",color:"#b09898",fontSize:14}}>No dietary requirements reported 🎉</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th>Dietary Requirement</th>
                      <th>Adults</th>
                      <th>Children</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withAllergy.map(r=>(
                      <tr key={r.id}>
                        <td style={{fontWeight:600}}>{r.name}</td>
                        <td>
                          <span style={{background:"rgba(200,112,122,.1)",color:"#c9707a",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>
                            ⚠️ {r.allergy}
                          </span>
                        </td>
                        <td>{r.adults}</td>
                        <td>{r.kids}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* STATS TAB */}
          {dashTab==="stats" && (
            <div className="card-white fade-in" style={{padding:"24px"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:".15em",color:"#c9707a",textTransform:"uppercase",marginBottom:20}}>
                📊 Statistics
              </div>

              {/* Bar chart - simple CSS bars */}
              <div style={{marginBottom:28}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:".15em",color:"#b09098",textTransform:"uppercase",marginBottom:14}}>Guest Breakdown</div>
                {[
                  {label:"Attending",     value:attendingRsvps.length, total:rsvps.length, color:"#6a9a72"},
                  {label:"Declined",      value:notAttending.length,   total:rsvps.length, color:"#c07878"},
                  {label:"Total Adults",  value:totalAdults,           total:totalAdults+totalKids||1, color:"#c9707a"},
                  {label:"Total Children",value:totalKids,             total:totalAdults+totalKids||1, color:"#e8a050"},
                  {label:"With Dietary",  value:withAllergy.length,    total:attendingRsvps.length||1,  color:"#9a78b8"},
                ].map(b=>(
                  <div key={b.label} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontFamily:"'Lato',sans-serif",fontSize:13,color:"#3d2028"}}>{b.label}</span>
                      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:b.color,fontWeight:600}}>{b.value}</span>
                    </div>
                    <div style={{background:"rgba(200,112,122,.08)",borderRadius:99,height:8,overflow:"hidden"}}>
                      <div style={{width:(b.value/b.total*100)+"%",height:"100%",background:b.color,borderRadius:99,transition:"width .8s"}}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary numbers */}
              <div style={{background:"linear-gradient(135deg,#fff5f7,#fdeef2)",borderRadius:12,padding:"18px 20px"}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:".15em",color:"#c9707a",textTransform:"uppercase",marginBottom:12}}>Total Headcount</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,textAlign:"center"}}>
                  {[
                    {label:"Total People",value:totalAdults+totalKids,color:"#c9707a"},
                    {label:"Adults",      value:totalAdults,           color:"#9a78b8"},
                    {label:"Children",    value:totalKids,             color:"#e8a050"},
                  ].map(s=>(
                    <div key={s.label}>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,color:s.color}}>{s.value}</div>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:8,letterSpacing:".15em",color:"#b09898",textTransform:"uppercase",marginTop:4}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return null;
}
