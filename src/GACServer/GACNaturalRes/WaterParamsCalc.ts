import { inRange } from "../../BuildingModel/Math/basicMathFunctions";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";
import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import JVertexFlux from "../../BuildingModel/Voronoi/VertexInformation/JVertexFlux";


export const waterParamArr = (c: JCell, diagram: JDiagram): {wp: number[], rp: number[]} => {
  let out: {wp: number[], rp: number[]} = {wp: [], rp: []};
  for (let m = 1; m <= 12; m++) {
    const rp = rainParam(c, m);
    const fp = fluxParam(c, m, diagram);

    const wp = (0.5 * fp + 0.5 * rp);

    // out.wp.push(20 * inDiscreteClasses(wp, 20));
    // out.rp.push(20 * inDiscreteClasses(rp, 20));
    out.wp.push(wp);
    out.rp.push(rp);
  }
  return out;
}

export const rainParam = (cell: JCell, month: number): number => {
  if (!cell.info.isLand)
    return 0;
  const precip = cell.info.cellClimate.precipMonth[month - 1];
  const evapParam = inRange(12 * precip / cell.info.cellClimate.pumbral, 0, 1);
  let out = (precip / Math.max(...JCellClimate.maxMonthlyPrecip)) ** (0.3);
  return 1.3 * evapParam * inRange(out, 0, 1);
}

export const fluxParam = (cell: JCell, month: number, diagram: JDiagram): number => {
  const vasso = diagram.getVerticesAssociated(cell);
  const maxF = Math.max(...JVertexFlux.monthMaxFlux);
  const arr = vasso.map(v => {
    const flux = v.info.vertexFlux.monthFlux[month - 1];
    return (flux / maxF) ** 0.3;
  });
  let out = (arr.reduce((c: number, p: number) => c + p) / vasso.length) ** (0.28);
  return inRange(out, 0, 1);
}

// export const tempMedParam = (cell: JCell, month: number): number => {
//   const out = (Math.round(cell.info.cellClimate.tempMonth[month - 1]) + 13) / 48;
//   return inRange(out, 0, 1);
// }

// export const tempVarParam = (cell: JCell, month: number): number => {
//   let out = 1;
//   const tempMax = cell.info.cellClimate.tempMaxArr[month - 1];
//   const tempMin = cell.info.cellClimate.tempMinArr[month - 1];
//   const tempVar = (tempMax - tempMin);
//   if (tempVar < 13) out = 0;
//   else if (tempVar < 18) out = 1 / 3;
//   else if (tempVar < 25) out = 2 / 3;
//   return out;
// }