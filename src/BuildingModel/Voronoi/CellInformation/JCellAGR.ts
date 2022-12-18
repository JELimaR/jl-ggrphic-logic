import { getArrayOfN } from "../../Math/basicMathFunctions";
import { TypeInformationKey } from "../../TypeInformationKey";
import JCell from "../JCell";
import JCellGeneric, { IJCellGenericInfo } from "./JCellGeneric";

export interface IJCellAGRInfo extends IJCellGenericInfo {
  waterCategoryArr: number[];
  medWaterCategory: number;
  tempMedCategoryArr: number[];
  tempVarCategoryArr: number[]; // sens
}

export default class JCellAGR extends JCellGeneric {
  private _waterCategory: number[];
  private _medWaterCategory: number;
  private _tempMedCategoryArr: number[];
  private _tempVarCategoryArr: number[];

  constructor(c: JCell, info: IJCellAGRInfo) {
    super(c);

    this._waterCategory = [...info.waterCategoryArr];
    this._tempMedCategoryArr = [...info.tempMedCategoryArr];
    this._tempVarCategoryArr = [...info.tempVarCategoryArr];
    this._medWaterCategory = info.medWaterCategory;
  }

  get minWaterCategory(): number { return Math.min(...this._waterCategory) }
  get maxWaterCategory(): number { return Math.max(...this._waterCategory) }
  get medWaterCategory(): number { return this._medWaterCategory }

  get isForest(): boolean { return this.minWaterCategory > 8 && this._medWaterCategory >= 11 && !this.isPermafrost }
  get isPermafrost(): boolean { return Math.max(...this._tempMedCategoryArr) < 1 }

  get isCult(): boolean { // borrar
    let out: boolean = false;
    getArrayOfN(12,0).forEach((_,i: number) => {
      const wc = this.WConditionArr[i];
      const tc = this.TConditionArr[i];
      const vc = this.VConditionArr[i];
      out = out || (
        (wc == 'R4' || wc == 'R3' || wc == 'R2' || wc == 'R1' /*|| wc == 'R0'*/)
        &&
        (/*tc == 'T1' || */tc == 'T2' || tc == 'T3' || tc == 'T4'/* || tc == 'T5'*/)
        &&
        (/*vc == 'V0' || */vc == 'V1' || vc == 'V2' || vc === 'V3')
        &&
        !this.isForest
      )
    })
    return out;
  }

  get isGan(): boolean { // borrar
    let out: boolean = false;
    getArrayOfN(12,0).forEach((_,i: number) => {
      out = out || (
        (this.maxWaterCategory <= 16 && this.minWaterCategory >= 4)
        &&
        (Math.max(...this._tempMedCategoryArr) <= 9)
        // &&
        // (vc == 'V0' || vc == 'V1' || vc == 'V2' || vc === 'V3')
        &&
        !this.isForest
      )
    })
    return out;
  }

  get WConditionArr(): string[] {
    let out: string[] = []
    this.get3ConsecutiveWC().forEach((cats3: number[]) => {
      cats3[0] = cats3[0] <= 4 ? cats3[0] : cats3[0] + 1;
      const minWP = Math.min(...cats3);
      cats3[0] = cats3[0] <= 4 ? cats3[0] : cats3[0] - 1;
      cats3[0] = cats3[0] >= 16 ? cats3[0] : cats3[0] - 1;
      const maxWP = Math.max(...cats3);
      cats3[0] = cats3[0] >= 16 ? cats3[0] : cats3[0] + 1;
      if (minWP >= 4 && maxWP <= 5) out.push('R0') // gan
      else if (minWP >= 6 && maxWP <= 8) out.push('R1')
      else if (minWP >= 9 && maxWP <= 11) out.push('R2')
      else if (minWP >= 12 && maxWP <= 14) out.push('R3')
      else if (minWP >= 15 && maxWP <= 16) out.push('R4')
      else out.push('RN')
    })
    return out;
  }

