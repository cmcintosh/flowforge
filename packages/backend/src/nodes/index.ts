import { nodeRegistry } from './registry.js';
import { httpRequestNode } from './core/httpRequest.js';
import { webhookTriggerNode } from './core/webhookTrigger.js';
import { cronTriggerNode } from './core/cronTrigger.js';
import { codeNode } from './core/code.js';
import { setNode } from './core/set.js';
import { filterNode } from './core/filter.js';
import { conditionalNode } from './core/conditional.js';
import { delayNode } from './core/delay.js';
import { respondToWebhookNode } from './core/respondToWebhook.js';
import { mergeNode } from './core/merge.js';

// Register all built-in nodes
nodeRegistry.register(httpRequestNode);
nodeRegistry.register(webhookTriggerNode);
nodeRegistry.register(cronTriggerNode);
nodeRegistry.register(codeNode);
nodeRegistry.register(setNode);
nodeRegistry.register(filterNode);
nodeRegistry.register(conditionalNode);
nodeRegistry.register(delayNode);
nodeRegistry.register(respondToWebhookNode);
nodeRegistry.register(mergeNode);

// Export registry for use by the engine
export { nodeRegistry } from './registry.js';
export type { NodeHandler, NodeExecuteContext } from './registry.js';
