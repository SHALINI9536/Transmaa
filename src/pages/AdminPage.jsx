import React, { useEffect, useState } from "react";
import { db, ref, onValue, update } from "../firebase";
import { ShieldCheck, Users, Truck, IndianRupee } from "lucide-react";

export default function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsubBookings = onValue(ref(db, "bookings"), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setBookings(Object.keys(val).map((k) => ({ id: k, ...val[k] })));
      } else {
        setBookings([]);
      }
    });

    const unsubUsers = onValue(ref(db, "users"), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setUsers(Object.keys(val).map((k) => ({ id: k, ...val[k] })));
      } else {
        setUsers([]);
      }
    });

    return () => {
      unsubBookings();
      unsubUsers();
    };
  }, []);

  const updateBookingStatus = async (id, status) => {
    await update(ref(db, `bookings/${id}`), { status });
  };

  const totalRevenue = bookings.reduce((acc, b) => acc + Number(b.fare || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Admin Control Center</span>
          </div>
          <h1 className="text-2xl font-bold">Transmaa Master Operations</h1>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Bookings</p>
            <p className="text-2xl font-bold">{bookings.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Gross Freight Volume</p>
            <p className="text-2xl font-bold">₹{totalRevenue}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Registered Customers & Drivers</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
        </div>
      </div>

      {/* All Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h2 className="font-bold text-slate-900">All Platform Shipments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Route</th>
                <th className="p-4">Vehicle</th>
                <th className="p-4">Fare</th>
                <th className="p-4">Status</th>
                <th className="p-4">Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="p-4 font-mono text-xs font-bold">{b.bookingRef}</td>
                  <td className="p-4">{b.customerName}</td>
                  <td className="p-4 text-xs">{b.pickup} → {b.drop}</td>
                  <td className="p-4 text-xs">{b.vehicleName}</td>
                  <td className="p-4 font-bold">₹{b.fare}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100">
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={b.status}
                      onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                      className="border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
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
