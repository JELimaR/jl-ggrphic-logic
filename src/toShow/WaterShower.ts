
import * as JCellToDrawEntryFunctions from '../AbstractDrawing/JCellToDrawEntryFunctions';
import * as JEdgeToDrawEntryFunctions from '../AbstractDrawing/JEdgeToDrawEntryFunctions';

import Point, { IPoint } from '../BuildingModel/Geom/Point';
import NaturalMap from '../BuildingModel/NaturalMap';

import JVertex from '../BuildingModel/Voronoi/JVertex';
import chroma from 'chroma-js';
import Shower from './Shower';
import RiverMap from '../BuildingModel/MapContainerElements/Natural/RiverMap';
import FluxRouteMap from '../BuildingModel/MapContainerElements/Natural/FluxRouteMap';
import { IAPanzoom } from '../AbstractDrawing/APanzoom';

type TBackground = 'h' | 'l';


export default class WaterShower extends Shower {

	constructor(world: NaturalMap, area: number, SIZE: IPoint) {
		super(world, area, SIZE, /*folderSelected,*/ 'river');
	}

	drawRivers(background: TBackground, pz?: IAPanzoom): string {
    this.d.clear(pz);

		// fondo
		this.drawFondo(background);

		// rivers
		this.w.rivers.forEach((river: RiverMap) => {
			this.d.drawEdgeContainer(river, JEdgeToDrawEntryFunctions.fluxMedia())
		})
		this.d.drawMeridianAndParallels();
		return this.d.saveDrawFile(`${this.a}rivers`)
	}

	drawWaterRoutes(color: string | 'random', background: TBackground, pz?: IAPanzoom): string {
    this.d.clear(pz);
		// fondo
		this.drawFondo(background);

		// water routes
		this.w.fluxRoutes.forEach((fluxRoute: FluxRouteMap) => {
			color = (color == 'random') ? chroma.random().hex() : color;
			const points: Point[] = fluxRoute.vertices.map((vertex: JVertex) => vertex.point)
			this.d.draw(points, {
				fillColor: 'none',
				strokeColor: color,
				dashPattern: [1, 0]
			})
		})
		this.d.drawMeridianAndParallels();
		return this.d.saveDrawFile(`${this.a}fluxRoutes`)
	}

	private drawFondo(background: TBackground) {
		switch (background) {
			case 'h':
				this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.heighLand(1));
				break;
			default:
				this.d.drawCellContainer(this.w.diagram, JCellToDrawEntryFunctions.land(1));
		}
	}

	printRiverData() {
		this.printSeparator();
		console.log('total water route cant', this.w.fluxRoutes.size)
		console.log('total river cant', this.w.rivers.size)
	}
	printRiverDataLongers(minL: number) {
		this.printSeparator();
		const riverSorted: RiverMap[] = this.w.riverLengthSorted;
		let cant: number = 0;
		let curr: RiverMap = riverSorted[0];
		while (curr.length > minL && cant < riverSorted.length) {
			curr = riverSorted[cant]
			cant++;
		}
		cant--;
		console.log(`rivers longer than ${minL} km`, cant);

		const arr = [];
		for (let i = 0; i < cant; i++) {
			const rs: RiverMap = riverSorted[i];
			const rlength = rs.vertices.length;
			const ini: IPoint = rs.vertices[0].point.getInterface();
			const fin: IPoint = rs.vertices[rlength - 1].point.getInterface();
			arr.push({
				riverId: rs.id,
				len: Math.round(rs.length),
				verts: rs.vertices.length,
				ini: `${ini.x.toLocaleString('de-DE')};${ini.y.toLocaleString('de-DE')}`,
				fin: `${fin.x.toLocaleString('de-DE')};${fin.y.toLocaleString('de-DE')}`,
				desemb: rs.vertices[rlength - 1].info.vertexHeight.heightType
			})
		}
		console.table(arr)
	}

	printRiverDataShorters(maxL: number) {
		this.printSeparator();
		const riverSorted: RiverMap[] = this.w.riverLengthSorted;
		let cant: number = 0;
		let curr: RiverMap = riverSorted[0];
		while (curr.length > maxL && cant < riverSorted.length) {
			curr = riverSorted[cant]
			cant++;
		}
		console.log(`rivers shorter than ${maxL} km`, riverSorted.length - cant);

		const arr = [];
		for (let i = cant; i < riverSorted.length; i++) {
			const rs: RiverMap = riverSorted[i];
			const rlength = rs.vertices.length;
			const ini: IPoint = rs.vertices[0].point.getInterface();
			const fin: IPoint = rs.vertices[rlength - 1].point.getInterface();
			arr.push({
				riverId: rs.id,
				len: Math.round(100 * rs.length) / 100,
				verts: rs.vertices.length,
				ini: `${ini.x.toLocaleString('de-DE')};${ini.y.toLocaleString('de-DE')}`,
				fin: `${fin.x.toLocaleString('de-DE')};${fin.y.toLocaleString('de-DE')}`,
				desemb: rs.vertices[rlength - 1].info.vertexHeight.heightType
			})
		}
		console.table(arr)
	}
}