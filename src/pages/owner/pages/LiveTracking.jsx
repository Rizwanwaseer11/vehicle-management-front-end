import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Navigation } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import RoutePreview from "../../../components/GoogleMaps/RoutePreview";
import StopPicker from "../../../components/GoogleMaps/StopPicker";
import { io } from "socket.io-client";

const API_BASE = "https://vehicle-management-ecru.vercel.app/api";
const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

const BUS_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#2563eb">
     <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1.78c.61-.55 1-1.34 1-2.22V7c0-3-3.58-3-8-3S4 4 4 7v9zM7 17a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm10 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM6 10V7c0-1 2-1 6-1s6 0 6 1v3H6z"/>
   </svg>`,
);

const BUS_ICON = { url: `data:image/svg+xml;utf8,${BUS_SVG}` };

function LiveTracking() {
  const token = localStorage.getItem("token");
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const animationsRef = useRef({});
  const busPositionsRef = useRef({});

  const [activeTrips, setActiveTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [busPositions, setBusPositions] = useState({});
  const [socketConnected, setSocketConnected] = useState(false);

  const selectedTrip = useMemo(
    () => activeTrips.find((t) => t._id === selectedTripId) || null,
    [activeTrips, selectedTripId],
  );

  const selectedPolyline = selectedTrip?.polyline || selectedTrip?.routePolyline;

  const deriveInitialPosition = (trip) => {
    const loc = trip?.currentLocation || trip?.lastLocation || trip?.location;
    if (loc?.latitude && loc?.longitude) {
      return {
        lat: Number(loc.latitude),
        lng: Number(loc.longitude),
        speed: loc.speed ?? null,
        heading: loc.heading ?? null,
        updatedAt: loc.updatedAt ? new Date(loc.updatedAt).getTime() : null,
      };
    }
    if (loc?.lat && loc?.lng) {
      return {
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        speed: loc.speed ?? null,
        heading: loc.heading ?? null,
        updatedAt: loc.updatedAt ? new Date(loc.updatedAt).getTime() : null,
      };
    }
    const safeStops = Array.isArray(trip?.stops) ? trip.stops : [];
    const stopIndex =
      typeof trip?.currentStopIndex === "number" ? trip.currentStopIndex : 0;
    const stop = safeStops[stopIndex] || safeStops[0];
    if (stop?.latitude && stop?.longitude) {
      return {
        lat: Number(stop.latitude),
        lng: Number(stop.longitude),
        speed: null,
        heading: null,
        updatedAt: null,
      };
    }
    return {
      lat: DEFAULT_CENTER.lat,
      lng: DEFAULT_CENTER.lng,
      speed: null,
      heading: null,
      updatedAt: null,
    };
  };

  const reconcilePositions = (nextTrips) => {
    const activeIds = new Set(nextTrips.map((t) => t._id));
    const nextPositions = { ...busPositionsRef.current };

    Object.keys(nextPositions).forEach((tripId) => {
      if (!activeIds.has(tripId)) {
        delete nextPositions[tripId];
      }
    });

    nextTrips.forEach((trip) => {
      if (!nextPositions[trip._id]) {
        nextPositions[trip._id] = deriveInitialPosition(trip);
      }
    });

    busPositionsRef.current = nextPositions;
    setBusPositions(nextPositions);
  };

  const fetchTrips = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/trips/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const allTrips = Array.isArray(data.trips) ? data.trips : [];
      const liveTrips = allTrips.filter(
        (trip) =>
          !trip.isTemplate &&
          String(trip.status).toUpperCase() === "ONGOING" &&
          trip.isActive === true,
      );
      setActiveTrips(liveTrips);
      reconcilePositions(liveTrips);
      if (!selectedTripId && liveTrips.length > 0) {
        setSelectedTripId(liveTrips[0]._id);
      } else if (
        selectedTripId &&
        !liveTrips.find((t) => t._id === selectedTripId)
      ) {
        setSelectedTripId(liveTrips[0]?._id || null);
      }
    } catch (err) {
      console.error("Failed to fetch trips:", err);
      setActiveTrips([]);
    }
  };

  const animateTo = (tripId, next) => {
    const start = busPositionsRef.current[tripId] || next;
    const duration = 800;

    if (animationsRef.current[tripId]) {
      cancelAnimationFrame(animationsRef.current[tripId]);
    }

    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const lat = start.lat + (next.lat - start.lat) * progress;
      const lng = start.lng + (next.lng - start.lng) * progress;
      const current = { ...next, lat, lng };

      busPositionsRef.current = {
        ...busPositionsRef.current,
        [tripId]: current,
      };
      setBusPositions((prev) => ({ ...prev, [tripId]: current }));

      if (progress < 1) {
        animationsRef.current[tripId] = requestAnimationFrame(step);
      }
    };

    animationsRef.current[tripId] = requestAnimationFrame(step);
  };

  useEffect(() => {
    fetchTrips();
    const interval = setInterval(fetchTrips, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const socket = io(API_BASE.replace("/api", ""), {
      auth: { token, role: "admin" },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    socket.on("admin_fleet_update", (payload) => {
      const { tripId, lat, lng, heading, speed } = payload || {};
      if (!tripId || lat === undefined || lng === undefined) return;
      const next = {
        lat: Number(lat),
        lng: Number(lng),
        heading: heading ?? null,
        speed: speed ?? null,
        updatedAt: Date.now(),
      };
      animateTo(tripId, next);
    });

    return () => {
      socket.off("admin_fleet_update");
      socket.disconnect();
      Object.values(animationsRef.current).forEach((id) =>
        cancelAnimationFrame(id),
      );
    };
  }, [token]);

  useEffect(() => {
    if (!mapRef.current || !selectedTrip) return;
    const selectedPos = busPositions[selectedTrip._id];
    const safeStops = Array.isArray(selectedTrip.stops)
      ? selectedTrip.stops
      : [];
    const stop = safeStops[0];
    const center = selectedPos
      ? { lat: selectedPos.lat, lng: selectedPos.lng }
      : stop?.latitude && stop?.longitude
        ? { lat: Number(stop.latitude), lng: Number(stop.longitude) }
        : DEFAULT_CENTER;
    mapRef.current.panTo(center);
  }, [selectedTripId, selectedTrip, busPositions]);

  return (
    <div className="antialiased w-full min-h-screen bg-gray-50 dark:bg-gray-800/95 md:ml-64 pt-16 md:pt-20 px-4 mt-4 md:px-6 lg:px-8">
      <div className="mb-3">
        <h1 className="text-xl md:text-xl font-bold text-gray-700 dark:text-white ">
          Live Bus Tracking
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Real-time location and status of all buses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-md p-0 border overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full h-[250px] md:h-[380px] lg:h-[420px] relative overflow-hidden">
                <GoogleMap
                  mapContainerStyle={MAP_CONTAINER_STYLE}
                  center={DEFAULT_CENTER}
                  zoom={12}
                  onLoad={(map) => {
                    mapRef.current = map;
                  }}
                >
                  {selectedPolyline && (
                    <RoutePreview encodedPolyline={selectedPolyline} />
                  )}
                  {selectedTrip?.stops && (
                    <StopPicker stops={selectedTrip.stops} />
                  )}
                  {activeTrips.map((trip) => {
                    const pos = busPositions[trip._id];
                    if (!pos) return null;
                    return (
                      <MarkerF
                        key={trip._id}
                        position={{ lat: pos.lat, lng: pos.lng }}
                        icon={BUS_ICON}
                        title={trip.bus?.number || trip.routeName}
                      />
                    );
                  })}
                </GoogleMap>
                {!activeTrips.length && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 bg-white/60">
                    No active buses at the moment.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 ">
          <Card className="shadow-md border-0 dark:bg-gray-900/70">
            <CardHeader className="pb-1">
              <CardTitle className="text-gray-700 dark:text-gray-200 ">
                Active Buses
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {activeTrips.length} buses on route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-[300px] overflow-y-auto pr-2">
                {activeTrips.map((trip) => {
                  const pos = busPositions[trip._id];
                  const isSelected = trip._id === selectedTripId;
                  const speedLabel =
                    pos?.speed !== null && pos?.speed !== undefined
                      ? `${pos.speed} km/h`
                      : "-";
                  return (
                    <div
                      key={trip._id}
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border
                     border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600
                      transition-colors text-sm cursor-pointer"
                      onClick={() => setSelectedTripId(trip._id)}
                      style={{
                        borderColor: isSelected ? "#2563eb" : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-700 dark:text-white text-sm">
                          {trip.bus?.number || trip.routeName}
                        </p>
                        <Badge
                          className={
                            speedLabel === "0 km/h"
                              ? "bg-red-500 hover:bg-red-600 text-white text-xs"
                              : "bg-green-500 hover:bg-green-600 text-white text-xs"
                          }
                        >
                          {speedLabel === "0 km/h" ? "Stopped" : "Moving"}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {trip.routeName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Driver: {trip.driver?.name || "-"}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Navigation className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {speedLabel} -{" "}
                          {pos?.updatedAt
                            ? `Updated ${new Date(pos.updatedAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}`
                            : "Waiting for GPS"}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {!activeTrips.length && (
                  <div className="text-sm text-gray-500 py-6 text-center">
                    No active trips right now.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-gray-400">
            Socket: {socketConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveTracking;
