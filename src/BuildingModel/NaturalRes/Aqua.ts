export type TAquaFamily = 'marf' | 'rivf' | 'mara' | 'riva';

export type TAquaFamList<T> = {[key in TAquaFamily]: T}

export interface IAquaLimits {
  tabsmin: number;
  tabsmax: number;
  texp: number;
  fmin: number;
  fmax: number;
  xexp: number;
  nlvlexp: number;
}

// marf  ############################################
const MARF: IAquaLimits = {
  tabsmin: -30,
  tabsmax: 30,
  texp: 3.0,
  fmin: -1,
  fmax: -1,
  xexp: 0,
  nlvlexp: 2.0,
}
// rivf  ################################################
const RIVF: IAquaLimits = {
  tabsmin: -30,
  tabsmax: 30,
  texp: 3.0,
  fmin: 0.4,
  fmax: 1.1,
  xexp: 2.0,
  nlvlexp: 2.0,
}
// mara  ############################################
const MARA: IAquaLimits = {
  tabsmin: -30,
  tabsmax: 30,
  texp: 3.0,
  fmin: -50,
  fmax: 51,
  xexp: 0,
  nlvlexp: 0.0,
}
// riva  ############################################
const RIVA: IAquaLimits = {
  tabsmin: -30,
  tabsmax: 30,
  texp: 3.0,
  fmin: -50,
  fmax: 51,
  xexp: 2.0,
  nlvlexp: 0.0,
}

export const AQUAFAMLIST: TAquaFamList<IAquaLimits> = {
  marf: MARF,
  rivf: RIVF,
  mara: MARA,
  riva: RIVA,
}