import {Component, createRef} from "react";
import './map.scss';
import {TerrainColors, TerrainImages, Tile} from "./tile";
import {MapContext} from "./map-context";

const SCALE_X = 45; // 3/4 of the width (60)
const SCALE_Y = 26; // 1/2 of the height (52)

class Map extends Component<any, any> {
	static contextType = MapContext;

	private cameraRef = createRef<any>();
	private mouseX: number = 0;
	private mouseY: number = 0;
	private translateX: number = 0;
	private translateY: number = 0;
	
	componentDidMount() {
		this.centerMap();
	}

	mouseDown = (e: any) => {
		this.mouseX = e.clientX;
		this.mouseY = e.clientY;
		
		document.onmousemove = this.mouseMove;
		document.onmouseup = this.mouseUp;
	}

	mouseMove = (e: any) => {
		this.translateX = this.translateX - (this.mouseX - e.clientX);
		this.translateY = this.translateY - (this.mouseY - e.clientY);
		this.mouseX = e.clientX;
		this.mouseY = e.clientY;

		this.cameraRef.current!.style.transform = `translate(${this.translateX}px, ${this.translateY}px)`;
	}

	mouseUp = () => {
		document.onmouseup = null;
		document.onmousemove = null;
	}
	
	centerMap = () => {
		this.translateX = 0;
		this.translateY = 0;
		this.cameraRef.current.style.transform = `translate(${this.translateX}px, ${this.translateY}px)`;
	}

	render = () => (
		<svg style={{width: "100%", height: "100%", position: "relative"}}>
			<g ref={this.cameraRef} onMouseDown={this.mouseDown}>
				{this.context.flattenLayout().map((tile: Tile) =>
					<a onClick={() => this.context.select(tile)} key={tile.id} className="tile">
						<g transform={`translate(${tile.x * SCALE_X}, ${(2 * tile.y + tile.x % 2) * SCALE_Y})`}>
							<polygon
								points="15, 0 45, 0 60, 26 45, 52 15, 52 0, 26"
								fill={TerrainColors[tile.terrain]}
								stroke={TerrainColors[tile.terrain]}
								strokeWidth="1px"
								opacity={this.context.selectedIsland?.id === tile.islandId ? 0.8 : 1 }
							/>
							{TerrainImages[tile.terrain]}
						</g>
					</a>
				)}
			</g>
		</svg>
	);
}

export default Map;
