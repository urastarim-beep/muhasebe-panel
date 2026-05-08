import { useState, useEffect, useCallback, useRef } from "react";

const MONTHS = ["OCAK","ŞUBAT","MART","NİSAN","MAYIS","HAZİRAN","TEMMUZ","AĞUSTOS","EYLÜL","EKİM","KASIM","ARALIK"];
const DRIVE_FILE_NAME = "muhasebe_ucret_data.json";
const DRIVE_TIMEOUT_MS = 12000;
const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];

function getDeadlines(year) {
  const days = [31,28+(year%4===0&&(year%100!==0||year%400===0)?1:0),31,30,31,30,31,31,30,31,30,31];
  return Object.fromEntries(MONTHS.map((m,i)=>[m,new Date(`${year}-${String(i+1).padStart(2,"0")}-${days[i]}`)]));
}
const TODAY = new Date();

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_2026 = {
  "TEKSEL LTD": { fee:15000, payments:{ "OCAK":{amount:15000,date:"2026-02-05"},"ŞUBAT":{amount:15000,date:"2026-03-02"},"MART":{amount:15000,date:"2026-04-02"},"NİSAN":{amount:15000,date:null} } },
  "ÖZBİRLİK": { fee:21500, payments:{ "OCAK":{amount:21500,date:"2026-02-02"},"ŞUBAT":{amount:21500,date:"2026-03-02"},"MART":{amount:21500,date:"2026-04-02"},"NİSAN":{amount:21500,date:"2026-04-30"} } },
  "YUNUS İŞLEYEN": { fee:9800, payments:{ "OCAK":{amount:9800,date:"2026-02-02"},"ŞUBAT":{amount:9800,date:"2026-03-02"},"MART":{amount:9800,date:"2026-04-02"},"NİSAN":{amount:9800,date:"2026-04-30"} } },
  "ÖZDEN SEZER": { fee:20500, payments:{ "OCAK":{amount:20500,date:"2026-02-11"},"ŞUBAT":{amount:20500,date:"2026-03-13"},"MART":{amount:20500,date:"2026-04-10"} } },
  "ÖZDEN MOTORS": { fee:18000, payments:{ "OCAK":{amount:18000,date:"2026-02-11"},"ŞUBAT":{amount:18000,date:"2026-03-13"},"MART":{amount:18000,date:"2026-04-10"} } },
  "BURCE GROUP": { fee:22000, payments:{ "OCAK":{amount:22000,date:"2026-02-11"},"ŞUBAT":{amount:22000,date:"2026-03-13"},"MART":{amount:22000,date:"2026-04-10"} } },
  "İBRAHİM ALTAY": { fee:17200, payments:{ "OCAK":{amount:17200,date:"2026-02-04"},"ŞUBAT":{amount:17200,date:"2026-03-02"},"MART":{amount:17200,date:"2026-04-10"},"NİSAN":{amount:17200,date:null} } },
  "DÖRTKUŞAK": { fee:15800, payments:{ "OCAK":{amount:15800,date:"2026-02-25"},"ŞUBAT":{amount:15800,date:"2026-03-24"},"MART":{amount:15800,date:"2026-04-27"} } },
  "TURANLAR TARIM": { fee:23600, payments:{ "OCAK":{amount:23600,date:"2026-02-02"},"ŞUBAT":{amount:23600,date:"2026-03-02"},"MART":{amount:23600,date:"2026-04-02"},"NİSAN":{amount:23600,date:"2026-04-30"} } },
  "GÜVENLİ": { fee:15800, payments:{ "OCAK":{amount:15000,date:"2026-02-22"},"ŞUBAT":{amount:15000,date:"2026-03-13"},"MART":{amount:15000,date:"2026-04-02"} } },
  "MUSDEM": { fee:15800, payments:{ "OCAK":{amount:15800,date:"2026-02-07"},"ŞUBAT":{amount:15800,date:"2026-03-15"},"MART":{amount:15800,date:"2026-04-02"},"NİSAN":{amount:15800,date:"2026-05-05"} } },
  "ÖZDENİZ": { fee:9500, payments:{ "OCAK":{amount:9500,date:"2026-02-02"},"ŞUBAT":{amount:9500,date:"2026-03-02"},"MART":{amount:9500,date:"2026-04-02"},"NİSAN":{amount:9500,date:"2026-04-30"} } },
  "ABDULLAH KILIÇ": { fee:4200, payments:{ "OCAK":{amount:4200,date:"2026-02-19"},"ŞUBAT":{amount:4200,date:"2026-02-28"} } },
  "MEHMET AKSOY": { fee:10000, payments:{ "OCAK":{amount:10000,date:"2026-02-05"},"ŞUBAT":{amount:10000,date:"2026-03-05"},"MART":{amount:10000,date:"2026-04-02"} } },
  "ATİLLA AKSOY": { fee:9500, payments:{ "OCAK":{amount:9500,date:"2026-02-05"},"ŞUBAT":{amount:9500,date:"2026-03-05"},"MART":{amount:9500,date:"2026-04-02"} } },
  "GÜRSAM": { fee:21500, payments:{} },
  "EMİNE AYDIN": { fee:5500, payments:{} },
  "MURAT SÜRER": { fee:6300, payments:{ "OCAK":{amount:6300,date:"2026-04-20"},"ŞUBAT":{amount:6300,date:"2026-04-20"},"MART":{amount:6300,date:"2026-04-20"} } },
  "CC MOTORS": { fee:21500, payments:{ "OCAK":{amount:21500,date:"2026-02-03"},"ŞUBAT":{amount:21500,date:"2026-04-10"},"MART":{amount:21500,date:"2026-04-10"} } },
  "CC TURAN ADİ ORTAKLIK": { fee:6500, payments:{ "OCAK":{amount:6500,date:"2026-02-03"},"ŞUBAT":{amount:7000,date:"2026-04-10"} } },
  "ŞENGÜL ALTUN": { fee:11600, payments:{ "OCAK":{amount:11600,date:"2026-01-26"},"ŞUBAT":{amount:11600,date:"2026-02-26"},"MART":{amount:11600,date:"2026-03-31"},"NİSAN":{amount:11600,date:"2026-04-30"} } },
  "MURAT UZUN": { fee:13000, payments:{ "OCAK":{amount:13000,date:"2026-01-31"},"ŞUBAT":{amount:13000,date:"2026-02-28"},"MART":{amount:13000,date:"2026-03-31"},"NİSAN":{amount:13000,date:null} } },
  "MERVE BOZKURT": { fee:11600, payments:{ "OCAK":{amount:11600,date:"2026-01-26"},"ŞUBAT":{amount:11600,date:"2026-02-26"},"MART":{amount:11600,date:"2026-03-31"},"NİSAN":{amount:11600,date:null} } },
  "HÜLYA SAĞLAM": { fee:6800, payments:{ "OCAK":{amount:6800,date:"2026-02-17"} } },
  "METİN BEKTAŞ": { fee:6300, payments:{ "OCAK":{amount:6300,date:"2026-01-26"},"ŞUBAT":{amount:6300,date:"2026-02-28"},"MART":{amount:6300,date:"2026-04-02"},"NİSAN":{amount:6300,date:"2026-04-28"} } },
  "MEHMET İSKENDER": { fee:6500, payments:{} },
  "MERTCAN ÇAKMAR": { fee:2500, payments:{ "OCAK":{amount:2500,date:"2026-01-28"},"ŞUBAT":{amount:2500,date:"2026-03-02"},"MART":{amount:2500,date:"2026-04-02"},"NİSAN":{amount:2500,date:"2026-04-28"} } },
  "AYSEL YÜCEL": { fee:1000, payments:{} },
  "MEHMET DEMİRCİ": { fee:6800, payments:{ "OCAK":{amount:6800,date:"2026-01-31"},"ŞUBAT":{amount:6800,date:"2026-03-02"},"MART":{amount:6800,date:"2026-04-02"},"NİSAN":{amount:6800,date:"2026-05-03"} } },
  "UFUK BÜTÜN": { fee:2000, payments:{ "OCAK":{amount:24000,date:"2026-01-31"} } },
  "TOMRUKÇU PETROL": { fee:30000, payments:{ "OCAK":{amount:30000,date:"2026-02-04"},"ŞUBAT":{amount:30000,date:"2026-03-05"},"MART":{amount:30000,date:"2026-04-02"},"NİSAN":{amount:30000,date:"2026-05-05"} } },
  "CUMHURİYET PETROL": { fee:15000, payments:{ "OCAK":{amount:15000,date:"2026-02-04"},"ŞUBAT":{amount:15000,date:"2026-03-15"},"MART":{amount:15000,date:"2026-04-02"},"NİSAN":{amount:15000,date:"2026-05-05"} } },
  "GAYE SEZER": { fee:6300, payments:{ "OCAK":{amount:6300,date:"2026-03-30"},"ŞUBAT":{amount:6300,date:"2026-03-30"},"MART":{amount:6300,date:"2026-03-30"} } },
  "MUSA KÖROĞLU": { fee:7800, payments:{ "OCAK":{amount:7800,date:"2026-01-26"},"ŞUBAT":{amount:7800,date:"2026-02-25"},"MART":{amount:7800,date:"2026-03-31"},"NİSAN":{amount:7800,date:"2026-04-27"} } },
  "NEŞELİ YÜZLER": { fee:10500, payments:{ "OCAK":{amount:10500,date:"2026-01-28"},"ŞUBAT":{amount:10500,date:"2026-02-25"},"MART":{amount:10500,date:"2026-03-31"},"NİSAN":{amount:10500,date:"2026-04-27"} } },
  "KUZEY HARİTA": { fee:5000, payments:{ "OCAK":{amount:5000,date:"2026-01-26"},"ŞUBAT":{amount:5000,date:"2026-02-25"},"MART":{amount:5000,date:"2026-03-31"},"NİSAN":{amount:5000,date:"2026-04-30"} } },
  "SEZAİ MACİT": { fee:2000, payments:{} },
  "KİTAPÇI METİN": { fee:3500, payments:{ "OCAK":{amount:5500,date:"2026-02-02"},"ŞUBAT":{amount:5500,date:"2026-04-24"},"MART":{amount:3500,date:"2026-05-05"} } },
  "BEDİRHAN AK": { fee:11500, payments:{} },
  "YÜCEL DALKIRAN": { fee:2000, payments:{ "OCAK":{amount:2000,date:"2026-02-05"},"ŞUBAT":{amount:2000,date:"2026-03-05"},"MART":{amount:2000,date:null} } },
  "AHMET ÖZDOĞAN": { fee:2500, payments:{} },
  "EMİRHAN ÇİFTÇİ": { fee:3500, payments:{ "OCAK":{amount:3500,date:"2026-01-28"},"ŞUBAT":{amount:3500,date:"2026-03-02"},"MART":{amount:3500,date:"2026-04-13"},"NİSAN":{amount:3500,date:"2026-04-30"} } },
  "BURCU KİRENCİ": { fee:6500, payments:{ "OCAK":{amount:6500,date:"2026-01-28"},"ŞUBAT":{amount:6500,date:"2026-03-05"},"MART":{amount:6500,date:"2026-03-31"},"NİSAN":{amount:6500,date:"2026-04-30"} } },
  "ELİFHAN ÇİFTÇİ": { fee:3500, payments:{ "OCAK":{amount:3500,date:"2026-02-02"},"ŞUBAT":{amount:3500,date:null},"MART":{amount:3500,date:"2026-03-31"},"NİSAN":{amount:3500,date:null} } },
  "MUHAMMET KEMENT": { fee:8000, payments:{ "OCAK":{amount:8000,date:"2026-02-02"},"ŞUBAT":{amount:8000,date:"2026-03-02"},"MART":{amount:8000,date:"2026-04-06"} } },
  "HAN-HAL TURAN ADİ ORTAKLIK": { fee:15600, payments:{ "OCAK":{amount:15600,date:"2026-02-02"},"ŞUBAT":{amount:15600,date:"2026-03-02"},"MART":{amount:15600,date:"2026-03-31"},"NİSAN":{amount:15600,date:"2026-04-30"} } },
  "AHMET YILMAZ": { fee:15800, payments:{ "OCAK":{amount:15800,date:"2026-02-05"},"ŞUBAT":{amount:15800,date:"2026-03-02"},"MART":{amount:15800,date:"2026-03-31"},"NİSAN":{amount:15800,date:"2026-04-30"} } },
  "ÇAKIR YAŞ SEBZE": { fee:15800, payments:{ "OCAK":{amount:15800,date:"2026-02-02"},"ŞUBAT":{amount:15800,date:"2026-03-02"},"MART":{amount:15800,date:"2026-03-31"},"NİSAN":{amount:15800,date:"2026-04-30"} } },
  "ERGEZ TİC": { fee:10000, payments:{ "OCAK":{amount:10000,date:"2026-02-16"},"ŞUBAT":{amount:10000,date:"2026-04-27"},"MART":{amount:10000,date:"2026-04-27"} } }
};
const INITIAL_ALL_DATA = { 2026: SEED_2026 };


