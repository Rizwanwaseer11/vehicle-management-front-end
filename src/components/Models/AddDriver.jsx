import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/apiBase";

export default function AddDriverModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    homeAddress: "",
    licenseNumber: "",
  });

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      homeAddress: "",
      licenseNumber: "",
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      return alert("Name, email, phone, and password are required.");
    }
    if (!form.homeAddress || !form.licenseNumber) {
      return alert("Home address and license number are required.");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          role: "driver",
          homeAddress: form.homeAddress.trim(),
          licenseNumber: form.licenseNumber.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.message || "Failed to create driver");
      }
      resetForm();
      setOpen(false);
      if (onCreated) onCreated();
    } catch (err) {
      alert("Failed to create driver");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <Button onClick={() => setOpen(true)} className="px-4 py-6 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Driver
        </Button>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>Enter driver information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Driver Name</Label>
              <Input
                id="name"
                placeholder="Enter name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Enter email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 234-567-8900"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Temporary password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="homeAddress">Home Address</Label>
              <Input
                id="homeAddress"
                placeholder="Driver home address"
                value={form.homeAddress}
                onChange={(e) => updateField("homeAddress", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                placeholder="License number"
                value={form.licenseNumber}
                onChange={(e) => updateField("licenseNumber", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Create Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
