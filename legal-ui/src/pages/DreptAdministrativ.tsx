export function DreptAdministrativ() {
  const services = [
    { icon: '', title: 'Contencios Administrativ', desc: 'Contestarea actelor administrative ilegale in fata instantaelor de contencios administrativ.' },
    { icon: '', title: 'Autorizatii si Avize', desc: 'Asistenta in obtinerea autorizatiilor de construire, avizelor de mediu si altor permise administrative.' },
    { icon: '', title: 'Urbanism si Amenajarea Teritoriului', desc: 'Consultanta in proceduri de urbanism, PUZ, PUD si litigii privind documentatiile de urbanism.' },
    { icon: '', title: 'Achizitii Publice', desc: 'Asistenta in proceduri de licitatie, contestatii CNSC si litigii privind contractele de achizitie publica.' },
    { icon: '', title: 'Control si Inspectii', desc: 'Reprezentare in fata autoritatilor de control - ANAF, ITM, DSP, ISC - si contestarea sanctiiunilor.' },
    { icon: '', title: 'Expropriere si Despagubiri', desc: 'Apararea drepturilor proprietarilor in proceduri de expropriere pentru cauze de utilitate publica.' },
  ];
  const stats = [['200+', 'Acte Contestate'], ['90%', 'Rata Succes'], ['15+', 'Ani Experienta'], ['48h', 'Timp Raspuns']];
  const steps = [
    ['1', '#4527a0', 'Analiza Actului', 'Verificam legalitatea actului administrativ si identificam temeiurile de contestare.'],
    ['2', '#512da8', 'Strategia Juridica', 'Stabilim cea mai buna cale - contestatie administrativa sau actiune in instanta.'],
    ['3', '#5e35b1', 'Reprezentare', 'Va reprezentam in fata autoritatilor si a instantelor de contencios administrativ.'],
    ['4', '#7e57c2', 'Executarea Hotararii', 'Asiguram punerea in executare a hotararilor favorabile obtinute.'],
  ];
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#311b92,#4527a0)', color: 'white', padding: '3rem 2rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
        <h1 style={{ margin: '0 0 1rem', fontSize: '2.5rem' }}>Drept Administrativ</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>Apararea drepturilor cetatenilor si companiilor in relatia cu autoritatile publice</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {services.map((s, i) => (
          <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderTop: '4px solid #4527a0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
            <h3 style={{ color: '#4527a0', marginBottom: '0.5rem' }}>{s.title}</h3>
            <p style={{ color: '#666', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Rezultatele Noastre</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem', background: '#ede7f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4527a0' }}>{s[0]}</div>
              <div style={{ color: '#666', marginTop: '0.5rem' }}>{s[1]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Cum Va Ajutam</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step[1], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>{step[0]}</div>
              <div>
                <h4 style={{ color: '#333', margin: '0 0 0.25rem' }}>{step[2]}</h4>
                <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>{step[3]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#4527a0', color: 'white', padding: '2.5rem', borderRadius: '8px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Contestati un Act Administrativ?</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9, fontSize: '1.1rem' }}>Nu asteptati - termenele de contestare sunt scurte. Contactati-ne acum!</p>
        <a href="/contact" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: 'white', color: '#4527a0', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>Consultatie Gratuita</a>
      </div>
    </div>
  );
}
