console.time('all');
const newDate = new Date();
console.log(newDate.toLocaleTimeString());

import { colors, heigh, heighLand, koppen, land, precipitationMedia } from './AbstractDrawing/JCellToDrawEntryFunctions';
import Point, { IPoint } from './BuildingModel/Geom/Point';
import MapController from './MapController';
import testExec from './testExec';
import * as path from 'path';
import { createICellContainer, createIVertexContainer } from './BuildingModel/MapContainerElements/containerInterfaces';
import RegionMap from './BuildingModel/MapContainerElements/RegionMap';
import JCell from './BuildingModel/Voronoi/JCell';
import RandomNumberGenerator from './BuildingModel/Geom/RandomNumberGenerator';
import PriorityQueue from './BuildingModel/Geom/PriorityQueue';
import JCellClimate from './BuildingModel/Voronoi/CellInformation/JCellClimate';
import InitCultureMapGenerator from './GACServer/GACCultures/InitCultureMapGenerator';

const mc = MapController.instance;

console.log(mc.getAzgaarWOptions());

const rootPath = path.resolve(path.dirname('') + '/');
console.log('root:', rootPath);
// const dirs: string[] = AzgaarReaderData.getDirectories(rootPath + `/AzgaarData/`);
// console.log(dirs)

const azgaarFolder: string[] = [
  'Latiyia30', // 0
  'Boreland30', // 1
  'Bakhoga40', // 2
  'Betia40', // 3
  'Vilesland40', // 4
  'Braia100', // 5
  'Toia100', // 6
  'Morvar100', // 7
  'Mont100', // 8
  'Itri100', // 9
  'Mones10', // 10
  'Civaland1', // 11
  'Shauland30', // 12
  'Lenzkirch50', // 13
  'Migny90', // 14
  'Zia20', // 15
  'Deneia60', // 16
  'Ouvyia70', // 17
];
const folderSelected: string = azgaarFolder[10];
console.log('folder:', folderSelected);

const tam = 3600;
const SIZE: IPoint = { x: tam, y: tam / 2 };
const AREA = 12100;

// testExec(SIZE, rootPath, folderSelected);

mc.selectAzgaarW(folderSelected);
mc.createNaturalWorld(AREA, SIZE);

mc.showerManager.sh.printMaxAndMinCellsHeight();

const cdm = mc.cdm;

const isl = mc.naturalMap.islands[2];
const pfr = cdm.getPanzoomForReg(isl);
mc.showerManager.sh.drawHeight();
mc.showerManager.sc.drawLifeZones();

cdm.clear(pfr.zoom, pfr.center);
cdm.clear()
cdm.drawBackground();
cdm.drawCellContainer(mc.naturalMap.diagram, land())

/********* */

const icmg = new InitCultureMapGenerator(mc.naturalMap.diagram);
const cultures = icmg.generate(mc.naturalMap);

cdm.drawArr(cultures, 1)
cdm.drawCellContainer(createICellContainer(icmg._initCells), colors({
  fillColor: '#000015',
  strokeColor: '#000015'
}))
cdm.drawMeridianAndParallels()
console.log(cdm.saveDrawFile(`tessdrt${newDate.getMilliseconds()}`))
cultures.forEach((cul: RegionMap, i: number) => {
  console.log(i, ':', cul.area.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2}), 'km2 - cells:',
  cul.cells.size, '- neigs cells', cul.getNeightboursCells().length)
})

/*
CREAR LineMap
const pts: Point[] = [
  new Point(132,92),
  new Point(132, 75),
  new Point(131,60),
]

cdm.clear()
cdm.drawBackground()
cdm.drawCellContainer(mc.naturalMap.diagram, heighLand())
cdm.drawMeridianAndParallels();
cdm.draw(pts, {fillColor: 'none', strokeColor: '#000000'});
console.log(cdm.saveDrawFile('tessdrt'))
*/

// let arr: number[] = [];

// arr[8] = 11;
// arr[26] = 17;
// arr[38] = 5;
// arr.forEach((e: number, i: number) => console.log('index:', i, '- value:', e))
// arr.sort((a: number, b: number) => a-b);
// arr.forEach((e: number, i: number) => console.log('index:', i, '- value:', e))
// console.log(arr[5])

console.timeEnd('all')