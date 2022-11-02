import NaturalMap from "../BuildingModel/NaturalMap";
import Shower from "./Shower";
import * as JCellToDrawEntryFunctions from '../AbstractDrawing/JCellToDrawEntryFunctions';

import JCell from "../BuildingModel/Voronoi/JCell";
import { lifeZonesList, TKoppenSubType, TKoppenType } from "../BuildingModel/Voronoi/CellInformation/JCellClimate";
import { IPoint } from "../BuildingModel/Geom/Point";
import { inRange } from "../BuildingModel/Geom/basicGeometryFunctions";

export default class ClimateShower extends Shower {

  constructor(world: NaturalMap, area: number, SIZE: IPoint/*, folderSelected: string*/) {
    super(world, area, SIZE, /*folderSelected,*/ 'climate');
  }

  drawKoppen(zoom = 0, center?: IPoint): string {
    this.d.clear(zoom, center);
    this.d.drawBackground()
    this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.koppen(1))
    this.d.drawMeridianAndParallels();
    return this.d.saveDrawFile(`${this.a}koppen`);
  }

  drawLifeZones(zoom = 0, center?: IPoint): string {
    this.d.clear(zoom, center);
    this.d.drawBackground('#F2F2F2A2') // copiar a los otros
    this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.lifeZones(1))
    this.d.drawMeridianAndParallels();
    return this.d.saveDrawFile(`${this.a}lifeZones`);
  }

  drawPrecipMonth(month: number, zoom = 0, center?: IPoint): string {
    // monthArr.forEach((month: number) => {
    this.d.clear(zoom, center);
    // month = inRange(month, 1, 12);
    this.d.drawBackground()
    this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.precipitationMonth(month))
    this.d.drawMeridianAndParallels();
    return this.d.saveDrawFile(`${this.a}precip${(month < 10 ? '0' : '')}${month}`);
    // })
  }

  drawPrecipMedia(zoom = 0, center?: IPoint): string {
    this.d.clear(zoom, center);
    this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.precipitationMedia())
    this.d.drawMeridianAndParallels();
    return this.d.saveDrawFile(`${this.a}precipMedia`);
  }

  drawTempMonth(month: number, zoom = 0, center?: IPoint): string {

    this.d.clear(zoom, center);
    month = inRange(month, 1, 12);
    this.d.drawBackground()
    this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.temperatureMonth(month))
    this.d.drawMeridianAndParallels();
    return this.d.saveDrawFile(`${this.a}temp${(month < 10 ? '0' : '')}${month}`);

  }

  drawTempMedia(zoom = 0, center?: IPoint): string {
    this.d.clear(zoom, center);
    this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.temperatureMedia())
    this.d.drawMeridianAndParallels();
    return this.d.saveDrawFile(`${this.a}tempMedia`);
  }

  drawAltitudinalBelts(zoom = 0, center?: IPoint): string {
    this.d.clear(zoom, center);
    this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.altitudinalBelts(1))
    this.d.drawMeridianAndParallels();
    return this.d.saveDrawFile(`${this.a}altitudinalBelts`)
  }

  drawHumidityProvinces(zoom = 0, center?: IPoint): string {
    this.d.clear(zoom, center);
    this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.humidityProvinces(1))
    this.d.drawMeridianAndParallels();
    return this.d.saveDrawFile(`${this.a}humidityProvinces`)
  }

  printKoppenBasicData(): void {
    this.printSeparator();

    const koppenBasicArea = { A: 0, B: 0, C: 0, D: 0, E: 0 }
    let totalArea = 0;
    // let annualMax: number = 0;

    this.w.diagram.forEachCell((cell: JCell) => {
      const ccl = cell.info.cellClimate;
      if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
        // koppenArea[ccl.koppenSubType() as TKoppenSubType] += cell.areaSimple;
        koppenBasicArea[ccl.koppenType() as TKoppenType] += cell.areaSimple;
        totalArea += cell.areaSimple;
        // if (annualMax < ccl.annualPrecip) annualMax = ccl.annualPrecip;
      }
    })
    // const subTypeArr = [];
    // for (const p in koppenArea) {
    // 	subTypeArr.push({
    // 		type: p,
    // 		area: koppenArea[p as TKoppenSubType].toLocaleString('de-DE'),
    // 		areaPer: (koppenArea[p as TKoppenSubType] / totalArea * 100).toLocaleString('de-DE')
    // 	});
    // }

    const typeArr = [];
    for (const p in koppenBasicArea) {
      typeArr.push({
        type: p,
        area: koppenBasicArea[p as TKoppenType].toLocaleString('de-DE'),
        areaPer: (koppenBasicArea[p as TKoppenType] / totalArea * 100).toLocaleString('de-DE')
      });
    }

    // console.table(subTypeArr);
    // this.printSeparator();
    console.table(typeArr);
  }

  printSubKoppenData(): void { // separar
    this.printSeparator();

    const koppenArea = {
      Af: 0, AwAs: 0, Am: 0,
      BWh: 0, BWk: 0, BSh: 0, BSk: 0,
      Csa: 0, Csb: 0, Csc: 0,
      Cwa: 0, Cwb: 0, Cwc: 0,
      Cfa: 0, Cfb: 0, Cfc: 0,
      Dsa: 0, Dsb: 0, Dsc: 0, Dsd: 0,
      Dwa: 0, Dwb: 0, Dwc: 0, Dwd: 0,
      Dfa: 0, Dfb: 0, Dfc: 0, Dfd: 0,
      ET: 0, EF: 0,
    }

    let totalArea = 0;

    this.w.diagram.forEachCell((cell: JCell) => {
      const ccl = cell.info.cellClimate;
      if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
        koppenArea[ccl.koppenSubType() as TKoppenSubType] += cell.areaSimple;
        totalArea += cell.areaSimple;
      }
    })
    const subTypeArr = [];
    for (const p in koppenArea) {
      subTypeArr.push({
        type: p,
        area: koppenArea[p as TKoppenSubType].toLocaleString('de-DE'),
        areaPer: (koppenArea[p as TKoppenSubType] / totalArea * 100).toLocaleString('de-DE')
      });
    }


    console.table(subTypeArr);
  }

  printLifeZonesData(): void {
    this.printSeparator();
    const lifeZonesArea = {
      1: 0, 2: 0, 3: 0, 4: 0,
      5: 0, 6: 0, 7: 0, 8: 0,
      9: 0, 10: 0, 11: 0, 12: 0,
      13: 0, 14: 0, 15: 0, 16: 0,
      17: 0, 18: 0, 19: 0, 20: 0,
      21: 0, 22: 0, 23: 0, 24: 0,
      25: 0, 26: 0, 27: 0, 28: 0,
      29: 0, 30: 0, 31: 0, 32: 0,
      33: 0, 34: 0, 35: 0, 36: 0,
      37: 0, 38: 0,
    }

    this.w.diagram.forEachCell((cell: JCell) => {
      const ccl = cell.info.cellClimate;
      if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
        lifeZonesArea[ccl.lifeZone.id as keyof typeof lifeZonesArea] += cell.areaSimple;
      }
    })

    const arr = [];
    for (let z = 1; z <= 38; z++) {
      const i = z as keyof typeof lifeZonesList;
      arr.push({
        id: i,
        desc: lifeZonesList[i].desc,
        area: lifeZonesArea[i].toLocaleString('de-DE')
      })
    }
    console.table(arr);

  }

}