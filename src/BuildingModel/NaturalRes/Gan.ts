
export type TGanFamily = 'bob' | 'buf' | 'eq' | 'cam' | 'ove' | 'ave' | 'cer' | 'ins' | 'peq';

export type TGanFamList<T> = { [key in TGanFamily]: T };

export interface IGanLimits {
  wminmin: number;
  wmin: number;
  wmax: number;
  tabsmin: number;
  tabsmax: number;
  tmin: number;
  tmax: number;
  hmin: number;
  hmax: number;
}

// bob  ############################################
const BOB: IGanLimits = {
  wminmin: 2/20,
  wmin: 0/20,
  wmax: 13/20,
  tabsmin: -11,
  tabsmax: 42,
  tmin: -2,
  tmax: 30,
  hmin: 0.2,
  hmax: 0.54,
}
// buf  ############################################
const BUF: IGanLimits = {
  wminmin: 2/20,
  wmin: 1/20,
  wmax: 14/20,
  tabsmin: -45,
  tabsmax: 27,
  tmin: -17,
  tmax: 17,
  hmin: 0.2,
  hmax: 0.61,
}
// eq  ############################################
const EQ: IGanLimits = {
  wminmin: 2/20,
  wmin: 1/20,
  wmax: 15/20,
  tabsmin: -30,
  tabsmax: 28,
  tmin: -6,
  tmax: 19,
  hmin: 0.2,
  hmax: 0.8,
}
// cam  ############################################
const CAM: IGanLimits = {
  wminmin: 0/40,
  wmin: 1/40,
  wmax: 6/20,
  tabsmin: -5,
  tabsmax: 45,
  tmin: 17,
  tmax: 31,
  hmin: 0.2,
  hmax: 0.54,
}
// ove  ############################################
const OVE: IGanLimits = {
  wminmin: 1/20,
  wmin: 2/20,
  wmax: 4/20,
  tabsmin: -30,
  tabsmax: 28,
  tmin: 5,
  tmax: 28,
  hmin: 0.35,
  hmax: 0.82,
}
// ave  ############################################
const AVE: IGanLimits = {
  wminmin: 2/20,
  wmin: 3/20,
  wmax: 15/20,
  tabsmin: -30,
  tabsmax: 28,
  tmin: -6,
  tmax: 19,
  hmin: 0.2,
  hmax: 0.8,
}
// cer  ############################################
const CER: IGanLimits = {
  wminmin: 2/20,
  wmin: 3/20,
  wmax: 15/20,
  tabsmin: -30,
  tabsmax: 28,
  tmin: -6,
  tmax: 19,
  hmin: 0.2,
  hmax: 0.8,
}
// ins  ############################################
const INS: IGanLimits = {
  wminmin: 2/20,
  wmin: 3/20,
  wmax: 15/20,
  tabsmin: -30,
  tabsmax: 28,
  tmin: -6,
  tmax: 19,
  hmin: 0.2,
  hmax: 0.8,
}
// peq  ############################################
const PEQ: IGanLimits = {
  wminmin: 2/20,
  wmin: 3/20,
  wmax: 15/20,
  tabsmin: -30,
  tabsmax: 28,
  tmin: -6,
  tmax: 19,
  hmin: 0.2,
  hmax: 0.8,
}

export const GANFAMLIST: TGanFamList<IGanLimits> = {
  bob: BOB,
  buf: BUF,  
  eq: EQ, 
  cam: CAM,
  ove: OVE, 
  ave: AVE, 
  cer: CER, 
  ins: INS, 
  peq: PEQ,
}