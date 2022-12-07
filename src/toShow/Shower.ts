
import CanvasDrawingMap from "../CanvasDrawing/CanvasDrawingMap";
import { IPoint } from "../BuildingModel/Math/Point";
import NaturalMap from "../BuildingModel/NaturalMap";

export default abstract class Shower {
	private _w: NaturalMap;
	private _a: number;
	private _d: CanvasDrawingMap;
	constructor(world: NaturalMap, area: number, SIZE: IPoint, subFolder: string) {
		this._w = world;
		this._a = area;
		this._d = new CanvasDrawingMap(SIZE, `${subFolder}`);
	}

	get w(): NaturalMap { return this._w}
	get a(): number { return this._a}
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