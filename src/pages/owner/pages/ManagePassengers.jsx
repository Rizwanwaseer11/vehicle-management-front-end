import React, { useEffect, useState } from "react";
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
import { ToggleLeft, Eye, EyeClosed, Trash } from "lucide-react";

const ManagePassengers = ({ isEmployeePath }) => {
  const [passengers, setPassengers] = useState([]);
  const [page, setPage] = useState(1);
  const resultsPerPage = 7;

  const token = localStorage.getItem("token");

  /* ================= FETCH PASSENGERS ================= */
  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      /**
       * 🔴 REPLACE API URL BELOW
       * Example: GET /api/users
       */
      const res = await fetch(
        "https://vehicle-management-ecru.vercel.app/api/admin/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      /**
       * ✅ Filter only passengers by role
       * Backend user object should contain: role
       */
      const passengerUsers = Array.isArray(data)
        ? data.filter((user) => user.role === "passenger")
        : [];

      setPassengers(passengerUsers);
    } catch (error) {
      console.error("Failed to fetch passengers", error);
      setPassengers([]);
    }
  };

  /* ================= DELETE PASSENGER ================= */
  const handleDelete = async (id) => {
    try {
      /**
       * 🔴 REPLACE API URL BELOW
       * Example: DELETE /api/users/:id
       */
      await fetch(
        `https://vehicle-management-ecru.vercel.app/api/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPassengers((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to delete passenger", error);
    }
  };

  // /* ================= TOGGLE STATUS ================= */
  // const handleStatus = async (id, currentStatus) => {
  //   const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

  //   try {
  //     /**
  //      * 🔴 REPLACE API URL BELOW
  //      * Example: PUT /api/users/:id/status
  //      */
  //     await fetch(`https://vehicle-management-ecru.vercel.app/api/drivers/${driver._id}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ status: newStatus }),
  //     });

  //     setPassengers((prev) =>
  //       prev.map((p) =>
  //         p._id === id ? { ...p, status: newStatus } : p
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Failed to update status", error);
  //   }
  // };

  // ✅ Toggle user status between 'pending' and 'approved'
  const handleStatus = async (driver) => {
    try {
      // Determine the new status
      const updatedStatus =
        driver.status === "approved" ? "pending" : "approved";

      // Send request to update backend
      await fetch(
        `https://vehicle-management-ecru.vercel.app/api/admin/${driver._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: updatedStatus }),
        },
      );

      // Update state locally so the UI reflects change immediately
      setPassengers((prev) =>
        prev.map((d) =>
          d._id === driver._id ? { ...d, status: updatedStatus } : d,
        ),
      );
    } catch (err) {
      console.error("Error updating Passenger status", err);
    }
  };

  /* ================= PAGINATION ================= */
  const totalResults = passengers.length;
  const paginatedPassengers = passengers.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage,
  );

  return (
    <div className="antialiased p-10 w-full h-full min-h-screen bg-gray-200 dark:bg-gray-700 md:ml-64 pt-20">
      {/* Header */}
      <div className="flex justify-between mt-9 mb-5">
        <div>
          <h2 className="text-xl dark:text-gray-300 text-gray-700 font-semibold">
            Manage Passengers
          </h2>
          <p className="text-sm font-light dark:text-gray-300 text-gray-600">
            View and manage registered passengers
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border shadow-sm text-gray-600 bg-white dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500 rounded-ss-lg">
                Name
              </TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">
                Email
              </TableHead>
              <TableHead className="bg-gray-100 p-2 dark:bg-gray-500">
                Phone
              </TableHead>
              <TableHead className="bg-gray-100 p-2 dark:bg-gray-500">
                Route
              </TableHead>
              <TableHead className="bg-gray-100 p-2 dark:bg-gray-500">
                Created At
              </TableHead>
              <TableHead className="bg-gray-100 p-2 dark:bg-gray-500">
                Status
              </TableHead>
              {!isEmployeePath && (
                <TableHead className="bg-gray-100 pe-9 dark:bg-gray-500 rounded-tr-lg text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedPassengers.map((passenger) => (
              <TableRow key={passenger._id} className="hover:bg-muted/60">
                <TableCell className="font-medium p-5">
                  {passenger.name}
                </TableCell>
                <TableCell>{passenger.email || "-"}</TableCell>
                <TableCell>{passenger.phone}</TableCell>
                <TableCell>{passenger.route || "-"}</TableCell>
                <TableCell>
                  {passenger.createdAt
                    ? new Date(passenger.createdAt).toLocaleDateString("en-GB")
                    : "-"}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      passenger.status === "approved" ? "default" : "secondary"
                    }
                    className={`shadow ${
                      passenger.status === "approved"
                        ? "bg-green-200 text-green-600"
                        : "bg-rose-200 text-red-600"
                    }`}
                  >
                    {passenger.status}
                  </Badge>
                </TableCell>

                {!isEmployeePath && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-3">
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleStatus(passenger)
                        }
                      >
                        {passenger.status === "approved" ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeClosed className="w-4 h-4" />
                        )}
                      </Button> */}
                      <Button
                        variant="ghost"
                        size="icon" // keep existing size
                        onClick={() => handleStatus(passenger)}
                        className={`transition-colors w-10 ${
                          // <--- added w-10 to increase width
                          passenger.status === "approved"
                            ? "text-green-500 hover:text-green-600"
                            : "text-red-500 hover:text-red-600"
                        }`}
                      >
                        <ToggleLeft className="w-12 h-6" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(passenger._id)}
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
        <div className="flex items-center bg-gray-100 dark:bg-gray-500 rounded-lg justify-between p-4">
          <p className="text-sm">
            Showing <strong>{paginatedPassengers.length}</strong> of{" "}
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
};

export default ManagePassengers;
