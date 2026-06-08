'use client';
import { useState, useEffect } from 'react';
import BirthForm, { type BirthFormState } from '@/components/BirthForm';
import ChartBoard from '@/components/ChartBoard';
import InsightPanel from '@/components/InsightPanel';
import PatternsCard from '@/components/PatternsCard';
import ShareModal from '@/components/ShareModal';
import type { BirthInfo, ZiweiChart, Star, Palace } from '@/lib/ziwei/types';
import { formToSearchParams, formToBirthInfo } from '@/lib/ziwei/share';

export default function ChartPage() {
  const [chart, setChart] = useState<ZiweiChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedForm, setSavedForm] = useState<BirthFormState | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [view, setView] = useState<TimeView>('mingpan');
  const [liunianYear, setLiunianYear] = useState(new Date().getFullYear());
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);
  const [selectedSiHua, setSelectedSiHua] = useState<{ starName: string; siHua: string; view: TimeView } | null>(null);
  const [tab, setTab] = useState<'patterns' | 'ai'>('patterns');

  const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // URL auto-generate
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('y')) return;
    handleGenerate({
      year: parseInt(params.get('y') || '') || 2000,
      month: parseInt(params.get('m') || '') || 1,
      day: parseInt(params.get('d') || '') || 1,
      hour: parseInt(params.get('h') || '') || 0,
      gender: (params.get('g') || 'male') as 'male' | 'female',
    });
  }, []);

  const handleSubmit = async (info: BirthInfo) => {
    setSavedForm({
      name: info.name || '', year: String(info.year), month: String(info.month),
      day: String(info.day), clockHour: '0', clockMinute: '0', unknownTime: false,
      province: info.province || '', city: info.city || '', longitude: info.longitude || 120, gender: info.gender,
    });
    await handleGenerate(info);
  };

  const handleGenerate = async (info: BirthInfo) => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(info) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '命盘生成失败'); }
      const result = await res.json();
      setChart(result); setSelectedPalace(null); setSelectedSiHua(null); setView('mingpan');
    } catch (e: any) { setError(e.message || '命盘生成失败'); }
    finally { setLoading(false); }
  };

  const currentDx = chart?.daXians?.[chart.currentDaXianIndex];
  const mingPalace = chart?.palaces?.find(p => p.isMingGong);
  const shenPalace = chart?.palaces?.find(p => p.isShenGong);

  return (
    <div>
      {!chart ? (
        <div style={{ maxWidth: 420, margin: '60px auto', padding: '0 16px' }}>
          <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, color: 'var(--tx-1)', marginBottom: 8 }}>紫微斗数 · 在线排盘</h1>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--tx-3)', marginBottom: 24 }}>输入生辰，即刻生成你的专属命盘</p>
          {error && <div style={{ color: '#e74c3c', textAlign: 'center', marginBottom: 12, fontSize: 13, background: 'rgba(231,76,60,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
          <BirthForm onSubmit={handleSubmit} loading={loading} />
        </div>
      ) : (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 40px' }}>

          {/* ── 顶部信息栏 ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', marginBottom: 16, borderRadius: 12,
            background: 'var(--bg-card)', border: '1px solid var(--bdr)',
            flexWrap: 'wrap', gap: 8,
          }}>
            <div style={{ fontSize: 13, color: 'var(--tx-2)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--tx-1)', fontWeight: 600 }}>
                {chart.birthInfo.name || '命主'}
              </span>
              <span style={{ margin: '0 6px', color: 'var(--tx-3)' }}>·</span>
              {chart.birthInfo.gender === 'male' ? '男' : '女'}
              <span style={{ margin: '0 6px', color: 'var(--tx-3)' }}>·</span>
              {chart.lunarInfo.lunarYear}年{chart.lunarInfo.lunarMonth}月{chart.lunarInfo.lunarDay}日
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx-3)', display: 'flex', gap: 8 }}>
              <span>命宫<strong style={{ color: 'var(--t-gold)', marginLeft: 2 }}>{BRANCHES[chart.mingGongBranch]}</strong></span>
              <span>身宫<strong style={{ color: '#60a5fa', marginLeft: 2 }}>{BRANCHES[chart.shenGongBranch]}</strong></span>
              <span style={{ color: 'var(--t-gold)' }}>{chart.wuxingJuName}</span>
            </div>
          </div>

          {/* ── 时间切换 ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
            {(['mingpan', 'daxian', 'liunian'] as TimeView[]).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '5px 16px', borderRadius: 20, border: view === v ? '1px solid var(--t-gold)' : '1px solid var(--bdr)',
                background: view === v ? 'rgba(212,168,67,0.1)' : 'transparent',
                color: view === v ? 'var(--t-gold)' : 'var(--tx-3)', fontSize: 12, cursor: 'pointer', fontWeight: view === v ? 600 : 400,
              }}>{v === 'mingpan' ? '命盘' : v === 'daxian' ? '大限' : '流年'}</button>
            ))}
            {view === 'liunian' && (
              <select value={liunianYear} onChange={e => setLiunianYear(Number(e.target.value))}
                style={{ padding: '5px 10px', borderRadius: 20, border: '1px solid var(--bdr)', background: 'transparent', color: 'var(--tx-1)', fontSize: 12, cursor: 'pointer' }}>
                {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - 15 + i).map(y => <option key={y} value={y}>{y}年</option>)}
              </select>
            )}
          </div>

          {/* ── 命盘 ── */}
          <ChartBoard chart={chart}
            onStarSelect={(star, palace) => { setSelectedPalace(palace); }}
            onPalaceSelect={p => setSelectedPalace(p)}
            onSiHuaClick={(starName, siHua) => setSelectedSiHua({ starName, siHua, view })}
          />

          {/* ── 大限信息 ── */}
          {currentDx && (
            <div style={{ textAlign: 'center', margin: '16px 0', fontSize: 13, color: 'var(--tx-2)' }}>
              当前大限：<strong style={{ color: '#a78bfa' }}>{currentDx.palaceName}</strong>
              <span style={{ margin: '0 8px', color: 'var(--tx-3)' }}>|</span>
              <span>{currentDx.startAge}–{currentDx.endAge}岁</span>
              <span style={{ margin: '0 8px', color: 'var(--tx-3)' }}>|</span>
              当前 {chart.currentAge} 岁
            </div>
          )}

          {/* ── Tab 切换：格局 / AI 解读 ── */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--bdr)', marginBottom: 16 }}>
              {[
                { key: 'patterns' as const, label: '格局分析' },
                { key: 'ai' as const, label: 'AI 解读' },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: '8px 20px', border: 'none', borderBottom: tab === t.key ? '2px solid var(--t-gold)' : '2px solid transparent',
                  background: 'none', color: tab === t.key ? 'var(--t-gold)' : 'var(--tx-3)', fontSize: 13, cursor: 'pointer', fontWeight: tab === t.key ? 600 : 400,
                }}>{t.label}</button>
              ))}
            </div>
            {tab === 'patterns' && <PatternsCard chart={chart} />}
            {tab === 'ai' && <InsightPanel chart={chart} selectedPalace={selectedPalace} selectedSiHua={selectedSiHua} />}
          </div>

          {/* ── 底部操作 ── */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
            <button onClick={() => { setChart(null); setError(''); setSavedForm(null); setView('mingpan'); }}
              style={{ padding: '8px 28px', borderRadius: 20, border: '1px solid var(--bdr)', background: 'none', color: 'var(--tx-2)', fontSize: 13, cursor: 'pointer' }}>
              重新起盘
            </button>
            <button onClick={() => setShareModalOpen(true)}
              style={{ padding: '8px 28px', borderRadius: 20, border: '1px solid var(--t-gold)', background: 'rgba(212,168,67,0.08)', color: 'var(--t-gold)', fontSize: 13, cursor: 'pointer' }}>
              分享命盘
            </button>
          </div>

          {savedForm && (
            <ShareModal open={shareModalOpen} onClose={() => setShareModalOpen(false)} shareUrl={typeof window !== 'undefined' ? `${window.location.origin}/chart?${formToSearchParams(savedForm)}` : ''} chart={chart} birth={{ year: savedForm.year, month: savedForm.month, day: savedForm.day, hour: savedForm.clockHour, minute: savedForm.clockMinute, gender: savedForm.gender, city: savedForm.city || undefined }} />
          )}
        </div>
      )}
    </div>
  );
}

