import { convexTest } from "convex-test";
import { register } from "@convex-dev/better-auth/test";
import schema from "../schema";

// Discover Convex functions for the test environment.
const modules = (
  import.meta as ImportMeta & {
    glob: (pattern: string) => Record<string, () => Promise<unknown>>;
  }
).glob("../**/*.ts");

// Creates a Convex test instance with Better Auth registered.
export const createTestInstance = () => {
  const t = convexTest(schema, modules);
  const betterAuth = register(t);

  return { t, betterAuth };
};

// Creates a test instance with a valid Better Auth user and session.
export const createAuthenticatedTest = async () => {
  const { t, betterAuth } = createTestInstance();

  const now = Date.now();

  // Seed a user and an active session in Better Auth.
  const { user, session } = await t.run(async (ctx) => {
    const user = await ctx.runMutation(betterAuth.adapter.create, {
      input: {
        model: "user",
        data: {
          name: "Test User",
          email: "test@example.com",
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        },
      },
    });

    const session = await ctx.runMutation(betterAuth.adapter.create, {
      input: {
        model: "session",
        data: {
          expiresAt: now + 60 * 60 * 1000,
          token: "test-session-token",
          createdAt: now,
          updatedAt: now,
          userId: user._id,
        },
      },
    });

    return { user, session };
  });

  // Simulate Better Auth's identity claims.
  const asUser = t.withIdentity({
    issuer: "https://test.example",
    subject: user._id,
    tokenIdentifier: `https://test.example|${user._id}`,
    sessionId: session._id,
  } as Parameters<typeof t.withIdentity>[0]);

  return {
    t,
    asUser,
    userId: user._id,
  };
};