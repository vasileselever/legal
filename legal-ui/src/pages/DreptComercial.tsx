export function DreptComercial() {
  const services = [
    { icon: "\u{1F3E2}", title: "Înfiin?are Societ??i", desc: "Asisten?? complet? la înfiin?area SRL, SA, PFA ?i altor forme juridice. Redactarea actelor constitutive ?i înregistrarea la ONRC." },
    { icon: "\u{1F4DD}", title: "Contracte Comerciale", desc: "Redactare ?i negociere contracte de distribu?ie, franciz?, agen?ie, furnizare de servicii ?i parteneriat comercial." },
    { icon: "\u{1F91D}", title: "Fuziuni ?i Achizi?ii", desc: "Consultan?? juridic? în tranzac?ii M&A, due diligence, negociere ?i structurare tranzac?ii de vânzare-cump?rare de ac?iuni sau active." },
    { icon: "\u{2696}\uFE0F", title: "Litigii Comerciale", desc: "Reprezentare în litigii între profesioni?ti, contesta?ii facturi, litigii contractuale ?i recuperare crean?e comerciale." },
    { icon: "\u{1F6E1}\uFE0F", title: "Protec?ia Brandului", desc: "Înregistrare m?rci comerciale, protec?ia drepturilor de proprietate intelectual? ?i combaterea concuren?ei neloiale." },
    { icon: "\u{1F4CB}", title: "Guvernan?? Corporativ?", desc: "Consultan?? privind structurile de conducere, regulamente interne, hot?râri AGA ?i CA, ?i conformitate corporativ?." },
    { icon: "\u{1F4C9}", title: "Insolven??", desc: "Reprezentare în proceduri de insolven??, reorganizare judiciar? ?i faliment, atât pentru creditori cât ?i pentru debitori." },
    { icon: "\u{1F30D}", title: "Drept Comercial Interna?ional", desc: "Consultan?? în contracte interna?ionale, arbitraj comercial interna?ional ?i conformitate cu reglement?rile UE." },
  ];
  const stats = [["15+","Ani Experien??"],["300+","Companii Asistate"],["50+","Tranzac?ii M&A"],["24h","Timp R?spuns"]];
  const steps = [
    ["1","#1565c0","Analiz? Business","În?elegem structura afacerii ?i identific?m riscurile juridice specifice domeniului dumneavoastr?."],
    ["2","#1976d2","Strategie Juridic?","Propunem solu?ii juridice adaptate obiectivelor comerciale ale companiei."],
    ["3","#42a5f5","Implementare","Redact?m documentele necesare ?i reprezent?m compania în negocieri sau în fa?a autorit??ilor."],
    ["4","#4caf50","Monitorizare","Asigur?m conformitatea juridic? continu? ?i v? inform?m despre modific?rile legislative relevante."],
  ];
  const sectors = ["Retail ?i E-commerce","IT ?i Tehnologie","Construc?ii ?i Imobiliare","Produc?ie ?i Industrie","Servicii Financiare","S?n?tate ?i Farmacie","HoReCa","Transport ?i Logistic?"];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#1565c0,#1976d2)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u{1F3E2}"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Comercial</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Consultan?? juridic? specializat? pentru companii, antreprenori ?i investitori</p>
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
          {sectors.map((s,i)=>(<div key={i} style={{padding:"0.75rem 1rem",background:"#e3f2fd",borderRadius:"6px",color:"#1565c0",fontWeight:500,fontSize:"0.95rem",display:"flex",alignItems:"center",gap:"0.5rem"}}><span>{"\u2714\uFE0F"}</span>{s}</div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Cum Lucr?m</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#f9f9f9",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"#1565c0",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Ave?i Nevoie de Consultan?? Juridic? pentru Afacerea Dvs.?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Contacta?i-ne ast?zi. Prima consulta?ie este gratuit?!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#1565c0",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consulta?ie Gratuit?</a>
      </div>
    </div>
  );
}
