import { IAPanzoom } from "../../AbstractDrawing/APanzoom";
import { inRange } from "../../BuildingModel/Geom/basicGeometryFunctions";
import MapController from "../../MapController";
import Menu, { IMenuItem } from "../Menu";
import temporalMenuScreen from "./temporalMenuScreen";

interface IStateGenericMapShowerScreen {
  pz: IAPanzoom;
}

const monthArrObj = {
  '12': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  '6': [1, 3, 5, 7, 9, 11],
  '4': [1, 4, 7, 10],
}


const mc = MapController.instance;

const getGenericMapShowerMenu = (state: IStateGenericMapShowerScreen): Menu => {
  const options: IMenuItem[] = [
    {
      name: 'panzoom',
      func: () => {
        console.log()
        let value: number;
        value = Menu.read('zoom: ');
        state.pz.zoom = inRange(Math.round(value), 0, 20);
        value = Menu.read('x: ');
        state.pz.center.x = inRange(value, -179, 179);
        value = Menu.read('y: ')
        state.pz.center.y = inRange(value, -89, 89)
        console.log(state.pz);
        console.log();
      }
    },
    /**
     * height map
     */
    // sh.drawIslands();
    // sh.printMaxAndMinCellsHeight();
    {
      name: 'land',
      func: () => {
        mc.showerManager.sh.drawLand(state.pz)
      }
    },
    {
      name: 'heightLand',
      func: () => {
        mc.showerManager.sh.drawHeight(state.pz)
      }
    },

    /**
     * climate map
     */
    {
      name: 'temp',
      func: () => {
        let tms = temporalMenuScreen();
        if (tms.option === 0) {
          console.log('none')
          return;
        }
        const sc = mc.showerManager.sc;
        if (tms.selected === 'a') {
          sc.drawTempMedia(state.pz);
        } else if (typeof tms.selected === 'number') {
          sc.drawTempMonth(tms.selected, state.pz)
        } else {
          monthArrObj[tms.selected].forEach((month: number) => {
            sc.drawTempMonth(month);
          })
        }
      }
    }
    // const monthCant: keyof typeof monthArrObj = 4;
    // monthArrObj[monthCant].forEach((month: number)=> {
    //    sc.drawTempMonth(month);
    // })
    // sc.drawTempMedia()
    // sc.drawPrecipMonth(monthArrObj[monthCant]);
    // sc.drawPrecipMedia()

    // sc.drawKoppen();
    // sc.printKoppenData();

    /**
     * LIFE ZONES
     */
    // sc.drawAltitudinalBelts();
    // sc.drawHumidityProvinces();
    // sc.drawLifeZones();
    // sc.printLifeZonesData();

    /**
     * river map
     */
    // sw.drawRivers('h');
    // sw.drawWaterRoutes('#000000', 'l')
    // sw.printRiverData();
    // sw.printRiverDataLongers(3000);
    // sw.printRiverDataShorters(15);
  ];
  return new Menu(`Generic`, options);
}

export default (ent: any): IStateGenericMapShowerScreen => {
  const state: IStateGenericMapShowerScreen = {
    pz: { zoom: 0, center: { x: 0, y: 0 } }
  };
  let finished = false;

  const menu = getGenericMapShowerMenu(state);

  while (!finished) {
    menu.run();
    finished = true;
  }

  return state;
}