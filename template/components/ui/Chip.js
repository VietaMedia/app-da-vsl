export default function Chip({ children, ativo = false, className = '', ...props }) {
  return (
    <button
      type="button"
      className={className}
      style={{
        padding: '9px 14px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        fontSize: 13,
        fontWeight: 800,
        border: `1px solid ${ativo ? 'var(--cor-primaria-escura)' : 'var(--cor-linha)'}`,
        background: ativo ? 'var(--cor-primaria-escura)' : '#fff',
        color: ativo ? '#fff' : 'var(--cor-texto)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
