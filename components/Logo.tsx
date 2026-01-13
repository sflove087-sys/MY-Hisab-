
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M50 5C25.1472 5 5 25.1472 5 50C5 74.8528 25.1472 95 50 95C74.8528 95 95 74.8528 95 50C95 25.1472 74.8528 5 50 5Z" fill="url(#brand-grad)" />
    <path d="M35 50L45 60L65 40" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="brand-grad" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f14d23" />
        <stop offset="1" stopColor="#ff9800" />
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;
