import * as fs from 'fs';
import * as path from 'path';

import * as JCellToDrawEntryFunctions from './AbstractDrawing/JCellToDrawEntryFunctions';
import * as JEdgeToDrawEntryFunctions from './AbstractDrawing/JEdgeToDrawEntryFunctions';
import CanvasDrawingMap from './CanvasDrawing/CanvasDrawingMap'

import Point, { IPoint } from './BuildingModel/Geom/Point';
import NaturalMap from './BuildingModel/NaturalMap';
import RegionMap from './BuildingModel/MapContainerElements/RegionMap';
import JCell from './BuildingModel/Voronoi/JCell';
import JVertex from './BuildingModel/Voronoi/JVertex';
import chroma from 'chroma-js';

import WaterShower from './toShow/WaterShower';
import HeightShower from './toShow/HeightShower';
import LineMap from './BuildingModel/MapContainerElements/LineMap';
import JEdge from './BuildingModel/Voronoi/JEdge';
import TestShower from './toShow/TestShower';
import ShowerManager from './toShow/ShowerManager';
import IslandMap from './BuildingModel/MapContainerElements/Natural/IslandMap';
import DrainageBasinMap from './BuildingModel/MapContainerElements/Natural/DrainageBasinMap';
import RandomNumberGenerator from './BuildingModel/Geom/RandomNumberGenerator';
import JDiagram, { LoaderDiagram } from './BuildingModel/Voronoi/JDiagram';
import RiverMap from './BuildingModel/MapContainerElements/Natural/RiverMap';
import NaturalMapCreatorServer from './GACServer/NaturalMapCreatorServer';
import folderGACConfig from './DataFileLoadAndSave/folderGACConfig';

const testExec = (SIZE: IPoint, rootPath: string, folderSelected: string): void => {
  console.log('exec')

  folderGACConfig(rootPath, folderSelected);
  CanvasDrawingMap.configPath(rootPath + `/img/${folderSelected}`);

  let colorScale: chroma.Scale;
  let color: string;

  const cdm: CanvasDrawingMap = new CanvasDrawingMap(SIZE, ``); // borrar, se usa el de stest
  cdm.setZoomValue(0);
  cdm.setCenterpan(new Point(0, 0));
  // navigate
  console.log('zoom: ', cdm.zoomValue)
  console.log('center: ', cdm.getCenterPan())

  console.log('draw buff');
  console.log(cdm.getPointsBuffDrawLimits());
  console.log('center buff');
  console.log(cdm.getPointsBuffCenterLimits());

  const AREA = 6100; // 810
  const nmcs = new NaturalMapCreatorServer();
  const naturalMap: NaturalMap = new NaturalMap(AREA, nmcs);

  const monthArrObj = {
    12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    6: [1, 3, 5, 7, 9, 11],
    4: [1, 4, 7, 10],
  }
  const monthCant: keyof typeof monthArrObj = 4;
  /* SHOWERS */
  const showerManager = new ShowerManager(naturalMap, AREA, SIZE);

  const sh = showerManager.sh;
  const sc = showerManager.sc;
  const sw = showerManager.sw;

  const stest = showerManager.st;

  /**
   * height map
   */
  // sh.drawHeight();
  // sh.drawIslands();
  sh.printMaxAndMinCellsHeight();

  /**
   * climate map
   */
  monthArrObj[monthCant].forEach((month: number)=> {
    sc.drawTempMonth(month);
  })
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
  sc.drawLifeZones();
  // sc.printLifeZonesData();

  /**
   * river map
   */
  // sw.drawRivers('h');
  // sw.drawWaterRoutes('#000000', 'l')
  // sw.printRiverData();
  // sw.printRiverDataLongers(3000);
  // sw.printRiverDataShorters(15);

  console.time('test');

  cdm.drawBackground();
  cdm.drawCellContainer(naturalMap.diagram, JCellToDrawEntryFunctions.heigh(1));
  cdm.drawMeridianAndParallels();
  cdm.saveDrawFile('asdfsadf');
  // fs.writeFileSync(rootPath + '/data.json', JSON.stringify(cdm.getBuffer(), null, 0))


  console.timeEnd('test');
}

export default testExec;