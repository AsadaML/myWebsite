import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useState, useRef, useEffect} from 'react'
import './components.css'

function getCookie(name) {
  const matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  options = {
    path: '/',
    ...options
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

function ChangeView({ center, zoom }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

const locations = [
  { id: 1, position: [22.4181318,114.2046143], name: 'Fusion (CUHK)'},
  { id: 2, position: [22.4270461,114.2091983], name: 'Fusion (Science Park)'},
  { id: 3, position: [22.3997618,114.2019665], name: 'Fusion (Fotan)'},
]

const kirbyIcon = L.icon({
  iconUrl: './kirbyMarker.png',
  iconSize: [60, 60],  
  iconAnchor: [30, 50], 
  popupAnchor: [0, -60] 
});
const FusionIcon = L.icon({
  iconUrl: './Fusion.jpg',
  iconSize: [60, 30],  
  iconAnchor: [30, 50], 
  popupAnchor: [0, -60] 
});
const kirbyIconGreen = L.icon({
  iconUrl: './kirbyMarkerGreen.png',
  iconSize: [60, 60],  
  iconAnchor: [30, 50], 
  popupAnchor: [0, -60] 
});

// Component to handle map click events
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

const Map = () => {
  const defaultPos = {name: "Chung Chi Gate", position: [22.4130455, 114.2087379]} // [lat, lng]
  //const [markers, setMarkers] = useState([])
  const [markers, setMarkers] = useState(() => {
    const savedMarkers = getCookie('customMarkers');
    return savedMarkers ? JSON.parse(savedMarkers) : [];
  });
  const [loc, setLoc] = useState({name: defaultPos.name, position: defaultPos.position});

  const [newMarkerName, setNewMarkerName] = useState('')
  const mapRef = useRef()

  const handleShopClick = (location) => {
    setLoc(location)
  }

  const handleMapClick = (latlng) => {
    const name = newMarkerName || `Marker ${markers.length + 1}`
    const newMarker = {
      id: Date.now(),
      position: [latlng.lat, latlng.lng],
      name,
    }
    
    setLoc(newMarker)
    setMarkers([...markers, newMarker])
    setNewMarkerName('')
  }

  const handleCustomMarkerClick = (position) => {
    setLoc(position)
  }

  const addCurrentLocationMarker = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const dateTime = new Date().toLocaleString() // Format: e.g., "10/27/2025, 5:03:00 PM"
          const newMarker = {
            id: Date.now(),
            position: [latitude, longitude],
            name: newMarkerName || `Current location (${dateTime})`,
          }
          setLoc(newMarker)
          setMarkers([...markers, newMarker])
          setNewMarkerName('')
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Unable to get your location. Please enable location services.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const clearMarkers = () => {
    setMarkers([])
  }

  useEffect(() => {
    setCookie('customMarkers', JSON.stringify(markers))
  }, [markers])

  return (
    <div className="page">
      <div className="query-container">
        <div className="query">
          <h2>Ho Chun Yin Ryan</h2>
          <hr className="line" />
          <p>Predefined Locations</p>
          <div className="shop-button-container">
            <button className="shop-button"
            onClick= {()=>handleShopClick(defaultPos)}>
                {defaultPos.name}
            </button>
            <button className="shop-button"
            onClick= {()=>handleShopClick(locations[0])}>
                {locations[0].name}
            </button>
            <button className="shop-button"
            onClick= {()=>handleShopClick(locations[1])}>
                {locations[1].name}
            </button>
            <button className="shop-button"
            onClick= {()=>handleShopClick(locations[2])}>
                {locations[2].name}
            </button>
        </div>
          <hr className="line" />
            <div className="customMarker-container">
            <p>Add Custom Markers</p>
            <input
              type="text"
              placeholder="Name for new marker (optional)"
              value={newMarkerName}
              className="input"
              onChange={(e) => setNewMarkerName(e.target.value)}
            />
            <p style={{ fontSize: '14px' }}>
              <b>Click</b> anywhere to add markers
            </p>
            <div 
            className='info-container'>
              Custom markers: {markers.length} <br />
              Total markers: {markers.length + 4}
            </div>
            <button
              onClick={addCurrentLocationMarker}
              style={{
                padding: '10px 50px',
                marginBottom: '10px',
                color: 'white',
                fontSize: '14px',
              }}
            >
              Add My Location Marker
            </button>
            <button
              onClick={clearMarkers}
              style={{
                padding: '10px 50px',
                marginBottom: '10px',
                color: 'white',
                fontSize: '14px',
              }}
            >
              Clear Custom Markers ({markers.length})
            </button>
          </div>
          <hr className="line" />
          <div className="customMarker-container">
            <p>Custom Markers</p>
            <div className="shop-button-container">
              {markers.length === 0 ? (
                <p style={{ fontSize: '12px' }}>No custom markers added</p>
              ) : (
                markers.map((marker) => (
                  <button
                    key={marker.id}
                    className="shop-button"
                    onClick={() => handleCustomMarkerClick(marker)}
                  >
                    {marker.name}
                  </button>
                ))
              )}
            </div>
          </div>  
        </div>
      </div>
      <div className="map-container">
        <div style={{ height: '97%', width: '100%' }}>
          <MapContainer
            center={defaultPos.position}
            zoom={17}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <ChangeView center={loc.position} zoom={17} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={kirbyIconGreen}
              >
                <Popup>
                  <strong>{marker.name}</strong>
                  <br />
                  Custom Location
                  <br />
                  Position: {marker.position[0].toFixed(4)},{' '}
                  {marker.position[1].toFixed(4)}
                </Popup>
              </Marker>
            ))}
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={location.position}
                icon={FusionIcon}
              >
                <Popup>
                  <strong>{location.name}</strong>
                  <br />
                  Shop
                  <br />
                  Position: {location.position[0].toFixed(4)},{' '}
                  {location.position[1].toFixed(4)}
                </Popup>
              </Marker>
            ))}
            <Marker position={defaultPos.position} icon={kirbyIcon}>
              <Popup>
                <b>Chung Chi Gate</b>
                <br />
                  Default location
                <br />
                Position: {defaultPos.position[0].toFixed(4)},{' '}
                {defaultPos.position[1].toFixed(4)}
              </Popup>
            </Marker>
          </MapContainer>
          <div className="legend">
            <b>Selected</b>: {loc.name} | <b>Custom Markers</b>:{' '}
            {markers.length} | <b>Click</b> anywhere to add markers
          </div>
        </div>
      </div>
    </div>
  )
}

export default Map
