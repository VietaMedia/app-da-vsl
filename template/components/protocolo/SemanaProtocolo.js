'use client';
import { useState } from 'react';
import ChipsSemanas from './ChipsSemanas';
import ListaDias from './ListaDias';
import { semanaDoDia } from '@/lib/modulos/protocolo';

// Client island: dono do estado "qual semana está visível". Recebe todos os
// dias e check-ins do protocolo; troca de semana é só cliente, não bate na API.
export default function SemanaProtocolo({ days, checkins, diaAtual, locale = 'pt' }) {
  const semanaAtual = semanaDoDia(diaAtual);
  const totalSemanas = semanaDoDia(days[days.length - 1].day);
  const [semana, setSemana] = useState(semanaAtual);
  const diasDaSemana = days.filter(d => semanaDoDia(d.day) === semana);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ padding: '0 20px' }}>
        <ChipsSemanas totalSemanas={totalSemanas} semanaAtiva={semana} onSelecionar={setSemana} locale={locale} />
      </div>
      <div style={{ padding: '0 12px' }}>
        <ListaDias days={diasDaSemana} checkins={checkins} diaAtual={diaAtual} locale={locale} />
      </div>
    </div>
  );
}
