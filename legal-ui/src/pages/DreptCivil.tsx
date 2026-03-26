export function DreptCivil() {
  const services = [
    { icon: "\u{1F4DC}", title: "Contracte Civile", desc: "Redactare, revizuire ?i negociere contracte de vânzare-cump?rare, dona?ie, împrumut ?i alte contracte civile." },
    { icon: "\u{2696}\uFE0F", title: "Litigii Civile", desc: "Reprezentare în instan?? în procese civile, ac?iuni în preten?ii ?i ac?iuni posesorii." },
    { icon: "\u{1F4B0}", title: "Recuperare Crean?e", desc: "Proceduri de recuperare a crean?elor, soma?ii de plat? ?i executare silit?." },
    { icon: "\u{1F3DB}\uFE0F", title: "Drept Succesoral", desc: "Acceptare mo?tenire, partaj succesoral, testamente ?i litigii succesorale." },
    { icon: "\u{1F6E1}\uFE0F", title: "R?spundere Civil?", desc: "Ac?iuni în desp?gubire pentru prejudicii materiale ?i morale." },
    { icon: "\u{1F4D1}", title: "Drept Procesual", desc: "Consultan?? în proceduri civile, c?i de atac ?i executare hot?râri." },
  ];
  const stats = [["15+","Ani Experien??"],["200+","Cazuri Civile"],["95%","Rat? Succes"],["48h","Timp R?spuns"]];
  const steps = [
    ["1","#1976d2","Consulta?ie Ini?ial?","Discut?m cazul dumneavoastr? ?i evalu?m situa?ia juridic? în detaliu."],
    ["2","#42a5f5","Strategie Juridic?","Stabilim cea mai bun? strategie ?i v? inform?m despre op?iunile disponibile."],
    ["3","#66bb6a","Reprezentare","V? reprezent?m în fa?a instan?elor sau în negocieri cu cealalt? parte."],
    ["4","#4caf50","Solu?ionare","Ob?inem rezultatul dorit ?i v? asist?m pân? la solu?ionarea complet? a cazului."],
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#1976d2,#42a5f5)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>{"\u2696\uFE0F"}</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Civil</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Asisten?? juridic? complet? în litigii civile, contracte ?i recuper?ri de crean?e</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #1976d2"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#1976d2",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0}}>{s.desc}</p></div>))}
      </div>
      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>De Ce S? Ne Alege?i?</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem"}}>
          {stats.map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"1.5rem",background:"#f5f5f5",borderRadius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#1976d2"}}>{s[0]}</div><div style={{color:"#666",marginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>
      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Procesul Nostru</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#f9f9f9",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>
      <div style={{background:"#1976d2",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Ave?i o Problem? de Drept Civil?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Contacta?i-ne ast?zi pentru o consulta?ie gratuit?!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#1976d2",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consulta?ie Gratuit?</a>
      </div>
    </div>
  );
}
