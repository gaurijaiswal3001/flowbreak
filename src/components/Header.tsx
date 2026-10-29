import React from 'react';
import { Flame, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  testsRunCount: number;
  lastVerdict?: 'survived' | 'busted' | 'empty';
}

export const Header: React.FC<HeaderProps> = ({ testsRunCount, lastVerdict }) => {
  return (
    <header className="pt-6 pb-6 border-b-2 border-stone-800 bg-[#FAF7F0] px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Title */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-[#FF5A43] border-2 border-stone-800 shadow-[2px_2px_0px_#1E232A] flex items-center justify-center text-white font-black text-xl select-none rotate-[-4deg]">
              FB
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-[#1E232A]">
                Flow<span className="text-[#FF5A43]">Break</span>
              </span>
              <span className="sticker-badge bg-[#A3E635] text-stone-900">
                <Terminal className="w-3 h-3" />
                Playground v1.0
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E232A] tracking-tight mt-2 flex items-center gap-2 flex-wrap">
            Let's break your form.
            <span className="inline-block animate-pulse text-2xl">💥</span>
          </h1>
          <p className="text-base sm:text-lg italic font-medium text-stone-600 mt-1">
            Because users will find a way.
          </p>
        </div>

        {/* Playful Stickers / Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="sticker-badge bg-white text-stone-800">
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF5A43]" />
            Native HTML5 Engine
          </div>

          <div className="sticker-badge bg-[#93C5FD] text-blue-950">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            Zero Scripts In Sandboxes
          </div>

          {testsRunCount > 0 && lastVerdict && (
            <div
              className={`sticker-badge ${
                lastVerdict === 'survived'
                  ? 'bg-[#84CC16] text-stone-950'
                  : 'bg-[#FF5A43] text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              {lastVerdict === 'survived' ? 'Form Survived! 🎉' : 'Busted Form! 💥'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
