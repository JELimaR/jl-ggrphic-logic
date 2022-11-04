import readlineSync from 'readline-sync';
import { inRange } from './BuildingModel/Geom/basicGeometryFunctions';

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
	name: string = 'Menu';
	options: IMenuItem[] = [];

	print() {
		console.log('\t\t---', this.name, '---\n');
		this.options.forEach((mi: IMenuItem, i: number) => {
			console.log(`${i + 1}: ${mi.name}`)
		})
		console.log(`00: exit`);
		console.log('----------------------------------');

	}

	run() {
		let ans: number;

		do {

			this.print();

			ans = Number(readlineSync.question('algo: '));
			console.log('seleccionado:', ans);
			const option = ans - 1;
			if (option === inRange(option, 0, this.options.length - 1)) {
				console.log('valid');
			} else {
				console.log('no valid')
			}
			
		} while (ans !== 0)


	}
}