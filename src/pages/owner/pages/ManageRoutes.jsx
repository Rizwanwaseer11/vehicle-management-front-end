import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Pencil,
  Eye,
  EyeOff,
  X,
  Search,
  Map as MapIcon,
  Calculator,
  Loader2,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Label } from "@/components/ui/label";

// ✅ Import your Map Components
import BaseMap from "@/components/GoogleMaps/BaseMap";
import StopPicker from "@/components/GoogleMaps/StopPicker";
import RoutePreview from "@/components/GoogleMaps/RoutePreview";
import { calculateRoute } from "@/components/GoogleMaps/useRouteCalculator";

const DEFAULT_CENTER = { lat: 24.8607, lng: 67.0011 }; // Karachi

const getInitialFormState = () => ({
  routeName: "",
  driver: "",
  bus: "",
  startTime: "",
  endTime: "",
  totalKm: "",
  stops: [],
});

// ============================================================================
// ✅ CUSTOM SEARCH COMPONENT (Uses Service API - No Widget Bugs)
// ============================================================================
const StopSearchInput = ({ onPlaceSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Google Services Refs
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    // Initialize Google Services purely for Data (No UI Widget)
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      // Dummy div needed for PlacesService to work
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement("div"),
      );
    }
  }, []);

  // Handle Typing
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (!val || val.length < 3) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (autocompleteService.current) {
      setLoading(true);
      autocompleteService.current.getPlacePredictions(
        { input: val }, // Removing 'types' restriction allows Cities + Businesses
        (results, status) => {
          setLoading(false);
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            setPredictions(results);
            setIsOpen(true);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        },
      );
    }
  };

  // Handle Selection
  const handleSelect = (placeId, description) => {
    setInputValue(description); // Show name in input temporarily
    setIsOpen(false);

    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: placeId,
          fields: ["name", "geometry", "formatted_address"], // Explicitly ask for Lat/Lng
        },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place.geometry
          ) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            console.log("✅ Place Found:", { name: place.name, lat, lng });

            onPlaceSelect({
              name: place.name || description,
              latitude: lat,
              longitude: lng,
            });

            setInputValue(""); // Clear input after successful add
          } else {
            alert(
              "Could not fetch details for this location. Please try another.",
            );
          }
        },
      );
    }
  };

  return (
    <div className="relative w-full z-50">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search location (e.g. Sukkur)"
          className="pl-9 w-full"
          autoComplete="off" // Disable browser default autocomplete
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Custom Dropdown List */}
      {isOpen && predictions.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md 
        shadow-lg max-h-60 overflow-y-auto z-100"
        >
          {predictions.map((item) => (
            <li
              key={item.place_id}
              className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b 
              last:border-0 border-gray-50 flex flex-col"
              onClick={() => handleSelect(item.place_id, item.description)}
            >
              <span className="font-medium text-gray-900">
                {item.structured_formatting.main_text}
              </span>
              <span className="text-xs text-gray-500">
                {item.structured_formatting.secondary_text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function ManageRoutes() {
  const [open, setOpen] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);

  const [routePolyline, setRoutePolyline] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const token = localStorage.getItem("token");
  const [form, setForm] = useState(getInitialFormState());

  // ... (Existing useEffects and Fetch logic remain exactly the same)
  /* ================= 1. FORM & DATA SYNC ================= */
  useEffect(() => {
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
        stops: Array.isArray(editRoute.stops)
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
      setRoutePolyline(editRoute.routePolyline || "");
    } else {
      setForm(getInitialFormState());
      setRoutePolyline("");
    }
  }, [editRoute, open]);

  /* ================= 2. FETCH DATA ================= */
  useEffect(() => {
    fetchTrips();
    fetchDrivers();
    fetchBuses();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch(
        "https://vehicle-management-ecru.vercel.app/api/trips/",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setRoutes(Array.isArray(data.trips) ? data.trips : []);
    } catch (err) {
      setRoutes([]);
    }
  };
  const fetchDrivers = async () => {
    try {
      const res = await fetch(
        "https://vehicle-management-ecru.vercel.app/api/trips/available-drivers",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
    } catch (err) {
      setDrivers([]);
    }
  };
  const fetchBuses = async () => {
    try {
      const res = await fetch(
        "https://vehicle-management-ecru.vercel.app/api/buses/available-buses",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setBuses(Array.isArray(data.buses) ? data.buses : []);
    } catch (err) {
      setBuses([]);
    }
  };

  // ... (Handlers)
  const handleAddNew = () => {
    setEditRoute(null);
    setForm(getInitialFormState());
    setRoutePolyline("");
    setOpen(true);
    setShowMap(false);
  };
  const handleEditRoute = (route) => {
    setEditRoute(route);
    setOpen(true);
    setShowMap(false);
  };

  // ✅ UNIFIED STOP HANDLER
  const handleAddStop = (stopData) => {
    if (
      !stopData ||
      stopData.latitude === undefined ||
      stopData.longitude === undefined
    ) {
      alert("Invalid location data.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      stops: [
        ...(Array.isArray(prev.stops) ? prev.stops : []),
        {
          name: stopData.name,
          latitude: Number(stopData.latitude),
          longitude: Number(stopData.longitude),
          order: (prev.stops?.length || 0) + 1,
        },
      ],
    }));
    setRoutePolyline(""); // Reset polyline
  };

  const addManualStop = () => {
    const nextOrder = (form.stops?.length || 0) + 1;
    setForm((prev) => ({
      ...prev,
      stops: [
        ...(prev.stops || []),
        {
          name: `Stop ${nextOrder}`,
          latitude: "",
          longitude: "",
          order: nextOrder,
        },
      ],
    }));
  };

  const updateStopValue = (index, field, value) => {
    const newStops = [...form.stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setForm({ ...form, stops: newStops });
    setRoutePolyline("");
  };

  const removeStop = (indexToRemove) => {
    setForm((prev) => {
      const currentStops = Array.isArray(prev.stops) ? prev.stops : [];
      const filteredStops = currentStops.filter(
        (_, idx) => idx !== indexToRemove,
      );
      const reorderedStops = filteredStops.map((stop, idx) => ({
        ...stop,
        order: idx + 1,
      }));
      return { ...prev, stops: reorderedStops };
    });
    setRoutePolyline("");
  };

  const getAddressFromLatLng = async (lat, lng) => {
    if (!window.google) return `Map Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0])
          resolve(results[0].formatted_address);
        else resolve(`Map Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      });
    });
  };

  /* ================= CALCULATE & SAVE ================= */
  const handleCalculateRoute = async () => {
    try {
      setIsCalculating(true);
      const currentStops = Array.isArray(form.stops) ? form.stops : [];
      const validStops = currentStops.filter(
        (s) => s.latitude && s.longitude && !isNaN(s.latitude),
      );

      if (validStops.length < 2) {
        alert("Add at least 2 stops with valid coordinates.");
        setIsCalculating(false);
        return;
      }

      const result = await calculateRoute(validStops);
      const finalPolyline = result.polyline || result.encodedPolyline || "";

      if (!finalPolyline) {
        alert("Route Calculated but Polyline is missing.");
        return;
      }
      setRoutePolyline(finalPolyline);
      setForm((prev) => ({ ...prev, totalKm: result.totalKm }));
    } catch (err) {
      console.error(err);
      alert("Error calculating route: " + err.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!routePolyline) {
      alert("Please calculate route before saving.");
      return;
    }
    const stopsToSave = Array.isArray(form.stops) ? form.stops : [];
    const payload = {
      ...form,
      totalKm: Number(form.totalKm),
      stops: stopsToSave.map((s) => ({
        ...s,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        order: Number(s.order),
      })),
      routePolyline: routePolyline,
    };

    const url = editRoute
      ? `https://vehicle-management-ecru.vercel.app/api/trips/${editRoute._id}`
      : "https://vehicle-management-ecru.vercel.app/api/trips/";

    try {
      const res = await fetch(url, {
        method: editRoute ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        setEditRoute(null);
        fetchTrips();
      } else {
        alert("Failed to save route");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const toggleActive = async (routeId, currentStatus) => {
    try {
      await fetch(
        `https://vehicle-management-ecru.vercel.app/api/trips/${routeId}/toggle`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        },
      );
      fetchTrips();
    } catch (err) {
      console.error("Failed to toggle active:", err);
    }
  };

  return (
    <div
      className="antialiased w-full min-h-screen bg-gray-200 dark:bg-gray-800/95 md:ml-64 pt-16 
    md:pt-20 px-4 md:px-6 lg:px-8 pl-0 md:pl-64 mt-5  pr-4 pb-6  "
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* === DIALOG === */}
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditRoute(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="flex gap-2 shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddNew}
            >
              <Plus size={16} />{" "}
              <span className="hidden sm:inline">Add Route</span>{" "}
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-3xl flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-gray-800 rounded-none sm:rounded-lg">
            <DialogHeader className="p-4 border-b shrink-0 flex flex-col justify-between">
              <DialogTitle className="text-lg font-bold">
                {editRoute ? "Edit Route" : "Create New Route"}
              </DialogTitle>
              {/* ✅ FIXED: Added Description to silence Warning */}
              <DialogDescription className="text-xs text-gray-500">
                Enter details, search for stops, or pick them on the map.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-4 md:p-6  space-y-6">
              {/* DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1  md:col-span-2">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                    Route Name
                  </Label>
                  <Input
                    placeholder="e.g. Express Line 101"
                    value={form.routeName}
                    onChange={(e) =>
                      setForm({ ...form, routeName: e.target.value })
                    }
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5 ">
                  <Label className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                    Driver
                  </Label>
                  <Select
                    value={form.driver}
                    onValueChange={(v) => setForm({ ...form, driver: v })}
                  >
                    <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all rounded-lg shadow-sm hover:border-gray-400">
                      <SelectValue placeholder="Select Driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 -translate-x-40">
                  <Label className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                    Bus
                  </Label>
                  <Select
                    value={form.bus}
                    onValueChange={(v) => setForm({ ...form, bus: v })}
                  >
                    <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all rounded-lg shadow-sm hover:border-gray-400">
                      <SelectValue placeholder="Select Bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" /> Start Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    className="h-11 text-sm border-gray-300 dark:border-gray-600
                     dark:bg-gray-700 dark:text-white focus:ring-2 
                     focus:ring-blue-500 focus:border-transparent transition-all 
                     rounded-lg shadow-sm hover:border-gray-400"
                  />
                </div>
                <br />
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" /> End Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    className="h-11 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all rounded-lg shadow-sm hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 my-2"></div>

              {/* STOPS MANAGEMENT */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                    Stops Management
                  </Label>
                </div>

                <div className="flex flex-col gap-2">
                  {/* ✅ CUSTOM SEARCH BAR */}
                  <StopSearchInput onPlaceSelect={handleAddStop} />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addManualStop}
                      className="flex-1 text-xs h-9"
                    >
                      + Manual Stop
                    </Button>
                    <Button
                      variant={showMap ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setShowMap(!showMap)}
                      className="flex-1 text-xs h-9 gap-1"
                    >
                      <MapIcon size={14} /> {showMap ? "Hide Map" : "Open Map"}
                    </Button>
                  </div>
                </div>

                {/* The Map */}
                {showMap && (
                  <div className="w-full h-64 rounded-md overflow-hidden border border-gray-200 shadow-inner mt-2">
                    <BaseMap
                      center={DEFAULT_CENTER}
                      onMapClick={async (e) => {
                        if (!e?.latLng) return;
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        const address = await getAddressFromLatLng(lat, lng);
                        handleAddStop({
                          name: address,
                          latitude: lat,
                          longitude: lng,
                        });
                      }}
                    >
                      <StopPicker
                        stops={Array.isArray(form.stops) ? form.stops : []}
                      />
                      <RoutePreview encodedPolyline={routePolyline} />
                    </BaseMap>
                  </div>
                )}

                {/* Stops List */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-md border p-2 max-h-56 overflow-y-auto space-y-2">
                  {(Array.isArray(form.stops) ? form.stops : []).map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-white p-2 rounded border border-gray-100 shadow-sm"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <Input
                          value={s.name || ""}
                          onChange={(e) =>
                            updateStopValue(i, "name", e.target.value)
                          }
                          className="h-7 text-sm border-none bg-transparent p-0 focus-visible:ring-0 truncate font-medium"
                          placeholder="Stop Name"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={s.latitude !== undefined ? s.latitude : ""}
                            onChange={(e) =>
                              updateStopValue(i, "latitude", e.target.value)
                            }
                            placeholder="Lat"
                            className="h-5 text-[10px] w-20 bg-gray-50"
                          />
                          <Input
                            value={s.longitude !== undefined ? s.longitude : ""}
                            onChange={(e) =>
                              updateStopValue(i, "longitude", e.target.value)
                            }
                            placeholder="Lng"
                            className="h-5 text-[10px] w-20 bg-gray-50"
                          />
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-gray-400 hover:text-red-600"
                        onClick={() => removeStop(i)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                  {(!form.stops || form.stops.length === 0) && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      No stops added yet. Use search or map.
                    </div>
                  )}
                </div>
              </div>

              {/* CALCULATE */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-blue-900">
                    Total Distance
                  </span>
                  <span className="text-xl font-bold text-blue-700">
                    {form.totalKm ? `${form.totalKm} km` : "--"}
                  </span>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  disabled={isCalculating}
                  onClick={handleCalculateRoute}
                >
                  {isCalculating ? (
                    "Calculating..."
                  ) : (
                    <>
                      <Calculator size={16} className="mr-2" /> Calculate Route
                    </>
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-white shrink-0 flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOrUpdate}
                className="w-full sm:w-auto h-11 sm:h-10 bg-green-600 hover:bg-green-700"
              >
                {editRoute ? "Update Route" : "Create Route"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table Section (Same as before) */}
        <div className="bg-white dark:bg-gray-600  rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50  dark:bg-gray-400 border-b">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold dark:text-white  text-gray-600">
                    Route
                  </th>
                  <th className="py-3 px-4 text-center font-semibold dark:text-white   text-gray-600">
                    Driver
                  </th>
                  <th className="py-3 px-4 text-center font-semibold dark:text-white text-gray-600">
                    Bus
                  </th>
                  <th className="py-3 px-4 text-center font-semibold dark:text-white text-gray-600">
                    Stops
                  </th>
                  <th className="py-3 px-4 text-center font-semibold dark:text-white  text-gray-600">
                    KM
                  </th>
                  <th className="py-3 px-4 text-center font-semibold dark:text-white text-gray-600">
                    Active
                  </th>
                  <th className="py-3 px-4 text-center font-semibold dark:text-white text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {routes.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-200">
                      {r.routeName}
                    </td>
                    <td className="text-center dark:text-gray-200 text-gray-600">
                      {r.driver?.name || "-"}
                    </td>
                    <td className="text-center dark:text-gray-200 text-gray-600">
                      {r.bus?.number || "-"}
                    </td>
                    <td className="text-center dark:text-gray-200 text-gray-600">
                      {r.stops?.length || 0}
                    </td>
                    <td className="text-center dark:text-gray-200 text-gray-600">
                      {r.totalKm}
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleActive(r._id, r.isActive)}
                      >
                        {r.isActive ? (
                          <Eye
                            size={16}
                            className="text-green-600 dark:text-green-400 "
                          />
                        ) : (
                          <EyeOff size={16} className="text-red-400" />
                        )}
                      </Button>
                    </td>
                    <td className="flex justify-center gap-2 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditRoute(r)}
                      >
                        <Pencil className=" dark:text-blue-400 " size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    //     <div
    //   className="
    //     antialiased w-full min-h-screen
    //     bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200
    //     dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
    //     md:ml-64 pt-16 md:pt-20
    //     px-4 md:px-6 lg:px-8
    //     pl-0 md:pl-64 mt-5 pb-10
    //   "
    // >
    //   <div className="max-w-7xl mx-auto space-y-8">

    //     {/* ================= ADD ROUTE BUTTON ================= */}
    //     <div className="flex justify-end">
    //       <Dialog
    //         open={open}
    //         onOpenChange={(v) => {
    //           setOpen(v);
    //           if (!v) setEditRoute(null);
    //         }}
    //       >
    //         <DialogTrigger asChild>
    //           <Button
    //             onClick={handleAddNew}
    //             className="
    //               flex items-center gap-2
    //               bg-blue-600 hover:bg-blue-700
    //               text-white font-semibold
    //               h-11 px-5
    //               rounded-xl
    //               shadow-md hover:shadow-lg
    //               transition-all
    //             "
    //           >
    //             <Plus size={16} />
    //             Add Route
    //           </Button>
    //         </DialogTrigger>

    //         {/* ================= DIALOG ================= */}
    //         <DialogContent
    //           className="
    //             w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-4xl
    //             flex flex-col p-0 gap-0 overflow-hidden
    //             bg-white dark:bg-gray-900
    //             rounded-none sm:rounded-2xl
    //             shadow-2xl
    //           "
    //         >
    //           <DialogHeader
    //             className="
    //               p-5 border-b
    //               bg-gray-50 dark:bg-gray-800
    //             "
    //           >
    //             <DialogTitle className="text-lg font-bold">
    //               {editRoute ? "Edit Route" : "Create New Route"}
    //             </DialogTitle>
    //             <DialogDescription className="text-sm text-gray-500">
    //               Manage route details, stops, and map selection
    //             </DialogDescription>
    //           </DialogHeader>

    //           {/* ================= BODY ================= */}
    //           <div className="flex-1 overflow-y-auto p-6 space-y-8">

    //             {/* ================= ROUTE DETAILS ================= */}
    //             <div className="
    //               bg-white dark:bg-gray-900
    //               rounded-2xl
    //               border border-gray-200 dark:border-gray-700
    //               p-5 space-y-4 shadow-sm
    //             ">
    //               <Label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">
    //                 Route Name
    //               </Label>
    //               <Input
    //                 value={form.routeName}
    //                 onChange={(e) =>
    //                   setForm({ ...form, routeName: e.target.value })
    //                 }
    //                 placeholder="Express Line 101"
    //                 className="
    //                   h-11 rounded-xl
    //                   border-gray-300 dark:border-gray-700
    //                   dark:bg-gray-800
    //                 "
    //               />

    //               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //                 {/* DRIVER */}
    //                 <div>
    //                   <Label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">
    //                     Driver
    //                   </Label>
    //                   <Select
    //                     value={form.driver}
    //                     onValueChange={(v) => setForm({ ...form, driver: v })}
    //                   >
    //                     <SelectTrigger className="h-11 rounded-xl">
    //                       <SelectValue placeholder="Select Driver" />
    //                     </SelectTrigger>
    //                     <SelectContent>
    //                       {drivers.map((d) => (
    //                         <SelectItem key={d._id} value={d._id}>
    //                           {d.name}
    //                         </SelectItem>
    //                       ))}
    //                     </SelectContent>
    //                   </Select>
    //                 </div>

    //                 {/* BUS */}
    //                 <div>
    //                   <Label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">
    //                     Bus
    //                   </Label>
    //                   <Select
    //                     value={form.bus}
    //                     onValueChange={(v) => setForm({ ...form, bus: v })}
    //                   >
    //                     <SelectTrigger className="h-11 rounded-xl">
    //                       <SelectValue placeholder="Select Bus" />
    //                     </SelectTrigger>
    //                     <SelectContent>
    //                       {buses.map((b) => (
    //                         <SelectItem key={b._id} value={b._id}>
    //                           {b.number}
    //                         </SelectItem>
    //                       ))}
    //                     </SelectContent>
    //                   </Select>
    //                 </div>

    //                 {/* START TIME */}
    //                 <div>
    //                   <Label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500 flex gap-1 items-center">
    //                     <Clock size={14} /> Start Time
    //                   </Label>
    //                   <Input
    //                     type="datetime-local"
    //                     value={form.startTime}
    //                     onChange={(e) =>
    //                       setForm({ ...form, startTime: e.target.value })
    //                     }
    //                     className="h-11 rounded-xl"
    //                   />
    //                 </div>

    //                 {/* END TIME */}
    //                 <div>
    //                   <Label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500 flex gap-1 items-center">
    //                     <Clock size={14} /> End Time
    //                   </Label>
    //                   <Input
    //                     type="datetime-local"
    //                     value={form.endTime}
    //                     onChange={(e) =>
    //                       setForm({ ...form, endTime: e.target.value })
    //                     }
    //                     className="h-11 rounded-xl"
    //                   />
    //                 </div>
    //               </div>
    //             </div>

    //             {/* ================= STOPS ================= */}
    //             <div className="
    //               bg-white dark:bg-gray-900
    //               rounded-2xl
    //               border border-gray-200 dark:border-gray-700
    //               p-5 space-y-4 shadow-sm
    //             ">
    //               <Label className="text-[11px] uppercase tracking-widest font-semibold text-gray-500">
    //                 Stops Management
    //               </Label>

    //               <StopSearchInput onPlaceSelect={handleAddStop} />

    //               <div className="flex gap-2">
    //                 <Button variant="outline" size="sm" onClick={addManualStop}>
    //                   + Manual Stop
    //                 </Button>
    //                 <Button
    //                   variant="outline"
    //                   size="sm"
    //                   onClick={() => setShowMap(!showMap)}
    //                 >
    //                   <MapIcon size={14} />
    //                   {showMap ? " Hide Map" : " Open Map"}
    //                 </Button>
    //               </div>

    //               {showMap && (
    //                 <div className="
    //                   w-full h-64 rounded-2xl overflow-hidden
    //                   border shadow-inner
    //                 ">
    //                   <BaseMap
    //                     center={DEFAULT_CENTER}
    //                     onMapClick={async (e) => {
    //                       const lat = e.latLng.lat();
    //                       const lng = e.latLng.lng();
    //                       const address = await getAddressFromLatLng(lat, lng);
    //                       handleAddStop({ name: address, latitude: lat, longitude: lng });
    //                     }}
    //                   >
    //                     <StopPicker stops={form.stops || []} />
    //                     <RoutePreview encodedPolyline={routePolyline} />
    //                   </BaseMap>
    //                 </div>
    //               )}
    //             </div>

    //             {/* ================= DISTANCE ================= */}
    //             <div className="
    //               bg-gradient-to-r from-blue-50 to-blue-100
    //               dark:from-blue-900/30 dark:to-blue-800/20
    //               p-5 rounded-2xl border shadow-sm
    //             ">
    //               <div className="flex justify-between items-center">
    //                 <span className="font-semibold">Total Distance</span>
    //                 <span className="text-xl font-bold text-blue-700">
    //                   {form.totalKm ? `${form.totalKm} km` : "--"}
    //                 </span>
    //               </div>

    //               <Button
    //                 onClick={handleCalculateRoute}
    //                 className="
    //                   w-full mt-3 h-11
    //                   bg-blue-600 hover:bg-blue-700
    //                   rounded-xl text-white font-semibold
    //                 "
    //               >
    //                 <Calculator size={16} className="mr-2" />
    //                 Calculate Route
    //               </Button>
    //             </div>
    //           </div>

    //           {/* ================= FOOTER ================= */}
    //           <DialogFooter className="p-5 border-t bg-gray-50 dark:bg-gray-800">
    //             <Button variant="outline" onClick={() => setOpen(false)}>
    //               Cancel
    //             </Button>
    //             <Button
    //               onClick={handleCreateOrUpdate}
    //               className="bg-green-600 hover:bg-green-700 text-white"
    //             >
    //               {editRoute ? "Update Route" : "Create Route"}
    //             </Button>
    //           </DialogFooter>
    //         </DialogContent>
    //       </Dialog>
    //     </div>

    //     {/* ================= TABLE ================= */}
    //     <div className="
    //       bg-white dark:bg-gray-900
    //       rounded-2xl shadow-md border
    //       overflow-hidden
    //     ">
    //       <table className="w-full text-sm">
    //         <thead className="bg-gray-100 dark:bg-gray-800">
    //           <tr>
    //             {["Route", "Driver", "Bus", "Stops", "KM", "Active", "Actions"].map(h => (
    //               <th key={h} className="py-3 px-4 text-gray-600 dark:text-gray-300 text-center">
    //                 {h}
    //               </th>
    //             ))}
    //           </tr>
    //         </thead>
    //         <tbody className="divide-y">
    //           {routes.map((r) => (
    //             <tr key={r._id} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition">
    //               <td className="px-4 py-3 font-medium">{r.routeName}</td>
    //               <td className="text-center">{r.driver?.name || "-"}</td>
    //               <td className="text-center">{r.bus?.number || "-"}</td>
    //               <td className="text-center">{r.stops?.length || 0}</td>
    //               <td className="text-center">{r.totalKm}</td>
    //               <td className="text-center">
    //                 <Button variant="ghost" size="sm" onClick={() => toggleActive(r._id, r.isActive)}>
    //                   {r.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
    //                 </Button>
    //               </td>
    //               <td className="text-center">
    //                 <Button variant="outline" size="sm" onClick={() => handleEditRoute(r)}>
    //                   <Pencil size={14} />
    //                 </Button>
    //               </td>
    //             </tr>
    //           ))}
    //         </tbody>
    //       </table>
    //     </div>

    //   </div>
    // </div>
  );
}
