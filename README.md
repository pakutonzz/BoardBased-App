# BoardBased‑App

This project is a part of Theory of Computation subject.

### Members
```
66010840	สรศักดิ์ ลิ้มทอง
66011464	ราธา โรจน์รุจิพงศ์
66011437	พัฒน์กุลธร ชัยรัตน์
66010794	ศศิญากร จันทร์ศิริ
66010204	ณกุล เฉลิมชัยโกศล
66011377	ธนกร ฟูคูฮารา
66011428	พงศภัค ต๊ะต้องใจ
66011476	วัฒน์นันท์ ธีรธนาพงษ์
```

## 1) repo structure:
```
BoardBased-App/
├─ Frontend/   # React + Vite + TypeScript + Tailwind
├─ Backend/    # HTTP API that serves /board-games
└─ Crawler/    # Python crawler that builds seed.json
```

---

## 2) How to run (quick path)

> The three parts run independently. Use any terminal; Node 18+ and Python 3.10+ recommended.

### A. Start the Backend
```bash
cd Backend
npm install
cp .env.example .env       # if provided
npm run dev                # starts HTTP API (default http://localhost:3000)
```
**Endpoint to check**
```
GET /board-games?pageSize=20&category=Dice&sort=id:asc - Returns the first **20** items in **category=Dice**, **sorted by id ascending**.
GET /board-games/export.csv -Return .csv file
```


### B. Start the Frontend
```bash
cd Frontend
npm install
cp .env.example .env
# set in .env:
# VITE_API_BASE=/api
# VITE_SITE_URL=http://127.0.0.1:8082/
npm run dev                # Vite dev server (e.g., http://localhost:5173)
```
**Pages to check**
- `/` — main grid
- `/category` — category grid
- `/category/Dice` — category details
- `/Details/:id` — details of a board game

### C. (Optional) Run the Crawler to refresh data
```bash
cd Crawler
python -m venv .venv
# Windows: . .venv/Scripts/activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python crawl.py --source bgg --category Dice --limit 500 --qps 1.5 --resume   --out ../Backend/data/seed.json
```
Then restart the Backend so it serves the new `seed.json`.

---

## 3) Minimal API contract (used by the UI)

| Endpoint | Method | Query Params | Behavior |
|---|---|---|---|
| `/board-games` | GET | `category` (string), `pageSize` (int), `sort` (e.g. `id:asc`) | Returns games filtered by category in a **stable** order. |

---

## 4) Crawler (concise algorithm & guarantees)

**Goal**: export a **stable** dataset (`seed.json`) the Backend can serve deterministically.

**Pipeline (6 steps)**  
1) **Seed** starting URLs / cursors per category.  
2) **Fetch (polite)**: respect `robots.txt`, rate‑limit (`--qps`), retry with backoff.  
3) **Parse** HTML/JSON to extract fields (name, year, players, etc.).  
4) **Normalize** types & values (e.g., unify category casing like “dice” → “Dice”).  
5) **De‑duplicate** using a canonical key `(source, source_id)` or `slug(name)+year`.  
6) **Export**: assign a **stable `id`** per game, **sort by `id`**, write `seed.json`.

**Why results are deterministic**
- `id` is stable across runs (persisted mapping or computed from a stable hash).  
- Final export is **sorted by `id`** before saving.  
- The Backend returns items with `sort=id:asc`, guaranteeing **same order for same filter**.

**Common flags**
- `--source <name>` (e.g., `bgg`), `--category <name>` (e.g., `Dice`),  
- `--limit <n>`, `--qps <float>`, `--resume`, `--out <path>`.

---

## 5) Tech stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router.  
- **Backend**: Node/Express.  
- **Crawler**: Python (requests/BeautifulSoup or similar).



