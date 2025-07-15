module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6BFF', // Azul neon principal
          dark: '#1A2A4F',    // Azul escuro de fundo
          light: '#6EC1FF',   // Azul claro para gradientes
        },
        secondary: {
          DEFAULT: '#7B2FF2', // Roxo neon
          light: '#F357A8',   // Rosa/roxo claro
        },
        background: {
          DEFAULT: '#0A0A23', // Fundo escuro
          glass: 'rgba(20, 30, 60, 0.7)', // Glassmorphism
        },
        accent: '#00FFD0', // Ciano para detalhes
        card: '#181A2A',   // Fundo de cards
        border: '#23264D', // Bordas de cards
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 16px 2px #2D6BFF',
        glass: '0 4px 32px 0 rgba(44, 104, 255, 0.15)',
      },
      backgroundImage: {
        'gradient-sss': 'linear-gradient(135deg, #2D6BFF 0%, #7B2FF2 100%)',
        'gradient-card': 'linear-gradient(135deg, #181A2A 60%, #23264D 100%)',
      },
    },
  },
  plugins: [],
} 