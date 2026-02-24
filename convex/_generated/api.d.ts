/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityFunctions from "../activityFunctions.js";
import type * as agentMutations from "../agentMutations.js";
import type * as agentQueries from "../agentQueries.js";
import type * as checkpointFunctions from "../checkpointFunctions.js";
import type * as deliverableFunctions from "../deliverableFunctions.js";
import type * as http from "../http.js";
import type * as messageMutationsV2 from "../messageMutationsV2.js";
import type * as mutations from "../mutations.js";
import type * as notificationFunctions from "../notificationFunctions.js";
import type * as queries from "../queries.js";
import type * as taskMutationsV2 from "../taskMutationsV2.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityFunctions: typeof activityFunctions;
  agentMutations: typeof agentMutations;
  agentQueries: typeof agentQueries;
  checkpointFunctions: typeof checkpointFunctions;
  deliverableFunctions: typeof deliverableFunctions;
  http: typeof http;
  messageMutationsV2: typeof messageMutationsV2;
  mutations: typeof mutations;
  notificationFunctions: typeof notificationFunctions;
  queries: typeof queries;
  taskMutationsV2: typeof taskMutationsV2;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
