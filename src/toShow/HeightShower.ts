import NaturalMap from "../BuildingModel/NaturalMap";
import Shower from "./Shower";
import * as JCellToDrawEntryFunctions from '../AbstractDrawing/JCellToDrawEntryFunctions';

import JCell from "../BuildingModel/Voronoi/JCell";
import { IPoint } from "../BuildingModel/Math/Point";
import { IAPanzoom } from "../AbstractDrawing/APanzoom";

export default class HeightShower extends Shower {

	constructor(world: NaturalMap, area: number, SIZE: IPoint) {
		super(world, area, SIZE, /*folderSelected,*/ 'height');
	}

  drawLand(pz?: IAPanzoom): string {
    this.d.clear(pz);
		this.d.drawBackground()
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.land(1))
		this.d.drawMeridianAndParallels();
		return this.d.saveDrawFile(`${this.a}land`);
	}

	drawHeight(pz?: IAPanzoom): string {
    this.d.clear(pz);
		this.d.drawBackground()
		this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.heighLand(1))
		this.d.drawMeridianAndParallels();
		return this.d.saveDrawFile(`${this.a}heightLand`);
	}

	drawIslands(pz?: IAPanzoom): void {
    this.d.clear(pz);
		this.d.drawArr(this.w.islands, 1);
		this.d.drawMeridianAndParallels();
		this.d.saveDrawFile(`${this.a}islands`)
	}

	printMaxAndMinCellsHeight(): void {
		this.printSeparator();
		console.log('cells cant', this.w.diagram.cells.size) // sacar de aca
		let areaLand = 0, cantLand = 0;
		let maxAreaLand: JCell = this.w.diagram.cells.get(3255)!;
		let minAreaLand: JCell = this.w.diagram.cells.get(3255)!;
		this.w.diagram.forEachCell((c: JCell) => {
			if (c.info.isLand) {
				areaLand += c.areaSimple;
				cantLand++;
				if (c.areaSimple < minAreaLand.areaSimple) minAreaLand = c;
				if (c.areaSimple > maxAreaLand.areaSimple) maxAreaLand = c;
			}
		})
		console.log('area total', Shower.nmb2str(areaLand), 'km2');
		console.log('area prom', Shower.nmb2str(areaLand / cantLand), 'km2');
		console.log('area max', Shower.nmb2str(maxAreaLand.area), 'km2');

		console.log('area min', Shower.nmb2str(minAreaLand.area), 'km2');
	}
}