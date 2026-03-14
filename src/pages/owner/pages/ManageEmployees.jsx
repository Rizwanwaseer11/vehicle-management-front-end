import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Settings2, ToggleLeft, Trash } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/apiBase";
import { EMPLOYEE_PERMISSION_ITEMS } from "@/lib/employeePermissions";

const RESULTS_PER_PAGE = 7;
const DEFAULT_PERMISSIONS = EMPLOYEE_PERMISSION_ITEMS.map((item) => item.key);

const getFriendlyError = (message) => {
  if (!message) return "Failed to save employee.";
  if (message.toLowerCase().includes("driver or passenger")) {
    return "Backend currently blocks employee creation (allowed roles are driver/passenger only). Update backend createUser role validation to include employee.";
  }
  return message;
};

const formatPermissionLabels = (permissions) => {
  if (!Array.isArray(permissions) || permissions.length === 0) return "All pages";
  const labels = EMPLOYEE_PERMISSION_ITEMS.filter((item) => permissions.includes(item.key)).map(
    (item) => item.label,
  );
  return labels.length > 0 ? labels.join(", ") : "All pages";
};

export default function ManageEmployees() {
  const token = localStorage.getItem("token");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    pagePermissions: DEFAULT_PERMISSIONS,
  });
  const [editForm, setEditForm] = useState({
    pagePermissions: DEFAULT_PERMISSIONS,
    status: "approved",
  });

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

  const employees = useMemo(() => {
    const list = Array.isArray(usersQuery.data) ? usersQuery.data : [];
    return list.filter((user) => user.role === "employee");
  }, [usersQuery.data]);

  const totalResults = employees.length;
  const paginatedEmployees = [...employees]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);

  const togglePermission = (setter, key) => {
    setter((prev) => {
      const current = Array.isArray(prev.pagePermissions) ? prev.pagePermissions : [];
      if (current.includes(key)) {
        return { ...prev, pagePermissions: current.filter((item) => item !== key) };
      }
      return { ...prev, pagePermissions: [...current, key] };
    });
  };

  const handleCreateEmployee = async () => {
    if (!createForm.name || !createForm.email || !createForm.phone || !createForm.password) {
      return alert("Name, email, phone, and password are required.");
    }
    if (!createForm.pagePermissions.length) {
      return alert("Select at least one page permission.");
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createForm.name.trim(),
          email: createForm.email.trim(),
          phone: createForm.phone.trim(),
          password: createForm.password,
          role: "employee",
          status: "approved",
          pagePermissions: createForm.pagePermissions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(getFriendlyError(data.message));
      }
      setCreateOpen(false);
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        pagePermissions: DEFAULT_PERMISSIONS,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-users", token] });
    } catch {
      alert("Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (employee) => {
    setEditingEmployee(employee);
    setEditForm({
      pagePermissions:
        Array.isArray(employee.pagePermissions) && employee.pagePermissions.length > 0
          ? employee.pagePermissions
          : DEFAULT_PERMISSIONS,
      status: employee.status || "approved",
    });
    setEditOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee?._id) return;
    if (!editForm.pagePermissions.length) {
      return alert("Select at least one page permission.");
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/admin/${editingEmployee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pagePermissions: editForm.pagePermissions,
          status: editForm.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(getFriendlyError(data.message));
      }
      setEditOpen(false);
      setEditingEmployee(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-users", token] });
    } catch {
      alert("Failed to update employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      const res = await fetch(`${API_BASE}/admin/${employeeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.message || "Failed to delete employee.");
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-users", token] });
    } catch {
      alert("Failed to delete employee.");
    }
  };

  const handleStatusToggle = async (employee) => {
    const nextStatus = employee.status === "approved" ? "pending" : "approved";
    try {
      const res = await fetch(`${API_BASE}/admin/${employee._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.message || "Failed to update status.");
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-users", token] });
    } catch {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="antialiased p-10 w-full h-full min-h-screen bg-gray-200 dark:bg-gray-800/95 md:ml-64 pt-20">
      <div className="flex justify-between items-center mb-2 mt-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Manage Employees</h2>
          <p className="text-sm font-light text-gray-600 dark:text-gray-300">
            Create employees and assign page-level access.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="px-4 py-6 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="rounded-lg border shadow-sm text-gray-600 bg-white dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500 rounded-ss-lg">Name</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">Email</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">Phone</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">Page Permissions</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">Status</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500">Created At</TableHead>
              <TableHead className="bg-gray-100 p-4 dark:bg-gray-500 rounded-tr-lg text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {usersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="p-8 text-center text-sm">
                  Loading employees...
                </TableCell>
              </TableRow>
            )}
            {!usersQuery.isLoading && paginatedEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="p-8 text-center text-sm">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
            {paginatedEmployees.map((employee) => (
              <TableRow key={employee._id} className="hover:bg-muted/60">
                <TableCell className="font-medium p-5">{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone || "-"}</TableCell>
                <TableCell className="max-w-[260px] truncate" title={formatPermissionLabels(employee.pagePermissions)}>
                  {formatPermissionLabels(employee.pagePermissions)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={employee.status === "approved" ? "default" : "secondary"}
                    className={`shadow ${
                      employee.status === "approved"
                        ? "bg-green-200 text-green-700"
                        : "bg-rose-200 text-red-600"
                    }`}
                  >
                    {employee.status || "pending"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {employee.createdAt
                    ? new Date(employee.createdAt).toLocaleDateString("en-GB")
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStatusToggle(employee)}
                      className={`transition-colors w-10 ${
                        employee.status === "approved"
                          ? "text-green-500 hover:text-green-600"
                          : "text-red-500 hover:text-red-600"
                      }`}
                      title={employee.status === "approved" ? "Set Pending" : "Set Approved"}
                    >
                      <ToggleLeft className="w-12 h-6" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(employee)} title="Edit Permissions">
                      <Settings2 className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(employee._id)} title="Delete Employee">
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center bg-gray-100 dark:bg-gray-500 rounded-lg justify-between p-4">
          <p className="text-sm">
            Showing <strong>{paginatedEmployees.length}</strong> of <strong>{totalResults}</strong>
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * RESULTS_PER_PAGE >= totalResults}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Create Employee</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-300">
              Add basic details and assign page access.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 text-gray-700 dark:text-gray-200">
            <div className="grid gap-2">
              <Label htmlFor="emp-name" className="text-gray-700 dark:text-gray-200">
                Name
              </Label>
              <Input
                id="emp-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Employee name"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp-email" className="text-gray-700 dark:text-gray-200">
                Email
              </Label>
              <Input
                id="emp-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="employee@company.com"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp-phone" className="text-gray-700 dark:text-gray-200">
                Phone
              </Label>
              <Input
                id="emp-phone"
                value={createForm.phone}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 000 000 0000"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emp-password" className="text-gray-700 dark:text-gray-200">
                Temporary Password
              </Label>
              <Input
                id="emp-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Set a temporary password"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-700 dark:text-gray-200">Page Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700/40">
                {EMPLOYEE_PERMISSION_ITEMS.map((item) => {
                  const checked = createForm.pagePermissions.includes(item.key);
                  return (
                    <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(setCreateForm, item.key)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEmployee} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Create Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Update Employee Access</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-300">
              {editingEmployee?.name || "Employee"} - configure page permissions and status.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 text-gray-700 dark:text-gray-200">
            <div className="grid gap-2">
              <Label className="text-gray-700 dark:text-gray-200">Status</Label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                className="h-10 rounded-md border border-gray-300 dark:border-gray-600 px-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label className="text-gray-700 dark:text-gray-200">Page Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700/40">
                {EMPLOYEE_PERMISSION_ITEMS.map((item) => {
                  const checked = editForm.pagePermissions.includes(item.key);
                  return (
                    <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(setEditForm, item.key)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
