import {createContext, useEffect, useState, PropsWithChildren} from "react";
import {IslandMap, Terrain, Tile, TileMap} from "./tile";
import _ from "lodash";

const CHUNK_WIDTH = 40;
const CHUNK_HEIGHT = 30;

type MapContextType = {
	selectedTile: Tile | undefined;
	selectTile: (value: Tile | undefined) => void;
	terrainBrush: Terrain;
	setTerrainBrush: (value: Terrain) => void;
	layout: TileMap,
	flattenLayout: () => Tile[],
	islands: IslandMap;
	save: () => string;
	load: (file: string) => void;
};

export const MapContext = createContext<MapContextType | undefined>(undefined);

type Props = {};

export const MapProvider = ({children}: PropsWithChildren<Props>) => {
	const [selectedTile, setSelectedTile] = useState<Tile | undefined>();
	const [terrainBrush, setTerrainBrush] = useState<Terrain>(Terrain.None);
	const [layout, setLayout] = useState<TileMap>({});
	const [islands, setIslands] = useState<IslandMap>({});
	const [nextIslandId, setNextIslandId] = useState<number>(0);
	
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
		}
		else {
			// Find adjacent island(s), creating a new island if none found, appending to existing island if one found,
			// or erroring if multiple found, preventing islands touching.
			let islandId = tile.islandId;
			for(let neighbour of getNeighbours(tile.x, tile.y)) {
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
					tiles: [{x: tile.x, y: tile.y}]
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
		setLayout(layout);
	}

	const getNeighbours = (x: number, y: number): Tile[] => [
		layout[y-1][x],
		layout[y-1+(x%2)][x+1],
		layout[y+(x%2)][x+1],
		layout[y+1][x],
		layout[y-1+(x%2)][x-1],
		layout[y+(x%2)][x-1],
	]
	
	const flattenLayout = (): Tile[] => Object.values(layout).flatMap(o => Object.values(o));
	
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
	
	return (
		<MapContext.Provider value={{selectedTile, selectTile, terrainBrush, setTerrainBrush, layout, flattenLayout, islands, save, load}}>
			{children}
		</MapContext.Provider>
	);
};
