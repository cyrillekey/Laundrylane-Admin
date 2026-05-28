import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input:
    "https://laundry-lane-server.onrender.com/api/documentation/openapi.json",
  output: "queries",
  plugins: ["@hey-api/typescript", "@tanstack/react-query"],
});
