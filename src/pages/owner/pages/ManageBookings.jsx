import React, { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/apiBase";

const STATUS_OPTIONS = ["WAITING", "BOARDED", "NO_SHOW", "CANCELLED"];

const ManageBookings = ({ isEmployeePath }) => {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    date: "",
    busNumber: "",
    routeName: "",
    stopName: "",
    passengerName: "",
    driverName: "",
    status: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const filterInputClass =
    "mt-0 w-full h-10 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
  const filterLabelClass = "text-gray-700 dark:text-gray-200";
  const filterSelectClass =
    "w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 text-sm bg-white dark:bg-gray-800 dark:text-gray-100";

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    const cleared = {
      date: "",
      busNumber: "",
      routeName: "",
      stopName: "",
      passengerName: "",
      driverName: "",
      status: "",
    };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setAppliedFilters(filters);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const queryKey = useMemo(
    () => ["admin-bookings", token, page, JSON.stringify(appliedFilters)],
    [token, page, appliedFilters]
  );

  const fetchBookings = async ({ signal }) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");

    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const res = await fetch(`${API_BASE}/bookings?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
    });
    if (!res.ok) {
      throw new Error("Failed to load bookings");
    }
    return res.json();
  };

  const bookingsQuery = useQuery({
    queryKey,
    queryFn: fetchBookings,
    enabled: !!token,
  });

  const bookings = bookingsQuery.data?.data ?? [];
  const total = bookingsQuery.data?.total ?? 0;
  const pages = bookingsQuery.data?.pages ?? 1;

  const handleStatusChange = async (bookingId, nextStatus) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.message || "Failed to update status");
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="antialiased p-10 w-full h-full min-h-screen bg-gray-200 dark:bg-gray-800/95 md:ml-64 pt-20">
      <div className="flex flex-col gap-2 mb-4 mt-6">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Booking History
        </h2>
        <p className="text-sm font-light text-gray-600 dark:text-gray-300">
          Track all passenger bookings with filters and status updates.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-700/80 border border-gray-200 dark:border-gray-600 rounded-xl p-4 mb-5 text-gray-700 dark:text-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className={filterLabelClass}>Date</Label>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => updateFilter("date", e.target.value)}
              className={filterInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className={filterLabelClass}>Bus Number</Label>
            <Input
              placeholder="BUS-123"
              value={filters.busNumber}
              onChange={(e) => updateFilter("busNumber", e.target.value)}
              className={filterInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className={filterLabelClass}>Route</Label>
            <Input
              placeholder="Route name"
              value={filters.routeName}
              onChange={(e) => updateFilter("routeName", e.target.value)}
              className={filterInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className={filterLabelClass}>Stop</Label>
            <Input
              placeholder="Stop name"
              value={filters.stopName}
              onChange={(e) => updateFilter("stopName", e.target.value)}
              className={filterInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className={filterLabelClass}>Passenger</Label>
            <Input
              placeholder="Passenger name"
              value={filters.passengerName}
              onChange={(e) => updateFilter("passengerName", e.target.value)}
              className={filterInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className={filterLabelClass}>Driver</Label>
            <Input
              placeholder="Driver name"
              value={filters.driverName}
              onChange={(e) => updateFilter("driverName", e.target.value)}
              className={filterInputClass}
            />
          </div>
          <div className="space-y-1">
            <Label className={filterLabelClass}>Status</Label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className={filterSelectClass}
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Button onClick={applyFilters}>Apply Filters</Button>
          <Button variant="outline" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm text-gray-600 bg-white dark:bg-gray-700/80 dark:text-gray-200 dark:border-gray-600">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-600 rounded-ss-lg">Date</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-600">Passenger</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-600">Route</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-600">Bus</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-600">Stop</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-600">Driver</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-600 rounded-tr-lg text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking._id} className="hover:bg-muted/60">
                  <TableCell className="font-medium p-5">
                    {new Date(booking.date || booking.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.passenger?.name || "-"}</div>
                    <div className="text-xs text-gray-500">{booking.passenger?.email || ""}</div>
                  </TableCell>
                  <TableCell>{booking.groupName || "-"}</TableCell>
                  <TableCell>
                    {booking.busNumber || "-"} {booking.busModel ? `(${booking.busModel})` : ""}
                  </TableCell>
                  <TableCell>{booking.pickupLocation?.name || "-"}</TableCell>
                  <TableCell>{booking.driverName || "-"}</TableCell>
                  <TableCell className="text-right">
                    {isEmployeePath ? (
                      <span className="font-medium">{booking.status}</span>
                    ) : (
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        className="border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-sm dark:bg-gray-800 dark:text-gray-100"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center bg-gray-100 dark:bg-gray-600 rounded-lg justify-between p-4">
          <p className="text-sm">
            Showing <strong>{bookings.length}</strong> of <strong>{total}</strong>
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
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
