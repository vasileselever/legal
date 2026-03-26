export function DreptulFamiliei() {
  const services = [
    { icon: "\u{1F494}", title: "Divor?", desc: "Asisten?? complet? în procedura de divor?: pe cale notarial?, la prim?rie sau în instan??. Divor? amiabil sau divor? contencios." },
    { icon: "\u{1F476}", title: "Custodia Copilului", desc: "Stabilirea autorit??ii p?rinte?ti, a locuin?ei minorului ?i a programului de vizit?. Ap?rarea interesului superior al copilului." },
    { icon: "\u{1F3E0}", title: "Partaj Bunuri", desc: "Împ?r?irea bunurilor comune dobândite în timpul c?s?toriei. Partaj amiabil sau judiciar, inclusiv bunuri imobile ?i conturi bancare." },
    { icon: "\u{1F4B5}", title: "Pensie Alimentar?", desc: "Stabilirea, majorarea sau reducerea pensiei de între?inere pentru copii sau so?/so?ie. Executare silit? în caz de nepl?tire." },
    { icon: "\u{1F4DD}", title: "Contracte Matrimoniale", desc: "Redactarea conven?iilor matrimoniale înainte sau dup? c?s?torie. Regimul separa?iei de bunuri, comunit??ii conven?ionale." },
    { icon: "\u{2764}\uFE0F", title: "Adop?ie", desc: "Asisten?? juridic? în procedura de adop?ie na?ional?. Reprezentare în fa?a instan?elor ?i autorit??ilor competente." },
    { icon: "\u{1F6E1}\uFE0F", title: "Violen?? Domestic?", desc: "Ob?inerea ordinului de protec?ie, asisten?a victimelor violen?ei domestice ?i reprezentare în procesele penale conexe." },
    { icon: "\u{1F4D1}", title: "Tutel? ?i Curatel?", desc: "Instituirea tutelei pentru minori lipsi?i de ocrotire p?rinteasc? ?i a curatelei pentru persoane cu capacitate limitat?." },
  ];
  const stats = [["15+","Ani Experien??"],["250+","Dosare Familie"],["98%","Clien?i Mul?umi?i"],["48h","Timp R?spuns"]];
  const steps = [
    ["1","#6a1b9a","Consulta?ie Confiden?ial?","Discut?m situa?ia familiei într-un cadru privat ?i empatic. Confiden?ialitate garantat?."],
    ["2","#7b1fa2","Evaluare ?i Plan","Analiz?m op?iunile juridice disponibile ?i stabilim împreun? cea mai bun? cale de urmat."],
    ["3","#8e24aa","Mediere sau Litigiu","Încerc?m rezolvarea amiabil? prin mediere. Dac? nu e posibil, v? reprezent?m în instan??."],
    ["4","#9c27b0","Protec?ia Intereselor","Ne asigur?m c? drepturile dumneavoastr? ?i ale copiilor sunt pe deplin protejate."],
  ];
  const faqs = [
    { q: "Cât dureaz? un divor??", a: "Un divor? pe cale notarial? dureaz? aprox. 30 zile. Un divor? în instan?? dureaz? 3-12 luni în func?ie de complexitate ?i dac? exist? copii minori." },
    { q: "Cine ob?ine custodia copilului?", a: "Instan?a decide în func?ie de interesul superior al copilului. De regul? se instituie autoritatea p?rinteasc? comun?, cu stabilirea locuin?ei la unul dintre p?rin?i." },
    { q: "Cum se împarte casa în caz de divor??", a: "Bunurile comune se împart în cote egale (50/50), cu excep?ia cazului în care exist? o conven?ie matrimonial? sau se dovedesc contribu?ii diferite." },
    { q: "Ce se întâmpl? cu pensia alimentar??", a: "P?rintele la care nu locuie?te copilul pl?te?te pensie de între?inere. Cuantumul este stabilit de instan??, de regul? între 15-25% din venitul net." },
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#4a148c,#7b1fa2)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u{1F46A}"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Dreptul Familiei</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Asisten?? juridic? discret? ?i empatic? în cele mai sensibile momente ale vie?ii</p>
      </div>

      <div style={{background:"#f3e5f5",border:"2px solid #9c27b0",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>{"\u{1F49C}"}</div>
        <div>
          <h3 style={{color:"#6a1b9a",margin:"0 0 0.5rem"}}>Abordare Empatic? ?i Confiden?ial?</h3>
          <p style={{color:"#4a148c",margin:0}}>În?elegem c? problemele de familie sunt extrem de sensibile. V? oferim un spa?iu sigur, confiden?ial ?i f?r? judec??i, axat pe g?sirea celor mai bune solu?ii pentru dumneavoastr? ?i familia dvs.</p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #7b1fa2"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#7b1fa2",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>Experien?a Noastr?</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem"}}>
          {stats.map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"1.5rem",background:"#f3e5f5",borderRadius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#7b1fa2"}}>{s[0]}</div><div style={{color:"#666",marginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Cum V? Sprijinim</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#fce4ec",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem"}}>Întreb?ri Frecvente</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {faqs.map((faq,i)=>(<div key={i} style={{padding:"1.25rem",background:"#f9f9f9",borderRadius:"8px",borderLeft:"4px solid #7b1fa2"}}><h4 style={{color:"#7b1fa2",margin:"0 0 0.5rem"}}>{"\u2753"} {faq.q}</h4><p style={{color:"#555",margin:0,lineHeight:1.6}}>{faq.a}</p></div>))}
        </div>
      </div>

      <div style={{background:"#4a148c",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Ave?i Nevoie de Ajutor în Probleme de Familie?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Suntem al?turi de dumneavoastr?. Prima consulta?ie este gratuit? ?i confiden?ial?.</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#4a148c",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consulta?ie Confiden?ial?</a>
      </div>
    </div>
  );
}
