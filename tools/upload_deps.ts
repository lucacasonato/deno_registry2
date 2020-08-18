import { analyzeDependencies } from "../api/async/publish.ts";
import { asyncPool } from "../utils/util.ts";
import { Database } from "../utils/database.ts";

const database = new Database(Deno.env.get("MONGO_URI")!);

const builds = await database._builds.aggregate([
  {
    $match: {
      status: "success",
      message: "Finished uploading",
    },
  },
  { $skip: 25 },
  { $limit: 400 },
]);

// deno-lint-ignore no-explicit-any
await asyncPool(8, builds, async (rawBuild: any) => {
  const build = {
    id: rawBuild._id.$oid,
    created_at: rawBuild.created_at,
    options: rawBuild.options,
    status: rawBuild.status,
    message: rawBuild.message,
    stats: rawBuild.stats,
  };

  let message = "Published module.";

  await analyzeDependencies(build).catch((err) => {
    console.error(
      "failed dependency analysis",
      build.options.moduleName,
      build.options.version,
      err,
      err?.response
    );
    message += " Failed to run dependency analysis.";
  });

  console.log(build.options.moduleName, build.options.version, message);

  await database.saveBuild({
    ...build,
    status: "success",
    message: message,
  });
});
