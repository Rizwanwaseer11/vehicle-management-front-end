// Canvas for Google Maps components

import { GoogleMap } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function BaseMap({ center, children, onMapClick }) {
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onClick={onMapClick}   // ✅ REQUIRED
    >
      {children}
    </GoogleMap>
  );
}

