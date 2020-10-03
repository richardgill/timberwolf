import { ipcMain } from "electron";
import { makeExecutableSchema } from "graphql-tools";
import fs from "fs";
import path from "path";
import { values } from "lodash";
import {
  initialiseGqlIpcExecutor,
  createApolloSchemaLink,
} from "../../common/gql-transport";
import { initPublishers } from "./publishers";
import { initialiseGQLResolvers } from "./resolvers";
import { Database } from "./database";
import { WebsocketServer } from "./websockets";

type ConfigureServerOptions = {
  database: Database;
  websocketServer: WebsocketServer;
};

function initialisePublishers({
  database,
  websocketServer,
}: ConfigureServerOptions) {
  const publishers = initPublishers(database, websocketServer);

  values(publishers).forEach((pub) => {
    pub.init();
  });

  return publishers;
}

export default function configureServer({
  database,
  websocketServer,
}: ConfigureServerOptions) {
  const publishers = initialisePublishers({ database, websocketServer });
  const resolvers = initialiseGQLResolvers({ publishers, database });

  const link = createApolloSchemaLink({
    schema: makeExecutableSchema({
      typeDefs: fs
        .readFileSync(path.resolve(__dirname, "./schema.graphql"))
        .toString(),
      resolvers: resolvers as never,
    }),
  });

  initialiseGqlIpcExecutor({ link, ipc: ipcMain });

  return { publishers };
}
