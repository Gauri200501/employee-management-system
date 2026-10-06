const Loading = ({ fullPage = false, text = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main)',
          zIndex: 9999,
          gap: 16,
        }}
      >
        <div style={{ position: 'relative' }}>
          <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}
            />
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{text}</span>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="spinner" />
    </div>
  );
};

export default Loading;
