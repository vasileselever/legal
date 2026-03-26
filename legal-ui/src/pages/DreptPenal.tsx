export function DreptPenal() {
  const services = [
    { icon: "\u{1F6E1}\uFE0F", title: "Ap?rare Penal?", desc: "Reprezentare ?i ap?rare în toate fazele procesului penal: urm?rire penala, camer? preliminar?, judecat? ?i c?ile de atac." },
    { icon: "\u{1F465}", title: "Asisten?? la Audieri", desc: "Asisten?? juridic? la audierile din fa?a organelor de poli?ie, parchet sau instan??. Protej?m drepturile clien?ilor no?tri." },
    { icon: "\u{1F4B0}", title: "Infrac?iuni Economice", desc: "Ap?rare în dosare de evaziune fiscal?, fraud?, delapidare, sp?lare de bani ?i alte infrac?iuni economice." },
    { icon: "\u{1F4BB}", title: "Criminalitate Informatic?", desc: "Consultan?? ?i ap?rare în cazuri de fraud? informatic?, acces neautorizat la sisteme ?i alte infrac?iuni cibernetice." },
    { icon: "\u{1F697}", title: "Infrac?iuni Rutiere", desc: "Ap?rare în dosare de conducere sub influen?a alcoolului, p?r?sirea locului accidentului ?i alte infrac?iuni rutiere." },
    { icon: "\u{1F464}", title: "Infrac?iuni contra Persoanei", desc: "Reprezentare în dosare de loviri, v?t?m?ri corporale, amenin?are, ?antaj ?i alte infrac?iuni împotriva persoanei." },
    { icon: "\u{1F512}", title: "Infrac?iuni contra Patrimoniului", desc: "Ap?rare în dosare de furt, tâlh?rie, în?el?ciune, distrugere ?i alte infrac?iuni contra patrimoniului." },
    { icon: "\u{1F4D1}", title: "Constituire Parte Civil?", desc: "Asist?m victimele infrac?iunilor în constituirea ca parte civil? ?i ob?inerea de desp?gubiri în procesul penal." },
  ];
  const stats = [["15+","Ani Experien??"],["400+","Dosare Penale"],["92%","Achit?ri/Reduceri"],["24/7","Disponibil"]];
  const steps = [
    ["1","#c62828","Consulta?ie Urgent?","Contacta?i-ne imediat. În materie penal?, asisten?a juridic? prompt? este esen?ial?."],
    ["2","#d32f2f","Analiza Dosarului","Studiem cu aten?ie toate probele, declara?iile ?i actele din dosar pentru a construi cea mai bun? ap?rare."],
    ["3","#e53935","Strategie de Ap?rare","Elabor?m o strategie de ap?rare personalizat? bazat? pe circumstan?ele specifice ale cazului."],
    ["4","#ef5350","Reprezentare în Instan??","V? reprezent?m cu profesionalism în fa?a tuturor organelor judiciare pân? la solu?ionarea definitiv?."],
  ];
  const rights = [
    "Dreptul de a fi informat despre acuza?ii",
    "Dreptul la t?cere ?i neautoacuzare",
    "Dreptul la un avocat ales sau din oficiu",
    "Dreptul de a consulta dosarul",
    "Dreptul la un interpret autorizat",
    "Dreptul la un proces echitabil",
    "Dreptul de a propune probe în ap?rare",
    "Dreptul de a exercita c?ile de atac",
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#b71c1c,#d32f2f)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u2696\uFE0F"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Penal</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Ap?rare penal? profesionist?. Protej?m drepturile dumneavoastr? în orice situa?ie.</p>
      </div>

      <div style={{background:"#fff3e0",border:"2px solid #f57c00",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>{"\u{1F6A8}"}</div>
        <div>
          <h3 style={{color:"#e65100",margin:"0 0 0.5rem"}}>Re?inere sau Arest? Suna?i Imediat!</h3>
          <p style={{color:"#bf360c",margin:0}}>În caz de re?inere, arest preventiv sau audiere, ave?i dreptul la un avocat înainte de orice declara?ie. Nu face?i nicio declara?ie f?r? avocat prezent.</p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #c62828"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#c62828",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>Rezultatele Noastre</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem"}}>
          {stats.map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"1.5rem",background:"#ffebee",borderRadius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#c62828"}}>{s[0]}</div><div style={{color:"#666",marginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Drepturile Dumneavoastr?</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0.75rem"}}>
          {rights.map((r,i)=>(<div key={i} style={{padding:"0.75rem 1rem",background:"#ffebee",borderRadius:"6px",color:"#c62828",fontWeight:500,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem"}}><span style={{fontWeight:"bold"}}>{"\u2714\uFE0F"}</span>{r}</div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Procesul de Ap?rare</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#fff5f5",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"#b71c1c",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Ave?i Nevoie de Ap?rare Penal??</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Nu a?tepta?i! În materie penal?, fiecare or? conteaz?. Contacta?i-ne acum!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#b71c1c",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Contacta?i-ne Acum</a>
      </div>
    </div>
  );
}
