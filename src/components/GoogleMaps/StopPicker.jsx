// // Component for picking stops on Google Maps


// import { Marker, Autocomplete } from "@react-google-maps/api";

// export default function StopPicker({ stops, setStops }) {
//   const addStop = (lat, lng, name = "Selected Stop") => {
//     setStops(prev => [
//       ...prev,
//       {
//         name,
//         latitude: lat,
//         longitude: lng,
//         order: prev.length + 1
//       }
//     ]);
//   };

//   return (
//     <>
//       <Autocomplete
//         onPlaceChanged={(e) => {
//           const place = e.getPlace();
//           if (!place?.geometry) return;

//           const lat = place.geometry.location.lat();
//           const lng = place.geometry.location.lng();

//           addStop(lat, lng, place.name);
//         }}
//       >
//         <input
//           className="w-full p-2 border rounded"
//           placeholder="Search stop location"
//         />
//       </Autocomplete>

//       {stops.map((s, i) => (
//         <Marker
//           key={i}
//           position={{ lat: Number(s.latitude), lng: Number(s.longitude) }}
//           label={`${s.order}`}
//         />
//       ))}
//     </>
//   );
// }


// // Component for picking stops on Google Maps


// import { Marker, Autocomplete } from "@react-google-maps/api";

// export default function StopPicker({ stops, setStops }) {
//   const addStop = (lat, lng, name = "Selected Stop") => {
//     setStops(prev => [
//       ...prev,
//       {
//         name,
//         latitude: lat,
//         longitude: lng,
//         order: prev.length + 1
//       }
//     ]);
//   };

//   return (
//     <>
//       <Autocomplete
//         onPlaceChanged={(e) => {
//           const place = e.getPlace();
//           if (!place?.geometry) return;

//           const lat = place.geometry.location.lat();
//           const lng = place.geometry.location.lng();

//           addStop(lat, lng, place.name);
//         }}
//       >
//         <input
//           className="w-full p-2 border rounded"
//           placeholder="Search stop location"
//         />
//       </Autocomplete>

//       {stops.map((s, i) => (
//         <Marker
//           key={i}
//           position={{ lat: Number(s.latitude), lng: Number(s.longitude) }}
//           label={`${s.order}`}
//         />
//       ))}
//     </>
//   );
// }

// import React, { useRef, memo } from "react";
// import { Marker, Autocomplete } from "@react-google-maps/api";

// function StopPicker({ stops, setStops }) {
//   const autoRef = useRef(null);

//   const handlePlaceChanged = () => {
//     const place = autoRef.current?.getPlace();
//     if (!place?.geometry) return;

//     const lat = place.geometry.location.lat();
//     const lng = place.geometry.location.lng();

//     setStops((prev) => [
//       ...prev,
//       {
//         name: place.formatted_address || place.name,
//         latitude: lat,
//         longitude: lng,
//         order: prev.length + 1,
//       },
//     ]);

//     // Clear input
//     if (autoRef.current?.getInputElement) {
//       autoRef.current.getInputElement().value = "";
//     }
//   };

//   return (
//     <>
//       {/* 🔍 SEARCH BAR */}
//       <div
//         style={{
//           position: "absolute",
//           top: 10,
//           left: 10,
//           zIndex: 9999,
//         }}
//         className="w-72 bg-white p-2 rounded shadow"
//       >
//         <Autocomplete
//           onLoad={(ref) => (autoRef.current = ref)}
//           onPlaceChanged={handlePlaceChanged}
//         >
//           <input
//             type="text"
//             placeholder="Search stop location"
//             className="w-full border px-3 py-2 rounded"
//           />
//         </Autocomplete>
//       </div>

//       {/* 📍 MARKERS */}
//       {stops.map((s) => (
//         <Marker
//           key={s.order} // unique key
//           position={{ lat: s.latitude, lng: s.longitude }}
//           label={`${s.order}`}
//         />
//       ))}
//     </>
//   );
// }

// export default memo(StopPicker);

import React, { memo } from "react";
import { Marker } from "@react-google-maps/api";

function StopPicker({ stops }) {
  // Safe check to ensure stops is always an array
  const safeStops = Array.isArray(stops) ? stops : [];

  return (
    <>
      {safeStops.map((s, index) => {
        // Only render if we have valid coordinates
        if (!s.latitude || !s.longitude) return null;

        return (
          <Marker
            key={`${s.order}-${index}`}
            position={{ 
              lat: Number(s.latitude), 
              lng: Number(s.longitude) 
            }}
            label={{
              text: `${index + 1}`,
              color: "white",
              fontWeight: "bold"
            }}
            title={s.name} // Hover text
          />
        );
      })}
    </>
  );
}

export default memo(StopPicker);






