import { getMedValue, inDiscreteClasses, inRange } from "../../BuildingModel/Math/basicMathFunctions";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";
import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import JVertexFlux from "../../BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import { fertFunc } from "../SomeNoiseFunctionEntries";
import { waterParamArr } from "./WaterParamsCalc";

const N = 3;

//
export interface ICulMonthCellParams {
  tmin: number;
  tmax: number;
  tmed: number[];
  wmin: number;
  wmax: number;
  wmed: number;
  fert: number;
}

export const getCulMonthCellParams = (cell: JCell, diagram: JDiagram): ICulMonthCellParams[] => {
  let out: ICulMonthCellParams[] = [];

  const cc = cell.info.cellClimate;

  const tMinMatrix = getNConsecutiveMatrix(cc.tempMinArr, N);
  const tMaxMatrix = getNConsecutiveMatrix(cc.tempMaxArr, N);
  const tMedMatrix = getNConsecutiveMatrix(cc.tempMonth, N);

  const warr = waterParamArr(cell, diagram).wp;
  const wMatrix = getNConsecutiveMatrix(warr, N);

  for (let m = 1; m <= 12; m++) {
    const paramsData: ICulMonthCellParams = {
      tmax: Math.max(...tMaxMatrix[m-1]),
      tmin: Math.min(...tMinMatrix[m-1]),
      tmed: tMedMatrix[m-1],
      wmax: Math.max(...wMatrix[m-1]),
      wmin: Math.min(...wMatrix[m-1]),
      wmed: getMedValue(wMatrix[m-1]),
      fert: fertFunc(cell)
    };

    out.push(paramsData);
  }

  if (out.length !== 12) throw new Error(`debe ser de largo 12 en 'getCulMonthCellParams'`)

  return out;
}

export const culMonthlyValue = (cellParamsArr: ICulMonthCellParams[], cul: ISeasonalCulLimits): number[] => {
  let out: number[] = [];

  cellParamsArr.forEach((paramsData: ICulMonthCellParams) => {
    out.push(seasonalCulMonthEval(paramsData, cul));
  })

  return out;
}

const seasonalCulMonthEval = (params: ICulMonthCellParams, cul: ISeasonalCulLimits) => {
  if (params.tmax > cul.tmax) return 0;
  if (params.tmin < cul.tmin) return 0;

  let out = 0;
  params.tmed.forEach((temp: number) => {
    out += funcEVal(temp, cul.tmin, cul.tmax) ** cul.texp;
  })

  out /= params.tmed.length;

  out *= funcEVal(params.wmed, cul.wmin, cul.wmax) ** cul.wexp;

  out *= params.fert ** cul.fexp;

  return inRange(Math.round(10000*out)/10000,0,1);
}

const getNConsecutiveMatrix = <T>(arr: T[], N: number): T[][] => {
  let out: T[][] = [];
  for (let m = 0; m < 12; m++) {
    let outM : T[] = []
    for (let i = 0; i < N; i++) {
      outM.push(arr[(m+i) % 12]);
    }
    out.push(outM)
  }
  return out;
}

// devuelve valor entre 0 y 1, centrando en el valor medio
const funcEVal = (val: number, valMin: number, valMax: number) => {
  if (val < valMin) return 0;
  if (val > valMax) return 0;

  const valLinealizado = (val-valMin)/(valMax-valMin); // entre 0 y 1
  return (-1 * (valLinealizado - 0.5) ** 2 + 0.25) / 0.25
}

/***************************************************************************************************************** */
// mover esto a buildingmodel
export type SeasonalCulFamily = 'cer' | 'cerw' | 'hor' | 'leg' | 'sole' | 'tub' | 'azu' | 'tab' | 'fib';

export interface ISeasonalCulLimits {
  tmin: number;
  tmax: number;
  wmin: number;
  wmax: number;
  texp: number;
  wexp: number;
  fexp: number;
}

const CER: ISeasonalCulLimits = {
  tmin: 5,
  tmax: 30,
  wmin: 5 / 20,
  wmax: 13 / 20,
  texp: 4.0,
  wexp: 2.0,
  fexp: 0.8,
}

const CERW: ISeasonalCulLimits = {
  tmin: 5,
  tmax: 30,
  wmin: 10 / 20,
  wmax: 20 / 20,
  texp: 4.0,
  wexp: 3.0,
  fexp: 0.7,
}

export const SEASONALCULFAMLIST: { [k in SeasonalCulFamily]: ISeasonalCulLimits } = {
  azu: CER,
  cer: CER,
  cerw: CERW,
  fib: CER,
  hor: CER,
  leg: CER,
  sole: CER,
  tab: CER,
  tub: CER,
}