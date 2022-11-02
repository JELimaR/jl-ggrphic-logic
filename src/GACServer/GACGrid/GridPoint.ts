import { inRange } from "../../BuildingModel/Geom/basicGeometryFunctions";
import { GRAN } from "../constants";
import Point from "../../BuildingModel/Geom/Point";
import JCell from "../../BuildingModel/Voronoi/JCell";

export interface IGridPointInfo {
	point: { x: number, y: number };
	cellId: number;
}

export default class GridPoint {
	private _point: Point;
	private _cell: JCell;
	constructor(p: Point, cell: JCell) {
		this._point = p;
		this._cell = cell;
	}

	get cell(): JCell {return this._cell}
	get point(): Point {return this._point}

	get rowValue(): number {
		return inRange(
			Math.round((90 + this._point.y) / GRAN),
			0,
			180 / GRAN + 1
		);
	}

	get colValue(): number {
		return inRange(
			Math.round((180 + this._point.x) / GRAN),
			0,
			360 / GRAN
		);
	}

	/*
	getPixelArea(): number {
		let out = WRADIUS * (GRAN * GRAD2RAD);
		out *= WRADIUS * Math.cos(this._point.y * GRAD2RAD) * (GRAN * GRAD2RAD);

		return out;
	}
	*/
	getInterface(): IGridPointInfo {
		return {
			point: this._point.getInterface(),
			cellId: this._cell.id
		}
	}
}