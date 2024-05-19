import React, { useCallback, useRef, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 45.4215,
  lng: -75.6972
};

const mapOptions = {
  streetViewControl: false,  // Disable Street View
  mapTypeControl: false,     // Disable Map Type (Satellite/Map) Control
  fullscreenControl: false,  // Disable Fullscreen Control
  zoomControl: true,         // Enable Zoom Control
  scaleControl: true,        // Enable Scale Control
  rotateControl: false,      // Disable Rotate Control
  styles: [
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.school',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.attraction',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.government',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.medical',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.park',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.place_of_worship',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'poi.sports_complex',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const MapComponent = ({ markers }) => {
  const mapRef = useRef();
  const [selectedMarker, setSelectedMarker] = useState(null);

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = undefined;
  }, []);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={{
              lat: marker.latitude,
              lng: marker.longitude
            }}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{
              lat: selectedMarker.latitude,
              lng: selectedMarker.longitude
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h2>{selectedMarker.title}</h2>
              <p>{selectedMarker.summary}</p>
              <p>Location: {selectedMarker.location}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default React.memo(MapComponent);
