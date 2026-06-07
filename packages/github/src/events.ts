import type { GithubEventHandlers, GithubRouteResult, GithubWebhookContext } from './types.js';

function handledResult(
  eventName: string,
  action: string | undefined,
  handler: string,
  message: string,
): GithubRouteResult {
  return {
    handled: true,
    eventName,
    ...(action ? { action } : {}),
    handler,
    message,
  };
}

export const defaultGithubEventHandlers: GithubEventHandlers = {
  ping: async ({ eventName, action, payload }) => {
    return handledResult(eventName, action, 'ping', payload.zen ? `pong: ${payload.zen}` : 'pong');
  },
  installation: async ({ eventName, action }) => {
    return handledResult(eventName, action, 'installation', 'installation event received');
  },
  issue_comment: async ({ eventName, action }) => {
    return handledResult(eventName, action, 'issue_comment', 'issue comment event received');
  },
  pull_request: async ({ eventName, action }) => {
    return handledResult(eventName, action, 'pull_request', 'pull request event received');
  },
};

export function createGithubEventRouter(handlers: Partial<GithubEventHandlers> = {}) {
  return async function routeGithubEvent<TPayload extends Record<string, unknown> = Record<string, unknown>>(
    context: GithubWebhookContext<TPayload>,
  ): Promise<GithubRouteResult> {
    const mergedHandlers = { ...defaultGithubEventHandlers, ...handlers };

    switch (context.eventName) {
      case 'ping':
        return (await mergedHandlers.ping?.(context as GithubWebhookContext<{ zen?: string }>)) ?? {
          handled: true,
          eventName: context.eventName,
          action: context.action,
          handler: 'ping',
          message: 'pong',
        };
      case 'installation':
        return (await mergedHandlers.installation?.(context)) ?? {
          handled: true,
          eventName: context.eventName,
          action: context.action,
          handler: 'installation',
          message: 'installation event received',
        };
      case 'issue_comment':
        return (await mergedHandlers.issue_comment?.(context)) ?? {
          handled: true,
          eventName: context.eventName,
          action: context.action,
          handler: 'issue_comment',
          message: 'issue comment event received',
        };
      case 'pull_request':
        return (await mergedHandlers.pull_request?.(context)) ?? {
          handled: true,
          eventName: context.eventName,
          action: context.action,
          handler: 'pull_request',
          message: 'pull request event received',
        };
      default:
        return {
          handled: false,
          eventName: context.eventName,
          action: context.action,
          message: 'unsupported event',
        };
    }
  };
}

export async function routeGithubEvent<TPayload extends Record<string, unknown> = Record<string, unknown>>(
  context: GithubWebhookContext<TPayload>,
  handlers: Partial<GithubEventHandlers> = {},
): Promise<GithubRouteResult> {
  return createGithubEventRouter(handlers)(context);
}
