import './styles.css';
import { IconSchool } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { registerSevenxLocales } from '~/i18n';

registerSevenxLocales();

export const CONFIG: IUIConfig = {
  name: 'sevenx',
  path: 'sevenx',
  icon: IconSchool,
  i18n: true,
  // Advisory compatibility range read by current core-ui hosts.
  platform: '3.3.2',
  navigationGroup: {
    name: 'sevenx',
    defaultPath: 'sevenx',
    icon: IconSchool,
  },
  modules: [
    {
      name: 'dashboard',
      icon: IconSchool,
      path: 'sevenx/dashboard',
    },
    {
      name: 'classes',
      path: 'sevenx/classes',
    },
    {
      name: 'schedule',
      path: 'sevenx/schedule',
    },
    {
      name: 'teachers',
      path: 'sevenx/teachers',
    },
    {
      name: 'students',
      path: 'sevenx/students',
    },
    {
      name: 'locations',
      path: 'sevenx/locations',
    },
    {
      name: 'announcements',
      path: 'sevenx/announcements',
    },
  ],
};
