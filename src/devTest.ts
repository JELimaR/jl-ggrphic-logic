
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
import { drawAlgo, estadisticasClimateAndRes, isCellCoast } from './temporalAuxFunctions';
import NaturalMap from "./BuildingModel/NaturalMap";
import { colors, heighLand, land, temperatureMedia } from "./AbstractDrawing/JCellToDrawEntryFunctions";
import { evalIndVertexNavLevel } from "./GACServer/GACFlux/RiverMapGenerator";
import JVertexFlux from "./BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import { navMonth } from "./AbstractDrawing/JEdgeToDrawEntryFunctions";
import JCellClimate from "./BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCellAGR, { IJCellAGRInfo, TCul } from "./BuildingModel/Voronoi/CellInformation/JCellAGR";
import CanvasDrawingMap from "./CanvasDrawing/CanvasDrawingMap";
import { createICellContainer } from "./BuildingModel/MapContainerElements/containerInterfaces";
import InformationFilesManager from "./DataFileLoadAndSave/InformationFilesManager";

const mc = MapController.instance;

let area: number = 0;
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([20, 0]);

export default (): void => {
  const nm: NaturalMap = mc.naturalMap;
  const rivers = nm.rivers;

  nm.generateAGRInfo();

  const cdm = mc.showerManager.st.d

  const p: IPoint = { x: -137, y: -8 }
  const cell = nm.diagram.getCellFromPoint(p);
  // const m = 1;
  //-------------------------------------------------------------------
  // Water Class
  // area = 0
  // cdm.clear({ zoom: 0, center: p })
  // cdm.drawCellContainer(nm.diagram, (c: JCell) => {
  //   let color: string;
  //   if (c.info.isLand) {
  //     let val = 0;
  //     const wls = info.get(c.id)?.WConditionArr;
  //     // if (Math.random() < 0.002) console.log(c.id, wls)
  //     val = wls?.includes('W0') ? 5 : val;
  //     val = wls?.includes('W1') ? 8 : val;
  //     val = wls?.includes('W2') ? 11 : val;
  //     val = wls?.includes('W3') ? 14 : val;
  //     // val = wls?.includes('W4') ? 16 : val;
  //     // val += info.get(c.id)?.isForest ? 20 : 0;
  //     area += val !== 0 ? c.area : 0;
  //     color = colorScale(val).alpha(1).hex();
  //   } else
  //     color = '#F2F9F0';
  //   return {
  //     fillColor: color,
  //     strokeColor: color,
  //   }
  // })
  // cdm.drawMeridianAndParallels();
  // console.log(cdm.saveDrawFile(`waterClass`));
  // console.log('area', area, 'km2')
  //-------------------------------------------------------------------
  // temp Class
  // area = 0
  // cdm.clear({ zoom: 0, center: p })
  // cdm.drawCellContainer(nm.diagram, (c: JCell) => {
  //   let color: string;
  //   if (c.info.isLand) {
  //     let val = 0;
  //     const tls = info.get(c.id)?.TConditionArr;
  //     // if (Math.random() < 0.001) console.log(c.id, tls)
  //     val = tls?.includes('T0') ? 7 : val;
  //     val = tls?.includes('T1') ? 12 : val;
  //     val = tls?.includes('T2') ? 16 : val;
  //     // val = tls?.includes('T3') ? 13 : val;
  //     // val = tls?.includes('T4') ? 16 : val;
  //     // val = tls?.includes('T5') ? 20 : val;
  //     // val = tls?.includes('T4') || tls?.includes('T4') ? 13 : val;
  //     // val = tls?.includes('T5') || tls?.includes('T5') ? 16 : val;
  //     area += val !== 0 ? c.area : 0;
  //     color = colorScale(val).alpha(1).hex();
  //   } else
  //     color = '#F2F9F0';
  //   return {
  //     fillColor: color,
  //     strokeColor: color,
  //   }
  // })
  // cdm.drawMeridianAndParallels();
  // console.log(cdm.saveDrawFile(`tempMedClass`));
  // console.log('area', area, 'km2')
  //-------------------------------------------------------------------
  // temp var Class
  // area = 0
  // cdm.clear({ zoom: 0, center: p })
  // cdm.drawCellContainer(nm.diagram, (c: JCell) => {
  //   let color: string;
  //   if (c.info.isLand) {
  //     let val = 0;
  //     const vls = info.get(c.id)?.VConditionArr;
  //     val = vls?.includes('V0') ? 6 : val;
  //     val = vls?.includes('V1') ? 11 : val;
  //     val = vls?.includes('V2') ? 16 : val;
  //     area += val !== 0 ? c.area : 0;
  //     color = colorScale(val).alpha(1).hex();
  //   } else
  //     color = '#F2F9F0';
  //   return {
  //     fillColor: color,
  //     strokeColor: color,
  //   }
  // })
  // cdm.drawMeridianAndParallels();
  // console.log(cdm.saveDrawFile(`tempVarClass`));
  // console.log('area', area, 'km2')
  //-------------------------------------------------------------------
  // is agr
  area = 0
  let ganArea = 0;
  let culArea = 0;
  let landArea = 0;
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      const ainfo = c.info.cellAGR;
      landArea += c.area;
      let val = 0;
      if (ainfo.isCul) {
        val += 6;
        culArea += c.area;
      }
      if (ainfo.isGan) {
        val += 11;
        ganArea += c.area;
      }
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
  console.log(cdm.saveDrawFile(`isAgr`));
  console.log('rel total', (100 * area / landArea).toFixed(2), '%')
  console.log('rel cul', (100 * culArea / landArea).toFixed(2), '%')
  console.log('rel gan', (100 * ganArea / landArea).toFixed(2), '%')
  //-------------------------------------------------------------------
  // FOREST
  area = 0
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      const ainfo = c.info.cellAGR;
      let val = ainfo.isForest ? 19 : 0;
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
  console.log('\t', (100 * area / landArea).toFixed(2), '%')
  //-------------------------------------------------------------------

  const agrInfo = cell.info.cellAGR;
  console.log(
    cell.id, '\n',
    JSON.stringify(agrInfo.getInterface(), null, 2),
    cell.info.cellClimate.tempMonth.map(p => p.toFixed(1)),
    cell.info.cellClimate.precipMonth.map(p => p.toFixed(1)),
    nm.diagram.getVerticesAssociated(cell).map((v: JVertex) => {
      return { rivers: v.info.vertexFlux.riverIds, fluxV: v.info.vertexFlux.annualFlux }
    }),
    cell.info.cellClimate.koppenSubType(),
    agrInfo.isCul ? 'is cul' : '',
    agrInfo.isGan ? 'is gan' : '',
  )

  estadisticasClimateAndRes()
}

const drawCellOnly = (c: JCell, cdm: CanvasDrawingMap) => {
  const color = '#010101'
  cdm.drawCellContainer(createICellContainer([c]), colors({ fillColor: color, strokeColor: color }))
}

