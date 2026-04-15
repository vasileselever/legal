export function AlteServicii() {
  const services = [
    { icon: '', title: 'Drept Fiscal', desc: 'Contestatii decizii ANAF, optimizare fiscala, litigii cu organele fiscale si asistenta in inspectii fiscale.' },
    { icon: '', title: 'Drept International Privat', desc: 'Recunoasterea hotararilor strtine, conflicte de legi, divorturi internationale si adoptii transfrontaliere.' },
    { icon: '', title: 'Drept IT si GDPR', desc: 'Conformitate GDPR, politici de confidentialitate, contracte software si protectia datelor cu caracter personal.' },
    { icon: '', title: 'Drept Medical', desc: 'Malpraxis medical, raspunderea spitalelor si medicilor, contracte in domeniul sanatstii.' },
    { icon: '', title: 'Drept Mediu', desc: 'Litigii de mediu, autorizatii de mediu, raspundere pentru poluare si consultanta pentru proiecte verzi.' },
    { icon: '', title: 'Dreptul Transporturilor', desc: 'Litigii in transporturi rutiere, aeriene si maritime, raspundere transportatori, asigurari cargo.' },
  ];
  const stats = [['15+', 'Ani Experienta'], ['300+', 'Cazuri Solutionate'], ['98%', 'Cliensi Multumiti'], ['24h', 'Timp Raspuns']];
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#37474f,#546e7a)', color: 'white', padding: '3rem 2rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
        <h1 style={{ margin: '0 0 1rem', fontSize: '2.5rem' }}>Alte Servicii Juridice</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>Consultanta specializata in domenii juridice de nita si interdisciplinare</p>
      </div>

      <div style={{ background: '#fff8e1', border: '2px solid #ffcc02', padding: '1.25rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '2rem', flexShrink: 0 }}></div>
        <div>
          <h3 style={{ color: '#f57f17', margin: '0 0 0.5rem' }}>Nu gasiti domeniul potrivita</h3>
          <p style={{ color: '#795548', margin: 0 }}>Daca problema dumneavoastra juridica nu se incadreaza in categoriile principale, contactati-ne oricum. Cabinetul nostru acopera o gama larga de domenii sau va poate indruma catre specialisti din reteaua noastra.</p>
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
        <h2 style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>De Ce Sa Ne Alegeti</h2>
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
        <h2 style={{ marginBottom: '1rem' }}>Avesi o Problema Juridicta</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9, fontSize: '1.1rem' }}>Indiferent de domeniu, suntem aici sa va ajutam. Prima consultatie este gratuita!</p>
        <a href="/contact" style={{ display: 'inline-block', padding: '1rem 2.5rem', background: 'white', color: '#546e7a', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>Consultatie Gratuita</a>
      </div>
    </div>
  );
}
