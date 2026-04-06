import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../services/api';
import Header from '../components/Header';
import '../styles/detailbooking.css';

const BookingDetail = () => {
    // Ưu tiên lấy ID từ params (VD: /booking-detail/1). Nếu không có, lấy từ state truyền qua
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const bookingId = params.id || location.state?.bookingId;
    const qrCanvasRef = useRef(null);

    const [bookingDetail, setBookingDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dữ liệu Chi tiết Booking & Payment
    useEffect(() => {
        if (!bookingId) {
            navigate('/account');
            return;
        }

        const fetchDetail = async () => {
            try {
                const response = await axiosClient.get(`/bookings/booking-payment/${bookingId}`);
                setBookingDetail(response.data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết đơn đặt tour:", err);
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                } else {
                    setError('Không thể tải thông tin chi tiết đơn hàng.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [bookingId, navigate]);

    // Render QR Code bằng API mở sau khi có dữ liệu
    useEffect(() => {
        if (bookingDetail && bookingDetail.idTicket && qrCanvasRef.current) {
            const canvas = qrCanvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            };
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(bookingDetail.idTicket)}`;
        }
    }, [bookingDetail]);

    // Các hàm format dữ liệu
    const formatPrice = (price) => {
        if (price === undefined || price === null) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        const date = new Date(dateTimeString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCancelBooking = () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy tour này không?')) {
            // Viết logic gọi API hủy tour ở đây nếu có
            alert('Tính năng hủy tour đang được cập nhật!');
        }
    };

    if (loading) return <div><Header /><div style={{ textAlign: 'center', padding: '100px' }}><h2>Đang tải chi tiết đơn hàng...</h2></div></div>;
    if (error || !bookingDetail) return <div><Header /><div style={{ textAlign: 'center', padding: '100px', color: 'red' }}><h2>{error || "Không tìm thấy dữ liệu"}</h2></div></div>;

    // Phân tách dữ liệu từ DTO để dễ code
    const infoTour = bookingDetail.bookingResponseDTO?.infoBookingResponseDTO;
    const bookingInfo = bookingDetail.bookingResponseDTO;
    const guide = bookingDetail.huongDanVien;
    const payment = bookingDetail.payment;
    const schedules = bookingDetail.scheduleResponseDTOs || [];

    const isPaid = bookingDetail.paymentStatus === "Đã thanh toán";

    return (
        <>
            <Header />
            <main className="booking-detail-page">
                <div className="container">
                    {/* Back Button */}
                    <div className="page-nav">
                        <Link to="/account" className="dbooking-btn-back">
                            <i className="fas fa-arrow-left"></i>
                            Quay lại danh sách đặt tour
                        </Link>
                    </div>

                    {/* Status Header */}
                    <div className="booking-header">
                        <div className="header-left">
                            <div className={`status-indicator ${isPaid ? 'confirmed' : 'pending'}`}>
                                <i className={isPaid ? "fas fa-check-circle" : "fas fa-clock"}></i>
                                <div>
                                    <span className="status-label">Trạng thái thanh toán</span>
                                    <h2 className="status-text">{bookingDetail?.paymentStatus || 'Chưa xác định'}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
                            {!isPaid && (
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate('/payment', { state: { bookingId: bookingId } })}
                                >
                                    <i className="fas fa-credit-card" style={{ marginRight: '8px' }}></i>
                                    Thanh toán ngay
                                </button>
                            )}
                            <button className="btn-action danger" onClick={handleCancelBooking}>
                                <i className="fas fa-times-circle"></i>
                                Hủy tour
                            </button>
                        </div>
                    </div>

                    <div className="booking-content">
                        {/* Left Column */}
                        <div className="main-content">

                            {/* E-Ticket Section with QR Code */}
                            {isPaid && (
                                <div className="ticket-section">
                                    <div className="ticket-header">
                                        <h3><i className="fas fa-ticket-alt"></i> Vé điện tử</h3>
                                        <span className="ticket-badge">E-TICKET</span>
                                    </div>

                                    <div className="ticket-container">
                                        <div className="e-ticket">
                                            {/* Top Section */}
                                            <div className="ticket-top">
                                                <div className="ticket-logo">
                                                    <i className="fas fa-compass"></i>
                                                    <span>VietTravel</span>
                                                </div>
                                                <div className="ticket-code">
                                                    <span>Mã vé</span>
                                                    <h3>{bookingDetail.idTicket}</h3>
                                                </div>
                                            </div>

                                            {/* QR Code Section */}
                                            <div className="ticket-qr">
                                                <div className="qr-container">
                                                    <canvas ref={qrCanvasRef}></canvas>
                                                </div>
                                                <p className="qr-instruction">
                                                    <i className="fas fa-info-circle"></i>
                                                    Vui lòng xuất trình mã QR này khi tham gia tour
                                                </p>
                                            </div>

                                            <div className="header-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                                                <button className="btn-action" onClick={handlePrint}>
                                                    <i className="fas fa-print"></i> 
                                                    In vé
                                                </button>
                                                <button class="btn-action" onclick="downloadTicket()">
                                                    <i class="fas fa-download"></i>
                                                    Tải vé
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Passenger Info */}
                            <div className="detail-section">
                                <h3><i className="fas fa-users"></i> Thông tin hành khách</h3>

                                <div className="passenger-card">
                                    <div className="passenger-name">
                                        <strong>{bookingInfo?.nameGuest}</strong>
                                    </div>

                                    <div className="passenger-info">
                                        <div>
                                            <label>Số điện thoại</label>
                                            <p>{bookingInfo?.phoneNumber}</p>
                                        </div>
                                        <div>
                                            <label>Email</label>
                                            <p>{bookingInfo?.email}</p>
                                        </div>
                                        <div>
                                            <label>Địa chỉ</label>
                                            <p>{bookingInfo?.address || 'Chưa cập nhật'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Right Sidebar */}
                        <aside className="sidebar-content">

                            {/* Booking Summary */}
                            <div className="dbooking-summary-card">
                                <h3>Thông tin đặt tour</h3>
                                <div className="dbooking-summary-item">
                                    <span className="label">Ngày đặt:</span>
                                    <span className="value">{formatDateTime(bookingDetail.bookedDate)}</span>
                                </div>

                                <div className="dbooking-summary-item">
                                    <span className="label">Trạng thái đặt:</span>
                                    <span className="value">{bookingDetail.bookingStatus}</span>
                                </div>

                                <div className="dbooking-summary-item">
                                    <span className="label">Trạng thái thanh toán:</span>
                                    <span className={`value ${isPaid ? 'text-success' : 'text-warning'}`} style={{ color: isPaid ? 'var(--success)' : 'var(--primary)' }}>
                                        {bookingDetail?.paymentStatus}
                                    </span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="price-summary">
                                    <h4>Chi tiết thanh toán</h4>
                                    <div className="price-row">
                                        <span>{bookingInfo?.adultNumber} x Người lớn</span>
                                        <span>{formatPrice((bookingInfo?.adultNumber || 0) * (infoTour?.adultPrice || 0))}</span>
                                    </div>
                                    {bookingInfo?.childNumber > 0 && (
                                        <div className="price-row">
                                            <span>{bookingInfo?.childNumber} x Trẻ em</span>
                                            <span>{formatPrice(bookingInfo?.childNumber * infoTour?.childPrice)}</span>
                                        </div>
                                    )}

                                    <div className="price-total">
                                        <div>
                                            <strong>Tổng tiền:</strong>
                                            <strong className="amount">{formatPrice(bookingInfo?.totalAmount)}</strong>
                                        </div>

                                        <div>
                                            <strong>Đã thanh toán:</strong>
                                            <strong className="amount" style={{ color: 'var(--success)' }}>
                                                {formatPrice(payment?.amount || 0)}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Hiển thị thông tin phương thức nếu đã thanh toán */}
                                {payment && (
                                    <>
                                        <div className="summary-divider"></div>
                                        <div className="price-summary">
                                            <h4>Phương thức thanh toán:</h4>
                                            <div className="price-row">
                                                <span>{payment.nameMethod}</span>
                                                <span>{formatDateTime(payment.paymentDate)}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Hướng dẫn viên */}
                            <div className="guide-card">
                                <h3><i className="fas fa-user-tie"></i> Hướng dẫn viên</h3>
                                {guide ? (
                                    <>
                                        <div className="guide-info">
                                            <img src={guide.avatar || "https://i.pravatar.cc/150"} alt="HDV" />
                                            <div>
                                                <h4>{guide.fullName}</h4>
                                                <div className="phoneguide">
                                                    <i className="fas fa-phone"></i>
                                                    <span>{guide.phoneNumber || 'Đang cập nhật'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <a href={`mailto:${guide.email}`} className="btn-contact-guide" style={{ textAlign: 'center' }}>
                                            <i className="fas fa-envelope"></i>
                                            Gửi mail liên hệ HDV
                                        </a>
                                    </>
                                ) : (
                                    <p style={{ textAlign: 'center', color: 'var(--text-light)', fontStyle: 'italic', margin: '1rem 0' }}>
                                        Tour này chưa được phân công Hướng dẫn viên.
                                    </p>
                                )}
                            </div>
                        </aside>
                    </div>

                    {/* Tour Details */}
                    <div className="detail-section">
                        <h3><i className="fas fa-info-circle"></i> Thông tin chi tiết tour</h3>

                        <div className="dbooking-tour-card">
                            {/* LEFT */}
                            <div className="tour-left">
                                <img src={infoTour?.image || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"} alt="Tour" id="tourImage" />

                                <div className="tour-content">
                                    <h2>{infoTour?.tourName}</h2>
                                    <p className="tour-description">{infoTour?.city}</p>
                                </div>

                                <Link to={`/tour-detail/${bookingDetail.idTour}`} className="btn-contact-guide" style={{ textAlign: 'center' }}>
                                    Xem chi tiết tour
                                </Link>
                            </div>

                            {/* RIGHT */}
                            <div className="tour-right">
                                <h3><i className="fas fa-calendar-alt"></i> Lịch khởi hành</h3>

                                <div className="dbooking-schedule-item">
                                    <label>Ngày bắt đầu</label>
                                    <p>{formatDate(infoTour?.startDate)}</p>
                                </div>

                                <div className="dbooking-schedule-item">
                                    <label>Ngày kết thúc</label>
                                    <p>{formatDate(infoTour?.endDate)}</p>
                                </div>

                                <div className="dbooking-schedule-item">
                                    <label>Giờ bắt đầu</label>
                                    <p>{formatTime(infoTour?.startTime)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div className="detail-section">
                        <h3><i className="fas fa-route"></i> Lịch trình chi tiết</h3>

                        <div className="dbooking-itinerary-timeline">
                            {schedules.length > 0 ? (
                                schedules.map((schedule) => (
                                    <div key={schedule.id} className="dbooking-timeline-item">
                                        <div className="timeline-time">{formatTime(schedule.time)}</div>
                                        <div className="timeline-content">
                                            <h4>{schedule.work}</h4>
                                            <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                <i className="fas fa-calendar-day"></i> Ngày: {formatDate(schedule.date)}
                                            </p>
                                            <p>{schedule.describe}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa có thông tin lịch trình chi tiết.</p>
                            )}
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
        </>
    );
};

export default BookingDetail;