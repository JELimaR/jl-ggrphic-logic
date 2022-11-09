import { inRange } from "../../BuildingModel/Geom/basicGeometryFunctions";
import RandomNumberGenerator from "../../BuildingModel/Geom/RandomNumberGenerator";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";

const precipCost = (cell: JCell): number => {
  let out: number = cell.info.cellClimate.annualPrecip / JCellClimate.maxAnnualPrecip;
  out = (1 - inRange(1.4 * out, 0, 1)) ** 2;
  return out;
}

const tempCost = (cell: JCell, temp: number): number => {
  let out: number = Math.abs(cell.info.cellClimate.tmed - temp) / 65;
  out = inRange(out, 0, 1) ** 2;
  return out;
}

export default class CellCost {
	static forInitCulture(cell: JCell): number {
		const randFunc = RandomNumberGenerator.makeRandomFloat(cell.id)
		if (cell.info.cellHeight.heightType !== 'land')
			return Infinity;
		return precipCost(cell) * 0.75 + tempCost(cell, 15) * 0.2 + randFunc() * 0.05;
	}
}