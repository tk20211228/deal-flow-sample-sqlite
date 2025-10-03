import { integer, text } from "drizzle-orm/sqlite-core";
import { generateId } from "@/lib/utils";
import { sql } from "drizzle-orm";

export const id = text("id").primaryKey().$defaultFn(generateId);

export const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`)
    .notNull(),
};
