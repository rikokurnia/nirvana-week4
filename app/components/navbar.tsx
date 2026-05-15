"use client";

import { Wallet, Boxes } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-headline font-bold text-mint tracking-tighter flex items-center gap-2">
          <Boxes className="w-8 h-8" />
          Nirvana
        </div>
        <div className="hidden md:flex gap-8 items-center">
          {["Solutions", "Models", "Ecosystem", "Docs"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-on-surface-variant font-mono text-xs font-bold hover:text-mint transition-colors px-2 py-1 rounded tracking-widest uppercase"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:text-mint transition-colors cursor-pointer">
            <Wallet className="w-5 h-5" />
          </button>
          <button className="bg-mint text-black font-mono text-xs font-bold px-6 py-2.5 rounded-sm hover:brightness-110 active:scale-95 transition-all uppercase">
            Join Waitlist
          </button>
        </div>
      </div>
    </nav>
  );
}
