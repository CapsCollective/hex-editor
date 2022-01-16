import React, {PropsWithChildren, useEffect} from "react";
import {Island, Terrain, Tile, TileMap} from "./tile";
import _ from "lodash";


type MapContextType = {
	selectedTile: Tile | undefined;
	select: (value: Tile | undefined) => void;
	selectedIsland: Island | undefined;
	setSelectedIsland: (value: Island) => void;
	terrainBrush: Terrain;
	setTerrainBrush: (value: Terrain) => void;
	layout: TileMap,
	setLayout: (value: TileMap) => void,
	flattenLayout: () => Tile[],
	islands: Island[];
	setIslands: (value: Island[]) => void;
	save: () => string;
	load: (file: string) => void;
};

export const MapContext = React.createContext<MapContextType | undefined>(undefined);

type Props = {};

export const MapProvider = ({ children }: PropsWithChildren<Props>) => {
	const [selectedTile, setSelectedTile] = React.useState<Tile | undefined>();
	const [terrainBrush, setTerrainBrush] = React.useState<Terrain>(Terrain.None);
	const [layout, setLayout] = React.useState<TileMap>({});
	const [island, setIsland] = React.useState<Island | undefined>();
	const [islands, setIslands] = React.useState<Island[]>([{id: 0, name: "Island 1", tiles: []}]);

	const select = (tile: Tile | undefined) => {
		if(selectedTile !== tile) setSelectedTile(tile);
		else setSelectedTile(undefined);
		if(!tile) return;

		if(terrainBrush !== Terrain.None) {
			layout[tile.y][tile.x].terrain = terrainBrush;

			if (!island) return;
			if (terrainBrush === Terrain.Water) {
				if (tile.islandId === -1) return;
				console.log(tile.islandId)
				_.remove(islands[tile.islandId].tiles, (t) => t.x === tile.x && t.y === tile.y);
				tile.islandId = -1;
			}
			else {
				tile.islandId = island.id;
				if (island.tiles.findIndex(t => t.x === tile.x && t.y === tile.y) === -1)
					island.tiles.push({x: tile.x, y: tile.y});
			}
		}
	}

	const getNeighbours = (x: number, y: number): Tile[] => [
		layout[y-1][x],
		layout[y-(x%2)][x+1],
		layout[y+1-(x%2)][x+1],
		layout[y+1][x],
		layout[y-(x%2)][x-1],
		layout[y+1-(x%2)][x-1],
	]
	
	const flattenLayout = (): Tile[] => Object.values(layout).flatMap(o => Object.values(o));
	
	type SaveFile = {
		layout: TileMap,
		islands: Island[]
	}
	const save = (): string => {
		const file = JSON.stringify({
			layout: layout,
			islands: islands
		} as SaveFile)

		localStorage.setItem("save", file);
		return file;
	}

	useEffect(() => {
		load(localStorage.getItem("save") || "")
	},[])
	
	const load = (file: string) => {
		if(file === "") return initChunk();
		
		const parsed: SaveFile = JSON.parse(file) as SaveFile;
		setLayout(parsed.layout);
		setIslands(parsed.islands);
		
		setIsland(parsed.islands[0]);
	}
	
	const initChunk = () => {
		const CHUNK_WIDTH = 40;
		const CHUNK_HEIGHT = 30;
		const layout: TileMap = {};

		for (let i = 0; i < CHUNK_WIDTH * CHUNK_HEIGHT; i++) {
			const x = i % CHUNK_WIDTH;
			const y = Math.floor(i / CHUNK_WIDTH);
			if(!layout[y]) layout[y] = {};

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
		<MapContext.Provider value={{selectedTile, select, terrainBrush, setTerrainBrush, layout, setLayout, flattenLayout, save, load, selectedIsland: island, islands, setIslands, setSelectedIsland: setIsland}}>
			{children}
		</MapContext.Provider>
	);
};
