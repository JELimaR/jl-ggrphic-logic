import RandomNumberGenerator from "../../BuildingModel/Geom/RandomNumberGenerator";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";


export default class CellCost {
	static forInitCulture(cell: JCell): number {
		const randFunc = RandomNumberGenerator.makeRandomFloat(cell.id)
		if (cell.info.cellHeight.heightType !== 'land')
			return Infinity;
		return (1 - cell.info.cellClimate.annualPrecip / JCellClimate.maxAnnual) * 0.7 +
			Math.abs(cell.info.cellClimate.tmed - 15) / 65 * 0.3 + 0.01 * randFunc();
	}
}