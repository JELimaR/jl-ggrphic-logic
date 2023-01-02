import * as fs from 'fs';
import { number2Precition } from '../BuildingModel/Math/basicMathFunctions';
import { AzgaarFullData, AzgaarCell } from './FullDataTypes';

const SIZE = {
	x: 1920,
	y: 880
}

export default class AzgaarReaderData {
	private static _instance: AzgaarReaderData;
	private static _directories: string[] = [];

	private _dirPath = '';
	private _fullData: AzgaarFullData | undefined;
	private _cellsMap: Map<number, AzgaarCell> = new Map<number, AzgaarCell>();

	private constructor() { /** */ }

	static get instance(): AzgaarReaderData {
		if (!this._instance) {
			this._instance = new AzgaarReaderData();
		}
		return this._instance;
	}

	static configPath(rootPath: string, folder: string): void {
		if (this._directories.length == 0) this.getDirectories(rootPath);
		if (!this._directories.includes(folder))
			throw new Error(`no existe Azgaar Data para la folder ${folder}`);
		this.instance._dirPath = rootPath + folder;
		// fs.mkdirSync(path, {recursive: true});
		this.instance._fullData = this.readData();
		this.instance._fullData.cells.cells.forEach((cell: AzgaarCell) => {
			this._instance._cellsMap.set(cell.i, cell);
		})
	}

	private static readData(): AzgaarFullData {
		try {
			const pathFile = `${this._instance._dirPath}/fullData.json`;
			return JSON.parse(fs.readFileSync(pathFile).toString());
		} catch (e) {
			console.log(e)
			throw e;
		}
	}

	static getDirectories(source: string): string[] {
		this._directories = fs.readdirSync(source, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);
		return this._directories;
	}
	// height drawing
	getSites(): { id: number, x: number, y: number }[] {
		const out: { id: number, x: number, y: number }[] = [];
		this._fullData!.cells.cells.forEach((cell: AzgaarCell) => {
			let x = cell.p[0] / SIZE.x * 360 - 180;
			let y = cell.p[1] / SIZE.y * 180 - 90;
			x = number2Precition(x);
			y = number2Precition(y);
      
      if (180 < Math.abs(x) || 0 > Math.abs(x)) throw new Error(`el valor de x (${x}) es invalido`);
      if (90 < Math.abs(y) || 0 > Math.abs(y)) throw new Error(`el valor de y (${y}) es invalido`);
			out.push({ id: cell.i, x, y })

		})
		return out;
	}

	private heighNeighbourMedia(cell: AzgaarCell): number {
		// const cell = this._fullData!.cells.cells.find((cell: any) => cell.i == id);
		let out = 0;

		cell.c.forEach((nid: number) => {
			const ncell = this._cellsMap.get(nid) as AzgaarCell;
			out += ncell.h;
		})

		return out / cell.c.length;
	}

	hs(): { id: number, x: number, y: number, h: number }[] {
		const out: { id: number, x: number, y: number, h: number }[] = [];
		console.log(this._fullData!.cells.cells.length)
		const sitesArr = this.getSites();
		this._fullData!.cells.cells.forEach((cell: AzgaarCell, i: number) => {

			const hmedia = this.heighNeighbourMedia(cell);
			if (Math.abs(cell.h - hmedia) / hmedia > 0.5) {
				cell.h = hmedia;
			}

			let h = cell.h;
			h = (h - 19) / 80;

			out.push({ ...sitesArr[i], h })
		})
		return out;
	}

}