import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../services/api';
import Header from '../components/Header';
import styles from '../styles/booking.module.css';

const Booking = () => {
    const cx = (...classes) => classes.map((name) => styles[name] || name).join(' ');
    const { id } = useParams(); // Lấy ID tour từ URL (nếu có sử dụng)
    const location = useLocation(); // Lấy dữ liệu được truyền từ trang TourDetail
    const navigate = useNavigate();

    // State lưu trữ dữ liệu
    const [scheduleInfo, setScheduleInfo] = useState(null);
    const [bookingId, setBookingId] = useState(null); // Lưu ID trả về từ API đặt tour
    
    // State cho Form Đặt Tour (Trống hoàn toàn để người dùng tự nhập)
    const [formData, setFormData] = useState({
        nameGuest: '',
        phoneNumber: '',
        email: '',
        address: '', 
        doB: '',
        gender: '',
        note: ''
    });

    // State UI
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Dữ liệu từ trang chi tiết truyền qua (adultCount, childCount, scheduleId)
    const bookingState = location.state;

    useEffect(() => {
        // Nếu người dùng vào thẳng trang booking mà không qua trang chi tiết, đẩy về trang tour
        if (!bookingState || !bookingState.scheduleId) {
            navigate(`/tour-detail/${id}`);
            return;
        }

        const fetchData = async () => {
            try {
                // Gọi API lấy thông tin Đặt tour (InfoBookingResponseDTO) bằng ID Lịch Khởi Hành
                const infoRes = await axiosClient.get(`/departureSchedules/${bookingState.scheduleId}/info-booking`);
                setScheduleInfo(infoRes.data);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu đặt tour:", err);
                setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);  
            }
        };

        fetchData();
    }, [id, bookingState, navigate]);

    // Xử lý thay đổi input form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Hàm gọi API Xác nhận đặt tour
    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Chuẩn bị payload khớp với BookingRequestDTO 
            const payload = {
                idDepartureSchedule: bookingState.scheduleId,
                adultNumber: bookingState.adultCount,
                childNumber: bookingState.childCount,
                nameGuest: formData.nameGuest,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                gender: formData.gender ? parseInt(formData.gender, 10) : null,
                doB: formData.doB,
                address: formData.address,
                note: formData.note
            };

            // Gọi API lưu và nhận kết quả
            const response = await axiosClient.post('/bookings', payload);
            
            // Backend trả về Map chứa "message" và "id" (chính là ID đặt tour)
            setBookingId(response.data.id); 
            
            // Hiện Modal thành công
            setShowSuccessModal(true);

        } catch (err) {
            console.error("Lỗi đặt tour:", err);
            if (err.response && err.response.data) {
                // Xử lý hiển thị lỗi validation từ backend
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    // Nếu là danh sách lỗi Bean Validation
                    const errorMessages = Object.values(errorData).join(', ');
                    setError(`Lỗi: ${errorMessages}`);
                } else {
                    setError(errorData);
                }
            } else {
                setError('Đặt tour thất bại. Vui lòng thử lại sau!');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Các hàm tiện ích format
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

    if (loading) return <div><Header /><div style={{ textAlign: 'center', padding: '100px' }}><h2>Đang tải thông tin tóm tắt...</h2></div></div>;
    if (error && !scheduleInfo) return <div><Header /><div style={{ textAlign: 'center', padding: '100px', color: 'red' }}><h2>{error}</h2></div></div>;

    // Tính tổng tiền dựa trên giá trị trả về từ API info-booking
    const totalAmount = (bookingState.adultCount * (scheduleInfo?.adultPrice || 0)) + (bookingState.childCount * (scheduleInfo?.childPrice || 0));

    return (
        <>
            <Header />
            <main className={styles['booking-page']}>
                <div className="container">
                    <h1 className={styles['page-title']}>Đặt Tour</h1>
                    
                    <div className={styles['booking-steps']}>
                        <div className={cx('step', 'active')}>
                            <div className={styles['step-number']}>1</div>
                            <span>Thông tin</span>
                        </div>
                        <div className={styles.step}>
                            <div className={styles['step-number']}>2</div>
                            <span>Thanh toán</span>
                        </div>
                        <div className={styles.step}>
                            <div className={styles['step-number']}>3</div>
                            <span>Vé điện tử</span>
                        </div>
                    </div>

                    <div className={styles['booking-layout']}>
                        {/* Left Side: Form Information */}
                        <form className={styles['booking-form-container']} onSubmit={handleConfirmBooking}>
                            <div className={styles['form-section']}>
                                <h2><i className="fas fa-user"></i> Thông tin người đặt</h2>
                                <div className={styles['form-row']}>
                                    <div className={styles['form-field']}>
                                        <label>Họ và tên *</label>
                                        <input 
                                            type="text" 
                                            name="nameGuest"
                                            value={formData.nameGuest} 
                                            onChange={handleInputChange} 
                                            placeholder="Nhập họ tên" 
                                            required 
                                        />
                                    </div>
                                    <div className={styles['form-field']}>
                                        <label>Số điện thoại *</label>
                                        <input 
                                            type="tel" 
                                            name="phoneNumber"
                                            value={formData.phoneNumber} 
                                            onChange={handleInputChange} 
                                            placeholder="Nhập số điện thoại" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className={styles['form-row']}>
                                    <div className={styles['form-field']}>
                                        <label>Email *</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={formData.email} 
                                            onChange={handleInputChange} 
                                            placeholder="Nhập email" 
                                            required 
                                        />
                                    </div>
                                    <div className={styles['form-field']}>
                                        <label>Địa chỉ</label>
                                        <input 
                                            type="text" 
                                            name="address"
                                            value={formData.address} 
                                            onChange={handleInputChange} 
                                            placeholder="Nhập địa chỉ" 
                                        />
                                    </div>
                                </div>
                                <div className={styles['form-row']}>
                                    <div className={styles['form-field']}>
                                        <label>Ngày sinh *</label>
                                        <input 
                                            type="date" 
                                            name="doB"
                                            value={formData.doB} 
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className={styles['form-field']}>
                                        <label>Giới tính *</label>
                                        <select name="gender" value={formData.gender} onChange={handleInputChange} required>
                                            <option value="">-- Chọn giới tính --</option>
                                            <option value="1">Nam</option>
                                            <option value="2">Nữ</option>
                                            <option value="3">Khác</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={styles['form-section']}>
                                <h2><i className="fas fa-comment"></i> Ghi chú</h2>
                                <textarea 
                                    rows="4" 
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    placeholder="Nhập ghi chú, yêu cầu đặc biệt..."
                                ></textarea>
                            </div>

                            {/* Báo lỗi API */}
                            {error && <div style={{ color: 'var(--danger)', marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '8px' }}>{error}</div>}

                            <div className={styles['form-actions']}>
                                <button type="button" className={styles['btn-back']} onClick={() => navigate(-1)}>
                                    <i className="fas fa-arrow-left"></i> Quay lại
                                </button>
                                <button type="submit" className={styles['btn-continue']} disabled={isSubmitting}>
                                    {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt tour"}
                                </button>
                            </div>
                        </form>

                        {/* Right Side: Booking Summary */}
                        <aside className={styles['booking-summary']}>
                            <div className={styles['summary-card']}>
                                <h3>Thông tin tour</h3>
                                <img src={scheduleInfo?.image || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400"} alt="Tour" style={{ borderRadius: '8px', marginBottom: '15px' }} />
                                <h4>{scheduleInfo?.tourName}</h4>
                                <div className={styles['summary-item']}>
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{scheduleInfo?.city}</span>
                                </div>
                                <div className={styles['summary-item']}>
                                    <i className="fas fa-calendar"></i>
                                    <span>{scheduleInfo ? formatDate(scheduleInfo.startDate) : ''}</span>
                                </div>
                                <div className={styles['summary-item']}>
                                    <i className="fas fa-clock"></i>
                                    <span>{scheduleInfo ? formatTime(scheduleInfo.startTime) : ''}</span>
                                </div>
                                
                                <div className={styles.divider}></div>
                                
                                <h4>Chi tiết giá</h4>
                                <div className={styles['price-breakdown']}>
                                    <div className={styles['price-item']}>
                                        <span>{bookingState.adultCount} x Người lớn</span>
                                        <span>{formatPrice(bookingState.adultCount * scheduleInfo?.adultPrice)}</span>
                                    </div>
                                    {bookingState.childCount > 0 && (
                                        <div className={styles['price-item']}>
                                            <span>{bookingState.childCount} x Trẻ em</span>
                                            <span>{formatPrice(bookingState.childCount * scheduleInfo?.childPrice)}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className={styles.divider}></div>
                                
                                <div className={styles['total-summary']}>
                                    <span>Tổng cộng:</span>
                                    <span className={styles['booking-total-price']}>{formatPrice(totalAmount)}</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
                    <div className={cx('modal-content', 'success-modal')} style={{ background: 'white', padding: '2rem', borderRadius: '16px', textAlign: 'center', maxWidth: '400px' }}>
                        <div className={styles['success-icon']} style={{ fontSize: '4rem', color: 'var(--success)', marginBottom: '1rem' }}>
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Đặt tour thành công!</h2>
                        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Cảm ơn bạn đã đặt tour tại VietTravel</p>
                        
                        <div className={styles['booking-code']} style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 'bold' }}>
                            <span>Thanh toán ngay để giữ chỗ</span>
                        </div>
                        
                        <p className={styles['success-note']} style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Thông tin đặt tour đã được lưu. Vui lòng thanh toán để xác nhận hành trình của bạn.
                        </p>
                        
                        <div className={styles['success-actions']} style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button type="button" className="btn-secondary" onClick={() => navigate('/booking-detail', { state: { bookingId: bookingId } })}>
                                Xem chi tiết đặt tour
                            </button>
                            <button type="button" className="btn-primary" onClick={() => navigate('/payment', { state: { bookingId: bookingId } })}>
                                Thanh toán ngay
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

export default Booking;