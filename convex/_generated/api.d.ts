/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as comments from "../comments.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as plugins from "../plugins.js";
import type * as plugins_cleanup from "../plugins/cleanup.js";
import type * as plugins_seedData from "../plugins/seedData.js";
import type * as smartImport from "../smartImport.js";
import type * as subjects from "../subjects.js";
import type * as tasks from "../tasks.js";
import type * as tests_testUtils from "../tests/testUtils.js";
import type * as userPlugins from "../userPlugins.js";
import type * as users from "../users.js";
import type * as words from "../words.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  comments: typeof comments;
  files: typeof files;
  http: typeof http;
  plugins: typeof plugins;
  "plugins/cleanup": typeof plugins_cleanup;
  "plugins/seedData": typeof plugins_seedData;
  smartImport: typeof smartImport;
  subjects: typeof subjects;
  tasks: typeof tasks;
  "tests/testUtils": typeof tests_testUtils;
  userPlugins: typeof userPlugins;
  users: typeof users;
  words: typeof words;
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

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
