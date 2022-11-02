
import CanvasDrawingMap from "../CanvasDrawing/CanvasDrawingMap";
import { IPoint } from "../BuildingModel/Geom/Point";
import NaturalMap from "../BuildingModel/NaturalMap";

// const tam: number = 3600;
// let SIZE: Point = new Point(tam, tam / 2);

export default abstract class Shower {
	private _w: NaturalMap;
	private _a: number;
	// private _f: string;
	private _d: CanvasDrawingMap;
	constructor(world: NaturalMap, area: number, SIZE: IPoint, /*folderSelected: string,*/ subFolder: string) {
		this._w = world;
		this._a = area;
		// this._f = folderSelected;
		this._d = new CanvasDrawingMap(SIZE, `${subFolder}`);
	}

	get w(): NaturalMap { return this._w}
	get a(): number { return this._a}
	// get f(): string { return this._f}
	get d(): CanvasDrawingMap { return this._d }

	printSeparator(): void { console.log('-----------------------------------------------') }

	static nmb2str(n: number): string {
		return n.toLocaleString('de-DE', {minimumFractionDigits: 3, maximumFractionDigits: 3});
	}
	
}

// example
export class ShowExample extends Shower {

	constructor(world: NaturalMap, area: number, SIZE: IPoint) {
		super(world, area, SIZE, /*folderSelected,*/ 'climate');
	}
}