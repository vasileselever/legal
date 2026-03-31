export function AlteServicii() {
  const services = [
    { icon: '??', title: 'Drept Fiscal', desc: 'Contesta?ii decizii ANAF, optimizare fiscal?, litigii cu organele fiscale ?i asisten?? în inspec?ii fiscale.' },
    { icon: '??', title: 'Drept Interna?ional Privat', desc: 'Recunoa?terea hot?rârilor str?ine, conflicte de legi, divor?uri interna?ionale ?i adop?ii transfrontaliere.' },
    { icon: '??', title: 'Drept IT ?i GDPR', desc: 'Conformitate GDPR, politici de confiden?ialitate, contracte software ?i protec?ia datelor cu caracter personal.' },
    { icon: '??', title: 'Drept Medical', desc: 'Malpraxis medical, r?spunderea spitalelor ?i medicilor, contracte în domeniul s?n?t??ii.' },
    { icon: '??', title: 'Drept Mediu', desc: 'Litigii de mediu, autoriza?ii de mediu, r?spundere pentru poluare ?i consultan?? pentru proiecte verzi.' },
    { icon: '??', title: 'Dreptul Transporturilor', desc: 'Litigii în transporturi rutiere, aeriene ?i maritime, r?spundere transportatori, asigur?ri cargo.' },
  ];
  const stats = [['15+', 'Ani Experien??'], ['300+', 'Cazuri Solu?ionate'], ['98%', 'Clien?i Mul?umi?i'], ['24h', 'Timp R?spuns']];
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#37474f,#546e7a)', color: 'white', padding: '3rem 2rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>??</div>
        <h1 style={{ margin: '0 0 1rem', fontSize: '2.5rem' }}>Alte Servicii Juridice</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>Consultan?? specializat? în domenii juridice de ni?? ?i interdisciplinare</p>
      </div>

      <div style={{ background: '#fff8e1', border: '2px solid #ffcc02', padding: '1.25rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '2rem', flexShrink: 0 }}>??</div>
        <div>
          <h3 style={{ color: '#f57f17', margin: '0 0 0.5rem' }}>Nu g?si?i domeniul potrivit?</h3>
          <p style={{ color: '#795548', margin: 0 }}>Dac? problema dumneavoastr? juridic? nu se încadreaz? în categoriile principale, contacta?i-ne oricum. Cabinetul nostru acoper? o gam? larg? de domenii sau v? poate îndruma c?tre speciali?ti din re?eaua noastr?.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {services.map((s, i) => (
          <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderTop: '4px solid #546e7a' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
            <h3 style={{ color: '#546e7a', marginBottom: '0.5rem' }}>{s.title}</h3>
            <p style={{ color: '#666', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>{s.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>De Ce S? Ne Alege?i</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1.5rem', background: '#eceff1', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#546e7a' }}>{s[0]}</div>
              <div style={{ color: '#666', marginTop: '0.5rem' }}>{s[1]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#546e7a', color: 'white', padding: '2.5rem', borderRadius: '8px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Ave?i o Problem? Juridic??</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9, fontSize: '1.1rem' }}>Indiferent de domeniu, suntem aici s? v? ajut?m. Prima consulta?ie este gratuit?!</p>
        <a href="/contact" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: 'white', color: '#546e7a', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>Consulta?ie Gratuit?</a>
      </div>
    </div>
  );
}
