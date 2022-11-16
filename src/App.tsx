import { LocationGrid } from './features/locationGrid/LocationGrid';
import './App.css';

function App() {
  return (
    <div className="App">
      <LocationGrid dotClickThresholdRatio={.66}/>
    </div>
  );
}

export default App;