// 3 najnowsze posty z fanpage'a Drewitar, pobierane przy buildzie z Graph API.
// Wymaga sekretu FB_PAGE_TOKEN (Page Access Token). Bez niego zwraca null,
// a strona pokazuje oficjalną wtyczkę Facebooka (Page Plugin).
const API = 'https://graph.facebook.com/v21.0';

export default async function () {
  const token = process.env.FB_PAGE_TOKEN;
  const pageId = process.env.FB_PAGE_ID || '100064727059559';
  if (!token) return null;

  const fields = 'message,created_time,permalink_url,full_picture,attachments{media_type}';
  const url = `${API}/${pageId}/posts?fields=${encodeURIComponent(fields)}&limit=3&access_token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data = [] } = await res.json();
    return data.slice(0, 3).map((p) => ({
      text: (p.message || '').trim(),
      date: p.created_time,
      url: p.permalink_url,
      image: p.full_picture || null,
      video: p.attachments?.data?.[0]?.media_type === 'video',
    }));
  } catch (err) {
    console.warn(`[fbPosts] Nie udało się pobrać postów (${err.message}) – używam wtyczki FB.`);
    return null;
  }
}
