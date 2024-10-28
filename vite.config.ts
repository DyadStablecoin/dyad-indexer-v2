import os from "node:os";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@/generated": path.resolve(__dirname, "./ponder-env.d.ts"),
        },
    },
    test: {
        globalSetup: [],
        setupFiles: [],
        sequence: { hooks: "stack" },
        testTimeout: os.platform() === "win32" ? 30_000 : 10_000,
        onConsoleLog: (log) => {
            console.log(log);
            return true;
        },
    },
});