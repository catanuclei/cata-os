import { initializeDesktopInfo } from '@utils/setup';

import '@styles/reset.scss';
import '@styles/font.scss';
import '@styles/core.scss';

const desktopEl = document.getElementById('desktop')!;
const windowManagerEl = document.getElementById('window-manager')!;

initializeDesktopInfo(desktopEl.querySelector('.desktop__info')!);

console.log(desktopEl);
console.log(windowManagerEl);
