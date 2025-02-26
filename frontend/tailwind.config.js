module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3498DB',     // Bleu Sora
        'secondary': '#FFFFFF',   // Blanc Pur
        'accent': '#F39C12',      // Orange Énergie
        'contrast': '#2C3E50',    // Gris Asphalte
        'eco-alt': '#2ECC71',     // Alternative éco-friendly
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
