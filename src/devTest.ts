import JCell from "./BuildingModel/Voronoi/JCell";
import CellCost from "./GACServer/GACCultures/CellCost";
import MapController from "./MapController";
import chroma from 'chroma-js';
import { inDiscreteClasses } from "./BuildingModel/Geom/basicGeometryFunctions";

const mc = MapController.instance;

export default (): void => {
  const cdm = mc.cdm;

  cdm.clear()
  cdm.drawBackground('#FFFFFF');
  const colorScale: chroma.Scale = chroma.scale('Spectral').domain([1, 0]);
  cdm.drawCellContainer(mc.naturalMap.diagram, (c: JCell) => {
    let color: string = '#FFFFFF';
    if (c.info.isLand) {
      const val = inDiscreteClasses(CellCost.forInitCulture(c), 20);
      color = colorScale(val).hex();
    }
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
  console.log(cdm.saveDrawFile(`forInitCulture`))

  // console.log(mc.showerManager.sc.drawHumidityProvinces())

  // cultures.forEach((cul: RegionMap, i: number) => {
  //   console.log(i, ':', cul.area.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2}), 'km2 - cells:',
  //   cul.cells.size, '- neigs cells', cul.getNeightboursCells().length)
  // })
}