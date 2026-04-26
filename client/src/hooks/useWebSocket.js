import { useEffect, useRef } from 'react';
import { useCellStore } from '../store/useCellStore';

const WS_URL = import.meta.env.VITE_WS_URL
  || (import.meta.env.PROD
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
    : `ws://${window.location.hostname}:3001`);

export function useWebSocket() {
  const ws = useRef(null);
  const { setMyInfo, setCells, setUsers, updateCell, addChatMsg, setUsers: refreshUsers } = useCellStore();

  useEffect(() => {
    let userId = localStorage.getItem('collab_userId');
    if (!userId) {
      userId = 'user-' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('collab_userId', userId);
    }
    const userName = localStorage.getItem('collab_userName') || ('사용자' + userId.slice(-3));
    localStorage.setItem('collab_userName', userName);

    function connect() {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        ws.current.send(JSON.stringify({ type: 'USER_JOIN', userId, userName }));
      };

      ws.current.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        switch (msg.type) {
          case 'STATE_SYNC':
            setMyInfo({ userId, userName, isPlanner: msg.isPlanner });
            setCells(msg.cells || {});
            refreshUsers(msg.users || []);
            break;
          case 'CELL_UPDATE':
            updateCell(msg.cellId, msg.cell);
            break;
          case 'CELL_LOCKED':
            updateCell(msg.cellId, { dna: { ...useCellStore.getState().cells[msg.cellId]?.dna, status: 'locked' } });
            break;
          case 'CHAT_UPDATE':
            addChatMsg(msg.cellId, msg.msg);
            break;
          case 'USER_LIST':
            refreshUsers(msg.users || []);
            break;
          case 'DEADLINE_EXPIRED':
            updateCell(msg.cellId, { dna: { ...useCellStore.getState().cells[msg.cellId]?.dna, deadlineExpired: true } });
            break;
          case 'ERROR':
            alert(msg.message);
            break;
        }
      };

      ws.current.onclose = () => {
        setTimeout(connect, 2000);
      };
    }

    connect();
    return () => ws.current?.close();
  }, []);

  function send(data) {
    const { myInfo } = useCellStore.getState();
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ ...data, userId: myInfo?.userId, userName: myInfo?.userName }));
    }
  }

  return { send };
}
