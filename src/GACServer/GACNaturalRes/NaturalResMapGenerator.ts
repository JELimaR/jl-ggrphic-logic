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
import { fluxParam, rainParam } from "./WaterParamsCalc";
import { isForest, getCulInfoArr, getGanInfo } from './AGRAuxFunctions';
import { culMonthlyValue, getCulMonthCellParams, SeasonalCulFamily, SEASONALCULFAMLIST } from "./SeasonalCulFunctions";

export default class NaturalResMapGenerator extends MapGenerator<void> {

  constructor(d: JDiagram) {
    super(d);
  }

  generate(): any[] {
    const loadFunc = InformationFilesManager.instance.loadMapElementData;
    const saveFunc = InformationFilesManager.instance.saveMapElementData;
    console.log('calculate and setting NaturalResMap');
    console.time(`set natres info`);

    let infoArr = loadFunc<IJCellAGRInfo, JCellAGR>(this.diagram.secAreaProm, JCellAGR.getTypeInformationKey());
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
      // saveFunc<IJCellAGRInfo, JCellAGR>(agrArr, this.diagram.secAreaProm, JCellAGR.getTypeInformationKey())
    }

    console.timeEnd(`set natres info`);

    return infoArr;
  }
  generateData(): any[] {
    let MAXwp = this.preCalcMaxWaterParam();
    console.log('MAX', MAXwp)
    // set data 
    const out: any[] = [];
    this.diagram.forEachCell((c: JCell) => {
      
    })

    return out;
  }

  seasonalCulValues(): {[key in SeasonalCulFamily]: number[]}[] {
    let out: {[key in SeasonalCulFamily]?: number[]}[] = [];
    this.diagram.forEachCell((cell: JCell) => {
      const monthCellParamArr = getCulMonthCellParams(cell, this.diagram)
      let sal = {};
      for (let elem in SEASONALCULFAMLIST) {
        let arr: number[];
        if (cell.info.isForest || cell.info.isPermafrost) {
          arr = getArrayOfN(12, 0);
        } else {
          arr =  culMonthlyValue(monthCellParamArr, SEASONALCULFAMLIST[elem as SeasonalCulFamily]);
        }
        sal = {
          ...sal,
          [elem]: arr
        };
      }
      out[cell.id] = sal;
    })
    return out as {[key in SeasonalCulFamily]: number[]}[];
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

}