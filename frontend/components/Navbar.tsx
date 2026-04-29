"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",            label: "Home" },
  { href: "/models",      label: "Models" },
  { href: "/comparison",  label: "Comparison" },
  { href: "/test",        label: "Test" },
  { href: "/reflection",  label: "Reflection" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 glass" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-bold gradient-text tracking-wide">Papillon</span>
        <span className="text-white/30 text-sm">🦋</span>
      </Link>

      <div className="flex items-center gap-8">
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
    </nav>
  );
}
