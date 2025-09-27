import { createAuthClient } from "better-auth/react";
import { getBaseURL } from "./get-base-url";
import {
  anonymousClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [anonymousClient(), inferAdditionalFields<typeof auth>()],
});
