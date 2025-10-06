import { Outlet, Link } from "react-router-dom";
import { CONFIG } from "../../lib/config";
import Swal from "sweetalert2";
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";

type GameRow = {
  id: number;
  name: string;
  averageRating?: string | number | null;
  imageUrl?: string | null;
  primaryImage?: string | null;
  ogImage?: string | null;
};

type ApiResponse = {
  total: number;
  Size: number;
  category: string | null;
  rows: GameRow[];
};

// 🔹 Debounce helper
function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return useCallback((...args: Parameters<T>) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// 🔹 Basic scoring for suggestions
function scoreSimilarity(query: string, name: string): number {
  const q = query.trim().toLowerCase();
  const n = (name || "").toLowerCase();
  if (!q) return 0;
  if (n === q) return 1000;
  if (n.startsWith(q)) return 900 - (n.length - q.length);
  const idx = n.indexOf(q);
  if (idx >= 0) return 800 - idx;
  const setQ = new Set(q);
  let common = 0;
  for (const ch of n) if (setQ.has(ch)) common++;
  return common;
}

// 🔹 Image / rating helpers
function imgOf(r: GameRow) {
  return r.primaryImage || r.imageUrl || r.ogImage || "/placeholder.png";
}
function ratingOf(r: GameRow) {
  const v = r.averageRating;
  if (v === null || v === undefined || v === "") return "—";
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

// ✅ Use CONFIG.API_BASE for API calls
async function fetchBoardGames(q: string, signal?: AbortSignal): Promise<ApiResponse> {
  const base = CONFIG.API_BASE.replace(/\/$/, "");
  const url = `${base}/board-games?q=${encodeURIComponent(q)}&pageSize=10`;
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export default function Shell() {
  // 🔹 Alert for CSV download
  const alertBeforedownloadCSV = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    const base = CONFIG.API_BASE.replace(/\/$/, "");
    let countHTML = "";
    try {
      const res = await fetch(`${base}/board-games?pageSize=1`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const total = Number(data?.total ?? 0);
        if (!isNaN(total)) {
          countHTML = `<p>We currently have <b>${total.toLocaleString()}</b> board games collected.</p>`;
        }
      }
    } catch {}

    const result = await Swal.fire({
      title: "Download the Board Games CSV?",
      icon: "info",
      html: `
        <p>This export contains the <b>Board Games</b> sorted by category.</p>
        <p>The CSV contains one game name per line.</p>
        <p><i>Data was gathered with at least two levels of crawling.</i></p>
        <hr>
        ${countHTML || "<p>We have a large collection of board games ready for download.</p>"}
        <p>Click <b>Download CSV</b> to start. This may take up to 3 minutes—please wait.</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Download CSV",
      confirmButtonColor: "#F97316",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      const a = document.createElement("a");
      a.href = `${base}/board-games/export.csv`;
      a.download = "board-games.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  // 🔹 State for search bar
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<GameRow[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    if (!q.trim()) { setRows([]); setOpen(false); return; }
    setLoading(true);
    const ac = new AbortController(); abortRef.current = ac;
    try {
      const data = await fetchBoardGames(q, ac.signal);
      const top3 = [...(data.rows || [])]
        .map(r => ({ r, s: scoreSimilarity(q, r.name) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 3)
        .map(x => x.r);
      setRows(top3);
      setOpen(top3.length > 0);
    } catch {
      setRows([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedRun = useDebouncedCallback(run, 300);
  const goTo = (id: number) => (window.location.href = `${window.location.origin}/detail/${id}`);
  const results = useMemo(() => rows, [rows]);

  // 🔹 Layout
  return (
    <div className="min-h-dvh bg-[#383838] text-white font-noto">
      {/* NAVBAR */}
      <header className="sticky top-0 z-20 w-full bg-[#323232] h-[100px]">
        <div className="h-full flex items-center justify-between px-8">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src="/BoardBased.png" alt="BoardBased" className="h-[40px] w-auto" />
          </Link>

          {/* Search bar */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-[853px] h-10 sm:h-12 md:h-[50px]">
              <input
              type="search"
              aria-label="Search board games"
              placeholder="Search"
              value={query}
              onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  setOpen(!!v);
                  debouncedRun(v);
                }}
                className="w-full h-full rounded-full bg-white text-gray-900 placeholder-gray-400 pl-4 pr-10 text-base outline-none shadow-sm"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {loading && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 animate-spin">
                  <div className="h-4 w-4 border-2 border-black/30 border-t-transparent rounded-full" />
                </div>
              )}

              {open && results.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 rounded-xl border shadow-lg overflow-hidden"
                  style={{ backgroundColor: "#FFFFFF", borderColor: "var(--Line-Gray, #444444)" }}
                >
                  {results.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => goTo(g.id)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#F5F5F5]"
                    >
                      <img
                        src={imgOf(g)}
                        alt={g.name}
                        className="h-8 w-8 rounded object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium line-clamp-1" style={{ color: "#222" }}>{g.name}</div>
                        <div className="text-xs" style={{ color: "#666" }}>Rating: {ratingOf(g)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* GitHub link — NEW */}
            <a
              href="https://github.com/pakutonzz/BoardBased-App"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open GitHub repository"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2
                        hover:bg-white/10 transition"
            >
              {/* GitHub mark (inline SVG, no library needed) */}
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" aria-hidden="true">
                <path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56
                0-.28-.01-1.02-.02-2-3.19.69-3.87-1.54-3.87-1.54-.53-1.36-1.29-1.72-1.29-1.72-1.06-.72.08-.71.08-.71
                1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.39.97.11-.76.41-1.27.75-1.56-2.55-.29-5.23-1.28-5.23-5.69
                0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 5.83 0c2.22-1.49 3.2-1.18 3.2-1.18
                .63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.67.42.36.8 1.08.8 2.18 0 1.57-.01 2.84-.01 3.23
                0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/>
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>

            {/* existing Download CSV button stays after this */}
            {/* <YourDownloadCsvButton /> */}
          </div>

          {/* Download CSV button */}
          <button
            onClick={alertBeforedownloadCSV}
            className="ml-8 inline-flex h-[50px] w-[262px] items-center justify-center gap-3 rounded-md bg-[#F97316] hover:brightness-110 active:brightness-90 text-white shadow transition"
            type="button"
            aria-label="Download CSV"
          >
            <svg className="shrink-0" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[20px] font-semibold leading-none">Download CSV</span>
          </button>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="px-8 pt-[25px] pb-10">
        <Outlet />
      </main>
    </div>
  );
}
