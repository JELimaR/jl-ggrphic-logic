import InformationFilesManager from "../../DataFileLoadAndSave/InformationFilesManager";
import Grid from "../GACGrid/Grid";
import MapGenerator from "../MapGenerator";
import JCellClimate, { IJCellClimateInfo, IMaxPrecipValues } from "../../BuildingModel/Voronoi/CellInformation/JCellClimate";
import JCell from "../../BuildingModel/Voronoi/JCell";
import JDiagram from "../../BuildingModel/Voronoi/JDiagram";
import JVertex from "../../BuildingModel/Voronoi/JVertex";
import { IJVertexClimateInfo } from "../../BuildingModel/Voronoi/VertexInformation/JVertexClimate";
import PrecipGrid, { IPrecipData } from "./PrecipGrid";
import PressureGrid from "./PressureGrid";
import TempGrid from "./TempGrid";
import { getArrayOfN } from "../../BuildingModel/Math/basicMathFunctions";


export default class ClimateMapGenerator extends MapGenerator<void> {
	private _grid: Grid;
	constructor(d: JDiagram, grid: Grid) {
		super(d);
		this._grid = grid;
	}

	generate(): void {
		const ifm = InformationFilesManager.instance;

		let climateData: IJCellClimateInfo[] = ifm.loadMapElementData<IJCellClimateInfo, JCellClimate>(this.diagram.secAreaProm, JCellClimate.getTypeInformationKey());
		const isLoaded: boolean = climateData.length !== 0;
		if (!isLoaded) {
			climateData = this.generateClimateData(this._grid);
		}

		this.diagram.forEachCell((cell: JCell) => {
			if (!climateData[cell.id]) throw new Error(`no hay datos para ${cell.id}`)
			const cinfo = climateData[cell.id];
			cell.info.setClimatetInfo(cinfo);
		})

		if (!isLoaded) {
			console.log('smooth climate data')
			this.smoothData();
			const climateArr: JCellClimate[] = [...this.diagram.cells.values()].map((cell: JCell) => cell.info.cellClimate)
			ifm.saveMapElementData<IJCellClimateInfo, JCellClimate>(climateArr, this.diagram.secAreaProm, JCellClimate.getTypeInformationKey());
		}

		this.setVertexInfo();

		let maxAnnualPrecip = 0;
		this.diagram.forEachCell((cell: JCell) => {
			const ccl = cell.info.cellClimate;
			if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
				if (maxAnnualPrecip < ccl.annualPrecip) maxAnnualPrecip = ccl.annualPrecip;
			}
		})
    let maxPrecipValues: IMaxPrecipValues = {
      annual: -1,
      monthly: getArrayOfN(12,0)
    }
    this.diagram.forEachCell((cell: JCell) => {
			const ccl = cell.info.cellClimate;
			if (ccl.koppenSubType() !== 'O' && ccl.koppenType() !== 'O') {
				if (maxPrecipValues.annual < ccl.annualPrecip) {
					maxPrecipValues.annual = ccl.annualPrecip;
				}
        ccl.precipMonth.forEach((p: number, i:number) => {
          if (maxPrecipValues.monthly[i] < p)	maxPrecipValues.monthly[i] = p;
        })
			}
		})
		JCellClimate.maxPrecipValues = maxPrecipValues;

	}

	private generateClimateData(grid: Grid): IJCellClimateInfo[] {

		const tempGrid = new TempGrid(grid);
		const pressGrid = new PressureGrid(grid, tempGrid);
		const precipGrid: PrecipGrid = new PrecipGrid(grid, pressGrid, tempGrid)

		const climateData: IJCellClimateInfo[] = [];

		this.diagram.forEachCell((c: JCell) => {
			const gp = grid.getGridPoint(c.center);
			const precData: IPrecipData = precipGrid.getPointInfo(gp.point);
			const temps = [...tempGrid.getPointInfo(gp.point).tempMonth];
			const chf = c.info.isLand ? 6.5 * c.info.heightInMeters / 1000 : 0;
			const ghf = gp.cell.info.isLand ? 6.5 * gp.cell.info.heightInMeters / 1000 : 0;
			climateData[c.id] = {
				id: c.id,
				precipMonth: [...precData.precip],
				tempMonth: temps.map((t: number, i: number) => t + precData.deltaTemps[i] + ghf - chf)
			}
		})

    climateData.forEach((cinfo: IJCellClimateInfo) => {
      cinfo.precipMonth.forEach((p: number, i: number, arr: number[]) => {
        const prev = i === 0 ? 11 : i-1;
        const next = i === 11 ? 0 : i+1;
        cinfo.precipMonth[i] = 0.65 * p + 0.35 * (arr[prev] + arr[next])/2;
      })
    })

		this.diagram.dismarkAllCells();

		return climateData;

	}

	private smoothData() {
    this.diagram.forEachCell((c: JCell) => {
      const cinfo: JCellClimate = c.info.cellClimate;
			const precipMonthProm: number[] = getArrayOfN(12, 0);
			const tempMonthProm: number[] = getArrayOfN(12, 0);
			let cant = 0;
			this.diagram.getCellNeighbours(c).forEach((nc: JCell) => {
        const ninfo: JCellClimate = nc.info.cellClimate;
				cant++;
				precipMonthProm.forEach((p: number, i: number) => precipMonthProm[i] = p + ninfo.precipMonth[i]);
				tempMonthProm.forEach((t: number, i: number) => tempMonthProm[i] = t + ninfo.tempMonth[i]);
			})
			cinfo.precipMonth.forEach((p: number, i: number) => cinfo.precipMonth[i] = 0.7 * p + 0.3 * precipMonthProm[i] / cant);
			cinfo.tempMonth.forEach((t: number, i: number) => cinfo.tempMonth[i] = 0.7 * t + 0.3 * tempMonthProm[i] / cant);
		})
	}
  
	private setVertexInfo() {
    console.log('seting vertex climate')
    console.time('set vertex climate data')
		this.diagram.forEachVertex((vertex: JVertex) => {
      const info: IJVertexClimateInfo = {
        id: vertex.id,
				tempMonth: getArrayOfN(12, 0),
				precipMonth: getArrayOfN(12, 0),
			}
      
			const cellsAso: JCell[] = this.diagram.getCellsAssociated(vertex);
			cellsAso.forEach((c: JCell) => {
        const ch = c.info.cellClimate;
				info.tempMonth = ch.tempMonth.map((t: number, i: number) => info.tempMonth[i] + t);
				info.precipMonth = ch.precipMonth.map((p: number, i: number) => info.precipMonth[i] + p);
			})
			info.tempMonth = info.tempMonth.map((t: number) => t / cellsAso.length);
			info.precipMonth = info.precipMonth.map((p: number) => p / cellsAso.length);
      
			vertex.info.setClimateInfo(info);
		})
    console.timeEnd('set vertex climate data')
	}
}
