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


export function calculateRoute(stops) {
  return new Promise((resolve, reject) => {
    if (!window.google || stops.length < 2) {
      reject(new Error("Google Maps not loaded or insufficient stops"));
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: {
          lat: Number(stops[0].latitude),
          lng: Number(stops[0].longitude),
        },
        destination: {
          lat: Number(stops[stops.length - 1].latitude),
          lng: Number(stops[stops.length - 1].longitude),
        },
        waypoints: stops.slice(1, -1).map(s => ({
          location: {
            lat: Number(s.latitude),
            lng: Number(s.longitude),
          },
          stopover: true,
        })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status !== "OK") {
          reject(new Error("Route calculation failed"));
          return;
        }

        const totalMeters = result.routes[0].legs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        );

        resolve({
          polyline: result.routes[0].overview_polyline.points,
          totalKm: (totalMeters / 1000).toFixed(2),
        });
      }
    );
  });
}

