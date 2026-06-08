'use client';
export type TimeView = 'mingpan' | 'daxian' | 'liunian' | 'liuyue';

interface TopBarProps {
  chart: any;
  view: TimeView;
  liunianYear: number;
  liuyueMonth: number;
  onViewChange: (v: TimeView) => void;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onShare?: () => void;
  onExport?: () => void;
  copied?: boolean;
}

const VIEW_LABELS: Record<TimeView, string> = {
  mingpan: '命盘',
  daxian: '大限',
  liunian: '流年',
  liuyue: '流月',
};

export default function TopBar({ view, onViewChange, liunianYear, liuyueMonth, onYearChange, onMonthChange, onShare, onExport, copied }: TopBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--bdr)', flexWrap: 'wrap', gap: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {(Object.keys(VIEW_LABELS) as TimeView[]).map(v => (
          <button key={v} onClick={() => onViewChange(v)}
            style={{
              padding: '4px 14px', borderRadius: 'var(--r-pill)', fontSize: 12, fontWeight: view === v ? 600 : 400,
              border: '1px solid var(--bdr)', cursor: 'pointer',
              background: view === v ? 'var(--bg-active)' : 'transparent',
              color: view === v ? 'var(--tx-1)' : 'var(--tx-3)',
            }}
          >{VIEW_LABELS[v]}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {(view === 'liunian' || view === 'liuyue') && (
          <>
            <select value={liunianYear} onChange={e => onYearChange(Number(e.target.value))}
              style={{ padding: '4px 8px', border: '1px solid var(--bdr)', borderRadius: 6, fontSize: 12, background: 'transparent', color: 'var(--tx-1)' }}>
              {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i).map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
            {view === 'liuyue' && (
              <select value={liuyueMonth} onChange={e => onMonthChange(Number(e.target.value))}
                style={{ padding: '4px 8px', border: '1px solid var(--bdr)', borderRadius: 6, fontSize: 12, background: 'transparent', color: 'var(--tx-1)' }}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}月</option>)}
              </select>
            )}
          </>
        )}
        {onShare && <button onClick={onShare} style={{ padding: '4px 12px', border: '1px solid var(--bdr)', borderRadius: 'var(--r-pill)', fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--tx-2)' }}>{copied ? '已复制' : '分享'}</button>}
        {onExport && <button onClick={onExport} style={{ padding: '4px 12px', border: '1px solid var(--bdr)', borderRadius: 'var(--r-pill)', fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--tx-2)' }}>导出</button>}
      </div>
    </div>
  );
}
