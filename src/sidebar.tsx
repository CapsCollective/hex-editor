import React, {useContext, useState} from "react";
import './sidebar.scss';
import {MapContext} from "./map-context";
import {Terrain} from "./tile";
import {
	Button,
	ButtonGroup,
	Divider,
	List,
	ListItem, 
	Radio,
	TextField,
	ToggleButton,
	ToggleButtonGroup
} from "@mui/material";

const Sidebar = () => {
	const { selectedTile, terrainBrush, setTerrainBrush, save, load, islands, selectedIsland, setSelectedIsland } = useContext(MapContext)!;
	const [saveText, setSaveText] = useState<string>("");
	
	return (
		<div className="sidebar">
			<h4>Islands</h4>
			<List>{islands.map(island =>
				<ListItem key={island.name}>
					<Radio checked={island.name === selectedIsland?.name} onChange={_ => setSelectedIsland(island)}/>
					{island.name}
				</ListItem>
			)}</List>
			<Button onClick={() => {
				islands.push({id: islands.length,  name: "Island " + (islands.length+1), tiles: []});
				setSelectedIsland(islands[islands.length - 1]);
			}}>Add Island</Button>
			<p>Tiles:{Array.from(selectedIsland?.tiles || []).map((pos) => ` (${pos.x},${pos.y})`)}</p>
			<Divider/>
			
			<h4>Terrain Brush</h4>
			<ToggleButtonGroup
				exclusive
				size="small"
				value={terrainBrush} onChange={(e, value) => setTerrainBrush(value)}
				className="terrainPicker"
			>
				<ToggleButton value={Terrain.None}>None</ToggleButton>
				<ToggleButton value={Terrain.Water}>Water</ToggleButton>
				<ToggleButton value={Terrain.Grass}>Grass</ToggleButton>
				<ToggleButton value={Terrain.Jungle}>Jungle</ToggleButton>
				<ToggleButton value={Terrain.Desert}>Desert</ToggleButton>
				<ToggleButton value={Terrain.Mountain}>Mountain</ToggleButton>
			</ToggleButtonGroup>
			<Divider/>
			
			<h4>Save/ Load Map</h4>
			<TextField 
				value={saveText} 
				onChange={(e) => setSaveText(e.target.value)}
				onClick={() => navigator.clipboard.writeText(saveText)}
			/>
			<ButtonGroup className="saveButtons">
				<Button onClick={() => setSaveText(save())}>Save</Button>
				<Button onClick={() => load(saveText)}>Load</Button>
			</ButtonGroup>
			<Divider/>
			
			{selectedTile && <div className="tileDetails">
				<h4>Selected Tile</h4>
				<p>x: {selectedTile.x}</p>
				<p>y: {selectedTile.y}</p>
				<p>terrain: {selectedTile.terrain}</p>
				<p>island: {selectedTile.islandId === -1 ? "None" : islands[selectedTile.islandId].name}</p>
				<Divider/>
      </div>}
		</div>
	);
}
export default Sidebar;
