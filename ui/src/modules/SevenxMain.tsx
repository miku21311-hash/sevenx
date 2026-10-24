import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AppLayout, Spinner } from 'erxes-ui';
import { registerSevenxLocales } from '~/i18n';
import { SevenxLanguageSwitch } from '~/modules/shared/components';
import { SevenxNavigation } from './SevenxNavigation';

registerSevenxLocales();

const DashboardPage = lazy(() =>
  import('~/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);

const ClassesPage = lazy(() =>
  import('~/pages/ClassesPage').then((module) => ({
    default: module.ClassesPage,
  })),
);

const ClassDetailPage = lazy(() =>
  import('~/pages/ClassDetailPage').then((module) => ({
    default: module.ClassDetailPage,
  })),
);

const SchedulePage = lazy(() =>
  import('~/pages/SchedulePage').then((module) => ({
    default: module.SchedulePage,
  })),
);

const TeachersPage = lazy(() =>
  import('~/pages/TeachersPage').then((module) => ({
    default: module.TeachersPage,
  })),
);

const StudentsPage = lazy(() =>
  import('~/pages/StudentsPage').then((module) => ({
    default: module.StudentsPage,
  })),
);

const LocationsPage = lazy(() =>
  import('~/pages/LocationsPage').then((module) => ({
    default: module.LocationsPage,
  })),
);

const AnnouncementsPage = lazy(() =>
  import('~/pages/AnnouncementsPage').then((module) => ({
    default: module.AnnouncementsPage,
  })),
);

// iOS Safari zooms the page when a focused field's text is under 16px and stays
// zoomed, which pushes the layout off screen. erxes-ui fields are 13px, so while
// 7x is open, phone-width fields render at 16px. A plain <style> also reaches
// Sheets and dialogs portaled outside this tree, and leaves with the app.
// The page itself never pans or bounces sideways either; panes scroll inside.
const PHONE_FIELD_ZOOM_FIX = `@media (max-width: 767px) {
  input:not([type='checkbox']):not([type='radio']):not([type='file']):not([type='range']),
  textarea,
  select {
    font-size: 16px !important;
  }
  html,
  body {
    overflow-x: hidden;
    overscroll-behavior-x: none;
  }
}`;

export const SevenxMain = () => {
  return (
    <>
      <style>{PHONE_FIELD_ZOOM_FIX}</style>
      <AppLayout
        id="sevenx"
        title="7x"
        sidebar={<SevenxNavigation />}
        footer={<SevenxLanguageSwitch />}
      >
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classes/:id" element={<ClassDetailPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="teachers" element={<TeachersPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </>
  );
};
