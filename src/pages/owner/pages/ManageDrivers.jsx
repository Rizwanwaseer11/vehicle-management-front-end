import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ToggleLeft, Eye, EyeClosed, Trash, Edit } from "lucide-react";
import AddDriverModal from "@/components/Models/AddDriver"; // your modal component
import { API_BASE } from "@/lib/apiBase";

export default function ManageDrivers({ isEmployeePath }) {
  const [page, setPage] = useState(1);
  const [editDriver, setEditDriver] = useState(null); // driver to edit
  const resultsPerPage = 7;

  const token = localStorage.getItem("token"); // Auth token
  const queryClient = useQueryClient();

  // ✅ Fetch all drivers
  const fetchUsers = async ({ signal }) => {
    const res = await fetch(`${API_BASE}/admin/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      signal,
    });
    if (!res.ok) {
      throw new Error("Failed to load users");
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const usersQuery = useQuery({
    queryKey: ["admin-users", token],
    queryFn: fetchUsers,
    enabled: !!token,
  });

  const drivers = useMemo(
    () => (Array.isArray(usersQuery.data) ? usersQuery.data.filter((u) => u.role === "driver") : []),
    [usersQuery.data],
  );

  const totalResults = drivers.length;
  const paginatedDrivers = drivers
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((page - 1) * resultsPerPage, page * resultsPerPage);

  // ✅ Delete driver
  const handleDelete = async (id) => {
    try {
      await fetch(
        `${API_BASE}/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-users", token] });
    } catch (err) {
      console.error("Error deleting driver", err);
    }
  };

  // ✅ Toggle user status between 'pending' and 'approved'
  const handleStatus = async (driver) => {
    try {
      // Determine the new status
      const updatedStatus =
        driver.status === "approved" ? "pending" : "approved";

      // Send request to update backend
      await fetch(
        `${API_BASE}/admin/${driver._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: updatedStatus }),
        },
      );

      await queryClient.invalidateQueries({ queryKey: ["admin-users", token] });
    } catch (err) {
      console.error("Error updating driver status", err);
    }
  };

  // ✅ Fetch single driver for edit
  const handleEdit = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/admin/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      setEditDriver(data);
    } catch (err) {
      console.error("Error fetching driver", err);
    }
  };

  return (
    <div className="antialiased p-10 w-full  h-full min-h-screen  bg-gray-200 dark:bg-gray-800/95 md:ml-64  pt-20 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-2 mt-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Manage Drivers
          </h2>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300">
            Add, edit, or remove drivers
          </p>
        </div>
        <div className="mb-0">
          {!isEmployeePath && <AddDriverModal driver={editDriver} />}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-lg border shadow-sm text-gray-600 bg-white dark:bg-gray-600
       dark:text-gray-300 dark:border-gray-500 dark:shadow-sm"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500 rounded-ss-lg">
                Name
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Email
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Phone
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Home Address
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                License No
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Route
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Status
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Created At
              </TableHead>
              {!isEmployeePath && (
                <TableHead className="bg-gray-100 p-4 dark:bg-gray-500 rounded-tr-lg text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedDrivers.map((driver) => (
              <TableRow key={driver._id} className="hover:bg-muted/60">
                <TableCell className="font-medium p-5">{driver.name}</TableCell>
                <TableCell>{driver.email}</TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell>{driver.homeAddress || "-"}</TableCell>
                <TableCell>{driver.licenseNumber || "-"}</TableCell>
                <TableCell>{driver.route}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      driver.status === "approved" ? "default" : "secondary"
                    }
                    className={`shadow ${
                      driver.status === "approved"
                        ? "bg-green-200 text-green-600"
                        : "bg-rose-200 text-red-600"
                    }`}
                  >
                    {driver.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {driver.createdAt
                    ? new Date(driver.createdAt).toLocaleDateString("en-GB")
                    : "-"}
                </TableCell>

                {!isEmployeePath && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-3">
                      {/* <Button
  variant="ghost"
  size="icon"
  onClick={() => handleStatus(driver)}
>
  {driver.status === "approved" ? (
    <Eye className="w-4 h-4" />
  ) : (
    <EyeClosed className="w-4 h-4" />
  )}
</Button> */}
                      {/*  Inside your table cell */}
                      <Button
                        variant="ghost"
                        size="icon" // keep existing size
                        onClick={() => handleStatus(driver)}
                        className={`transition-colors w-10 ${
                          // <--- added w-10 to increase width
                          driver.status === "approved"
                            ? "text-green-500 hover:text-green-600"
                            : "text-red-500 hover:text-red-600"
                        }`}
                      >
                        <ToggleLeft className="w-12 h-6" />
                      </Button>

                      {/* removed edit button for now */}
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(driver._id)}
                      >
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button> */}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(driver._id)}
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

        {/* Pagination */}
        <div className="flex items-center bg-gray-100  dark:bg-gray-500 rounded-lg justify-between p-4">
          <p className="text-sm">
            Showing <strong>{paginatedDrivers.length}</strong> of{" "}
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
    </div>
  );
}
