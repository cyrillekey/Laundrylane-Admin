import { getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import config from "./config.json";
let app;

try {
  app = initializeApp(config);
} catch (_error) {
  app = getApp();
}

const auth = getAuth(app);

export default auth;
