
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
import { colors, heighLand, land, temperatureMedia } from "./AbstractDrawing/JCellToDrawEntryFunctions";
import { evalIndVertexNavLevel } from "./GACServer/GACFlux/RiverMapGenerator";
import JVertexFlux from "./BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import { navMonth } from "./AbstractDrawing/JEdgeToDrawEntryFunctions";
import JCellClimate from "./BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCellAGR, { IJCellAGRInfo } from "./BuildingModel/Voronoi/CellInformation/JCellAGR";

const mc = MapController.instance;

let area: number = 0;
let correctionFactorWP = 1;
const classes = 20;
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([classes, 0]);

export default (): void => {
  const nm: NaturalMap = mc.naturalMap;
  const rivers = nm.rivers;

  const info = generate();

  const cdm = mc.showerManager.st.d
  
  const p: IPoint = { x: -107, y: -23.5 }
  // const m = 1;
  //-------------------------------------------------------------------
  // Water Class
  area = 0
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      let val = 0;
      const wls = info.get(c.id)?.WConditionArr;
      // if (Math.random() < 0.002) console.log(c.id, wls)
      val = wls?.includes('R0') ? 4 : val;
      val = wls?.includes('R1') ? 7 : val;
      val = wls?.includes('R2') ? 10 : val;
      val = wls?.includes('R3') ? 13 : val;
      val = wls?.includes('R4') ? 16 : val;
      // val += info.get(c.id)?.isForest ? 20 : 0;
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
  console.log(cdm.saveDrawFile(`waterClass`));
  console.log('area', area, 'km2')
  //-------------------------------------------------------------------
  // temp Class
  area = 0
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      let val = 0;
      const tls = info.get(c.id)?.TConditionArr;
      // if (Math.random() < 0.001) console.log(c.id, tls)
      val = tls?.includes('T0') ? 4 : val;
      val = tls?.includes('T1') ? 7 : val;
      val = tls?.includes('T2') ? 10 : val;
      val = tls?.includes('T3') ? 13 : val;
      val = tls?.includes('T4') ? 16 : val;
      val = tls?.includes('T5') ? 20 : val;
      // val = tls?.includes('T4') || tls?.includes('T4') ? 13 : val;
      // val = tls?.includes('T5') || tls?.includes('T5') ? 16 : val;
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
  console.log(cdm.saveDrawFile(`tempMedClass`));
  console.log('area', area, 'km2')
  //-------------------------------------------------------------------
  // isCult
  area = 0
  let landArea = 0;
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      landArea += c.area;
      let val = 0;
      val = info.get(c.id)?.isCult ? 7 : 0;
      area += val !== 0 ? c.area : 0;
      // val = info.get(c.id)?.isForest ? 20 : val;
      color = colorScale(val).alpha(1).hex();
    } else
      color = '#F2F9F0';
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile(`isCult`));
  console.log('area', area, 'km2')
  console.log('rel', (100*area/landArea).toFixed(2), '%')
  //-------------------------------------------------------------------
  // isGan
  area = 0
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      let val = 0;
      val = info.get(c.id)?.isGan ? 7 : 0;
      area += val !== 0 ? c.area : 0;
      // val = info.get(c.id)?.isForest ? 20 : val;
      color = colorScale(val).alpha(1).hex();
    } else
      color = '#F2F9F0';
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile(`isGan`));
  console.log('area', area, 'km2')
  console.log('rel', (100*area/landArea).toFixed(2), '%')
  //-------------------------------------------------------------------
  // FOREST
  // area = 0
  // cdm.clear({ zoom: 0, center: p })
  // cdm.drawCellContainer(nm.diagram, (c: JCell) => {
  //   let color: string;
  //   if (c.info.isLand) {
  //     let val = info.get(c.id)?.isForest ? 16 : 0;
  //     area += val !== 0 ? c.area : 0;
  //     color = colorScale(val).alpha(0.99).hex();
  //   } else
  //     color = '#F2F9F0';
  //   return {
  //     fillColor: color,
  //     strokeColor: color,
  //   }
  // })
  // cdm.drawMeridianAndParallels();
  // console.log(cdm.saveDrawFile(`isCellForest`));
  // console.log('area', area, 'km2')
  //-------------------------------------------------------------------

  const c = nm.diagram.getCellFromPoint(p);
  const ainfo = info.get(c.id) as JCellAGR;
  console.log(
    c.id,
    ainfo.TConditionArr,
    ainfo.WConditionArr,
    ainfo.getInterface(),
    c.info.cellClimate.tempMonth.map(p => p.toFixed(1)),
    c.info.cellClimate.koppenSubType(),
    ainfo.isCult ? 'is cult' : '',
    ainfo.isGan ? 'is gan' : '',
  )
}

/**
 * 
 */
