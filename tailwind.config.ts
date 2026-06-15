import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cosmic: {
          950: '#05070f',
          900: '#0a1022',
          800: '#121935',
        },
        fog: {
          500: 'rgba(153, 161, 184, 0.22)',
          700: 'rgba(88, 95, 117, 0.34)',
        },
        world: {
          blue: '#53b8ff',
          red: '#ff5c7a',
          gold: '#ffcb5c',
          green: '#56e39f',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 18px 40px rgba(30, 68, 145, 0.28)',
        'glow-blue': '0 0 25px rgba(83, 184, 255, 0.45)',
        'glow-red': '0 0 25px rgba(255, 92, 122, 0.45)',
        'glow-gold': '0 0 25px rgba(255, 203, 92, 0.45)',
        'glow-green': '0 0 25px rgba(86, 227, 159, 0.45)',
      },
      backgroundImage: {
        stars:
          'radial-gradient(circle at 20% 20%, rgba(83,184,255,0.18), transparent 25%), radial-gradient(circle at 80% 15%, rgba(255,92,122,0.16), transparent 22%), radial-gradient(circle at 55% 80%, rgba(86,227,159,0.12), transparent 18%), linear-gradient(180deg, #05070f 0%, #0a1022 40%, #121935 100%)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseHalo: 'pulseHalo 3.2s ease-in-out infinite',
        drift: 'drift 14s linear infinite',
        shimmer: 'shimmer 2.8s linear infinite',
        fogPulse: 'fogPulse 5.5s ease-in-out infinite',
        fogFadeOut: 'fogFadeOut 1.6s ease forwards',
        coreRotate: 'coreRotate 14s linear infinite',
        particleOrbit: 'particleOrbit 9s linear infinite',
        energyFlow: 'energyFlow 2.8s linear infinite',
        revealRise: 'revealRise 0.9s ease forwards',
        revealFade: 'revealFade 1.2s ease forwards',
        converge: 'converge 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseHalo: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.75' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        drift: {
          '0%': { transform: 'translateX(-10%) translateY(0px)' },
          '50%': { transform: 'translateX(6%) translateY(12px)' },
          '100%': { transform: 'translateX(-10%) translateY(0px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        fogPulse: {
          '0%, 100%': { opacity: '0.45', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        fogFadeOut: {
          '0%': { opacity: '0.65', filter: 'blur(18px)' },
          '100%': { opacity: '0', filter: 'blur(28px)' },
        },
        coreRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        particleOrbit: {
          '0%': { transform: 'rotate(0deg) translateX(56px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(56px) rotate(-360deg)' },
        },
        energyFlow: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        revealRise: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        revealFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        converge: {
          '0%, 100%': { opacity: '0.25', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body: ['Segoe UI', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
