import { useCellStore } from '../store/useCellStore';

export default function ChatPanel() {
  const { users, cells } = useCellStore();

  const pinnedCells = Object.entries(cells)
    .filter(([, c]) => c?.pinned)
    .map(([id, c]) => ({ id, ...c }));

  return (
    <div style={panelStyle}>
      <div style={sectionTitle}>접속 중인 팀원</div>
      <div style={{ marginBottom: 14 }}>
        {users.length === 0
          ? <div style={muted}>접속자 없음</div>
          : users.map(u => (
            <div key={u.id || u.userId} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={dot(u.isPlanner ? '#1E2761' : '#4CAF50')} />
              <span style={{ fontSize: 13, color: '#1E293B' }}>{u.name || u.userName}</span>
              {u.isPlanner && <span style={badge('#1E2761')}>플래너</span>}
            </div>
          ))}
      </div>

      <div style={sectionTitle}>핀된 셀 ({pinnedCells.length}/5)</div>
      <div>
        {pinnedCells.length === 0
          ? <div style={muted}>핀된 셀 없음</div>
          : pinnedCells.map(c => {
            const status = c.dna?.status || 'undecided';
            const color = status === 'locked' ? '#1A237E' : status === 'confirmed' ? '#4CAF50' : '#F59E0B';
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={dot(color)} />
                <span style={{ fontSize: 13, color: '#1E293B', fontWeight: 600 }}>{c.id}</span>
                <span style={{ fontSize: 11, color: '#64748B' }}>
                  {status === 'locked' ? '🔒 잠금' : status === 'confirmed' ? '✓ 결정됨' : '··· 미결정'}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

const panelStyle = {
  width: 200, minWidth: 180, background: '#F8FAFC', borderLeft: '1px solid #E2E8F0',
  padding: 14, overflowY: 'auto',
};
const sectionTitle = { fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };
const muted = { fontSize: 12, color: '#94A3B8' };
const dot = (color) => ({ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 });
const badge = (bg) => ({ background: bg, color: '#fff', fontSize: 10, borderRadius: 4, padding: '1px 5px', fontWeight: 600 });
