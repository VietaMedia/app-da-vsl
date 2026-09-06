export const CLIMAS = {
  natural:    { radius: '20px', radiusLg: '32px', shadow: '0 8px 24px -16px rgba(31,42,31,.25)', ilustracaoPadrao: 'leaf',     tomSaudacao: 'caloroso' },
  clinico:    { radius: '14px', radiusLg: '24px', shadow: '0 6px 20px -14px rgba(20,40,60,.25)',  ilustracaoPadrao: 'pulse',    tomSaudacao: 'direto' },
  fitness:    { radius: '16px', radiusLg: '28px', shadow: '0 10px 28px -16px rgba(0,0,0,.35)',    ilustracaoPadrao: 'pulse',    tomSaudacao: 'energico' },
  financeiro: { radius: '12px', radiusLg: '20px', shadow: '0 6px 18px -14px rgba(10,20,40,.3)',   ilustracaoPadrao: 'coins',    tomSaudacao: 'sobrio' },
  beleza:     { radius: '22px', radiusLg: '36px', shadow: '0 10px 28px -18px rgba(80,40,60,.25)', ilustracaoPadrao: 'sparkles', tomSaudacao: 'suave' },
  foco:       { radius: '18px', radiusLg: '28px', shadow: '0 8px 22px -16px rgba(20,30,50,.3)',   ilustracaoPadrao: 'wave',     tomSaudacao: 'calmo' },
};

// Por locale ('pt'/'es'/'en') e depois por tom da marca (`tomSaudacao` acima).
export const SAUDACOES = {
  pt: {
    caloroso: { manha: 'Boa manhã', tarde: 'Boa tarde', noite: 'Boa noite', frase: 'Seu protocolo de hoje está pronto.' },
    direto:   { manha: 'Bom dia',   tarde: 'Boa tarde', noite: 'Boa noite', frase: 'Aqui está o seu plano de hoje.' },
    energico: { manha: 'Bora',      tarde: 'Bora',      noite: 'Última do dia', frase: 'Hoje conta. Vamos?' },
    sobrio:   { manha: 'Bom dia',   tarde: 'Boa tarde', noite: 'Boa noite', frase: 'Seu resumo do dia.' },
    suave:    { manha: 'Bom dia',   tarde: 'Boa tarde', noite: 'Boa noite', frase: 'Um passo de cada vez, hoje também.' },
    calmo:    { manha: 'Bom dia',   tarde: 'Boa tarde', noite: 'Boa noite', frase: 'Respire. Aqui está o seu dia.' },
  },
  es: {
    caloroso: { manha: 'Buenos días', tarde: 'Buenas tardes', noite: 'Buenas noches', frase: 'Tu protocolo de hoy está listo.' },
    direto:   { manha: 'Buenos días', tarde: 'Buenas tardes', noite: 'Buenas noches', frase: 'Aquí está tu plan de hoy.' },
    energico: { manha: 'Vamos',       tarde: 'Vamos',         noite: 'Última del día', frase: 'Hoy cuenta. ¿Vamos?' },
    sobrio:   { manha: 'Buenos días', tarde: 'Buenas tardes', noite: 'Buenas noches', frase: 'Tu resumen del día.' },
    suave:    { manha: 'Buenos días', tarde: 'Buenas tardes', noite: 'Buenas noches', frase: 'Un paso a la vez, hoy también.' },
    calmo:    { manha: 'Buenos días', tarde: 'Buenas tardes', noite: 'Buenas noches', frase: 'Respira. Aquí está tu día.' },
  },
  en: {
    caloroso: { manha: 'Good morning', tarde: 'Good afternoon', noite: 'Good evening', frase: "Today's protocol is ready." },
    direto:   { manha: 'Good morning', tarde: 'Good afternoon', noite: 'Good evening', frase: "Here's your plan for today." },
    energico: { manha: "Let's go",     tarde: "Let's go",       noite: 'Last one today', frase: 'Today counts. Ready?' },
    sobrio:   { manha: 'Good morning', tarde: 'Good afternoon', noite: 'Good evening', frase: 'Your summary for the day.' },
    suave:    { manha: 'Good morning', tarde: 'Good afternoon', noite: 'Good evening', frase: 'One step at a time, today too.' },
    calmo:    { manha: 'Good morning', tarde: 'Good afternoon', noite: 'Good evening', frase: 'Breathe. Here is your day.' },
  },
};
