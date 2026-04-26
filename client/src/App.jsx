import { useWebSocket } from './hooks/useWebSocket';
import { useCellStore } from './store/useCellStore';
import Grid from './components/Grid';
import DnaPanel from './components/DnaPanel';
import ChatPanel from './components/ChatPanel';

export default function App() {
  const { send } = useWebSocket();
  const { myInfo, users } = useCellStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', background: '#F1F5F9' }}>
      <header style={headerStyle}>
        <span style={{ fontWeight: 800, fontSize: 16, color: '#1E2761', letterSpacing: -0.5 }}>
          ⚡ 협업 워크스테이션 — Decision DNA
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {myInfo && (
            <span style={{ fontSize: 12, color: '#475569' }}>
              {myInfo.isPlanner ? '🟦 플래너' : '🟩 팀원'}: <b>{myInfo.userName}</b>
            </span>
          )}
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{users.length}명 접속 중</span>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <main style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1E2761', marginBottom: 10 }}>
              📊 2025 마케팅 성과 데이터
            </div>
            <Grid onSend={send} />
          </div>
        </main>

        <DnaPanel onSend={send} />
        <ChatPanel />
      </div>
    </div>
  );
}

const headerStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 20px', background: '#fff', borderBottom: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};
