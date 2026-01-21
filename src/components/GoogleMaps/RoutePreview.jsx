// preview ROutes on Google Maps

import { Polyline } from "@react-google-maps/api";
import polyline from "@mapbox/polyline";

export default function RoutePreview({ encodedPolyline }) {
  if (!encodedPolyline) return null;

  const path = polyline.decode(encodedPolyline).map(p => ({
    lat: p[0],
    lng: p[1],
  }));

  return (
    <Polyline
      path={path}
      options={{
        strokeColor: "#2563eb",
        strokeWeight: 4,
      }}
    />
  );
}
