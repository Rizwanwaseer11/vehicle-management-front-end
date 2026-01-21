import React from "react";
import { Plus, Pencil, MapPin, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import GoogleMapProvider from "@/components/GoogleMaps/GoogleMapProvider";
import BaseMap from "@/components/GoogleMaps/BaseMap";
import StopPicker from "@/components/GoogleMaps/StopPicker";
import RoutePreview from "@/components/GoogleMaps/RoutePreview";
import { calculateRoute } from "@/components/GoogleMaps/useRouteCalculator";

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 }; // Karachi

export default function ManageRoutes() {
  const [open, setOpen] = React.useState(false);
  const [editRoute, setEditRoute] = React.useState(null);
  const [routes, setRoutes] = React.useState([]);
  const [drivers, setDrivers] = React.useState([]);
  const [buses, setBuses] = React.useState([]);

  const [routePolyline, setRoutePolyline] = React.useState("");
  const [isCalculating, setIsCalculating] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);

  const token = localStorage.getItem("token");

  const [form, setForm] = React.useState({
    routeName: "",
    driver: "",
    bus: "",
    startTime: "",
    endTime: "",
    totalKm: "",
    stops: [],
  });

  /* ================= FORM SYNC ================= */
  React.useEffect(() => {
    if (editRoute) {
      setForm({
        routeName: editRoute.routeName || "",
        driver: editRoute.driver?._id || "",
        bus: editRoute.bus?._id || "",
        startTime: editRoute.startTime
          ? new Date(editRoute.startTime).toISOString().slice(0, 16)
          : "",
        endTime: editRoute.endTime
          ? new Date(editRoute.endTime).toISOString().slice(0, 16)
          : "",
        totalKm: editRoute.totalKm?.toString() || "",
        stops:
          editRoute.stops?.length > 0
            ? editRoute.stops
                .sort((a, b) => a.order - b.order)
                .map((s, i) => ({
                  name: s.name || `Stop ${i + 1}`,
                  latitude: s.latitude || "",
                  longitude: s.longitude || "",
                  order: s.order ?? i + 1,
                }))
            : [],
      });
    } else {
      setForm({
        routeName: "",
        driver: "",
        bus: "",
        startTime: "",
        endTime: "",
        totalKm: "",
        stops: [],
      });
    }

    setRoutePolyline("");
    setShowMap(false);
  }, [editRoute]);

  /* ================= FETCH DATA ================= */
  React.useEffect(() => {
    fetchTrips();
    fetchDrivers();
    fetchBuses();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch(
        "https://vehicle-management-ecru.vercel.app/api/trips/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setRoutes(Array.isArray(data.trips) ? data.trips : []);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setRoutes([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch(
        "https://vehicle-management-ecru.vercel.app/api/trips/available-drivers",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setDrivers([]);
    }
  };

  const fetchBuses = async () => {
    try {
      const res = await fetch(
        "https://vehicle-management-ecru.vercel.app/api/buses/available-buses",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setBuses(Array.isArray(data.buses) ? data.buses : []);
    } catch (err) {
      console.error("Error fetching buses:", err);
      setBuses([]);
    }
  };

  /* ================= STOPS ================= */
  const addStop = () => {
    setForm((prev) => ({
      ...prev,
      stops: [
        ...prev.stops,
        {
          name: `Stop ${prev.stops.length + 1}`,
          latitude: "",
          longitude: "",
          order: prev.stops.length + 1,
        },
      ],
    }));
  };

  const updateStop = (i, field, value) => {
    const updated = [...form.stops];
    updated[i][field] = value;
    setForm({ ...form, stops: updated });
    setRoutePolyline("");
  };

  /* ================= CALCULATE ROUTE ================= */
  const handleCalculateRoute = async () => {
    try {
      setIsCalculating(true);

      const validStops = form.stops
        .filter(
          (s) =>
            s.latitude !== "" &&
            s.longitude !== "" &&
            !isNaN(Number(s.latitude)) &&
            !isNaN(Number(s.longitude))
        )
        .map((s) => ({ lat: Number(s.latitude), lng: Number(s.longitude) }));

      if (validStops.length < 2) {
        alert("Add at least 2 stops with valid coordinates.");
        return;
      }

      const result = await calculateRoute(validStops);
      setRoutePolyline(result.polyline);
      setForm((prev) => ({ ...prev, totalKm: result.totalKm }));
    } catch (err) {
      console.error("Route calculation error:", err);
      alert(
        "Error calculating route. Check if Google Maps APIs are enabled and billing is active."
      );
    } finally {
      setIsCalculating(false);
    }
  };

  /* ================= REVERSE GEOCODE ================= */
  const getAddressFromLatLng = async (lat, lng) => {
    if (!window.google || !window.google.maps.Geocoder) {
      return `Stop ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) resolve(results[0].formatted_address);
        else resolve(`Stop ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      });
    });
  };

  /* ================= CREATE / UPDATE ================= */
  const handleCreateOrUpdate = async () => {
    if (!routePolyline) {
      alert("Please calculate route before saving.");
      return;
    }

    const payload = {
      ...form,
      totalKm: Number(form.totalKm),
      stops: form.stops.map((s) => ({
        ...s,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        order: Number(s.order),
      })),
      routePolyline,
    };

    const url = editRoute
      ? `https://vehicle-management-ecru.vercel.app/api/trips/${editRoute._id}`
      : "https://vehicle-management-ecru.vercel.app/api/trips/";

    try {
      await fetch(url, {
        method: editRoute ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      setOpen(false);
      setEditRoute(null);
      fetchTrips();
      fetchDrivers();
    } catch (err) {
      console.error("Error creating/updating route:", err);
      alert("Failed to save route. Check console for details.");
    }
  };

  /* ================= EDIT / TOGGLE ================= */
  const handleEditRoute = (route) => setEditRoute(route);

  const toggleActive = async (routeId, currentStatus) => {
    try {
      await fetch(`https://vehicle-management-ecru.vercel.app/api/trips/${routeId}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchTrips();
    } catch (err) {
      console.error("Failed to toggle active:", err);
    }
  };

  return (
    <GoogleMapProvider>
      <div className="pl-64 pt-20 pr-6 pb-6 min-h-screen w-full bg-gray-200 dark:bg-gray-700 space-y-6">
        {/* === ADD / EDIT DIALOG === */}
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditRoute(null); }}>
          <DialogTrigger asChild>
            <Button className="flex gap-2"><Plus size={16} /> {editRoute ? "Edit Route" : "Add Route"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader><DialogTitle>{editRoute ? "Edit Route" : "Add New Route"}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Route Name" value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })} />
              <Select value={form.driver} onValueChange={(v) => setForm({ ...form, driver: v })}>
                <SelectTrigger><SelectValue placeholder="Assign Driver" /></SelectTrigger>
                <SelectContent>{drivers.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.bus} onValueChange={(v) => setForm({ ...form, bus: v })}>
                <SelectTrigger><SelectValue placeholder="Assign Bus" /></SelectTrigger>
                <SelectContent>{buses.map((b) => <SelectItem key={b._id} value={b._id}>{b.number}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />

              {form.stops.map((s, i) => (
                <div key={i} className="space-y-1">
                  <Input value={s.name} placeholder="Stop Name" readOnly />
                  <Input value={s.latitude} placeholder="Latitude" readOnly />
                  <Input value={s.longitude} placeholder="Longitude" readOnly />
                </div>
              ))}

              <Button variant="outline" onClick={addStop}>+ Add Stop</Button>
              <Button variant="outline" onClick={() => setShowMap(!showMap)}>📍 Pick Stops From Map</Button>

              {showMap && (
                <BaseMap
                  center={DEFAULT_CENTER}
                  onMapClick={async (e) => {
                    if (!e?.latLng) return;
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    const address = await getAddressFromLatLng(lat, lng);
                    setForm((prev) => ({ ...prev, stops: [...prev.stops, { name: address, latitude: lat, longitude: lng, order: prev.stops.length + 1 }] }));
                    setRoutePolyline("");
                  }}
                >
                  <StopPicker stops={form.stops} setStops={(stops) => setForm({ ...form, stops })} />
                  <RoutePreview encodedPolyline={routePolyline} />
                </BaseMap>
              )}

              <Button disabled={isCalculating || form.stops.length < 2} onClick={handleCalculateRoute}>
                {isCalculating ? "Calculating..." : "Calculate Route"}
              </Button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); setEditRoute(null); }}>Cancel</Button>
              <Button onClick={handleCreateOrUpdate}>{editRoute ? "Update Route" : "Create Route"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* === DASHBOARD TABLE === */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th>Route</th>
                <th>Driver</th>
                <th>Bus</th>
                <th>Stops</th>
                <th>KM</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className="text-center">{r.routeName}</td>
                  <td className="text-center">{r.driver?.name}</td>
                  <td className="text-center">{r.bus?.number}</td>
                  <td className="text-center">{r.stops.length}</td>
                  <td className="text-center">{r.totalKm} km</td>
                  <td className="text-center align-middle">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(r._id, r.isActive)}>
                      {r.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                  </td>
                  <td className="flex gap-2 justify-center items-center">
                    <Button size="sm" variant="outline" onClick={() => handleEditRoute(r)}><Pencil size={16} /></Button>
                    <MapPin size={16} className="cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GoogleMapProvider>
  );
}
