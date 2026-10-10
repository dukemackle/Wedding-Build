import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * What to tell the person when a Claude call fails. The catch-all used to
 * hide everything behind "Something went wrong", which left no way to tell
 * an empty credit balance from a retired model or a network blip without
 * digging through Worker logs -- so each case now says what it is.
 */
export function assistantErrorMessage(error: unknown): string {
  if (error instanceof Anthropic.AuthenticationError) {
    return "The assistant isn't configured yet (missing or invalid API key).";
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return "The assistant's API key doesn't have access to this model.";
  }
  if (error instanceof Anthropic.RateLimitError) {
    return "The assistant is busy right now -- try again in a moment.";
  }
  if (error instanceof Anthropic.NotFoundError) {
    return "The assistant's model isn't available any more (error 404).";
  }
  if (error instanceof Anthropic.BadRequestError) {
    if (/credit balance/i.test(error.message)) {
      return "The assistant is out of API credit -- top it up in the Anthropic Console.";
    }
    return `The assistant couldn't handle that request (error 400: ${error.message.slice(0, 160)}).`;
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return "The assistant took too long to answer -- try again.";
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return "Couldn't reach the assistant (connection error) -- try again.";
  }
  if (error instanceof Anthropic.APIError && error.status) {
    if (error.status === 529 || error.status >= 500) {
      return `The assistant's service is having trouble (error ${error.status}) -- try again shortly.`;
    }
    return `Something went wrong reaching the assistant (error ${error.status}).`;
  }
  const detail = error instanceof Error ? `: ${error.message.slice(0, 160)}` : "";
  return `Something went wrong reaching the assistant${detail}.`;
}
