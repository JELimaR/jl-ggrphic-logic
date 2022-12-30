import { getArrayOfN } from "../../Math/basicMathFunctions";
import { TypeInformationKey } from "../../TypeInformationKey";
import JCell from "../JCell";
import JCellGeneric, { IJCellGenericInfo } from "./JCellGeneric";

export type TCul = {
  w: number;
  t: number;
  v: number;
} | -1;

export type TGan = {
  W: number[],
  T: number[],
  h: number;
  conds: {
    w: number;
    t: number;
  }[],
} | -1;

export interface IJCellAGRInfo extends IJCellGenericInfo {
  ganArr: TGan,
  culArr: TCul[],
  f: 1 | 0;
  p: 1 | 0;
}

export default class JCellAGR extends JCellGeneric {

  private _ganArr: TGan;
  private _culArr: TCul[];
  private _isForest: boolean;
  private _isPermafrost: boolean;

  constructor(c: JCell, info: IJCellAGRInfo) {
    super(c);

    this._ganArr = info.ganArr;
    this._culArr = info.culArr;
    this._isForest = info.f == 1;
    this._isPermafrost = info.p == 1;
  }

  get isForest(): boolean { return this._isForest }
  get isPermafrost(): boolean { return this._isPermafrost }

  get isCul(): boolean { // borrar
    let out: number = 0;
    this._culArr.forEach((c: TCul) => {
      if (c !== -1) out++
    })
    return out > 0;
  }

  get isGan(): boolean { 
    return this._ganArr !== -1;
  }

  getInterface(): IJCellAGRInfo {
    return {
      ...super.getInterface(),

      ganArr: this._ganArr,
      culArr: this._culArr,
      f: this._isForest ? 1 : 0,
      p: this._isPermafrost ? 1 : 0,
    }
  }

  static getTypeInformationKey(): TypeInformationKey {
    return 'cellAGR';
  }
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

for (let i = 1; i <= 30; i++) {
  let k = i as keyof typeof annualPeriodCombinations;
  annualPeriodCombinations[k];

}