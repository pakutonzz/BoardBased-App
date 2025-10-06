import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{ backgroundColor: "var(--Topbar, #3A3A3A)", borderColor: "var(--Line-Gray, #444444)" }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
        <nav className="flex items-center gap-4 py-3">
          <Link to="/" className="text-2xl font-black tracking-tight">
            Board<span style={{ color: "var(--Secondary-900, #F97316)" }}>Based</span>
          </Link>

          {/* Search */}
          <div className="relative ml-2 hidden flex-1 items-center md:flex">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: "#7A7A7A" }}
            />
            <input
              placeholder="Search"
              className="w-full rounded-full border py-2 pl-9 pr-4 text-sm outline-none"
              style={{ backgroundColor: "#FFFFFF", color: "#222", borderColor: "var(--Line-Gray, #444444)" }}
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