  get TConditionArr(): string[] {
    let out: string[] = []
    this.get3ConsecutiveTC().forEach((cats3: number[]) => {
      // cats3[0] = cats3[0] <= 3 ? cats3[0] : cats3[0] + 1;
      const minTP = Math.min(...cats3);
      // cats3[0] = cats3[0] <= 3 ? cats3[0] : cats3[0] - 1;
      // cats3[0] = cats3[0] >= 8 ? cats3[0] : cats3[0] - 1;
      const maxTP = Math.max(...cats3);
      // cats3[0] = cats3[0] >= 8 ? cats3[0] : cats3[0] + 1;
      if (minTP >= 0 && maxTP <= 0) out.push('T0') // -5 a -4
      else if (minTP >= 1 && maxTP <= 2) out.push('T1') // gan only -3 a 4
      else if (minTP >= 3 && maxTP <= 4) out.push('T2') // 5 a 12
      else if (minTP >= 5 && maxTP <= 6) out.push('T3') // 13 a 20
      else if (minTP >= 7 && maxTP <= 8) out.push('T4') // 21 a 28
      else if (minTP >= 9 && maxTP <= 10) out.push('T5') // 29 a 34 // ojo con este
      else out.push('TN')
    })
    return out;
  }

  get VConditionArr(): string[] {
    let out: string[] = []
    this.get3ConsecutiveVC().forEach((cats3: number[]) => {
      const minTP = Math.min(...cats3);
      out.push(`V${minTP}`)
    })
    return out;
  }

  private get3ConsecutiveWC(): number[][] {
    let out: number[][] = [];
    this.get3ConsecutiveIndexMatrix().forEach((idx3: number[]) => {
      const p = idx3[0];
      const m = idx3[1];
      const n = idx3[2];
      out.push([
        this._waterCategory[p],
        this._waterCategory[m],
        this._waterCategory[n]
      ])
    })
    return out;
  }
  private get3ConsecutiveTC(): number[][] {
    let out: number[][] = [];
    this.get3ConsecutiveIndexMatrix().forEach((idx3: number[]) => {
      const p = idx3[0];
      const m = idx3[1];
      const n = idx3[2];
      out.push([
        this._tempMedCategoryArr[p],
        this._tempMedCategoryArr[m],
        this._tempMedCategoryArr[n]
      ])
    })
    return out;
  }
  private get3ConsecutiveVC(): number[][] {
    let out: number[][] = [];
    this.get3ConsecutiveIndexMatrix().forEach((idx3: number[]) => {
      const p = idx3[0];
      const m = idx3[1];
      const n = idx3[2];
      out.push([
        this._tempVarCategoryArr[p],
        this._tempVarCategoryArr[m],
        this._tempVarCategoryArr[n]
      ])
    })
    return out;
  }
  private get3ConsecutiveIndexMatrix(): number[][] {
    let out: number[][] = [];
    getArrayOfN(12, 0).forEach((_, i: number) => {
      const m = i;
      const n = (m == 11) ? 0 : m + 1;
      const p = (m == 0) ? 11 : m - 1;

      out.push([p, m, n])
    })
    return out;
  }

  getInterface(): IJCellAGRInfo {
    return {
      ...super.getInterface(),
      waterCategoryArr: this._waterCategory,
      medWaterCategory: this._medWaterCategory,
      tempMedCategoryArr: this._tempMedCategoryArr,
      tempVarCategoryArr: this._tempVarCategoryArr
    }
  }

  static getTypeInformationKey(): TypeInformationKey {
    return 'cellAGR';
  }
}


const TCONDITION = {
  TA: 22,
  TM: 16,
  TB: 11,
}

const SENCONDITION = {
  S: 7,
  N: 11,
}

const WCONDITION = {
  R1: [5, 6],
  R2: [7, 8],
  R3: [9, 10, 11],
  R4: [12, 13],
  R5: [14, 15],
}

const annualPeriodCombinations = {
  1: [0, 4],
  2: [0, 5],
  3: [0, 6],
  4: [0, 7],
  5: [0, 8],
  6: [1, 5],
  7: [1, 6],
  8: [1, 7],
  9: [1, 8],
  10: [1, 9],
  11: [2, 6],
  12: [2, 7],
  13: [2, 8],
  14: [2, 9],
  15: [2, 10],
  16: [3, 7],
  17: [3, 8],
  18: [3, 9],
  19: [3, 10],
  20: [3, 11],
  21: [4, 8],
  22: [4, 9],
  23: [4, 10],
  24: [4, 11],
  25: [5, 9],
  26: [5, 10],
  27: [5, 11],
  28: [6, 10],
  29: [6, 11],
  30: [7, 11],
}