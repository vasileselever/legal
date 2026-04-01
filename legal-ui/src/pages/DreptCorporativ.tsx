export function DreptCorporativ() {
  const services = [
    { icon: '??', title: 'Constituire Societ??i', desc: 'Înfiin?are SRL, SA, SNC, asocia?ii ?i funda?ii. Redactarea actelor constitutive ?i înregistrarea la ONRC.' },
    { icon: '??', title: 'Guvernan?? Corporativ?', desc: 'Regulamente interne, hot?râri AGA ?i CA, politici de conformitate ?i structuri de conducere.' },
    { icon: '??', title: 'Fuziuni ?i Diviz?ri', desc: 'Asisten?? juridic? complet? în opera?iuni de fuziune, divizare ?i restructurare corporativ?.' },
    { icon: '??', title: 'Due Diligence', desc: 'Audit juridic al companiilor în vederea tranzac?iilor de vânzare-cump?rare de ac?iuni sau active.' },
    { icon: '??', title: 'Contracte între Asocia?i', desc: 'Pacte de ac?ionari, acorduri de tag-along, drag-along ?i alte mecanisme de protec?ie a investitorilor.' },
    { icon: '??', title: 'Drept Corporativ Interna?ional', desc: 'Structuri holding, subsidiare interna?ionale ?i conformitate cu reglement?rile UE.' },
  ];
  const stats = [['50+', 'Companii Constituite'], ['30+', 'Fuziuni Asistate'], ['100%', 'Conformitate'], ['24h', 'Timp R?spuns']];
  const steps = [
    ['1', '#00695c', 'Analiza Structurii', 'Evalu?m cea mai potrivit? form? juridic? pentru obiectivele dumneavoastr? de business.'],
    ['2', '#00796b', 'Redactare Acte', 'Preg?tim toate documentele necesare — act constitutiv, regulamente, procuri.'],
    ['3', '#00897b', 'Înregistrare', 'Reprezent?m societatea în fa?a ONRC, ANAF ?i oric?ror alte autorit??i competente.'],
    ['4', '#4caf50', 'Suport Continuu', 'Asigur?m conformitatea juridic? permanent? pe tot parcursul vie?ii companiei.'],
  ];
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#004d40,#00695c)', color: 'white', padding: '3rem 2rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>??</div>
        <h1 style={{ margin: '0 0 1rem', fontSize: '2.5rem' }}>Drept Corporativ</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>Consultan?? juridic? specializat? pentru structurarea ?i administrarea afacerilor</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {services.map((s, i) => (
          <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderTop: '4px solid #00695c' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
            <h3 style={{ color: '#00695c', marginBottom: '0.5rem' }}>{s.title}</h3>
            <p style={{ color: '#666', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>Experien?a Noastr?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem', background: '#e0f2f1', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00695c' }}>{s[0]}</div>
              <div style={{ color: '#666', marginTop: '0.5rem' }}>{s[1]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Procesul Nostru</h2>
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
      <div style={{ background: '#00695c', color: 'white', padding: '2.5rem', borderRadius: '8px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Ave?i Nevoie de Consultan?? Corporativ??</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9, fontSize: '1.1rem' }}>Contacta?i-ne ast?zi pentru o consulta?ie gratuit?!</p>
        <a href="/contact" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: 'white', color: '#00695c', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>Consulta?ie Gratuit?</a>
      </div>
    </div>
  );
}
