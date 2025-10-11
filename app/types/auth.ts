import { z } from "zod";
import { signupSchema } from "@/lib/zod/schemas/auth";

export type SignupFormData = z.infer<typeof signupSchema>;
