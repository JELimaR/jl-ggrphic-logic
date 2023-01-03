

export type PerennialCulFamily = 'vid' | 'frutrsb' | 'citr' | 'frut' | 'ffri' | 'fole' | 'beb' | 'esp' | 'medfarm';

export interface IPerennialCulLimits {
  tmin: number;
  tmax: number;
  wmin: number;
  wmax: number;
  texp: number;
  wexp: number;
  fexp: number;
}

const VID: IPerennialCulLimits = {
  tmin: 5,
  tmax: 30,
  wmin: 5 / 20,
  wmax: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}

export const SEASONALCULFAMLIST: { [k in PerennialCulFamily]: IPerennialCulLimits } = {
  vid: VID,
  frutrsb: VID,
  citr: VID,
  frut: VID,
  ffri: VID,
  fole: VID,
  beb: VID,
  esp: VID,
  medfarm: VID,
}