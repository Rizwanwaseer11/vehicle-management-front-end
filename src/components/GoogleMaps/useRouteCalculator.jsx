// // calculates route using Google Maps Directions API

// import polyline from "@mapbox/polyline";

// export async function calculateRoute(stops) {
//   if (stops.length < 2) {
//     throw new Error("At least 2 stops required to calculate route");
//   }

//   const origin = `${stops[0].latitude},${stops[0].longitude}`;
//   const destination = `${stops[stops.length - 1].latitude},${stops[stops.length - 1].longitude}`;

//   const waypoints = stops
//     .slice(1, -1)
//     .map(s => `${s.latitude},${s.longitude}`)
//     .join("|");

//   const url = `https://maps.googleapis.com/maps/api/directions/json
//     ?origin=${origin}
//     &destination=${destination}
//     &waypoints=${waypoints}
//     &key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`;

//   const res = await fetch(url);
//   const data = await res.json();

//   if (data.status !== "OK") {
//     throw new Error(data.error_message || "Failed to calculate route");
//   }

//   const route = data.routes[0];
//   const totalMeters = route.legs.reduce(
//     (sum, l) => sum + l.distance.value,
//     0
//   );

//   return {
//     polyline: route.overview_polyline.points,
//     totalKm: (totalMeters / 1000).toFixed(2)
//   };
// }


// export function calculateRoute(stops) {
//   return new Promise((resolve, reject) => {
//     if (!window.google || stops.length < 2) {
//       reject(new Error("Google Maps not loaded or insufficient stops"));
//       return;
//     }

//     const directionsService = new window.google.maps.DirectionsService();

//     directionsService.route(
//       {
//         origin: {
//           lat: Number(stops[0].latitude),
//           lng: Number(stops[0].longitude),
//         },
//         destination: {
//           lat: Number(stops[stops.length - 1].latitude),
//           lng: Number(stops[stops.length - 1].longitude),
//         },
//         waypoints: stops.slice(1, -1).map(s => ({
//           location: {
//             lat: Number(s.latitude),
//             lng: Number(s.longitude),
//           },
//           stopover: true,
//         })),
//         travelMode: window.google.maps.TravelMode.DRIVING,
//       },
//       (result, status) => {
//         if (status !== "OK") {
//           reject(new Error("Route calculation failed"));
//           return;
//         }

//         const totalMeters = result.routes[0].legs.reduce(
//           (sum, leg) => sum + leg.distance.value,
//           0
//         );

//         resolve({
//           polyline: result.routes[0].overview_polyline.points,
//           totalKm: (totalMeters / 1000).toFixed(2),
//         });
//       }
//     );
//   });
// }

export function calculateRoute(stops) {
  return new Promise((resolve, reject) => {
    console.log("🟡 calculateRoute called");
    console.log("🟡 Stops received:", stops);
    
    if (!window.google || !Array.isArray(stops) || stops.length < 2) {
      console.error("❌ Google not loaded or insufficient stops");
      reject(new Error("Google Maps not loaded or insufficient stops"));
      return;
    }

    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const originLat = toNumber(stops[0]?.latitude);
    const originLng = toNumber(stops[0]?.longitude);
    const destLat = toNumber(stops[stops.length - 1]?.latitude);
    const destLng = toNumber(stops[stops.length - 1]?.longitude);

    if (
      originLat === null ||
      originLng === null ||
      destLat === null ||
      destLng === null
    ) {
      reject(new Error("Invalid latitude or longitude"));
      return;
    }

    const waypoints = stops
      .slice(1, -1)
      .map((s) => {
        const lat = toNumber(s.latitude);
        const lng = toNumber(s.longitude);
        if (lat === null || lng === null) return null;
        return {
          location: { lat, lng },
          stopover: true,
        };
      })
      .filter(Boolean);

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { lat: originLat, lng: originLng },
        destination: { lat: destLat, lng: destLng },
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        console.log("📡 Directions API status:", status);
        
        if (status !== "OK" || !result?.routes?.length) {
          reject(new Error("Route calculation failed"));
          return;
        }

        const totalMeters = result.routes[0].legs.reduce(
          (sum, leg) => sum + (leg.distance?.value || 0),
          0
        );

        // ✅ FIXED HERE: Removed .points
        // overview_polyline is usually a string directly in the JS API
        resolve({
          polyline: result.routes[0].overview_polyline, 
          totalKm: (totalMeters / 1000).toFixed(2),
        });
      }
    );
  });
}