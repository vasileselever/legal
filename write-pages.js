const fs = require('fs');
const base = 'C:/Users/vasileselever/Desktop/projects/Juridic/legal/legal-ui/src';

fs.mkdirSync(base + '/pages', { recursive: true });

// ?? DreptCivil page (unchanged) ??????????????????????????????????????????????
fs.writeFileSync(base + '/pages/DreptCivil.tsx', `
export function DreptCivil() {
  const services = [
    { icon: "??", title: "Contracte Civile", desc: "Redactare, revizuire si negociere contracte de vanzare-cumparare, donatie, imprumut si alte contracte civile." },
    { icon: "??", title: "Litigii Civile", desc: "Reprezentare in instanta in procese civile, actiuni in pretentii si actiuni posesorii." },
    { icon: "??", title: "Recuperare Creante", desc: "Proceduri de recuperare a creantelor, somatii de plata si executare silita." },
    { icon: "???", title: "Drept Succesoral", desc: "Acceptare mostenire, partaj succesoral, testamente si litigii succesorale." },
    { icon: "??", title: "Raspundere Civila", desc: "Actiuni in despagubire pentru prejudicii materiale si morale." },
    { icon: "??", title: "Drept Procesual", desc: "Consultanta in proceduri civile, cai de atac si executare hotarari." },
  ];
  const stats = [["15+","Ani Experienta"],["200+","Cazuri Civile"],["95%","Rata Succes"],["48h","Timp Raspuns"]];
  const steps = [
    ["1","#1976d2","Consultatie Initiala","Discutam cazul dumneavoastra si evaluam situatia juridica in detaliu."],
    ["2","#42a5f5","Strategie Juridica","Stabilim cea mai buna strategie si va informam despre optiunile disponibile."],
    ["3","#66bb6a","Reprezentare","Va reprezentam in fata instantelor sau in negocieri cu cealalta parte."],
    ["4","#4caf50","Solutionare","Obtinem rezultatul dorit si va asistam pana la solutionarea completa a cazului."],
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#1976d2,#42a5f5)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>??</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Civil</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Asistenta juridica completa in litigii civile, contracte si recuperari de creante</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #1976d2"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#1976d2",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0}}>{s.desc}</p></div>))}
      </div>
      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>De Ce Sa Ne Alegeti?</h2>
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
        <h2 style={{marginBottom:"1rem"}}>Aveti o Problema de Drept Civil?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Contactati-ne astazi pentru o consultatie gratuita!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#1976d2",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consultatie Gratuita</a>
      </div>
    </div>
  );
}
`, 'utf8');

// ?? DreptComercial page (unchanged) ?????????????????????????????????????????
fs.writeFileSync(base + '/pages/DreptComercial.tsx', `
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
`, 'utf8');

