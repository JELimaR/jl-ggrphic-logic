console.time('all');
const newDate = new Date();
console.log(newDate.toLocaleTimeString());

import { IPoint } from './BuildingModel/Math/Point';
import MapController from './MapController';
import * as path from 'path';
import initialScreens, { IStateInitialScreen } from './frontApp/Screens/initialScreens';
import mainScreen from './frontApp/Screens/mainScreen';
import devTest from './devTest';

const mc = MapController.instance;

console.log(mc.getAzgaarWOptions());

const rootPath = path.resolve(path.dirname('') + '/');
console.log('root:', rootPath);
// const dirs: string[] = AzgaarReaderData.getDirectories(rootPath + `/AzgaarData/`);
// console.log(dirs)

interface IInitStateOption {
  folder: string;
  area: number;
}

const listAzgaarFolders: IInitStateOption[] = [
  { folder: 'Mones10', area: 12100 },       // 0
  { folder: 'Zia20', area: 8100 },          // 1
  { folder: 'Vilesland40', area: 4100 },    // 2
  { folder: 'Maletia80', area: 2100 },      // 3
];

const selection: IInitStateOption = listAzgaarFolders[3];

const tam = 3600;
const SIZE: IPoint = { x: tam, y: tam / 2 };

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
  ...selection,
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