function generate(): Map<number, JCellAGR> {
  const diagram = mc.naturalMap.diagram;
  //
  console.log('calculate and setting AGR');
	console.time(`set AGR info`);
  let out: Map<number, JCellAGR> = new Map<number, JCellAGR>();
  const data: IJCellAGRInfo[] = generateData();

  diagram.forEachCell((c: JCell) => {
    const cellAGR = new JCellAGR(c, data[c.id])
    out.set(c.id, cellAGR);
  })

  console.timeEnd(`set AGR info`);

  return out;
}
function generateData(): IJCellAGRInfo[] {
  const diagram = mc.naturalMap.diagram;
  //
  let MAXwp = 0;
  diagram.forEachCell((c: JCell) => {
    if (c.info.isLand) {
      let cv = 0;
      mc.forEachMonth(m => cv = cv < waterParam(c, m) ? waterParam(c, m) : cv)
      if (cv > MAXwp) MAXwp = cv;
    }
  })
  //
  const out: IJCellAGRInfo[] = [];
  diagram.forEachCell((c: JCell) => {
    const icwpi: IJCellAGRInfo = {
      id: c.id,
      waterCategoryArr: [],
      medWaterCategory: 0,
      tempMedCategoryArr: [],
      tempVarCategoryArr: [],
    }
    getArrayOfN(12, 0).forEach((_, i: number) => {
      const wp = waterParam(c, i + 1)/MAXwp;
      const tp = monthTempMedParam(c, i+1);
      const vp = monthTempVarParam(c, i+1);
      icwpi.waterCategoryArr.push(classes * inDiscreteClasses(wp, classes));
      icwpi.medWaterCategory += wp/12;
      icwpi.tempMedCategoryArr.push(10 * inDiscreteClasses(tp, 10));
      icwpi.tempVarCategoryArr.push(3 * inDiscreteClasses(vp, 3));
    })
    icwpi.medWaterCategory = classes * inDiscreteClasses(icwpi.medWaterCategory, classes)
    out[c.id] = icwpi;
  })

  return out;
}

// const getSecWaterClass = (c: JCell, minVal: number, maxVal: number): boolean => {
//   let out = false;
//   const pmin = minVal <= 4 ? 4 : minVal - 1;
//   const pmax = maxVal >= 16 ? 16 : maxVal + 1;

//   get3ConsecutiveMonthWaterCategory(c).forEach((m3arr: number[]) => {
//     out = out || (
//       (m3arr[0] >= pmin && m3arr[0] <= pmax) &&
//       (m3arr[1] >= minVal && m3arr[1] <= maxVal) &&
//       (m3arr[2] >= minVal && m3arr[2] <= maxVal) &&
//       !isCellPermafrost(c) && !isCellForest(c)
//     )
//   })

//   return out;
// }

// const get3ConsecutiveMonthWaterCategory = (c: JCell) => {
//   let out: number[][] = [];
//   mc.forEachMonth((m: number) => {
//     // idx
//     const n = (m == 12) ? 1 : m + 1;
//     const p = (m == 1) ? 12 : m - 1;
//     // values
//     const wpi = inDiscreteClasses(waterParam2(c, m), classes) * classes;
//     const wpp = inDiscreteClasses(waterParam2(c, p), classes) * classes;
//     const wpn = inDiscreteClasses(waterParam2(c, n), classes) * classes;
//     out.push([wpp, wpi, wpn])
//   })
//   return out;
// }

// const getMinValForGraph = (c: JCell) => {
//   let out = 1;
//   mc.forEachMonth(m => out = out > waterParam2(c, m) ? waterParam2(c, m) : out)
//   return inDiscreteClasses(out, classes) * classes;
// }

// const getMin3ValForGraph = (c: JCell) => {
//   let arr: number[] = [];
//   mc.forEachMonth((m: number) => {
//     arr.push(waterParam2(c, m))
//   })
//   arr.sort()
//   return inDiscreteClasses(arr[2], classes) * classes;
// }

// const getMedValForGraph = (c: JCell) => {
//   let out = 0;
//   mc.forEachMonth(m => out += waterParam2(c, m))
//   out /= 12;
//   return inDiscreteClasses(out, classes) * classes;
// }

// const getMax3ValForGraph = (c: JCell) => {
//   let arr: number[] = [];
//   mc.forEachMonth((m: number) => {
//     arr.push(waterParam2(c, m))
//   })
//   arr.sort()
//   return inDiscreteClasses(arr[9], classes) * classes;
// }

// const getMaxValForGraph = (c: JCell) => {
//   let out = 0;
//   mc.forEachMonth(m => out = out < waterParam2(c, m) ? waterParam2(c, m) : out)
//   return inDiscreteClasses(out, classes) * classes;
// }

const waterParam = (cell: JCell, m: number): number => {
  if (!cell.info.isLand)
    return 0;
  const mep = monthEvaporationParam(cell, m);
  const mfp = monthFluxParam(cell, m);
  const mrfp = monthRainFallParam(cell, m)
  return (0.50 * mfp + 0.60 * mep * mrfp);
}

// const waterParam2 = (cell: JCell, m: number): number => {
//   if (!cell.info.isLand)
//     return 0;
//   const mep = monthEvaporationParam(cell, m);
//   const mfp = monthFluxParam(cell, m);
//   const mrfp = monthRainFallParam(cell, m)
//   return (0.40 * mfp + 0.60 * mep * mrfp) * correctionFactorWP;
// }

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
  const out = (Math.round(cell.info.cellClimate.tempMonth[month - 1]) + 5)/40;
  return inRange(out, 0, 1);
}

const monthTempVarParam = (cell: JCell, month: number): number => {
  let out = 0;
  const tempMax = cell.info.cellClimate.tempMaxArr[month - 1];
  const tempMin = cell.info.cellClimate.tempMinArr[month - 1];
  const tempVar = (tempMax - tempMin);
  if (tempVar < 14) out = 1;
  else if (tempVar < 19) out = 2/3;
  else if (tempVar < 25) out = 1/3;
  return out;
}
