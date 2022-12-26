/* eslint-disable @typescript-eslint/no-non-null-assertion */
import JCell from "../JCell";
import JCellHeight, {IJCellHeightInfo, TypeCellheight} from './JCellHeight';
import JCellClimate, {IJCellClimateInfo, TKoppenSubType} from './JCellClimate';
import JCellAGR, { IJCellAGRInfo } from "./JCellAGR";

export default class JCellInformation {
	_cell: JCell
	_height: JCellHeight | undefined;
	_climate: JCellClimate | undefined;
  _agr: JCellAGR | undefined;
	// _temp: JCellTemp | undefined;

	private _mark = false;

	constructor(cell: JCell) {
		this._cell = cell;
	}

	get mark(): boolean {return this._mark}
	set mark(b: boolean) {this._mark = b}

	/*
	 * height
	 */
	setHeightInfo(h: IJCellHeightInfo): void { this._height = new JCellHeight(this._cell, h);	}
	getHeightInfo(): IJCellHeightInfo | undefined { return this._height!.getInterface(); }	
	/*private*/ get cellHeight(): JCellHeight {
    if (!this._height) throw new Error(`no se ha generado cellHeigth`)
		return this._height;
	}
	
	set height(h: number) { this.cellHeight.height = h }
  set heightType(ht: TypeCellheight) { this.cellHeight.heightType = ht }
	get prevHeight(): number { return this.cellHeight.prevHeight }
  
	get isLand(): boolean { return this.cellHeight.heightType === 'land' }
	get height(): number { return this.cellHeight.height }
  get heightInMeters(): number { return this.cellHeight.heightInMeters }
  get heightType(): TypeCellheight { return this.cellHeight.heightType }
	// set islandId(id: number) { this._height!.islandId = id; } // se puede eliminar
	get islandId(): number { return this._height!.islandId; }

	/*
	 * climate
	 */
	setClimatetInfo(c: IJCellClimateInfo): void { this._climate = new JCellClimate(this._cell, c);	}
	getClimateInfo(): IJCellClimateInfo | undefined { return this._climate!.getInterface(); }	
	get cellClimate(): JCellClimate {
		if (!this._climate) throw new Error(`no se ha generado cellClimate`)
		return this._climate;
	}

	get tempMonthArr(): number[] { return this.cellClimate.tempMonth }
  get koppenSubType(): TKoppenSubType | 'O' { return this.cellClimate.koppenSubType() }
	// get tempMedia(): number { 
	// 	let out: number = 0;
	// 	this._temp!.tempMonth.forEach((t: number) => out += t)
	// 	return out/12;
	// }

  /*
	 * AGR
	 */
	setAGRtInfo(a: IJCellAGRInfo): void { this._agr = new JCellAGR(this._cell, a); }
	getAGRInfo(): IJCellAGRInfo | undefined { return this._agr!.getInterface(); }	
	get cellAGR(): JCellAGR {
		if (!this._agr) throw new Error(`no se ha generado cellAGR`)
		return this._agr;
	}
}

