import { initializeDesktopInfo } from '@utils/setup';
import { WindowManager } from '@utils/window';
import { CataBar, CataBarModules } from '@utils/bar';

import 'bootstrap-icons/font/bootstrap-icons.min.css';

import '@styles/reset.scss';
import '@styles/font.scss';
import '@styles/core.scss';

const desktopEl = document.getElementById('desktop')!;
const windowManagerEl = document.getElementById('window-manager')!;
const barEl = document.getElementById('bar')!;

initializeDesktopInfo(desktopEl.querySelector('.desktop__info')!);

const windowManager = new WindowManager(windowManagerEl, desktopEl);
const bar = new CataBar(barEl);
const contentTextNode = document.createElement('p')!;
const contentImageNode = document.createElement('img')!;

bar.addModule(CataBarModules.getTimeModule());

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
