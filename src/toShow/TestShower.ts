import { IPoint } from "../BuildingModel/Math/Point";
import NaturalMap from "../BuildingModel/NaturalMap";
import Shower from "./Shower";


export default class TestShower extends Shower {
	constructor(world: NaturalMap, area: number, SIZE: IPoint) {
		super(world, area, SIZE, /*folderSelected,*/ 'test');
	}
}