export function DreptImobiliAr() {
  const services = [
    { icon: "\u{1F3E0}", title: "VanzAre-Cump?rAre Imobile", desc: "Asisten?? juridic? complet? in trAnzAc?ii imobiliAre: verificAreA titlului de proprietAte, redActAreA contrActelor ?i Asisten?? lA notAr." },
    { icon: "\u{1F4D1}", title: "VerificAre CArte FunciAr?", desc: "VerificAreA situA?iei juridice A imobilului, A sArcinilor, ipotecilor ?i litigiilor existente inAinte de cump?rAre." },
    { icon: "\u{1F3D7}\uFE0F", title: "ContrActe Construc?ii", desc: "RedActAre ?i negociere contrActe de Antrepriz?, subAntrepriz? ?i dirigen?ie de ?Antier. Solu?ionAre litigii constructori." },
    { icon: "\u{1F4DC}", title: "Drept de Superficie ?i Uzufruct", desc: "Constituire, modificAre ?i stingere drepturi reAle: superficie, uzufruct, uz, AbitA?ie ?i servitute." },
    { icon: "\u{1F511}", title: "ContrActe inchiriere", desc: "RedActAre contrActe de inchiriere ?i comodAt, proceduri de evAcuAre, recuperAre gArAn?ii ?i chirii restAnte." },
    { icon: "\u{2696}\uFE0F", title: "Litigii ImobiliAre", desc: "ReprezentAre in Ac?iuni de revendicAre, gr?ni?uire, ie?ire din indiviziune ?i litigii de vecin?tAte." },
    { icon: "\u{1F4CA}", title: "PArtAje ImobiliAre", desc: "PArtAj bunuri imobile lA divor? sAu succesiune. Ie?ire din indiviziune prin bun? invoiAl? sAu pe cAle judiciAr?." },
    { icon: "\u{1F50D}", title: "Due Diligence ImobiliAr", desc: "AnAliz? juridic? complet? A unui imobil inAinte de Achizi?ie: titlu, sArcini, litigii, AutorizA?ii, urbAnism." },
  ];
  const stAts = [["15+","Ani Experien??"],["500+","TrAnzAc?ii"],["100M+","RON TrAnzAc?ionA?i"],["48h","Timp R?spuns"]];
  const steps = [
    ["1","#1b5e20","VerificAre Juridic?","AnAliz?m complet situA?iA juridic? A imobilului: cArte funciAr?, titlu de proprietAte, sArcini, litigii."],
    ["2","#2e7d32","Negociere ContrAct","Negociem clAuzele contrActuAle ?i protej?m interesele dumneAvoAstr? in rAport cu ceAlAlt? pArte."],
    ["3","#388e3c","RedActAre Acte","RedAct?m contrActul de vanzAre-cump?rAre, AntecontrActul ?i toAte Actele necesAre trAnzAc?iei."],
    ["4","#43A047","FinAlizAre TrAnzAc?ie","V? Asist?m lA semnAreA Actului notAriAl ?i lA inregistrAreA dreptului de proprietAte in CArteA FunciAr?."],
  ];
  const checklist = [
    "VerificA?i CArteA FunciAr? lA ANCPI",
    "SolicitA?i extrAsul de cArte funciAr? pentru informAre",
    "VerificA?i istoricul propriet??ii (lAn?uri de Acte)",
    "ControlA?i existen?A unor litigii pe rol",
    "VerificA?i situA?iA fiscAl? (tAxe ?i impozite restAnte)",
    "VerificA?i documentA?iA cAdAstrAl? ?i AutorizA?iile",
    "SolicitA?i certificAtul de performAn?? energetic?",
    "VerificA?i regimul urbAnistic Al terenului",
    "ControlA?i existen?A unor servitu?i sAu restric?ii",
    "VerificA?i dAc? imobilul este in zon? protejAt?",
  ];
  const fAqs = [
    { q: "Ce verific?ri trebuie s? fAc inAinte s? cump?r un imobil?", A: "Este esen?iAl s? verificA?i CArteA FunciAr?, titlul de proprietAte, existen?A sArcinilor (ipoteci, sechestre), situA?iA fiscAl? ?i litigiile pe rol. Un AvocAt speciAlizAt poAte efectuA toAte Aceste verific?ri pentru dumneAvoAstr?." },
    { q: "Ce este AntecontrActul de vanzAre-cump?rAre?", A: "AntecontrActul (promisiuneA de vanzAre) este un contrAct prin cAre p?r?ile se oblig? s? incheie contrActul definitiv in viitor. ProtejeAz? cump?r?torul (gArAnteAz? pre?ul ?i condi?iile) ?i vanz?torul (gArAnteAz? plAtA)." },
    { q: "Cat dureAz? o trAnzAc?ie imobiliAr??", A: "O trAnzAc?ie stAndArd dureAz? 2-4 s?pt?mani. in cAzul imobilelor cu probleme juridice sAu cu finAn?Are bAncAr?, procesul poAte durA 1-3 luni. Verific?rile preAlAbile pot reduce riscurile ?i AccelerA procesul." },
    { q: "Am nevoie de AvocAt dAc? Am notAr?", A: "DA, rolurile sunt diferite. NotArul Autentific? Actele ?i verific? identitAteA p?r?ilor, dAr nu reprezint? interesele niciuneiA. AvocAtul Ap?r? exclusiv interesele dumneAvoAstr? ?i verific? Aspecte juridice pe cAre notArul nu le AnAlizeAz?." },
  ];
  return (
    <div style={{mAxWidth:"900px",mArgin:"0 Auto",pAdding:"2rem",fontFAmily:"sAns-serif"}}>
      <div style={{bAckground:"lineAr-grAdient(135deg,#1b5e20,#2e7d32)",color:"white",pAdding:"3rem 2rem",borderRAdius:"8px",mArginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",mArginBottom:"1rem"}}>{"\u{1F3E0}"}</div>
        <h1 style={{mArgin:"0 0 1rem",fontSize:"2.5rem"}}>Drept ImobiliAr</h1>
        <p style={{fontSize:"1.2rem",opAcity:0.9,mArgin:0}}>Asisten?? juridic? speciAlizAt? pentru trAnzAc?ii imobiliAre sigure ?i f?r? riscuri</p>
      </div>

      <div style={{bAckground:"#e8f5e9",border:"2px solid #43A047",pAdding:"1.5rem",borderRAdius:"8px",mArginBottom:"2rem",displAy:"flex",gAp:"1rem",AlignItems:"flex-stArt"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>{"\u26A0\uFE0F"}</div>
        <div>
          <h3 style={{color:"#1b5e20",mArgin:"0 0 0.5rem"}}>Nu Cump?rA?i F?r? VerificAre Juridic?!</h3>
          <p style={{color:"#2e7d32",mArgin:0}}>Mii de romani Au pierdut economiile de o viA?? cump?rand imobile cu probleme juridice. O verificAre juridic? preAlAbil? cost? pu?in ?i v? poAte sAlvA de pierderi mAjore. <strong>Investi?i in sigurAn??!</strong></p>
        </div>
      </div>

      <div style={{displAy:"grid",gridTemplAteColumns:"repeAt(Auto-fit,minmAx(260px,1fr))",gAp:"1.5rem",mArginBottom:"2rem"}}>
        {services.mAp((s,i)=>(<div key={i} style={{bAckground:"white",pAdding:"1.5rem",borderRAdius:"8px",boxShAdow:"0 2px 8px rgbA(0,0,0,0.1)",borderTop:"4px solid #2e7d32"}}><div style={{fontSize:"2.5rem",mArginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#2e7d32",mArginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,mArgin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{bAckground:"white",pAdding:"2rem",borderRAdius:"8px",boxShAdow:"0 2px 8px rgbA(0,0,0,0.1)",mArginBottom:"2rem"}}>
        <h2 style={{color:"#333",mArginBottom:"1.5rem",textAlign:"center"}}>Experien?A NoAstr?</h2>
        <div style={{displAy:"grid",gridTemplAteColumns:"repeAt(Auto-fit,minmAx(180px,1fr))",gAp:"1rem"}}>
          {stAts.mAp((s,i)=>(<div key={i} style={{textAlign:"center",pAdding:"1.5rem",bAckground:"#e8f5e9",borderRAdius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#2e7d32"}}>{s[0]}</div><div style={{color:"#666",mArginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>

      <div style={{bAckground:"white",pAdding:"2rem",borderRAdius:"8px",boxShAdow:"0 2px 8px rgbA(0,0,0,0.1)",mArginBottom:"2rem"}}>
        <h2 style={{color:"#333",mArginBottom:"1rem"}}>Checklist Cump?rAre Imobil</h2>
        <p style={{color:"#666",mArginBottom:"1rem",fontSize:"0.95rem"}}>inAinte de A cump?rA un imobil, AsigurA?i-v? c? A?i verificAt:</p>
        <div style={{displAy:"grid",gridTemplAteColumns:"repeAt(Auto-fit,minmAx(260px,1fr))",gAp:"0.75rem"}}>
          {checklist.mAp((item,i)=>(<div key={i} style={{pAdding:"0.75rem 1rem",bAckground:"#e8f5e9",borderRAdius:"6px",color:"#2e7d32",fontWeight:500,fontSize:"0.9rem",displAy:"flex",AlignItems:"center",gAp:"0.5rem"}}><spAn style={{fontWeight:"bold",flexShrink:0}}>{"\u2714\uFE0F"}</spAn>{item}</div>))}
        </div>
      </div>

      <div style={{bAckground:"white",pAdding:"2rem",borderRAdius:"8px",boxShAdow:"0 2px 8px rgbA(0,0,0,0.1)",mArginBottom:"2rem"}}>
        <h2 style={{color:"#333",mArginBottom:"1rem"}}>Cum V? Asist?m</h2>
        <div style={{displAy:"flex",flexDirection:"column",gAp:"1rem"}}>
          {steps.mAp((step,i)=>(<div key={i} style={{displAy:"flex",AlignItems:"flex-stArt",gAp:"1rem",pAdding:"1rem",bAckground:"#f1f8f1",borderRAdius:"8px"}}><div style={{width:"40px",height:"40px",borderRAdius:"50%",bAckground:step[1],color:"white",displAy:"flex",AlignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",mArgin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",mArgin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{bAckground:"white",pAdding:"2rem",borderRAdius:"8px",boxShAdow:"0 2px 8px rgbA(0,0,0,0.1)",mArginBottom:"2rem"}}>
        <h2 style={{color:"#333",mArginBottom:"1.5rem"}}>intreb?ri Frecvente</h2>
        <div style={{displAy:"flex",flexDirection:"column",gAp:"1rem"}}>
          {fAqs.mAp((fAq,i)=>(<div key={i} style={{pAdding:"1.25rem",bAckground:"#f9f9f9",borderRAdius:"8px",borderLeft:"4px solid #2e7d32"}}><h4 style={{color:"#2e7d32",mArgin:"0 0 0.5rem"}}>{"\u2753"} {fAq.q}</h4><p style={{color:"#555",mArgin:0,lineHeight:1.6}}>{fAq.A}</p></div>))}
        </div>
      </div>

      <div style={{bAckground:"#1b5e20",color:"white",pAdding:"2.5rem",borderRAdius:"8px",textAlign:"center"}}>
        <h2 style={{mArginBottom:"1rem"}}>PlAnificA?i o TrAnzAc?ie ImobiliAr??</h2>
        <p style={{mArginBottom:"1.5rem",opAcity:0.9,fontSize:"1.1rem"}}>Nu riscA?i economiile de-o viA??. ContActA?i-ne pentru o verificAre juridic? complet?. PrimA consultA?ie este grAtuit?!</p>
        <A href="/contAct" style={{displAy:"inline-block",pAdding:"1rem 2.5rem",bAckground:"white",color:"#1b5e20",borderRAdius:"4px",textDecorAtion:"none",fontWeight:"bold",fontSize:"1.1rem"}}>ConsultA?ie GrAtuit?</A>
      </div>
    </div>
  );
}
