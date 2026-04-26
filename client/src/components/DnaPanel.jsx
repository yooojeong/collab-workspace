import { useState, useEffect, useRef } from 'react';
import { useCellStore } from '../store/useCellStore';
import StatusBadge from './StatusBadge';

export default function DnaPanel({ onSend }) {
  const { cells, selectedCell, myInfo } = useCellStore();
  const [chatInput, setChatInput] = useState('');
  const [deadline, setDeadline] = useState('');
  const [countdown, setCountdown] = useState(null);
  const chatEndRef = useRef(null);

  const cell = selectedCell ? cells[selectedCell] : null;
  const dna = cell?.dna || {};
  const chats = dna.chats || [];
  const status = dna.status || 'undecided';
  const isPlanner = myInfo?.isPlanner;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  useEffect(() => {
    if (status !== 'confirmed' || !dna.confirmedAt) {
      setCountdown(null);
      return;
    }
    function tick() {
      const elapsed = Date.now() - new Date(dna.confirmedAt).getTime();
      const remaining = 300000 - elapsed;
      if (remaining <= 0) { setCountdown(null); return; }
      setCountdown(Math.ceil(remaining / 1000));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, dna.confirmedAt]);

  if (!selectedCell || !cell?.pinned) {
    return (
      <div style={panelStyle}>
        <div style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 60 }}>
          셀을 클릭하면 Decision DNA 패널이 열립니다
        </div>
      </div>
    );
  }

  function handleSendChat() {
    const text = chatInput.trim();
    if (!text) return;
    onSend({ type: 'CHAT_MSG', cellId: selectedCell, text });
    setChatInput('');
  }

  function handleConfirm() {
    if (window.confirm(`"${selectedCell}" 셀의 결정을 확정하시겠습니까?`)) {
      onSend({ type: 'CONFIRM_DECISION', cellId: selectedCell });
    }
  }

  function handleCancel() {
    if (window.confirm('결정을 취소하시겠습니까?')) {
      onSend({ type: 'CANCEL_DECISION', cellId: selectedCell });
    }
  }

  function handleSetDeadline() {
    if (!deadline) return;
    onSend({ type: 'SET_DEADLINE', cellId: selectedCell, deadline });
    setDeadline('');
  }

  const fmtTime = (iso) => iso ? new Date(iso).toLocaleString('ko-KR') : '-';

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#1E2761' }}>
          📌 {selectedCell} Decision DNA
        </span>
        <StatusBadge status={status} deadlineExpired={dna.deadlineExpired} />
      </div>

      {status === 'locked' && (
        <div style={infoBox('#EEF2FF', '#3730A3')}>
          <div><b>결정자:</b> {dna.confirmedBy || '-'}</div>
          <div><b>확정일시:</b> {fmtTime(dna.confirmedAt)}</div>
          {dna.deadline && <div><b>데드라인:</b> {fmtTime(dna.deadline)}</div>}
        </div>
      )}

      {status === 'confirmed' && countdown !== null && (
        <div style={infoBox('#FEF9C3', '#92400E')}>
          ⏱ 잠금까지 <b>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</b> 남음 — 이 시간 내에만 취소 가능
        </div>
      )}

      {dna.deadline && status !== 'locked' && (
        <div style={infoBox('#F0FDF4', '#166534')}>
          <b>데드라인:</b> {fmtTime(dna.deadline)}
          {dna.deadlineExpired && <span style={{ color: '#DC2626', marginLeft: 8 }}>⚠️ 만료됨</span>}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8, maxHeight: 240, border: '1px solid #E2E8F0', borderRadius: 6, padding: 8, background: '#F8FAFC' }}>
        {chats.length === 0
          ? <div style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', marginTop: 20 }}>아직 대화가 없습니다</div>
          : chats.map((c, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 12, color: '#1E2761' }}>{c.userName}</span>
              <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 6 }}>{fmtTime(c.at || c.ts)}</span>
              <div style={{ fontSize: 13, color: '#1E293B', marginTop: 1 }}>{c.text}</div>
            </div>
          ))}
        <div ref={chatEndRef} />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <input
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendChat()}
          placeholder="의견을 입력하세요..."
          style={inputStyle}
        />
        <button onClick={handleSendChat} style={btnStyle('#1E2761', '#fff')}>전송</button>
      </div>

      {isPlanner && status === 'undecided' && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>데드라인 설정 (플래너)</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              style={{ ...inputStyle, flex: 1, fontSize: 12 }}
            />
            <button onClick={handleSetDeadline} style={btnStyle('#64748B', '#fff')}>설정</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {isPlanner && status === 'undecided' && (
          <button onClick={handleConfirm} style={{ ...btnStyle('#4CAF50', '#fff'), flex: 1 }}>
            ✓ 결정으로 확정하기
          </button>
        )}
        {isPlanner && status === 'confirmed' && countdown !== null && (
          <button onClick={handleCancel} style={{ ...btnStyle('#F59E0B', '#fff'), flex: 1 }}>
            취소
          </button>
        )}
        {!isPlanner && (
          <div style={{ fontSize: 12, color: '#94A3B8' }}>결정 확정은 플래너만 가능합니다</div>
        )}
      </div>
    </div>
  );
}

const panelStyle = {
  width: 300, minWidth: 280, background: '#fff', borderLeft: '1px solid #E2E8F0',
  padding: 14, display: 'flex', flexDirection: 'column', overflowY: 'auto',
};
const inputStyle = {
  flex: 1, border: '1px solid #CBD5E1', borderRadius: 6, padding: '5px 8px',
  fontSize: 13, outline: 'none',
};
const btnStyle = (bg, color) => ({
  background: bg, color, border: 'none', borderRadius: 6,
  padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
});
const infoBox = (bg, color) => ({
  background: bg, color, borderRadius: 6, padding: '6px 10px',
  fontSize: 12, marginBottom: 8,
});
