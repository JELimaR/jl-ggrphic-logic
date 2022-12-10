import * as fs from 'fs';
import * as path from 'path';
import RiverMap from './BuildingModel/MapContainerElements/Natural/RiverMap';
import { getArrayOfN } from './BuildingModel/Math/basicMathFunctions';
import Point, { IPoint } from "./BuildingModel/Math/Point";
import JCellHeight from './BuildingModel/Voronoi/CellInformation/JCellHeight';
import JCell from "./BuildingModel/Voronoi/JCell";
import JDiagram from './BuildingModel/Voronoi/JDiagram';
import JVertex from "./BuildingModel/Voronoi/JVertex";
import { FLUXLIMITPARAM, TypeMonthArr } from './GACServer/constants';
import MapController from "./MapController";

const mc = MapController.instance;
const rootPath = path.resolve(path.dirname('') + '/');

/**
 * Otras cosas
 */
const coastVertices: JVertex[] = [];
const getCoastVertices = (): JVertex[] => {
  if (coastVertices.length === 0) {
    console.log('calculating coast vertices')
    mc.naturalMap.diagram.forEachVertex((v: JVertex) => {
      if (v.info.vertexHeight.heightType === 'coast') coastVertices.push(v);
    })
    console.log(coastVertices.length)
  }
  return coastVertices;
}

export const calcCoastDistance = (cell: JCell): number => {
  const coastVertices: JVertex[] = getCoastVertices();

  let out: number = 80808080;

  coastVertices.forEach((coastV: JVertex) => {
    const cellDist = Point.geogDistance(coastV.point, cell.site.point);
    if (cellDist < out) {
      out = cellDist;
    }
  })

  return out;
}

export const isCellCoast = (cell: JCell): boolean => {
  let out: boolean = false;
  mc.naturalMap.diagram.getVerticesAssociated(cell).forEach((v: JVertex) => {
    out = out || v.info.vertexHeight.heightType == 'coast';
  })
  return out;
}

export const estadisticasKoppenVSLifeZone = (): void => {
  let printString: string = '';

  mc.naturalMap.diagram.forEachCell((cell: JCell) => {
    if (cell.info.isLand) {
      const cc = cell.info.cellClimate;
      printString += cell.id
      + '\t' + cc.lifeZone.id 
      + '\t' + `${cc.lifeZone.id < 10 ? 0 : ''}` + cc.lifeZone.id + ' - ' + cc.lifeZone.desc2
      + '\t' + cc.koppenSubType()
      + '\t' + Math.round(cc.tmax*100)/100  + '\t' +  Math.round(cc.tmin*100)/100
      + '\t' + Math.round(cc.tmed*100)/100

      + '\t' + Math.round(cc.precipSemCalido)  + '\t' +  Math.round(cc.precipSemFrio)
      + '\t' + Math.round(cc.annualPrecip)
      + '\t' + Math.round(cell.info.cellHeight.heightInMeters)
      + '\t' + Math.round(cell.areaSimple*10)/10
      + '\t' + Math.round(Math.abs(cell.site.point.y))
      + '\n';
    }
  })

  fs.writeFileSync(rootPath + '/estadisticasKoppenVSLifeZone.jdat', printString);
}

export const datosDiagram = (): void => {
  let printString: string = '';
  
  mc.naturalMap.diagram.forEachCell((cell: JCell) => {
    if (cell.info.isLand) {
      const ch = cell.info.cellHeight;
      printString += cell.id
      // + '\t' + cell.neighborsId
      + '\t' + `${isCellCoast(cell) ? 'coast' : 'none'}`


      + '\t' + Math.round(ch.heightInMeters)
      + '\t' + Math.round(cell.areaSimple*10)/10
      + '\n';
    }
  })

  fs.writeFileSync(rootPath + '/datosDiagram.jdat', printString);
}