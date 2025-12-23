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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function  AddDriverModal() {
  const [open, setOpen] = useState(false);

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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Driver</DialogTitle>
            <DialogDescription>Enter driver information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Driver Name</Label>
              <Input id="name" placeholder="Enter name" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1 234-567-8900" />
            </div>

            <div className="grid gap-2">
              <Label>Select Bus</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select bus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bus1">Bus 1</SelectItem>
                  <SelectItem value="bus2">Bus 2</SelectItem>
                  <SelectItem value="bus3">Bus 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)} className="w-full">
              Add Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
