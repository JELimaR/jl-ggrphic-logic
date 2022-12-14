import JVertex from "./BuildingModel/Voronoi/JVertex";


const coastVertices: JVertex[] = [];
export const getCoastVertices = (): JVertex[] => {
  if (coastVertices.length === 0) {
    console.log('calculating coast vertices')

  }
  return coastVertices;
}

