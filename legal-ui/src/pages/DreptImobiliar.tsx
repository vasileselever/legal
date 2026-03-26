export function DreptImobiliar() {
  const services = [
    { icon: "\u{1F3E0}", title: "Vânzare-Cump?rare Imobile", desc: "Asisten?? juridic? complet? în tranzac?ii imobiliare: verificarea titlului de proprietate, redactarea contractelor ?i asisten?? la notar." },
    { icon: "\u{1F4D1}", title: "Verificare Carte Funciar?", desc: "Verificarea situa?iei juridice a imobilului, a sarcinilor, ipotecilor ?i litigiilor existente înainte de cump?rare." },
    { icon: "\u{1F3D7}\uFE0F", title: "Contracte Construc?ii", desc: "Redactare ?i negociere contracte de antrepriz?, subantrepriz? ?i dirigen?ie de ?antier. Solu?ionare litigii constructori." },
    { icon: "\u{1F4DC}", title: "Drept de Superficie ?i Uzufruct", desc: "Constituire, modificare ?i stingere drepturi reale: superficie, uzufruct, uz, abita?ie ?i servitute." },
    { icon: "\u{1F511}", title: "Contracte Închiriere", desc: "Redactare contracte de închiriere ?i comodat, proceduri de evacuare, recuperare garan?ii ?i chirii restante." },
    { icon: "\u{2696}\uFE0F", title: "Litigii Imobiliare", desc: "Reprezentare în ac?iuni de revendicare, gr?ni?uire, ie?ire din indiviziune ?i litigii de vecin?tate." },
    { icon: "\u{1F4CA}", title: "Partaje Imobiliare", desc: "Partaj bunuri imobile la divor? sau succesiune. Ie?ire din indiviziune prin bun? învoial? sau pe cale judiciar?." },
    { icon: "\u{1F50D}", title: "Due Diligence Imobiliar", desc: "Analiz? juridic? complet? a unui imobil înainte de achizi?ie: titlu, sarcini, litigii, autoriza?ii, urbanism." },
  ];
  const stats = [["15+","Ani Experien??"],["500+","Tranzac?ii"],["100M+","RON Tranzac?iona?i"],["48h","Timp R?spuns"]];
  const steps = [
    ["1","#1b5e20","Verificare Juridic?","Analiz?m complet situa?ia juridic? a imobilului: carte funciar?, titlu de proprietate, sarcini, litigii."],
    ["2","#2e7d32","Negociere Contract","Negociem clauzele contractuale ?i protej?m interesele dumneavoastr? în raport cu cealalt? parte."],
    ["3","#388e3c","Redactare Acte","Redact?m contractul de vânzare-cump?rare, antecontractul ?i toate actele necesare tranzac?iei."],
    ["4","#43a047","Finalizare Tranzac?ie","V? asist?m la semnarea actului notarial ?i la înregistrarea dreptului de proprietate în Cartea Funciar?."],
  ];
  const checklist = [
    "Verifica?i Cartea Funciar? la ANCPI",
    "Solicita?i extrasul de carte funciar? pentru informare",
    "Verifica?i istoricul propriet??ii (lan?uri de acte)",
    "Controla?i existen?a unor litigii pe rol",
    "Verifica?i situa?ia fiscal? (taxe ?i impozite restante)",
    "Verifica?i documenta?ia cadastral? ?i autoriza?iile",
    "Solicita?i certificatul de performan?? energetic?",
    "Verifica?i regimul urbanistic al terenului",
    "Controla?i existen?a unor servitu?i sau restric?ii",
    "Verifica?i dac? imobilul este în zon? protejat?",
  ];
  const faqs = [
    { q: "Ce verific?ri trebuie s? fac înainte s? cump?r un imobil?", a: "Este esen?ial s? verifica?i Cartea Funciar?, titlul de proprietate, existen?a sarcinilor (ipoteci, sechestre), situa?ia fiscal? ?i litigiile pe rol. Un avocat specializat poate efectua toate aceste verific?ri pentru dumneavoastr?." },
    { q: "Ce este antecontractul de vânzare-cump?rare?", a: "Antecontractul (promisiunea de vânzare) este un contract prin care p?r?ile se oblig? s? încheie contractul definitiv în viitor. Protejeaz? cump?r?torul (garanteaz? pre?ul ?i condi?iile) ?i vânz?torul (garanteaz? plata)." },
    { q: "Cât dureaz? o tranzac?ie imobiliar??", a: "O tranzac?ie standard dureaz? 2-4 s?pt?mâni. În cazul imobilelor cu probleme juridice sau cu finan?are bancar?, procesul poate dura 1-3 luni. Verific?rile prealabile pot reduce riscurile ?i accelera procesul." },
    { q: "Am nevoie de avocat dac? am notar?", a: "Da, rolurile sunt diferite. Notarul autentific? actele ?i verific? identitatea p?r?ilor, dar nu reprezint? interesele niciuneia. Avocatul ap?r? exclusiv interesele dumneavoastr? ?i verific? aspecte juridice pe care notarul nu le analizeaz?." },
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#1b5e20,#2e7d32)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u{1F3E0}"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Imobiliar</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Asisten?? juridic? specializat? pentru tranzac?ii imobiliare sigure ?i f?r? riscuri</p>
      </div>

      <div style={{background:"#e8f5e9",border:"2px solid #43a047",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>{"\u26A0\uFE0F"}</div>
        <div>
          <h3 style={{color:"#1b5e20",margin:"0 0 0.5rem"}}>Nu Cump?ra?i F?r? Verificare Juridic?!</h3>
          <p style={{color:"#2e7d32",margin:0}}>Mii de români au pierdut economiile de o via?? cump?rând imobile cu probleme juridice. O verificare juridic? prealabil? cost? pu?in ?i v? poate salva de pierderi majore. <strong>Investi?i în siguran??!</strong></p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #2e7d32"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#2e7d32",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>Experien?a Noastr?</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem"}}>
          {stats.map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"1.5rem",background:"#e8f5e9",borderRadius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#2e7d32"}}>{s[0]}</div><div style={{color:"#666",marginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Checklist Cump?rare Imobil</h2>
        <p style={{color:"#666",marginBottom:"1rem",fontSize:"0.95rem"}}>Înainte de a cump?ra un imobil, asigura?i-v? c? a?i verificat:</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"0.75rem"}}>
          {checklist.map((item,i)=>(<div key={i} style={{padding:"0.75rem 1rem",background:"#e8f5e9",borderRadius:"6px",color:"#2e7d32",fontWeight:500,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem"}}><span style={{fontWeight:"bold",flexShrink:0}}>{"\u2714\uFE0F"}</span>{item}</div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Cum V? Asist?m</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#f1f8f1",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem"}}>Întreb?ri Frecvente</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {faqs.map((faq,i)=>(<div key={i} style={{padding:"1.25rem",background:"#f9f9f9",borderRadius:"8px",borderLeft:"4px solid #2e7d32"}}><h4 style={{color:"#2e7d32",margin:"0 0 0.5rem"}}>{"\u2753"} {faq.q}</h4><p style={{color:"#555",margin:0,lineHeight:1.6}}>{faq.a}</p></div>))}
        </div>
      </div>

      <div style={{background:"#1b5e20",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Planifica?i o Tranzac?ie Imobiliar??</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Nu risca?i economiile de-o via??. Contacta?i-ne pentru o verificare juridic? complet?. Prima consulta?ie este gratuit?!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#1b5e20",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consulta?ie Gratuit?</a>
      </div>
    </div>
  );
}
