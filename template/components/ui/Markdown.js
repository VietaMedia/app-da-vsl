const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
export function renderMarkdown(md) {
  return md.split(/\n{2,}/).map(b => {
    const t = b.trim(); if (!t) return '';
    const h = t.match(/^(#{1,3})\s+(.*)$/); if (h) return `<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`;
    if (/^-\s/m.test(t)) return '<ul>' + t.split('\n').filter(l => /^-\s/.test(l)).map(l => `<li>${inline(l.slice(2))}</li>`).join('') + '</ul>';
    return `<p>${inline(t).replace(/\n/g, '<br/>')}</p>`;
  }).join('');
}
export default function Markdown({ text }) { return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />; }
