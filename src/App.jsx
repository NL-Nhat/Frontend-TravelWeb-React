import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import AdminDashboard from './pages/admin/AdminDashboard';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import BookingDetail from './pages/BookingDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tours" element={<Tours />} />
      <Route path="/tour-detail/:id" element={<TourDetail />} />
      <Route path="/booking/:id" element={<Booking />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/booking-detail" element={<BookingDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;