import {useContext, useEffect, useRef} from "react";
import './map.scss';
import {Tile} from "./types";
import {MapContext, MapContextType} from "./map-context";
import {DarkenedTerrainColors, StructureIcons, TerrainColors, TerrainIcons} from "./icons";

const SCALE_X = 45; // 3/4 of the width (60)
const SCALE_Y = 26; // 1/2 of the height (52)

const Map = () => {
	console.log("Render");
	const { selectTile, selectedTile, flattenLayout, getNeighbours } = useContext(MapContext) as MapContextType;
	const cameraRef = useRef<any>();
	const mouseX = useRef<number>(0);
	const mouseY = useRef<number>(0);
	const translateX = useRef<number>(0);
	const translateY = useRef<number>(0);

	useEffect(() => {
		centerMap();
	}, []);

	const mouseDown = (e: any) => {
		console.log(`Mouse Down: ${e.clientX}, ${e.clientY}`)
		mouseX.current = e.clientX;
		mouseY.current = e.clientY;
		document.onmousemove = mouseMove;
		document.onmouseup = mouseUp;
	}

	const mouseMove = (e: any) => {
		translateX.current += e.clientX - mouseX.current;
		translateY.current += e.clientY - mouseY.current;
		mouseX.current = e.clientX;
		mouseY.current = e.clientY;
		
		cameraRef.current!.style.transform = `translate(${translateX.current}px, ${translateY.current}px)`;
	}

	const mouseUp = () => {
		document.onmouseup = null;
		document.onmousemove = null;
	}

	const centerMap = () => {
		translateX.current = 0;
		translateY.current = 0;
		cameraRef.current!.style.transform = `translate(${translateX.current}px, ${translateY.current}px)`;
	}

	const showAll = true;//selectedTile == undefined;
	let visible: Tile[] = [];
	if (selectedTile) visible = getNeighbours(selectedTile.x, selectedTile?.y, 5);
	
	return (
		<svg style={{width: "100%", height: "100%", position: "relative"}}>
			<g ref={cameraRef} onMouseDown={mouseDown}>
				{(showAll ? flattenLayout() : visible).map((tile: Tile) =>
					<a onClick={() => selectTile(tile)} key={tile.id} className="tile">
						<g transform={`translate(${tile.x * SCALE_X}, ${(2 * tile.y + tile.x % 2) * SCALE_Y})`}>
							<polygon
								points="15, 0 45, 0 60, 26 45, 52 15, 52 0, 26"
								fill={selectedTile === tile ? DarkenedTerrainColors[tile.terrain] : TerrainColors[tile.terrain]}
								stroke={selectedTile === tile ? DarkenedTerrainColors[tile.terrain] : TerrainColors[tile.terrain]}
								strokeWidth="1px"
							/>
							{/*<text>{tile.x}, {tile.y}</text>*/}
							{tile.structure ? StructureIcons(tile.structure.type, tile.terrain) : TerrainIcons(tile.terrain)}
						</g>
					</a>
				)}
			</g>
		</svg>
	);
}

export default Map;
