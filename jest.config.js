module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/dist/"],
  reporters: [
    "default",
    ["jest-junit", {
      outputDirectory: 'test-results',
      outputName: 'TESTS-all.xml'
    }]
  ]
};
