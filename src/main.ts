import { initializeDesktopInfo } from '@utils/setup';
import { WindowManager } from '@utils/window';

import 'bootstrap-icons/font/bootstrap-icons.min.css';

import '@styles/reset.scss';
import '@styles/font.scss';
import '@styles/core.scss';

const desktopEl = document.getElementById('desktop')!;
const windowManagerEl = document.getElementById('window-manager')!;

initializeDesktopInfo(desktopEl.querySelector('.desktop__info')!);

const windowManager = new WindowManager(windowManagerEl);
windowManager.createWindow('Window 1');
windowManager.createWindow('Window 2');
windowManager.createWindow('Window 3');
windowManager.createWindow('Window 4');
windowManager.createWindow('Window 5');
windowManager.createWindow('Window 6');
windowManager.createWindow('Window 7');
