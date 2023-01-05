import { TForeCulFamList } from "../../NaturalRes/ForeCul";
import { TGanFamList } from "../../NaturalRes/Gan";
import { TPerennialCulFamList } from "../../NaturalRes/PerennialCul";
import { TSeasonalCulFamList } from "../../NaturalRes/SeasonalCul";
import { TypeInformationKey } from "../../TypeInformationKey";
import JCell from "../JCell";
import JCellGeneric, { IJCellGenericInfo } from "./JCellGeneric";

export interface IJCellNaturalResInfo extends IJCellGenericInfo {
  isica: {
    seasonalCul: TSeasonalCulFamList<number[]>;
    perennialcul: TPerennialCulFamList<number>;
    gan: TGanFamList<number>;
    fore: TForeCulFamList<number>;
    aqua: any;
  },
  isicb: {

  }
}

export default class JCellNaturalRes extends JCellGeneric {

  private _seasonalCul: TSeasonalCulFamList<number[]>;
  private _perennialcul: TPerennialCulFamList<number>;
  private _gan: TGanFamList<number>;
  private _fore: TForeCulFamList<number>;
  private _aqua: any;

  constructor(c: JCell, info: IJCellNaturalResInfo) {
    super(c);

    this._seasonalCul = info.isica.seasonalCul;
    this._perennialcul = info.isica.perennialcul;
    this._gan = info.isica.gan;
    this._fore = info.isica.fore;
    this._aqua = info.isica.aqua;

  }

  getInterface(): IJCellNaturalResInfo {
    return {
      ...super.getInterface(),
      isica: {
        seasonalCul: this._seasonalCul,
        perennialcul: this._perennialcul,
        gan: this._gan,
        fore: this._fore,
        aqua: this._aqua,
      },
      isicb: {

      }      
    }
  }

  static getTypeInformationKey(): TypeInformationKey {
    return 'cellNatRes';
  }
}

