import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../services/api';
import Header from '../components/Header';
import '../styles/booking.css'; 
import '../styles/payment.css'; 

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Nhận id booking từ trang Đặt Tour truyền sang
    const { bookingId } = location.state || {};

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [acceptTerms, setAcceptTerms] = useState(false);
    
    // State lưu chi tiết đặt tour lấy từ API
    const [bookingDetail, setBookingDetail] = useState(null);

    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    
    // State chứa InfoTicketQRResponseDTO trả về sau khi thanh toán thành công
    const [ticketInfo, setTicketInfo] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Fetch Danh sách phương thức thanh toán & Chi tiết Booking
    useEffect(() => {
        if (!bookingId) {
            navigate('/tours'); // Đá về danh sách tour nếu truy cập trực tiếp không có ID
            return;
        }

        const fetchData = async () => {
            try {
                // Gọi API lấy danh sách phương thức thanh toán
                const methodsRes = await axiosClient.get('/paymentmethods', {
                    params: { status: 'Hoạt động' }
                });
                setPaymentMethods(methodsRes.data);
                if (methodsRes.data.length > 0) {
                    setSelectedMethod(methodsRes.data[0].id); // Chọn phương thức đầu tiên mặc định
                }

                // Gọi API lấy chi tiết đặt tour
                const bookingRes = await axiosClient.get(`/bookings/${bookingId}`);
                setBookingDetail(bookingRes.data);

            } catch (err) {
                console.error("Lỗi tải dữ liệu thanh toán:", err);
                setError('Không thể tải dữ liệu thanh toán. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookingId, navigate]);

    // Xử lý Gửi thanh toán
    const handleProcessPayment = async () => {
        if (!acceptTerms) {
            setError("Vui lòng đồng ý với điều khoản dịch vụ và chính sách hủy tour.");
            return;
        }
        if (!selectedMethod) {
            setError("Vui lòng chọn một phương thức thanh toán.");
            return;
        }

        setError('');
        setIsProcessing(true);

        try {
            const payload = {
                idBooking: bookingId,
                idMethod: selectedMethod,
                totalAmount: bookingDetail.totalAmount
            };

            // Gọi API thanh toán
            const response = await axiosClient.post('/payments', payload);
            
            // response.data có dạng { data: InfoTicketQRResponseDTO, message: "Thanh toán thành công" }
            setTicketInfo(response.data.data);
            setShowSuccessModal(true);

        } catch (err) {
            console.error("Lỗi thanh toán:", err);
            if (err.response && err.response.data) {
                setError(typeof err.response.data === 'string' ? err.response.data : err.response.data.message);
            } else {
                setError("Thanh toán thất bại. Vui lòng thử lại!");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Hàm tiện ích format
    const formatPrice = (price) => {
        if (!price) return '0đ';
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

    // Hàm xác định icon dựa trên tên phương thức (tạo UI động)
    const getMethodIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('ngân hàng') || lowerName.includes('chuyển khoản')) return { icon: 'fa-university', class: 'bank' };
        if (lowerName.includes('thẻ') || lowerName.includes('card')) return { icon: 'fa-credit-card', class: 'card' };
        if (lowerName.includes('ví') || lowerName.includes('momo') || lowerName.includes('zalo')) return { icon: 'fa-wallet', class: 'wallet' };
        return { icon: 'fa-hand-holding-usd', class: 'deposit' };
    };

    if (loading) return <div><Header /><div style={{ textAlign: 'center', padding: '100px' }}><h2>Đang tải cổng thanh toán...</h2></div></div>;
    if (error && !bookingDetail) return <div><Header /><div style={{ textAlign: 'center', padding: '100px', color: 'red' }}><h2>{error}</h2></div></div>;

    // Xác định tên của phương thức đang chọn để hiện nội dung tương ứng
    const selectedMethodObj = paymentMethods.find(m => m.id === selectedMethod);
    const selectedMethodName = selectedMethodObj ? selectedMethodObj.nameMethod.toLowerCase() : '';

    // Lấy dữ liệu DTO con ra cho code gọn gàng
    const infoTour = bookingDetail?.infoBookingResponseDTO;

    return (
        <>
            <Header />
            <main className="booking-page">
                <div className="container">
                    <h1 className="page-title">Thanh Toán</h1>
                    
                    {/* Progress Steps */}
                    <div className="booking-steps">
                        <div className="step completed">
                            <div className="step-number"><i className="fas fa-check"></i></div>
                            <span>Thông tin</span>
                        </div>
                        <div className="step active">
                            <div className="step-number">2</div>
                            <span>Thanh toán</span>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <span>Vé điện tử</span>
                        </div>
                    </div>

                    <div className="booking-layout">
                        {/* Payment Form */}
                        <div className="booking-form-container">
                            <div className="form-section">
                                <h2><i className="fas fa-credit-card"></i> Phương thức thanh toán</h2>
                                
                                <div className="payment-methods">
                                    {paymentMethods.map(method => {
                                        const { icon, class: iconClass } = getMethodIcon(method.nameMethod);
                                        return (
                                            <label className="payment-method" key={method.id}>
                                                <input 
                                                    type="radio" 
                                                    name="payment" 
                                                    value={method.id} 
                                                    checked={selectedMethod === method.id}
                                                    onChange={() => setSelectedMethod(method.id)} 
                                                />
                                                <div className="method-content">
                                                    <div className={`method-icon ${iconClass}`}>
                                                        <i className={`fas ${icon}`}></i>
                                                    </div>
                                                    <div className="method-info">
                                                        <h4>{method.nameMethod}</h4>
                                                    </div>
                                                    <i className="fas fa-check-circle method-check"></i>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Payment Details (Hiện động theo loại thanh toán nếu là Chuyển khoản) */}
                            {selectedMethodName.includes('chuyển khoản') && (
                                <div className="form-section payment-details">
                                    <h3><i className="fas fa-info-circle"></i> Thông tin chuyển khoản</h3>
                                    <div className="bank-info">
                                        <div className="bank-item">
                                            <span className="bank-label">Ngân hàng:</span>
                                            <strong>Vietcombank - CN Đà Nẵng</strong>
                                        </div>
                                        <div className="bank-item">
                                            <span className="bank-label">Số tài khoản:</span>
                                            <strong>0123456789</strong>
                                            <button className="btn-copy" onClick={() => navigator.clipboard.writeText('0123456789')}>
                                                <i className="fas fa-copy"></i>
                                            </button>
                                        </div>
                                        <div className="bank-item">
                                            <span className="bank-label">Chủ tài khoản:</span>
                                            <strong>CÔNG TY DU LỊCH VIETTRAVEL</strong>
                                        </div>
                                        <div className="bank-item">
                                            <span className="bank-label">Nội dung:</span>
                                            <strong>DATTOUR {bookingId}</strong>
                                            <button className="btn-copy" onClick={() => navigator.clipboard.writeText(`DATTOUR ${bookingId}`)}>
                                                <i className="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="payment-note">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <p>Vui lòng chuyển khoản chính xác nội dung để chúng tôi xác nhận nhanh nhất</p>
                                    </div>
                                </div>
                            )}

                            {/* Terms */}
                            <div className="form-section">
                                <label className="checkbox-container">
                                    <input 
                                        type="checkbox" 
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)} 
                                        required 
                                    />
                                    <span className="checkmark"></span>
                                    <span className="checkbox-label" style={{ marginLeft: '10px' }}>
                                        Tôi đã đọc và đồng ý với 
                                        <a href="#" target="_blank" style={{ color: 'var(--primary)', margin: '0 4px' }}>Điều khoản và điều kiện</a> 
                                        và <a href="#" target="_blank" style={{ color: 'var(--primary)', margin: '0 4px' }}>Chính sách hủy tour</a>
                                    </span>
                                </label>
                            </div>

                            {error && <div style={{ color: 'var(--danger)', marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '8px' }}>{error}</div>}

                            {/* Actions */}
                            <div className="form-actions">
                                <button className="btn-back" onClick={() => navigate(-1)}>
                                    <i className="fas fa-arrow-left"></i> Quay lại
                                </button>
                                <button className="btn-continue" onClick={handleProcessPayment} disabled={isProcessing}>
                                    <i className={isProcessing ? "fas fa-spinner fa-spin" : "fas fa-check"}></i> 
                                    {isProcessing ? " Đang xử lý..." : " Xác nhận thanh toán"}
                                </button>
                            </div>
                        </div>

                        {/* Booking Summary */}
                        <aside className="booking-summary">
                            <div className="summary-card">
                                <h3>Thông tin tour</h3>
                                <img src={infoTour?.image || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400"} alt="Tour" style={{ borderRadius: '8px', marginBottom: '15px' }} />
                                <h4>{infoTour?.tourName}</h4>
                                <div className="summary-item">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{infoTour?.city}</span>
                                </div>
                                <div className="summary-item">
                                    <i className="fas fa-calendar"></i>
                                    <span>{infoTour ? formatDate(infoTour.startDate) : ''}</span>
                                </div>
                                <div className="summary-item">
                                    <i className="fas fa-clock"></i>
                                    <span>{infoTour ? formatTime(infoTour.startTime) : ''}</span>
                                </div>
                                
                                <div className="divider"></div>
                                
                                <h4>Khách hàng</h4>
                                <div className="summary-item">
                                    <i className="fas fa-user"></i>
                                    <span>{bookingDetail?.nameGuest}</span>
                                </div>
                                <div className="summary-item">
                                    <i className="fas fa-phone"></i>
                                    <span>{bookingDetail?.phoneNumber}</span>
                                </div>
                                <div className="summary-item">
                                    <i className="fas fa-envelope"></i>
                                    <span>{bookingDetail?.email}</span>
                                </div>
                                
                                <div className="divider"></div>
                                
                                <h4>Chi tiết giá</h4>
                                <div className="price-breakdown">
                                    <div className="price-item">
                                        <span>{bookingDetail?.adultNumber} x Người lớn</span>
                                        <span>{formatPrice(bookingDetail?.adultNumber * infoTour?.adultPrice)}</span>
                                    </div>
                                    {bookingDetail?.childNumber > 0 && (
                                        <div className="price-item">
                                            <span>{bookingDetail?.childNumber} x Trẻ em</span>
                                            <span>{formatPrice(bookingDetail?.childNumber * infoTour?.childPrice)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="divider"></div>
                                
                                <div className="total-summary">
                                    <span>Tổng cần thanh toán:</span>
                                    <span className="total-price">{formatPrice(bookingDetail?.totalAmount)}</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Success QR Modal */}
            {showSuccessModal && ticketInfo && (
                <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                    <div className="modal-content success-modal" style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '400px' }}>
                        <div className="success-icon" style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '1rem' }}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Thanh toán thành công!</h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Bạn đã sở hữu vé tham gia {ticketInfo.tourName}</p>
                        
                        <div className="qr-code-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            {/* Dùng dịch vụ bên thứ 3 để sinh mã QR từ idTicket */}
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${ticketInfo.idTicket}`} 
                                alt="Ticket QR Code" 
                                style={{ border: '4px solid var(--border)', borderRadius: '8px' }}
                            />
                        </div>

                        <div className="booking-code" style={{ background: 'var(--bg-light)', padding: '0.5rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            <span>Mã vé: {ticketInfo.idTicket}</span>
                        </div>
                        
                        <p className="success-note" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Mã vé QR đã được gửi về email của bạn. Vui lòng xuất trình mã này cho Hướng dẫn viên khi bắt đầu tour.
                        </p>
                        
                        <div className="success-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn-secondary" onClick={() => navigate('/')}>
                                Về trang chủ
                            </button>
                            <button className="btn-primary" onClick={() => navigate('/booking-detail', { state: { bookingId: ticketInfo.idBooking } })}>
                                Xem chi tiết đặt tour
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default Payment;