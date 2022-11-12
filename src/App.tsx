import { LocationGrid } from './features/locationGrid/LocationGrid';
import './App.css';

function App() {
  return (
    <div className="App">
      <LocationGrid dotRadiusInPx={10} dotsLocationSizeInPx={500} dotClickThresholdRatio={.66}/>
    </div>
  );
}

export default App;