import { number2Precition } from "../../Geom/basicGeometryFunctions";
import { TypeInformationKey } from "../../TypeInformationKey";
import JCell from "../JCell";
import JCellGeneric, { IJCellGenericInfo } from "./JCellGeneric";

export type TypeCellheight =
	| 'ocean'
	| 'lake'
	| 'land'

export interface IJCellHeightInfo extends IJCellGenericInfo {
	id: number;

	height: number;
	prevHeight: number;
	heightType: TypeCellheight;
	islandId: number; // no se guarda este dato nunca
}

export default class JCellHeight extends JCellGeneric {
	// private _cell: JCell;

	private _height: number;
	private _prevHeight = 0;
	private _heightType: TypeCellheight;
	private _islandId = -1;

	constructor(c: JCell, info: IJCellHeightInfo) {
		super(c);
		// this._cell = c;
		
		this._height = number2Precition(info.height);
		this._prevHeight = number2Precition(info.prevHeight);
		this._heightType = info.heightType;
	}

	// get id(): number {return this._cell.id}
	
	get height(): number {return this._height}
	set height(h: number) {
		h = number2Precition(h);
		if (this._heightType === 'land' && h <= 0.2) {
			this._prevHeight = this._height;
			this._height = 0.2001;
			return;
		}
		if (this._heightType === 'ocean' && h > 0.20) {
			this._prevHeight = this._height;
			this._height = 0.20;
			return
		}
		this._prevHeight = this._height;
		this._height = h;
	}
	get heightInMeters(): number { return 6121.258 * ((this._height - 0.2)/0.8) ** 1.8 } // corregir
	get prevHeight(): number {return this._prevHeight}
	get heightType(): TypeCellheight {return this._heightType}
	set heightType(ht: TypeCellheight) {this._heightType = ht}
	set island(id: number) { this._islandId = id } // solo una vez se puede cambiar
	get island(): number { return this._islandId }
	// get inLandZone(): boolean {return this._heightType === ''}

	getInterface(): IJCellHeightInfo {
		return {
			...super.getInterface(),

			height: this._height,
			prevHeight: this._prevHeight,
			heightType: this._heightType,
			islandId: this._islandId,
		}
	}

	static getTypeInformationKey(): TypeInformationKey {
		return 'cellHeight';
	}
}