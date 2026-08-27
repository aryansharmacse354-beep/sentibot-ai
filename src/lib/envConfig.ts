/**
 * Validates required environment variables at runtime.
 */
export function validateEnvConfig() {
  const requiredServerVars = ['GEMINI_API_KEY'];
  const missing: string[] = [];

  for (const key of requiredServerVars) {
    if (!process.env[key] && process.env.NODE_ENV === 'production') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.warn(`[EnvConfig Warning]: Missing production environment variables: ${missing.join(', ')}`);
  }
}
