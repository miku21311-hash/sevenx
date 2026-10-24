import { buildSubgraphSchema } from '@apollo/subgraph';
import { printSchema } from 'graphql';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolvers } from '~/apollo/resolvers';
import { typeDefs } from '~/apollo/typeDefs';

// Prints the subgraph SDL to api/generated/schema.graphql (a reference for the
// UI and the portal). Needs no Redis, Mongo or running server.
const main = async () => {
  mkdirSync('generated', { recursive: true });
  writeFileSync(
    'generated/schema.graphql',
    printSchema(buildSubgraphSchema([{ typeDefs: await typeDefs(), resolvers: resolvers as any }])),
  );
};

main();
