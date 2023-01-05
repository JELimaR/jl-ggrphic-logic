import { getMedValue } from "../../BuildingModel/Math/basicMathFunctions";
import JCell from "../../BuildingModel/Voronoi/JCell";
import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import NoiseMapValuesGenerator from "../NoiseMapValuesGenerator";
import { waterParamArr } from "./waterParamsCalc";

const N = 3;

interface IISICCellParams {
  tabsmin: number; // gpf
  tabsmax: number; // gpf
  tmedarr: number[]; // gpf
  wmin: number; // gp
  wmed: number; // gp
  h: number; // g
  tvar: number; // p
  fert: number; // pf
  rmin: number;  // f
  rmed: number;  // f
  seasonal: ISeasonalCulMonthCellParams[]; // s
  fluxArr: number[]; // a
  nLevel: number; // a
}

export interface ISeasonalCulMonthCellParams {
  tabsmin3: number;
  tabsmax3: number;
  tmed3arr: number[];
  wmin3: number;
  wmax3: number;
  wmed3: number;
}
/**
 * JCellISICAParams -> clase que se utilizará para calcular los parametros necesarios
 *    para evaluar si una cell cumple las condiciones para:
 * PerennialCul
 * SeasonalCul
 * ForeCul
 * Gan
 * Water
 */
export class JCellISICAParams implements IISICCellParams {

  private _tabsmin: number; // gpf
  private _tabsmax: number; // gpf
  private _tmedarr: number[]; // gpf
  private _wmin: number; // gp
  private _wmed: number; // gp
  private _h: number; // g
  private _tvar: number; // p
  private _fert: number; // pfs
  private _rmin: number;  // f
  private _rmed: number;  // f
  private _seasonal: ISeasonalCulMonthCellParams[]; // s
  private _fluxArr: number[] // w
  private _nLevel: number; // a

  constructor(cell: JCell, diag: JDiagram) {

    const wps = waterParamArr(cell, diag);
    const fertFunc = NoiseMapValuesGenerator.fertFunc;
    const fishLevelNoiseFunc = NoiseMapValuesGenerator.fishLevelNoiseFunc;

    this._tabsmin = Math.min(...cell.info.cellClimate.tempMinArr); // gpf
    this._tabsmax = Math.max(...cell.info.cellClimate.tempMaxArr); // gpf
    this._tmedarr = cell.info.tempMonthArr; // gpf
    this._wmin = Math.min(...wps.wp); // gp
    this._wmed = getMedValue(wps.wp); // gp
    this._h = cell.info.height; // g
    this._tvar = cell.info.cellClimate.tempMedAnnualVar; // p
    this._fert = fertFunc(cell); // pfs
    this._rmin = Math.min(...wps.rp);  // f
    this._rmed = getMedValue(wps.rp);  // f
    this._seasonal = this.getSeasonalCulMonthCellParams(cell, diag); // s
    this._fluxArr = wps.fp; // w
    this._nLevel = fishLevelNoiseFunc(cell); // a
  }

  get tabsmin(): number {
    return this._tabsmin;
  }
  get tabsmax(): number {
    return this._tabsmax;
  }
  get tmedarr(): number[] {
    return this._tmedarr;
  }
  get wmin(): number {
    return this._wmin;
  }
  get wmed(): number {
    return this._wmed;
  }
  get h(): number {
    return this._h;
  }
  get tmed(): number {
    return getMedValue(this._tmedarr);
  }
  get tvar(): number {
    return this._tvar;
  }
  get fert(): number {
    return this._fert;
  }
  get rmin(): number {
    return this._rmin;
  }
  get rmed(): number {
    return this._rmed;
  }
  get seasonal(): ISeasonalCulMonthCellParams[] {
    return this._seasonal;
  }

  get fluxArr(): number[] {
    return this._fluxArr;
  }

  get nLevel(): number {
    return this._nLevel;
  }

  private getSeasonalCulMonthCellParams(cell: JCell, diagram: JDiagram): ISeasonalCulMonthCellParams[] {
    let out: ISeasonalCulMonthCellParams[] = [];

    const cc = cell.info.cellClimate;

    const tMinMatrix = this.getNConsecutiveMatrix(cc.tempMinArr, N);
    const tMaxMatrix = this.getNConsecutiveMatrix(cc.tempMaxArr, N);
    const tMedMatrix = this.getNConsecutiveMatrix(cc.tempMonth, N);

    const warr = waterParamArr(cell, diagram).wp;
    const wMatrix = this.getNConsecutiveMatrix(warr, N);

    for (let m = 1; m <= 12; m++) {
      const paramsData: ISeasonalCulMonthCellParams = {
        tabsmax3: Math.max(...tMaxMatrix[m - 1]),
        tabsmin3: Math.min(...tMinMatrix[m - 1]),
        tmed3arr: tMedMatrix[m - 1],
        wmax3: Math.max(...wMatrix[m - 1]),
        wmin3: Math.min(...wMatrix[m - 1]),
        wmed3: getMedValue(wMatrix[m - 1]),
      };

      out.push(paramsData);
    }

    if (out.length !== 12) throw new Error(`debe ser de largo 12 en 'getSeasonalCulMonthCellParams'`)

    return out;
  }
  
  private getNConsecutiveMatrix<T>(arr: T[], N: number): T[][] {
    let out: T[][] = [];
    for (let m = 0; m < 12; m++) {
      let outM: T[] = []
      for (let i = 0; i < N; i++) {
        outM.push(arr[(m + i) % 12]);
      }
      out.push(outM)
    }
    return out;
  }
}
