import { TypeInformationKey } from "../../TypeInformationKey";
import JCell from "../JCell";
import JCellGeneric, { IJCellGenericInfo } from "./JCellGeneric";

export interface IJCellNaturalResInfo extends IJCellGenericInfo {

}

export default class JCellNaturalRes extends JCellGeneric {

  constructor(c: JCell, info: IJCellNaturalResInfo) {
    super(c);

  }

  getInterface(): IJCellGenericInfo {
    return {
      ...super.getInterface(),
    }
  }

  static getTypeInformationKey(): TypeInformationKey {
    return 'cellNatRes';
  }
}

