const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const state = require('./state');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, '../client/dist')));

const clients = new Map(); // ws -> userId

function broadcast(data, excludeWs = null) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(ws => {
    if (ws !== excludeWs && ws.readyState === 1) ws.send(msg);
  });
}

function broadcastAll(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(ws => { if (ws.readyState === 1) ws.send(msg); });
}

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    const { type, userId, userName, cellId, text, deadline } = msg;

    switch (type) {
      case 'USER_JOIN': {
        const user = state.addUser(userId, userName);
        clients.set(ws, userId);
        // 현재 상태 전송
        ws.send(JSON.stringify({ type: 'STATE_SYNC', ...state.getState(), myUserId: userId, isPlanner: user.isPlanner }));
        broadcastAll({ type: 'USER_LIST', users: state.getState().users });
        break;
      }

      case 'PIN_CELL': {
        const result = state.pinCell(cellId, userId, userName);
        if (result.error) {
          ws.send(JSON.stringify({ type: 'ERROR', message: result.error }));
        } else {
          broadcastAll({ type: 'CELL_UPDATE', cellId, cell: result });
        }
        break;
      }

      case 'UNPIN_CELL': {
        state.unpinCell(cellId);
        broadcastAll({ type: 'CELL_UPDATE', cellId, cell: state.getState().cells[cellId] });
        break;
      }

      case 'CHAT_MSG': {
        const chatMsg = state.addChat(cellId, userId, userName, text);
        if (chatMsg) broadcastAll({ type: 'CHAT_UPDATE', cellId, msg: chatMsg });
        break;
      }

      case 'SET_DEADLINE': {
        state.setDeadline(cellId, deadline);
        broadcastAll({ type: 'CELL_UPDATE', cellId, cell: state.getState().cells[cellId] });
        break;
      }

      case 'CONFIRM_DECISION': {
        const result = state.confirmDecision(cellId, userId, userName, broadcastAll);
        if (result.error) {
          ws.send(JSON.stringify({ type: 'ERROR', message: result.error }));
        } else {
          broadcastAll({ type: 'CELL_UPDATE', cellId, cell: result });
        }
        break;
      }

      case 'CANCEL_DECISION': {
        const result = state.cancelDecision(cellId, userId);
        if (result.error) {
          ws.send(JSON.stringify({ type: 'ERROR', message: result.error }));
        } else {
          broadcastAll({ type: 'CELL_UPDATE', cellId, cell: result });
        }
        break;
      }
    }
  });

  ws.on('close', () => {
    const userId = clients.get(ws);
    if (userId) {
      state.removeUser(userId);
      clients.delete(ws);
      broadcastAll({ type: 'USER_LIST', users: state.getState().users });
    }
  });
});

// 데드라인 체크 (30초마다)
setInterval(() => state.checkDeadlines(broadcastAll), 30000);

const PORT = 3001;
server.listen(PORT, () => console.log(`✅ 서버 실행: http://localhost:${PORT}`));
