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
import chroma from 'chroma-js';
import CellCost from './GACServer/GACCultures/CellCost';
import Menu, { IMenuItem } from './frontApp/Menu';
import initialScreens, {IStateInitialScreen} from './frontApp/Screens/initialScreens';
import mainScreen from './frontApp/Screens/mainScreen';
import devTest from './devTest';

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
	'Maletia80', // 18
];
const folderSelected: string = azgaarFolder[10];
console.log('folder:', folderSelected);

const tam = 3600;
const SIZE: IPoint = { x: tam, y: tam / 2 };
const AREA = 12100;

// testExec(SIZE, rootPath, folderSelected);
/*
mc.showerManager.sh.printMaxAndMinCellsHeight();

const isl = mc.naturalMap.islands[2];
const pfr = cdm.getPanzoomForReg(isl);
mc.showerManager.sh.drawHeight();
mc.showerManager.sc.drawKoppen();
mc.showerManager.sc.drawLifeZones();
mc.showerManager.sc.drawPrecipMedia();

// ********* 

// let arr: number[] = [];

// arr[8] = 11;
// arr[26] = 17;
// arr[38] = 5;
// arr.forEach((e: number, i: number) => console.log('index:', i, '- value:', e))
// arr.sort((a: number, b: number) => a-b);
// arr.forEach((e: number, i: number) => console.log('index:', i, '- value:', e))
// console.log(arr[5])
*/

const manual: number = 0;
const test: number = 1;

const customInitState: IStateInitialScreen = {
  area: AREA,
  folder: folderSelected,
  ok: true,
}

const app = async () => {

  const initState = (manual === 0) ? customInitState : initialScreens();
  console.log(initState)
  if (initState.ok) {
    mc.selectAzgaarW(initState.folder);
    mc.createNaturalWorld(initState.area, SIZE)

    if (test === 1) {
      devTest();
    } else {
      const mainState = mainScreen(initState);
      console.log(mainState)
    }
    
  }

}

app();

console.timeEnd('all')