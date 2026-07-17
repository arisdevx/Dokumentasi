import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: ["./dist/**/*.html", "./src/**/*.js", "./src/templates/**/*.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: [typography]
};
