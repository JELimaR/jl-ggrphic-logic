import * as fs from 'fs';
import * as path from 'path';
import JCell from "./BuildingModel/Voronoi/JCell";
import CellCost from "./GACServer/GACCultures/CellCost";
import MapController from "./MapController";
import chroma from 'chroma-js';
import { inDiscreteClasses } from "./BuildingModel/Geom/basicGeometryFunctions";

const mc = MapController.instance;
const rootPath = path.resolve(path.dirname('') + '/');

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

  mc.showerManager.sc.drawKoppen();

  // console.log(mc.showerManager.sc.drawHumidityProvinces())

  // cultures.forEach((cul: RegionMap, i: number) => {
  //   console.log(i, ':', cul.area.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2}), 'km2 - cells:',
  //   cul.cells.size, '- neigs cells', cul.getNeightboursCells().length)
  // })

  let printString: string = '';

  mc.naturalMap.diagram.forEachCell((cell: JCell) => {
    if (cell.info.isLand) {
      const cc = cell.info.cellClimate;
      printString += cell.id
      + '\t' + cc.lifeZone.id 
      + '\t' + `${cc.lifeZone.id < 10 ? 0 : ''}` + cc.lifeZone.id + ' - ' + cc.lifeZone.desc2
      + '\t' + cc.koppenSubType()
      + '\t' + Math.round(cc.tmax*100)/100  + '\t' +  Math.round(cc.tmin*100)/100
      + '\t' + Math.round(cc.tmed*100)/100

      + '\t' + Math.round(cc.precipSemCalido)  + '\t' +  Math.round(cc.precipSemFrio)
      + '\t' + Math.round(cc.annualPrecip)
      + '\t' + Math.round(cell.info.cellHeight.heightInMeters)
      + '\t' + Math.round(cell.areaSimple*10)/10 + '\n';
    }
  })
  fs.writeFileSync(rootPath + '/data.json', printString)
}