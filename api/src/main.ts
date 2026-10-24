import { startPlugin } from 'erxes-api-shared/utils';
import { manifest } from '~/config';
import { typeDefs } from '~/apollo/typeDefs';
import { appRouter } from '~/trpc/init-trpc';
import { resolvers } from '~/apollo/resolvers';
import { generateModels } from './connectionResolvers';

// startPlugin serves the federated subgraph on /graphql, mounts /health,
// wires tRPC, parses the gateway `user`/`cpUser` headers into the context, and
// registers this service with the erxes gateway through Redis — including
// UI_ENTRY_URL so core-ui can find the UI remote.
startPlugin({
  name: manifest.name,
  port: manifest.api.port,
  graphql: async () => ({
    typeDefs: await typeDefs(),
    resolvers,
  }),
  apolloServerContext: async (subdomain, context) => {
    const models = await generateModels(subdomain);

    context.models = models;

    return context;
  },
  trpcAppRouter: {
    router: appRouter,
    createContext: async (subdomain, context) => {
      const models = await generateModels(subdomain);

      context.models = models;

      return context;
    },
  },
});
