import React from 'react';

export const GradientBackground = () => (
    <>
        <style>
            {` @keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-10px, 10px); } 100% { transform: translate(0, 0); } } @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } 100% { transform: translate(0, 0); } } `}
        </style>
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full">
            <defs>
                <linearGradient id="rev_grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'var(--color-primary)', stopOpacity:0.8}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-3)', stopOpacity:0.6}} /></linearGradient>
                <linearGradient id="rev_grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: 'var(--color-chart-4)', stopOpacity:0.9}} /><stop offset="50%" style={{stopColor: 'var(--color-secondary)', stopOpacity:0.7}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-1)', stopOpacity:0.6}} /></linearGradient>
                <radialGradient id="rev_grad3" cx="50%" cy="50%" r="50%"><stop offset="0%" style={{stopColor: 'var(--color-destructive)', stopOpacity:0.8}} /><stop offset="100%" style={{stopColor: 'var(--color-chart-5)', stopOpacity:0.4}} /></radialGradient>
                <filter id="rev_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="35"/></filter>
                <filter id="rev_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="25"/></filter>
                <filter id="rev_blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45"/></filter>
            </defs>
            <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
                <ellipse cx="200" cy="500" rx="250" ry="180" fill="url(#rev_grad1)" filter="url(#rev_blur1)" transform="rotate(-30 200 500)"/>
                <rect x="500" y="100" width="300" height="250" rx="80" fill="url(#rev_grad2)" filter="url(#rev_blur2)" transform="rotate(15 650 225)"/>
            </g>
            <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
                <circle cx="650" cy="450" r="150" fill="url(#rev_grad3)" filter="url(#rev_blur3)" opacity="0.7"/>
                <ellipse cx="50" cy="150" rx="180" ry="120" fill="var(--color-accent)" filter="url(#rev_blur2)" opacity="0.8"/>
            </g>
        </svg>
    </>
);
