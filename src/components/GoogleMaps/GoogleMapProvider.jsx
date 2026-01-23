// generates goggle maps only ones


import { LoadScript } from "@react-google-maps/api";

const libraries = ["places"];

export default function GoogleMapProvider({ children }) {
  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
      libraries={["places"]}
    >
      {children}
    </LoadScript>
  );
}
