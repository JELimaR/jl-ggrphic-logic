
import JCell from "./BuildingModel/Voronoi/JCell";
import CellCost from "./GACServer/GACCultures/CellCost";
import MapController from "./MapController";
import chroma from 'chroma-js';
import { inDiscreteClasses, getArrayOfN, heightParamToMeters, inRange, generateShape } from './BuildingModel/Math/basicMathFunctions';
import JVertex from './BuildingModel/Voronoi/JVertex';
import IslandMap from './BuildingModel/MapContainerElements/Natural/IslandMap';
import Point, { IPoint } from './BuildingModel/Math/Point';
import JEdge from './BuildingModel/Voronoi/JEdge';
import FluxRouteMap from './BuildingModel/MapContainerElements/Natural/FluxRouteMap';
import JCellHeight from './BuildingModel/Voronoi/CellInformation/JCellHeight';
import { FLUXLIMITPARAM } from './GACServer/constants';
import RiverMap from './BuildingModel/MapContainerElements/Natural/RiverMap';
import { drawAlgo, isCellCoast } from './temporalAuxFunctions';
import NaturalMap from "./BuildingModel/NaturalMap";
import { colors, heighLand, land } from "./AbstractDrawing/JCellToDrawEntryFunctions";
import { evalIndVertexNavLevel } from "./GACServer/GACFlux/RiverMapGenerator";
import JVertexFlux from "./BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import { navMonth } from "./AbstractDrawing/JEdgeToDrawEntryFunctions";
import JCellClimate from "./BuildingModel/Voronoi/CellInformation/JCellClimate";

const mc = MapController.instance;

let area: number = 0;
let correctionFactorWP = 1;
const classes = 20;
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([classes, 0]);

export default (): void => {
  const nm: NaturalMap = mc.naturalMap;
  const rivers = nm.rivers;

  let MAXwp = 0;
  nm.diagram.forEachCell((c: JCell) => {
    if (c.info.isLand) {
      // const cv = getMaxValForGraph(c);
      let cv = 0;
      mc.forEachMonth(m => cv = cv < waterParam(c, m) ? waterParam(c, m) : cv)
      if (cv > MAXwp) MAXwp = cv
    }
  })

  correctionFactorWP = 1 / MAXwp;
  console.log('correctionFactor WP', correctionFactorWP)

  const cdm = mc.showerManager.st.d

  const p: IPoint = { x: -162, y: -13 }
  // const m = 1;
  //-------------------------------------------------------------------
  // Water Class
  area = 0
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      let val = 0;
      // val = getSecWaterClass(c, 4, 4) ? 2 : val;
      val = getSecWaterClass(c, 5, 6) ? 5 : val;
      val = getSecWaterClass(c, 7, 8) ? 7 : val;
      val = getSecWaterClass(c, 9, 11) ? 10 : val;
      val = getSecWaterClass(c, 12, 13) ? 12 : val;
      val = getSecWaterClass(c, 14, 15) ? 14 : val;
      // val = getSecWaterClass(c, 16, 16) ? 16 : val;
      // val += isCellForest(c) ? 15 : 0;
      area += val !== 0 ? c.area : 0;
      color = colorScale(val).alpha(1).hex();
    } else
      color = '#F2F9F0';
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile(`getSecWaterClass`));
  console.log('area', area, 'km2')
  //-------------------------------------------------------------------
  // FOREST
  area = 0
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      let val = isCellForest(c) ? 16 : 0;
      area += val !== 0 ? c.area : 0;
      color = colorScale(val).alpha(0.99).hex();
    } else
      color = '#F2F9F0';
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile(`isCellForest`));
  console.log('area', area, 'km2')
  //-------------------------------------------------------------------

  const c = nm.diagram.getCellFromPoint(p);

}


/**
 * Is cell forset
 */
const isCellForest = (c: JCell): boolean => {
  const forestMinVal = 9;
  let minVal = getMinValForGraph(c);
  // let cont = 0;
  // mc.forEachMonth(m => {
  //   if (minVal > forestMinVal) cont++;
  // })
  const isF = minVal > forestMinVal && !isCellPermafrost(c)
  return isF;
}
const isCellPermafrost = (c: JCell): boolean => {
  return c.info.cellClimate.tempMed < -2
}

/**
 * 
 */
