import * as path from 'path';
import { IAPanzoom } from './AbstractDrawing/APanzoom';
import * as JCellToDrawEntryFunctions from './AbstractDrawing/JCellToDrawEntryFunctions';
import { IPoint } from './BuildingModel/Geom/Point';
import { ICellContainer, IEdgeContainer, IVertexContainer } from './BuildingModel/MapContainerElements/containerInterfaces';
import NaturalMap from './BuildingModel/NaturalMap';
import CanvasDrawingMap from './CanvasDrawing/CanvasDrawingMap';
import AzgaarReaderData from './DataFileLoadAndSave/AzgaarReaderData';
import folderGACConfig from './DataFileLoadAndSave/folderGACConfig';
import InformationFilesManager from './DataFileLoadAndSave/InformationFilesManager';
import NaturalMapCreatorServer from './GACServer/NaturalMapCreatorServer';
import ShowerManager from './toShow/ShowerManager';

const rootPath = path.resolve(path.dirname('') + '/');
console.log(rootPath);

// ver donde van
type TypeElementDrawing =
  | { type: 'cell'; elem: ICellContainer }
  | { type: 'edge'; elem: IEdgeContainer }
  | { type: 'vertex'; elem: IVertexContainer };

interface IElementsDrawingEntry {
  element: TypeElementDrawing;
  parameters: keyof typeof JCellToDrawEntryFunctions; // segun el tipo tiene distintos parametros de entrada!!!!!!!
}

export default class MapController {
  private static _instance: MapController;

  static get instance(): MapController {
    if (!MapController._instance) {
      this._instance = new MapController();
    }
    return this._instance;
  }

  static get staticFolder(): string {
    return rootPath + `/public/`;
  }

  /********************************************************************************* */
  // private _config: IMapControllerConfig = initEmptyConfig;
  private _folderSelected = 'none';
  private _showerManager: ShowerManager | undefined; // cambiar para que sean showers o ver como se usa
  private _cdm: CanvasDrawingMap | undefined;
  private _naturalMap: NaturalMap | undefined;
  private constructor() {
    /** */
  }

  // azgaar folder selection
  getAzgaarWOptions(): string[] {
    return AzgaarReaderData.getDirectories(rootPath + `/public/AzgaarData/`);
  }
  selectAzgaarW(folderSelected: string): void {
    if (this.getAzgaarWOptions().includes(folderSelected)) {
      this._folderSelected = folderSelected;

      folderGACConfig(rootPath, folderSelected);
      CanvasDrawingMap.configPath(rootPath + `/public/img/${folderSelected}`);
      console.log('folder selected', this._folderSelected);
    } else {
      throw new Error(`no exist folder: ${folderSelected}`);
    }
  }

  createNaturalWorld(AREA: number, SIZE: IPoint): void {
    if (this._folderSelected !== 'none') {
      const nmcs = new NaturalMapCreatorServer();
      this._naturalMap = new NaturalMap(AREA, nmcs);
      this._cdm = new CanvasDrawingMap(SIZE, ``);
      this._showerManager = new ShowerManager(this._naturalMap, AREA, SIZE);
    } else {
      throw new Error(`no existe configuración`);
    }
  }
  //
  /*private*/ get showerManager(): ShowerManager {
    if (this._showerManager) return this._showerManager;
    else throw new Error(`no existe shower manager`);
  }
  /*private*/ get cdm(): CanvasDrawingMap {
    if (this._cdm) return this._cdm;
    else throw new Error(`no existe Drawing Map`);
  }

  /*private*/ get naturalMap(): NaturalMap {
    if (this._naturalMap) return this._naturalMap;
    else
      throw new Error(
        `no existe natural map aún. Se debe ejecutar 'createNaturalWorld'.`,
      );
  }

  //
  drawingArr(arr: IElementsDrawingEntry[]): void {
    arr.forEach((entry: IElementsDrawingEntry) => {
      console.log(entry.element.type);
    });
  }

  /**no es la idea */
  drawHeightMap(pz?: IAPanzoom): string {
    return this.showerManager.sh.drawHeight(pz);
  }

  drawKoppenMap(pz?: IAPanzoom): string {
    return this.showerManager.sc.drawKoppen(pz);
  }

  /** */

  /**
   * BORRAR CARPETA img/folderSelected
   */
  resetImages(): void {
    CanvasDrawingMap.reset();
  }

  /**
   * BORRAR CARPETA data/folderSelected
   */
  resetBuildingData(): void {
    InformationFilesManager.reset();
  }
}
