// Outline icons from @tabler/icons-react v3.34.0 (MIT), the icon set erxes core-ui uses.
// Inlined so the portal does not take a dependency for a handful of glyphs.
import type { SVGProps } from 'react';

type IconNode = Array<[string, Record<string, string>]>;

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'stroke'> & { size?: number; stroke?: number };

const createIcon = (name: string, nodes: IconNode) => {
  const Icon = ({ size = 16, stroke = 2, className, ...rest }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className ? `tabler-icon ${className}` : 'tabler-icon'}
      {...rest}
    >
      {nodes.map(([, { key, ...attrs }]) => (
        <path key={key} {...attrs} />
      ))}
    </svg>
  );
  Icon.displayName = `Icon${name}`;
  return Icon;
};

export const IconLayoutDashboard = createIcon('LayoutDashboard', [["path", {"d": "M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1", "key": "svg-0"}], ["path", {"d": "M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1", "key": "svg-1"}], ["path", {"d": "M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1", "key": "svg-2"}], ["path", {"d": "M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1", "key": "svg-3"}]]);
export const IconSchool = createIcon('School', [["path", {"d": "M22 9l-10 -4l-10 4l10 4l10 -4v6", "key": "svg-0"}], ["path", {"d": "M6 10.6v5.4a6 3 0 0 0 12 0v-5.4", "key": "svg-1"}]]);
export const IconCalendar = createIcon('Calendar', [["path", {"d": "M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z", "key": "svg-0"}], ["path", {"d": "M16 3v4", "key": "svg-1"}], ["path", {"d": "M8 3v4", "key": "svg-2"}], ["path", {"d": "M4 11h16", "key": "svg-3"}], ["path", {"d": "M11 15h1", "key": "svg-4"}], ["path", {"d": "M12 15v3", "key": "svg-5"}]]);
export const IconCalendarEvent = createIcon('CalendarEvent', [["path", {"d": "M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z", "key": "svg-0"}], ["path", {"d": "M16 3l0 4", "key": "svg-1"}], ["path", {"d": "M8 3l0 4", "key": "svg-2"}], ["path", {"d": "M4 11l16 0", "key": "svg-3"}], ["path", {"d": "M8 15h2v2h-2z", "key": "svg-4"}]]);
export const IconClipboardCheck = createIcon('ClipboardCheck', [["path", {"d": "M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2", "key": "svg-0"}], ["path", {"d": "M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z", "key": "svg-1"}], ["path", {"d": "M9 14l2 2l4 -4", "key": "svg-2"}]]);
export const IconClipboardList = createIcon('ClipboardList', [["path", {"d": "M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2", "key": "svg-0"}], ["path", {"d": "M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z", "key": "svg-1"}], ["path", {"d": "M9 12l.01 0", "key": "svg-2"}], ["path", {"d": "M13 12l2 0", "key": "svg-3"}], ["path", {"d": "M9 16l.01 0", "key": "svg-4"}], ["path", {"d": "M13 16l2 0", "key": "svg-5"}]]);
export const IconUsers = createIcon('Users', [["path", {"d": "M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0", "key": "svg-0"}], ["path", {"d": "M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2", "key": "svg-1"}], ["path", {"d": "M16 3.13a4 4 0 0 1 0 7.75", "key": "svg-2"}], ["path", {"d": "M21 21v-2a4 4 0 0 0 -3 -3.85", "key": "svg-3"}]]);
export const IconSpeakerphone = createIcon('Speakerphone', [["path", {"d": "M18 8a3 3 0 0 1 0 6", "key": "svg-0"}], ["path", {"d": "M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5", "key": "svg-1"}], ["path", {"d": "M12 8h0l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8", "key": "svg-2"}]]);
export const IconClock = createIcon('Clock', [["path", {"d": "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "key": "svg-0"}], ["path", {"d": "M12 7v5l3 3", "key": "svg-1"}]]);
export const IconChevronRight = createIcon('ChevronRight', [["path", {"d": "M9 6l6 6l-6 6", "key": "svg-0"}]]);
export const IconChevronLeft = createIcon('ChevronLeft', [["path", {"d": "M15 6l-6 6l6 6", "key": "svg-0"}]]);
export const IconChevronDown = createIcon('ChevronDown', [["path", {"d": "M6 9l6 6l6 -6", "key": "svg-0"}]]);
export const IconLogout = createIcon('Logout', [["path", {"d": "M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2", "key": "svg-0"}], ["path", {"d": "M9 12h12l-3 -3", "key": "svg-1"}], ["path", {"d": "M18 15l3 -3", "key": "svg-2"}]]);
export const IconLanguage = createIcon('Language', [["path", {"d": "M4 5h7", "key": "svg-0"}], ["path", {"d": "M9 3v2c0 4.418 -2.239 8 -5 8", "key": "svg-1"}], ["path", {"d": "M5 9c0 2.144 2.952 3.908 6.7 4", "key": "svg-2"}], ["path", {"d": "M12 20l4 -9l4 9", "key": "svg-3"}], ["path", {"d": "M19.1 18h-6.2", "key": "svg-4"}]]);
export const IconMenu2 = createIcon('Menu2', [["path", {"d": "M4 6l16 0", "key": "svg-0"}], ["path", {"d": "M4 12l16 0", "key": "svg-1"}], ["path", {"d": "M4 18l16 0", "key": "svg-2"}]]);
export const IconX = createIcon('X', [["path", {"d": "M18 6l-12 12", "key": "svg-0"}], ["path", {"d": "M6 6l12 12", "key": "svg-1"}]]);
export const IconCheck = createIcon('Check', [["path", {"d": "M5 12l5 5l10 -10", "key": "svg-0"}]]);
export const IconAlertCircle = createIcon('AlertCircle', [["path", {"d": "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "key": "svg-0"}], ["path", {"d": "M12 8v4", "key": "svg-1"}], ["path", {"d": "M12 16h.01", "key": "svg-2"}]]);
export const IconInfoCircle = createIcon('InfoCircle', [["path", {"d": "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "key": "svg-0"}], ["path", {"d": "M12 9h.01", "key": "svg-1"}], ["path", {"d": "M11 12h1v4h1", "key": "svg-2"}]]);
export const IconCircleCheck = createIcon('CircleCheck', [["path", {"d": "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "key": "svg-0"}], ["path", {"d": "M9 12l2 2l4 -4", "key": "svg-1"}]]);
export const IconPlus = createIcon('Plus', [["path", {"d": "M12 5l0 14", "key": "svg-0"}], ["path", {"d": "M5 12l14 0", "key": "svg-1"}]]);
export const IconBook = createIcon('Book', [["path", {"d": "M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0", "key": "svg-0"}], ["path", {"d": "M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0", "key": "svg-1"}], ["path", {"d": "M3 6l0 13", "key": "svg-2"}], ["path", {"d": "M12 6l0 13", "key": "svg-3"}], ["path", {"d": "M21 6l0 13", "key": "svg-4"}]]);
export const IconLayoutSidebarLeftCollapse = createIcon('LayoutSidebarLeftCollapse', [["path", {"d": "M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z", "key": "svg-0"}], ["path", {"d": "M9 4v16", "key": "svg-1"}], ["path", {"d": "M15 10l-2 2l2 2", "key": "svg-2"}]]);
export const IconArrowRight = createIcon('ArrowRight', [["path", {"d": "M5 12l14 0", "key": "svg-0"}], ["path", {"d": "M13 18l6 -6", "key": "svg-1"}], ["path", {"d": "M13 6l6 6", "key": "svg-2"}]]);
export const IconInbox = createIcon('Inbox', [["path", {"d": "M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z", "key": "svg-0"}], ["path", {"d": "M4 13h3l3 3h4l3 -3h3", "key": "svg-1"}]]);
export const IconMapPin = createIcon('MapPin', [["path", {"d": "M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0", "key": "svg-0"}], ["path", {"d": "M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z", "key": "svg-1"}]]);
export const IconSelector = createIcon('Selector', [["path", {"d": "M8 9l4 -4l4 4", "key": "svg-0"}], ["path", {"d": "M16 15l-4 4l-4 -4", "key": "svg-1"}]]);
export const IconUserCheck = createIcon('UserCheck', [["path", {"d": "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0", "key": "svg-0"}], ["path", {"d": "M6 21v-2a4 4 0 0 1 4 -4h4", "key": "svg-1"}], ["path", {"d": "M15 19l2 2l4 -4", "key": "svg-2"}]]);
export const IconEye = createIcon('Eye', [["path", {"d": "M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0", "key": "svg-0"}], ["path", {"d": "M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6", "key": "svg-1"}]]);
export const IconEyeOff = createIcon('EyeOff', [["path", {"d": "M10.585 10.587a2 2 0 0 0 2.829 2.828", "key": "svg-0"}], ["path", {"d": "M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87", "key": "svg-1"}], ["path", {"d": "M3 3l18 18", "key": "svg-2"}]]);
export const IconMail = createIcon('Mail', [["path", {"d": "M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z", "key": "svg-0"}], ["path", {"d": "M3 7l9 6l9 -6", "key": "svg-1"}]]);
export const IconLock = createIcon('Lock', [["path", {"d": "M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z", "key": "svg-0"}], ["path", {"d": "M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0", "key": "svg-1"}], ["path", {"d": "M8 11v-4a4 4 0 1 1 8 0v4", "key": "svg-2"}]]);
export const IconSparkles = createIcon('Sparkles', [["path", {"d": "M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z", "key": "svg-0"}]]);
export const IconCurrentLocation = createIcon('CurrentLocation', [["path", { "d": "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0", "key": "svg-0" }], ["path", { "d": "M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0", "key": "svg-1" }], ["path", { "d": "M12 2l0 2", "key": "svg-2" }], ["path", { "d": "M12 20l0 2", "key": "svg-3" }], ["path", { "d": "M20 12l2 0", "key": "svg-4" }], ["path", { "d": "M2 12l2 0", "key": "svg-5" }]]);
export const IconMapPinCheck = createIcon('MapPinCheck', [["path", { "d": "M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0", "key": "svg-0" }], ["path", { "d": "M11.87 21.48a1.992 1.992 0 0 1 -1.283 -.58l-4.244 -4.243a8 8 0 1 1 13.355 -3.474", "key": "svg-1" }], ["path", { "d": "M15 19l2 2l4 -4", "key": "svg-2" }]]);
export const IconHourglass = createIcon('Hourglass', [["path", { "d": "M6.5 7h11", "key": "svg-0" }], ["path", { "d": "M6.5 17h11", "key": "svg-1" }], ["path", { "d": "M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z", "key": "svg-2" }], ["path", { "d": "M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z", "key": "svg-3" }]]);
export const IconSend = createIcon('Send', [["path", {"d": "M10 14l11 -11", "key": "svg-0"}], ["path", {"d": "M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5", "key": "svg-1"}]]);
export const IconMessages = createIcon('Messages', [["path", {"d": "M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10", "key": "svg-0"}], ["path", {"d": "M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2", "key": "svg-1"}]]);
export const IconPhone = createIcon('Phone', [["path", {"d": "M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2", "key": "svg-0"}]]);
export const IconDoor = createIcon('Door', [["path", {"d": "M14 12v.01", "key": "svg-0"}], ["path", {"d": "M3 21h18", "key": "svg-1"}], ["path", {"d": "M6 21v-16a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v16", "key": "svg-2"}]]);
export const IconPhoto = createIcon('Photo', [["path", {"d": "M15 8h.01", "key": "svg-0"}], ["path", {"d": "M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z", "key": "svg-1"}], ["path", {"d": "M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5", "key": "svg-2"}], ["path", {"d": "M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3", "key": "svg-3"}]]);
export const IconMicrophone = createIcon('Microphone', [["path", {"d": "M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z", "key": "svg-0"}], ["path", {"d": "M5 10a7 7 0 0 0 14 0", "key": "svg-1"}], ["path", {"d": "M8 21l8 0", "key": "svg-2"}], ["path", {"d": "M12 17l0 4", "key": "svg-3"}]]);
export const IconPaperclip = createIcon('Paperclip', [["path", {"d": "M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5", "key": "svg-0"}]]);
export const IconMoodSmile = createIcon('MoodSmile', [["path", {"d": "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0", "key": "svg-0"}], ["path", {"d": "M9 10l.01 0", "key": "svg-1"}], ["path", {"d": "M15 10l.01 0", "key": "svg-2"}], ["path", {"d": "M9.5 15a3.5 3.5 0 0 0 5 0", "key": "svg-3"}]]);
export const IconFile = createIcon('File', [["path", {"d": "M14 3v4a1 1 0 0 0 1 1h4", "key": "svg-0"}], ["path", {"d": "M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z", "key": "svg-1"}]]);
export const IconTrash = createIcon('Trash', [["path", {"d": "M4 7l16 0", "key": "svg-0"}], ["path", {"d": "M10 11l0 6", "key": "svg-1"}], ["path", {"d": "M14 11l0 6", "key": "svg-2"}], ["path", {"d": "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12", "key": "svg-3"}], ["path", {"d": "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3", "key": "svg-4"}]]);
export const IconDownload = createIcon('Download', [["path", {"d": "M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2", "key": "svg-0"}], ["path", {"d": "M7 11l5 5l5 -5", "key": "svg-1"}], ["path", {"d": "M12 4l0 12", "key": "svg-2"}]]);
export const IconPlayerPlay = createIcon('PlayerPlay', [["path", {"d": "M7 4v16l13 -8z", "key": "svg-0"}]]);
export const IconPlayerPause = createIcon('PlayerPause', [["path", {"d": "M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z", "key": "svg-0"}], ["path", {"d": "M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z", "key": "svg-1"}]]);
