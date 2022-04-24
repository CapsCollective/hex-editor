import React, {useContext, useEffect, useState} from "react";
import './sidebar.scss';
import {MapContext} from "./map-context";
import {Resource, Structures, StructureType, Terrain} from "./tile";
import {Button, ButtonGroup, Divider, TextField, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {Check, Edit} from "@mui/icons-material";

const Sidebar = () => {
	const {
		selectedTile,
		selectedIsland,
		terrainBrush,
		setTerrainBrush,
		save,
		load,
		forceUpdate,
		workIslands,
		workTile,
		treasure
	} = useContext(MapContext)!;
	const [saveText, setSaveText] = useState<string>("");
	
	const [editingIslandTitle, setEditingIslandTitle] = useState<boolean>(false);
	
	useEffect(() => {
		setEditingIslandTitle(false);
	},[selectedTile])
	
	const ConstructBuilding = (_: any, type: StructureType) => {
		if (type === StructureType.None) selectedTile!.structure = undefined;
		else selectedTile!.structure = Structures[type];
		forceUpdate();
	}
	
	const TerrainBrush = () => <>
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
	</>;
	
	const SaveLoad = () => <>
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
	</>;
	
	const TileDetails = () => <>
		<Divider/>
		{selectedIsland() && editingIslandTitle ?
			<h4>
				<TextField
					className="islandTitle"
					variant="standard"
					defaultValue={selectedIsland()!.name}
					onChange={e => selectedIsland()!.name = e.target.value}
					style={{textAlign: "center"}}
				/>
				<Check className="editIcon" onClick={() => setEditingIslandTitle(false)}/>
			</h4> :
			<h4 className="islandTitle">
				{selectedIsland()?.name || "Ocean"}
				{selectedIsland() && <Edit className="editIcon" onClick={() => setEditingIslandTitle(true)}/>}
			</h4>
		}
		<p>Position: {selectedTile!.x}, {selectedTile!.y}</p>
		<p>Terrain: {selectedTile!.terrain}</p>
		{selectedIsland() && <>
			<p>
				{/*Other Tiles:{selectedIsland()?.tiles.map((pos) => ` (${pos.x},${pos.y})`)}*/}
				Island Size: {selectedIsland()!.tiles.length} Tiles
			</p>
			<h4>Inventory</h4>
			{Object.entries(selectedIsland()!.inventory).map(([r, count]) => <p>
				{`${r as unknown as Resource}: ${count}`}
			</p>)}
			<h4>Building</h4>
			<ToggleButtonGroup
				exclusive
				size="small"
				value={selectedTile?.structure?.type || StructureType.None}
				onChange={ConstructBuilding}
				className="terrainPicker"
			>
				<ToggleButton value={StructureType.None}>None</ToggleButton>
				{Object.entries(Structures).map(([_, s]) => (
					!s.terrain || s.terrain === selectedTile!.terrain) &&
					<ToggleButton key={s.type} value={s.type}>{s.type}</ToggleButton>
				)}
			</ToggleButtonGroup>
			<Button onClick={() => {workTile(selectedTile!); forceUpdate();}}>Work Tile</Button>
		</>}
	</>;
	
	return (
		<div className="sidebar">
			<h5>Treasure: {treasure}</h5>
			<TerrainBrush/>
			<SaveLoad/>
			{selectedTile && <TileDetails/>}
			<Divider/>
			<Button onClick={() => {workIslands(); forceUpdate();}}>Work Islands</Button>
		</div>
	);
}
export default Sidebar;