// ?? DreptPenal page (NEW) ????????????????????????????????????????????????????
fs.writeFileSync(base + '/pages/DreptPenal.tsx', `
export function DreptPenal() {
  const services = [
    { icon: "???", title: "Aparare Penala", desc: "Reprezentare si aparare in toate fazele procesului penal: urmarire penala, camera preliminara, judecata si caile de atac." },
    { icon: "??", title: "Asistenta la Audieri", desc: "Asistenta juridica la audierile din fata organelor de politie, parchet sau instanta. Protejam drepturile clientilor nostri." },
    { icon: "??", title: "Infractiuni Economice", desc: "Aparare in dosare de evaziune fiscala, frauda, delapidare, spalare de bani si alte infractiuni economice." },
    { icon: "??", title: "Criminalitate Informatica", desc: "Consultanta si aparare in cazuri de frauda informatica, acces neautorizat la sisteme si alte infractiuni cibernetice." },
    { icon: "??", title: "Infractiuni Rutiere", desc: "Aparare in dosare de conducere sub influenta alcoolului, parasirea locului accidentului si alte infractiuni rutiere." },
    { icon: "??", title: "Infractiuni contra Persoanei", desc: "Reprezentare in dosare de loviri, vatamari corporale, amenintare, santaj si alte infractiuni impotriva persoanei." },
    { icon: "??", title: "Infractiuni contra Patrimoniului", desc: "Aparare in dosare de furt, talharie, inselaciune, distrugere si alte infractiuni contra patrimoniului." },
    { icon: "??", title: "Constituire Parte Civila", desc: "Asistam victimele infractiunilor in constituirea ca parte civila si obtinerea de despagubiri in procesul penal." },
  ];
  const stats = [["15+","Ani Experienta"],["400+","Dosare Penale"],["92%","Achitari/Reduceri"],["24/7","Disponibil"]];
  const steps = [
    ["1","#c62828","Consultatie Urgenta","Contactati-ne imediat. In materie penala, asistenta juridica prompta este esentiala."],
    ["2","#d32f2f","Analiza Dosarului","Studiem cu atentie toate probele, declaratiile si actele din dosar pentru a construi cea mai buna aparare."],
    ["3","#e53935","Strategie de Aparare","Elaboram o strategie de aparare personalizata bazata pe circumstantele specifice ale cazului."],
    ["4","#ef5350","Reprezentare in Instanta","Va reprezentam cu profesionalism in fata tuturor organelor judiciare pana la solutionarea definitiva."],
  ];
  const rights = [
    "Dreptul de a fi informat despre acuzatii",
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
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>??</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Penal</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Aparare penala profesionista. Protejam drepturile dumneavoastra in orice situatie.</p>
      </div>

      <div style={{background:"#fff3e0",border:"2px solid #f57c00",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>??</div>
        <div>
          <h3 style={{color:"#e65100",margin:"0 0 0.5rem"}}>Retinere sau Arest? Sunati Imediat!</h3>
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
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Drepturile Dumneavoastra</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"0.75rem"}}>
          {rights.map((r,i)=>(<div key={i} style={{padding:"0.75rem 1rem",background:"#ffebee",borderRadius:"6px",color:"#c62828",fontWeight:500,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem"}}><span style={{fontWeight:"bold"}}>?</span>{r}</div>))}
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
`, 'utf8');

