import { OsConstants } from './constants';

export const initializeDesktopInfo = (infoNode: HTMLElement): void => {
  const versionSpan = document.createElement('span')!;
  const copyrightSpan = document.createElement('span')!;

  versionSpan.innerHTML = `${OsConstants.DISPLAY_NAME} ${OsConstants.VERSION}`;
  copyrightSpan.innerHTML = `${OsConstants.AUTHOR} &copy; ${OsConstants.COPYRIGHT_YEAR}`;

  infoNode.appendChild(versionSpan);
  infoNode.appendChild(copyrightSpan);
};
