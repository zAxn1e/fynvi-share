import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      quotes: ["warn", "double", { allowTemplateLiterals: true }],
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/use-memo": "off",
      "react-hooks/static-components": "off",
      "react-hooks/purity": "off",
      "import/no-anonymous-default-export": "off",
      "no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-location-assign-relative-destination": "off",
    },
  },
];
