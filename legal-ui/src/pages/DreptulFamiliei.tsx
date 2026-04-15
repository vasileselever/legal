export function DreptulFamiliei() {
  const services = [
    { icon: "\u{1F494}", title: "Divort", desc: "Asistenta completa in procedura de divort: pe cale notariala, la primarie sau in instanta. Divort amiabil sau divort contencios." },
    { icon: "\u{1F476}", title: "Custodia Copilului", desc: "Stabilirea autoritstii parintesti, a locuintei minorului si a programului de vizita. Apararea interesului superior al copilului." },
    { icon: "\u{1F3E0}", title: "Partaj Bunuri", desc: "Imparairea bunurilor comune dobandite in timpul casatoriei. Partaj amiabil sau judiciar, inclusiv bunuri imobile si conturi bancare." },
    { icon: "\u{1F4B5}", title: "Pensie Alimentara", desc: "Stabilirea, majorarea sau reducerea pensiei de intretinere pentru copii sau soa/sotie. Executare silita in caz de neplata." },
    { icon: "\u{1F4DD}", title: "Contracte Matrimoniale", desc: "Redactarea conventiilor matrimoniale inainte sau dupa casatorie. Regimul separatiei de bunuri, comunitstii conventiionale." },
    { icon: "\u{2764}\uFE0F", title: "Adoptie", desc: "Asistenta juridica in procedura de adoptie nationala. Reprezentare in fata instantaelor si autoritstilor competente." },
    { icon: "\u{1F6E1}\uFE0F", title: "Violenta Domestica", desc: "Obtinerea ordinului de protectie, asistentaa victimelor violentaei domestice si reprezentare in procesele penale conexe." },
    { icon: "\u{1F4D1}", title: "Tutela si Curatela", desc: "Instituirea tutelei pentru minori lipsisi de ocrotire parinteasca si a curatelei pentru persoane cu capacitate limitata." },
  ];
  const stats = [["15+","Ani Experienta"],["250+","Dosare Familie"],["98%","Cliensi Multumiti"],["48h","Timp Raspuns"]];
  const steps = [
    ["1","#6a1b9a","Consultatie Confidentiala","Discutam situatia familiei intr-un cadru privat si empatic. Confidentialitate garantata."],
    ["2","#7b1fa2","Evaluare si Plan","Analizam optiunile juridice disponibile si stabilim impreuna cea mai buna cale de urmat."],
    ["3","#8e24aa","Mediere sau Litigiu","Incercam rezolvarea amiabila prin mediere. Daca nu e posibil, va reprezentam in instanta."],
    ["4","#9c27b0","Protectia Intereselor","Ne asiguram ca drepturile dumneavoastra si ale copiilor sunt pe deplin protejate."],
  ];
  const faqs = [
    { q: "Cat dureaza un divort?", a: "Un divort pe cale notariala dureaza aprox. 30 zile. Un divort in instanta dureaza 3-12 luni in functie de complexitate si daca exista copii minori." },
    { q: "Cine obtine custodia copilului?", a: "Instantaa decide in functie de interesul superior al copilului. De regula se instituie autoritatea parinteasca comuna, cu stabilirea locuintei la unul dintre parinsi." },
    { q: "Cum se imparte casa in caz de divort?", a: "Bunurile comune se impart in cote egale (50/50), cu exceptia cazului in care exista o conventie matrimoniala sau se dovedesc contributii diferite." },
    { q: "Ce se intampla cu pensia alimentara?", a: "Parintele la care nu locuieste copilul plateste pensie de intretinere. Cuantumul este stabilit de instanta, de regula intre 15-25% din venitul net." },
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#4a148c,#7b1fa2)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u{1F46A}"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Dreptul Familiei</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Asistenta juridica discreta si empatica in cele mai sensibile momente ale vietii</p>
      </div>

      <div style={{background:"#f3e5f5",border:"2px solid #9c27b0",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>{"\u{1F49C}"}</div>
        <div>
          <h3 style={{color:"#6a1b9a",margin:"0 0 0.5rem"}}>Abordare Empatica si Confidentiala</h3>
          <p style={{color:"#4a148c",margin:0}}>Intelegem ca problemele de familie sunt extrem de sensibile. Va oferim un spatiu sigur, confidential si fara judecsti, axat pe gasirea celor mai bune solutii pentru dumneavoastra si familia dvs.</p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #7b1fa2"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#7b1fa2",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>Experientaa Noastra</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem"}}>
          {stats.map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"1.5rem",background:"#f3e5f5",borderRadius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#7b1fa2"}}>{s[0]}</div><div style={{color:"#666",marginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Cum Va Sprijinim</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#fce4ec",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem"}}>Intrebari Frecvente</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {faqs.map((faq,i)=>(<div key={i} style={{padding:"1.25rem",background:"#f9f9f9",borderRadius:"8px",borderLeft:"4px solid #7b1fa2"}}><h4 style={{color:"#7b1fa2",margin:"0 0 0.5rem"}}>{"\u2753"} {faq.q}</h4><p style={{color:"#555",margin:0,lineHeight:1.6}}>{faq.a}</p></div>))}
        </div>
      </div>

      <div style={{background:"#4a148c",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Aveti Nevoie de Ajutor in Probleme de Familie?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Suntem alaturi de dumneavoastra. Prima consultatie este gratuita si confidentiala.</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#4a148c",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consultatie Confidentiala</a>
      </div>
    </div>
  );
}
