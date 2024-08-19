module.exports = [
  {
      files: ["**/*.{js,mjs,cjs,ts}"],
  },
  {
      languageOptions: {
          globals: {
              window: true,
              document: true,
              // Add other browser globals if needed
          },
      },
  },
  require("@eslint/js").configs.recommended,
  ...require("typescript-eslint").configs.recommended,
  {
      ignores: [  // Use 'ignores' instead of 'ignorePatterns'
          "dist/**/*",
          "firebase.ts",
          "*.config.js"
      ],
  },
];