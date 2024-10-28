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
        poolOptions: {
            threads: {
                maxThreads: 4,
                minThreads: 1,
            },
        },
        sequence: { hooks: "stack" },
        testTimeout: os.platform() === "win32" ? 30_000 : 10_000,
    },
});