interface IJCellWaterParamInfo {
  waterParams: number[];
}
function generate() {
  const diagram = mc.naturalMap.diagram;
  //
  let MAXwp = 0;
  diagram.forEachCell((c: JCell) => {
    if (c.info.isLand) {
      const cv = getMaxValForGraph(c);
      if (cv > MAXwp) MAXwp = cv
    }
  })
  //
  const out: Map<number, IJCellWaterParamInfo> = new Map<number, IJCellWaterParamInfo>();
  diagram.forEachCell((c: JCell) => {
    const icwpi: IJCellWaterParamInfo = {
      waterParams: getArrayOfN(12, 0),
    }
    getArrayOfN(12, 0).forEach((_, i: number) => {
      const wp = waterParam(c, i + 1);
      icwpi.waterParams.push(wp)
    })
    out.set(c.id, icwpi);
  })
}

const getSecWaterClass = (c: JCell, minVal: number, maxVal: number): boolean => {
  let out = false;
  const pmin = minVal <= 4 ? 4 : minVal - 1;
  const pmax = maxVal >= 16 ? 16 : maxVal + 1;

  get3ConsecutiveMonthWaterClasses(c).forEach((m3arr: number[]) => {
    out = out || (
      (m3arr[0] >= pmin && m3arr[0] <= pmax) &&
      (m3arr[1] >= minVal && m3arr[1] <= maxVal) &&
      (m3arr[2] >= minVal && m3arr[2] <= maxVal) &&
      !isCellPermafrost(c) && !isCellForest(c)
    )
  })

  return out;
}

const get3ConsecutiveMonthWaterClasses = (c: JCell) => {
  let out: number[][] = [];
  mc.forEachMonth((m: number) => {
    // idx
    const n = (m == 12) ? 1 : m + 1;
    const p = (m == 1) ? 12 : m - 1;
    // values
    const wpi = inDiscreteClasses(waterParam(c, m), classes) * classes;
    const wpp = inDiscreteClasses(waterParam(c, p), classes) * classes;
    const wpn = inDiscreteClasses(waterParam(c, n), classes) * classes;
    out.push([wpp, wpi, wpn])
  })
  return out;
}

const getMinValForGraph = (c: JCell) => {
  let out = 1;
  mc.forEachMonth(m => out = out > waterParam(c, m) ? waterParam(c, m) : out)
  return inDiscreteClasses(out, classes) * classes;
}

const getMin3ValForGraph = (c: JCell) => {
  let arr: number[] = [];
  mc.forEachMonth((m: number) => {
    arr.push(waterParam(c, m))
  })
  arr.sort()
  return inDiscreteClasses(arr[2], classes) * classes;
}

const getMedValForGraph = (c: JCell) => {
  let out = 0;
  mc.forEachMonth(m => out += waterParam(c, m))
  out /= 12;
  return inDiscreteClasses(out, classes) * classes;
}

const getMax3ValForGraph = (c: JCell) => {
  let arr: number[] = [];
  mc.forEachMonth((m: number) => {
    arr.push(waterParam(c, m))
  })
  arr.sort()
  return inDiscreteClasses(arr[9], classes) * classes;
}

const getMaxValForGraph = (c: JCell) => {
  let out = 0;
  mc.forEachMonth(m => out = out < waterParam(c, m) ? waterParam(c, m) : out)
  return inDiscreteClasses(out, classes) * classes;
}

const waterParam = (cell: JCell, m: number): number => {
  if (!cell.info.isLand)
    return 0;
  const mep = monthEvaporationParam(cell, m);
  const mfp = monthFluxParam(cell, m);
  const mrfp = monthRainFallParam(cell, m)
  return (0.55 * mfp + 0.70 * mep * mrfp) * correctionFactorWP;
}

const monthEvaporationParam = (cell: JCell, month: number): number => {
  const precip = cell.info.cellClimate.precipMonth[month - 1];
  return inRange(12 * precip / cell.info.cellClimate.pumbral, 0, 1);
}

const monthRainFallParam = (cell: JCell, month: number): number => {
  const precip = cell.info.cellClimate.precipMonth[month - 1];
  let out = (precip / Math.max(...JCellClimate.maxMonthlyPrecip)) ** (0.3);
  return inRange(out, 0, 1);
}

const monthFluxParam = (cell: JCell, month: number): number => {
  const vasso = mc.naturalMap.diagram.getVerticesAssociated(cell);
  const maxF = Math.max(...JVertexFlux.monthMaxFlux);
  const arr = vasso.map(v => {
    const flux = v.info.vertexFlux.monthFlux[month - 1];
    return (flux / maxF) ** 0.3;
  });
  let out = (arr.reduce((c: number, p: number) => c + p) / vasso.length) ** (0.3);
  return inRange(out, 0, 1);
}

const monthTempMedParam = (cell: JCell, month: number): number => {
  const temp = cell.info.cellClimate.tempMonth[month - 1];
  return temp;
}
