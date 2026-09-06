import { z } from 'zod';
const slug = z.string().regex(/^[a-z0-9-]+$/, 'use só letras minúsculas, números e hífen');
const md = z.string();
const httpUrl = z.string().url().refine(u => /^https?:\/\//i.test(u), 'use um endereço que comece com http:// ou https://');
const httpsUrl = z.string().url().refine(u => /^https:\/\//i.test(u), 'use um endereço que comece com https://');
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const MOODS = ['natural', 'clinico', 'fitness', 'financeiro', 'beleza', 'foco'];
export const SYMBOLS = ['bowl', 'leaf', 'heart', 'coin', 'dumbbell', 'drop', 'brain', 'sun', 'star', 'book'];
export const ILLUSTRATIONS = ['leaf', 'wave', 'gear', 'pulse', 'coins', 'sparkles'];

const fontName = z.string().regex(/^[A-Za-z0-9 ]{2,40}$/, 'use só letras, números e espaços');

export const identitySchema = z.object({
  mood: z.enum(MOODS),
  fonts: z.object({ display: fontName, body: fontName }),
  icon: z.object({ symbol: z.enum(SYMBOLS) }),
  illustration: z.enum(ILLUSTRATIONS),
});

export const moduleSchemas = {
  protocolo: z.object({
    days: z.array(z.object({ day: z.number().int().min(1), title: z.string(), tasks: z.array(z.string()).min(1), tip: z.string().optional() })).min(1),
  }),
  rastreador: z.object({
    metric: z.object({ label: z.string(), unit: z.string(), min: z.number(), max: z.number(), step: z.number().default(0.1) }),
    goal: z.number().optional(),
  }),
  trilha: z.object({
    sections: z.array(z.object({
      key: slug, title: z.string(),
      steps: z.array(z.object({ key: slug, title: z.string(), body: md, videoUrl: httpUrl.optional(), checklist: z.array(z.string()).default([]) })).min(1),
    })).min(1),
  }),
  calculadora: z.object({
    inputs: z.array(z.object({ key: slug, label: z.string(), unit: z.string().default(''), default: z.number().optional(), min: z.number().optional(), max: z.number().optional() })).min(1),
    formula: z.string(),
    resultLabel: z.string(), resultUnit: z.string().default(''),
    explanation: md,
    onboarding: z.boolean().default(false),
    metricKey: slug.optional(),
    goalInput: slug.optional(),
  }),
  biblioteca: z.object({
    items: z.array(z.object({ title: z.string(), type: z.enum(['link', 'audio', 'video']), url: httpUrl, description: z.string().default('') })).min(1),
  }),
  lembretes: z.object({
    items: z.array(z.object({ key: slug, title: z.string(), time: z.string().regex(/^\d{2}:\d{2}$/), days: z.array(z.number().int().min(0).max(6)).default([0,1,2,3,4,5,6]) })).min(1),
  }),
  guias: z.object({
    guides: z.array(z.discriminatedUnion('kind', [
      z.object({
        key: slug, kind: z.literal('lista'), title: z.string(), intro: z.string().default(''), estimate: z.string().optional(),
        sections: z.array(z.object({
          title: z.string(), tag: z.string().optional(),
          items: z.array(z.object({ name: z.string(), qty: z.string().default('') })).min(1),
        })).min(1),
      }),
      z.object({
        key: slug, kind: z.literal('receita'), title: z.string(), intro: z.string().default(''), time: z.string(), servings: z.string(),
        ingredients: z.array(z.string()).min(1), steps: z.array(z.string()).min(1), tip: z.string().optional(),
      }),
      z.object({
        key: slug, kind: z.literal('passos'), title: z.string(), intro: z.string().default(''),
        steps: z.array(z.object({ title: z.string(), body: z.string(), minutes: z.number().int().positive().optional() })).min(1),
      }),
      z.object({
        key: slug, kind: z.literal('texto'), title: z.string(), intro: z.string().default(''),
        blocks: z.array(z.object({ heading: z.string().optional(), body: md, copiavel: z.boolean().default(true) })).min(1),
      }),
      z.object({
        key: slug, kind: z.literal('audio'), title: z.string(), intro: z.string().default(''),
        tracks: z.array(z.object({ title: z.string(), url: httpsUrl, duration: z.string().optional() })).min(1),
      }),
      z.object({
        key: slug, kind: z.literal('pagina'), title: z.string(), intro: z.string().default(''),
        sections: z.array(z.object({ title: z.string(), body: md, checklist: z.array(z.string()).default([]) })).min(1),
      }),
    ])).min(1),
  }),
  contador: z.object({
    label: z.string(), unit: z.string(), goal: z.number().int().positive(), step: z.number().int().positive().default(1),
  }),
  quiz: z.object({
    questions: z.array(z.object({
      key: slug, text: z.string(),
      options: z.array(z.object({
        key: slug, label: z.string(),
        points: z.record(z.string(), z.number()).default({}),
      })).min(1).max(6),
    })).min(1).max(12),
    profiles: z.array(z.object({
      key: slug, title: z.string(), description: z.string(), ajustes: md,
    })).min(1),
    onboarding: z.boolean().default(false),
  }).superRefine((c, ctx) => {
    const chavesPerfil = new Set(c.profiles.map(p => p.key));
    c.questions.forEach((q, qi) => {
      q.options.forEach((opt, oi) => {
        Object.keys(opt.points || {}).forEach(chave => {
          if (!chavesPerfil.has(chave)) {
            ctx.addIssue({ code: 'custom', message: `points "${chave}" não corresponde a nenhum perfil`, path: ['questions', qi, 'options', oi, 'points', chave] });
          }
        });
      });
    });
  }),
};

const moduleSchema = z.discriminatedUnion('type', Object.entries(moduleSchemas).map(([type, content]) =>
  z.object({ key: slug, type: z.literal(type), title: z.string(), subtitle: z.string().default(''), content })
));

export const appSchema = z.object({ name: z.string().min(2), shortName: z.string().max(12), slogan: z.string(), description: z.string(), ownerName: z.string().optional(), supportEmail: z.string().email().optional(), notice: z.string().max(240).optional(), locale: z.enum(['pt', 'es', 'en']).default('pt') });

export const themeSchema = z.object({
  primary: hex, primaryDark: hex.optional(), accent: hex,
  background: hex.default('#FBF7F0'), surface: hex.optional(), text: hex.default('#1F2A1F'), line: hex.optional(),
});

export const configSchema = z.object({
  app: appSchema,
  theme: themeSchema,
  identity: identitySchema,
  modules: z.array(moduleSchema).min(1).max(8),
}).superRefine((c, ctx) => {
  const keys = c.modules.map(m => m.key);
  if (new Set(keys).size !== keys.length) ctx.addIssue({ code: 'custom', message: 'key de módulo duplicada', path: ['modules'] });

  c.modules.forEach((m, i) => {
    if (m.type === 'calculadora' && m.content.metricKey) {
      const alvo = c.modules.find(x => x.key === m.content.metricKey);
      if (!alvo) {
        ctx.addIssue({ code: 'custom', message: `metricKey "${m.content.metricKey}" não corresponde a nenhum módulo`, path: ['modules', i, 'content', 'metricKey'] });
      } else if (alvo.type !== 'rastreador') {
        ctx.addIssue({ code: 'custom', message: `metricKey "${m.content.metricKey}" precisa apontar para um módulo do tipo rastreador`, path: ['modules', i, 'content', 'metricKey'] });
      }
    }
  });
});
