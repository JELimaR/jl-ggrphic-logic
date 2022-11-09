import devTest from "../../devTest";
import MapController from "../../MapController";
import Menu, { IMenuItem } from "../Menu";
import genericMapShowerScreen from "./genericMapShowerScreen";
import { IStateInitialScreen } from "./initialScreens";
import temporalMenuScreen from "./temporalMenuScreen";

interface IStateMainScreen {
  initState: IStateInitialScreen;
}

const mc = MapController.instance;

const getMainMenu = (name: string): Menu => {
  const options: IMenuItem[] = [
    {
      name: 'some',
      func: ()=>{console.log('some')}
    },
    {
      name: 'test',
      func: ()=>{
        devTest();
      }
    },
    {
      name: 'genericMapsShowers',
      func: ()=>{
        const out = genericMapShowerScreen('l');
        console.log(out)
      }
    }
  ];
  return new Menu(`Main - ${name}`, options);
}

export default (initState: IStateInitialScreen): IStateMainScreen => {
  const state: IStateMainScreen = {initState};
  let finished = false;

  const menu = getMainMenu(state.initState.folder);

  while (!finished) {
    menu.run();
    finished = true;
  }

  return state;
}