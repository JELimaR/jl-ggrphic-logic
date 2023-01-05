import { getArrayOfN, inDiscreteClasses, inRange } from "../../BuildingModel/Math/basicMathFunctions";
import NaturalMap from "../../BuildingModel/NaturalMap";
import JCellAGR, { IJCellAGRInfo, TCul, TGan } from "../../BuildingModel/Voronoi/CellInformation/JCellAGR";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";
import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import JVertexFlux from "../../BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import InformationFilesManager from "../../DataFileLoadAndSave/InformationFilesManager";
import MapGenerator from "../MapGenerator";
import { fluxParam, rainParam } from "./waterParamsCalc";
import { SEASONALCULFAMLIST, TSeasonalCulFamily, TSeasonalCulFamList } from "../../BuildingModel/NaturalRes/SeasonalCul";
import { PERENNIALCULFAMLIST, TPerennialCulFamily, TPerennialCulFamList } from "../../BuildingModel/NaturalRes/PerennialCul";
import { FORECULFAMLIST, TForeCulFamily, TForeCulFamList } from "../../BuildingModel/NaturalRes/ForeCul";
import { GANFAMLIST, TGanFamily, TGanFamList } from "../../BuildingModel/NaturalRes/Gan";
import JCellNaturalRes, { IJCellNaturalResInfo } from "../../BuildingModel/Voronoi/CellInformation/JCellNaturalRes";
import { JCellISICAParams } from "./JCellISICAParams";
import { aquaParamsEval, foreCulParamsEval, ganParamsEval, perennialCulParamsEval, seasonalCulParamsEval } from "./ISICAEvals";
import { AQUAFAMLIST, TAquaFamily, TAquaFamList } from "../../BuildingModel/NaturalRes/Aqua";

export default class NaturalResMapGenerator extends MapGenerator<void> {

  constructor(d: JDiagram) {
    super(d);
  }

  generate(): IJCellNaturalResInfo[] {
    const loadFunc = InformationFilesManager.instance.loadMapElementData;
    const saveFunc = InformationFilesManager.instance.saveMapElementData;
    console.log('calculate and setting NaturalResMap');
    console.time(`set natres info`);

    let infoArr = loadFunc<IJCellNaturalResInfo, JCellNaturalRes>(this.diagram.secAreaProm, JCellNaturalRes.getTypeInformationKey());
    const isLoaded = infoArr.length != 0;
    if (!isLoaded) {
      infoArr = this.generateData();
    }

    // this.diagram.forEachCell((c: JCell) => {
    //   c.info.setAGRtInfo(infoArr[c.id])
    // })

    if (!isLoaded) {
      // const agrArr: JCellAGR[] = [...this.diagram.cells.values()].map((c: JCell) => c.info.cellAGR);
      // un no guardamos por que se va a cambiar todo lo AGR por Res
      // saveFunc<IJCellNaturalResInfo, JCellNaturalRes>(agrArr, this.diagram.secAreaProm, JCellAGR.getTypeInformationKey())
    }

    console.timeEnd(`set natres info`);

    return infoArr;
  }
  generateData(): IJCellNaturalResInfo[] {
    console.log('calc seccion A y B de ISIC')
    console.time('seccion A y B de ISIC')
    // let MAXwp = this.preCalcMaxWaterParam();
    // console.log('MAX', MAXwp)

    const out: IJCellNaturalResInfo[] = [];

    this.diagram.forEachCell((c: JCell) => {
      const cinfo: IJCellNaturalResInfo = {
        id: c.id,
        isica: {
          seasonalCul: getEmptySeasonalCulList(),
          perennialcul: getEmptyPerennialCulList(),
          fore: getEmptyForeCulList(),
          gan: getEmptyGanList(),
          aqua: getEmptyAquaList(),
        },
        isicb: {}
      }

      const cellISICAParams = new JCellISICAParams(c, this.diagram);
      // SeasonalCulList
      for (let elem in SEASONALCULFAMLIST) {
        const e = elem as TSeasonalCulFamily
        cinfo.isica.seasonalCul[e] = seasonalCulParamsEval(cellISICAParams, SEASONALCULFAMLIST[e]);
      }
      // PerennialCulList
      for (let elem in PERENNIALCULFAMLIST) {
        const e = elem as TPerennialCulFamily;
        cinfo.isica.perennialcul[e] = perennialCulParamsEval(cellISICAParams, PERENNIALCULFAMLIST[e])
      }
      // ForeCulList
      for (let elem in FORECULFAMLIST) {
        const e = elem as TForeCulFamily;
        cinfo.isica.fore[e] = foreCulParamsEval(cellISICAParams, FORECULFAMLIST[e])
      }
      // GanList
      for (let elem in GANFAMLIST) {
        const e = elem as TGanFamily;
        cinfo.isica.gan[e] = ganParamsEval(cellISICAParams, GANFAMLIST[e])
      }
      // AquaList
      for (let elem in AQUAFAMLIST) {
        const e = elem as TAquaFamily;
        cinfo.isica.aqua[e] = aquaParamsEval(cellISICAParams, AQUAFAMLIST[e])
      }


      out.push(cinfo);
    })

    console.timeEnd('seccion A y B de ISIC');

    return out;
  }

  // private preCalcMaxWaterParam(): number {
  //   let out = 0;
  //   this.diagram.forEachCell((c: JCell) => {
  //     if (c.info.isLand) {
  //       let cellMaxValue = 0;
  //       for (let m = 1; m <= 12; m++) {
  //         const rp = rainParam(c, m);
  //         const fp = fluxParam(c, m, this.diagram);
  //         const wp = 0.5 * fp + 0.5 * rp;
  //         cellMaxValue = cellMaxValue < wp ? wp : cellMaxValue
  //       }
  //       if (cellMaxValue > out) out = cellMaxValue;
  //     }
  //   })
  //   return out;
  // }

}

const getEmptySeasonalCulList = (): TSeasonalCulFamList<number[]> => {
  return {
    cer: getArrayOfN(12,0),
    cerw: getArrayOfN(12,0),
    hor: getArrayOfN(12,0),
    leg: getArrayOfN(12,0),
    sole: getArrayOfN(12,0),
    tub: getArrayOfN(12,0),
    azu: getArrayOfN(12,0),
    tab: getArrayOfN(12,0),
    fib: getArrayOfN(12,0),
  }
}

const getEmptyPerennialCulList = (): TPerennialCulFamList<number> => {
  return {
    vid: 0,
    frutrsb: 0,
    citr: 0,
    frut: 0,
    ffri: 0,
    fole: 0,
    beb: 0,
    esp: 0,
    medfarm: 0,
  }
}

const getEmptyForeCulList = (): TForeCulFamList<number> => {
  return {
    wdesp1: 0,
    wdmed: 0,
    wdesp2: 0,
  }
}

const getEmptyGanList = (): TGanFamList<number> => {
  return {
    bob: 0,
    buf: 0,
    eq: 0,
    cam: 0,
    ove: 0,
    ave: 0,
    cer: 0,
    ins: 0,
    peq: 0,
  }
}

const getEmptyAquaList = (): TAquaFamList<number> => {
  return {
    marf: 0,
    rivf: 0,
    mara: 0,
    riva: 0,
    wat: 0,
  }
}