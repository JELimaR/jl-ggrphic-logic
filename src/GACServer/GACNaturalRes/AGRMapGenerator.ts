import { getArrayOfN, inDiscreteClasses, inRange } from "../../BuildingModel/Math/basicMathFunctions";
import NaturalMap from "../../BuildingModel/NaturalMap";
import JCellAGR, { IJCellAGRInfo, TCul, TGan } from "../../BuildingModel/Voronoi/CellInformation/JCellAGR";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";
import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import JVertexFlux from "../../BuildingModel/Voronoi/VertexInformation/JVertexFlux";
import InformationFilesManager from "../../DataFileLoadAndSave/InformationFilesManager";
import MapGenerator from "../MapGenerator";
import { IAGRData } from "./AGRAuxFunctions";
import { fluxParam, rainParam, tempMedParam, tempVarParam } from "./AGRParamsCalc";
import { isForest, getCulInfoArr, getGanInfo } from './AGRAuxFunctions';

export default class AGRMapGenerator extends MapGenerator<void> {

  constructor(d: JDiagram) {
    super(d);
  }

  generate()/*: Map<number, JCellAGR>*/ {
    const loadFunc = InformationFilesManager.instance.loadMapElementData;
    const saveFunc = InformationFilesManager.instance.saveMapElementData;
    console.log('calculate and setting AGRMap');
    console.time(`set agr info`);
    // let out: Map<number, JCellAGR> = new Map<number, JCellAGR>();
    let infoArr = loadFunc<IJCellAGRInfo, JCellAGR>(this.diagram.secAreaProm, JCellAGR.getTypeInformationKey());
    const isLoaded = infoArr.length != 0;
    if (!isLoaded) {
      infoArr = this.generateData();
    }

    this.diagram.forEachCell((c: JCell) => {
      c.info.setAGRtInfo(infoArr[c.id])
    })

    if (!isLoaded) {
      const agrArr: JCellAGR[] = [...this.diagram.cells.values()].map((c: JCell) => c.info.cellAGR);
      // un no guardamos por que se va a cambiar todo lo AGR por Res
      // saveFunc<IJCellAGRInfo, JCellAGR>(agrArr, this.diagram.secAreaProm, JCellAGR.getTypeInformationKey())
    }

    console.timeEnd(`set agr info`);

    // return out;
  }
  generateData(): IJCellAGRInfo[] {
    let MAXwp = this.preCalcMaxWaterParam();
    console.log('MAX', MAXwp)
    // set data 
    const out: IJCellAGRInfo[] = [];
    this.diagram.forEachCell((c: JCell) => {
      // si es permafrost, no calculo el resto:
      if (this.isCellPermafrost(c)) {
        out[c.id] = {
          id: c.id,
          ganArr: -1,//getArrayOfN(12,-1) as TGan[],
          culArr: getArrayOfN(12,-1) as TCul[],
          f: 0,
          p: 1,
        };
      } else {
        const cc = c.info.cellClimate;
        const agrData: IAGRData = {
          id: c.id,
          h: c.info.height,
          waterCategoryArr: [],
          rainFallCategoryArr: [],
          medRainFallCategory: 0,
          tempMedCategoryArr: cc.tempMonth.map(tm => Math.round(tm*100)/100),//[],
          tempVarCategoryArr: cc.tempMaxArr.map((M: number, i: number) => {
            return Math.round(Math.abs(M - cc.tempMinArr[i])*100)/100
          })//[],
        }
        getArrayOfN(12, 0).forEach((_, i: number) => {
          const rp = rainParam(c, i + 1);
          const fp = fluxParam(c, i + 1, this.diagram);
          // const tmp = tempMedParam(c, i + 1);
          // const tvp = tempVarParam(c, i + 1);
  
          const wp = (0.5 * fp + 0.5 * rp) / MAXwp;
  
          agrData.waterCategoryArr.push(20 * inDiscreteClasses(wp, 20));
          agrData.rainFallCategoryArr.push(20 * inDiscreteClasses(rp, 20));
          agrData.medRainFallCategory += rp / 12;
          // agrData.tempMedCategoryArr.push(12 * inDiscreteClasses(tmp, 12));
          // agrData.tempVarCategoryArr.push(3 * inDiscreteClasses(tvp, 3));
        })
        agrData.medRainFallCategory = 20 * inDiscreteClasses(agrData.medRainFallCategory, 20)
        
        // getInfoFromData  **********************************************************************
        out[c.id] = {
          id: c.id,
          ganArr: getGanInfo(agrData),
          culArr: getCulInfoArr(agrData),
          f: isForest(agrData) ? 1 : 0,
          p: 0,
        };
      }
    })

    return out;
  }

  private preCalcMaxWaterParam(): number {
    let out = 0;
    this.diagram.forEachCell((c: JCell) => {
      if (c.info.isLand) {
        let cellMaxValue = 0;
        for (let m = 1; m <= 12; m++) {
          const rp = rainParam(c, m);
          const fp = fluxParam(c, m, this.diagram);
          const wp = 0.5 * fp + 0.5 * rp;
          cellMaxValue = cellMaxValue < wp ? wp : cellMaxValue
        }
        if (cellMaxValue > out) out = cellMaxValue;
      }
    })
    return out;
  }

  private isCellPermafrost(cell: JCell) {
    return cell.info.cellClimate.tempMonthMax < -2;
  }

  // private isCellForest(cell: JCell) {
  //   const cc = cell.info.cellClimate;

  //   const kpn = cc.koppenSubType();
  //   const lz = cc.lifeZone.id;
  //   return (
  //     (
  //       lz > 35 ||
  //       (lz > 27 && lz < 31) ||
  //       (lz > 20 && lz < 24) ||
  //       (lz > 13 && lz < 17) ||
  //       (lz > 5 && lz < 11)
  //     )
  //     &&
  //     (
  //       kpn == 'Af' ||
  //       kpn == 'Cfa' || kpn == 'Cfb' || kpn == 'Cfc' ||
  //       kpn == 'Dfa' || kpn == 'Dfb' || kpn == 'Dfc' || kpn == 'Dfd'
  //     )
  //   );
  // }

}