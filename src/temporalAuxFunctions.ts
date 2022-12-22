import * as fs from 'fs';
import * as path from 'path';
import chroma from 'chroma-js';
import IDrawingParameters from './AbstractDrawing/IDrawingParameters';
import RiverMap from './BuildingModel/MapContainerElements/Natural/RiverMap';
import { getArrayOfN } from './BuildingModel/Math/basicMathFunctions';
import Point, { IPoint } from "./BuildingModel/Math/Point";
import JCellHeight from './BuildingModel/Voronoi/CellInformation/JCellHeight';
import JCell from "./BuildingModel/Voronoi/JCell";
import JDiagram from './BuildingModel/Voronoi/JDiagram';
import JVertex from "./BuildingModel/Voronoi/JVertex";
import CanvasDrawingMap from './CanvasDrawing/CanvasDrawingMap';
import { FLUXLIMITPARAM, TypeMonthArr } from './GACServer/constants';
import MapController from "./MapController";
import JVertexFlux from './BuildingModel/Voronoi/VertexInformation/JVertexFlux';
import JCellClimate from './BuildingModel/Voronoi/CellInformation/JCellClimate';

const mc = MapController.instance;
const rootPath = path.resolve(path.dirname('') + '/');

const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);

/**
 * Costos y cell functions
 */
export const drawAlgo = (): (cell: JCell) => IDrawingParameters => {
  let color: string;
  return (c: JCell) => {
    if (c.info.isLand) {
      color = colorScale(annualFluxCostEVal(c)).alpha(1).hex();
    } else
      color = '#F2F9F0C8'
    return {
      fillColor: color,
      strokeColor: color,
    }
  }
}

const annualNavCostEval = (cell: JCell): number => {
  const vasso = mc.naturalMap.diagram.getVerticesAssociated(cell);
  const arr = vasso.map(v => 
    v.info.vertexFlux.navLevelMonth.reduce((c: number, p: number) => c + p)
  );
  return Math.max(...arr) / 36;
}

const minNavCostEval = (cell: JCell): number => {
  const vasso = mc.naturalMap.diagram.getVerticesAssociated(cell);
  const arr = vasso.map(v => Math.min(...v.info.vertexFlux.navLevelMonth));
  return Math.max(...arr) / 3; // ver
}

const annualFluxCostEVal = (cell: JCell): number => {
  const vasso = mc.naturalMap.diagram.getVerticesAssociated(cell);
  const arr = vasso.map(v => 
    (v.info.vertexFlux.annualFlux / JVertexFlux.annualMaxFlux) ** (1/3)
  );
  return Math.max(...arr);
}

const minFluxCostEval = (cell: JCell): number => {
  const vasso = mc.naturalMap.diagram.getVerticesAssociated(cell);
  const arr = vasso.map(v =>
    (12 * Math.min(...v.info.vertexFlux.monthFlux) / JVertexFlux.annualMaxFlux) ** (1/3)
  );
  return Math.max(...arr);
}

/**
 * Otras cosas
 */
export const cellDistFromVertex = (c: JCell, v: JVertex) => {
	const dcen = Point.geogDistance(c.center, v.point);
	let dmin = 120000;
	let dmax = 0;
  let dmed = 0;
  const vassos = mc.naturalMap.diagram.getVerticesAssociated(c);
	vassos.forEach((va: JVertex) => {
		const d = Point.geogDistance(va.point, v.point);
		if (d < dmin) dmin = d;
		if (d > dmax) dmax = d;
    dmed += d/(vassos.length+1);
	})
  dmed += dcen/(vassos.length+1);
	return {dmed, dcen, dmin, dmax};
}

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

export const estadisticasClimateAndRes = (): void => {
  let printString: string = '';

  mc.naturalMap.diagram.forEachCell((cell: JCell) => {
    if (cell.info.isLand) {
      const cc = cell.info.cellClimate;
      const ca = cell.info.cellAGR;
      printString += cell.id
      + '\t' + cc.lifeZone.id 
      + '\t' + `${cc.lifeZone.id < 10 ? 0 : ''}` + cc.lifeZone.id + ' - ' + cc.lifeZone.desc2
      + '\t' + cc.koppenSubType()
      + '\t' + Math.round(cc.tempMonthMax*100)/100  + '\t' +  Math.round(cc.tempMonthMin*100)/100
      + '\t' + Math.round(cc.tempMed*100)/100

      + '\t' + Math.round(cc.precipSemCalido)  + '\t' +  Math.round(cc.precipSemFrio)
      + '\t' + Math.round(cc.annualPrecip)
      + '\t' + (ca.isCul ? 1 : 0) + '\t' + (ca.isGan ? 1 : 0) + '\t' + (ca.isForest ? 1 : 0)
      + '\t' + Math.round(cell.info.cellHeight.heightInMeters)
      + '\t' + Math.round(cell.areaSimple*10)/10
      + '\t' + Math.round(Math.abs(cell.site.point.y))
      + '\n';
    }
  })

  fs.writeFileSync(rootPath + '/estadisticasClimateAndRes.jdat', printString);
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