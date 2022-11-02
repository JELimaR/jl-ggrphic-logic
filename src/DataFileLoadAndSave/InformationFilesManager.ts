import * as fs from 'fs';
import { IPoint } from '../BuildingModel/Geom/Point';
import MapElement from '../BuildingModel/MapElement';
import { GRAN } from '../GACServer/constants';
import GridPoint, { IGridPointInfo } from '../GACServer/GACGrid/GridPoint';
import { TypeInformationKey } from '../BuildingModel/TypeInformationKey';
import { DATA_INFORMATION } from './dataInformationTypes';
import { LoaderDiagram } from '../BuildingModel/Voronoi/JDiagram';

// dividir esta clase
export default class InformationFilesManager {
  static _instance: InformationFilesManager;

  private _dirPath = '';

  private constructor() { /** */ }

  static get instance(): InformationFilesManager {
    if (!InformationFilesManager._instance) {
      this._instance = new InformationFilesManager();
    }
    return this._instance;
  }

  static configPath(path: string): void {
    this.instance._dirPath = path;
    fs.mkdirSync(this.instance._dirPath, { recursive: true });
  }

  static reset(): void {
    fs.rmdirSync(this._instance._dirPath, {recursive: true})
  }

  //
  loadDiagramValues(area: number | undefined): LoaderDiagram {
    if (this._dirPath === '') throw new Error('non configurated path');
    let out: LoaderDiagram = new LoaderDiagram([], [], []);
    try {
      const pathFile = `${this._dirPath}/${area}diagram.json`;
      const data = JSON.parse(fs.readFileSync(pathFile).toString());
      out = new LoaderDiagram(data.cells, data.edges, data.vertices);
    } catch (e) {
      /** */
    }
    return out;
  }
  saveDiagramValues(info: LoaderDiagram, area: number | undefined): void {
    fs.mkdirSync(`${this._dirPath}`, { recursive: true });
    const pathName = `${this._dirPath}/${area}diagram.json`;
    fs.writeFileSync(pathName, JSON.stringify(info));
  }

  /**
   * voronoi diagram subsites
   */
  loadSubSites(area: number | undefined): { p: IPoint, cid: number }[] {
    if (this._dirPath === '') throw new Error('non configurated path');
    let out: { p: IPoint, cid: number }[] = [];
    try {
      const pathFile = `${this._dirPath}/${area ? area : ''}secSites.json`;
      out = JSON.parse(fs.readFileSync(pathFile).toString());
    } catch (e) {
      /** */
    }
    return out;
  }
  saveSubSites(sites: { p: IPoint, cid: number }[], area: number | undefined): void {
    fs.mkdirSync(`${this._dirPath}`, { recursive: true });
    const pathFile = `${this._dirPath}/${area ? area : ''}secSites.json`;
    fs.writeFileSync(pathFile, JSON.stringify(sites));
  }

  /**
   * grid points
   */
  loadGridPoints(area: number | undefined): IGridPointInfo[][] {
    let out: IGridPointInfo[][] = [];
    try {
      const pathFile = `${this._dirPath}/${area ? area : ''}G${GRAN}_grid.json`;
      out = JSON.parse(fs.readFileSync(pathFile).toString());
    } catch (e) {
      /** */
    }
    return out;
  }

  saveGridPoints(gridPoints: GridPoint[][], area: number | undefined): void {
    const data: IGridPointInfo[][] = gridPoints.map((col: GridPoint[]) => {
      return col.map((gp: GridPoint) => gp.getInterface());
    })
    fs.mkdirSync(`${this._dirPath}`, { recursive: true });
    const pathFile = `${this._dirPath}/${area ? area : ''}G${GRAN}_grid.json`;
    fs.writeFileSync(pathFile, JSON.stringify(data));
  }

  /**
   * MapElement data
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadMapElementData<I, T extends MapElement<I>>(area: number | undefined, TYPE: TypeInformationKey): I[] {
    let out: I[] = [];
    const subFolder: string = DATA_INFORMATION[TYPE].subFolder.join('/');
    const file: string = DATA_INFORMATION[TYPE].file;
    try {
      const pathFile = `${this._dirPath}/${subFolder}/${area ? area : ''}${file}.json`;
      out = JSON.parse(fs.readFileSync(pathFile).toString());
    } catch (e) {
      /** */
    }
    return out;
  }

  saveMapElementData<I, T extends MapElement<I>>(infoArr: T[], area: number | undefined, TYPE: TypeInformationKey): void {
    const subFolder: string = DATA_INFORMATION[TYPE].subFolder.join('/');
    const file: string = DATA_INFORMATION[TYPE].file;
    fs.mkdirSync(`${this._dirPath}/${subFolder}`, { recursive: true });
    const pathFile = `${this._dirPath}/${subFolder}/${area ? area : ''}${file}.json`;

    const data: I[] = [];
    infoArr.forEach((infoT: T) => {
      data.push(infoT.getInterface());
    })
    fs.writeFileSync(pathFile, JSON.stringify(data));
  }

  /**
   * gird information
   */
  loadGridData<I>(TYPE: TypeInformationKey): I[][] {
    let out: I[][] = [];
    const subFolder: string = DATA_INFORMATION[TYPE].subFolder.join('/');
    const file: string = DATA_INFORMATION[TYPE].file;
    try {
      const pathFile = `${this._dirPath}/${subFolder}/G${GRAN}${file}.json`;
      out = JSON.parse(fs.readFileSync(pathFile).toString());
    } catch (e) {
      /** */
    }
    return out;
  }

  saveGridData<I>(data: I[][], TYPE: TypeInformationKey): void {
    const subFolder: string = DATA_INFORMATION[TYPE].subFolder.join('/');
    const file: string = DATA_INFORMATION[TYPE].file;
    fs.mkdirSync(`${this._dirPath}/${subFolder}`, { recursive: true });
    const pathFile = `${this._dirPath}/${subFolder}/G${GRAN}${file}.json`;
    fs.writeFileSync(pathFile, JSON.stringify(data));
  }
}