// ?? DreptulFamiliei page (NEW) ???????????????????????????????????????????????
fs.writeFileSync(base + '/pages/DreptulFamiliei.tsx', `
export function DreptulFamiliei() {
  const services = [
    { icon: "??", title: "Divort", desc: "Asistenta completa in procedura de divort: pe cale notariala, la primarie sau in instanta. Divort amiabil sau divort contencios." },
    { icon: "????????", title: "Custodia Copilului", desc: "Stabilirea autoritatii parintesti, a locuintei minorului si a programului de vizita. Apararea interesului superior al copilului." },
    { icon: "??", title: "Partaj Bunuri", desc: "Impartirea bunurilor comune dobandite in timpul casatoriei. Partaj amiabil sau judiciar, inclusiv bunuri imobile si conturi bancare." },
    { icon: "??", title: "Pensie Alimentara", desc: "Stabilirea, majorarea sau reducerea pensiei de intretinere pentru copii sau sot/sotie. Executare silita in caz de neplatire." },
    { icon: "??", title: "Contracte Matrimoniale", desc: "Redactarea conventiilor matrimoniale inainte sau dupa casatorie. Regimul separatiei de bunuri, comunitatii conventionale." },
    { icon: "??", title: "Adoptie", desc: "Asistenta juridica in procedura de adoptie nationala. Reprezentare in fata instantelor si autoritatilor competente." },
    { icon: "??", title: "Violenta Domestica", desc: "Obtinerea ordinului de protectie, asistenta victimelor violentei domestice si reprezentare in procesele penale conexe." },
    { icon: "??", title: "Tutela si Curatela", desc: "Instituirea tutelei pentru minori lipsiti de ocrotire parinteasca si a curatei pentru persoane cu capacitate limitata." },
  ];
  const stats = [["15+","Ani Experienta"],["250+","Dosare Familie"],["98%","Clienti Multumiti"],["48h","Timp Raspuns"]];
  const steps = [
    ["1","#6a1b9a","Consultatie Confidentiala","Discutam situatia familiei intr-un cadru privat si empatic. Confidentialitate garantata."],
    ["2","#7b1fa2","Evaluare si Plan","Analizam optiunile juridice disponibile si stabilim impreuna cea mai buna cale de urmat."],
    ["3","#8e24aa","Mediere sau Litigiu","Incercam rezolvarea amiabila prin mediere. Daca nu e posibil, va reprezentam in instanta."],
    ["4","#9c27b0","Protectia Intereselor","Ne asiguram ca drepturile dumneavoastra si ale copiilor sunt pe deplin protejate."],
  ];
  const faqs = [
    { q: "Cat dureaza un divort?", a: "Un divort pe cale notariala dureaza aprox. 30 zile. Un divort in instanta dureaza 3-12 luni in functie de complexitate si daca exista copii minori." },
    { q: "Cine obtine custodia copilului?", a: "Instanta decide in functie de interesul superior al copilului. De regula se instituie autoritatea parinteasca comuna, cu stabilirea locuintei la unul dintre parinti." },
    { q: "Cum se imparte casa in caz de divort?", a: "Bunurile comune se impart in cote egale (50/50), cu exceptia cazului in care exista o conventie matrimoniala sau se dovedesc contributii diferite." },
    { q: "Ce se intampla cu pensia alimentara?", a: "Parintele la care nu locuieste copilul plateste pensie de intretinere. Cuantumul este stabilit de instanta, de regula intre 15-25% din venitul net." },
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#4a148c,#7b1fa2)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>???????????</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Dreptul Familiei</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Asistenta juridica discreta si empatica in cele mai sensibile momente ale vietii</p>
      </div>

      <div style={{background:"#f3e5f5",border:"2px solid #9c27b0",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>??</div>
        <div>
          <h3 style={{color:"#6a1b9a",margin:"0 0 0.5rem"}}>Abordare Empatica si Confidentiala</h3>
          <p style={{color:"#4a148c",margin:0}}>Intelegem ca problemele de familie sunt extrem de sensibile. Va oferim un spatiu sigur, confidential si fara judecati, axat pe gasirea celor mai bune solutii pentru dumneavoastra si familia dvs.</p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #7b1fa2"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#7b1fa2",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>Experienta Noastra</h2>
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
          {faqs.map((faq,i)=>(<div key={i} style={{padding:"1.25rem",background:"#f9f9f9",borderRadius:"8px",borderLeft:"4px solid #7b1fa2"}}><h4 style={{color:"#7b1fa2",margin:"0 0 0.5rem"}}>? {faq.q}</h4><p style={{color:"#555",margin:0,lineHeight:1.6}}>{faq.a}</p></div>))}
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
`, 'utf8');

