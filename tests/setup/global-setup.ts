import { readFileSync } from 'fs';
import { resolve } from 'path';

async function globalSetup() {
  // Load .env.local
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envFile = readFileSync(envPath, 'utf-8');
    const envVars = envFile
      .split('\n')
      .filter(line => line && !line.startsWith('#'))
      .map(line => line.split('='))
      .reduce((acc, [key, value]) => {
        if (key && value) {
          acc[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
        return acc;
      }, {} as Record<string, string>);

    // Set env vars if not already set
    Object.entries(envVars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.warn('Failed to load .env.local:', error);
  }
}

export default globalSetup;
