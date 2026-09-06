'use client';
import { motion, useReducedMotion } from 'motion/react';
import Icone from './Icone';

export default function Checkbox({ marcado = false, onChange, label, extra, desabilitado = false, className = '' }) {
  const reduzida = useReducedMotion();
  return (
    <label
      className={className}
      aria-disabled={desabilitado}
      style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 52, cursor: desabilitado ? 'default' : 'pointer', opacity: desabilitado ? 0.5 : 1 }}
    >
      <input
        type="checkbox"
        checked={!!marcado}
        disabled={desabilitado}
        aria-disabled={desabilitado}
        onChange={e => onChange?.(e.target.checked)}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      <motion.span
        initial={false}
        animate={{ scale: reduzida ? 1 : (marcado ? 1 : 0.92) }}
        transition={{ duration: reduzida ? 0 : 0.2 }}
        style={{
          width: 26,
          height: 26,
          borderRadius: 9,
          flexShrink: 0,
          border: `2px solid ${marcado ? 'var(--cor-primaria)' : '#C9CFC4'}`,
          background: marcado ? 'var(--cor-primaria)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {marcado && (
          reduzida ? (
            <span style={{ display: 'flex' }}>
              <Icone nome="check" tamanho={16} cor="#fff" traco={2.6} />
            </span>
          ) : (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex' }}
            >
              <Icone nome="check" tamanho={16} cor="#fff" traco={2.6} />
            </motion.span>
          )
        )}
      </motion.span>
      {label && (
        <span style={{
          fontSize: 15, fontWeight: 700, flex: 1, minWidth: 0,
          color: marcado ? 'var(--cor-texto-suave)' : 'var(--cor-texto)',
          textDecoration: marcado ? 'line-through' : 'none',
        }}>
          {label}
        </span>
      )}
      {extra && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--cor-texto-suave)', flexShrink: 0 }}>{extra}</span>}
    </label>
  );
}
