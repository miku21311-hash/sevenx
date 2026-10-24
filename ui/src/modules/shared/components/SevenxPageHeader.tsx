import { Breadcrumb, Button, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface SevenxPageHeaderProps {
  icon: React.ElementType;
  /** Tabler icon name stored with the favorite, e.g. `IconBook2`. */
  iconName: string;
  title: string;
  path: string;
  parent?: { title: string; path: string };
  children?: ReactNode;
}

export const SevenxPageHeader = ({
  icon: Icon,
  iconName,
  title,
  path,
  parent,
  children,
}: SevenxPageHeaderProps) => (
  <PageHeader>
    <PageHeader.Start className="min-w-0 flex-1 pr-2 sm:pr-8">
      <Breadcrumb className="min-w-0">
        <Breadcrumb.List className="gap-1 flex-nowrap">
          {parent && (
            <>
              <Breadcrumb.Item className="shrink-0">
                <Button variant="ghost" asChild>
                  <Link to={parent.path} aria-label={parent.title}>
                    <Icon />
                    <span className="hidden sm:inline">{parent.title}</span>
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
            </>
          )}
          <Breadcrumb.Item className="min-w-0">
            <Button variant="ghost" asChild className="min-w-0">
              <Link to={path}>
                {!parent && <Icon />}
                <span className="truncate">{title}</span>
              </Link>
            </Button>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
      <Separator.Inline className="hidden sm:block" />
      <span className="hidden sm:contents">
        <PageHeader.FavoriteToggleButton
          breadcrumb={['sevenx', ...(parent ? [parent.title] : []), title]}
          icon={iconName}
        />
      </span>
    </PageHeader.Start>
    {children && <PageHeader.End className="shrink-0">{children}</PageHeader.End>}
  </PageHeader>
);
