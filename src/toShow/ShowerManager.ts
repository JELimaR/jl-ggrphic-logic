import { IPoint } from "../BuildingModel/Geom/Point";
import NaturalMap from "../BuildingModel/NaturalMap";
import ClimateShower from "./ClimateShower";
import HeightShower from "./HeightShower";
import TestShower from "./TestShower";
import WaterShower from "./WaterShower";


export default class ShowerManager {
	private _sc: ClimateShower | undefined;
	private _sh: HeightShower | undefined;
	private _sw: WaterShower | undefined;
	private _st: TestShower | undefined;

	private _w: NaturalMap;
	private _a: number;
  private _z: IPoint;
	// private _f: string;

	constructor(world: NaturalMap, area: number, SIZE: IPoint/*, folderSelected: string*/) {
		this._w = world;
		this._a = area;
    this._z = SIZE;
		// this._f = folderSelected;
	}

	get sc(): ClimateShower {
		if (!this._sc)
			this._sc = new ClimateShower(this._w, this._a, this._z);
		return this._sc;
	}

	get sh(): HeightShower {
		if (!this._sh)
			this._sh = new HeightShower(this._w, this._a, this._z);
		return this._sh;
	}

	get sw(): WaterShower {
		if (!this._sw)
			this._sw = new WaterShower(this._w, this._a, this._z);
		return this._sw;
	}

	get st(): TestShower {
		if (!this._st)
			this._st = new TestShower(this._w, this._a, this._z);
		return this._st;
	}
	
}