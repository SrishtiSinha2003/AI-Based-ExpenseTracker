import React from "react";

export function GridBackground({ children }) {
  return (
    <div className="w-full bg-slate-900 dark:bg-slate-900 light:bg-slate-100 bg-grid-white/[0.05] relative text-white min-h-screen transition-colors duration-300">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-slate-900 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,#0f172a)] dark:bg-slate-900" />
      {children}
    </div>
  );
}
