import { useQuery } from "@apollo/client";
import type { ComponentType, ReactNode } from "react";
import {
  IconBook,
  IconDatabase,
  IconExternalLink,
  IconLayoutDashboard,
  IconSandbox,
  IconSettings,
} from "@tabler/icons-react";
// Root imports on purpose: core-ui shares `erxes-ui`/`ui-modules` as Module
// Federation singletons keyed on the bare specifier, so deep imports would
// bundle second private copies instead of reusing the host's.
import { Badge, Breadcrumb, Button, Card, Separator, Skeleton, cn } from "erxes-ui";
import { PageHeader } from "ui-modules";
import { Link } from "react-router";
import manifest from "../../../erxes.json" with { type: "json" };
import { STATUS_QUERY } from "../graphql";
import { Samples } from "../Samples";

const { path } = manifest.ui;

const Dot = ({ className }: { className?: string }) => (
  <span className={cn("sevenx:inline-block sevenx:size-2 sevenx:rounded-full", className)} />
);

const StatusRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="sevenx:flex sevenx:items-center sevenx:justify-between sevenx:gap-4 sevenx:text-sm">
    <span className="sevenx:text-muted-foreground">{label}</span>
    <span className="sevenx:flex sevenx:items-center sevenx:gap-2 sevenx:font-medium">
      {children}
    </span>
  </div>
);

const ConnectionCard = () => {
  const { data, loading, error, refetch } = useQuery(STATUS_QUERY);
  const status = data?.sevenxStatus;

  const pending = (
    <>
      <Dot className="sevenx:animate-pulse sevenx:bg-muted-foreground" />
      <Skeleton className="sevenx:h-4 sevenx:w-24" />
    </>
  );

  return (
    <Card className="sevenx:w-full sevenx:md:w-80 sevenx:shrink-0">
      <Card.Header>
        <Card.Title className="sevenx:text-sm">Connection</Card.Title>
        <Card.Description>Live status of this plugin inside erxes</Card.Description>
      </Card.Header>
      <Card.Content className="sevenx:flex sevenx:flex-col sevenx:gap-3">
        <StatusRow label="API">
          {loading ? (
            pending
          ) : error ? (
            <>
              <Dot className="sevenx:bg-destructive" />
              <span>Unreachable</span>
              <Button variant="ghost" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </>
          ) : (
            <>
              <Dot className="sevenx:bg-success" />
              <span>Connected · v{status?.version}</span>
            </>
          )}
        </StatusRow>
        <StatusRow label="Gateway">
          {loading ? (
            pending
          ) : error ? (
            <>
              <Dot className="sevenx:bg-destructive" />
              <span className="sevenx:truncate sevenx:max-w-40" title={error.message}>
                {error.message}
              </span>
            </>
          ) : (
            <>
              <Dot className="sevenx:bg-success" />
              <span>Federated as {status?.plugin}</span>
            </>
          )}
        </StatusRow>
        <StatusRow label="Tenant">{loading ? pending : (status?.subdomain ?? "—")}</StatusRow>
        <StatusRow label="Signed in">
          {loading
            ? pending
            : (status && (status.userEmail ?? status.userId ?? "Anonymous")) || "—"}
        </StatusRow>
      </Card.Content>
    </Card>
  );
};

const StepCard = ({
  icon: Icon,
  title,
  description,
  code,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  code: string;
}) => (
  <Card>
    <Card.Header>
      <div className="sevenx:flex sevenx:size-9 sevenx:items-center sevenx:justify-center sevenx:rounded-lg sevenx:bg-accent">
        <Icon className="sevenx:size-5" />
      </div>
      <Card.Title>{title}</Card.Title>
      <Card.Description>{description}</Card.Description>
    </Card.Header>
    <Card.Content>
      <code className="sevenx:rounded sevenx:bg-muted sevenx:px-1.5 sevenx:py-0.5 sevenx:font-mono sevenx:text-xs">
        {code}
      </code>
    </Card.Content>
  </Card>
);

const STEPS = [
  {
    icon: IconDatabase,
    title: "Model your data",
    description: "Define the records this plugin owns and expose them on the federated graph.",
    code: "api/src/modules/sample",
  },
  {
    icon: IconLayoutDashboard,
    title: "Build the page",
    description:
      "Replace this overview with your module: lists with RecordTable, forms with Form, details in a Sheet.",
    code: "ui/src/pages/IndexPage.tsx",
  },
];

export const IndexPage = () => (
  <div className="sevenx:flex sevenx:h-full sevenx:flex-col">
    <PageHeader>
      <PageHeader.Start>
        <Breadcrumb>
          <Breadcrumb.List className="sevenx:gap-1">
            <Breadcrumb.Item>
              <Button variant="ghost" asChild>
                <Link to={`/${path}`}>
                  <IconSandbox />
                  {manifest.title}
                </Link>
              </Button>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
        <Separator.Inline />
        <PageHeader.FavoriteToggleButton breadcrumb={[manifest.title]} icon="IconSandbox" />
      </PageHeader.Start>
      <PageHeader.End>
        <Button variant="outline" asChild>
          <Link to={`/${path}/settings`}>
            <IconSettings />
            Settings
          </Link>
        </Button>
      </PageHeader.End>
    </PageHeader>
    <div className="sevenx:flex-1 sevenx:overflow-auto">
      <div className="sevenx:mx-auto sevenx:flex sevenx:w-full sevenx:max-w-5xl sevenx:flex-col sevenx:gap-6 sevenx:p-6">
        <section className="sevenx:relative sevenx:overflow-hidden sevenx:rounded-xl sevenx:border sevenx:border-border sevenx:bg-background sevenx:p-8 sevenx:shadow-xs">
          <div
            aria-hidden
            className="sevenx:pointer-events-none sevenx:absolute sevenx:inset-0 sevenx:bg-gradient-to-br sevenx:from-primary/10 sevenx:via-transparent sevenx:to-transparent"
          />
          <div className="sevenx:relative sevenx:flex sevenx:flex-col sevenx:gap-6 sevenx:md:flex-row sevenx:md:items-start sevenx:md:justify-between">
            <div className="sevenx:flex sevenx:max-w-xl sevenx:flex-col sevenx:gap-4">
              <div>
                <Badge variant="info">Plugin · v{manifest.version}</Badge>
              </div>
              <h1 className="sevenx:text-2xl sevenx:font-semibold sevenx:tracking-tight">
                Welcome to {manifest.title}
              </h1>
              <p className="sevenx:text-sm sevenx:leading-relaxed sevenx:text-muted-foreground">
                {manifest.description}
              </p>
              <div className="sevenx:flex sevenx:flex-wrap sevenx:gap-2">
                <Button asChild>
                  <Link to={`/${path}/settings`}>
                    <IconSettings />
                    Open settings
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://erxes.io/docs/create-plugin-standalone"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <IconBook />
                    Developer guide
                    <IconExternalLink />
                  </a>
                </Button>
              </div>
            </div>
            <ConnectionCard />
          </div>
        </section>
        <Samples />
        <div className="sevenx:grid sevenx:gap-4 sevenx:md:grid-cols-2">
          {STEPS.map((step) => (
            <StepCard key={step.title} {...step} />
          ))}
        </div>
      </div>
    </div>
  </div>
);
