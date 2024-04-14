/** @type {import("eslint").Linter.Config} */
module.exports = {
    root: true,
    extends: ['@secret-hub/eslint-config/react-internal.js'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.lint.json',
        tsconfigRootDir: __dirname,
    },
    ignorePatterns: ['node_modules/', 'dist/', '**/*.d.ts', '*.config.js'],
}
