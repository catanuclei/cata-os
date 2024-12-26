import { initializeDesktopInfo } from '@utils/setup';
import { WindowManager } from '@utils/window';

import 'bootstrap-icons/font/bootstrap-icons.min.css';

import '@styles/reset.scss';
import '@styles/font.scss';
import '@styles/core.scss';

const desktopEl = document.getElementById('desktop')!;
const windowManagerEl = document.getElementById('window-manager')!;

initializeDesktopInfo(desktopEl.querySelector('.desktop__info')!);

const windowManager = new WindowManager(windowManagerEl, desktopEl);
windowManager.setDesktopContextMenu([
  {
    text: 'New Window',
    handler: ({ menuPosition }) =>
      windowManager.createWindow('Window', menuPosition),
  },
]);
