import { getArrayOfN } from "../../BuildingModel/Math/basicMathFunctions";
import RandomNumberGenerator from "../../BuildingModel/Math/RandomNumberGenerator";
import { TCul, TGan } from "../../BuildingModel/Voronoi/CellInformation/JCellAGR";

export interface IAGRData {
  id: number;
  h: number;
  waterCategoryArr: number[];
  rainFallCategoryArr: number[];
  medRainFallCategory: number;
  tempMedCategoryArr: number[];
  tempVarCategoryArr: number[]; // sens
}

export const isForest = (data: IAGRData): boolean => {
  const minR = Math.min(...data.rainFallCategoryArr);
  const medR = data.medRainFallCategory
  const medT = data.tempMedCategoryArr.reduce((p: number, c: number) => p + c) / 12;
  return minR > 8 && medR >= 11 && medT > 5;
}

export const woodLevel = (data: IAGRData): number => {// ?
  const minR = Math.min(...data.rainFallCategoryArr);
  const medR = data.medRainFallCategory
  const medT = data.tempMedCategoryArr.reduce((p: number, c: number) => p + c) / 12;
  if (minR > 5 && medR >= 7 && medT > 4) {
    return ((medR - 7)/13) ** 0.5
  }

  return 0;
}

/******************************************************************************************************/
/**
 * CUL
 */
export const getCulInfoArr = (data: IAGRData): TCul[] => {
  const out: TCul[] = [];

  const isF = isForest(data);
  const warr: number[] = [];
  const tarr: number[] = [];
  const varr: number[] = [];
  get3ConsecutiveMatrix(data.waterCategoryArr).forEach((m3: number[], i: number) => {
    warr[i] = evalWCondition(m3);
  })
  get3ConsecutiveMatrix(data.tempMedCategoryArr).forEach((m3: number[], i: number) => {
    tarr[i] = evalTCondition(m3);
  })
  get3ConsecutiveMatrix(data.tempVarCategoryArr).forEach((m3: number[], i: number) => {
    varr[i] = evalVCondition(m3);
  })

  for (let i = 0; i < 12; i++) {
    const w = warr[i];
    const t = tarr[i];
    const v = varr[i];
    if (w == -1 || t == -1 || v == -1 || isF) {
      out.push(-1);
    } else {
      out.push({ w, t, v });
    }
  }

  if (out.length !== 12) throw new Error(``)
  return out;
}

export const evalWCondition = (cats3: number[]): number => { // no exportar
  if (cats3.length !== 3) throw new Error(`cats3 debe ser de largo 3 ${cats3}`)
  const minWP = Math.min(...cats3);
  const maxWP = Math.max(...cats3);
  if (minWP >= 6 && maxWP <= 8) return 0;
  else if (minWP >= 9 && maxWP <= 11) return 1;
  else if (minWP >= 12 && maxWP <= 14) return 2;
  else if (minWP >= 15 && maxWP <= 16) return 3;
  else return -1;
}
export const evalTCondition = (cats3: number[]): number => { // no exportar
  if (cats3.length !== 3) throw new Error(`cats3 debe ser de largo 3 ${cats3}`)
  const minTP = Math.min(...cats3);
  const maxTP = Math.max(...cats3);
  if (minTP >= 8 && maxTP <= 14) return 0 // 5 es de 5 a 8 y 6 es de 9 a 12
  else if (minTP >= 14 && maxTP <= 21) return 1 // 13 a 20
  else if (minTP >= 21 && maxTP <= 27) return 2 // 9 es de 21 a 24 y 10 es de 25 a 28
  else return -1
}
export const evalVCondition = (cats3: number[]): number => { // no exportar
  if (cats3.length !== 3) throw new Error(`cats3 debe ser de largo 3 ${cats3}`)
  const maxVP = Math.max(...cats3);
  if (maxVP <= 13) return 0 
  else if (maxVP <= 18) return 1 
  else if (maxVP <= 26) return 2 
  else return -1
}

const get3ConsecutiveMatrix = (arr: number[]): number[][] => {
  let out: number[][] = [];
  for (let m = 0; m < 12; m++) {
    const n = (m + 1) % 12;
    const p = (m + 11) % 12;

    out.push([arr[p], arr[m], arr[n]])
  }
  return out;
}

/******************************************************************************************************/
/**
 * GAN
 */
export const getGanInfo = (data: IAGRData): TGan => {
  const conds: {t: number, w: number}[] = [];
  let twCond = 0;
  for (let i = 0; i < 12; i++) {
    const tempMonth = data.tempMedCategoryArr[i];
    const waterMonth = data.waterCategoryArr[i];
    const tw = tempMonth + (20 - waterMonth);
    conds.push({t: tempMonth, w: waterMonth});
    if (tw > 41) twCond++;
  }

  if (twCond > 1) return -1;

  // const randF = RandomNumberGenerator.makeRandomFloat(data.id);
  const minW = Math.min(...data.waterCategoryArr);
  const medW = data.waterCategoryArr.reduce((p: number, c: number) => p + c) / 12;
  const maxW = Math.max(...data.waterCategoryArr);
  const minT = Math.min(...data.tempMedCategoryArr);
  const medT = data.tempMedCategoryArr.reduce((p: number, c: number) => p + c) / 12;
  const maxT = Math.max(...data.tempMedCategoryArr);
  const isF = isForest(data);
  if ((( data.h > 0.3 || maxW <= 18) && medW >= 5 && minW >= 3) && (maxT <= 33 && medT <= 26 && medT >= 4 && minT >= -15) && !isF) {
    return {
      W: [minW, medW, maxW],
      T: [minT, medT, maxT],
      h: data.h,
      conds
    }
  }


  return -1;
}