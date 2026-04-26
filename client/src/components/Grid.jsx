import { useCellStore } from '../store/useCellStore';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const ROWS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const SAMPLE_DATA = {
  A1: '항목', B1: 'Q1', C1: 'Q2', D1: 'Q3', E1: 'Q4',
  A2: '매출', B2: '1,200', C2: '1,450', D2: '1,380', E2: '1,620',
  A3: '전환율', B3: '3.2%', C3: '3.8%', D3: '3.5%', E3: '4.1%',
  A4: '이탈율', B4: '42%', C4: '38%', D4: '41%', E4: '35%',
  A5: '신규유저', B5: '820', C5: '940', D5: '870', E5: '1,050',
};

export default function Grid({ onSend }) {
  const { cells, selectedCell, selectCell, myInfo } = useCellStore();

  function handleCellClick(cellId) {
    const cell = cells[cellId];
    if (cell?.pinned) {
      selectCell(cellId);
    } else {
      const pinnedCount = Object.values(cells).filter(c => c.pinned).length;
      if (pinnedCount >= 5) {
        alert('최대 5개 핀만 가능합니다');
        return;
      }
      onSend({ type: 'PIN_CELL', cellId });
      selectCell(cellId);
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
        <thead>
          <tr>
            <th style={thStyle}></th>
            {COLS.map(c => <th key={c} style={thStyle}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(row => (
            <tr key={row}>
              <td style={{ ...thStyle, width: 32, color: '#94A3B8' }}>{row}</td>
              {COLS.map(col => {
                const cellId = `${col}${row}`;
                const cell = cells[cellId];
                const isPinned = cell?.pinned;
                const isSelected = selectedCell === cellId;
                const status = cell?.dna?.status;

                let border = '1px solid #E2E8F0';
                let bg = row === 1 ? '#F1F5F9' : '#fff';
                if (isPinned) {
                  if (status === 'locked') { bg = '#EEF2FF'; border = '2px solid #1A237E'; }
                  else if (status === 'confirmed') { bg = '#F0FFF4'; border = '2px solid #4CAF50'; }
                  else { bg = '#FEF9C3'; border = '2px solid #F59E0B'; }
                }
                if (isSelected) border = '2px solid #1E2761';

                return (
                  <td
                    key={cellId}
                    onClick={() => handleCellClick(cellId)}
                    title={isPinned && status === 'locked' ? buildTooltip(cell) : undefined}
                    style={{
                      ...tdStyle, background: bg, border,
                      cursor: 'pointer',
                      fontWeight: row === 1 ? 700 : 400,
                      color: isPinned && status === 'locked' ? '#1A237E' : '#1E293B',
                      position: 'relative',
                    }}
                  >
                    {isPinned && <span style={{ position: 'absolute', top: 1, right: 2, fontSize: 9 }}>📌</span>}
                    {SAMPLE_DATA[cellId] || ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
        셀을 클릭하면 핀이 꽂혀 팀 전체에 공유됩니다. 핀된 셀을 다시 클릭하면 DNA 패널이 열립니다.
      </p>
    </div>
  );
}

function buildTooltip(cell) {
  if (!cell?.dna) return '';
  const { confirmedBy, confirmedAt, chats = [] } = cell.dna;
  const time = confirmedAt ? new Date(confirmedAt).toLocaleString('ko-KR') : '';
  const summary = chats.slice(-3).map(c => `${c.userName}: ${c.text}`).join('\n');
  return `결정자: ${confirmedBy || '-'}\n확정일시: ${time}\n\n최근 논의:\n${summary}`;
}

const thStyle = {
  padding: '4px 8px', background: '#F8FAFC', border: '1px solid #E2E8F0',
  fontWeight: 600, fontSize: 12, color: '#475569', textAlign: 'center', minWidth: 70,
};
const tdStyle = {
  padding: '5px 8px', border: '1px solid #E2E8F0', textAlign: 'center',
  minWidth: 70, height: 30, transition: 'background 0.2s',
};