// ?? DreptulMuncii page (NEW) ?????????????????????????????????????????????????
fs.writeFileSync(base + '/pages/DreptulMuncii.tsx', `
export function DreptulMuncii() {
  const services = [
    { icon: "??", title: "Contracte de Munca", desc: "Redactare, revizuire si negociere contracte individuale de munca, acte aditionale si regulamente interne." },
    { icon: "??", title: "Contestatie Concediere", desc: "Contestarea concedierilor nelegale sau abuzive. Reintegrare in munca si obtinerea de despagubiri." },
    { icon: "??", title: "Recuperare Salarii", desc: "Actiuni pentru recuperarea salariilor neplatite, a sporurilor, a orelor suplimentare si a altor drepturi banesti." },
    { icon: "??", title: "Litigii de Munca", desc: "Reprezentare in conflicte de munca, greve, negocieri colective si arbitraj in relatiile de munca." },
    { icon: "???", title: "Protectia Angajatilor", desc: "Asistenta in cazuri de discriminare, hartuire la locul de munca, modificarea unilaterala a contractului." },
    { icon: "??", title: "Consultanta Angajatori", desc: "Consultanta pentru angajatori: regulamente interne, proceduri disciplinare, restructurari si concedieri colective." },
    { icon: "??", title: "Sanatate si Securitate", desc: "Conformitate cu normele de sanatate si securitate in munca. Reprezentare in cazuri de accidente de munca si boli profesionale." },
    { icon: "??", title: "Detasare si Mobilitate", desc: "Asistenta juridica pentru detasare transnationala, mobilitate internationala si contracte de munca in strainatate." },
  ];
  const stats = [["15+","Ani Experienta"],["350+","Dosare Munca"],["93%","Rata Succes"],["72h","Timp Raspuns"]];
  const steps = [
    ["1","#e65100","Analiza Situatiei","Analizam contractul de munca, actele aditionale si istoricul relatiei de munca pentru a identifica drepturile si optiunile disponibile."],
    ["2","#f57c00","Strategie Juridica","Stabilim impreuna cea mai buna abordare: negociere, mediere sau actiune in instanta."],
    ["3","#fb8c00","Negociere sau Litigiu","Incercam rezolvarea amiabila prin negociere directa cu angajatorul. In caz contrar, declansam procedura judiciara."],
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
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>??</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Dreptul Muncii</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Protejam drepturile angajatilor si asistam angajatorii in toate aspectele relatiilor de munca</p>
      </div>

      <div style={{background:"#fff8e1",border:"2px solid #f9a825",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>?</div>
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
          {rights.map((r,i)=>(<div key={i} style={{padding:"0.75rem 1rem",background:"#fff3e0",borderRadius:"6px",color:"#e64a19",fontWeight:500,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem"}}><span style={{fontWeight:"bold"}}>?</span>{r}</div>))}
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
          {faqs.map((faq,i)=>(<div key={i} style={{padding:"1.25rem",background:"#f9f9f9",borderRadius:"8px",borderLeft:"4px solid #e64a19"}}><h4 style={{color:"#e64a19",margin:"0 0 0.5rem"}}>? {faq.q}</h4><p style={{color:"#555",margin:0,lineHeight:1.6}}>{faq.a}</p></div>))}
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
`, 'utf8');

