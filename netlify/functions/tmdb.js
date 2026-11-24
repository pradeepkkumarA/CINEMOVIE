// Server-side proxy for the TMDB API. The key lives in the TMDB_API_KEY
// environment variable on Netlify and never reaches the browser.
const BASE = 'https://api.themoviedb.org/3';

// Only these TMDB endpoints can be reached through the proxy.
const ALLOWED = [
  /^\/discover\/movie$/,
  /^\/search\/movie$/,
  /^\/movie\/\d+$/,
];

// Query params the app is allowed to forward.
const PARAMS = ['page', 'query', 'with_genres', 'primary_release_year', 'year', 'sort_by', 'append_to_response', 'vote_count.gte', 'include_adult'];

export default async (request) => {
  const key = process.env.TMDB_API_KEY;
  if (!key) return Response.json({ error: 'TMDB_API_KEY is not configured.' }, { status: 500 });

  const incoming = new URL(request.url).searchParams;
  const path = incoming.get('path') || '';
  if (!ALLOWED.some((re) => re.test(path))) {
    return Response.json({ error: 'Endpoint not allowed.' }, { status: 400 });
  }

  const upstream = new URL(BASE + path);
  upstream.searchParams.set('api_key', key);
  upstream.searchParams.set('language', 'en-US');
  for (const name of PARAMS) {
    if (incoming.has(name)) upstream.searchParams.set(name, incoming.get(name));
  }

  try {
    const res = await fetch(upstream);
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300',
      },
    });
  } catch {
    return Response.json({ error: 'Could not reach TMDB.' }, { status: 502 });
  }
};
