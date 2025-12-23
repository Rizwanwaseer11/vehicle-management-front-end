// import { useState } from "react";
// import { Plus, Bus, Route, Bell } from "lucide-react";

// /* ----------------------- SIMPLE MODAL ----------------------- */
// const Modal = ({ open, onClose, children }) => {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-lg">
//         {children}

//         <div className="flex justify-end gap-3 mt-6">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 border rounded-lg dark:border-gray-600"
//           >
//             Cancel
//           </button>
//           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
//             Submit
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ----------------------- MAIN QUICK ACTIONS ----------------------- */
// const QuickActions = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [modalType, setModalType] = useState(null);

//   const openModal = (type) => {
//     setModalType(type);
//     setIsOpen(true);
//   };

//   const closeModal = () => {
//     setIsOpen(false);
//     setModalType(null);
//   };

//   /* --------------- RENDER SIMPLE FORMS --------------- */
//   const renderForm = () => {
//     switch (modalType) {
//       case "driver":
//         return (
//           <>
//             <h2 className="text-lg font-semibold mb-4">Add Driver</h2>

//             <label className="block mb-3">
//               <span>Driver Name</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="Enter driver name"
//               />
//             </label>

//             <label className="block mb-3">
//               <span>Phone Number</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="+01 3XX XXXXXXX"
//               />
//             </label>

//             <label className="block">
//               <span>CNIC</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="XXXXX-XXXXXXX-X"
//               />
//             </label>
//           </>
//         );

//       case "bus":
//         return (
//           <>
//             <h2 className="text-lg font-semibold mb-4">Add Bus</h2>

//             <label className="block mb-3">
//               <span>Bus Number</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="LHE-1234"
//               />
//             </label>

//             <label className="block mb-3">
//               <span>Bus Model</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="Toyota Coaster"
//               />
//             </label>

//             <label className="block">
//               <span>Seating Capacity</span>
//               <input
//                 type="number"
//                 min="0"
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="22"
//               />
//             </label>
//           </>
//         );

//       case "route":
//         return (
//           <>
//             <h2 className="text-lg font-semibold mb-4">New Route</h2>

//             <label className="block mb-3">
//               <span>Route Name</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="Route A"
//               />
//             </label>

//             <label className="block mb-3">
//               <span>Start Location</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="Enter start point"
//               />
//             </label>

//             <label className="block">
//               <span>End Location</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="Enter destination"
//               />
//             </label>
//           </>
//         );

//       case "alert":
//         return (
//           <>
//             <h2 className="text-lg font-semibold mb-4">Send Alert</h2>

//             <label className="block mb-3">
//               <span>Alert Title</span>
//               <input
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="Enter title"
//               />
//             </label>

//             <label className="block">
//               <span>Message</span>
//               <textarea
//                 rows="4"
//                 className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
//                 placeholder="Write your alert message..."
//               ></textarea>
//             </label>
//           </>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <h4 className="text-md dark:text-gray-400 mt-3">Quick Actions</h4>
//       <p className="text-sm text-gray-400 font-light mb-4">Common tasks</p>

//       {/* BUTTON GRID */}
//       <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm max-w-md">
//         <div className="grid grid-cols-2 gap-4">
//           <ActionButton
//             icon={<Plus className="w-5 h-5" />}
//             label="Add Driver"
//             onClick={() => openModal("driver")}
//           />

//           <ActionButton
//             icon={<Bus className="w-5 h-5" />}
//             label="Add Bus"
//             onClick={() => openModal("bus")}
//           />

//           <ActionButton
//             icon={<Route className="w-5 h-5" />}
//             label="New Route"
//             onClick={() => openModal("route")}
//           />

//           <ActionButton
//             icon={<Bell className="w-5 h-5" />}
//             label="Send Alert"
//             onClick={() => openModal("alert")}
//           />
//         </div>
//       </div>

