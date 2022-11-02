import RandomNumberGenerator from "../../BuildingModel/Geom/RandomNumberGenerator";
import JCellClimate from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";

export const calcCellCost = (cell: JCell): number => {
  const randFunc = Math.random// RandomNumberGenerator.makeRandomFloat(cell.id)
  if (cell.info.cellHeight.heightType !== 'land')
    return Infinity;
  return (1-cell.info.cellClimate.annualPrecip/JCellClimate.maxAnnual)*10 +
    Math.abs(cell.info.cellClimate.tmed - 10)/40*10 + randFunc();
}


