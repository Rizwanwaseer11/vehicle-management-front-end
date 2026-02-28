import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/apiBase";

export default function AddPassengerModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roomNumber: "",
    jobSite: "",
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      roomNumber: "",
      jobSite: "",
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      return alert("Name, email, phone, and password are required.");
    }
    if (!form.roomNumber || !form.jobSite) {
      return alert("Room number and job site are required for passengers.");
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
          role: "passenger",
          roomNumber: form.roomNumber.trim(),
          jobSite: form.jobSite.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.message || "Failed to create passenger");
      }
      resetForm();
      setOpen(false);
      if (onCreated) onCreated();
    } catch (err) {
      alert("Failed to create passenger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button onClick={() => setOpen(true)} className="px-4 py-6 flex items-center gap-2">
        Add Passenger
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Passenger</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="p-name">Full Name</Label>
              <Input
                id="p-name"
                placeholder="Enter name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                placeholder="Enter email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-phone">Phone</Label>
              <Input
                id="p-phone"
                placeholder="Enter phone"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-password">Password</Label>
              <Input
                id="p-password"
                type="password"
                placeholder="Temporary password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-room">Room Number</Label>
              <Input
                id="p-room"
                placeholder="Room number"
                value={form.roomNumber}
                onChange={(e) => updateField("roomNumber", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-job">Job Site</Label>
              <Input
                id="p-job"
                placeholder="Job site"
                value={form.jobSite}
                onChange={(e) => updateField("jobSite", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Create Passenger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
