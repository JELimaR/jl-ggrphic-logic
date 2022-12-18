import { TypeInformationKey } from "../BuildingModel/TypeInformationKey"

export interface ISaveInformation {
	subFolder: string[];
	file: string;
}

export type TypeInformationObject = { [key in TypeInformationKey]: ISaveInformation } // sirve para crear una constante con todo

export const DATA_INFORMATION: TypeInformationObject = {
  //
	cellHeight: {
		file: 'height',
		subFolder: ['CellsInfo'],
	},
	cellClimate: {
		file: 'climate',
		subFolder: ['CellsInfo'],
	},
	cellAGR: {
		file: 'agr',
		subFolder: ['CellsInfo']
	},
  //
	vertexHeight: {
		file: 'height',
		subFolder: ['VerticesInfo'],
	},
	vertexFlux: {
		file: 'flux',
		subFolder: ['VerticesInfo'],
	},
  //
	islands: {
		file: 'islandsInfo',
		subFolder: []
	},
  lakes: {
    file: 'lakesInfo',
    subFolder: []
  },
	rivers: {
		file: 'riversInfo',
		subFolder: ['RiverAndFlux']
	},
	fluxRoutes: {
		file: 'fluxRoutesInfo',
		subFolder: ['RiverAndFlux']
	},
  initCulture: {
    file: 'initCultureInfo',
    subFolder: ['Cultures']
  },
  // 
	temperature: {
		file: 'temperature',
		subFolder: ['GridInfo'],
	},
	pressure: {
		file: 'pressure',
		subFolder: ['GridInfo'],
	},
	precip: {
		file: 'precip',
		subFolder: ['GridInfo'],
	}
}