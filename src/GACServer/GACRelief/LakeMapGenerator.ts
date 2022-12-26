
import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import InformationFilesManager from '../../DataFileLoadAndSave/InformationFilesManager';
import JCell from "../../BuildingModel/Voronoi/JCell";
import MapGenerator from "../MapGenerator";
import LakeMap, { ILakeMapInfo } from "../../BuildingModel/MapContainerElements/Natural/LakeMap";

export default class LakeMapGenerator extends MapGenerator<LakeMap[]> {
	constructor(d: JDiagram) {
		super(d);
	}

	generate(): LakeMap[] {
		const dim = InformationFilesManager.instance;

		let out: LakeMap[] = [];

		console.log('calculate and setting lake')
		console.time(`set lakes`);

		const lakeInfoArr: ILakeMapInfo[] = dim.loadMapElementData<ILakeMapInfo, LakeMap>(this.diagram.secAreaProm, LakeMap.getTypeInformationKey());
		if (lakeInfoArr.length > 0) {
			lakeInfoArr.forEach((ili: ILakeMapInfo, i: number) => {
				out.push(
					new LakeMap(i, this.diagram, ili)
				);
			})
		} else {
			out = this.generateLakeList();
		}
		// guardar info

		if (lakeInfoArr.length === 0) {
			// dim.saveMapElementData(out, this.diagram.secAreaProm, LakeMap.getTypeInformationKey());
		}
		console.timeEnd(`set lakes`);
		return out;
	}

	private generateLakeList(): LakeMap[] {

		const out: LakeMap[] = [];
		const lista: Map<number, JCell> = new Map<number, JCell>();
		this.diagram.forEachCell((c: JCell) => {
			if (c.info.heightType === 'lake') lista.set(c.id, c);
		})

		let currentId = -1;
		while (lista.size > 0) {
			currentId++;
			const cell: JCell = lista.entries().next().value[1];
			const newLake: LakeMap = new LakeMap(currentId, this.diagram);

			const nqeue: Map<number, JCell> = new Map<number, JCell>();
			nqeue.set(cell.id, cell)

			console.log('lake:', currentId);
			let times = 0;
			while (nqeue.size > 0 && times < this.diagram.cells.size) {
				times++;
				const neigh: JCell = nqeue.entries().next().value[1];
				nqeue.delete(neigh.id);
				lista.delete(neigh.id);
				neigh.mark();
				newLake.addCell(neigh);
				// neigh.info.lakeId = newLake.id; // nuevo

				this.diagram.getCellNeighbours(neigh).forEach((nnn: JCell) => {
					if (nnn.info.heightType === 'lake' && !nnn.isMarked() && !nqeue.has(nnn.id)) {
						nqeue.set(nnn.id, nnn);
					}
				})
				// if (newLake.cells.size % 10000 == 0) console.log('lake:', currentId, `hay ${newLake.cells.size}`)
			}

			if (nqeue.size > 0)
				throw new Error(`se supero el numero de cells: ${this.diagram.cells.size} en generateLakeList`)
			console.log('area:', newLake.area.toLocaleString('de-DE'));
			console.timeLog(`set lakes`);
			out.push(newLake);
		}
		// ordenar
		// console.log(`sorting lake`)
		// out.sort((a: LA, b: lakeMap) => { return b.area - a.area });

		this.diagram.dismarkAllCells();

		return out;
	}

}