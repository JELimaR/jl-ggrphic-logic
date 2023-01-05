export type TPerennialCulFamily = 'vid' | 'frutrsb' | 'citr' | 'frut' | 'ffri' | 'fole' | 'beb' | 'esp' | 'medfarm';

export type TPerennialCulFamList<T> = {[key in TPerennialCulFamily]: T}

export interface IPerennialCulLimits {
  tAbsMin: number;
  tAbsMax: number;
  tMedMin: number;
  tMedMax: number;
  tAnnVar: number;
  wminmin: number;
  wminmax: number;
  wmin: number;
  wmax: number;
  wexp: number;
  fexp: number;
}

// vid  ################################################
const VID: IPerennialCulLimits = {
  tAbsMin: -2,
  tAbsMax: 37,
  tMedMin: 10,
  tMedMax: 25,
  tAnnVar: 30,
  wminmin: 4 / 20,
  wminmax: 10 / 20,
  wmin: 0,
  wmax: 1,
  wexp: 4.0,
  fexp: 0.8,
}
// frutrsb  #############################################
const FRUTRSB: IPerennialCulLimits = {
  tAbsMin: -2,
  tAbsMax: 37,
  tMedMin: 10,
  tMedMax: 25,
  tAnnVar: 30,
  wminmin: 4 / 20,
  wminmax: 16 / 20,
  wmin: 0,
  wmax: 1,
  wexp: 4.0,
  fexp: 0.8,
}
// citr ################################################
const CITR: IPerennialCulLimits = {
  tAbsMin: -2,
  tAbsMax: 37,
  tMedMin: 10,
  tMedMax: 25,
  tAnnVar: 30,
  wminmin: 4 / 20,
  wminmax: 16 / 20,
  wmin: 0,
  wmax: 1,
  wexp: 4.0,
  fexp: 0.8,
}
// frut ################################################
const FRUT: IPerennialCulLimits = {
  tAbsMin: -2,
  tAbsMax: 37,
  tMedMin: 10,
  tMedMax: 25,
  tAnnVar: 30,
  wminmin: 4 / 20,
  wminmax: 16 / 20,
  wmin: 0,
  wmax: 1,
  wexp: 4.0,
  fexp: 0.8,
}
// ffri ################################################
const FFRI: IPerennialCulLimits = {
  tAbsMin: -30,
  tAbsMax: 30,
  tMedMin: -10,
  tMedMax: 21,
  tAnnVar: 60,
  wminmin: 6 / 20,
  wminmax: 14 / 20,
  wmin: 7/20,
  wmax: 18/20,
  wexp: 3.0,
  fexp: 0.8,
}
// fole ################################################
const FOLE: IPerennialCulLimits = {
  tAbsMin: -2,
  tAbsMax: 37,
  tMedMin: 10,
  tMedMax: 25,
  tAnnVar: 30,
  wminmin: 4 / 20,
  wminmax: 16 / 20,
  wmin: 0,
  wmax: 1,
  wexp: 4.0,
  fexp: 0.8,
}
// beb  ################################################
const BEB: IPerennialCulLimits = {
  tAbsMin: -2,
  tAbsMax: 37,
  tMedMin: 10,
  tMedMax: 25,
  tAnnVar: 30,
  wminmin: 4 / 20,
  wminmax: 16 / 20,
  wmin: 0,
  wmax: 1,
  wexp: 4.0,
  fexp: 0.8,
}
// esp  ################################################
const ESP: IPerennialCulLimits = {
  tAbsMin: -2,
  tAbsMax: 37,
  tMedMin: 10,
  tMedMax: 25,
  tAnnVar: 30,
  wminmin: 4 / 20,
  wminmax: 16 / 20,
  wmin: 0,
  wmax: 1,
  wexp: 4.0,
  fexp: 0.8,
}
// medfarm  ############################################
const MEDFARM: IPerennialCulLimits = {
  tAbsMin: -2,
  tAbsMax: 37,
  tMedMin: 10,
  tMedMax: 25,
  tAnnVar: 30,
  wminmin: 4 / 20,
  wminmax: 16 / 20,
  wmin: 0,
  wmax: 1,
  wexp: 4.0,
  fexp: 0.8,
}

export const PERENNIALCULFAMLIST: TPerennialCulFamList<IPerennialCulLimits> = {
  vid: VID,
  frutrsb: FRUTRSB,
  citr: CITR,
  frut: FRUT,
  ffri: FFRI,
  fole: FOLE,
  beb: BEB,
  esp: ESP,
  medfarm: MEDFARM,
}