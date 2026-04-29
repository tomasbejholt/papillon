"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/",            label: "Home" },
  { href: "/models",      label: "Models" },
  { href: "/comparison",  label: "Comparison" },
  { href: "/test",        label: "Test" },
  { href: "/reflection",  label: "Reflection" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="text-xl font-bold gradient-text tracking-wide">Papillon</span>
          <span className="text-white/30 text-sm">🦋</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === link.href
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-200 origin-center ${open ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-200 origin-center ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-base font-medium transition-colors duration-200 ${
                pathname === link.href ? "text-white" : "text-white/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
