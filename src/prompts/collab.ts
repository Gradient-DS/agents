// src/prompts/collab.ts
import { getPrompt } from '@/utils/prompts';

export const supervisorPrompt = `You are a supervisor tasked with managing a conversation between the
following workers: {members}. Given the following user request,
respond with the worker to act next. Each worker will perform a
task and respond with their results and status. Multiple workers can work at once, and they can use multiple tools at once. Each worker can run their tools multiple times per task. When finished,
respond with FINISH.`;

/**
 * Get the supervisor prompt from config with fallback to default.
 */
export async function getSupervisorPrompt(): Promise<string> {
  return getPrompt(['agents', 'supervisor', 'prompt'], supervisorPrompt);
}
