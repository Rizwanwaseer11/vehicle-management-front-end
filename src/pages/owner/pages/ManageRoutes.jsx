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

export default function ManageRoutes() {
  const [open, setOpen] = React.useState(false);
  const [editRoute, setEditRoute] = React.useState(null);
  const [routes, setRoutes] = React.useState([]);
  const [drivers, setDrivers] = React.useState([]);
  const [buses, setBuses] = React.useState([]);

  const token = localStorage.getItem("token");

  const [form, setForm] = React.useState({
    routeName: "",
    driver: "",
    bus: "",
    startTime: "",
    endTime: "",
    totalKm: "",
    stops: [{ name: "", latitude: "", longitude: "" }],
  });

  /* ================= FETCH DATA ================= */
  React.useEffect(() => {
    fetchTrips();
    fetchDrivers();
    fetchBuses();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch("https://vehicle-management-ecru.vercel.app/api/trips/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch trips", err);
      setRoutes([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch("https://vehicle-management-ecru.vercel.app/api/trips/available-drivers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
    } catch (err) {
      console.error("Failed to fetch drivers", err);
      setDrivers([]);
    }
  };

  const fetchBuses = async () => {
    try {
      const res = await fetch("https://vehicle-management-ecru.vercel.app/api/trips/available-buses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBuses(Array.isArray(data.buses) ? data.buses : []);
    } catch (err) {
      console.error("Failed to fetch buses", err);
      setBuses([]);
    }
  };

  /* ================= STOPS ================= */
  const addStop = () => {
    setForm({
      ...form,
      stops: [...form.stops, { name: "", latitude: "", longitude: "" }],
    });
  };

  const updateStop = (i, field, value) => {
    const updated = [...form.stops];
    updated[i][field] = value;
    setForm({ ...form, stops: updated });
  };

  /* ================= CREATE / UPDATE ================= */
  const handleCreateOrUpdate = async () => {
    if (form.totalKm === "" || isNaN(form.totalKm)) {
      alert("Total KM is required and must be a number.");
      return;
    }

    const payload = {
      ...form,
      totalKm: Number(form.totalKm), // ensure backend receives a number
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
      console.error("Failed to create/update trip", err);
      alert("Failed to create/update trip. Please check the console.");
    }
  };

  /* ================= EDIT ROUTE ================= */
  const handleEditRoute = (route) => {
    setEditRoute(route);
    setForm({
      routeName: route.routeName,
      driver: route.driver?._id || route.driver || "",
      bus: route.bus?._id || route.bus || "",
      startTime: route.startTime ? new Date(route.startTime).toISOString().slice(0, 16) : "",
      endTime: route.endTime ? new Date(route.endTime).toISOString().slice(0, 16) : "",
      totalKm: route.totalKm || "",
      stops: route.stops.length
        ? route.stops.map((s) => ({
            name: s.name,
            latitude: s.latitude,
            longitude: s.longitude,
          }))
        : [{ name: "", latitude: "", longitude: "" }],
    });
    setOpen(true);
  };

  /* ================= TOGGLE ACTIVE ================= */
  const toggleActive = async (routeId, currentStatus) => {
    await fetch(`https://vehicle-management-ecru.vercel.app/api/trips/${routeId}/toggle`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    fetchTrips();
  };

  return (
    <div className="pl-64 pt-20 pr-6 pb-6 min-h-screen w-full bg-gray-200 dark:bg-gray-700">
      <div className="p-9 space-y-4 bg-transparent">
        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h2 className="text-xl dark:text-gray-300">Manage Routes & Buses</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure routes and assign buses
            </p>
          </div>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditRoute(null); }}>
            <DialogTrigger asChild>
              <Button className="flex gap-2 p-6 text-sm">
                <Plus size={18} /> {editRoute ? "Edit Route" : "Add Route"}
              </Button>
            </DialogTrigger>

            {/* MODAL */}
            <DialogContent className="max-w-md p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editRoute ? "Edit Route" : "Add New Route"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Route Name"
                  value={form.routeName}
                  onChange={(e) => setForm({ ...form, routeName: e.target.value })}
                />

                {/* DRIVER SELECT */}
                <Select value={form.driver} onValueChange={(v) => setForm({ ...form, driver: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign Driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* BUS SELECT */}
                <Select value={form.bus} onValueChange={(v) => setForm({ ...form, bus: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign Bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses.map((b) => (
                      <SelectItem key={b._id} value={b._id}>{b.busNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Total KM"
                  value={form.totalKm}
                  onChange={(e) => setForm({ ...form, totalKm: e.target.value })}
                />

                {/* STOPS */}
                {form.stops.map((s, i) => (
                  <div key={i} className="space-y-2">
                    <Input placeholder="Stop Name" value={s.name} onChange={(e) => updateStop(i, "name", e.target.value)} />
                    <Input placeholder="Latitude" value={s.latitude} onChange={(e) => updateStop(i, "latitude", e.target.value)} />
                    <Input placeholder="Longitude" value={s.longitude} onChange={(e) => updateStop(i, "longitude", e.target.value)} />
                  </div>
                ))}

                <Button variant="outline" onClick={addStop}>
                  + Add New Stop
                </Button>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => { setOpen(false); setEditRoute(null); }}>Cancel</Button>
                <Button onClick={handleCreateOrUpdate}>{editRoute ? "Update Route" : "Add Route"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* DASHBOARD */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th>Route</th>
                <th>Driver</th>
                <th>Stops</th>
                <th>KM</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r._id} className="border-b">
                  <td className= 'text-center'>{r.routeName}</td>
                  <td className= 'text-center'>{r.driver?.name}</td>
                  <td className= 'text-center'>{r.stops.length}</td>
                  <td className= 'text-center'>{r.totalKm} km</td>
                  <td className="text-center align-middle">
                    <Button  size="sm" variant="outline" onClick={() => toggleActive(r._id, r.isActive)}>
                      {r.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                  </td>
                  <td className="flex gap-2 justify-center items-center">
                    <Button size="sm" variant="outline" onClick={() => handleEditRoute(r)}>
                      <Pencil size={16} />
                    </Button>
                    <MapPin size={16} className="cursor-pointer " />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