// ?? DreptImobiliar page (NEW) ????????????????????????????????????????????????
fs.writeFileSync(base + '/pages/DreptImobiliar.tsx', `
export function DreptImobiliar() {
  const services = [
    { icon: "??", title: "Vanzare-Cumparare Imobile", desc: "Asistenta juridica completa in tranzactii imobiliare: verificarea titlului de proprietate, redactarea contractelor si asistenta la notar." },
    { icon: "??", title: "Verificare Carte Funciara", desc: "Verificarea situatiei juridice a imobilului, a sarcinilor, ipotecilor si litigiilor existente inainte de cumparare." },
    { icon: "???", title: "Contracte Constructii", desc: "Redactare si negociere contracte de antrepriza, subantrepriza si dirigentie de santier. Solutionare litigii constructori." },
    { icon: "??", title: "Drept de Superficie si Uzufruct", desc: "Constituire, modificare si stingere drepturi reale: superficie, uzufruct, uz, abitatie si servitute." },
    { icon: "??", title: "Contracte Inchiriere", desc: "Redactare contracte de inchiriere si comodat, proceduri de evacuare, recuperare garantii si chirii restante." },
    { icon: "??", title: "Litigii Imobiliare", desc: "Reprezentare in actiuni de revendicare, granituire, iesire din indiviziune si litigii de vecinatate." },
    { icon: "??", title: "Partaje Imobiliare", desc: "Partaj bunuri imobile la divort sau succesiune. Iesire din indiviziune prin buna invoiala sau pe cale judiciara." },
    { icon: "??", title: "Due Diligence Imobiliar", desc: "Analiza juridica completa a unui imobil inainte de achizitie: titlu, sarcini, litigii, autorizatii, urbanism." },
  ];
  const stats = [["15+","Ani Experienta"],["500+","Tranzactii",""],["100M+","RON Tranzactionati"],["48h","Timp Raspuns"]];
  const steps = [
    ["1","#1b5e20","Verificare Juridica","Analizam complet situatia juridica a imobilului: carte funciara, titlu de proprietate, sarcini, litigii."],
    ["2","#2e7d32","Negociere Contract","Negociem clauzele contractuale si protejam interesele dumneavoastra in raport cu cealalta parte."],
    ["3","#388e3c","Redactare Acte","Redactam contractul de vanzare-cumparare, antecontractul si toate actele necesare tranzactiei."],
    ["4","#43a047","Finalizare Tranzactie","Va asistam la semnarea actului notarial si la inregistrarea dreptului de proprietate in Cartea Funciara."],
  ];
  const checklist = [
    "Verificati Cartea Funciara la ANCPI",
    "Solicitati extrasul de carte funciara pentru informare",
    "Verificati istoricul proprietatii (lanturi de acte)",
    "Controlati existenta unor litigii pe rol",
    "Verificati situatia fiscala (taxe si impozite restante)",
    "Verificati documentatia cadastrala si autorizatiile",
    "Solicitati certificatul de performanta energetica",
    "Verificati regimul urbanistic al terenului",
    "Controlati existenta unor servituti sau restrictii",
    "Verificati daca imobilul este in zona protejata",
  ];
  const faqs = [
    { q: "Ce verificari trebuie sa fac inainte sa cumpar un imobil?", a: "Este esential sa verificati Cartea Funciara, titlul de proprietate, existenta sarcinilor (ipoteci, sechestre), situatia fiscala si litigiile pe rol. Un avocat specializat poate efectua toate aceste verificari pentru dumneavoastra." },
    { q: "Ce este antecontractul de vanzare-cumparare?", a: "Antecontractul (promisiunea de vanzare) este un contract prin care partile se obliga sa incheie contractul definitiv in viitor. Protejeaza cumparatorul (garanteaza pretul si conditiile) si vanzatorul (garanteaza plata)." },
    { q: "Cat dureaza o tranzactie imobiliara?", a: "O tranzactie standard dureaza 2-4 saptamani. In cazul imobilelor cu probleme juridice sau cu finantare bancara, procesul poate dura 1-3 luni. Verificarile prealabile pot reduce riscurile si accelera procesul." },
    { q: "Am nevoie de avocat daca am notar?", a: "Da, rolurile sunt diferite. Notarul autentifica actele si verifica identitatea partilor, dar nu reprezinta interesele niciuneia. Avocatul apara exclusiv interesele dumneavoastra si verifica aspecte juridice pe care notarul nu le analizeaza." },
  ];
  return (
    <div style={{maxWidth:"900px",margin:"0 auto",padding:"2rem",fontFamily:"sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#1b5e20,#2e7d32)",color:"white",padding:"3rem 2rem",borderRadius:"8px",marginBottom:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>??</div>
        <h1 style={{margin:"0 0 1rem",fontSize:"2.5rem"}}>Drept Imobiliar</h1>
        <p style={{fontSize:"1.2rem",opacity:0.9,margin:0}}>Asistenta juridica specializata pentru tranzactii imobiliare sigure si fara riscuri</p>
      </div>

      <div style={{background:"#e8f5e9",border:"2px solid #43a047",padding:"1.5rem",borderRadius:"8px",marginBottom:"2rem",display:"flex",gap:"1rem",alignItems:"flex-start"}}>
        <div style={{fontSize:"2rem",flexShrink:0}}>??</div>
        <div>
          <h3 style={{color:"#1b5e20",margin:"0 0 0.5rem"}}>Nu Cumparati Fara Verificare Juridica!</h3>
          <p style={{color:"#2e7d32",margin:0}}>Mii de romani au pierdut economiile de o viata cumparand imobile cu probleme juridice. O verificare juridica prealabila costa putin si va poate salva de pierderi majore. <strong>Investiti in siguranta!</strong></p>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"1.5rem",marginBottom:"2rem"}}>
        {services.map((s,i)=>(<div key={i} style={{background:"white",padding:"1.5rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",borderTop:"4px solid #2e7d32"}}><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{s.icon}</div><h3 style={{color:"#2e7d32",marginBottom:"0.5rem"}}>{s.title}</h3><p style={{color:"#666",lineHeight:1.6,margin:0,fontSize:"0.95rem"}}>{s.desc}</p></div>))}
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem",textAlign:"center"}}>Experienta Noastra</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"1rem"}}>
          {stats.map((s,i)=>(<div key={i} style={{textAlign:"center",padding:"1.5rem",background:"#e8f5e9",borderRadius:"8px"}}><div style={{fontSize:"2rem",fontWeight:"bold",color:"#2e7d32"}}>{s[0]}</div><div style={{color:"#666",marginTop:"0.5rem"}}>{s[1]}</div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Checklist Cumparare Imobil</h2>
        <p style={{color:"#666",marginBottom:"1rem",fontSize:"0.95rem"}}>Inainte de a cumpara un imobil, asigurati-va ca ati verificat:</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"0.75rem"}}>
          {checklist.map((item,i)=>(<div key={i} style={{padding:"0.75rem 1rem",background:"#e8f5e9",borderRadius:"6px",color:"#2e7d32",fontWeight:500,fontSize:"0.9rem",display:"flex",alignItems:"center",gap:"0.5rem"}}><span style={{fontWeight:"bold",flexShrink:0}}>?</span>{item}</div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1rem"}}>Cum Va Asistam</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {steps.map((step,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1rem",background:"#f1f8f1",borderRadius:"8px"}}><div style={{width:"40px",height:"40px",borderRadius:"50%",background:step[1],color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",flexShrink:0}}>{step[0]}</div><div><h4 style={{color:"#333",margin:"0 0 0.25rem"}}>{step[2]}</h4><p style={{color:"#666",margin:0,fontSize:"0.95rem"}}>{step[3]}</p></div></div>))}
        </div>
      </div>

      <div style={{background:"white",padding:"2rem",borderRadius:"8px",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",marginBottom:"2rem"}}>
        <h2 style={{color:"#333",marginBottom:"1.5rem"}}>Intrebari Frecvente</h2>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          {faqs.map((faq,i)=>(<div key={i} style={{padding:"1.25rem",background:"#f9f9f9",borderRadius:"8px",borderLeft:"4px solid #2e7d32"}}><h4 style={{color:"#2e7d32",margin:"0 0 0.5rem"}}>? {faq.q}</h4><p style={{color:"#555",margin:0,lineHeight:1.6}}>{faq.a}</p></div>))}
        </div>
      </div>

      <div style={{background:"#1b5e20",color:"white",padding:"2.5rem",borderRadius:"8px",textAlign:"center"}}>
        <h2 style={{marginBottom:"1rem"}}>Planificati o Tranzactie Imobiliara?</h2>
        <p style={{marginBottom:"1.5rem",opacity:0.9,fontSize:"1.1rem"}}>Nu riscati economiile de-o viata. Contactati-ne pentru o verificare juridica completa. Prima consultatie este gratuita!</p>
        <a href="/contact" style={{display:"inline-block",padding:"1rem 2.5rem",background:"white",color:"#1b5e20",borderRadius:"4px",textDecoration:"none",fontWeight:"bold",fontSize:"1.1rem"}}>Consultatie Gratuita</a>
      </div>
    </div>
  );
}
`, 'utf8');

