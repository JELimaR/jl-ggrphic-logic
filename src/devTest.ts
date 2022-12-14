
import JCell from "./BuildingModel/Voronoi/JCell";
import CellCost from "./GACServer/GACCultures/CellCost";
import MapController from "./MapController";
import chroma from 'chroma-js';
import { inDiscreteClasses, getArrayOfN, heightParamToMeters, inRange } from './BuildingModel/Math/basicMathFunctions';
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

const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
export default (): void => {
  const nm: NaturalMap = mc.naturalMap;
  const rivers = nm.rivers;

  const cdm = mc.cdm;

  const p: IPoint = { x: -162, y: -13 }
  const m = 1;
  //-------------------------------------------------------------------
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      let val = 0.65 * monthFluxParam(c, m) + 0.65 * monthRainFallParam(c, m);
      color = colorScale(val).hex();
    } else
      color = '#F2F9F0C8';
    return {
      fillColor: color,
      strokeColor: color,
    }
  })

  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile('test45674567'));
  //-------------------------------------------------------------------

  const c = nm.diagram.getCellFromPoint(p);

}

const monthTempAuxParam = (c: JCell, month: number): number => {
  const temp = c.info.cellClimate.tempMonth[month - 1];
  return 1 - 0.25 * inRange(temp / 30, 0, 1)
}

const monthRainFallParam = (cell: JCell, month: number): number => {
  let out;
  const precip = cell.info.cellClimate.precipMonth[month - 1];
  out = monthTempAuxParam(cell, month) * (precip / Math.max(...JCellClimate.maxMonthlyPrecip)) ** (0.3);
  return inRange(out, 0, 1);
}

const monthFluxParam = (cell: JCell, month: number): number => {
  let out;
  const vasso = mc.naturalMap.diagram.getVerticesAssociated(cell);
  const maxF = Math.max(...JVertexFlux.monthMaxFlux);
  const arr = vasso.map(v => {
    const flux = v.info.vertexFlux.monthFlux[month - 1];
    return (flux / maxF) ** 0.4;
  });
  out = monthTempAuxParam(cell, month) * (arr.reduce((c: number, p: number) => c + p) / vasso.length);
  return inRange(out, 0, 1);
}

