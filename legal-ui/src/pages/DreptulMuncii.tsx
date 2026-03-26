export function DreptulMuncii() {
  const services = [
    { icon: "\u{1F4DD}", title: "Contracte de Munc?", desc: "Redactare, revizuire ?i negociere contracte individuale de munc?, acte adi?ionale ?i regulamente interne." },
    { icon: "\u{1F6AB}", title: "Contesta?ie Concediere", desc: "Contestarea concedierilor nelegale sau abuzive. Reintegrare în munc? ?i ob?inerea de desp?gubiri." },
    { icon: "\u{1F4B0}", title: "Recuperare Salarii", desc: "Ac?iuni pentru recuperarea salariilor nepl?tite, a sporurilor, a orelor suplimentare ?i a altor drepturi b?ne?ti." },
    { icon: "\u{2696}\uFE0F", title: "Litigii de Munc?", desc: "Reprezentare în conflicte de munc?, greve, negocieri colective ?i arbitraj în rela?iile de munc?." },
    { icon: "\u{1F6E1}\uFE0F", title: "Protec?ia Angaja?ilor", desc: "Asisten?? în cazuri de discriminare, h?r?uire la locul de munc?, modificarea unilateral? a contractului." },
    { icon: "\u{1F4CB}", title: "Consultan?? Angajatori", desc: "Consultan?? pentru angajatori: regulamente interne, proceduri disciplinare, restructur?ri ?i concedieri colective." },
    { icon: "\u{1F3E5}", title: "S?n?tate ?i Securitate", desc: "Conformitate cu normele de s?n?tate ?i securitate în munc?. Reprezentare în cazuri de accidente de munc? ?i boli profesionale." },
    { icon: "\u{1F30D}", title: "Deta?are ?i Mobilitate", desc: "Asisten?? juridic? pentru deta?are transna?ional?, mobilitate interna?ional? ?i contracte de munc? în str?in?tate." },
  ];
  const stats = [["15+","Ani Experien??"],["350+","Dosare Munc?"],["93%","Rat? Succes"],["72h","Timp R?spuns"]];
  const steps = [
    ["1","#e65100","Analiza Situa?iei","Analiz?m contractul de munc?, actele adi?ionale ?i istoricul rela?iei de munc? pentru a identifica drepturile ?i op?iunile disponibile."],
    ["2","#f57c00","Strategie Juridic?","Stabilim împreun? cea mai bun? abordare: negociere, mediere sau ac?iune în instan??."],
    ["3","#fb8c00","Negociere sau Litigiu","Încerc?m rezolvarea amiabil? prin negociere direct? cu angajatorul. În caz contrar, declan??m procedura judiciar?."],
    ["4","#ffa726","Ob?inere Drepturi","V? reprezent?m pân? la ob?inerea drepturilor salariale, a desp?gubirilor sau a reintegr?rii în munc?."],
  ];
  const rights = [
    "Dreptul la salariu minim garantat",
    "Dreptul la concediu de odihn? pl?tit",
    "Dreptul la ore suplimentare pl?tite",
    "Protec?ia împotriva concedierii abuzive",
    "Dreptul la preaviz de concediere",
    "Protec?ia împotriva discrimin?rii",
    "Dreptul la indemniza?ie de ?omaj",
    "Dreptul la condi?ii sigure de munc?",
    "Dreptul la pauze ?i repaus s?pt?mânal",
    "Protec?ia maternitate ?i paternitate",
  ];
  const faqs = [
    { q: "Pot fi concediat f?r? motiv?", a: "Nu. Orice concediere trebuie s? fie motivat? ?i s? respecte procedura legal?: preaviz, decizie scris?, motivare. O concediere f?r? motiv sau nemotivat? corespunz?tor poate fi contestat? în instan??." },
    { q: "Cât timp am s? contest o concediere?", a: "Termenul de contestare a deciziei de concediere este de 30 de zile calendaristice de la data comunic?rii deciziei. Este esen?ial s? ac?iona?i rapid." },
    { q: "Ce pot ob?ine dac? câ?tig procesul?", a: "Pute?i ob?ine reintegrarea pe post ?i plata tuturor drepturilor salariale de la data concedierii pân? la reintegrare, sau compensa?ii echivalente dac? nu dori?i reintegrarea." },
    { q: "Angajatorul îmi poate reduce salariul unilateral?", a: "Nu. Modificarea salariului necesit? acordul dumneavoastr? printr-un act adi?ional la contractul de munc?. Orice reducere unilateral? este ilegal? ?i poate fi contestat?." },
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#bf360c,#e64a19)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u{1F4BC}"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Dreptul Muncii</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Protej?m drepturile angaja?ilor ?i asist?m angajatorii în toate aspectele rela?iilor de munc?</p>
      </div>

      <div style={{background:"#fff8e1",border:"2px solid #f9a825",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>{"\u26A0\uFE0F"}</div>
        <div>
          <h3 style={{color:"#e65100",margin:"0 0 0.5rem"}}>Aten?ie: Termen de 30 de Zile!</h3>
          <p style={{color:"#bf360c",margin:0}}>Contesta?ia concedierii trebuie depus? în <strong>30 de zile</strong> de la primirea deciziei. Nu l?sa?i s? expire termenul legal. Contacta?i-ne imediat!</p>
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
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Drepturile Dumneavoastr? ca Angajat</h2>
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
        <h2 style={{color:"#333",marginBottom:"1.5rem"}}>Întreb?ri Frecvente</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {faqs.map((faq,i)=>(<div key={i} style={{padding:"1.25rem",background:"#f9f9f9",borderRadius:"8px",borderLeft:"4px solid #e64a19"}}><h4 style={{color:"#e64a19",margin:"0 0 0.5rem"}}>{"\u2753"} {faq.q}</h4><p style={{color:"#555",margin:0,lineHeight:1.6}}>{faq.a}</p></div>))}
        </div>
      </div>

      <div style={{background:"#bf360c",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Ave?i Probleme la Locul de Munc??</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Nu accepta?i nedreptatea. Cunoa?te?i-v? drepturile ?i lupta?i pentru ele. Prima consulta?ie este gratuit?!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#bf360c",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consulta?ie Gratuit?</a>
      </div>
    </div>
  );
}
