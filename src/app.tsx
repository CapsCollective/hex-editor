import React from 'react';
import './app.css';
import Map from "./map";
import Sidebar from "./sidebar";
import {MapProvider} from "./map-context";


function App() {
	return (
		<MapProvider>
			<Sidebar/>
			<Map/>
		</MapProvider>
	);
}

export default App;
