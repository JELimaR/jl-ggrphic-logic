
import JCell from "./BuildingModel/Voronoi/JCell";
import CellCost from "./GACServer/GACCultures/CellCost";
import MapController from "./MapController";
import chroma from 'chroma-js';
import { inDiscreteClasses, getArrayOfN } from './BuildingModel/Math/basicMathFunctions';
import JVertex from './BuildingModel/Voronoi/JVertex';
import IslandMap from './BuildingModel/MapContainerElements/Natural/IslandMap';
import Point, { IPoint } from './BuildingModel/Math/Point';
import JEdge from './BuildingModel/Voronoi/JEdge';
import FluxRouteMap from './BuildingModel/MapContainerElements/Natural/FluxRouteMap';
import JCellHeight from './BuildingModel/Voronoi/CellInformation/JCellHeight';
import { FLUXLIMITPARAM } from './GACServer/constants';
import RiverMap from './BuildingModel/MapContainerElements/Natural/RiverMap';
import { isCellCoast } from './temporalAuxFunctions';
import NaturalMap from "./BuildingModel/NaturalMap";
import { heighLand, land } from "./AbstractDrawing/JCellToDrawEntryFunctions";

const mc = MapController.instance;

const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
export default (): void => {
  const nm: NaturalMap = mc.naturalMap;
  console.log(nm.rivers.size);

  const month = 1;
  const cdm = mc.cdm;

  cdm.clear({zoom: 4, center: {x: 80, y: -42}})
  cdm.drawCellContainer(nm.diagram, land(1));
  cdm.drawCellContainer(mc.naturalMap.diagram, (c: JCell) => {
    let color: string = '#FFFFFF00';
    if (isCellNearNav(c, month)) {
      color = '#896741B1'
    }
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  // cdm.drawMeridianAndParallels();
  // console.log(cdm.saveDrawFile('nav200'));

  // cdm.clear({zoom: 4, center: {x: 90, y: 8}})
  // cdm.drawCellContainer(nm.diagram, land(1));
  
  nm.rivers.forEach((r: RiverMap) => {
    cdm.drawEdgeContainer(r, (e: JEdge) => {
      let val = Math.min(
        e.vertices[0].info.vertexFlux.navLevelMonth[month-1], 
        e.vertices[1].info.vertexFlux.navLevelMonth[month-1]
      );
      // val = val === 3 ? 3 : 0;
      let color: string = colorScale(val/3).hex();
      return {
        fillColor: color,
        strokeColor: color,
      }
    })
  })

  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile('nav3404'));

  console.log('Flux limit', nm.diagram.vertices.size*FLUXLIMITPARAM)
  console.log('MIN nav Flux limit', nm.diagram.vertices.size*FLUXLIMITPARAM*5)

  const v: JVertex = nm.diagram.getVertexFromPoint(new Point(80, -42));
  console.log(v.info.vertexFlux.getInterface())
  console.log(v.info.vertexClimate.getInterface())
}

const isCellNearNav = (cell: JCell, month: number): boolean => {
  if (!cell.info.isLand) return false;
  let out: boolean = false;

  mc.naturalMap.diagram.getVerticesAssociated(cell).forEach((v: JVertex) => {
    out = out || v.info.vertexFlux.navLevelMonth[month -1] >= 1;
  })
  return out;
}