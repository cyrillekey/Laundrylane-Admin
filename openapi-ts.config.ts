import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:4000/api/documentation/openapi.json",
  output: "queries",
  plugins: [{ name: "@hey-api/typescript" }, "@tanstack/react-query"],
});
