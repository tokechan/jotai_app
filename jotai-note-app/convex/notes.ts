import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const notesJson = await ctx.db.query("notes").collect();
    return notesJson; 
  },
});
