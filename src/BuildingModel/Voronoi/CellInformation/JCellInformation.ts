/* eslint-disable @typescript-eslint/no-non-null-assertion */
import JCell from "../JCell";
import JCellHeight, {IJCellHeightInfo, TypeCellheight} from './JCellHeight';
import JCellClimate, {IJCellClimateInfo, TKoppenSubType} from './JCellClimate';
import JCellAGR, { IJCellAGRInfo } from "./JCellAGR";
import { inRange } from "../../Math/basicMathFunctions";
import JCellNaturalRes, { IJCellNaturalResInfo } from "./JCellNaturalRes";

export default class JCellInformation {
	private _cell: JCell;
	private _height: JCellHeight | undefined;
	private _climate: JCellClimate | undefined;
  private _agr: JCellAGR | undefined; // borrar
  private _natRes: JCellNaturalRes | undefined;
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
	getHeightInfo(): IJCellHeightInfo { return this.cellHeight.getInterface(); }	
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
	getClimateInfo(): IJCellClimateInfo { return this.cellClimate.getInterface(); }	
	get cellClimate(): JCellClimate {
		if (!this._climate) throw new Error(`no se ha generado cellClimate`)
		return this._climate;
	}

	get tempMonthArr(): number[] { return this.cellClimate.tempMonth }
  get koppenSubType(): TKoppenSubType | 'O' { return this.cellClimate.koppenSubType() }
  get isPermafrost(): boolean { return this.cellClimate.tempMonthMax < -2 }
  get isForest(): boolean {
    if (!this.isLand)
      return false;
    let Rmin = 8;
    let Rmed = 0;
    for (let i = 0; i <12; i++) {
      // const precip = this.cellClimate.precipMonth[i];
      // const evapParam = inRange(12 * precip / this.cellClimate.pumbral, 0, 1);
      // let ri = (precip / Math.max(...JCellClimate.maxMonthlyPrecip)) ** (0.3);
      // ri = 1.3 * evapParam * inRange(ri, 0, 1);
			let ri = this.rainParam(i+1)

      Rmed += ri/12;
      Rmin = Rmin > ri ? ri : Rmin;
    }
    return Rmin > 0.42 && Rmed >= 0.58;
  }
	rainParam(month: number) {
		if (!this.isLand)
    	return 0;
		const precip = this.cellClimate.precipMonth[month - 1];
		const evapParam = inRange(12 * precip / this.cellClimate.pumbral, 0, 1);
		let out = (precip / Math.max(...JCellClimate.maxMonthlyPrecip)) ** (0.3);
		return 1.3 * evapParam * inRange(out, 0, 1);
	}
	// get tempMedia(): number { 
	// 	let out: number = 0;
	// 	this._temp!.tempMonth.forEach((t: number) => out += t)
	// 	return out/12;
	// }

  /*
	 * NatRes
	 */
	setNatRestInfo(nr: IJCellNaturalResInfo): void { this._natRes = new JCellNaturalRes(this._cell, nr); }
	getNatRestInfo(): IJCellNaturalResInfo { return this.cellNaturalRes.getInterface(); }	
	get cellNaturalRes(): JCellNaturalRes {
		if (!this._natRes) throw new Error(`no se ha generado cellAGR`)
		return this._natRes;
	}

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

