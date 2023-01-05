
import JCell from "./BuildingModel/Voronoi/JCell";
import CellCost from "./GACServer/GACCultures/CellCost";
import MapController from "./MapController";
import chroma from 'chroma-js';
import { inDiscreteClasses, getArrayOfN, heightParamToMeters, inRange, getMedValue, prnNm } from './BuildingModel/Math/basicMathFunctions';
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
import { fluxParam, fishLevelParam, rainParam, fluxParam2, waterParamArr } from "./GACServer/GACNaturalRes/waterParamsCalc";
import NaturalResMapGenerator from "./GACServer/GACNaturalRes/NaturalResMapGenerator";
import { SEASONALCULFAMLIST, TSeasonalCulFamily } from "./BuildingModel/NaturalRes/SeasonalCul";
import { PERENNIALCULFAMLIST, TPerennialCulFamily } from "./BuildingModel/NaturalRes/PerennialCul";
import { FORECULFAMLIST, TForeCulFamily } from "./BuildingModel/NaturalRes/ForeCul";
import { GANFAMLIST, TGanFamily, TGanFamList } from "./BuildingModel/NaturalRes/Gan";
import JDiagram from "./BuildingModel/Voronoi/JDiagram";
import { AQUAFAMLIST, TAquaFamily } from "./BuildingModel/NaturalRes/Aqua";


const mc = MapController.instance;

let area: number = 0;
let sumValue = 0;
let landArea = 0;
const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
const colorScaleBW: chroma.Scale = chroma.scale();

