module.exports = {
    preset: 'ts-jest', // Use ts-jest to compile TypeScript
    testEnvironment: 'node', // Your app likely runs in a Node environment
    testMatch: ['**/__tests__/**/*.test.ts'], // Look for tests in the __tests__ folder
    collectCoverageFrom: [
      'src/services/*.{js,jsx,ts,tsx}', // Include all .js, .jsx, .ts, .tsx files within the 'src' directory and its subdirectories
    ],
  };