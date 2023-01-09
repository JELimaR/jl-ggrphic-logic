import { inRange } from "../../BuildingModel/Math/basicMathFunctions";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";
import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import JEdge from "../../BuildingModel/Voronoi/JEdge";
import JVertex from "../../BuildingModel/Voronoi/JVertex";
import JVertexFlux from "../../BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import { evalIndEdgeNavLevel } from "../GACFlux/RiverMapGenerator";
import NoiseMapValuesGenerator from "../NoiseMapValuesGenerator";

interface IWaterParamOut { wp: number[], rp: number[], fp: number[] }

/*
let MAXwp = 1;
export const preCalcMaxWaterParam = (diag: JDiagram): number => {
  let out = 0;
  diag.forEachCell((c: JCell) => {
    if (c.info.isLand) {
      let cellMaxValue = 0;
      const paramArr = waterParamArr(c, diag).wp;
      cellMaxValue = Math.max(...paramArr);
      if (cellMaxValue > out) out = cellMaxValue;
    }
  })
  return out;
}
*/

export const waterParamArr = (c: JCell): IWaterParamOut => {
  let out: IWaterParamOut = { wp: [], rp: [], fp: [] };
  for (let m = 1; m <= 12; m++) {
    const rp = c.info.rainParam(m);
    const fp = fluxParam(c, m);

    const wp = inRange(0.8 * rp + 0.4 * fp, 0, 1);

    out.wp.push(wp);
    out.rp.push(rp);
    out.fp.push(fp);
  }
  return out;
}

const rainParam = (cell: JCell, month: number): number => {
  if (!cell.info.isLand)
    return 0;
  const precip = cell.info.cellClimate.precipMonth[month - 1];
  const evapParam = inRange(12 * precip / cell.info.cellClimate.pumbral, 0, 1);
  let out = (precip / Math.max(...JCellClimate.maxMonthlyPrecip)) ** (0.3);
  return 1.3 * evapParam * inRange(out, 0, 1);
}

const fluxParam = (cell: JCell, month: number): number => {
  let out = 0;

  let perim = 0;
  const maxF = Math.max(...JVertexFlux.monthMaxFlux);
  cell.edges.forEach((e: JEdge) => {
    perim += e.length;
    let fluxEdge = 0;
    e.vertices.forEach((v: JVertex) => {
      fluxEdge += v.info.vertexFlux.monthFlux[month - 1] / 2;
    })

    out += ((fluxEdge / maxF) ** 1) * e.length;
  });
  out /= perim;
  return inRange(out ** 0.2, 0, 1);
}

export const fishLevelParam = (cell: JCell, diagram: JDiagram): number => {
  let out = 0;
  let perim = 0;
  // const vasso = diagram.getVerticesAssociated(cell);
  // vasso.forEach((v: JVertex, i: number) => {
  //   const currV = v;
  //   const nextV = vasso[(i + 1) % vasso.length];
  //   const edge = diagram.getEdgeFromVertices(nextV, currV);
  //   perim += edge.length;

  //   let vertNavLevel = 0;
  //   for (let month = 1; month <= 12; month++) {
  //     const monthVertNavLevel = Math.max(
  //       evalIndEdgeNavLevel(currV, nextV, month, diagram),
  //       (currV.info.vertexFlux.navLevelMonth[month - 1] + nextV.info.vertexFlux.navLevelMonth[month - 1]) / 2
  //     );
  //     vertNavLevel += monthVertNavLevel / 36;
  //   }
  //   out += vertNavLevel * edge.length;
  // });

  cell.edges.forEach((edge: JEdge) => {
    const currV = edge.vertices[0];
    const nextV = edge.vertices[1];
    perim += edge.length;

    let vertNavLevel = 0;
    for (let month = 1; month <= 12; month++) {
      const monthVertNavLevel = Math.max(
        evalIndEdgeNavLevel(edge, month),
        (currV.info.vertexFlux.navLevelMonth[month - 1] + nextV.info.vertexFlux.navLevelMonth[month - 1]) / 2
      );
      vertNavLevel += monthVertNavLevel / 36;
    }
    out += vertNavLevel * edge.length;
  })

  out /= perim;
  const fishLevelNoiseFunc = NoiseMapValuesGenerator.fishLevelNoiseFunc;
  return inRange(out * fishLevelNoiseFunc(cell), 0, 1);
}
