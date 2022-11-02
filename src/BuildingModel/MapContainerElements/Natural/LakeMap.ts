
import { TypeInformationKey } from "../../TypeInformationKey";
import RegionMap, { IRegionMapInfo } from "../RegionMap";
import JDiagram from "../../Voronoi/JDiagram";

export interface ILakeMapInfo extends IRegionMapInfo {
	id: number;
}

export default class LakeMap extends RegionMap {
	private _id: number;
	constructor(id: number, diag: JDiagram, info?: ILakeMapInfo,) {
		super(diag, info);
		this._id = id
	}

	get id(): number { return this._id }

	getInterface(): ILakeMapInfo {
		return {
			id: this._id,
			...super.getInterface()
		}
	}

	static getTypeInformationKey(): TypeInformationKey {
		return 'lakes';
	}
}