import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../services/api';
import Header from '../components/Header';
import '../styles/historybooking.css'; // Đảm bảo bạn đã import CSS của trang này

const BookingHistory = () => {
    const navigate = useNavigate();

    // States cho dữ liệu API
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // States cho UI, Lọc và Sắp xếp
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'confirmed', 'cancelled'
    const [filterMonth, setFilterMonth] = useState('');
    const [sortOption, setSortOption] = useState('newest');

    // States cho Modal Hủy Tour
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    // Fetch dữ liệu Lịch sử đặt tour
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axiosClient.get('/bookings/history');
                setBookings(response.data || []);
            } catch (err) {
                console.error("Lỗi tải lịch sử đặt tour:", err);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                } else {
                    setError('Không thể tải lịch sử đặt tour. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    // Các hàm format
    const formatPrice = (price) => {
        if (price === undefined || price === null) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    // Hàm xử lý mở/đóng Modal hủy tour
    const openCancelModal = (booking) => {
        setSelectedBookingToCancel(booking);
        setCancelReason('');
        setCancelModalOpen(true);
    };

    const closeCancelModal = () => {
        setCancelModalOpen(false);
        setSelectedBookingToCancel(null);
    };

    const confirmCancel = () => {
        // Logic gọi API hủy tour sẽ thêm vào đây sau
        alert(`Hủy tour thành công! Tiền sẽ được hoàn lại trong 3-5 ngày.\n(Lý do: ${cancelReason || 'Không có'})`);
        closeCancelModal();
    };

    // Logic Lọc (Filter) và Sắp xếp (Sort)
    const getFilteredAndSortedBookings = () => {
        let result = [...bookings];

        // 1. Lọc theo Tab
        if (activeTab === 'confirmed') {
            result = result.filter(b => b.bookingStatus === 'Đã đặt');
        } else if (activeTab === 'cancelled') {
            result = result.filter(b => b.bookingStatus === 'Đã hủy');
        }

        // 2. Lọc theo Tháng
        if (filterMonth) {
            result = result.filter(b => {
                if (!b.bookedDate) return false;
                const month = new Date(b.bookedDate).getMonth() + 1; // getMonth() trả từ 0-11
                const formattedMonth = month < 10 ? `0${month}` : `${month}`;
                return formattedMonth === filterMonth;
            });
        }

        // 3. Sắp xếp
        result.sort((a, b) => {
            const dateA = new Date(a.bookedDate).getTime();
            const dateB = new Date(b.bookedDate).getTime();
            const priceA = a.totalAmount || 0;
            const priceB = b.totalAmount || 0;

            switch (sortOption) {
                case 'newest': return dateB - dateA;
                case 'oldest': return dateA - dateB;
                case 'price-high': return priceB - priceA;
                case 'price-low': return priceA - priceB;
                default: return 0;
            }
        });

        return result;
    };

    const displayedBookings = getFilteredAndSortedBookings();

    // Tính toán số lượng cho các Tabs
    const countAll = bookings.length;
    const countConfirmed = bookings.filter(b => b.bookingStatus === 'Đã đặt').length;
    const countCancelled = bookings.filter(b => b.bookingStatus === 'Đã hủy').length;

    if (loading) return <div><Header /><div style={{ textAlign: 'center', padding: '100px' }}><h2>Đang tải dữ liệu...</h2></div></div>;
    if (error) return <div><Header /><div style={{ textAlign: 'center', padding: '100px', color: 'red' }}><h2>{error}</h2></div></div>;

    return (
        <>
            <Header />
            <main className="booking-history-page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header">
                        <div className="header-content">
                            <h1><i className="fas fa-history"></i> Lịch sử đặt tour</h1>
                            <p>Quản lý và theo dõi tất cả các tour bạn đã đặt</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="booking-tabs">
                        <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                            <i className="fas fa-list"></i>
                            <span>Tất cả</span>
                            <span className="tab-count">{countAll}</span>
                        </button>
                        <button className={`tab-btn ${activeTab === 'confirmed' ? 'active' : ''}`} onClick={() => setActiveTab('confirmed')}>
                            <i className="fas fa-check-circle"></i>
                            <span>Đã đặt</span>
                            <span className="tab-count">{countConfirmed}</span>
                        </button>
                        <button className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('cancelled')}>
                            <i className="fas fa-times-circle"></i>
                            <span>Đã hủy</span>
                            <span className="tab-count">{countCancelled}</span>
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="filters-bar">
                        <div className="filter-group">
                            <i className="fas fa-calendar"></i>
                            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                <option value="">Tất cả tháng</option>
                                <option value="01">Tháng 1</option>
                                <option value="02">Tháng 2</option>
                                <option value="03">Tháng 3</option>
                                <option value="04">Tháng 4</option>
                                <option value="05">Tháng 5</option>
                                <option value="06">Tháng 6</option>
                                <option value="07">Tháng 7</option>
                                <option value="08">Tháng 8</option>
                                <option value="09">Tháng 9</option>
                                <option value="10">Tháng 10</option>
                                <option value="11">Tháng 11</option>
                                <option value="12">Tháng 12</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <i className="fas fa-sort"></i>
                            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="price-high">Giá cao nhất</option>
                                <option value="price-low">Giá thấp nhất</option>
                            </select>
                        </div>
                    </div>

                    {/* Booking List */}
                    <div className="bookings-container">
                        <div className="tab-content active">
                            <div className="bookings-list">
                                {displayedBookings.length === 0 ? (
                                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                                        Không tìm thấy dữ liệu đặt tour nào phù hợp.
                                    </p>
                                ) : (
                                    displayedBookings.map((booking) => {
                                        const info = booking.infoBookingResponseDTO;
                                        const isCancelled = booking.bookingStatus === 'Đã hủy';
                                        const isPaid = booking.paymentStatus === 'Đã thanh toán';

                                        return (
                                            <div className="booking-card" key={booking.id}>
                                                <div className="booking-card-body">
                                                    <div className="booking-image">
                                                        <img src={info?.image || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400"} alt="Tour" />
                                                    </div>
                                                    <div className="booking-info">
                                                        <h3>{info?.tourName}</h3>
                                                        <div className="booking-details">
                                                            <div className="detail-item">
                                                                <i className="fas fa-map-marker-alt"></i>
                                                                <span>Điểm đến: <strong>{info?.city}</strong></span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <i className="fas fa-calendar"></i>
                                                                <span>Khởi hành: <strong>{formatDate(info?.startDate)}</strong></span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <i className="fas fa-clock"></i>
                                                                <span>Giờ: <strong>{formatTime(info?.startTime)}</strong></span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <i className="fas fa-users"></i>
                                                                <span>Số khách: <strong>{booking?.adultNumber} người lớn, {booking?.childNumber} trẻ em</strong></span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <i className="fas fa-calendar-check"></i>
                                                                <span>Ngày đặt: <strong>{formatDate(booking.bookedDate)}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="booking-actions-section">
                                                        <div className="booking-price">
                                                            <div className={`booking-status ${isCancelled ? 'cancelled' : 'confirmed'}`}>
                                                                <i className={isCancelled ? "fas fa-times-circle" : "fas fa-check-circle"}></i>
                                                                {booking.bookingStatus}
                                                            </div>
                                                            <div className="price-value">Tổng tiền: {formatPrice(booking.totalAmount)}</div>
                                                            
                                                            {!isCancelled && (
                                                                <div className={`payment-status ${isPaid ? 'paid' : 'notpaid'}`}>
                                                                    <i className={isPaid ? "fas fa-check" : "fas fa-times-circle"}></i>
                                                                    {booking.paymentStatus}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="booking-actions">
                                                            {/* Nút Xem chi tiết */}
                                                            <button className="action-btn primary" onClick={() => navigate(`/booking-detail/${booking.id}`)}>
                                                                <i className="fas fa-eye"></i> Xem chi tiết
                                                            </button>

                                                            {/* Nút Thanh toán (Nếu Đã đặt nhưng Chưa thanh toán) */}
                                                            {!isCancelled && !isPaid && (
                                                                <button className="action-btn" style={{ background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }} onClick={() => navigate('/payment', { state: { bookingId: booking.id } })}>
                                                                    <i className="fas fa-credit-card"></i> Thanh toán
                                                                </button>
                                                            )}

                                                            {/* Nút Hủy tour (Chỉ hiện nếu chưa hủy) */}
                                                            {!isCancelled && (
                                                                <button className="action-btn danger" onClick={() => openCancelModal(booking)}>
                                                                    <i className="fas fa-times"></i> Hủy tour
                                                                </button>
                                                            )}

                                                            {/* Nút Đặt lại (Hiện khi đã hủy) */}
                                                            {isCancelled && (
                                                                <button className="action-btn" onClick={() => navigate('/tours')}>
                                                                    <i className="fas fa-redo"></i> Đặt lại
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <div className="footer-bottom">
                        <p>&copy; 2026 VietTravel. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            {/* Cancel Modal */}
            {cancelModalOpen && selectedBookingToCancel && (
                <div className="modal show" id="cancelModal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                    <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '500px', width: '100%' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <h3 style={{ color: 'var(--danger)', margin: 0 }}><i className="fas fa-exclamation-triangle"></i> Xác nhận hủy tour</h3>
                            <button className="btn-close-modal" onClick={closeCancelModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Bạn có chắc chắn muốn hủy tour này?</p>
                            <div className="booking-info-modal" id="modalBookingInfo" style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
                                <strong>{selectedBookingToCancel.infoBookingResponseDTO?.tourName}</strong><br/>
                                Mã Booking: #{selectedBookingToCancel.id}<br/>
                                Khởi hành: {formatDate(selectedBookingToCancel.infoBookingResponseDTO?.startDate)}<br/>
                                Tổng tiền: {formatPrice(selectedBookingToCancel.totalAmount)}
                            </div>
                            <div className="cancel-policy" style={{ marginBottom: '1rem' }}>
                                <h4><i className="fas fa-info-circle"></i> Chính sách hoàn tiền</h4>
                                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                                    <li>Hủy trước 7 ngày: Hoàn 100%</li>
                                    <li>Hủy trước 3 ngày: Hoàn 50%</li>
                                    <li>Hủy trong vòng 3 ngày: Không hoàn tiền</li>
                                </ul>
                            </div>
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: '600' }}>Lý do hủy (không bắt buộc)</label>
                                <textarea 
                                    rows="3" 
                                    placeholder="Vui lòng cho chúng tôi biết lý do hủy tour..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit', outline: 'none' }}
                                ></textarea>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={closeCancelModal} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                                Đóng
                            </button>
                            <button className="btn-danger" onClick={confirmCancel} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--danger)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-check"></i> Xác nhận hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingHistory;