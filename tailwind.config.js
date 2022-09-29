/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#222831",
        "background": "#393E46",
        "text-colour": "#EEEEEE",
        "accent": "#00ADB5",
        "accent-2": "#005E63",
        "nav-text": "#a0a8bb",
        "border": "#535965"
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}
