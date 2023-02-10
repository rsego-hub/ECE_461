module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "rules": {
		// enable additional rules
		"no-duplicate-imports": ["error", { "includeExports": true } ],
        // disable rules from base configurations
        "no-irregular-whitespace": "off",
        "no-mixed-spaces-and-tabs": "off",
        "indent": "off",
    }
};