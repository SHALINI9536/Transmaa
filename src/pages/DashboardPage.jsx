import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, ref, push, set, onValue, update } from "../firebase";
import { Truck, MapPin, Package, IndianRupee, Clock, CheckCircle, Navigation, PlusCircle } from "lucide-react";

const VEHICLE_TYPES = [
  { id: "tata_ace", name: "Tata Ace (Mini Truck)", capacity: "750 kg", baseRate: 450, perKm: 18 },
  { id: "pickup_8ft", name: "Bolero Pickup 8ft", capacity: "1.5 Ton", baseRate: 750, perKm: 24 },
  { id: "eicher_14ft", name: "Eicher 14ft", capacity: "4 Ton", baseRate: 1500, perKm: 38 },
  { id: "container_20ft", name: "20ft Closed Container", capacity: "7 Ton", baseRate: 2800, perKm: 52 },
  { id: "taurus_10w", name: "Taurus 10-Wheeler", capacity: "16 Ton", baseRate: 5500, perKm: 75 }
];

export default function DashboardPage() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [bookings, setBookings] = useState([]);

  // Booking form state
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [distanceKm, setDistanceKm] = useState(25);
  const [vehicleId, setVehicleId] = useState("tata_ace");
  const [goodsType, setGoodsType] = useState("Industrial / Commercial Goods");
  const [weightKg, setWeightKg] = useState("500");
  const [submitting, setSubmitting] = useState(false);

  const selectedVehicle = VEHICLE_TYPES.find((v) => v.id === vehicleId) || VEHICLE_TYPES[0];
  const estimatedFare = Math.round(selectedVehicle.baseRate + Number(distanceKm || 0) * selectedVehicle.perKm);

  useEffect(() => {
    const bookingsRef = ref(db, "bookings");
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setBookings(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        setBookings([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!pickup || !drop) return;
    setSubmitting(true);

    try {
      const newBookingRef = push(ref(db, "bookings"));
      const bookingPayload = {
        bookingRef: "TRM-" + Math.floor(100000 + Math.random() * 900000),
        customerId: currentUser.uid,
        customerName: userProfile?.name || currentUser.email || currentUser.phoneNumber,
        customerPhone: userProfile?.phone || currentUser.phoneNumber || "Not provided",
        pickup,
        drop,
        distanceKm: Number(distanceKm),
        vehicleName: selectedVehicle.name,
        goodsType,
        weightKg,
        fare: estimatedFare,
        status: "Pending", // Pending -> Accepted -> In Transit -> Delivered
        driverId: null,
        driverName: null,
        createdAt: new Date().toISOString()
      };
      await set(newBookingRef, bookingPayload);
      setPickup("");
      setDrop("");
    } catch (err) {
      alert("Error creating booking: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDriverAction = async (bookingId, newStatus) => {
    try {
      await update(ref(db, `bookings/${bookingId}`), {
        status: newStatus,
        driverId: currentUser.uid,
        driverName: userProfile?.name || currentUser.email || "Transmaa Driver"
      });
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const switchRole = async (newRole) => {
    if (newRole !== "customer" && newRole !== "driver") return;
    await update(ref(db, `users/${currentUser.uid}`), { role: newRole });
    await refreshProfile();
  };

  const myCustomerBookings = bookings.filter((b) => b.customerId === currentUser.uid);
  const driverAvailableBookings = bookings.filter(
    (b) => b.status === "Pending" || b.driverId === currentUser.uid
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {userProfile?.name || "Partner"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authenticated UID: <span className="font-mono text-slate-700">{currentUser.uid}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl">
          <button
            onClick={() => switchRole("customer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              userProfile?.role !== "driver"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Customer Mode
          </button>
          <button
            onClick={() => switchRole("driver")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              userProfile?.role === "driver"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Driver / Fleet Mode
          </button>
        </div>
      </div>

      {userProfile?.role === "driver" ? (
        /* DRIVER PORTAL */
        <div className="space-y-6">
          <div className="bg-blue-900 text-white rounded-2xl p-6 shadow">
            <h2 className="text-lg font-bold flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-amber-400" />
              <span>Driver Dispatch & Load Board</span>
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              Accept available freight loads and update live shipment milestones.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {driverAvailableBookings.length === 0 ? (
              <div className="col-span-2 bg-white p-8 rounded-2xl text-center text-slate-500 border border-slate-200">
                No active freight loads available right now.
              </div>
            ) : (
              driverAvailableBookings.map((b) => (
                <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-800">
                        {b.bookingRef}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                        {b.status}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="font-semibold text-slate-900">📍 Pickup: {b.pickup}</p>
                      <p className="font-semibold text-slate-900">🏁 Drop: {b.drop}</p>
                      <p className="text-xs text-slate-500">
                        Truck: {b.vehicleName} • Distance: {b.distanceKm} km • Weight: {b.weightKg} kg
                      </p>
                      <p className="text-xs text-slate-500">Customer: {b.customerName}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-lg font-bold text-emerald-600">₹{b.fare}</div>
                    <div className="space-x-2">
                      {b.status === "Pending" && (
                        <button
                          onClick={() => handleDriverAction(b.id, "Accepted")}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          Accept Load
                        </button>
                      )}
                      {b.status === "Accepted" && b.driverId === currentUser.uid && (
                        <button
                          onClick={() => handleDriverAction(b.id, "In Transit")}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          Start Transit
                        </button>
                      )}
                      {b.status === "In Transit" && b.driverId === currentUser.uid && (
                        <button
                          onClick={() => handleDriverAction(b.id, "Delivered")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* CUSTOMER BOOKING PORTAL */
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Book a Logistics Truck</span>
            </h2>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pickup City / Warehouse</label>
                <input
                  type="text"
                  required
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g., Sikar, Piprali Road"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Drop Destination</label>
                <input
                  type="text"
                  required
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  placeholder="e.g., Jaipur VKI Industrial Area"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Est. Distance (km)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Truck Type</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  {VEHICLE_TYPES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.capacity}) — ₹{v.perKm}/km
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Material / Goods Description</label>
                <input
                  type="text"
                  required
                  value={goodsType}
                  onChange={(e) => setGoodsType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-blue-700 font-medium block">Estimated Freight Fare</span>
                  <span className="text-[11px] text-slate-500">Includes base + per km charge</span>
                </div>
                <span className="text-2xl font-bold text-blue-700">₹{estimatedFare}</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow"
              >
                {submitting ? "Booking..." : "Confirm & Dispatch Booking"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Your Live Bookings ({myCustomerBookings.length})</h2>
            {myCustomerBookings.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl text-center text-slate-500 border border-slate-200">
                You haven't booked any shipments yet. Create your first booking on the left!
              </div>
            ) : (
              myCustomerBookings.map((b) => (
                <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded">
                      {b.bookingRef}
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        b.status === "Delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "In Transit"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Pickup</p>
                      <p className="font-semibold text-slate-800">{b.pickup}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Drop</p>
                      <p className="font-semibold text-slate-800">{b.drop}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs text-slate-600 gap-2">
                    <span>🚛 {b.vehicleName} ({b.distanceKm} km)</span>
                    <span>📦 {b.goodsType} ({b.weightKg} kg)</span>
                    <span>👨‍✈️ Driver: {b.driverName || "Assigning..."}</span>
                    <span className="text-base font-bold text-slate-900">₹{b.fare}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
