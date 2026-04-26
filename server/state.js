// 인메모리 상태 관리
const cells = {}; // cellId -> { pinned, pinnedBy, pinnedByName, dna: { chats[], status, confirmedBy, confirmedAt, lockedAt, deadline } }
const users = {}; // userId -> { name, isPlanner, joinedAt }
const timers = {}; // cellId -> timeout handle

function getState() {
  return { cells, users: Object.values(users) };
}

function addUser(userId, userName) {
  if (users[userId]) {
    users[userId].status = 'online';
    return users[userId];
  }
  const isPlanner = Object.keys(users).length === 0;
  users[userId] = { id: userId, name: userName, isPlanner, status: 'online' };
  return users[userId];
}

function removeUser(userId) {
  delete users[userId];
}

function isPlanner(userId) {
  return users[userId]?.isPlanner === true;
}

function pinCell(cellId, userId, userName) {
  const pinnedCount = Object.values(cells).filter(c => c.pinned).length;
  if (pinnedCount >= 5) return { error: '최대 5개 핀만 가능합니다' };

  if (!cells[cellId]) {
    cells[cellId] = { pinned: false, dna: { chats: [], status: 'undecided', deadline: null } };
  }
  cells[cellId].pinned = true;
  cells[cellId].pinnedBy = userId;
  cells[cellId].pinnedByName = userName;
  return cells[cellId];
}

function unpinCell(cellId) {
  if (cells[cellId]) cells[cellId].pinned = false;
}

function addChat(cellId, userId, userName, text) {
  if (!cells[cellId]) return;
  const msg = { userId, userName, text, ts: Date.now() };
  cells[cellId].dna.chats.push(msg);
  return msg;
}

function setDeadline(cellId, deadline) {
  if (!cells[cellId]) return;
  cells[cellId].dna.deadline = deadline;
}

function confirmDecision(cellId, userId, userName, broadcast) {
  if (!cells[cellId]) return { error: '핀된 셀이 없습니다' };
  if (!isPlanner(userId)) return { error: '플래너만 결정을 확정할 수 있습니다' };

  cells[cellId].dna.status = 'confirmed';
  cells[cellId].dna.confirmedBy = userName;
  cells[cellId].dna.confirmedAt = Date.now();

  // 5분 후 자동 잠금
  clearTimeout(timers[cellId]);
  timers[cellId] = setTimeout(() => {
    if (cells[cellId]?.dna.status === 'confirmed') {
      cells[cellId].dna.status = 'locked';
      cells[cellId].dna.lockedAt = Date.now();
      broadcast({ type: 'CELL_LOCKED', cellId });
    }
  }, 5 * 60 * 1000);

  return cells[cellId];
}

function cancelDecision(cellId, userId) {
  if (!cells[cellId]) return { error: '핀된 셀이 없습니다' };
  if (!isPlanner(userId)) return { error: '플래너만 취소할 수 있습니다' };
  if (cells[cellId].dna.status === 'locked') return { error: '잠긴 결정은 취소할 수 없습니다' };

  clearTimeout(timers[cellId]);
  cells[cellId].dna.status = 'undecided';
  cells[cellId].dna.confirmedBy = null;
  cells[cellId].dna.confirmedAt = null;
  return cells[cellId];
}

function checkDeadlines(broadcast) {
  const now = Date.now();
  Object.entries(cells).forEach(([cellId, cell]) => {
    if (cell.dna.status === 'undecided' && cell.dna.deadline && now > cell.dna.deadline) {
      cell.dna.deadlineExpired = true;
      broadcast({ type: 'DEADLINE_EXPIRED', cellId });
    }
  });
}

module.exports = { getState, addUser, removeUser, isPlanner, pinCell, unpinCell, addChat, setDeadline, confirmDecision, cancelDecision, checkDeadlines };
