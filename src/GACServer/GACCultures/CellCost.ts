import { inRange } from "../../BuildingModel/Math/basicMathFunctions";
import RandomNumberGenerator from "../../BuildingModel/Math/RandomNumberGenerator";
import JCellClimate, { TLifeZoneObject, TKoppenSubTypeObject } from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";

const koppenCostList: TKoppenSubTypeObject<any> = {
  Af: '#0000FF', Am: '#0077FF', AwAs: '#46A9FA',
	BWh: '#FF0000', BWk: '#FF9695', BSh: '#F5A301', BSk: '#FFDB63',
	Csa: '#FFFF00', Csb: '#C6C700', Csc: '#969600',
	Cwa: '#96FF96', Cwb: '#63C764', Cwc: '#329633',
	Cfa: '#C6FF4E', Cfb: '#66FF33', Cfc: '#33C701',
	Dsa: '#FF00FF', Dsb: '#C600C7', Dsc: '#963295', Dsd: '#966495',
	Dwa: '#ABB1FF', Dwb: '#5A77DB', Dwc: '#4C51B5', Dwd: '#320087',
	Dfa: '#00FFFF', Dfb: '#38C7FF', Dfc: '#007E7D', Dfd: '#00455E',
	ET: '#B2B2B2', EF: '#686868',
}

const lifeZoneCostList: TLifeZoneObject<any> = {
  1: { id: 1, },
	2: { id: 2, },
	3: { id: 3, },
	4: { id: 4, },
	5: { id: 5, },
	6: { id: 6, },
	7: { id: 7, },
	8: { id: 8, },
	9: { id: 9, },
	10: { id: 10, },
	11: { id: 11, },
	12: { id: 12, },
	13: { id: 13, },
	14: { id: 14, },
	15: { id: 15, },
	16: { id: 16, },
	17: { id: 17, },
	18: { id: 18, },
	19: { id: 19, },
	20: { id: 20, },
	21: { id: 21, },
	22: { id: 22, },
	23: { id: 23, },
	24: { id: 24, },
	25: { id: 25, },
	26: { id: 26, },
	27: { id: 27, },
	28: { id: 28, },
	29: { id: 29, },
	30: { id: 30, },
	31: { id: 31, },
	32: { id: 32, },
	33: { id: 33, },
	34: { id: 34, },
	35: { id: 35, },
	36: { id: 36, },
	37: { id: 37, },
	38: { id: 38, },
}

export default class CellCost {
	static forInitCulture(cell: JCell): number {
    let out: number;
		const randFunc = RandomNumberGenerator.makeRandomFloat(cell.id);
    const cc = cell.info.cellClimate;
    if (cc.lifeZone.id === 356) {
      console.log(cell.id, cc.koppenSubType(), '-',
        Math.round(cc.tempMonthMax), Math.round(cc.tempMonthMin), Math.round(cc.tempMed)
      )
    }
		if (cell.info.heightType !== 'land')
			out = Infinity;
    else
		  out = 0.5 * this.precipCost(cell) + 0.5 * this.tempCost(cell, 15);
    
    return  0.95 * out  + 0.05 * randFunc();
	}

  static precipCost(cell: JCell): number {
    let out: number = 1.1 * cell.info.cellClimate.annualPrecip / JCellClimate.maxAnnualPrecip;
    out = (1 - inRange(out, 0, 1)) ** 3;
    return out;
  }
  
  static tempCost(cell: JCell, temp: number): number {
    let out: number = Math.abs(cell.info.cellClimate.tempMed - temp) / (65 - temp);
    out = inRange(out, 0, 1) ** 1.5;
    return out;
  }
}