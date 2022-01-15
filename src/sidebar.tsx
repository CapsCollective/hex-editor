import React, {useContext, useState} from "react";
import './sidebar.scss';
import {MapContext} from "./map-context";
import {Terrain} from "./tile";
import {
	Button,
	ButtonGroup,
	Divider,
	TextField,
	ToggleButton,
	ToggleButtonGroup
} from "@mui/material";

const Sidebar = () => {
	const { selected, terrainBrush, setTerrain, save, load } = useContext(MapContext)!;
	const [saveText, setSaveText] = useState<string>("");
	
	return (
		<div className="sidebar">
			<h4>Terrain Brush</h4>
			<ToggleButtonGroup
				exclusive
				size="small"
				value={terrainBrush} onChange={(e, value) => setTerrain(value)}
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
			<TextField multiline maxRows={10} value={saveText} onChange={(e) => setSaveText(e.target.value)}/>
			<ButtonGroup className="saveButtons">
				<Button onClick={() => setSaveText(save())}>Save</Button>
				<Button onClick={() => load(saveText)}>Load</Button>
			</ButtonGroup>
			<Divider/>
			
			{selected && <div className="tileDetails">
				<h4>Selected Tile</h4>
				<p>x: {selected.x}</p>
				<p>y: {selected.y}</p>
				<p>terrain: {selected.terrain}</p>
				<Divider/>
      </div>}
		</div>
	);
}
export default Sidebar;
