
export interface Config {
    rpcUrl: string
    disableSnapshot: boolean
    relayApiKey?: string
    relayApiSecret?: string
    railwayEnvironmentName?: string
};

export const config: Config = {
    rpcUrl: process.env.PONDER_RPC_URL_1 as string,
    disableSnapshot: process.env.DISABLE_SNAPSHOT === "true",
    relayApiKey: process.env.RELAY_API_KEY,
    relayApiSecret: process.env.RELAY_API_SECRET,
    railwayEnvironmentName: process.env.RAILWAY_ENVIRONMENT_NAME
}