import { useState, useEffect, useCallback, useRef } from "react";

const TMDB_KEY = "545b37870b5802c11d6a9e4a72e3d429";
const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";
const API_URL = process.env.REACT_APP_API_URL || "https://tu-backend.railway.app";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #080a0f; --surface: #0f1117; --card: #13161e; --border: #1e2230;
    --accent: #e63946; --accent2: #ff6b6b; --text: #e8eaf0; --muted: #6b7280; --gold: #f4a261;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; gap: 2rem; padding: 1rem 2rem;
    background: linear-gradient(to bottom, rgba(8,10,15,0.97), transparent);
    backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .nav-logo {
    font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; letter-spacing: 3px;
    color: var(--accent); text-shadow: 0 0 30px rgba(230,57,70,0.5); cursor: pointer; user-select: none;
  }
  .nav-tabs { display: flex; gap: 0.25rem; margin-right: auto; }
  .nav-tab {
    background: none; border: none; color: var(--muted);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500;
    padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; transition: all 0.2s;
  }
  .nav-tab:hover { color: var(--text); background: rgba(255,255,255,0.05); }
  .nav-tab.active { color: var(--accent2); background: rgba(230,57,70,0.15); }
  .search-wrap { position: relative; }
  .search-input {
    background: rgba(255,255,255,0.06); border: 1px solid var(--border);
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    padding: 0.5rem 1rem 0.5rem 2.4rem; border-radius: 20px; width: 220px; outline: none; transition: all 0.3s;
  }
  .search-input:focus { width: 300px; border-color: var(--accent); background: rgba(230,57,70,0.05); }
  .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 0.85rem; pointer-events: none; }
  .search-results {
    position: absolute; top: calc(100% + 8px); right: 0; width: 380px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden; z-index: 200; box-shadow: 0 20px 60px rgba(0,0,0,0.6); max-height: 480px; overflow-y: auto;
  }
  .search-item { display: flex; gap: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; transition: background 0.15s; align-items: center; }
  .search-item:hover { background: rgba(255,255,255,0.04); }
  .search-thumb { width: 44px; height: 64px; border-radius: 6px; object-fit: cover; flex-shrink: 0; background: var(--card); }
  .search-info h4 { font-size: 0.9rem; font-weight: 500; margin-bottom: 0.2rem; }
  .search-info span { font-size: 0.75rem; color: var(--muted); }
  .search-badge { margin-left: auto; font-size: 0.65rem; font-weight: 600; letter-spacing: 1px; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: uppercase; flex-shrink: 0; }
  .badge-movie { background: rgba(230,57,70,0.2); color: var(--accent2); }
  .badge-tv { background: rgba(244,162,97,0.2); color: var(--gold); }
  .hero {
    position: relative; height: 92vh; min-height: 600px;
    display: flex; align-items: flex-end; padding: 4rem 3rem; overflow: hidden; margin-bottom: 2rem;
  }
  .hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center top; }
  .hero-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(to top, var(--bg) 0%, rgba(8,10,15,0.6) 40%, rgba(8,10,15,0.2) 70%, transparent 100%),
                linear-gradient(to right, var(--bg) 0%, transparent 50%);
  }
  .hero-content { position: relative; z-index: 2; max-width: 560px; }
  .hero-badge { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--accent); color: white; font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 0.3rem 0.8rem; border-radius: 4px; margin-bottom: 1rem; }
  .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(3rem, 6vw, 5rem); line-height: 1; letter-spacing: 2px; margin-bottom: 0.75rem; text-shadow: 0 2px 20px rgba(0,0,0,0.8); }
  .hero-meta { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
  .hero-meta span { font-size: 0.8rem; color: var(--muted); }
  .hero-rating { color: var(--gold); font-weight: 600; font-size: 0.9rem; }
  .hero-desc { font-size: 0.9rem; line-height: 1.7; color: rgba(232,234,240,0.8); margin-bottom: 1.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .hero-btns { display: flex; gap: 0.75rem; }
  .btn-play { display: flex; align-items: center; gap: 0.5rem; background: var(--accent); color: white; border: none; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600; padding: 0.75rem 1.75rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .btn-play:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(230,57,70,0.4); }
  .btn-info { display: flex; align-items: center; gap: 0.5rem; background: rgba(255,255,255,0.1); color: var(--text); border: 1px solid rgba(255,255,255,0.15); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 500; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .btn-info:hover { background: rgba(255,255,255,0.16); }
  .section { padding: 0 2rem 3rem; }
  .section-header { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.25rem; }
  .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; letter-spacing: 2px; }
  .section-sub { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .carousel-wrap { position: relative; }
  .carousel { display: flex; gap: 0.75rem; overflow-x: auto; scroll-behavior: smooth; padding-bottom: 0.5rem; scrollbar-width: none; }
  .carousel::-webkit-scrollbar { display: none; }
  .carousel-btn { position: absolute; top: 40%; transform: translateY(-50%); background: rgba(8,10,15,0.85); border: 1px solid var(--border); color: var(--text); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.2s; font-size: 1rem; backdrop-filter: blur(8px); }
  .carousel-btn:hover { background: var(--accent); border-color: var(--accent); }
  .carousel-btn.left { left: -16px; }
  .carousel-btn.right { right: -16px; }
  .card { flex-shrink: 0; width: 160px; cursor: pointer; transition: transform 0.2s; position: relative; }
  .card:hover { transform: scale(1.04); z-index: 5; }
  .card-poster { width: 100%; aspect-ratio: 2/3; border-radius: 10px; object-fit: cover; background: var(--card); display: block; border: 1px solid var(--border); }
  .card-overlay { position: absolute; inset: 0; border-radius: 10px; background: linear-gradient(to top, rgba(8,10,15,0.95) 0%, transparent 50%); opacity: 0; transition: opacity 0.2s; display: flex; align-items: flex-end; padding: 0.75rem; }
  .card:hover .card-overlay { opacity: 1; }
  .card-play-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--accent); border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.8rem; margin-left: auto; }
  .card-info { margin-top: 0.5rem; }
  .card-title { font-size: 0.8rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-year { font-size: 0.7rem; color: var(--muted); }
  .card-rating { font-size: 0.7rem; color: var(--gold); }
  .modal-backdrop { position: fixed; inset: 0; z-index: 500; background: rgba(0,0,0,0.9); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn 0.2s; }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 920px; max-height: 90vh; overflow-y: auto; position: relative; animation: slideUp 0.3s; }
  @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  .modal-close { position: absolute; top: 1rem; right: 1rem; z-index: 10; background: rgba(0,0,0,0.7); border: 1px solid var(--border); color: var(--text); width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .modal-close:hover { background: var(--accent); border-color: var(--accent); }
  .modal-hero { width: 100%; aspect-ratio: 16/7; object-fit: cover; border-radius: 16px 16px 0 0; display: block; background: var(--card); }
  .modal-hero-gradient { height: 80px; margin-top: -80px; position: relative; background: linear-gradient(to top, var(--surface), transparent); }
  .modal-body { padding: 1.5rem 2rem 2rem; }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; letter-spacing: 2px; margin-bottom: 0.5rem; }
  .modal-meta { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1rem; }
  .modal-meta span { font-size: 0.8rem; color: var(--muted); }
  .modal-overview { font-size: 0.9rem; line-height: 1.7; color: rgba(232,234,240,0.8); margin-bottom: 1.5rem; }
  .genres { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .genre-tag { font-size: 0.7rem; padding: 0.25rem 0.65rem; border-radius: 20px; background: rgba(255,255,255,0.06); border: 1px solid var(--border); color: var(--muted); }
  .player-wrap { width: 100%; aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #000; border: 1px solid var(--border); }
  .player-wrap iframe { width: 100%; height: 100%; border: none; }
  .sources-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; align-items: center; }
  .sources-label { font-size: 0.75rem; color: var(--muted); margin-right: 0.25rem; white-space: nowrap; }
  .source-btn { background: var(--card); border: 1px solid var(--border); color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 0.72rem; padding: 0.3rem 0.7rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .source-btn .lang { font-size: 0.6rem; }
  .source-btn:hover { border-color: var(--accent); color: var(--text); }
  .source-btn.active { background: rgba(230,57,70,0.15); border-color: var(--accent); color: var(--accent2); }
  .source-btn.scraped { border-color: #22c55e; }
  .source-btn.scraped.active { background: rgba(34,197,94,0.15); border-color: #22c55e; color: #4ade80; }
  .loading-sources { font-size: 0.75rem; color: var(--muted); display: flex; align-items: center; gap: 0.4rem; }
  .dot-spin { width: 8px; height: 8px; border-radius: 50%; border: 2px solid var(--border); border-top-color: var(--accent); animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .season-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .season-tab { background: var(--card); border: 1px solid var(--border); color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 0.8rem; padding: 0.35rem 0.9rem; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
  .season-tab.active { background: var(--accent); border-color: var(--accent); color: white; }
  .episodes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem; }
  .episode-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 0.85rem; cursor: pointer; transition: all 0.2s; display: flex; gap: 0.75rem; align-items: center; }
  .episode-card:hover { border-color: var(--accent); background: rgba(230,57,70,0.06); }
  .episode-num { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; color: var(--accent); min-width: 32px; text-align: center; flex-shrink: 0; }
  .episode-info h5 { font-size: 0.85rem; font-weight: 500; margin-bottom: 0.2rem; }
  .episode-info span { font-size: 0.75rem; color: var(--muted); }
  .skeleton { background: linear-gradient(90deg, var(--card) 25%, var(--surface) 50%, var(--card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 10px; }
  @keyframes shimmer { to { background-position: -200% 0; } }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  .page { padding-top: 72px; min-height: 100vh; }
  @media (max-width: 600px) {
    .nav { padding: 0.75rem 1rem; }
    .nav-tabs { display: none; }
    .search-input:focus { width: 180px; }
    .hero { padding: 2rem 1.25rem; }
    .section { padding: 0 1rem 2rem; }
    .card { width: 130px; }
    .modal-body { padding: 1rem; }
  }
`;

// ── Helpers ──────────────────────────────────────────────────
const tmdbFetch = async (path, params = {}) => {
  const url = new URL(`${TMDB}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  url.searchParams.set("language", "es-ES");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const r = await fetch(url);
  return r.json();
};

const posterUrl = (path, size = "w342") => path ? `${IMG}/${size}${path}` : null;
const backdropUrl = (path) => path ? `${IMG}/original${path}` : null;

// ── Player con fuentes del backend ───────────────────────────
function Player({ item, season, episode }) {
  const [sources, setSources] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const isMovie = item.media_type === "movie" || item.title;
  const type = isMovie ? "movie" : "tv";

  useEffect(() => {
    setLoading(true);
    setActiveIdx(0);
    const params = new URLSearchParams({ tmdbId: item.id, type });
    if (season) params.set("season", season);
    if (episode) params.set("episode", episode);

    fetch(`${API_URL}/sources?${params}`)
      .then(r => r.json())
      .then(data => { setSources(data.sources || []); setLoading(false); })
      .catch(() => {
        // Fallback si el backend no está disponible
        setSources([
          { name: "SuperEmbed", url: `https://multiembed.mov/directstream.php?video_id=${item.id}&tmdb=1${season ? "&s=" + season + "&e=" + (episode || 1) : ""}`, lang: "🌎 Latino" },
          { name: "2Embed",     url: isMovie ? `https://www.2embed.cc/embed/${item.id}` : `https://www.2embed.cc/embedtv/${item.id}&s=${season}&e=${episode}`, lang: "🌎 ES/LAT" },
          { name: "AutoEmbed",  url: isMovie ? `https://autoembed.cc/movie/tmdb/${item.id}` : `https://autoembed.cc/tv/tmdb/${item.id}-${season}-${episode}`, lang: "🌎 Multi" },
          { name: "VidSrc",     url: isMovie ? `https://vidsrc-embed.ru/embed/movie/${item.id}?ds_lang=es` : `https://vidsrc-embed.ru/embed/tv/${item.id}?season=${season}&episode=${episode}&ds_lang=es`, lang: "🇺🇸 EN+subs" },
        ]);
        setLoading(false);
      });
  }, [item.id, type, season, episode]);

  const active = sources[activeIdx];

  return (
    <div>
      <div className="sources-bar">
        <span className="sources-label">🎬 Servidor:</span>
        {loading
          ? <div className="loading-sources"><div className="dot-spin" /> Buscando fuentes...</div>
          : sources.map((s, i) => (
            <button
              key={i}
              className={"source-btn " + (activeIdx === i ? "active " : "") + (s.scraped ? "scraped" : "")}
              onClick={() => setActiveIdx(i)}
              title={s.scraped ? "✅ Encontrado en sitio latino" : ""}
            >
              {s.scraped && "✅ "}{s.name}
              <span className="lang">{s.lang}</span>
            </button>
          ))
        }
      </div>
      <div className="player-wrap">
        {active && <iframe key={active.url} src={active.url} allowFullScreen allow="autoplay; fullscreen" title="player" />}
      </div>
      <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: "0.5rem" }}>
        💡 Los servidores con ✅ fueron encontrados en sitios latinos — prueba esos primero para doblaje en español
      </p>
    </div>
  );
}

// ── MediaCard ────────────────────────────────────────────────
function MediaCard({ item, onClick }) {
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const poster = posterUrl(item.poster_path);
  return (
    <div className="card" onClick={() => onClick(item)}>
      {poster ? <img className="card-poster" src={poster} alt={title} loading="lazy" /> : <div className="card-poster skeleton" style={{ aspectRatio: "2/3" }} />}
      <div className="card-overlay">
        <button className="card-play-btn" onClick={e => { e.stopPropagation(); onClick(item); }}>▶</button>
      </div>
      <div className="card-info">
        <div className="card-title">{title}</div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <span className="card-year">{year}</span>
          {item.vote_average > 0 && <span className="card-rating">★ {item.vote_average.toFixed(1)}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Carousel ─────────────────────────────────────────────────
function Carousel({ title, sub, items, onSelect }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {sub && <span className="section-sub">{sub}</span>}
      </div>
      <div className="carousel-wrap">
        <button className="carousel-btn left" onClick={() => scroll(-1)}>‹</button>
        <div className="carousel" ref={ref}>
          {items.length === 0
            ? Array(8).fill(0).map((_, i) => <div key={i} className="card"><div className="card-poster skeleton" style={{ aspectRatio: "2/3" }} /></div>)
            : items.map(item => <MediaCard key={`${item.id}-${item.media_type}`} item={item} onClick={onSelect} />)
          }
        </div>
        <button className="carousel-btn right" onClick={() => scroll(1)}>›</button>
      </div>
    </div>
  );
}

// ── DetailModal ───────────────────────────────────────────────
function DetailModal({ item, onClose }) {
  const [details, setDetails] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [playEp, setPlayEp] = useState(null);
  const isTV = item.media_type === "tv" || (!item.title && item.name);

  useEffect(() => {
    const type = isTV ? "tv" : "movie";
    tmdbFetch(`/${type}/${item.id}`).then(d => {
      setDetails(d);
      if (isTV && d.seasons) {
        const real = d.seasons.filter(s => s.season_number > 0);
        setSeasons(real);
        if (real.length) loadEpisodes(item.id, real[0].season_number);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const loadEpisodes = async (id, sn) => {
    setActiveSeason(sn);
    const d = await tmdbFetch(`/tv/${id}/season/${sn}`);
    setEpisodes(d.episodes || []);
  };

  const d = details || item;
  const title = d.title || d.name || "";
  const year = (d.release_date || d.first_air_date || "").slice(0, 4);
  const runtime = d.runtime ? `${d.runtime}m` : d.episode_run_time?.[0] ? `~${d.episode_run_time[0]}m/ep` : "";

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        {!playing ? (
          <>
            {d.backdrop_path ? <img className="modal-hero" src={backdropUrl(d.backdrop_path)} alt={title} /> : <div className="modal-hero skeleton" />}
            <div className="modal-hero-gradient" />
            <div className="modal-body">
              <h2 className="modal-title">{title}</h2>
              <div className="modal-meta">
                {year && <span>{year}</span>}
                {runtime && <span>{runtime}</span>}
                {d.vote_average > 0 && <span style={{ color: "#f4a261" }}>★ {d.vote_average?.toFixed(1)}</span>}
                {d.number_of_seasons && <span>{d.number_of_seasons} temporada{d.number_of_seasons > 1 ? "s" : ""}</span>}
              </div>
              {d.genres?.length > 0 && <div className="genres">{d.genres.map(g => <span key={g.id} className="genre-tag">{g.name}</span>)}</div>}
              {d.overview && <p className="modal-overview">{d.overview}</p>}
              <button className="btn-play" onClick={() => { setPlaying(true); setPlayEp(null); }} style={{ marginBottom: "1.5rem" }}>
                ▶ {isTV ? "Ver desde el inicio" : "Reproducir"}
              </button>
              {isTV && seasons.length > 0 && (
                <div>
                  <div className="section-header"><h3 className="section-title" style={{ fontSize: "1.1rem" }}>Episodios</h3></div>
                  <div className="season-tabs">
                    {seasons.map(s => (
                      <button key={s.season_number} className={"season-tab " + (activeSeason === s.season_number ? "active" : "")} onClick={() => loadEpisodes(item.id, s.season_number)}>
                        T{s.season_number}
                      </button>
                    ))}
                  </div>
                  <div className="episodes-grid">
                    {episodes.map(ep => (
                      <div key={ep.id} className="episode-card" onClick={() => { setPlayEp(ep); setPlaying(true); }}>
                        <span className="episode-num">{ep.episode_number}</span>
                        <div className="episode-info"><h5>{ep.name}</h5><span>{ep.air_date?.slice(0, 4)}{ep.runtime ? ` · ${ep.runtime}m` : ""}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <button className="btn-info" style={{ padding: "0.4rem 0.9rem", fontSize: "0.8rem" }} onClick={() => setPlaying(false)}>← Volver</button>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", letterSpacing: "1px" }}>
                {title}{playEp ? ` · T${activeSeason} E${playEp.episode_number}` : ""}
              </span>
            </div>
            <Player item={item} season={playEp ? activeSeason : undefined} episode={playEp ? playEp.episode_number : undefined} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── SearchBar ─────────────────────────────────────────────────
function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      const d = await tmdbFetch("/search/multi", { query });
      const items = (d.results || []).filter(r => r.media_type !== "person" && (r.poster_path || r.backdrop_path));
      setResults(items.slice(0, 8)); setOpen(true);
    }, 350);
  }, [query]);

  const pick = (item) => { setQuery(""); setOpen(false); onSelect(item); };

  return (
    <div className="search-wrap" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} tabIndex={-1}>
      <span className="search-icon">🔍</span>
      <input className="search-input" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} onFocus={() => results.length && setOpen(true)} />
      {open && results.length > 0 && (
        <div className="search-results">
          {results.map(item => (
            <div key={item.id} className="search-item" onMouseDown={() => pick(item)}>
              {item.poster_path ? <img className="search-thumb" src={posterUrl(item.poster_path, "w92")} alt="" /> : <div className="search-thumb skeleton" />}
              <div className="search-info"><h4>{item.title || item.name}</h4><span>{(item.release_date || item.first_air_date || "").slice(0, 4)}</span></div>
              <span className={"search-badge " + (item.media_type === "movie" ? "badge-movie" : "badge-tv")}>{item.media_type === "movie" ? "Película" : "Serie"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────
function Hero({ item, onPlay, onInfo }) {
  if (!item) return <div style={{ height: "92vh", background: "var(--bg)" }} />;
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  return (
    <div className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${backdropUrl(item.backdrop_path)})` }} />
      <div className="hero-gradient" />
      <div className="hero-content">
        <div className="hero-badge">🔥 Trending</div>
        <h1 className="hero-title">{title}</h1>
        <div className="hero-meta">
          <span>{year}</span>
          {item.vote_average > 0 && <span className="hero-rating">★ {item.vote_average.toFixed(1)}</span>}
          <span>{item.media_type === "movie" ? "Película" : "Serie"}</span>
        </div>
        {item.overview && <p className="hero-desc">{item.overview}</p>}
        <div className="hero-btns">
          <button className="btn-play" onClick={() => onPlay(item)}>▶ Reproducir</button>
          <button className="btn-info" onClick={() => onInfo(item)}>ℹ Más info</button>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("inicio");
  const [selected, setSelected] = useState(null);
  const [trending, setTrending] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topTV, setTopTV] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [newTV, setNewTV] = useState([]);
  const [action, setAction] = useState([]);
  const [animation, setAnimation] = useState([]);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    Promise.all([
      tmdbFetch("/trending/all/week"),
      tmdbFetch("/movie/popular"),
      tmdbFetch("/tv/popular"),
      tmdbFetch("/movie/now_playing"),
      tmdbFetch("/tv/on_the_air"),
      tmdbFetch("/discover/movie", { with_genres: "28", sort_by: "popularity.desc" }),
      tmdbFetch("/discover/movie", { with_genres: "16", sort_by: "popularity.desc" }),
    ]).then(([tr, tm, tt, nm, nt, ac, an]) => {
      const trItems = (tr.results || []).slice(0, 20).map(i => ({ ...i, media_type: i.media_type || "movie" }));
      setTrending(trItems);
      setHero(trItems.find(i => i.backdrop_path) || trItems[0]);
      setTopMovies((tm.results || []).slice(0, 20).map(i => ({ ...i, media_type: "movie" })));
      setTopTV((tt.results || []).slice(0, 20).map(i => ({ ...i, media_type: "tv" })));
      setNewMovies((nm.results || []).slice(0, 20).map(i => ({ ...i, media_type: "movie" })));
      setNewTV((nt.results || []).slice(0, 20).map(i => ({ ...i, media_type: "tv" })));
      setAction((ac.results || []).slice(0, 20).map(i => ({ ...i, media_type: "movie" })));
      setAnimation((an.results || []).slice(0, 20).map(i => ({ ...i, media_type: "movie" })));
    });
  }, []);

  const openItem = useCallback((item) => setSelected(item), []);
  const closeModal = () => setSelected(null);

  return (
    <>
      <style>{css}</style>
      <div className="page">
        <nav className="nav">
          <div className="nav-logo" onClick={() => setTab("inicio")}>STREAMVAULT</div>
          <div className="nav-tabs">
            {["inicio", "peliculas", "series"].map(t => (
              <button key={t} className={"nav-tab " + (tab === t ? "active" : "")} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <SearchBar onSelect={openItem} />
        </nav>

        {tab === "inicio" && <>
          <Hero item={hero} onPlay={openItem} onInfo={openItem} />
          <Carousel title="🔥 Trending" sub="Esta semana" items={trending} onSelect={openItem} />
          <Carousel title="🎬 Películas Populares" items={topMovies} onSelect={openItem} />
          <Carousel title="📺 Series Populares" items={topTV} onSelect={openItem} />
          <Carousel title="🆕 En Cines Ahora" items={newMovies} onSelect={openItem} />
          <Carousel title="📡 Series al Aire" items={newTV} onSelect={openItem} />
          <Carousel title="💥 Acción" items={action} onSelect={openItem} />
          <Carousel title="🎨 Animación" items={animation} onSelect={openItem} />
        </>}
        {tab === "peliculas" && <div style={{ paddingTop: "2rem" }}>
          <Carousel title="🔥 Populares" items={topMovies} onSelect={openItem} />
          <Carousel title="🆕 En Cines" items={newMovies} onSelect={openItem} />
          <Carousel title="💥 Acción" items={action} onSelect={openItem} />
          <Carousel title="🎨 Animación" items={animation} onSelect={openItem} />
        </div>}
        {tab === "series" && <div style={{ paddingTop: "2rem" }}>
          <Carousel title="📺 Populares" items={topTV} onSelect={openItem} />
          <Carousel title="📡 Al Aire" items={newTV} onSelect={openItem} />
        </div>}

        {selected && <DetailModal item={selected} onClose={closeModal} />}
      </div>
    </>
  );
}
