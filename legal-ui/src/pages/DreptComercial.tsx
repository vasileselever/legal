
export function DreptComercial() {
  const services = [
    { icon: "??", title: "Infiintare Societati", desc: "Asistenta completa la infiintarea SRL, SA, PFA si altor forme juridice. Redactarea actelor constitutive si inregistrarea la ONRC." },
    { icon: "??", title: "Contracte Comerciale", desc: "Redactare si negociere contracte de distributie, franciza, agentie, furnizare de servicii si parteneriat comercial." },
    { icon: "??", title: "Fuziuni si Achizitii", desc: "Consultanta juridica in tranzactii M&A, due diligence, negociere si structurare tranzactii de vanzare-cumparare de actiuni sau active." },
    { icon: "??", title: "Litigii Comerciale", desc: "Reprezentare in litigii intre profesionisti, contestatii facturi, litigii contractuale si recuperare creante comerciale." },
    { icon: "???", title: "Protectia Brandului", desc: "Inregistrare marci comerciale, protectia drepturilor de proprietate intelectuala si combaterea concurentei neloiale." },
    { icon: "??", title: "Guvernanta Corporativa", desc: "Consultanta privind structurile de conducere, regulamente interne, hotarari AGA si CA, si conformitate corporativa." },
    { icon: "??", title: "Insolventa", desc: "Reprezentare in proceduri de insolventa, reorganizare judiciara si faliment, atat pentru creditori cat si pentru debitori." },
    { icon: "??", title: "Drept Comercial International", desc: "Consultanta in contracte internationale, arbitraj comercial international si conformitate cu reglementarile UE." },
  ];
  const stats = [["15+","Ani Experienta"],["300+","Companii Asistate"],["50+","Tranzactii M&A"],["24h","Timp Raspuns"]];
  const steps = [
    ["1","#1565c0","Analiza Business","Intelegem structura afacerii si identificam riscurile juridice specifice domeniului dumneavoastra."],
    ["2","#1976d2","Strategie Juridica","Propunem solutii juridice adaptate obiectivelor comerciale ale companiei."],
    ["3","#42a5f5","Implementare","Redactam documentele necesare si reprezentam compania in negociari sau in fata autoritatilor."],
    ["4","#4caf50","Monitorizare","Asiguram conformitatea juridica continua si va informam despre modificarile legislative relevante."],
  ];
  const sectors = ["Retail si E-commerce","IT si Tehnologie","Constructii si Imobiliare","Productie si Industrie","Servicii Financiare","Sanatate si Farmacie","HoReCa","Transport si Logistica"];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#1565c0,#1976d2)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>??</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Comercial</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Consultanta juridica specializata pentru companii, antenprenori si investitori</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #1565c0"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#1565c0",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>Rezultatele Noastre</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem"}}>
          {stats.map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"1.5rem",background:"#f5f5f5",borderRadius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#1565c0"}}>{s[0]}</div><div style={{color:"#666",marginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Sectoare de Activitate</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0.75rem"}}>
          {sectors.map((s,i)=>(<div key={i} style={{padding:"0.75rem 1rem",background:"#e3f2fd",borderRadius:"6px",color:"#1565c0",fontWeight:500,fontSize:"0.95rem",display:"flex",alignItems:"center",gap:"0.5rem"}}><span>?</span>{s}</div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Cum Lucram</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#f9f9f9",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"#1565c0",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Aveti Nevoie de Consultanta Juridica pentru Afacerea Dvs.?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Contactati-ne astazi. Prima consultatie este gratuita!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#1565c0",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consultatie Gratuita</a>
      </div>
    </div>
  );
}
