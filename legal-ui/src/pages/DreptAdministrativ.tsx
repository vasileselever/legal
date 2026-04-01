export function DreptAdministrativ() {
  const services = [
    { icon: '???', title: 'Contencios Administrativ', desc: 'Contestarea actelor administrative ilegale în fa?a instan?elor de contencios administrativ.' },
    { icon: '??', title: 'Autoriza?ii ?i Avize', desc: 'Asisten?? în ob?inerea autoriza?iilor de construire, avizelor de mediu ?i altor permise administrative.' },
    { icon: '???', title: 'Urbanism ?i Amenajarea Teritoriului', desc: 'Consultan?? în proceduri de urbanism, PUZ, PUD ?i litigii privind documenta?iile de urbanism.' },
    { icon: '??', title: 'Achizi?ii Publice', desc: 'Asisten?? în proceduri de licita?ie, contesta?ii CNSC ?i litigii privind contractele de achizi?ie public?.' },
    { icon: '??', title: 'Control ?i Inspec?ii', desc: 'Reprezentare în fa?a autorit??ilor de control — ANAF, ITM, DSP, ISC — ?i contestarea sanc?iunilor.' },
    { icon: '??', title: 'Expropriere ?i Desp?gubiri', desc: 'Ap?rarea drepturilor proprietarilor în proceduri de expropriere pentru cauze de utilitate public?.' },
  ];
  const stats = [['200+', 'Acte Contestate'], ['90%', 'Rata Succes'], ['15+', 'Ani Experien??'], ['48h', 'Timp R?spuns']];
  const steps = [
    ['1', '#4527a0', 'Analiza Actului', 'Verific?m legalitatea actului administrativ ?i identific?m temeiurile de contestare.'],
    ['2', '#512da8', 'Strategia Juridic?', 'Stabilim cea mai bun? cale — contesta?ie administrativ? sau ac?iune în instan??.'],
    ['3', '#5e35b1', 'Reprezentare', 'V? reprezent?m în fa?a autorit??ilor ?i a instan?elor de contencios administrativ.'],
    ['4', '#7e57c2', 'Executarea Hot?rârii', 'Asigur?m punerea în executare a hot?rârilor favorabile ob?inute.'],
  ];
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#311b92,#4527a0)', color: 'white', padding: '3rem 2rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>???</div>
        <h1 style={{ margin: '0 0 1rem', fontSize: '2.5rem' }}>Drept Administrativ</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>Ap?rarea drepturilor cet??enilor ?i companiilor în rela?ia cu autorit??ile publice</p>
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
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Cum V? Ajut?m</h2>
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
        <h2 style={{ marginBottom: '1rem' }}>Contesta?i un Act Administrativ?</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9, fontSize: '1.1rem' }}>Nu a?tepta?i — termenele de contestare sunt scurte. Contacta?i-ne acum!</p>
        <a href="/contact" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: 'white', color: '#4527a0', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>Consulta?ie Gratuit?</a>
      </div>
    </div>
  );
}
