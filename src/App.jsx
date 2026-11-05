import React from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {ProtectedRoute} from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import {HomePage,PortalLayout,CustomerHome,NewBooking,MyBookings,TrackShipment,DriverRegister,DriverLoads,DriverDeliveries,ProfilePage,ServicesPage,AboutPage,ContactPage} from './pages/PortalPages.jsx';
import './index.css';
export default function App(){return <AuthProvider><BrowserRouter><Navbar/><Routes>
<Route path="/" element={<HomePage/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/services" element={<ServicesPage/>}/><Route path="/contact" element={<ContactPage/>}/>
<Route element={<ProtectedRoute><PortalLayout/></ProtectedRoute>}>
<Route path="/dashboard" element={<CustomerHome/>}/><Route path="/customer/new-booking" element={<NewBooking/>}/><Route path="/customer/bookings" element={<MyBookings/>}/><Route path="/customer/track" element={<TrackShipment/>}/><Route path="/driver/register" element={<DriverRegister/>}/><Route path="/driver/loads" element={<DriverLoads/>}/><Route path="/driver/deliveries" element={<DriverDeliveries/>}/><Route path="/profile" element={<ProfilePage/>}/>
</Route><Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage/></ProtectedRoute>}/><Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></BrowserRouter></AuthProvider>}
