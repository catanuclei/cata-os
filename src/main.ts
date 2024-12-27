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
const contentTextNode = document.createElement('p')!;
const contentImageNode = document.createElement('img')!;

contentTextNode.innerHTML = 'Window Content';
contentImageNode.src = '/img/test.gif';
contentImageNode.height = 16;

windowManager.setDesktopContextMenu([
  {
    text: 'New Window (Icon 1)',
    handler: ({ menuPosition }) =>
      windowManager.createWindow(
        'Window',
        'window',
        [
          contentTextNode.cloneNode(true) as HTMLElement,
          contentImageNode.cloneNode(true) as HTMLElement,
        ],
        menuPosition
      ),
  },
  {
    text: 'New Window (Icon 2)',
    handler: ({ menuPosition }) =>
      windowManager.createWindow(
        'Window',
        'box',
        [
          contentTextNode.cloneNode(true) as HTMLElement,
          contentImageNode.cloneNode(true) as HTMLElement,
        ],
        menuPosition
      ),
  },
  {
    text: 'New Window (Icon 3)',
    handler: ({ menuPosition }) =>
      windowManager.createWindow(
        'Window',
        'brilliance',
        [
          contentTextNode.cloneNode(true) as HTMLElement,
          contentImageNode.cloneNode(true) as HTMLElement,
        ],
        menuPosition
      ),
  },
]);