// ?? App.tsx (updated - all 6 pages complete) ?????????????????????????????????
fs.writeFileSync(base + '/App.tsx', `import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicIntakeForm } from './components/PublicIntakeForm';
import { DreptCivil } from './pages/DreptCivil';
import { DreptComercial } from './pages/DreptComercial';
import { DreptPenal } from './pages/DreptPenal';
import { DreptulFamiliei } from './pages/DreptulFamiliei';
import { DreptulMuncii } from './pages/DreptulMuncii';
import { DreptImobiliar } from './pages/DreptImobiliar';
import './App.css';

const queryClient = new QueryClient();

const features = [
  { badge: 'CV', title: 'Drept Civil', desc: 'Asistenta juridica in litigii civile', link: '/servicii/drept-civil', color: '#1976d2' },
  { badge: 'CO', title: 'Drept Comercial', desc: 'Consultanta pentru companii', link: '/servicii/drept-comercial', color: '#1565c0' },
  { badge: 'PN', title: 'Drept Penal', desc: 'Aparare in procese penale', link: '/servicii/drept-penal', color: '#c62828' },
  { badge: 'FA', title: 'Dreptul Familiei', desc: 'Divort, partaj, custodie', link: '/servicii/dreptul-familiei', color: '#6a1b9a' },
  { badge: 'IM', title: 'Drept Imobiliar', desc: 'Tranzactii imobiliare sigure', link: '/servicii/drept-imobiliar', color: '#2e7d32' },
  { badge: 'MU', title: 'Dreptul Muncii', desc: 'Contestatie concediere, salarii', link: '/servicii/dreptul-muncii', color: '#e65100' },
];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <nav className="navbar">
            <div className="nav-container">
              <Link to="/" className="nav-brand">LegalRO</Link>
              <div className="nav-links">
                <Link to="/" className="nav-link">Acasa</Link>
                <Link to="/servicii/drept-civil" className="nav-link">Civil</Link>
                <Link to="/servicii/drept-comercial" className="nav-link">Comercial</Link>
                <Link to="/servicii/drept-penal" className="nav-link">Penal</Link>
                <Link to="/servicii/dreptul-familiei" className="nav-link">Familie</Link>
                <Link to="/servicii/drept-imobiliar" className="nav-link">Imobiliar</Link>
                <Link to="/servicii/dreptul-muncii" className="nav-link">Munca</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
              </div>
            </div>
          </nav>
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/contact" element={<PublicIntakeForm />} />
              <Route path="/servicii/drept-civil" element={<DreptCivil />} />
              <Route path="/servicii/drept-comercial" element={<DreptComercial />} />
              <Route path="/servicii/drept-penal" element={<DreptPenal />} />
              <Route path="/servicii/dreptul-familiei" element={<DreptulFamiliei />} />
              <Route path="/servicii/drept-imobiliar" element={<DreptImobiliar />} />
              <Route path="/servicii/dreptul-muncii" element={<DreptulMuncii />} />
            </Routes>
          </main>
          <footer className="footer"><p>2026 LegalRO - Cabinet de Avocatura</p></footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Cabinet de Avocatura LegalRO</h1>
        <p className="subtitle">Consultanta juridica de incredere pentru toate nevoile dumneavoastra</p>
        <div className="cta-section">
          <Link to="/contact" className="cta-button">Solicitati o Consultatie Gratuita</Link>
        </div>
      </div>
      <div className="features-section">
        <h2>Serviciile Noastre</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <Link key={i} to={f.link} className="feature-card-link">
              <div className="feature-card">
                <div className="feature-badge" style={{background: f.color + '22', color: f.color}}>{f.badge}</div>
                <h3 style={{color: f.color}}>{f.title}</h3>
                <p>{f.desc}</p>
                <span className="feature-more" style={{color: f.color}}>Afla mai mult ?</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="stats-section">
        <h2>De Ce Sa Ne Alegeti?</h2>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-number">15+</div><div className="stat-label">Ani Experienta</div></div>
          <div className="stat-card"><div className="stat-number">500+</div><div className="stat-label">Clienti</div></div>
          <div className="stat-card"><div className="stat-number">95%</div><div className="stat-label">Rata Succes</div></div>
          <div className="stat-card"><div className="stat-number">24/7</div><div className="stat-label">Disponibilitate</div></div>
        </div>
      </div>
    </div>
  );
}

export default App;
`, 'utf8');

// ?? App.css (unchanged check) ????????????????????????????????????????????????
var css = fs.readFileSync(base + '/App.css', 'utf8');
if (css.indexOf('feature-card-link') === -1) {
  css += '\n.feature-card-link{text-decoration:none;color:inherit;display:block;}' +
         '\n.feature-card{transition:transform 0.2s,box-shadow 0.2s;cursor:pointer;}' +
         '\n.feature-card-link:hover .feature-card{transform:translateY(-4px);box-shadow:0 6px 16px rgba(0,0,0,0.15);}' +
         '\n.feature-more{display:block;margin-top:0.75rem;font-weight:600;font-size:0.9rem;}' +
         '\n.feature-badge{width:56px;height:56px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;margin-bottom:1rem;letter-spacing:1px;}';
  fs.writeFileSync(base + '/App.css', css, 'utf8');
}

console.log('All files written OK - ALL 6 PAGES COMPLETE');