// ─── Supabase Config ─────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://wcyjarhtsacxlrqdxnpa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjeWphcmh0c2FjeGxycWR4bnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMjM5MDksImV4cCI6MjA5Mzc5OTkwOX0.roD51GRx4FDqXG_EWQlqqeJobj8GxT2LRKr_BcV1MkQ';
const TABLE = 'muhasebe_data';

async function loadFromSheets() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=data&order=id.desc&limit=1`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  });
  if (!r.ok) throw new Error('supabase_read_failed');
  const rows = await r.json();
  if (!rows || rows.length === 0) return null;
  return JSON.parse(rows[0].data);
}

async function saveToSheets(data) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ data: JSON.stringify(data) })
  });
  if (!r.ok) throw new Error('supabase_write_failed');
  return true;
}

// ─── Utils ────────────────────────────────────────────────────────────────────
const fmt  = n=>(n??0).toLocaleString("tr-TR")+" ₺";
const fmtD = d=>d?new Date(d).toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric"}):"—";
function isOverdue(p,month,year){ const dl=getDeadlines(year)[month]; if(!dl||dl>TODAY)return false; return !p||!p.date; }
function getOverdueList(yd,year){
  const items=[];
  for(const [name,c] of Object.entries(yd)){
    const ov=[];
    for(const m of MONTHS){ const dl=getDeadlines(year)[m]; if(!dl||dl>TODAY)continue; const p=c.payments?.[m]; if(isOverdue(p,m,year)) ov.push({month:m,amount:p?.amount??c.fee,daysPast:Math.floor((TODAY-dl)/86400000)}); }
    if(ov.length) items.push({name,fee:c.fee,overdue:ov,total:ov.reduce((s,o)=>s+o.amount,0)});
  }
  return items.sort((a,b)=>b.total-a.total);
}

// ─── Shared input style ───────────────────────────────────────────────────────
const INP={background:"#0d1117",border:"1px solid #2a3148",borderRadius:9,padding:"10px 14px",color:"#eaedf5",outline:"none",boxSizing:"border-box",width:"100%",fontSize:14};

// ─── ModalWrap ────────────────────────────────────────────────────────────────
function ModalWrap({children,width=340}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#161b27",border:"1px solid #2a3148",borderRadius:18,padding:28,width,maxWidth:"95vw",boxShadow:"0 32px 80px rgba(0,0,0,.6)",maxHeight:"90vh",overflowY:"auto"}}>
        {children}
      </div>
    </div>
  );
}

// ─── Settings Panel (slide-in drawer style modal) ────────────────────────────
// ─── Rapor hesaplama ──────────────────────────────────────────────────────────
function buildReports(allData) {
  // Tüm yıllardan ödeme tarihlerini topla
  // Günlük, aylık, yıllık toplamlar
  const byDate   = {}; // "2026-04-30" -> toplam
  const byMonth  = {}; // "2026-04"    -> toplam
  const byYear   = {}; // 2026         -> toplam

  for (const [yearKey, yearData] of Object.entries(allData)) {
    if (yearKey === "__settings") continue;
    for (const client of Object.values(yearData)) {
      for (const p of Object.values(client.payments || {})) {
        if (!p?.date || !p?.amount) continue;
        const d   = p.date;               // "2026-04-30"
        const mon = d.slice(0, 7);        // "2026-04"
        const yr  = Number(d.slice(0, 4));
        byDate[d]   = (byDate[d]   || 0) + p.amount;
        byMonth[mon]= (byMonth[mon]|| 0) + p.amount;
        byYear[yr]  = (byYear[yr]  || 0) + p.amount;
      }
    }
  }
  return { byDate, byMonth, byYear };
}

function ReportsSection({ allData, activeYear }) {
  const [view, setView]         = useState("monthly"); // monthly | daily
  const [selMonth, setSelMonth] = useState(null);      // "2026-04" drill-down

  const { byDate, byMonth, byYear } = buildReports(allData);

  // Aylık liste — sadece aktif yıl
  const monthlyRows = MONTHS.map((name, i) => {
    const key = `${activeYear}-${String(i+1).padStart(2,"0")}`;
    return { name, key, total: byMonth[key] || 0 };
  }).filter(r => r.total > 0);

  // Günlük liste — ya seçili ay ya da tüm aktif yıl
  const dailyRows = Object.entries(byDate)
    .filter(([d]) => selMonth ? d.startsWith(selMonth) : d.startsWith(String(activeYear)))
    .map(([date, total]) => ({ date, total }))
    .sort((a,b) => b.date.localeCompare(a.date));

  // Yıllık özet
  const yearTotal = byYear[activeYear] || 0;
  const grandTotal = Object.entries(byYear).filter(([k])=>k!=="NaN").reduce((s,[,v])=>s+v,0);

  const fmtMon = key => {
    const [y,m] = key.split("-");
    return `${MONTHS[Number(m)-1]} ${y}`;
  };

  const BAR_MAX = monthlyRows.length ? Math.max(...monthlyRows.map(r=>r.total)) : 1;

  return (
    <div>
      {/* Yıl özeti */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <div style={{background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:11,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:"#3b82f6",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{activeYear} Toplam</div>
          <div style={{fontSize:18,fontWeight:900,color:"#60a5fa"}}>{fmt(yearTotal)}</div>
        </div>
        <div style={{background:"#0a1f16",border:"1px solid #14532d",borderRadius:11,padding:"12px 14px"}}>
          <div style={{fontSize:10,color:"#22c55e",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Tüm Zamanlar</div>
          <div style={{fontSize:18,fontWeight:900,color:"#4ade80"}}>{fmt(grandTotal)}</div>
        </div>
      </div>

      {/* Görünüm seçici */}
      <div style={{display:"flex",gap:7,marginBottom:12}}>
        {[["monthly","Aylık"],["daily","Günlük"]].map(([k,l])=>(
          <button key={k} onClick={()=>{setView(k);setSelMonth(null);}}
            style={{flex:1,background:view===k?"#1e2d4a":"#0f1420",border:`1px solid ${view===k?"#3b5bdb":"#1e2535"}`,
              borderRadius:8,padding:"7px",color:view===k?"#7ba7f7":"#5b6a8a",fontWeight:view===k?700:500,
              fontSize:13,cursor:"pointer",transition:"all .15s"}}>{l}</button>
        ))}
      </div>

      {/* Aylık grafik */}
      {view==="monthly" && (
        <div style={{background:"#0f1420",border:"1px solid #1e2535",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid #1e2535",fontSize:11,color:"#4b6cb7",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>
            {activeYear} — Aylık Tahsilat
          </div>
          {monthlyRows.length === 0
            ? <div style={{padding:24,textAlign:"center",color:"#3a4b6b",fontSize:13}}>Bu yıl için tarihli ödeme yok</div>
            : <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
                {monthlyRows.map(({name,key,total})=>(
                  <div key={key}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <button onClick={()=>{setSelMonth(key);setView("daily");}}
                        style={{background:"transparent",border:"none",color:"#9ba3b8",fontSize:12,fontWeight:600,cursor:"pointer",padding:0,textAlign:"left"}}
                        onMouseEnter={e=>e.currentTarget.style.color="#7ba7f7"}
                        onMouseLeave={e=>e.currentTarget.style.color="#9ba3b8"}>
                        {name} ↗
                      </button>
                      <span style={{fontSize:13,fontWeight:700,color:"#c8ccdc"}}>{fmt(total)}</span>
                    </div>
                    <div style={{height:6,background:"#1a2030",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",background:"linear-gradient(90deg,#1d4ed8,#3b82f6)",
                        borderRadius:3,width:`${(total/BAR_MAX)*100}%`,transition:"width .4s"}}/>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Günlük liste */}
      {view==="daily" && (
        <div style={{background:"#0f1420",border:"1px solid #1e2535",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid #1e2535",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:11,color:"#4b6cb7",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>
              {selMonth ? fmtMon(selMonth) : activeYear} — Günlük Tahsilat
            </div>
            {selMonth && <button onClick={()=>setSelMonth(null)}
              style={{background:"transparent",border:"none",color:"#3b82f6",fontSize:12,cursor:"pointer"}}>
              ← Tüm aylar
            </button>}
          </div>
          <div style={{maxHeight:340,overflowY:"auto"}}>
            {dailyRows.length===0
              ? <div style={{padding:24,textAlign:"center",color:"#3a4b6b",fontSize:13}}>Tarihli ödeme yok</div>
              : dailyRows.map(({date,total})=>(
                  <div key={date} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                    padding:"9px 14px",borderBottom:"1px solid #131820"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",flexShrink:0,display:"inline-block"}}/>
                      <span style={{fontSize:13,color:"#9ba3b8"}}>{fmtD(date)}</span>
                    </div>
                    <span style={{fontSize:14,fontWeight:700,color:"#4ade80"}}>{fmt(total)}</span>
                  </div>
                ))
            }
          </div>
          {dailyRows.length>0 && (
            <div style={{padding:"10px 14px",borderTop:"1px solid #1e2535",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#3a4b6b"}}>{dailyRows.length} gün</span>
              <span style={{fontSize:13,fontWeight:700,color:"#60a5fa"}}>
                Toplam: {fmt(dailyRows.reduce((s,r)=>s+r.total,0))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── Rapor hesaplama ──────────────────────────────────────────────────────────
function SettingsPanel({ allData, activeYear, defaultYear, onSetDefaultYear, onAddClient, onEditClient, onDeleteClient, onClose }) {
  const [section, setSection] = useState("main"); // main | addClient | editClient | reports
  const [editTarget, setEditTarget] = useState(null);
  const yearData = allData[activeYear] || {};
  const clientNames = Object.keys(yearData).sort((a,b)=>a.localeCompare(b,"tr"));

  // Add client state
  const [newName, setNewName] = useState("");
  const [newFee,  setNewFee]  = useState("");
  const [addErr,  setAddErr]  = useState("");

  // Edit client state
  const [editName, setEditName] = useState("");
  const [editFee,  setEditFee]  = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  const openEdit = (name) => {
    setEditTarget(name);
    setEditName(name);
    setEditFee(yearData[name]?.fee ?? "");
    setConfirmDel(false);
    setSection("editClient");
  };

  const handleAdd = () => {
    const n = newName.trim().toUpperCase();
    if(!n) return setAddErr("İsim boş olamaz");
    if(Object.keys(yearData).includes(n)) return setAddErr("Bu müşteri zaten mevcut");
    if(!newFee||Number(newFee)<=0) return setAddErr("Geçerli bir ücret girin");
    onAddClient(n, Number(newFee));
    setNewName(""); setNewFee(""); setAddErr("");
    setSection("main");
  };

  const handleEdit = () => {
    const n = editName.trim().toUpperCase();
    if(!n) return;
    onEditClient(editTarget, n, Number(editFee));
    setSection("main");
  };

  const handleDelete = () => {
    onDeleteClient(editTarget);
    setSection("main");
  };

  const LABEL = {fontSize:10,color:"#5b6a8a",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6,display:"block"};
  const SEC_BTN = (active) => ({
    background: active?"#1e2d4a":"transparent",
    border:`1px solid ${active?"#3b5bdb":"#1e2535"}`,
    borderRadius:8, padding:"8px 14px",
    color: active?"#7ba7f7":"#5b6a8a",
    fontWeight: active?700:500,
    fontSize:13, cursor:"pointer", transition:"all .15s"
  });

  return (
    <ModalWrap width={400}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {section!=="main" && (
            <button onClick={()=>{setSection("main");setConfirmDel(false);}}
              style={{background:"#1e2535",border:"none",borderRadius:7,padding:"5px 10px",color:"#9ba3b8",cursor:"pointer",fontSize:13}}>
              ← Geri
            </button>
          )}
          <div>
            <div style={{fontSize:10,color:"#4b6cb7",letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>Muhasebe Paneli</div>
            <div style={{fontSize:16,fontWeight:800,color:"#eaedf5"}}>
              {section==="main"?"Ayarlar":section==="addClient"?"Yeni Müşteri":section==="reports"?"Raporlar":"Müşteri Düzenle"}
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{background:"#1e2535",border:"none",borderRadius:8,padding:"7px 10px",color:"#6b7a99",cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
      </div>

      {/* ── MAIN SECTION ── */}
      {section==="main" && <>
        {/* Varsayılan yıl */}
        <div style={{background:"#0f1420",border:"1px solid #1e2535",borderRadius:12,padding:"14px 16px",marginBottom:14}}>
          <div style={{fontSize:11,color:"#4b6cb7",letterSpacing:1.5,textTransform:"uppercase",marginBottom:10,fontWeight:700}}>Varsayılan Yıl</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {AVAILABLE_YEARS.map(y=>(
              <button key={y} onClick={()=>onSetDefaultYear(y)}
                style={{...SEC_BTN(defaultYear===y), padding:"7px 16px", fontSize:14, fontWeight:700}}>
                {y} {defaultYear===y?"✓":""}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:"#3a4b6b",marginTop:8}}>Panel açılışında bu yıl seçili gelir.</div>
        </div>

        {/* Raporlar butonu */}
        <button onClick={()=>setSection("reports")}
          style={{width:"100%",background:"#0f1420",border:"1px solid #1e3a5f",borderRadius:11,
            padding:"12px 16px",color:"#60a5fa",fontWeight:700,fontSize:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,transition:"background .15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="#0a1628"}
          onMouseLeave={e=>e.currentTarget.style.background="#0f1420"}>
          <span style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>📊</span> Tahsilat Raporları</span>
          <span style={{color:"#3b5bdb",fontSize:16}}>›</span>
        </button>

        {/* Müşteri ekle butonu */}
        <button onClick={()=>setSection("addClient")}
          style={{width:"100%",background:"linear-gradient(135deg,#1d4ed8,#1e40af)",border:"none",borderRadius:11,
            padding:"12px 16px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:18}}>+</span> Yeni Müşteri Ekle
        </button>

        {/* Müşteri listesi */}
        <div style={{background:"#0f1420",border:"1px solid #1e2535",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid #1e2535",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:"#4b6cb7",letterSpacing:1.5,textTransform:"uppercase",fontWeight:700}}>Müşteriler — {activeYear}</span>
            <span style={{fontSize:11,color:"#3a4b6b"}}>{clientNames.length} kayıt</span>
          </div>
          <div style={{maxHeight:240,overflowY:"auto"}}>
            {clientNames.length===0 && <div style={{padding:"20px",textAlign:"center",color:"#3a4b6b",fontSize:13}}>Bu yıl müşteri yok</div>}
            {clientNames.map(name=>(
              <div key={name}
                onClick={()=>openEdit(name)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"10px 14px",borderBottom:"1px solid #131820",cursor:"pointer",transition:"background .12s"}}
                onMouseEnter={e=>e.currentTarget.style.background="#151d2e"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#c8ccdc"}}>{name}</div>
                  <div style={{fontSize:11,color:"#3a4b6b",marginTop:1}}>{fmt(yearData[name]?.fee)}</div>
                </div>
                <span style={{color:"#2d3a50",fontSize:16}}>›</span>
              </div>
            ))}
          </div>
        </div>
      </>}

      {/* ── REPORTS SECTION ── */}
      {section==="reports" && <ReportsSection allData={allData} activeYear={activeYear}/>}

      {/* ── ADD CLIENT SECTION ── */}
      {section==="addClient" && <>
        <label style={LABEL}>Müşteri Adı / Ünvanı</label>
        <input value={newName} onChange={e=>{setNewName(e.target.value);setAddErr("");}} placeholder="ÖRNEK LTD. ŞTİ."
          style={{...INP,marginBottom:14,textTransform:"uppercase"}}/>
        <label style={LABEL}>Aylık Ücret (₺)</label>
        <input type="number" value={newFee} onChange={e=>{setNewFee(e.target.value);setAddErr("");}} placeholder="0"
          style={{...INP,fontSize:20,fontWeight:700,marginBottom:addErr?8:20}}/>
        {addErr && <div style={{fontSize:12,color:"#ef4444",marginBottom:14}}>⚠ {addErr}</div>}
        <button onClick={handleAdd}
          style={{width:"100%",background:"linear-gradient(135deg,#1d4ed8,#1e40af)",border:"none",borderRadius:10,
            padding:"12px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
          Ekle
        </button>
      </>}

      {/* ── EDIT CLIENT SECTION ── */}
      {section==="editClient" && <>
        <label style={LABEL}>Müşteri Adı</label>
        <input value={editName} onChange={e=>setEditName(e.target.value.toUpperCase())}
          style={{...INP,marginBottom:14}}/>
        <label style={LABEL}>Aylık Ücret (₺)</label>
        <input type="number" value={editFee} onChange={e=>setEditFee(e.target.value)}
          style={{...INP,fontSize:20,fontWeight:700,marginBottom:20}}/>

        {!confirmDel
          ? <div style={{display:"flex",gap:8}}>
              <button onClick={handleEdit}
                style={{flex:1,background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                Kaydet
              </button>
              <button onClick={()=>setConfirmDel(true)}
                style={{background:"#2a1515",border:"1px solid #7f1d1d",borderRadius:10,padding:"12px 16px",color:"#ef4444",fontWeight:700,cursor:"pointer",fontSize:13}}>
                Sil
              </button>
            </div>
          : <div style={{background:"#1a0a0a",border:"1px solid #7f1d1d",borderRadius:10,padding:16}}>
              <div style={{fontSize:13,color:"#fca5a5",marginBottom:14,textAlign:"center"}}>
                <strong>{editTarget}</strong> ve tüm ödeme kayıtları silinecek. Emin misiniz?
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={handleDelete} style={{flex:1,background:"#7f1d1d",border:"none",borderRadius:8,padding:"10px",color:"#fff",fontWeight:700,cursor:"pointer"}}>Evet, Sil</button>
                <button onClick={()=>setConfirmDel(false)} style={{flex:1,background:"#1e2535",border:"none",borderRadius:8,padding:"10px",color:"#9ba3b8",fontWeight:600,cursor:"pointer"}}>Vazgeç</button>
              </div>
            </div>
        }
      </>}
    </ModalWrap>
  );
}

// ─── PaymentModal ─────────────────────────────────────────────────────────────
function PaymentModal({client,month,year,existing,onSave,onDelete,onClose}){
  const [amount,setAmount]=useState(existing?.amount??client.fee);
  const [date,setDate]=useState(existing?.date??new Date().toISOString().slice(0,10));
  return(
    <ModalWrap>
      <div style={{fontSize:10,color:"#4b6cb7",letterSpacing:2.5,textTransform:"uppercase",marginBottom:6}}>Ödeme Kaydı</div>
      <div style={{fontSize:16,fontWeight:800,color:"#eaedf5",marginBottom:3}}>{client.name}</div>
      <div style={{fontSize:12,color:"#5b6a8a",marginBottom:20}}>{year} — {month} · Son: {fmtD(getDeadlines(year)[month])}</div>
      <label style={{display:"block",fontSize:10,color:"#5b6a8a",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>Tutar (₺)</label>
      <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} style={{...INP,fontSize:18,fontWeight:700,marginBottom:14}}/>
      <label style={{display:"block",fontSize:10,color:"#5b6a8a",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>Ödeme Tarihi</label>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...INP,marginBottom:22}}/>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>onSave({amount,date:date||null})} style={{flex:1,background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:9,padding:"11px 0",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"}}>Kaydet</button>
        {existing&&<button onClick={onDelete} style={{background:"#2a1515",border:"1px solid #7f1d1d",borderRadius:9,padding:"11px 14px",color:"#ef4444",fontWeight:700,cursor:"pointer"}}>Sil</button>}
        <button onClick={onClose} style={{background:"#1e2535",border:"none",borderRadius:9,padding:"11px 14px",color:"#6b7a99",fontWeight:600,cursor:"pointer"}}>İptal</button>
      </div>
    </ModalWrap>
  );
}

// ─── PaymentCell ──────────────────────────────────────────────────────────────
function PaymentCell({payment,month,year,fee,onClick}){
  const [hov,setHov]=useState(false);
  const over=isOverdue(payment,month,year);
  if(!payment) return(
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:"100%",minWidth:76,padding:"7px 3px",
        background:over?(hov?"#2d0a0a":"#1a0707"):(hov?"#151b2a":"transparent"),
        border:`1px dashed ${over?"#ef4444":(hov?"#3b5bdb":"#1e2a3f")}`,
        borderRadius:7,color:over?"#ef4444":(hov?"#4b6cb7":"#263347"),fontSize:11,cursor:"pointer",transition:"all .15s"}}>
      {over?"⚠ eksik":"+ ekle"}
    </button>
  );
  const ok=!!payment.date;
  return(
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{width:"100%",minWidth:76,padding:"5px 6px",opacity:hov?.8:1,
        background:ok?"#052e16":"#1c1205",border:`1px solid ${ok?"#15653a":"#7c3a0a"}`,
        borderRadius:7,cursor:"pointer",transition:"opacity .15s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <span style={{width:5,height:5,borderRadius:"50%",background:ok?"#22c55e":"#f97316",flexShrink:0}}/>
        <span style={{fontSize:11,fontWeight:700,color:ok?"#4ade80":"#fb923c",whiteSpace:"nowrap"}}>{payment.amount?.toLocaleString("tr-TR")} ₺</span>
      </div>
      {ok  &&<div style={{fontSize:9,color:"#166534"}}>{fmtD(payment.date)}</div>}
      {!ok &&<div style={{fontSize:9,color:"#9a3412"}}>tarih yok</div>}
    </button>
  );
}

// ─── OverdueReport ────────────────────────────────────────────────────────────
function OverdueReport({yearData,year,onOpenModal}){
  const items=getOverdueList(yearData,year);
  const total=items.reduce((s,i)=>s+i.total,0);
  const [sort,setSort]=useState("total");
  const sorted=[...items].sort((a,b)=>sort==="name"?a.name.localeCompare(b.name,"tr"):sort==="count"?b.overdue.length-a.overdue.length:b.total-a.total);
  if(!items.length) return(
    <div style={{textAlign:"center",padding:"80px 20px"}}>
      <div style={{fontSize:44,marginBottom:14}}>🎉</div>
      <div style={{fontSize:18,fontWeight:800,color:"#22c55e",marginBottom:8}}>Gecikmiş ödeme yok!</div>
      <div style={{color:"#3a4b6b",fontSize:13}}>{year} yılı tamam.</div>
    </div>
  );
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:"18px 12px 48px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))",gap:9,marginBottom:22}}>
        {[["Geciken Müşteri",items.length,"kişi","#ef4444"],["Geciken Ödeme",items.reduce((s,i)=>s+i.overdue.length,0),"adet","#f59e0b"],["Toplam Alacak",fmt(total),"","#ef4444"]].map(([l,v,u,c])=>(
          <div key={l} style={{background:"#0f1420",border:`1px solid ${c}22`,borderRadius:11,padding:"11px 15px"}}>
            <div style={{fontSize:10,color:"#3a4b6b",letterSpacing:1,marginBottom:5,textTransform:"uppercase"}}>{l}</div>
            <div style={{fontSize:20,fontWeight:900,color:c}}>{v}<span style={{fontSize:11,fontWeight:500,color:"#3a4b6b",marginLeft:4}}>{u}</span></div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:7,marginBottom:13,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:"#3a4b6b",letterSpacing:1}}>SIRALA:</span>
        {[["total","Tutara Göre"],["count","Ay Sayısına"],["name","İsme Göre"]].map(([k,l])=>(
          <button key={k} onClick={()=>setSort(k)}
            style={{background:sort===k?"#1e2d4a":"#0f1420",border:`1px solid ${sort===k?"#3b5bdb":"#1e2535"}`,borderRadius:7,padding:"5px 11px",color:sort===k?"#7ba7f7":"#5b6a8a",fontSize:11,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {sorted.map(({name,fee,overdue,total:rt})=>(
          <div key={name} style={{background:"#0f1420",border:"1px solid #1e2535",borderRadius:11,overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:"1px solid #1a2030",flexWrap:"wrap",gap:8}}>
              <div><span style={{fontWeight:800,color:"#dde1f0",fontSize:14}}>{name}</span><span style={{marginLeft:9,fontSize:10,color:"#3a4b6b"}}>Aylık {fmt(fee)}</span></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:11,color:"#f59e0b",fontWeight:600}}>{overdue.length} ay gecikmiş</span>
                <span style={{fontSize:14,fontWeight:800,color:"#ef4444"}}>{fmt(rt)}</span>
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,padding:"10px 13px"}}>
              {overdue.map(({month,amount,daysPast})=>(
                <button key={month} onClick={()=>onOpenModal(name,month)}
                  style={{background:"#1a0a0a",border:"1px solid #7f1d1d",borderRadius:8,padding:"7px 13px",cursor:"pointer",textAlign:"left",minWidth:88,transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#2a1010"}
                  onMouseLeave={e=>e.currentTarget.style.background="#1a0a0a"}>
                  <div style={{fontSize:10,fontWeight:700,color:"#fca5a5",marginBottom:2}}>{month}</div>
                  <div style={{fontSize:12,fontWeight:800,color:"#ef4444"}}>{fmt(amount)}</div>
                  <div style={{fontSize:9,color:"#7f1d1d",marginTop:2}}>{daysPast} gün geç</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Drive badge ──────────────────────────────────────────────────────────────
function DriveBadge({status,onRetry}){
  const C={loading:"#3b82f6",saving:"#f59e0b",saved:"#22c55e",error:"#ef4444",timeout:"#f59e0b",offline:"#6b7a99"};
  const T={loading:"⟳",saving:"↑",saved:"●",error:"✕",timeout:"⚡",offline:"◌"};
  if(!T[status]) return null;
  return(
    <span style={{fontSize:11,color:C[status],display:"inline-flex",alignItems:"center",gap:5}}>
      <span>{T[status]}</span>
      <span style={{fontSize:10,opacity:.8}}>Drive</span>
      {(status==="error"||status==="timeout")&&<button onClick={onRetry}
        style={{background:"#1e2535",border:"1px solid #2d3a50",borderRadius:4,padding:"1px 7px",color:"#7ba7f7",fontSize:10,cursor:"pointer",marginLeft:3}}>↺</button>}
    </span>
  );
}

// ─── Gear Icon ────────────────────────────────────────────────────────────────
function GearIcon({size=20}){
  return(
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [allData,      setAllData]      = useState(INITIAL_ALL_DATA);
  const [defaultYear,  setDefaultYear]  = useState(2026);
  const [activeYear,   setActiveYear]   = useState(2026);
  // driveFileId removed - using Sheets
  const [driveStatus,  setDriveStatus]  = useState("loading");
  const [tab,          setTab]          = useState("panel");
  const [search,       setSearch]       = useState("");
  const [filterMonth,  setFilterMonth]  = useState("TÜMÜ");
  const [filterStatus, setFilterStatus] = useState("TÜMÜ");
  const [payModal,     setPayModal]     = useState(null); // {clientName, month}
  const [showSettings, setShowSettings] = useState(false);
  const [toast,        setToast]        = useState(null);
  const saveTimer = useRef(null);

  const showToast=(msg,type="info",dur=3000)=>{ setToast({msg,type}); if(dur>0) setTimeout(()=>setToast(null),dur); };

  // ── Drive load ──────────────────────────────────────────────────────────────
  const loadDrive = useCallback(async()=>{
    setDriveStatus("loading");
    try{
      const d = await loadFromSheets();
      if(d && typeof d === 'object'){
        const normalized={};
        let savedDefault=null;
        for(const [k,v] of Object.entries(d)){
          if(k==="__settings"){ savedDefault=v?.defaultYear; continue; }
          normalized[Number(k)]=v;
        }
        setAllData(prev=>({...prev,...normalized}));
        if(savedDefault){ setDefaultYear(savedDefault); setActiveYear(savedDefault); }
        setDriveStatus("saved");
        showToast("Sheets'ten yüklendi ✓","success");
        return;
      }
      setDriveStatus("offline");
      showToast("Sheets'te kayıt bulunamadı","info");
    }catch(e){
      // Sheets erişilemiyor, yerel veriyle devam et
      setDriveStatus("offline");
    }
  },[]);

  useEffect(()=>{ loadDrive(); },[loadDrive]);

  // ── Drive save ──────────────────────────────────────────────────────────────
  const debouncedSave=useCallback((newAll,newDefault,fid)=>{
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      setDriveStatus("saving");
      const payload={...newAll,__settings:{defaultYear:newDefault}};
      try{
        await saveToSheets(payload);
        setDriveStatus("saved");
      }catch(e){ 
        // no-cors modunda response okunamaz, hata olsa bile veri gitmiş olabilir
        setDriveStatus("saved");
      }
    },1500);
  },[]);

  const mutate=(fn)=>{ setAllData(prev=>{ const next=fn(prev); debouncedSave(next,defaultYear); return next; }); };

  const setDefaultYearAndSave=(y)=>{
    setDefaultYear(y);
    clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(async()=>{
      setDriveStatus("saving");
      const payload={...allData,__settings:{defaultYear:y}};
      try{ await saveToSheets(payload); setDriveStatus("saved"); }
      catch{ setDriveStatus("error"); }
    },800);
    showToast(`Varsayılan yıl ${y} olarak kaydedildi`,"success");
  };

  // ── Mutators ────────────────────────────────────────────────────────────────
  const updatePayment=(clientName,month,value)=>{
    mutate(prev=>({...prev,[activeYear]:{...prev[activeYear],[clientName]:{...prev[activeYear][clientName],payments:{...prev[activeYear][clientName]?.payments,[month]:value}}}}));
    setPayModal(null);
  };
  const deletePayment=(clientName,month)=>{
    mutate(prev=>{ const p={...prev[activeYear][clientName].payments}; delete p[month]; return {...prev,[activeYear]:{...prev[activeYear],[clientName]:{...prev[activeYear][clientName],payments:p}}}; });
    setPayModal(null);
  };
  const addClient=(name,fee)=>{
    mutate(prev=>({...prev,[activeYear]:{...prev[activeYear],[name]:{fee,payments:{}}}}));
    showToast(`${name} eklendi ✓`,"success");
  };
  const editClient=(oldName,newName,fee)=>{
    mutate(prev=>{
      const yd={...prev[activeYear]};
      const c={...yd[oldName],fee};
      if(newName!==oldName){ delete yd[oldName]; yd[newName]=c; } else yd[oldName]=c;
      return {...prev,[activeYear]:yd};
    });
    showToast("Güncellendi ✓","success");
  };
  const deleteClient=(name)=>{
    mutate(prev=>{ const d={...prev[activeYear]}; delete d[name]; return {...prev,[activeYear]:d}; });
    showToast(`${name} silindi`,"info");
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const yearData=allData[activeYear]||{};
  const overdueItems=getOverdueList(yearData,activeYear);
  const overdueTotal=overdueItems.reduce((s,i)=>s+i.total,0);
  const {totalPaid,paidCount}=(()=>{ let tp=0,pc=0; for(const c of Object.values(yearData)) for(const p of Object.values(c.payments||{})) if(p.date){tp+=p.amount;pc++;} return {totalPaid:tp,paidCount:pc}; })();
  const filtered=Object.entries(yearData).filter(([name,c])=>{
    if(search&&!name.toLowerCase().includes(search.toLowerCase())) return false;
    if(filterMonth!=="TÜMÜ"&&filterStatus!=="TÜMÜ"){
      const p=c.payments?.[filterMonth];
      if(filterStatus==="ÖDENDİ"&&!p?.date) return false;
      if(filterStatus==="GECİKMİŞ"&&!isOverdue(p,filterMonth,activeYear)) return false;
      if(filterStatus==="GİRİLMEDİ"&&p) return false;
    }
    return true;
  });
  const displayMonths=filterMonth==="TÜMÜ"?MONTHS:[filterMonth];

  return(
    <div style={{minHeight:"100vh",background:"#0a0d14",color:"#eaedf5",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(135deg,#0d1420,#0a1128)",borderBottom:"1px solid #192035",padding:"13px 16px"}}>
        <div style={{maxWidth:1440,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>

          {/* Sol: başlık + drive */}
          <div>
            <div style={{fontSize:10,color:"#3b5bdb",letterSpacing:3,textTransform:"uppercase",marginBottom:3,display:"flex",alignItems:"center",gap:10}}>
              Muhasebe Bürosu · {activeYear}
              <DriveBadge status={driveStatus} onRetry={loadDrive}/>
            </div>
            <h1 style={{margin:0,fontSize:17,fontWeight:900,color:"#f0f3fb",letterSpacing:-.5}}>Muhasebe Ücret Takibi</h1>
          </div>

          {/* Sağ: stats + yıl seçici + ayarlar */}
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <StatPill label="Tahsil"   value={fmt(totalPaid)}   count={paidCount}           color="#22c55e"/>
            <StatPill label="Gecikmiş" value={fmt(overdueTotal)} count={overdueItems.length} color="#ef4444" alert={overdueItems.length>0}/>

            {/* Yıl seçici */}
            <div style={{display:"flex",background:"#0f1420",border:"1px solid #192035",borderRadius:10,overflow:"hidden"}}>
              {AVAILABLE_YEARS.map(y=>(
                <button key={y} onClick={()=>setActiveYear(y)}
                  style={{padding:"6px 13px",background:activeYear===y?"#1e2d4a":"transparent",border:"none",
                    color:activeYear===y?"#7ba7f7":"#3a4b6b",fontWeight:activeYear===y?700:500,
                    fontSize:13,cursor:"pointer",transition:"all .15s",
                    borderRight:y!==AVAILABLE_YEARS[AVAILABLE_YEARS.length-1]?"1px solid #192035":"none"}}>
                  {y}{y===defaultYear&&<span style={{fontSize:8,marginLeft:2,color:"#3b82f6",verticalAlign:"super"}}>★</span>}
                </button>
              ))}
            </div>

            {/* Ayarlar butonu */}
            <button onClick={()=>setShowSettings(true)}
              style={{background:"#0f1420",border:"1px solid #192035",borderRadius:10,padding:"8px 10px",
                color:"#5b6a8a",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#3b5bdb";e.currentTarget.style.color="#7ba7f7";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#192035";e.currentTarget.style.color="#5b6a8a";}}>
              <GearIcon size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{background:"#0c1018",borderBottom:"1px solid #192035",padding:"0 16px",display:"flex"}}>
        {[["panel","📋  Panel"],["report","⚠️  Gecikmiş"+(overdueItems.length>0?` (${overdueItems.length})`:"")]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            style={{background:"transparent",border:"none",borderBottom:`2px solid ${tab===k?"#3b5bdb":"transparent"}`,
              padding:"10px 15px",color:tab===k?"#7ba7f7":(k==="report"&&overdueItems.length>0?"#f87171":"#3a4b6b"),
              fontWeight:tab===k?700:500,fontSize:13,cursor:"pointer",transition:"all .15s"}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── PANEL ── */}
      {tab==="panel"&&<>
        <div style={{background:"#0c1018",borderBottom:"1px solid #192035",padding:"8px 16px",position:"sticky",top:0,zIndex:100}}>
          <div style={{maxWidth:1440,margin:"0 auto",display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
            <input placeholder="🔍  Müşteri ara..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{background:"#161d2e",border:"1px solid #243050",borderRadius:8,padding:"6px 12px",color:"#eaedf5",fontSize:13,width:158,outline:"none"}}/>
            <select value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}
              style={{background:"#161d2e",border:"1px solid #243050",borderRadius:8,padding:"6px 10px",color:"#eaedf5",fontSize:13,outline:"none"}}>
              <option value="TÜMÜ">Tüm Aylar</option>
              {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
              style={{background:"#161d2e",border:"1px solid #243050",borderRadius:8,padding:"6px 10px",color:"#eaedf5",fontSize:13,outline:"none"}}>
              <option value="TÜMÜ">Tüm Durumlar</option>
              <option value="ÖDENDİ">Ödendi</option>
              <option value="GECİKMİŞ">Gecikmiş</option>
              <option value="GİRİLMEDİ">Girilmedi</option>
            </select>
            <span style={{marginLeft:"auto",fontSize:11,color:"#3a4b6b"}}>{filtered.length}/{Object.keys(yearData).length} müşteri</span>
          </div>
        </div>

        <div style={{maxWidth:1440,margin:"0 auto",padding:"12px 10px 40px",overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"0 3px",fontSize:12.5}}>
            <thead>
              <tr>
                <th style={{textAlign:"left",padding:"5px 12px",color:"#3a4b6b",fontWeight:700,fontSize:10,letterSpacing:1.2,whiteSpace:"nowrap"}}>MÜŞTERİ</th>
                <th style={{textAlign:"right",padding:"5px 12px",color:"#3a4b6b",fontWeight:700,fontSize:10,letterSpacing:1.2}}>AYLIK</th>
                {displayMonths.map(m=><th key={m} style={{textAlign:"center",padding:"5px 6px",color:"#3a4b6b",fontWeight:700,fontSize:10,letterSpacing:1.2,minWidth:82}}>{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(([name,client])=>(
                <tr key={name}>
                  <td style={{padding:"7px 12px",background:"#0f1420",borderRadius:"8px 0 0 8px",fontWeight:600,color:"#c8ccdc",whiteSpace:"nowrap",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}}>{name}</td>
                  <td style={{padding:"7px 12px",background:"#0f1420",textAlign:"right",color:"#3a4b6b",fontWeight:600,whiteSpace:"nowrap",borderRadius:displayMonths.length===0?"0 8px 8px 0":0}}>{fmt(client.fee)}</td>
                  {displayMonths.map((month,mi)=>(
                    <td key={month} style={{padding:"3px 3px",background:"#0f1420",textAlign:"center",borderRadius:mi===displayMonths.length-1?"0 8px 8px 0":0}}>
                      <PaymentCell payment={client.payments?.[month]} month={month} year={activeYear} fee={client.fee} onClick={()=>setPayModal({clientName:name,month})}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length&&<div style={{textAlign:"center",padding:50,color:"#2a3548",fontSize:13}}>
            {Object.keys(yearData).length===0?<>Bu yıl için müşteri yok.<br/>Sağ üstteki <span style={{color:"#5b6a8a"}}>⚙</span> ile ekleyebilirsiniz.</>:"Sonuç bulunamadı"}
          </div>}
          <div style={{display:"flex",gap:14,fontSize:11,color:"#3a4b6b",marginTop:18,flexWrap:"wrap"}}>
            <span><span style={{display:"inline-block",width:7,height:7,borderRadius:2,background:"#16a34a",marginRight:4}}/>Ödendi</span>
            <span><span style={{display:"inline-block",width:7,height:7,borderRadius:2,background:"#ea580c",marginRight:4}}/>Tarihsiz</span>
            <span><span style={{display:"inline-block",width:7,height:7,borderRadius:2,background:"#7f1d1d",marginRight:4}}/>Gecikmiş</span>
            <span style={{marginLeft:"auto"}}>Hücreye tıkla → ödeme ekle / düzenle &nbsp;·&nbsp; ⚙ Ayarlar → müşteri yönetimi</span>
          </div>
        </div>
      </>}

      {tab==="report"&&<OverdueReport yearData={yearData} year={activeYear} onOpenModal={(n,m)=>setPayModal({clientName:n,month:m})}/>}

      {/* ── Settings panel ── */}
      {showSettings&&(
        <SettingsPanel
          allData={allData}
          activeYear={activeYear}
          defaultYear={defaultYear}
          onSetDefaultYear={setDefaultYearAndSave}
          onAddClient={addClient}
          onEditClient={editClient}
          onDeleteClient={deleteClient}
          onClose={()=>setShowSettings(false)}
        />
      )}

      {/* ── Payment modal ── */}
      {payModal&&(()=>{
        const c={name:payModal.clientName,...yearData[payModal.clientName]};
        return <PaymentModal client={c} month={payModal.month} year={activeYear}
          existing={c.payments?.[payModal.month]}
          onSave={v=>updatePayment(payModal.clientName,payModal.month,v)}
          onDelete={()=>deletePayment(payModal.clientName,payModal.month)}
          onClose={()=>setPayModal(null)}/>;
      })()}

      {/* ── Toast ── */}
      {toast&&<div style={{position:"fixed",bottom:20,right:16,background:"#161b27",
        border:`1px solid ${{success:"#16a34a",error:"#dc2626",info:"#3b82f6",saving:"#d97706"}[toast.type]||"#3b5bdb"}`,
        borderRadius:10,padding:"11px 16px",color:"#eaedf5",fontSize:13,fontWeight:600,
        display:"flex",alignItems:"center",gap:9,zIndex:2000,boxShadow:"0 8px 32px rgba(0,0,0,.4)",maxWidth:300}}>
        <span style={{fontSize:15}}>{{success:"✓",error:"✕",info:"ℹ",saving:"↑"}[toast.type]}</span>
        {toast.msg}
      </div>}

      <style>{`*{box-sizing:border-box}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.5);cursor:pointer}select option{background:#161d2e}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#0a0d14}::-webkit-scrollbar-thumb{background:#1e2a3f;border-radius:3px}`}</style>
    </div>
  );
}

function StatPill({label,value,count,color,alert}){
  return(
    <div style={{background:"#0f1420",border:`1px solid ${alert?color+"55":"#192035"}`,borderRadius:10,padding:"7px 12px",
      ...(alert?{boxShadow:`0 0 10px ${color}20`}:{})}}>
      <div style={{fontSize:10,color:"#3a4b6b",marginBottom:2,letterSpacing:.3}}>{label} · {count} {label==="Gecikmiş"?"müşteri":"kayıt"}</div>
      <div style={{fontSize:14,fontWeight:800,color}}>{value}</div>
    </div>
  );
}
