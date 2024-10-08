import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    plugins: [react(), tsconfigPaths()],
    base: env.VITE_ROOT_URL,
    server: {
      host: "0.0.0.0",
      port: 4173,
    },
  });
};
