const BAR_MODULES_CLASS = 'bar__modules';
const BAR_MODULE_CLASS = 'bar__modules__module';

export class CataBar {
  private _barNode: HTMLElement;
  private _modulesNode: HTMLElement;

  public constructor(barNode: HTMLElement) {
    this._barNode = barNode;
    this._modulesNode = document.createElement('div')!;
    this._modulesNode.classList.add(BAR_MODULES_CLASS);
    this._barNode.appendChild(this._modulesNode);
  }

  public addModule = (moduleNode: HTMLElement) => {
    moduleNode.classList.add(BAR_MODULE_CLASS);
    this._modulesNode.appendChild(moduleNode);
  };
}

export class CataBarModules {
  public static getTimeModule: () => HTMLElement = () => {
    const moduleNode = document.createElement('div')!;
    const updateTime = () => {
      const currentTime = new Date();
      const formattedTime = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      moduleNode.innerHTML = formattedTime;
    };
    updateTime();
    setInterval(() => {
      updateTime();
    }, 1000);
    return moduleNode;
  };
}
