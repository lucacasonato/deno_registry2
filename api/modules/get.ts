// Copyright 2020 the Deno authors. All rights reserved. MIT license.

/**
 * This function is responsible for listing the modules stored in the
 * database. It can be filtered with a search query and is paginated.
 * The function is triggered by a HTTP GET call to /modules. More
 * information in API.md. 
 */

import {
  APIGatewayProxyEventV2,
  Context,
  APIGatewayProxyResultV2,
} from "../../deps.ts";
import { respondJSON } from "../../utils/http.ts";
import { Database } from "../../utils/database.ts";

const database = new Database(Deno.env.get("MONGO_URI")!);

export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context,
): Promise<APIGatewayProxyResultV2> {
  const name = event.pathParameters?.name || undefined;

  if (!name) {
    return respondJSON({
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: "no module name specified",
      }),
    });
  }

  const module = await database.getModule(name);

  if (module === null) {
    return respondJSON(
      { statusCode: 404, body: JSON.stringify({ success: false, error: "module not found" }) },
    );
  }

  return respondJSON({
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      data: {
        name: module.name,
        description: module.description,
        star_count: module.star_count,
      },
    }),
  });
}
