import { inRange } from "../../BuildingModel/Geom/basicGeometryFunctions";
import RandomNumberGenerator from "../../BuildingModel/Geom/RandomNumberGenerator";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";

export default class CellCost {
	static forInitCulture(cell: JCell): number {
    let out: number;
		const randFunc = RandomNumberGenerator.makeRandomFloat(cell.id)
		if (cell.info.cellHeight.heightType !== 'land')
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
    let out: number = Math.abs(cell.info.cellClimate.tmed - temp) / (65 - temp);
    out = inRange(out, 0, 1) ** 2;
    return out;
  }
}