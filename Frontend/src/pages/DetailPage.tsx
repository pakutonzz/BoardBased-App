import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../lib/config";

/* ===================== Types ===================== */
type BoardGame = {
  id: number;
  category: string;
  name: string;
  description: string;
  playersMin: number | null;
  playersMax: number | null;
  timeMin: number | null;
  timeMax: number | null;
  agePlus: number | null;
  weight5: string | null;
  averageRating: string | null;
  artists: string[];
  designers: string[];
  publishers: string[];
  yearPublished: number | null;
  url: string | null;
  imageUrl: string | null;
  ogImage: string | null;
  primaryImage: string | null;
  galleryImages: string[];
  alternateNames: string[];
};

/* ===================== Utils ===================== */
function decodeHtmlEntities(input?: string) {
  if (!input) return "";
  const el = document.createElement("textarea");
  el.innerHTML = input;
  return el.value;
}

/* ===================== Gallery ===================== */
function Gallery({ images, altBase }: { images: string[]; altBase: string }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  const scrollThumbs = (dx: number) =>
    trackRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (!total) {
    return <div className="g-big" />;
  }

  return (
    <div className="g-wrap">
      {/* Big image */}
      <div className="g-big">
        <img src={images[index]} alt={`${altBase} image ${index + 1}`} />
      </div>

      {/* Thumbs strip + overlay arrows */}
      <div className="g-thumbs">
        <div ref={trackRef} className="g-track">
          {images.map((src, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                type="button"
                className={`g-thumb ${active ? "is-active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
              >
                <img src={src} alt={`${altBase} thumbnail ${i + 1}`} />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="g-arrow g-left"
          onClick={() => {
            prev();
            scrollThumbs(-124);
          }}
          aria-label="Previous image"
        >
          <svg width="7" height="14" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
            <path d="M1 1L8 8L1 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          className="g-arrow g-right"
          onClick={() => {
            next();
            scrollThumbs(124);
          }}
          aria-label="Next image"
        >
          <svg width="7" height="14" viewBox="0 0 9 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L8 8L1 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ===================== Page ===================== */
export default function DetailPage() {
  const { id } = useParams();
  const [game, setGame] = useState<BoardGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(`${API_BASE}/board-games/${id}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        const data: BoardGame = await res.json();
        if (alive) setGame(data);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      alive = false;
    };
  }, [id]);

  const gallery = useMemo(() => {
    if (!game) return [] as string[];
    const list = [game.primaryImage, ...(game.galleryImages ?? []), game.imageUrl, game.ogImage]
      .filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [game]);

  if (loading) {
    return (
      <div className="container">
        <div className="skeleton title" />
        <div className="layout">
          <div className="skeleton big" />
          <div className="skeleton block" />
        </div>
      </div>
    );
  }

  if (err) {
    return <div className="container error">Failed to load board game (id: {id}). {err}</div>;
  }
  if (!game) return <div className="container error">No data.</div>;

  const year = game.yearPublished ? `(${game.yearPublished})` : "";
  const rating = game.averageRating ?? "—";
  const altNames = (game.alternateNames ?? []).join(", ") || "—";
  const designers = (game.designers ?? []).join(", ") || "—";
  const artists = (game.artists ?? []).join(", ") || "—";
  const publishers = (game.publishers ?? []).join(", ") || "—";
  const decodedDesc = decodeHtmlEntities(game.description);

  return (
    <div className="container">
      {/* 2-column layout */}
      <div className="layout">
        {/* LEFT */}
        <div>
          <Gallery images={gallery} altBase={game.name} />
        </div>

        {/* RIGHT */}
        <div>
          <div className="title-row">
            <h1 className="title">{game.name}</h1>
            {year && <span className="year">{year}</span>}
          </div>

          <p className="tagline">{game.category || "—"}</p>

          <div className="rating">
            <span className="rating-label">Ratings:</span>
            <svg width="23" height="22" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1.18857 9.97184C0.821979 9.63179 1.02111 9.01703 1.51696 8.95806L8.54286 8.12216C8.74495 8.09812 8.92048 7.97083 9.00572 7.78547L11.9691 1.34114C12.1783 0.886343 12.8229 0.886256 13.032 1.34106L15.9954 7.78534C16.0807 7.97069 16.2551 8.09833 16.4572 8.12237L23.4834 8.95806C23.9793 9.01703 24.1779 9.63197 23.8113 9.97202L18.6174 14.7908C18.468 14.9293 18.4015 15.1356 18.4412 15.3359L19.8196 22.2966C19.9169 22.7878 19.3957 23.1684 18.96 22.9238L12.7863 19.4566C12.6088 19.3569 12.393 19.3573 12.2154 19.457L6.04114 22.9229C5.60543 23.1676 5.08326 22.7878 5.18057 22.2965L6.55923 15.3363C6.59889 15.1361 6.53254 14.9293 6.38313 14.7907L1.18857 9.97184Z"
                fill="#F97316"
                stroke="#F97316"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="rating-value">{rating}</span>
          </div>

          <div className="kv">
            <div><span className="k">Alternate Names:</span><span className="v">{altNames}</span></div>
            <div><span className="k">Designer:</span><span className="v">{designers}</span></div>
            <div><span className="k">Artist:</span><span className="v">{artists}</span></div>
            <div><span className="k">Publisher:</span><span className="v">{publishers}</span></div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="section">
        <div className="section-head">
          <h2>Description</h2>
          <div className="accent-line" />
        </div>
        <p className="desc">{decodedDesc}</p>
      </section>

      {/* Official Links */}
      {!!game.url && (
        <section className="section">
          <div className="section-head">
            <h2>Official Links</h2>
            <div className="accent-line" />
          </div>

          <div className="off-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M6.62198 13.3785L13.3785 6.62237M4.08873 9.15565L2.3996 10.8447C0.533829 12.7103 0.533288 15.7354 2.39905 17.601C4.26482 19.4667 7.29073 19.4661 9.15649 17.6005L10.8438 15.9116M9.15541 4.08811L10.8445 2.39907C12.7103 0.53342 15.735 0.533753 17.6007 2.39941C19.4665 4.26506 19.4664 7.28991 17.6006 9.15556L15.9124 10.8445"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <a href={game.url} target="_blank" rel="noopener noreferrer">
              {game.url}
            </a>
          </div>
        </section>
      )}

      {/* Scoped CSS for layout (no Tailwind needed) */}
      <style>{`
        .container {
          max-width: 1160px;
          margin: 0 auto;
          padding: 24px 16px 56px;
          color: #fff;
        }
        .error { color: #f87171; }

        /* Skeletons */
        .skeleton { background: #3a3a3a; border-radius: 8px; }
        .skeleton.title { width: 360px; height: 36px; margin-bottom: 16px; }
        .skeleton.big { width: 397px; height: 275px; }
        .skeleton.block { height: 160px; margin-top: 24px; }

        /* 2-col responsive layout */
        .layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 1024px) {
          .layout {
            grid-template-columns: 420px 1fr;
            gap: 40px;
          }
        }

        /* Title block */
        .title-row { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }
        .title { margin: 0; font-size: 40px; font-weight: 800; color: #F97316; line-height: 1.1; }
        .year { font-size: 28px; font-weight: 800; }
        .tagline { margin: 4px 0 0; font-size: 20px; font-weight: 600; color: #fff; }

        /* Rating + K/V list */
        .rating { display: flex; align-items: center; gap: 8px; margin-top: 16px; }
        .rating-label { font-size: 20px; font-weight: 600; color: #F97316; margin-right: 6px; }
        .rating-value { font-size: 20px; font-weight: 600; }
        .kv { font-size: 20px; margin-top: 18px; }
        .kv > div { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
        .k { color: #F97316; font-weight: 600; }
        .v { color: #fff; }

        /* Section / headings */
        .section { margin-top: 40px; }
        .section-head h2 { margin: 0 0 10px; font-size: 32px; font-weight: 800; }
        .accent-line { width: 100%; height: 2px; background: #F97316; }

        /* Description */
        .desc {
          font-size: 20px;
          line-height: 1.7;
          white-space: pre-line; /* keep line breaks from API (&#10;) */
          margin-top: 12px;
        }

        /* Official link */
        .off-link { display: flex; align-items: flex-start; gap: 10px; margin-top: 12px; }
        .off-link a { color: #fff; text-decoration: underline; word-break: break-all; }
        .off-link a:hover { color: #F97316; }

        /* --- Gallery CSS (no Tailwind) --- */
        .g-wrap { width: 100%; max-width: 397px; }
        .g-big {
          width: 397px; height: 275px; background: #262626;
          position: relative; overflow: hidden;
        }
        .g-big img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .g-thumbs { position: relative; width: 397px; margin-top: 12px; }
        .g-track {
          display: flex; gap: 12px; overflow-x: auto; padding-bottom: 2px;
          -ms-overflow-style: none; scrollbar-width: none;
        }
        .g-track::-webkit-scrollbar { display: none; }
        .g-thumb {
          width: 112px; height: 76px; flex: 0 0 auto; padding: 0;
          border: none; background: transparent; outline: none; cursor: pointer;
        }
        .g-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .g-thumb.is-active { outline: 2px solid #F97316; }

        .g-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          padding: 10px; background: rgba(0,0,0,.5); border: none; cursor: pointer;
        }
        .g-left { left: 0; }
        .g-right { right: 0; }
      `}</style>
    </div>
  );
}
