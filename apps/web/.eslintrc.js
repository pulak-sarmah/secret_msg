/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ['@secret-hub/eslint-config/next.js'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
    },
    ignorePatterns: ['node_modules/', 'dist/', '**/*.d.ts', '*.config.js'],
}