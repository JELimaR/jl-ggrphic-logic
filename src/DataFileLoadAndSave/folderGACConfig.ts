import AzgaarReaderData from "./AzgaarReaderData";
import InformationFilesManager from "./InformationFilesManager";
// import PNGDrawsDataManager from "./PNGDrawsDataManager";

// MEJORAR

export default (root: string, folderSelected: string): void => {
	// PNGDrawsDataManager.configPath(root + `/pngdraws`);
	InformationFilesManager.configPath(root + `/public/data/${folderSelected}`);
	AzgaarReaderData.configPath(root + `/public/AzgaarData/`, folderSelected);
}