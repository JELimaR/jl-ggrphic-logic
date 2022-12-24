
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
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import RandomNumberGenerator from "./BuildingModel/Math/RandomNumberGenerator";


const mc = MapController.instance;

let area: number = 0;
let landArea = 0;
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([20, 0]);

export default (): void => {
  const nm: NaturalMap = mc.naturalMap;
  nm.diagram.forEachCell(c => landArea += c.info.cellHeight.heightType == 'land' ? c.area : 0)
  const rivers = nm.rivers;

  nm.generateAGRInfo();

  const cdm = mc.showerManager.st.d

  const p: IPoint = { x: -137, y: -8 }
  const cell = nm.diagram.getCellFromPoint(p);
  //-------------------------------------------------------------------
  // is mine
  const mvg = new MineValuesGenerator(RandomNumberGenerator.makeRandomFloat(54));
  const simpleFunc = mvg.simple();
  //-------------------------------------------------------------------
  area = 0
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    // if (c.info.isLand) {
    const hinfo = c.info.cellHeight;
    let val = 0;
    // if (hinfo.heightInMeters > 1108) {
    val = 1 + 19 * simpleFunc(c);
    val = inDiscreteClasses(val / 20, 20) * 20;
    area += c.area;
    // }
    // area += val !== 0 ? c.area : 0;
    color = colorScale(val).alpha(1.0).hex();
    // } else
    //   color = '#F2F9F0';
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile(`simpleFunc`));
  console.log('rel Area', (100 * area / landArea).toFixed(2), '%')
  //-------------------------------------------------------------------
  // const otherFunc = mvg.other();
  // area = 0
  // cdm.clear({ zoom: 0, center: p })
  // cdm.drawCellContainer(nm.diagram, (c: JCell) => {
  //   let color: string;
  //   // if (c.info.isLand) {
  //     const hinfo = c.info.cellHeight;
  //     let val = 0;
  //     // if (hinfo.heightInMeters > 1108) {
  //       val = 1 + 19 * otherFunc(c);
  //       val = inDiscreteClasses(val/20, 20) * 20;
  //       area += c.area;
  //     // }
  //     // area += val !== 0 ? c.area : 0;
  //     color = colorScale(val).alpha(1.0).hex();
  //   // } else
  //   //   color = '#F2F9F0';
  //   return {
  //     fillColor: color,
  //     strokeColor: color,
  //   }
  // })
  // cdm.drawMeridianAndParallels();
  // console.log(cdm.saveDrawFile(`otherFunc`));
  // console.log('rel Area', (100 * area / landArea).toFixed(2), '%')
  // //-------------------------------------------------------------------

  // estadisticasClimateAndRes()
  area = 0;
  let culArea = 0;
  let ganArea = 0;
  let forArea = 0;
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      const ainfo = c.info.cellAGR;
      let val = 0;
      if (ainfo.isCul) {
        val += 7;
        culArea += c.area;
      }
      if (ainfo.isGan) {
        val += 11;
        ganArea += c.area;
      }
      area += val != 0 ? c.area : 0;
      color = colorScale(val).alpha(1.0).hex();
      if (ainfo.isForest) {
        color = '#121719';
        forArea += c.area;
      }
    } else
      color = '#F2F9F0';
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile(`isAgr`));
  console.log('rel Area', (100 * area / landArea).toFixed(2), '%')
  console.log('cul area', culArea.toFixed(0), 'km2\t', (100 * culArea / landArea).toFixed(2), '%')
  console.log('gan Area', ganArea.toFixed(0), 'km2\t', (100 * ganArea / landArea).toFixed(2), '%')
  console.log('for Area', forArea.toFixed(0), 'km2\t', (100 * forArea / landArea).toFixed(2), '%')
}

const drawCellOnly = (c: JCell, cdm: CanvasDrawingMap) => {
  const color = '#010101'
  cdm.drawCellContainer(createICellContainer([c]), colors({ fillColor: color, strokeColor: color }))
}

const simpleP = () => {

}

class MineValuesGenerator {
  private _seedGen: () => number;
  constructor(seedGen: () => number) {
    this._seedGen = seedGen;
  }

  simple(): (cell: JCell) => number {
    const noiseFunc = this.create();
    return (c: JCell) => {
      let out = 0;
      out += 1.00 * evalNoiseFunc(noiseFunc, c, 1);
      out += 0.50 * evalNoiseFunc(noiseFunc, c, 2);
      out += 0.25 * evalNoiseFunc(noiseFunc, c, 4);

      out /= (1 + 0.5 + 0.25);
      return out;
    }
  }

  other(): (cell: JCell) => number {
    const noiseFunc = this.create();
    return (c: JCell) => {
      let out = 1 * evalNoiseFunc(noiseFunc, c, 1);
      out += 0.5 * evalNoiseFunc(noiseFunc, c, 2);
      out += 0.25 * evalNoiseFunc(noiseFunc, c, 4);

      out /= (1 + 0.5 + 0.25);
      return out;
    }
  }

  private create(): NoiseFunction2D {
    const seed = Math.round(this._seedGen() * 18000);
    console.log('seed:', seed)
    return createNoise2D(RandomNumberGenerator.makeRandomFloat(seed));
  }
}

const evalNoiseFunc = (func: (x: number, y: number) => number, c: JCell, scale: number): number => {
  const xdist = (1 - Math.abs(c.center.x / 180));
  const ydist = (1 - Math.abs(c.center.y / 90));
  const xmask = inRange((xdist / (1 - 150 / 180)) ** 0.5, 0.1, 1);
  const ymask = inRange((ydist / (1 - 70 / 90)) ** 0.5, 0.1, 1);
  const XDIV = 180 / scale;
  const YDIV = 90 / scale;
  return xmask * ymask * (func(c.center.x / XDIV, c.center.y / YDIV) + 1) / 2;
}