/**
 * Prompts Configuration Accessor for Agents Package
 *
 * This module provides a lazy-loading interface to the prompts config service.
 * It loads the config at runtime to avoid circular dependencies since agents
 * is built before the API package.
 */

type PromptPath = string[];

// Cache the imported module to avoid repeated require() calls
let getPromptImpl:
  | ((path: PromptPath, fallback: string) => Promise<string>)
  | null = null;
let loadAttempted = false;

/**
 * Lazy load the getPrompt implementation from the API server.
 */
async function loadGetPromptImpl(): Promise<
  ((path: PromptPath, fallback: string) => Promise<string>) | null
  > {
  if (getPromptImpl) {
    return getPromptImpl;
  }

  if (loadAttempted) {
    return null;
  }

  loadAttempted = true;

  try {
    // Dynamic require to avoid bundling issues and circular dependencies
    // This path works at runtime when deployed in the soev.ai monorepo
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const configModule = require('../../../../../api/server/services/Config/getPromptsConfig');
    getPromptImpl = configModule.getPrompt;
    return getPromptImpl;
  } catch {
    // This might happen during build or in environments where the API isn't available
    // Fall back silently - the fallback values will be used
    return null;
  }
}

/**
 * Get a configured prompt value with fallback.
 *
 * Navigates the prompts config using a path array and returns the fallback
 * if the path doesn't exist or config is not loaded.
 *
 * @param path - Path to the prompt value (e.g., ['agents', 'taskManager', 'prompt'])
 * @param fallback - Hardcoded fallback value to use if prompt not found
 * @returns The configured prompt or fallback value
 */
export async function getPrompt(
  path: PromptPath,
  fallback: string
): Promise<string> {
  try {
    const impl = await loadGetPromptImpl();
    if (impl) {
      return await impl(path, fallback);
    }
    return fallback;
  } catch {
    return fallback;
  }
}
