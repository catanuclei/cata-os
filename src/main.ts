import { initializeDesktopInfo } from '@utils/setup';
import { createWindow } from '@utils/window';

import 'bootstrap-icons/font/bootstrap-icons.min.css';

import '@styles/reset.scss';
import '@styles/font.scss';
import '@styles/core.scss';

export const desktopEl = document.getElementById('desktop')!;
export const windowManagerEl = document.getElementById('window-manager')!;

initializeDesktopInfo(desktopEl.querySelector('.desktop__info')!);
createWindow('Window 1');
createWindow('Window 2');
createWindow('Window 3');
createWindow('Window 4');
createWindow('Window 5');

console.log(desktopEl);
console.log(windowManagerEl);
