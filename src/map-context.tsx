import React, {PropsWithChildren, useEffect} from "react";
import {Terrain, Tile, TileMap} from "./tile";


type MapContextType = {
	selected: Tile | undefined;
	setSelected: (value: Tile | undefined) => void;
	terrainBrush: Terrain;
	setTerrain: (value: Terrain) => void;
	layout: TileMap,
	setLayout: (value: TileMap) => void,
	flattenLayout: () => Tile[],
	save: () => string;
	load: (file: string) => void;
};

export const MapContext = React.createContext<MapContextType | undefined>(undefined);

type Props = {};

export const MapProvider = ({ children }: PropsWithChildren<Props>) => {
	const [selected, setSelected] = React.useState<Tile | undefined>();
	const [terrain, setTerrain] = React.useState<Terrain>(Terrain.None);
	const [layout, setLayout] = React.useState<TileMap>({});

	const flattenLayout = (): Tile[] => Object.values(layout).flatMap(o => Object.values(o));
	
	const save = (): string => {
		const file = flattenLayout().map(tile => tile.terrain).join(",");
		console.log(file);
		localStorage.setItem("save", file);
		return file;
	}

	useEffect(() => {
		load(localStorage.getItem("save") || "")
	},[])
	
	const load = (file: string) => {
		const CHUNK_WIDTH = 40;
		const CHUNK_HEIGHT = 30;

		const terrains: Terrain[] = file.split(",").map(t => parseInt(t) as Terrain);
		const layout: TileMap = {};
		
		for (let i = 0; i < CHUNK_WIDTH * CHUNK_HEIGHT; i++) {
			const x = i % CHUNK_WIDTH;
			const y = Math.floor(i / CHUNK_WIDTH);
			if(!layout[y]) layout[y] = {};

			layout[y][x] = {
				id: i,
				x: x,
				y: y,
				terrain: terrains[i] || Terrain.Water,
				discovered: false,
				structure: undefined
			};
		}
		setLayout(layout);
	}
	
	return (
		<MapContext.Provider value={{selected, setSelected, terrainBrush: terrain, setTerrain, layout, setLayout, flattenLayout, save, load}}>
			{children}
		</MapContext.Provider>
	);
};
