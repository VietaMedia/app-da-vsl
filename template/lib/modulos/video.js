export function embedUrl(url) {
  if (!url || !/^https:\/\//i.test(url)) return null;
  let u;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^www\./, '');

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (u.pathname === '/watch') {
      const id = u.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    const shorts = u.pathname.match(/^\/shorts\/([\w-]+)/);
    if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
  }
  if (host === 'youtu.be') {
    const id = u.pathname.match(/^\/([\w-]+)/);
    if (id) return `https://www.youtube.com/embed/${id[1]}`;
  }
  if (host === 'vimeo.com') {
    const vm = u.pathname.match(/^\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  }
  return null;
}
