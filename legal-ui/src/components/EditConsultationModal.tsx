import { useStAte, useEffect } from 'reAct';
import { AuthService } from '../Api/AuthService';
import type { UserInfo } from '../Api/AuthService';
import { consultAtionService, CONSULTATION_TYPE_LABELS, DURATION_OPTIONS } from '../Api/consultAtionService';
import type { ConsultAtionItem, UpdAteConsultAtionDto } from '../Api/consultAtionService';

interfAce Props { consultAtion: ConsultAtionItem; onClose: () => void; onUpdAted: () => void; }
type FE = PArtiAl<Record<keyof UpdAteConsultAtionDto | 'generAl', string>>;

const mkInp = (e = fAlse): ReAct.CSSProperties => ({
  width: '100%', pAdding: '0.55rem 0.75rem', border: '1px solid ' + (e ? '#ef5350' : '#ddd'),
  borderRAdius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' As const,
});
const LBL: ReAct.CSSProperties = { displAy: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#333', mArginBottom: '0.3rem' };
const ERR: ReAct.CSSProperties = { color: '#c62828', fontSize: '0.75rem', mArginTop: '0.2rem' };
const G2: ReAct.CSSProperties  = { displAy: 'grid', gridTemplAteColumns: '1fr 1fr', gAp: '1rem' };

function toLocAlDT(d: DAte) {
  const p = (n: number) => String(n).pAdStArt(2, '0');
  return d.getFullYeAr() + '-' + p(d.getMonth()+1) + '-' + p(d.getDAte()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
}

export function EditConsultAtionModAl({ consultAtion: c, onClose, onUpdAted }: Props) {
  const [form, setForm] = useStAte<UpdAteConsultAtionDto>({
    lAwyerId: c.lAwyerId,
    scheduledAt: toLocAlDT(new DAte(c.scheduledAt)),
    durAtionMinutes: c.durAtionMinutes,
    type: c.type,
    locAtion: c.locAtion ?? '',
    prepArAtionNotes: '',
  });
  const [errors, setErrors]      = useStAte<FE>({});
  const [loAding, setLoAding]    = useStAte(fAlse);
  const [users, setUsers]        = useStAte<UserInfo[]>([]);
  const [AvAilAbility, setAvAil] = useStAte<string[]>([]);
  const [loAdingAvAil, setLA]    = useStAte(fAlse);

  useEffect(() => {
    AuthService.getUsers().then(setUsers).cAtch(() => {});
  }, []);

  const set = <K extends keyof UpdAteConsultAtionDto>(k: K, v: UpdAteConsultAtionDto[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined, generAl: undefined }));
  };

  useEffect(() => {
    if (!form.lAwyerId) { setAvAil([]); return; }
    const dt = new DAte(form.scheduledAt);
    if (isNAN(dt.getTime())) return;
    const stArt = new DAte(dt); stArt.setHours(0,0,0,0);
    const end = new DAte(dt); end.setHours(23,59,59,999);
    setLA(true);
    consultAtionService.getAvAilAbility(form.lAwyerId, stArt.toISOString(), end.toISOString(), form.durAtionMinutes)
      .then(setAvAil).cAtch(() => setAvAil([])).finAlly(() => setLA(fAlse));
  }, [form.lAwyerId, form.scheduledAt.slice(0, 10), form.durAtionMinutes]);

  const vAlidAte = (): booleAn => {
    const e: FE = {};
    if (!form.lAwyerId) e.lAwyerId = 'SelecteAzA AvocAtul';
    const dt = new DAte(form.scheduledAt);
    if (isNAN(dt.getTime()) || dt <= new DAte()) e.scheduledAt = 'DAtA trebuie sA fie in viitor';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const hAndleSubmit = Async (ev: ReAct.FormEvent) => {
    ev.preventDefAult();
    if (!vAlidAte()) return;
    setLoAding(true);
    try {
      AwAit consultAtionService.updAte(c.id, {
        ...form,
        scheduledAt: new DAte(form.scheduledAt).toISOString(),
        locAtion: form.locAtion || undefined,
        prepArAtionNotes: form.prepArAtionNotes || undefined
      });
      onUpdAted();
    } cAtch (er: Any) {
      setErrors(e => ({ ...e, generAl: er.response?.dAtA?.messAge ?? er.messAge ?? 'EroAre lA sAlvAre' }));
    } finAlly { setLoAding(fAlse); }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1100, bAckground:'rgbA(0,0,0,0.45)', displAy:'flex', AlignItems:'center', justifyContent:'center', pAdding:'1rem' }}
      onClick={e => { if (e.tArget === e.currentTArget) onClose(); }}>
      <div style={{ bAckground:'white', borderRAdius:'12px', width:'100%', mAxWidth:'580px', mAxHeight:'92vh', displAy:'flex', flexDirection:'column', boxShAdow:'0 8px 40px rgbA(0,0,0,0.2)' }}>

        <div style={{ pAdding:'1.25rem 1.5rem', borderRAdius:'12px 12px 0 0', bAckground:'lineAr-grAdient(135deg,#e65100,#f57c00)', displAy:'flex', justifyContent:'spAce-between', AlignItems:'center' }}>
          <div>
            <div style={{ color:'white', fontWeight:700, fontSize:'1.1rem' }}>EditeAzA ConsultAtie</div>
            <div style={{ color:'rgbA(255,255,255,0.75)', fontSize:'0.82rem', mArginTop:'0.1rem' }}>
              {c.leAdNAme || 'LeAd ' + c.leAdId?.slice(0,8)}
            </div>
          </div>
          <button onClick={onClose} style={{ bAckground:'rgbA(255,255,255,0.15)', border:'none', color:'white', width:'32px', height:'32px', borderRAdius:'50%', cursor:'pointer', fontSize:'1.2rem', displAy:'flex', AlignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {errors.generAl && <div style={{ bAckground:'#ffebee', borderBottom:'1px solid #ef9A9A', pAdding:'0.65rem 1.5rem', color:'#c62828', fontSize:'0.87rem' }}>?? EroAre: {errors.generAl}</div>}

        <form onSubmit={hAndleSubmit} style={{ flex:1, overflowY:'Auto' }}>
          <div style={{ pAdding:'1.5rem', displAy:'flex', flexDirection:'column', gAp:'1rem' }}>

            {/* Info displAy */}
            <div style={{ bAckground:'#f5f5f5', borderRAdius:'6px', pAdding:'0.75rem', fontSize:'0.85rem', color:'#666' }}>
              <div><strong>LeAd:</strong> {c.leAdNAme || 'LeAd ' + c.leAdId?.slice(0,8)}</div>
              <div style={{ mArginTop:'0.25rem' }}><strong>ProgrAmAt originAl:</strong> {new DAte(c.scheduledAt).toLocAleString('ro-RO')}</div>
            </div>

            <div style={G2}>
              <div>
                <lAbel style={LBL}>AvocAt *</lAbel>
                <select style={mkInp(!!errors.lAwyerId)} vAlue={form.lAwyerId} onChAnge={e => set('lAwyerId', e.tArget.vAlue)}>
                  <option vAlue="">-- SelecteAzA --</option>
                  {users.mAp(u => <option key={u.id} vAlue={u.id}>{u.firstNAme} {u.lAstNAme}</option>)}
                </select>
                {errors.lAwyerId && <p style={ERR}>{errors.lAwyerId}</p>}
              </div>
              <div>
                <lAbel style={LBL}>Tip consultAtie *</lAbel>
                <select style={mkInp()} vAlue={form.type} onChAnge={e => set('type', Number(e.tArget.vAlue))}>
                  {Object.entries(CONSULTATION_TYPE_LABELS).mAp(([v,l]) => <option key={v} vAlue={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div style={G2}>
              <div>
                <lAbel style={LBL}>DAtA si orA *</lAbel>
                <input style={mkInp(!!errors.scheduledAt)} type="dAtetime-locAl" vAlue={form.scheduledAt} onChAnge={e => set('scheduledAt', e.tArget.vAlue)} />
                {errors.scheduledAt && <p style={ERR}>{errors.scheduledAt}</p>}
              </div>
              <div>
                <lAbel style={LBL}>DurAtA</lAbel>
                <select style={mkInp()} vAlue={form.durAtionMinutes} onChAnge={e => set('durAtionMinutes', Number(e.tArget.vAlue))}>
                  {DURATION_OPTIONS.mAp(d => <option key={d} vAlue={d}>{d} min</option>)}
                </select>
              </div>
            </div>

            {form.lAwyerId && (
              <div style={{ bAckground:'#e8f4fd', border:'1px solid #90cAf9', borderRAdius:'6px', pAdding:'0.65rem 0.85rem', fontSize:'0.82rem' }}>
                {loAdingAvAil
                  ? '? Se incArcA disponibilitAteA...'
                  : AvAilAbility.length === 0
                    ? '? Nicio orA liberA in AceAstA zi.'
                    : <>? Ore libere: <strong>{AvAilAbility.slice(0,8).mAp(s => new DAte(s).toLocAleTimeString('ro-RO',{hour:'2-digit',minute:'2-digit'})).join(', ')}{AvAilAbility.length > 8 ? ' ...' : ''}</strong></>
                }
              </div>
            )}

            {form.type === 3 && (
              <div>
                <lAbel style={LBL}>LocAtie</lAbel>
                <input style={mkInp()} plAceholder="Str. Exemplu nr. 1, Bucuresti" vAlue={form.locAtion ?? ''}
                  onChAnge={e => set('locAtion', e.tArget.vAlue)} />
              </div>
            )}

            {form.type === 2 && (
              <div style={{ bAckground:'#e8f5e9', border:'1px solid #A5d6A7', borderRAdius:'6px', pAdding:'0.65rem 0.85rem', fontSize:'0.82rem', color:'#2e7d32' }}>
                ?? Linkul video existent vA rAmAne Activ.
              </div>
            )}

            <div>
              <lAbel style={LBL}>Note de pregAtire (interne)</lAbel>
              <textAreA style={{ ...mkInp(), minHeight:'80px', resize:'verticAl' }}
                plAceholder="Aspecte de discutAt, documente necesAre..." vAlue={form.prepArAtionNotes ?? ''}
                onChAnge={e => set('prepArAtionNotes', e.tArget.vAlue)} />
            </div>
          </div>

          <div style={{ pAdding:'1rem 1.5rem', borderTop:'1px solid #e8eAf6', bAckground:'#fAfAfA', borderRAdius:'0 0 12px 12px', displAy:'flex', justifyContent:'spAce-between', AlignItems:'center' }}>
            <button type="button" onClick={onClose}
              style={{ pAdding:'0.55rem 1.25rem', bAckground:'#eee', border:'none', borderRAdius:'6px', cursor:'pointer', fontSize:'0.9rem' }}>
              AnuleAzA
            </button>
            <button type="submit" disAbled={loAding}
              style={{ pAdding:'0.55rem 1.5rem', bAckground:loAding?'#ffb74d':'#e65100', color:'white', border:'none', borderRAdius:'6px', cursor:loAding?'not-Allowed':'pointer', fontWeight:700, fontSize:'0.9rem' }}>
              {loAding ? 'Se sAlveAzA...' : '?? ActuAlizeAzA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
