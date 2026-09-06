export default function Button({ children, ...props }) {
  return (
    <button className="w-full rounded-xl p-3 font-semibold text-white" style={{ background: 'var(--cor-primaria)' }} {...props}>
      {children}
    </button>
  );
}
