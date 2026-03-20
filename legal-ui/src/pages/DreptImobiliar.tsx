
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
