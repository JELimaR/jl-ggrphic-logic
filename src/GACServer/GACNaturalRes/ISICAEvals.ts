import { inRange, quadCenterInRange } from "../../BuildingModel/Math/basicMathFunctions";
import { IAquaLimits } from "../../BuildingModel/NaturalRes/Aqua";
import { IForeCulLimits } from "../../BuildingModel/NaturalRes/ForeCul";
import { IGanLimits } from "../../BuildingModel/NaturalRes/Gan";
import { IPerennialCulLimits } from "../../BuildingModel/NaturalRes/PerennialCul";
import { ISeasonalCulLimits } from "../../BuildingModel/NaturalRes/SeasonalCul";
import { ISeasonalCulMonthCellParams, JCellISICAParams } from "./JCellISICAParams";

/* **SEASONAL** **SEASONAL** **SEASONAL** **SEASONAL** **SEASONAL** **SEASONAL** **SEASONAL** **SEASONAL** **SEASONAL** */
export const seasonalCulParamsEval = (cellPars: JCellISICAParams, cul: ISeasonalCulLimits): number[] => {
  let out: number[] = [];

  cellPars.seasonal.forEach((monthSeasonal: ISeasonalCulMonthCellParams) => {
    out.push(seasonalCulParamsMonthEval(monthSeasonal, cul, cellPars.fert));
  })

  return out;
}

const seasonalCulParamsMonthEval = (monthParams: ISeasonalCulMonthCellParams, lims: ISeasonalCulLimits, fert: number) => {
  if (monthParams.tabsmax3 > lims.tabsmax3) return 0;
  if (monthParams.tabsmin3 < lims.tabsmin3) return 0;

  let out = 0;
  monthParams.tmed3arr.forEach((temp: number) => {
    out += quadCenterInRange(temp, lims.tabsmin3, lims.tabsmax3) ** lims.texp;
  })

  out /= monthParams.tmed3arr.length;

  out *= quadCenterInRange(monthParams.wmed3, lims.wmin3, lims.wmax3) ** lims.wexp;

  out *= fert ** lims.fexp;

  return inRange(Math.round(100 * out) / 100, 0, 1);
}

/* **PERENNIAL** **PERENNIAL** **PERENNIAL** **PERENNIAL** **PERENNIAL** **PERENNIAL** **PERENNIAL** **PERENNIAL** */
export const perennialCulParamsEval = (cellPars: JCellISICAParams, lims: IPerennialCulLimits) => {
  if (cellPars.tabsmax > lims.tAbsMax) return 0;
  if (cellPars.tabsmin < lims.tAbsMin) return 0;
  if (cellPars.tvar > lims.tAnnVar) return 0;
  if (cellPars.wmin < lims.wminmin) return 0;
  if (cellPars.wmin > lims.wminmax) return 0;


  let out = 0;
  out = quadCenterInRange(cellPars.tmed, lims.tMedMin, lims.tMedMax) ** 1;

  // const wmed = getMedValue(params.warr);
  out *= quadCenterInRange(cellPars.wmed, lims.wmin, lims.wmax) ** lims.wexp;
  // let wout = 0;
  // params.warr.forEach((wp: number) => {
  //   wout += funcEVal(wp, pcul.wmin, pcul.wmax) ** pcul.wexp;
  // })
  // out *= wout/ params.warr.length;

  out *= cellPars.fert ** lims.fexp;

  return inRange(Math.round(100*out)/100,0,1);
}

/* ****FORE**** ****FORE**** ****FORE**** ****FORE**** ****FORE**** ****FORE**** ****FORE**** ****FORE**** */
export const foreCulParamsEval = (cellPars: JCellISICAParams, lims: IForeCulLimits) => {
  if (cellPars.rmin < lims.rminmin) return 0;

  let out = 0;
  out = quadCenterInRange(cellPars.tmed, lims.tMedMin, lims.tMedMax) ** 0.54;

  out *= quadCenterInRange(cellPars.rmed, lims.rmin, lims.rmax) ** lims.rexp;

  out *= cellPars.fert ** lims.fexp;

  return inRange(Math.round(100*out)/100,0,1);
}

/* ****GAN**** ****GAN**** ****GAN**** ****GAN**** ****GAN**** ****GAN**** ****GAN**** ****GAN**** ****GAN**** */
export const ganParamsEval = (cellPars: JCellISICAParams, lims: IGanLimits) => {
  if (cellPars.wmin < lims.wminmin) return 0;
  if (cellPars.tabsmax > lims.tabsmax) return 0;
  if (cellPars.tabsmin < lims.tabsmin) return 0;
  if (cellPars.h > lims.hmax) return 0;
  if (cellPars.h < lims.hmin) return 0;

  let out = 0;
  cellPars.tmedarr.forEach((t: number) => {
    out += quadCenterInRange(t, lims.tmin, lims.tmax) ** 1.2;
  })
  out /= cellPars.tmedarr.length

  out *= quadCenterInRange(cellPars.wmed, lims.wmin, lims.wmax) ** 0.6//gan.wexp;

  return inRange(Math.round(100*out)/100,0,1);
}

/* **AQUA** **AQUA** **AQUA** **AQUA** **AQUA** **AQUA** **AQUA** **AQUA** **AQUA** **AQUA** **AQUA** */
export const aquaParamsEval = (cellPars: JCellISICAParams, lims: IAquaLimits) => {

  let out = 0;
  cellPars.tmedarr.forEach((t: number) => {
    out += quadCenterInRange(t, lims.tabsmin, lims.tabsmax) ** lims.texp;
  })
  out /= cellPars.tmedarr.length;

  cellPars.fluxArr.forEach((f: number) => {
    out += quadCenterInRange(f, lims.fmin, lims.fmax) ** lims.xexp;
  })
  out /= cellPars.fluxArr.length;

  out *= cellPars.nLevel ** lims.nlvlexp;

  return inRange(Math.round(100*out)/100,0,1);
}