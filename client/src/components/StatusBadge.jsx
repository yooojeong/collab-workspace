export default function StatusBadge({ status, deadlineExpired }) {
  if (status === 'locked') {
    return (
      <span style={{ background: '#1A237E', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
        🔒 잠금
      </span>
    );
  }
  if (status === 'confirmed') {
    return (
      <span style={{ background: '#4CAF50', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
        ✓ 결정됨 (취소 가능)
      </span>
    );
  }
  return (
    <span style={{
      background: deadlineExpired ? '#F97316' : '#9E9E9E',
      color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 700
    }}>
      {deadlineExpired ? '⚠️ 데드라인 초과' : '··· 미결정'}
    </span>
  );
}
