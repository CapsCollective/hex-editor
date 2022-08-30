import {createContext, PropsWithChildren, useEffect, useState} from "react";
import {Island, IslandMap, Resource, ResourceCosts, StructureType, Terrain, TileMap, Tile} from "./types";
import _ from "lodash";

const CHUNK_WIDTH = 40;
const CHUNK_HEIGHT = 30;

export type MapContextType = {
	selectedTile: Tile | undefined;
	selectedIsland: () => Island | undefined;
	selectTile: (value: Tile | undefined) => void;
	getNeighbours: (x: number, y: number, r: number) => Tile[];
	terrainBrush: Terrain;
	setTerrainBrush: (value: Terrain) => void;
	layout: TileMap,
	flattenLayout: () => Tile[],
	islands: IslandMap;
	save: () => string;
	load: (file: string) => void;
	forceUpdate: () => void;
	workIslands: () => void;
	workTile: (tile: Tile) => boolean;
	treasure: number;
};

export const MapContext = createContext<MapContextType | undefined>(undefined);

type Props = {};

export const MapProvider = ({children}: PropsWithChildren<Props>) => {
	const [selectedTile, setSelectedTile] = useState<Tile | undefined>();
	const [terrainBrush, setTerrainBrush] = useState<Terrain>(Terrain.None);
	const [layout, setLayout] = useState<TileMap>({});
	const [islands, setIslands] = useState<IslandMap>({});
	const [nextIslandId, setNextIslandId] = useState<number>(0);
	const [treasure, setTreasure] = useState<number>(0);
	
	/* Island Management */
	
	const selectTile = (tile: Tile | undefined) => {
		// Toggle if not painting
		if (selectedTile !== tile || terrainBrush !== Terrain.None) setSelectedTile(tile);
		else setSelectedTile(undefined);
		
		if (!tile || terrainBrush === Terrain.None) return;
		
		if (terrainBrush === Terrain.Water) {
			if (tile.islandId !== -1) {
				// Find and remove tile from island, and remove island if empty
				_.remove(islands[tile.islandId].tiles, (t) => t.x === tile.x && t.y === tile.y);
				if (islands[tile.islandId].tiles.length === 0) delete islands[tile.islandId];
				tile.islandId = -1;
			}
			tile.structure = undefined;
		}
		else {
			// Find adjacent island(s), creating a new island if none found, appending to existing island if one found,
			// or erroring if multiple found, preventing islands touching.
			let islandId = tile.islandId;
			for(let neighbour of getNeighbours(tile.x, tile.y, 1)) {
				if(neighbour.islandId !== -1) {
					if(islandId === -1 || islandId === neighbour.islandId) islandId = neighbour.islandId;
					else {
						//TODO: Show warning in UI
						console.warn("Invalid Hex, multiple adjacent islands");
						return;
					}
				}
			}
			
			if(islandId === -1) {
				tile.islandId = nextIslandId;
				islands[nextIslandId] = {
					name: "Island " + nextIslandId,
					tiles: [{x: tile.x, y: tile.y}],
					inventory: {}
				}
				setNextIslandId(nextIslandId+1);
			}
			else {
				tile.islandId = islandId;
				if (islands[islandId].tiles.findIndex(t => t.x === tile.x && t.y === tile.y) === -1)
					islands[islandId].tiles.push({x: tile.x, y: tile.y});
			}
		}

		layout[tile.y][tile.x].terrain = terrainBrush;
		forceUpdate();
	}

	const selectedIsland = (): Island | undefined => selectedTile ? islands[selectedTile.islandId] : undefined;
	
	const initChunk = () => {
		setLayout({});
		setIslands({});
		
		for (let i = 0; i < CHUNK_WIDTH * CHUNK_HEIGHT; i++) {
			const x = i % CHUNK_WIDTH;
			const y = Math.floor(i / CHUNK_WIDTH);
			if (!layout[y]) layout[y] = {};
			
			layout[y][x] = {
				id: i,
				x: x,
				y: y,
				terrain: Terrain.Water,
				islandId: -1,
				discovered: false,
				structure: undefined
			};
		}
		setLayout(layout);
	}
	
	const workIslands = () => Object.entries(islands).map(([_, island]) => workIsland(island));
	
	const workIsland = (island: Island) => {
		console.log(`Working island ${island.name}`)
		if (!island.inventory[Resource.Food]) island.inventory[Resource.Food] = 0;

		// Find max allowable production (by settlement and resource limits)
		let buildingProductionLimit = 0;
		let sellLimit = 0;
		island.tiles.map((pos) => {
			if (layout[pos.y][pos.x].structure?.type === StructureType.Settlement) buildingProductionLimit += 2;
			if (layout[pos.y][pos.x].structure?.type === StructureType.Market) sellLimit++;
		});
		let maxProduction = Math.min(
			buildingProductionLimit,
			island.inventory[Resource.Food]!,
			treasure
		);
		if (maxProduction < buildingProductionLimit) console.log("Not enough resources to fully work island");
		let usedProduction = 0;
		
		island.tiles.map((pos) => {
			if (usedProduction < maxProduction && workTile(layout[pos.y][pos.x])) usedProduction++;
		});
		
		for (let i = 0; i < sellLimit; i++) {
			const sellPriority = [
				Resource.Gold,
			];
			
			for (const r of sellPriority) {
				if (island.inventory[r] && island.inventory[r]! > 0) {
					island.inventory[r]!--;
					console.log(`Selling ${r}`);
					setTreasure(prev => prev + ResourceCosts[r]!);
					break;
				}
			}
		}
		
		island.inventory[Resource.Food]! -= usedProduction;
		setTreasure(prev => prev - usedProduction);
	}
	
	const workTile = (tile: Tile): boolean => {
		const island: Island = islands[tile.islandId];
		if (tile.structure === undefined || tile.structure.special) return false;

		console.log(`Working ${tile.structure.type} ${tile.x},${tile.y}`);
		
		if (tile.structure.input) {
			// Verify that all inputs are valid before removing
			const toRemove: { resource: Resource; count: number; }[] = [];
			
			Object.entries(tile.structure.input).map(([r, count]) => {
				const resource: Resource = r as unknown as Resource;

				// Init if undefined
				if (!island.inventory[resource]) island.inventory[resource] = 0;

				if (island.inventory[resource]! <= count) {
					console.log(`Not enough ${resource} to work tile}`)
					return false;
				}
				
				toRemove.push({resource, count});
			});
			
			toRemove.map((inventory) => {
				island.inventory[inventory.resource]! -= inventory.count;
			})
		}
		
		if (tile.structure.output) {
			Object.entries(tile.structure.output).map(([r, count]) => {
				const resource: Resource = r as unknown as Resource;
				// Init if undefined
				if (island.inventory[resource] === undefined) island.inventory[resource] = count;
				else island.inventory[resource]! += count;
				
				console.log(`Producing ${resource} (${island.inventory[resource]})`)
			});
		}
		
		return true;
	}
	
	/* Save and Loading */
	
	type SaveFile = {
		layout: TileMap,
		islands: IslandMap,
		nextIslandId: number
	}
	
	const save = (): string => {
		const file = JSON.stringify({layout, islands, nextIslandId} as SaveFile);
		localStorage.setItem("save", file);
		return file;
	}

	useEffect(() => {
		load(localStorage.getItem("save") || "")
	},[])
	
	const load = (file: string) => {
		if (file === "") return initChunk();
		
		const parsed: SaveFile = JSON.parse(file) as SaveFile;
		setLayout(parsed.layout || {});
		setIslands(parsed.islands || {});
		setNextIslandId(parsed.nextIslandId || 0);
	}
	
	/* Utils */
	
	const getNeighbours = (x: number, y: number, r: number): Tile[] => {
		const n: Tile[] = [];
		for(let i = -r; i <= r; i++) {
			const abs = Math.abs(i);
			for(let j = -r + Math.floor((x%2 + abs)/2); j <= r - Math.floor(((x+i)%2 + abs) /2); j++) {
				if (y + j < 0 || y + j >= CHUNK_HEIGHT) continue;
				const tile: Tile | undefined = layout[y + j][x + i];
				if (tile) n.push(tile);
			}
		}
		return n;
	}
	
	const flattenLayout = (): Tile[] => Object.values(layout).flatMap(o => Object.values(o));
	
	const forceUpdate = () => setLayout({...layout});
	
	return (
		<MapContext.Provider value={{
			selectedTile,
			selectTile,
			selectedIsland,
			getNeighbours,
			terrainBrush,
			setTerrainBrush,
			layout,
			flattenLayout,
			islands,
			save,
			load,
			forceUpdate,
			workIslands,
			workTile,
			treasure
		}}>
			{children}
		</MapContext.Provider>
	);
};
