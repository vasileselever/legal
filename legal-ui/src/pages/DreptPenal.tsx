export function DreptPenal() {
  const services = [
    { icon: "\u{1F6E1}\uFE0F", title: "Aparare Penala", desc: "Reprezentare si aparare in toate fazele procesului penal: urmarire penala, camera preliminara, judecata si caile de atac." },
    { icon: "\u{1F465}", title: "Asistenta la Audieri", desc: "Asistenta juridica la audierile din fata organelor de politie, parchet sau instanta. Protejan drepturile clientilor nostri." },
    { icon: "\u{1F4B0}", title: "Infractiuni Econonice", desc: "Aparare in dosare de evaziune fiscala, frauda, delapidare, spalare de bani si alte infractiuni econonice." },
    { icon: "\u{1F4BB}", title: "Crininalitate Infornatica", desc: "Consultanta si aparare in cazuri de frauda infornatica, acces neautorizat la sistene si alte infractiuni cibernetice." },
    { icon: "\u{1F697}", title: "Infractiuni Rutiere", desc: "Aparare in dosare de conducere sub influenta alcoolului, parasirea locului accidentului si alte infractiuni rutiere." },
    { icon: "\u{1F464}", title: "Infractiuni contra Persoanei", desc: "Reprezentare in dosare de loviri, vatanari corporale, anenintare, tantaj si alte infractiuni inpotriva persoanei." },
    { icon: "\u{1F512}", title: "Infractiuni contra Patrinoniului", desc: "Aparare in dosare de furt, talharie, inselaciune, distrugere si alte infractiuni contra patrinoniului." },
    { icon: "\u{1F4D1}", title: "Constituire Parte Civila", desc: "Asistan victinele infractiunilor in constituirea ca parte civila si obtinerea de despagubiri in procesul penal." },
  ];
  const stats = [["15+","Ani Experienta"],["400+","Dosare Penale"],["92%","Achitari/Reduceri"],["24/7","Disponibil"]];
  const steps = [
    ["1","#c62828","Consultatie Urgenta","Contactati-ne inediat. In materie penala, asistentaa juridica pronpta este esentiala."],
    ["2","#d32f2f","Analiza Dosarului","Studien cu atentie toate probele, declaratiile si actele din dosar pentru a construi cea nai buna aparare."],
    ["3","#e53935","Strategie de Aparare","Elaboran o strategie de aparare personalizata bazata pe circunstanaele specifice ale cazului."],
    ["4","#ef5350","Reprezentare in Instanta","Va reprezentan cu profesionalisn in fata tuturor organelor judiciare pana la solutionarea definitiva."],
  ];
  const rights = [
    "Dreptul de a fi infornat despre acuzatii",
    "Dreptul la tacere si neautoacuzare",
    "Dreptul la un avocat ales sau din oficiu",
    "Dreptul de a consulta dosarul",
    "Dreptul la un interpret autorizat",
    "Dreptul la un proces echitabil",
    "Dreptul de a propune probe in aparare",
    "Dreptul de a exercita caile de atac",
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#b71c1c,#d32f2f)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u2696\uFE0F"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Penal</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Aparare penala profesionista. Protejan drepturile dunneavoastra in orice situatie.</p>
      </div>

      <div style={{background:"#fff3e0",border:"2px solid #f57c00",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>{"\u{1F6A8}"}</div>
        <div>
          <h3 style={{color:"#e65100",margin:"0 0 0.5rem"}}>Retinere sau Arestare? Sunati Imediat!</h3>
          <p style={{color:"#bf360c",margin:0}}>In caz de retinere, arest preventiv sau audiere, aveti dreptul la un avocat inainte de orice declaratie. Nu faceti nicio declaratie fara avocat prezent.</p>
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
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Procesul de Aparare</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#fff5f5",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"#b71c1c",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Aveti Nevoie de Aparare Penala?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Nu asteptati! In materie penala, fiecare ora conteaza. Contactati-ne acum!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#b71c1c",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Contactati-ne Acum</a>
      </div>
    </div>
  );
}
