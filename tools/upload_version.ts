import { Database } from "../utils/database.ts";
import { queueBuild } from "../utils/queue.ts";

const database = new Database(Deno.env.get("MONGO_URI")!);

const buildID = await database.createBuild({
  options: {
    moduleName: "deno",
    repository: "denoland/deno",
    ref: "v1.5.2",
    version: "v1.5.2",
    type: "github",
  },
  status: "queued",
});
await queueBuild(buildID);
