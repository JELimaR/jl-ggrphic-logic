
import JCell from "./BuildingModel/Voronoi/JCell";
import CellCost from "./GACServer/GACCultures/CellCost";
import MapController from "./MapController";
import chroma from 'chroma-js';
import { inDiscreteClasses, getArrayOfN, heightParamToMeters, inRange, getMedValue } from './BuildingModel/Math/basicMathFunctions';
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
import NoiseMapValuesGenerator, { INoiseFunctionEntry } from "./GACServer/NoiseMapValuesGenerator";
import { culMonthlyValue } from './GACServer/GACNaturalRes/SeasonalCulFunctions'
import { fertFunc } from "./GACServer/SomeNoiseFunctionEntries";
import { fluxParam, rainParam } from "./GACServer/GACNaturalRes/WaterParamsCalc";
import NaturalResMapGenerator from "./GACServer/GACNaturalRes/NaturalResMapGenerator";


const mc = MapController.instance;

let area: number = 0;
let sumValue = 0;
let landArea = 0;
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
const colorScaleBW: chroma.Scale = chroma.scale();

export default (): void => {
  const nm: NaturalMap = mc.naturalMap;
  nm.diagram.forEachCell(c => landArea += c.info.heightType == 'land' ? c.area : 0)
  const rivers = nm.rivers;
  const nrg = new NaturalResMapGenerator(nm.diagram);

  const datos = nrg.seasonalCulValues();

  // nm.generateAGRInfo();

  const cdm = mc.showerManager.st.d

  const p: IPoint = { x: 92, y: -8 }
  const cell = nm.diagram.getCellFromPoint(p);
  //-------------------------------------------------------------------
  area = 0
  sumValue = 0;
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      const info = c.info;
      let val = 0;
      
      val = Math.max(...datos[c.id]['cer']!)

      area += val !== 0 ? c.area : 0;
      sumValue += val * c.area;
      color = colorScaleBW(val).alpha(1.0).hex();
    } else
      color = colorScale(0.1).hex();
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile(`test45`));
  console.log('area', mostrarNum(area), 'km2 -', mostrarNum(100*area/landArea), '%')
  console.log(mostrarNum(sumValue))
  //-------------------------------------------------------------------
  area = 0
  sumValue = 0;
  cdm.clear({ zoom: 0, center: p })
  cdm.drawCellContainer(nm.diagram, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      let val = 0;
      
      val = Math.max(...datos[c.id]['cerw']!)

      area += val !== 0 ? c.area : 0;
      sumValue += val * c.area;
      color = colorScaleBW(val).alpha(1.0).hex();
    } else
      color = colorScale(0.1).hex();
    return {
      fillColor: color,
      strokeColor: color,
    }
  })
  cdm.drawMeridianAndParallels();
  console.log(cdm.saveDrawFile(`test46`));
  console.log('area', mostrarNum(area), 'km2 -', mostrarNum(100*area/landArea), '%')
  console.log(mostrarNum(sumValue))

  console.log('datos:')
  console.log('cer', datos[cell.id].cer)
  console.log('cerw', datos[cell.id].cerw)
  //-------------------------------------------------------------------

  // estadisticasClimateAndRes();
  // console.log(mc.showerManager.sc.drawForest())
}

const drawCellOnly = (c: JCell, cdm: CanvasDrawingMap) => {
  const color = '#010101'
  cdm.drawCellContainer(createICellContainer([c]), colors({ fillColor: color, strokeColor: color }))
}

const mostrarNum = (n: number, d: number = 2): string => {
  return n.toLocaleString('de-DE', {maximumFractionDigits: d, minimumFractionDigits: d})
}