export default (): void => {
  const nm: NaturalMap = mc.naturalMap;
  const cdm = mc.showerManager.st.d
  nm.diagram.forEachCell(c => landArea += c.info.heightType == 'land' ? c.area : 0)
  const rivers = nm.rivers;

  //-------------------------------------------------------------------------------
  const nrg = new NaturalResMapGenerator(nm.diagram);
  const natresData = nrg.generateData();

  // console.time('datos')
  // const datosSeasonal = nrg.seasonalCulValues();
  // const datosPerennial = nrg.perenniallCulValues();
  // const datosFore = nrg.foreCulValues();
  // const datosGan = nrg.ganValues();
  // console.timeEnd('datos')

  // nm.generateAGRInfo();


  const p: IPoint = { x: 89, y: 6 }
  const cell = nm.diagram.getCellFromPoint(p);
  //-------------------------------------------------------------------
  for (let elem in SEASONALCULFAMLIST) {
    let sfam = elem as TSeasonalCulFamily;
    console.log(sfam)
    if (
      // sfam == 'cer' ||
      // sfam == 'cerw' ||
      // sfam == 'hor' ||
      // sfam == 'leg' ||
      // sfam == 'sole' ||
      // sfam == 'tub' ||
      // sfam == 'azu' ||
      // sfam == 'tab' ||
      // sfam == 'fib' ||
      false
    ) {
      const x = (c: JCell) => {
        const s = natresData[c.id].isica.seasonalCul;
        return Math.max(...s[sfam])
      }
      drawSomething(cdm, sfam, x, nm.diagram)
    }
  }
  //-------------------------------------------------------------------
  for (let elem in PERENNIALCULFAMLIST) {
    let pfam = elem as TPerennialCulFamily;
    console.log(pfam)
    if (
      // pfam == 'vid' ||
      // pfam == 'frutrsb' ||
      // pfam == 'citr' ||
      // pfam == 'frut' ||
      // pfam == 'ffri' ||
      // pfam == 'fole' ||
      // pfam == 'beb' ||
      // pfam == 'esp' ||
      // pfam == 'medfarm' || 
      false
    ) {
      const x = (c: JCell) => {
        const p = natresData[c.id].isica.perennialcul;
        return p[pfam]
      }
      drawSomething(cdm, pfam, x, nm.diagram)
    }
  }
  //-------------------------------------------------------------------
  // let ffam: TForeCulFamily = 'wdesp1';
  // drawSomething(cdm, ffam, (c: JCell) => datosFore[c.id][ffam], nm.diagram)
  for (let elem in FORECULFAMLIST) {
    let ffam = elem as TForeCulFamily;
    console.log(ffam)
    if (
      // ffam == 'wdmed' ||
      // ffam == 'wdesp1' ||
      // ffam == 'wdesp2' ||
      false
    ) {
      const x = (c: JCell) => {
        const f = natresData[c.id].isica.fore;
        return f[ffam]
      }
      drawSomething(cdm, ffam, x, nm.diagram)
    }
  }
  //-------------------------------------------------------------------
  for (let elem in GANFAMLIST) {
    let gfam = elem as TGanFamily;
    console.log(gfam)
    if (
      // gfam == 'bob' ||
      // gfam == 'buf' ||
      // gfam == 'eq' ||
      // gfam == 'cam' ||
      // gfam == 'ove' ||
      // gfam == 'ave' ||
      // gfam == 'cer' ||
      // gfam == 'ins' ||
      // gfam == 'peq' ||
      false
    ) {
      const x = (c: JCell) => {
        const g = natresData[c.id].isica.gan;
        return g[gfam]
      }
      drawSomething(cdm, gfam, x, nm.diagram)
    }
  }
  //-------------------------------------------------------------------
  for (let elem in AQUAFAMLIST) {
    let afam = elem as TAquaFamily;
    console.log(afam)
    if (
      // afam == 'mara' ||
      // afam == 'marf' ||
      // afam == 'riva' ||
      // afam == 'rivf' ||
      // afam == 'wat' ||
      false
    ) {
      drawSomething(cdm, afam, (c: JCell) => natresData[c.id].isica.aqua[afam], nm.diagram)
    }
  }
  //-------------------------------------------------------------------
  const fp2 = (c: JCell) => {
    return waterParamArr(c, nm.diagram).fp.reduce((pr: number,cr: number) => pr+cr)/12;
  }
  drawSomething(cdm, 'fluxParam2', fp2, nm.diagram);

  const rp = (c: JCell) => {
    return waterParamArr(c, nm.diagram).rp.reduce((pr: number,cr: number) => pr+cr)/12;
  }
  drawSomething(cdm, 'rainParam', rp, nm.diagram);

  const wp = (c: JCell) => {
    return waterParamArr(c, nm.diagram).wp.reduce((pr: number,cr: number) => pr+cr)/12;
  }
  drawSomething(cdm, 'waterParam', wp, nm.diagram);
  //-------------------------------------------------------------------

  // console.log('\ndatos: cell')
  // const isicaString = JSON.stringify(natresData[cell.id].isica, null, 2);
  // console.log('--------isica---------\n', isicaString)
  // console.log('')

  // const climateString = JSON.stringify(cell.info.cellClimate.getInterface(), null, 2);
  // console.log('--------climate---------\n', climateString)
  // console.log('')

  let climSize = 0;
  let heightSize = 0;
  let isicaSize = 0;
  let isicaSeasonal = 0;
  nm.diagram.forEachCell((c: JCell) => {
    climSize += getSize(c.info.cellClimate.getInterface());
    heightSize += getSize(c.info.cellHeight.getInterface());
    isicaSize += getSize(natresData[c.id].isica);
    isicaSeasonal += getSize(natresData[c.id].isica.seasonalCul);
  })
  console.log('comparesize')
  console.log('\tclima:', prnNm(climSize, 0));
  console.log('\theigh:', prnNm(heightSize, 0));
  console.log('\tisica:', prnNm(isicaSize, 0));
  console.log('\tseaso:', prnNm(isicaSeasonal, 0));

  console.log('')

  // // estadisticasClimateAndRes();
  // // console.log(mc.showerManager.sc.drawForest())
}

const getSize = (ent: Object): number => {
  return Buffer.byteLength(JSON.stringify(ent, null, 2)) / 1024;
}

const drawCellOnly = (c: JCell, cdm: CanvasDrawingMap) => {
  const color = '#010101'
  cdm.drawCellContainer(createICellContainer([c]), colors({ fillColor: color, strokeColor: color }))
}

const drawSomething = (cdm: CanvasDrawingMap, cat: any, valFunc: (cell: JCell) => number, diag: JDiagram) => {
  area = 0
  sumValue = 0;
  cdm.clear()
  cdm.drawCellContainer(diag, (c: JCell) => {
    let color: string;
    if (c.info.isLand) {
      let val = 0;

      val = valFunc(c);

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
  console.log(cdm.saveDrawFile(`test${cat}`));
  console.log('area', prnNm(area), 'km2 -', prnNm(100 * area / landArea), '%')
  console.log(prnNm(sumValue))
}

