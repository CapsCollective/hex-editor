export enum Terrain {
	None = 'None',
	Water = 'Water',
	Grass = 'Grass',
	Jungle = 'Jungle',
	Mountain = 'Mountain',
	Desert = 'Desert'
}

export type IslandMap = {[id: number]: Island};

export type Island = {
	name: string;
	tiles: {x: number, y: number}[];
	inventory: Inventory;
}

export type TileMap = {[y: number]: {[x: number]: Tile}};

export type Tile = {
	id: number,
	x: number,
	y: number,
	terrain: Terrain,
	islandId: number,
	discovered: boolean,
	structure?: Structure
}

export enum Resource {
	Food = 'Food',
	Gold = 'Gold',
	Wood = 'Wood',
	Sand = 'Sand',
	Glass = 'Glass',
	Rumours = 'Rumours',
	Clay = 'Clay',
	Pots = 'Pots',
	Bricks = 'Bricks',
	Planks = 'Planks',
	Iron = 'Iron',
	Cotton = 'Cotton',
	Cloth = 'Cloth',
	Clothes = 'Clothes',
	Coal = 'Coal',
	Steel = 'Steel',
	Sugar = 'Sugar',
	Rum = 'Rum',
	Tobacco = 'Tobacco',
	Paper = 'Paper',
	Cigar = 'Cigar',
	Concrete = 'Concrete',
	Weapons = 'Weapons',
	Sails = 'Sails',
	Ship = 'Ships'
}

export type Inventory = {[K in Resource]?: number};

export type Structure = {
	type: StructureType;
	input?: Inventory;
	output?: Inventory;
	terrain? : Terrain; // Required terrain for structure
	productivity?: number; // Required productivity to work tile
	special?: boolean;
}

export enum StructureType {
	None = 'None',
	Market = 'Market',
	Settlement = 'Settlement',
	Tavern = 'Tavern',
	ShipYard = 'Ship Yard',
	GoldMine = 'Gold Mine',
	IronMine = 'Iron Mine',
	CoalMine = 'Coal Mine',
	ClayPit = 'Clay Pit',
	SandPit = 'Sand Pit',
	Farm = 'Farm',
	SugarPlantation = 'Sugar Plantation',
	CottonPlantation = 'Cotton Plantation',
	TobaccoPlantation = 'Tobacco Plantation',
	Woodcutters = 'Woodcutters',
	Smelter = 'Smelter',
	BrickMaker = 'Brick Maker',
	Potter = 'Potter',
	Weavers = 'Weavers',
	PaperMill = 'Paper Mill',
	LoggingCamp = 'Logging Camp',
	ConcreteFactory = 'Concrete Factory',
	GlassBlowers = 'Glass Blowers',
	Distillery = 'Distillery',
	Tailor = 'Tailor',
	SailMakers = 'Sail Makers',
	CigarFactory = 'Cigar Factory',
	Blacksmith = 'Blacksmith'
}

export const Structures: {[K in StructureType]?: Structure} = {
	[StructureType.Market]: {
		type: StructureType.Market,
		special: true
	},
	[StructureType.Settlement]: {
		type: StructureType.Settlement,
		special: true
	},
	[StructureType.Farm]: {
		type: StructureType.Farm,
		terrain: Terrain.Grass,
		output: {	[Resource.Food]: 2 }
	},
	[StructureType.GoldMine]: {
		type: StructureType.GoldMine,
		terrain: Terrain.Mountain,
		output: {	[Resource.Gold]: 1 }
	},
	[StructureType.LoggingCamp]: {
		type: StructureType.LoggingCamp,
		terrain: Terrain.Jungle,
		output: {	[Resource.Wood]: 1 }
	},
}

export const ResourceCosts: {[K in Resource]?: number} = {
	[Resource.Gold]: 3,
	[Resource.Pots]: 7,
	[Resource.Clothes]: 12,
	[Resource.Cigar]: 18,
	[Resource.Weapons]: 25,
}
