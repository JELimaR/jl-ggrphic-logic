import { inRange } from "../../BuildingModel/Geom/basicGeometryFunctions";
import Menu, { IMenuItem } from "../Menu";

export interface IStateTemporalMenuSccreen {
  selected: 'a' | '4' | '6' | '12' | number;
  option: number;
}

const getTemporalMenu = (state: IStateTemporalMenuSccreen): Menu => {
  const options: IMenuItem[] = [
    {
      name: 'annual',
      func: ()=> state.selected = 'a'
    },
    {
      name: 'm-4 (1-4-7-10)',
      func: ()=> state.selected = '4'
    },
    {
      name: 'm-6 (1-3-5-7-9-11)',
      func: ()=> state.selected = '6'
    },
    {
      name: 'm-12',
      func: ()=> state.selected = '12'
    },
    {
      name: 'spec month',
      func: ()=> {
        console.log()
        const value = Menu.read('spec month: ')
        state.selected = inRange(Math.round(value), 1, 12)
      }
    },
  ];

  return new Menu('temporal selection', options, true);
}


export default (): IStateTemporalMenuSccreen => {
  const state: IStateTemporalMenuSccreen = { selected: 'a', option: -1 };

  const temporalMenu = getTemporalMenu(state);
  state.option = temporalMenu.run();

  return state;
}

