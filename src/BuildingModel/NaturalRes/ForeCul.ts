export type TForeCulFamily = 'wdesp1' | 'wdmed' | 'wdesp2';

export type TForeCulFamList<T> = {[key in TForeCulFamily]: T}

export interface IForeCulLimits {
  tMedMin: number;
  tMedMax: number;
  rminmin: number;
  rmin: number;
  rmax: number;
  rexp: number;
  fexp: number;
}

// wdmed  ############################################
const WDMED: IForeCulLimits = {
  tMedMin: -10,
  tMedMax: 35,
  rminmin: 4 / 20,
  rmin: 5/20,
  rmax: 35/20,
  rexp: 0.8,
  fexp: 0.8,
}
// wdesp1  ################################################
const WDESP1: IForeCulLimits = {
  tMedMin: 12,
  tMedMax: 26,
  rminmin: 6 / 20,
  rmin: 0,
  rmax: 1,
  rexp: 0.8,
  fexp: 1.3,
}
// wdesp  ############################################
const WDESP2: IForeCulLimits = {
  tMedMin: -8,
  tMedMax: 20,
  rminmin: 7 / 20,
  rmin: 6/20,
  rmax: 31/20,
  rexp: 0.8,
  fexp: 1.3,
}

export const FORECULFAMLIST: TForeCulFamList<IForeCulLimits> = {
  wdmed: WDMED,
  wdesp1: WDESP1,
  wdesp2: WDESP2
}