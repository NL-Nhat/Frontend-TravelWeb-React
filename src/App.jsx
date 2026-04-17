import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tours from './pages/Tours';
import TourDetail from './pages/TourDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTours from './pages/admin/AdminTours';
import AdminTourDetail from './pages/admin/AdminTourDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import BookingDetail from './pages/BookingDetail';
import BookingHistory from './pages/BookingHistory';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tours" element={<Tours />} />
      <Route path="/tour-detail/:id" element={<TourDetail />} />
      <Route path="/booking/:id" element={<Booking />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/booking-detail/:id" element={<BookingDetail />} />
      <Route path="/booking-history" element={<BookingHistory />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/account" element={<Account />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/tours" element={<AdminTours />} />
      <Route path="/admin/tours/:id" element={<AdminTourDetail />} />
    </Routes>
  );
}

export default App;