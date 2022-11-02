/**
 * ver nombre si es CultureMap o InitCultureMap
 */
import { TypeInformationKey } from "../../TypeInformationKey";
import JDiagram from "../../Voronoi/JDiagram";
import RegionMap, { IRegionMapInfo } from "../RegionMap";

export type TypeInitCulture = {}

export interface ICultureMapInfo extends IRegionMapInfo {
  id: string;
}

export default class CultureMap extends RegionMap {

  private _id: string;
  constructor(id: string, diag: JDiagram, info?: ICultureMapInfo) {
    super(diag, info);
    this._id = id;
  }

  getInterface(): ICultureMapInfo {
    return {
      ...super.getInterface(),
      id: this._id
    }
  }

  static getTypeInformationKey(): TypeInformationKey {
    return 'initCulture';
  }
}