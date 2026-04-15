export function DreptulMuncii() {
  const services = [
    { icon: "\u{1F4DD}", title: "Contracte de Munca", desc: "Redactare, revizuire si negociere contracte individuale de munca, acte aditionale si regulamente interne." },
    { icon: "\u{1F6AB}", title: "Contestatie Concediere", desc: "Contestarea concedierilor nelegale sau abuzive. Reintegrare in munca si obtinerea de despagubiri." },
    { icon: "\u{1F4B0}", title: "Recuperare Salarii", desc: "Actiuni pentru recuperarea salariilor neplatite, a sporurilor, a orelor suplimentare si a altor drepturi banesti." },
    { icon: "\u{2696}\uFE0F", title: "Litigii de Munca", desc: "Reprezentare in conflicte de munca, greve, negocieri colective si arbitraj in relatiile de munca." },
    { icon: "\u{1F6E1}\uFE0F", title: "Protectia Angajatilor", desc: "Asistenta in cazuri de discriminare, hartuire la locul de munca, modificarea unilaterala a contractului." },
    { icon: "\u{1F4CB}", title: "Consultanta Angajatori", desc: "Consultanta pentru angajatori: regulamente interne, proceduri disciplinare, restructurari si concedieri colective." },
    { icon: "\u{1F3E5}", title: "Sanatate si Securitate", desc: "Conformitate cu normele de sanatate si securitate in munca. Reprezentare in cazuri de accidente de munca si boli profesionale." },
    { icon: "\u{1F30D}", title: "Detasare si Mobilitate", desc: "Asistenta juridica pentru detasare transnationala, mobilitate internationala si contracte de munca in strainatate." },
  ];
  const stats = [["15+","Ani Experienta"],["350+","Dosare Munca"],["93%","Rata Succes"],["72h","Timp Raspuns"]];
  const steps = [
    ["1","#e65100","Analiza Situatiei","Analizam contractul de munca, actele aditionale si istoricul relatiei de munca pentru a identifica drepturile si optiunile disponibile."],
    ["2","#f57c00","Strategie Juridica","Stabilim impreuna cea mai buna abordare: negociere, mediere sau actiune in instanta."],
    ["3","#fb8c00","Negociere sau Litigiu","Incercam rezolvarea amiabila prin negociere directa cu angajatorul. In caz contrar, declantam procedura judiciara."],
    ["4","#ffa726","Obtinere Drepturi","Va reprezentam pana la obtinerea drepturilor salariale, a despagubirilor sau a reintegrarii in munca."],
  ];
  const rights = [
    "Dreptul la salariu minim garantat",
    "Dreptul la concediu de odihna platit",
    "Dreptul la ore suplimentare platite",
    "Protectia impotriva concedierii abuzive",
    "Dreptul la preaviz de concediere",
    "Protectia impotriva discriminarii",
    "Dreptul la indemnizatie de somaj",
    "Dreptul la conditii sigure de munca",
    "Dreptul la pauze si repaus saptamanal",
    "Protectia maternitate si paternitate",
  ];
  const faqs = [
    { q: "Pot fi concediat fara motiv?", a: "Nu. Orice concediere trebuie sa fie motivata si sa respecte procedura legala: preaviz, decizie scrisa, motivare. O concediere fara motiv sau nemotivata corespunzator poate fi contestata in instanta." },
    { q: "Cat timp am sa contest o concediere?", a: "Termenul de contestare a deciziei de concediere este de 30 de zile calendaristice de la data comunicarii deciziei. Este esential sa actionati rapid." },
    { q: "Ce pot obtine daca castig procesul?", a: "Puteti obtine reintegrarea pe post si plata tuturor drepturilor salariale de la data concedierii pana la reintegrare, sau compensatii echivalente daca nu doriti reintegrarea." },
    { q: "Angajatorul imi poate reduce salariul unilateral?", a: "Nu. Modificarea salariului necesita acordul dumneavoastra printr-un act aditional la contractul de munca. Orice reducere unilaterala este ilegala si poate fi contestata." },
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#bf360c,#e64a19)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u{1F4BC}"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Dreptul Muncii</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Protejam drepturile angajatilor si asistam angajatorii in toate aspectele relatiilor de munca</p>
      </div>

      <div style={{background:"#fff8e1",border:"2px solid #f9a825",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>{"\u26A0\uFE0F"}</div>
        <div>
          <h3 style={{color:"#e65100",margin:"0 0 0.5rem"}}>Atentie: Termen de 30 de Zile!</h3>
          <p style={{color:"#bf360c",margin:0}}>Contestatia concedierii trebuie depusa in <strong>30 de zile</strong> de la primirea deciziei. Nu lasati sa expire termenul legal. Contactati-ne imediat!</p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #e64a19"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#e64a19",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>Rezultatele Noastre</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem"}}>
          {stats.map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"1.5rem",background:"#fff3e0",borderRadius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#e64a19"}}>{s[0]}</div><div style={{color:"#666",marginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Drepturile Dumneavoastra ca Angajat</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"0.75rem"}}>
          {rights.map((r,i)=>(<div key={i} style={{padding:"0.75rem 1rem",background:"#fff3e0",borderRadius:"6px",color:"#e64a19",fontWeight:500,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem"}}><span style={{fontWeight:"bold"}}>{"\u2714\uFE0F"}</span>{r}</div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Procesul Nostru</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#fff8f5",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem"}}>Intrebari Frecvente</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {faqs.map((faq,i)=>(<div key={i} style={{padding:"1.25rem",background:"#f9f9f9",borderRadius:"8px",borderLeft:"4px solid #e64a19"}}><h4 style={{color:"#e64a19",margin:"0 0 0.5rem"}}>{"\u{1F4AC}"} {faq.q}</h4><p style={{color:"#555",margin:0,lineHeight:1.6}}>{faq.a}</p></div>))}
        </div>
      </div>

      <div style={{background:"#bf360c",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Aveti Probleme la Locul de Munca?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Nu acceptati nedreptatea. Cunoasteti-va drepturile si luptati pentru ele. Prima consultatie este gratuita!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#bf360c",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consultatie Gratuita</a>
      </div>
    </div>
  );
}
