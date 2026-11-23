import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api"; // Import internal
import { DataModel } from "./_generated/dataModel";
import { query, MutationCtx } from "./_generated/server"; // Import MutationCtx
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      freshAge: 0, 
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      convex({ authConfig }),
    ],
    
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            // Better Auth hooks run inside a mutation, so we can safely cast ctx
            const mutationCtx = ctx as MutationCtx;
            
            // Trigger our Convex internal mutation!
            await mutationCtx.runMutation(internal.userPlugins.initializeDefaultPlugin, {
              userId: user.id,
            });
          },
        },
      },
    },
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx); 
  },
});