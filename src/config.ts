export interface Config {
  rpcUrl: string;
  relayApiKey?: string;
  relayApiSecret?: string;
  railwayEnvironmentName?: string;
}

export const config: Config = {
  rpcUrl: process.env.PONDER_RPC_URL_1 as string,
  relayApiKey: process.env.RELAY_API_KEY,
  relayApiSecret: process.env.RELAY_API_SECRET,
  railwayEnvironmentName: process.env.RAILWAY_ENVIRONMENT_NAME,
};
