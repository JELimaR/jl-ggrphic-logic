
export type TSeasonalCulFamily = 'cer' | 'cerw' | 'hor' | 'leg' | 'sole' | 'tub' | 'azu' | 'tab' | 'fib';

export type TSeasonalCulFamList<T> = {[key in TSeasonalCulFamily]: T}

export interface ISeasonalCulLimits {
  tabsmin3: number;
  tabsmax3: number;
  wmin3: number;
  wmax3: number;
  texp: number;
  wexp: number;
  fexp: number;
}

// azu ####################################################################################
const AZU: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 5 / 20,
  wmax3: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}
// cer ####################################################################################
const CER: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 5 / 20,
  wmax3: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}
// cerw ####################################################################################
const CERW: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 10 / 20,
  wmax3: 20 / 20,
  texp: 4.0,
  wexp: 3.0,
  fexp: 0.7,
}
// fib ####################################################################################
const FIB: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 5 / 20,
  wmax3: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}
// hor ####################################################################################
const HOR: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 5 / 20,
  wmax3: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}
// leg ####################################################################################
const LEG: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 5 / 20,
  wmax3: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}
// sole ###################################################################################
const SOLE: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 5 / 20,
  wmax3: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}
// tab ####################################################################################
const TAB: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 5 / 20,
  wmax3: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}
// tub ####################################################################################
const TUB: ISeasonalCulLimits = {
  tabsmin3: 5,
  tabsmax3: 30,
  wmin3: 5 / 20,
  wmax3: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}

export const SEASONALCULFAMLIST: TSeasonalCulFamList<ISeasonalCulLimits> = {
  azu: AZU,
  cer: CER,
  cerw: CERW,
  fib: FIB,
  hor: HOR,
  leg: LEG,
  sole: SOLE,
  tab: TAB,
  tub: TUB,
}