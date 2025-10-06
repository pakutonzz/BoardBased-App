import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const CSV_URL = "/boardgame.csv";

const AZ = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function CategoryPage() {
  const [rawCsv, setRawCsv] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load CSV
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(CSV_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const txt = await res.text();
        setRawCsv(txt);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load CSV");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Parse → extract Category column
  useEffect(() => {
    if (!rawCsv) return;
    const rows = parseCsv(rawCsv);
    if (!rows.length) return;

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const ci =
      headers.indexOf("category") !== -1
        ? headers.indexOf("category")
        : headers.indexOf("category_name") !== -1
        ? headers.indexOf("category_name")
        : headers.indexOf("name");

    if (ci === -1) {
      setError("No Category column found in CSV");
      return;
    }

    const set = new Set<string>();
    for (let r = 1; r < rows.length; r++) {
      const val = rows[r][ci]?.trim();
      if (val) set.add(val);
    }
    setAllCategories(Array.from(set).sort((a, b) => a.localeCompare(b)));
  }, [rawCsv]);

  const grouped = useMemo(() => groupByInitial(allCategories), [allCategories]);

  return (
    <div>
      {/* Page title */}
      <h1 className="text-[32px] font-bold mb-8 pl-[82px]">
        Board Games Categories
      </h1>

      {/* Multi-column layout */}
      <div className="mt-2 pl-[123px] columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-12 [column-fill:_balance]">
        {AZ.filter((letter) => (grouped[letter] ?? []).length > 0).map(
          (letter) => (
            <section key={letter} className="break-inside-avoid mb-10">
              <h2 className="text-[20px] font-semibold text-white/80 mb-3">
                {letter}
              </h2>
              <ul className="space-y-2">
                {grouped[letter].map((name) => (
                  <li key={name}>
                    <Link
                      to={`/category/${slugify(name)}`}
                      className="text-[20px] font-normal text-white hover:text-orange-300 underline underline-offset-2 decoration-white/30"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        )}
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */
function groupByInitial(items: string[]) {
  const map: Record<string, string[]> = {};
  AZ.forEach((l) => (map[l] = []));
  for (const name of items) {
    const init = (name[0] || "").toUpperCase();
    const key = /[A-Z]/.test(init) ? init : "A";
    (map[key] ?? (map[key] = [])).push(name);
  }
  Object.keys(map).forEach((k) => map[k].sort((a, b) => a.localeCompare(b)));
  return map;
}

function slugify(s: string) {
  // Use encodeURIComponent to handle all special characters including slashes
  return encodeURIComponent(s);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0,
    field = "",
    row: string[] = [],
    inQuotes = false;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
