// Casca offline mínima do PWA: cache-first só pros dois arquivos que quase
// nunca mudam (ícone e manifesto); tudo o mais é network-first, com a página
// offline inline como último recurso pra navegações (GET de documento) do
// mesmo site quando não há rede nem cache.
const CACHE = 'casca-v2';
const PRECACHE = ['/icons/icon-192.png', '/manifest.webmanifest'];
const OFFLINE_HTML = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sem internet</title>
<style>body{display:flex;align-items:center;justify-content:center;min-height:100dvh;margin:0;
font-family:system-ui,sans-serif;background:#FBF7F0;color:#1F2A1F;text-align:center;padding:24px}</style>
</head><body><p>Você está sem internet. Tente de novo em instantes.</p></body></html>`;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.url.includes('/api/')) return;

  const ehNavegacao = req.mode === 'navigate';
  e.respondWith(
    fetch(req)
      .then(res => {
        // Mantém o cache dos dois arquivos precache sempre atualizado, sem
        // interferir na resposta de rede que já foi servida.
        if (PRECACHE.some(p => req.url.endsWith(p))) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(r => {
          if (r) return r;
          if (ehNavegacao && new URL(req.url).origin === self.location.origin) {
            return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          }
          return Response.error();
        })
      )
  );
});
