import MapController from "../../MapController";
import Menu, { IMenuItem } from "../Menu";

export interface IStateInitialScreen {
  area: number;
  folder: string;
  ok: boolean;
}

const mc = MapController.instance;
const folders: string[] = mc.getAzgaarWOptions();
const areaList: number[] = [12100, 8100, 4100, 2100, 945];

const getAzgaarWOptionsMenu = (state: IStateInitialScreen): Menu => {
  const azgaarWOpts: IMenuItem[] = [];

  folders.forEach((folder: string) => {
    azgaarWOpts.push({
      name: folder,
      func: () => {
        // mc.selectAzgaarW(folder)
        state.folder = folder;
      }
    })
  })

  const name = `-------Select folder-------`;
  return new Menu(name, azgaarWOpts, true);
}

const getAreaSelectionMenu = (state: IStateInitialScreen): Menu => {
  const options: IMenuItem[] = [];

  areaList.forEach((a: number) => {
    options.push({
      name: `${a}`,
      func: () => {
        state.area = a;
      }
    })
  })

  const name = `-------Select Area-------`;
  return new Menu(name, options, true);
}

export default (): IStateInitialScreen => {
  const state = {area: -1, folder: '', ok: false};
  let runOut1 = 1, runOut2 = 1;
  let finished = false;

  const azgaarWOptsMenu: Menu = getAzgaarWOptionsMenu(state);
  const areaSelectionMenu: Menu = getAreaSelectionMenu(state);
  
  while (!finished) {
    if (state.folder === '')
      runOut1 = azgaarWOptsMenu.run();
    if (state.area == -1 && runOut1 !== 0)
      runOut2 = areaSelectionMenu.run();
    
    if (runOut2 === 0) state.folder = '';
    
    state.ok = state.area !== -1 && state.folder !== '';
    finished = state.ok || runOut1 == 0;
  }

  return state;
}