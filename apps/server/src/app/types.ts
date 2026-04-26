export interface AppBindings {
  readonly DB: D1Database;
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly BETTER_AUTH_SECRET: string;
  readonly NODE_ENV: string;
  readonly OPENWEATHER_API_KEY: string;
}

export interface AppVariables {
  readonly userId: string;
}

export interface AppEnv {
  Bindings: AppBindings;
  Variables: AppVariables;
}