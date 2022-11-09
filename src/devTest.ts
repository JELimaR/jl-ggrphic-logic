import JCell from "./BuildingModel/Voronoi/JCell";
import CellCost from "./GACServer/GACCultures/CellCost";
import MapController from "./MapController";
import chroma from 'chroma-js';

const mc = MapController.instance;

export default (): void => {
  const cdm = mc.cdm;

  cdm.clear()
  cdm.drawBackground();
  const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
  cdm.drawCellContainer(mc.naturalMap.diagram, (c: JCell) => {
    let color: string = '#45454545';
    if (c.info.isLand) 
      color = colorScale(CellCost.forInitCulture(c)).alpha(0.7).hex();
    return {
      fillColor: color,
      strokeColor: color,
    }
  })

  // const icmg = new InitCultureMapGenerator(mc.naturalMap.diagram);
  // const cultures = icmg.generate(mc.naturalMap);

  // cdm.drawArr(cultures, 0.4)
  // cdm.drawCellContainer(createICellContainer(icmg._initCells), colors({
  //   fillColor: '#000015',
  //   strokeColor: '#000015'
  // }))

  cdm.drawMeridianAndParallels()
  console.log(cdm.saveDrawFile(`tessdrt`)) 

  // cultures.forEach((cul: RegionMap, i: number) => {
  //   console.log(i, ':', cul.area.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2}), 'km2 - cells:',
  //   cul.cells.size, '- neigs cells', cul.getNeightboursCells().length)
  // })
}