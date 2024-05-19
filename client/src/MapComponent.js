import React, { useCallback, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 43.653226,
  lng: -79.3831843
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
    featureType: 'road.highway',
    elementType: 'geometry',
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

const MapComponent = forwardRef(({ markers }, ref) => {
  const mapRef = useRef();
  const [selectedMarker, setSelectedMarker] = useState(null);

  const onLoad = useCallback(function callback(map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = undefined;
  }, []);

  useImperativeHandle(ref, () => ({
    focusOnMarker: (marker) => {
      mapRef.current.panTo({ lat: marker.latitude, lng: marker.longitude });
      mapRef.current.setZoom(14);
      setSelectedMarker(marker);
    }
  }));

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={2}
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
});

export default React.memo(MapComponent);
