import React from "react";

export function GridBackground({ children }) {
  return (
    <div className="w-full bg-black bg-grid-white/[0.2] relative text-white min-h-screen">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {children}
    </div>
  );
}
