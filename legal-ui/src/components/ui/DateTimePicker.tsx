/**
 * DateTimePicker — cross-browser guaranteed 24-hour date+time picker.
 *
 * Uses <input type="date"> for the date and two <select> dropdowns for
 * hours (00-23) and minutes (00, 05, 10 … 55).
 * Selects are pure numbers — they are 100% immune to the OS 12h/24h
 * locale setting, unlike type="time" or type="datetime-local".
 *
 * Value contract (same as datetime-local): "yyyy-MM-ddTHH:mm"
 */
interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  hasError?: boolean;
  required?: boolean;
  id?: string;
  /** Minute step for the dropdown, default 5 */
  minuteStep?: number;
}

export function DateTimePicker({
  value, onChange, style, hasError, required, id, minuteStep = 5,
}: DateTimePickerProps) {
  const [datePart, timePart] = value ? value.split('T') : ['', ''];
  const [hh, mm] = timePart ? timePart.split(':') : ['09', '00'];

  const base: React.CSSProperties = {
    padding: '0.55rem 0.5rem',
    border: '1px solid ' + (hasError ? '#ef5350' : '#ddd'),
    borderRadius: '6px',
    fontSize: '0.9rem',
    boxSizing: 'border-box',
    background: 'white',
    cursor: 'pointer',
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const today = new Date().toISOString().slice(0, 10);

  const emit = (d: string, h: string, m: string) =>
    onChange((d || today) + 'T' + pad(Number(h)) + ':' + pad(Number(m)));

  // Build hour options 00-23
  const hours = Array.from({ length: 24 }, (_, i) => pad(i));

  // Build minute options based on step
  const minutes: string[] = [];
  for (let m = 0; m < 60; m += minuteStep) minutes.push(pad(m));

  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', width: '100%', ...style }}>
      {/* Date */}
      <input
        id={id}
        type="date"
        required={required}
        value={datePart}
        onChange={e => emit(e.target.value, hh, mm)}
        style={{ ...base, flex: '1 1 auto', cursor: 'text' }}
      />

      {/* Hour select */}
      <select
        required={required}
        value={pad(Number(hh))}
        onChange={e => emit(datePart, e.target.value, mm)}
        style={{ ...base, width: '68px', flex: '0 0 auto', textAlign: 'center' }}
        aria-label="Ora"
      >
        {hours.map(h => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span style={{ fontWeight: 700, color: '#555', flexShrink: 0 }}>:</span>

      {/* Minute select */}
      <select
        required={required}
        value={minutes.includes(pad(Number(mm))) ? pad(Number(mm)) : minutes[0]}
        onChange={e => emit(datePart, hh, e.target.value)}
        style={{ ...base, width: '68px', flex: '0 0 auto', textAlign: 'center' }}
        aria-label="Minute"
      >
        {minutes.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
