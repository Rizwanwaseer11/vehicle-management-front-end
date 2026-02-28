import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/apiBase";

const ManageBuses = ({ isEmployeePath }) => {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ number: "", model: "", seatingCapacity: "" });
  const [saving, setSaving] = useState(false);
  const resultsPerPage = 7;

  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  const fetchBuses = async ({ signal }) => {
    const res = await fetch(`${API_BASE}/buses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
    });
    if (!res.ok) {
      throw new Error("Failed to load buses");
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const busesQuery = useQuery({
    queryKey: ["buses", token],
    queryFn: fetchBuses,
    enabled: !!token,
  });

  const buses = busesQuery.data ?? [];
  const totalResults = buses.length;
  const paginatedBuses = buses
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((page - 1) * resultsPerPage, page * resultsPerPage);

  const resetForm = () => {
    setForm({ number: "", model: "", seatingCapacity: "" });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (bus) => {
    setEditing(bus);
    setForm({
      number: bus.number || "",
      model: bus.model || "",
      seatingCapacity: bus.seatingCapacity || "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.number.trim() || !form.model.trim() || !form.seatingCapacity) {
      return alert("Bus number, model, and seating capacity are required.");
    }
    const payload = {
      number: form.number.trim(),
      model: form.model.trim(),
      seatingCapacity: Number(form.seatingCapacity),
    };
    try {
      setSaving(true);
      const url = editing
        ? `${API_BASE}/buses/${editing._id}`
        : `${API_BASE}/buses/createBus`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.message || "Failed to save bus");
      }
      setOpen(false);
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ["buses", token] });
    } catch (err) {
      alert("Failed to save bus");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/buses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.message || "Failed to delete bus");
      }
      await queryClient.invalidateQueries({ queryKey: ["buses", token] });
    } catch (err) {
      alert("Failed to delete bus");
    }
  };

  return (
    <div className="antialiased p-10 w-full h-full min-h-screen bg-gray-200 dark:bg-gray-800/95 md:ml-64 pt-20">
      <div className="flex justify-between items-center mb-2 mt-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Manage Buses
          </h2>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300">
            Add, edit, or remove buses
          </p>
        </div>
        {!isEmployeePath && (
          <Button onClick={openCreate} className="px-4 py-2">
            Add Bus
          </Button>
        )}
      </div>

      <div className="rounded-lg border shadow-sm text-gray-600 bg-white dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500 rounded-ss-lg">
                Bus Number
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Model
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Seats
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Active
              </TableHead>
              {!isEmployeePath && (
                <TableHead className="bg-gray-100 p-4 dark:bg-gray-500 rounded-tr-lg text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBuses.map((bus) => (
              <TableRow key={bus._id} className="hover:bg-muted/60">
                <TableCell className="font-medium p-5">{bus.number}</TableCell>
                <TableCell>{bus.model}</TableCell>
                <TableCell>{bus.seatingCapacity}</TableCell>
                <TableCell>{bus.isActive ? "Yes" : "No"}</TableCell>
                {!isEmployeePath && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(bus)}
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(bus._id)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center bg-gray-100 dark:bg-gray-500 rounded-lg justify-between p-4">
          <p className="text-sm">
            Showing <strong>{paginatedBuses.length}</strong> of{" "}
            <strong>{totalResults}</strong>
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * resultsPerPage >= totalResults}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Bus" : "Add Bus"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Bus Number</Label>
              <Input
                value={form.number}
                onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                placeholder="LHE-1234"
              />
            </div>
            <div className="grid gap-2">
              <Label>Bus Model</Label>
              <Input
                value={form.model}
                onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="Toyota Coaster"
              />
            </div>
            <div className="grid gap-2">
              <Label>Seating Capacity</Label>
              <Input
                type="number"
                value={form.seatingCapacity}
                onChange={(e) => setForm((prev) => ({ ...prev, seatingCapacity: e.target.value }))}
                placeholder="22"
                min="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update Bus" : "Create Bus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBuses;
