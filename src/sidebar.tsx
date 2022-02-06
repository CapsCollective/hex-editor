import React, {useContext, useEffect, useState} from "react";
import './sidebar.scss';
import {MapContext} from "./map-context";
import {Terrain, TerrainNames} from "./tile";
import {
	Button,
	ButtonGroup,
	Divider,
	TextField,
	ToggleButton,
	ToggleButtonGroup
} from "@mui/material";
import {Check, Edit} from "@mui/icons-material";

const Sidebar = () => {
	const {selectedTile, terrainBrush, setTerrainBrush, islands, save, load} = useContext(MapContext)!;
	const [saveText, setSaveText] = useState<string>("");
	
	const [editingIslandTitle, setEditingIslandTitle] = useState<boolean>(false);
	
	const isOcean = () => selectedTile?.islandId === -1;
	
	useEffect(() => {
		setEditingIslandTitle(false);
	},[selectedTile])
	
	return (
		<div className="sidebar">
			<h4>Terrain Brush</h4>
			<ToggleButtonGroup
				exclusive
				size="small"
				value={terrainBrush} onChange={(e, value) => {if(value !== null) setTerrainBrush(value)}}
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
			
			{selectedTile && <div className="tileDetails">
				<Divider/>
				{!isOcean() && editingIslandTitle ?
					<h4>
						<TextField
							className="islandTitle"
							variant="standard" 
							defaultValue={islands[selectedTile.islandId].name}
							onChange={e => islands[selectedTile.islandId].name = e.target.value}
							style={{textAlign: "center"}}>
						</TextField>
						{!isOcean() && <Check className="editIcon" onClick={() => setEditingIslandTitle(false)}/>}
					</h4>:
					<h4 className="islandTitle">
						{isOcean() ? "Ocean" : islands[selectedTile.islandId].name}
						{!isOcean() && <Edit className="editIcon" onClick={() => setEditingIslandTitle(true)}/>}
					</h4>
				}
				<p>Position: {selectedTile.x}, {selectedTile.y}</p>
				<p>Terrain: {TerrainNames[selectedTile.terrain]}</p>
				{selectedTile.islandId !== -1 && <p>Other Tiles: {Array.from(islands[selectedTile.islandId]?.tiles || []).map((pos) => ` (${pos.x},${pos.y})`)}</p>}
      </div>}
		</div>
	);
}
export default Sidebar;
