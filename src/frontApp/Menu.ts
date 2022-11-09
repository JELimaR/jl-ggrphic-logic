import readlineSync from 'readline-sync';
import { inRange } from '../BuildingModel/Geom/basicGeometryFunctions';

const MenuItemExit: IMenuItem = {
	name: 'Exit',
	func: () => {
		console.log('Saliendo...')
	}
}

export interface IMenuItem {
	name: string;
	func: () => void;
}

export default class Menu {
	private _name: string = 'Menu';
	private _options: IMenuItem[];
  private _oneTime: boolean;

  constructor(name: string, options: IMenuItem[], oneTime: boolean = false) {
    this._name = name
    this._options = options;
    this._oneTime = oneTime;
  }

	run(): number {
    let ans: number;
    let finished: boolean = false;
		do {
      this.printOptions();
      
			ans = Menu.read('algo: ');
			console.log('seleccionado:', ans);
      console.log();
			const option = ans - 1;
			if (option === inRange(option, 0, this._options.length - 1)) {
        this.execOption(this._options[option]);
        if (this._oneTime) finished = true;
			} else if (ans === 0) {
        MenuItemExit.func();
        finished = true;
      } else {
        console.log('non valid')
			}
      console.log();
			
		} while (!finished)  
    
    return ans;
	}

  private printOptions() {
    console.log();
    console.log('=================================================================');
    console.log(this._name);
    this._options.forEach((mi: IMenuItem, i: number) => {
      console.log(`${i < 10 ? '0' : ''}${i + 1}: ${mi.name}`)
    })
    console.log(`00: exit`);
    console.log('=================================================================');
  }

  static read(msg: string): number {
    let out = readlineSync.question(msg);
    if (out == '')
      return -1;
    else
      return Number(out);
  }

  static pause(msg: string) {
    let out = readlineSync.question(msg);
    if (out == '')
      return -1;
    else
      return Number(out);
  }

  private execOption(opt: IMenuItem): void {
    opt.func();
  }
}