//       {/* FINAL MODAL */}
//       <Modal open={isOpen} onClose={closeModal}>
//         {renderForm()}
//       </Modal>
//     </>
//   );
// };

// /* ---------------- Action Button Component ---------------- */
// const ActionButton = ({ icon, label, onClick }) => (
//   <button
//     onClick={onClick}
//     className="p-3 rounded-lg border dark:border-gray-500 flex flex-col items-center gap-2 
//     bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
//   >
//     <div className="text-gray-700 dark:text-gray-400">{icon}</div>
//     <span className="text-gray-700 dark:text-gray-400 text-sm">{label}</span>
//   </button>
// );

// export default QuickActions;


import { useState } from "react";
import { Plus, Bus, Route, Bell } from "lucide-react";

// shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Card } from "../../components/ui/card";

const QuickActions = () => {
  const [modalType, setModalType] = useState(null);
  const [open, setOpen] = useState(false);

  const openModal = (type) => {
    setModalType(type);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setModalType(null);
  };

  /* ------------------- Render Form by Type ------------------- */
  const renderForm = () => {
    switch (modalType) {
      case "driver":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add Driver</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4 ">
              <div>
                <Label>Driver Name</Label>
                <Input placeholder="Enter driver name" />
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input placeholder="+01 3XX XXXXXXX" />
              </div>

              <div>
                <Label>CNIC</Label>
                <Input placeholder="XXXXX-XXXXXXX-X" />
              </div>
            </div>
          </>
        );

      case "bus":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add Bus</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>Bus Number</Label>
                <Input placeholder="LHE-1234" />
              </div>

              <div>
                <Label>Bus Model</Label>
                <Input placeholder="Toyota Coaster" />
              </div>

              <div>
                <Label>Seating Capacity</Label>
                <Input type="number" placeholder="22" min="0" />
              </div>
            </div>
          </>
        );

      case "route":
        return (
          <>
            <DialogHeader>
              <DialogTitle>New Route</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>Route Name</Label>
                <Input placeholder="Route A" />
              </div>

              <div>
                <Label>Start Location</Label>
                <Input placeholder="Enter start point" />
              </div>

              <div>
                <Label>End Location</Label>
                <Input placeholder="Enter destination" />
              </div>
            </div>
          </>
        );

      case "alert":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Send Alert</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>Alert Title</Label>
                <Input placeholder="Enter title" />
              </div>

              <div>
                <Label>Message</Label>
                <Textarea rows="4" placeholder="Write your alert message..." />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <h4 className="text-md dark:text-gray-300 ">Quick Actions</h4>
      <p className="text-sm text-gray-400 font-light mb-4">Common tasks</p>

      {/* Quick Action Buttons */}
      <Card className="p-4 max-w-md border-none dark:bg-gray-800 shadow-none">
        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            icon={<Plus className="w-5 h-5" />}
            label="Add Driver"
            onClick={() => openModal("driver")}
          />

          <ActionButton
            icon={<Bus className="w-5 h-5" />}
            label="Add Bus"
            onClick={() => openModal("bus")}
          />

          <ActionButton
            icon={<Route className="w-5 h-5" />}
            label="New Route"
            onClick={() => openModal("route")}
          />

          <ActionButton
            icon={<Bell className="w-5 h-5" />}
            label="Send Alert"
            onClick={() => openModal("alert")}
          />
        </div>
      </Card>

      {/* shadcn Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md dark:text-gray-300">
          {renderForm()}

          <DialogFooter className="mt-6 dark:text-gray-300">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

/* ---------------- Action Button ---------------- */
const ActionButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="p-3 rounded-lg border dark:border-gray-600 flex flex-col items-center gap-2
     bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
  >
    <div className="text-gray-700 dark:text-gray-300">{icon}</div>
    <span className="text-gray-700 dark:text-gray-300 text-sm">{label}</span>
  </button>
);

export default QuickActions;
