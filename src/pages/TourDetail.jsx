import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../services/api';
import Header from '../components/Header';
import '../styles/tour-detail.css'; 

const TourDetail = () => {
    const { id } = useParams(); // Lấy ID từ URL (VD: /tour-detail/1)
    const navigate = useNavigate();

    // 1. Quản lý State dữ liệu API
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Quản lý State UI
    const [mainImage, setMainImage] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    
    // 3. State cho Sidebar Đặt Tour
    const [selectedSchedule, setSelectedSchedule] = useState('');
    const [adultCount, setAdultCount] = useState(1);
    const [childCount, setChildCount] = useState(0);

    // 4. State cho Lịch trình chi tiết (Itinerary)
    const [itinerary, setItinerary] = useState([]);
    const [loadingItinerary, setLoadingItinerary] = useState(false);

    // 5. State cho Đánh giá (Reviews)
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Fetch dữ liệu Tour Detail từ API
    useEffect(() => {
        const fetchTourDetail = async () => {
            try {
                const response = await axiosClient.get(`/tours/${id}`);
                setTour(response.data);
                // Đặt ảnh chính mặc định là ảnh cover của tour
                setMainImage(response.data.image || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200");
                
                // Chọn mặc định lịch trình khởi hành đầu tiên nếu có
                if (response.data.departureSchedules && response.data.departureSchedules.length > 0) {
                    setSelectedSchedule(response.data.departureSchedules[0].id);
                }
            } catch (err) {
                setError('Không thể tải thông tin tour. Vui lòng thử lại!');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTourDetail();
    }, [id]);

    // Fetch dữ liệu Lịch trình (Schedules) khi thay đổi selectedSchedule
    useEffect(() => {
        const fetchItinerary = async () => {
            if (!selectedSchedule) return;
            
            setLoadingItinerary(true);
            try {
                // Gọi API lấy danh sách ScheduleResponseDTO theo id của DepartureSchedule
                const response = await axiosClient.get(`/schedules/${selectedSchedule}`);
                setItinerary(response.data);
            } catch (err) {
                console.error("Lỗi khi tải lịch trình chi tiết:", err);
                setItinerary([]);
            } finally {
                setLoadingItinerary(false);
            }
        };

        fetchItinerary();
    }, [selectedSchedule]);

    // Fetch dữ liệu Đánh giá (Reviews) của Tour
    useEffect(() => {
        const fetchReviews = async () => {
            setLoadingReviews(true);
            try {
                const response = await axiosClient.get('/tours/all-review', {
                    params: { id: id }
                });
                setReviews(response.data);
            } catch (err) {
                console.error("Lỗi khi tải đánh giá:", err);
                setReviews([]);
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchReviews();
    }, [id]);

    // Các hàm tiện ích
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
        return timeString.substring(0, 5); // Cắt lấy "HH:mm" từ "HH:mm:ss"
    };

    const calculateTotal = () => {
        if (!tour) return 0;
        const adultTotal = adultCount * (tour.adultPrice || 0);
        const childTotal = childCount * (tour.childPrice || 0);
        return adultTotal + childTotal;
    };

    const handleBooking = () => {
        // Chuyển hướng sang trang booking kèm state dữ liệu
        navigate(`/booking/${id}`, { 
            state: { scheduleId: selectedSchedule, adultCount, childCount, total: calculateTotal() } 
        });
    };

    if (loading) return <div style={{textAlign: 'center', padding: '100px'}}><h2>Đang tải thông tin tour...</h2></div>;
    if (error) return <div style={{textAlign: 'center', padding: '100px'}}><h2>{error}</h2></div>;
    if (!tour) return null;

    return (
        <>
            <Header />
            <main className="tour-detail">
                <div className="container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/">Trang chủ</Link>
                        <i className="fas fa-chevron-right"></i>
                        <Link to="/tours">Tour du lịch</Link>
                        <i className="fas fa-chevron-right"></i>
                        <span>{tour.tourName}</span>
                    </div>

                    <div className="detail-layout">
                        {/* Main Content */}
                        <div className="detail-main">
                            
                            {/* Gallery */}
                            <div className="tour-gallery">
                                <div className="main-image">
                                    <img src={mainImage} alt={tour.tourName} />
                                </div>
                                <div className="thumbnail-grid">
                                    {/* Ảnh đại diện mặc định */}
                                    <img 
                                        src={tour.image || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300"} 
                                        alt="Thumb" 
                                        onClick={() => setMainImage(tour.image)}
                                        style={{ border: mainImage === tour.image ? '2px solid var(--primary)' : 'none' }}
                                    />
                                    {/* Danh sách ảnh từ API (ImageTourResponseDTO) */}
                                    {tour.imageTours?.map((imgObj) => (
                                        <img 
                                            key={imgObj.id} 
                                            src={imgObj.image} 
                                            alt={imgObj.describe || 'Tour thumbnail'} 
                                            onClick={() => setMainImage(imgObj.image)}
                                            style={{ border: mainImage === imgObj.image ? '2px solid var(--primary)' : 'none' }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Tour Header Info */}
                            <div className="tour-header-info">
                                <div className="tour-meta">
                                    <span className="tour-code">Mã tour: T{tour.id?.toString().padStart(4, '0')}</span>
                                    <div className="tour-rating-detail">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={i < Math.round(tour.averageRating || 0) ? "fas fa-star" : "far fa-star"}></i>
                                            ))}
                                        </div>
                                        <span>{tour.averageRating || 0} ({tour.numberOfReview || 0} đánh giá)</span>
                                    </div>
                                </div>
                                <h1 className="tour-title-main">{tour.tourName}</h1>
                                <div className="tour-quick-info">
                                    <span><i className="fas fa-map-marker-alt"></i> {tour.city}</span>
                                    <span><i className="fas fa-clock"></i> Khám phá ngay</span>
                                    <span><i className="fas fa-star"></i> Đánh giá cao</span>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="detail-tabs">
                                <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Tổng quan</button>
                                <button className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`} onClick={() => setActiveTab('itinerary')}>Lịch trình</button>
                                <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>Lịch khởi hành</button>
                                <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Đánh giá ({tour.numberOfReview || 0})</button>
                            </div>

                            {/* Tab Content: Tổng quan */}
                            <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`} id="overview">
                                <h2>Mô tả tour</h2>
                                <p>{tour.describe}</p>
                                
                                <h3>Điểm nhấn của tour</h3>
                                <ul className="highlight-list">
                                    <li><i className="fas fa-check"></i> Trải nghiệm tuyệt vời tại {tour.city}</li>
                                    <li><i className="fas fa-check"></i> Lịch trình được thiết kế tối ưu</li>
                                    <li><i className="fas fa-check"></i> Hướng dẫn viên chuyên nghiệp</li>
                                </ul>

                                <h3>Bao gồm</h3>
                                <div className="inclusions">
                                    <div className="inclusion-item">
                                        <i className="fas fa-check-circle"></i>
                                        <div>
                                            <h4>Phương tiện</h4>
                                            <p>Di chuyển tiện lợi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Content: Lịch trình */}
                            <div className={`tab-content ${activeTab === 'itinerary' ? 'active' : ''}`} id="itinerary">
                                <h2>Lịch trình chi tiết</h2>
                                {loadingItinerary ? (
                                    <p>Đang tải lịch trình...</p>
                                ) : itinerary.length > 0 ? (
                                    <div className="itinerary-timeline">
                                        {itinerary.map((schedule) => (
                                            <div key={schedule.id} className="timeline-item">
                                                <div className="timeline-marker">
                                                    <i className="fas fa-circle"></i>
                                                </div>
                                                <div className="timeline-content">
                                                    <h3>{formatTime(schedule.time)} - {schedule.work}</h3>
                                                    <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                                                        <i className="fas fa-calendar-day"></i> Ngày: {formatDate(schedule.date)}
                                                    </p>
                                                    <p>{schedule.describe}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Vui lòng chọn lịch khởi hành bên cột phải để xem lịch trình, hoặc hiện tại chưa có dữ liệu lịch trình cho ngày này.</p>
                                )}
                            </div>

                            {/* Tab Content: Lịch khởi hành */}
                            <div className={`tab-content ${activeTab === 'schedule' ? 'active' : ''}`} id="schedule">
                                <h2>Lịch khởi hành</h2>
                                {tour.departureSchedules?.length > 0 ? (
                                    <div className="schedule-list">
                                        {tour.departureSchedules.map(schedule => {
                                            const availableSlots = (schedule.maxGuest || 0) - (schedule.numberGuestBooked || 0);
                                            const sDate = new Date(schedule.startDate);
                                            
                                            return (
                                                <div key={schedule.id} className="schedule-item">
                                                    <div className="schedule-date">
                                                        <span className="date-day">{sDate.getDate()}</span>
                                                        <span className="date-month">Tháng {sDate.getMonth() + 1}</span>
                                                    </div>
                                                    <div className="schedule-info">
                                                        <h4>Từ {formatDate(schedule.startDate)} đến {formatDate(schedule.endDate)}</h4>
                                                        <p><i className="fas fa-clock"></i> Khởi hành lúc: {formatTime(schedule.startTime)}</p>
                                                        <p><i className="fas fa-users"></i> Còn {availableSlots}/{schedule.maxGuest} chỗ</p>
                                                    </div>
                                                    <div className="schedule-price">
                                                        <span className="price">{formatPrice(tour.adultPrice)}</span>
                                                        <button 
                                                            className="btn-book-schedule"
                                                            onClick={() => {
                                                                setSelectedSchedule(schedule.id);
                                                                setActiveTab('itinerary'); 
                                                                window.scrollTo({ top: 400, behavior: 'smooth' });
                                                            }}
                                                        >
                                                            Xem lịch trình
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p>Chưa có lịch khởi hành nào cho tour này.</p>
                                )}
                            </div>

                            {/* Tab Content: Đánh giá */}
                            <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`} id="reviews">
                                <div className="reviews-summary">
                                    <div className="rating-overview">
                                        <div className="rating-score">
                                            <span className="score-number">{tour.averageRating || 0}</span>
                                            <div className="score-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={i < Math.round(tour.averageRating || 0) ? "fas fa-star" : "far fa-star"}></i>
                                                ))}
                                            </div>
                                            <span className="score-count">{tour.numberOfReview || 0} đánh giá</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Danh sách Đánh giá */}
                                {loadingReviews ? (
                                    <p>Đang tải đánh giá...</p>
                                ) : reviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {reviews.map((review, index) => (
                                            <div key={index} className="review-item">
                                                <div className="review-header">
                                                    <img 
                                                        src={review.avatar || "https://i.pravatar.cc/150"} 
                                                        alt="User" 
                                                        className="user-avatar" 
                                                    />
                                                    <div className="review-user-info">
                                                        <h4>{review.userName}</h4>
                                                        <div className="review-rating">
                                                            {[...Array(5)].map((_, i) => (
                                                                <i key={i} className={i < review.numberStar ? "fas fa-star" : "far fa-star"}></i>
                                                            ))}
                                                        </div>
                                                        <span className="review-date">{formatDate(review.createAt)}</span>
                                                    </div>
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Chưa có đánh giá nào cho tour này.</p>
                                )}
                            </div>

                        </div>

                        {/* Booking Sidebar */}
                        <aside className="booking-sidebar">
                            <div className="booking-card">
                                <div className="price-section">
                                    <span className="price-label">Giá tour</span>
                                    <div className="price-display">
                                        <span className="price-amount">{formatPrice(tour.adultPrice)}</span>
                                        <span className="price-unit">/người</span>
                                    </div>
                                    <span className="price-note">Giá trẻ em: {formatPrice(tour.childPrice)}</span>
                                </div>
                                
                                <form className="booking-form">
                                    {/* Chọn lịch khởi hành */}
                                    <div className="form-group">
                                        <label><i className="fas fa-calendar"></i> Ngày khởi hành</label>
                                        <select 
                                            value={selectedSchedule} 
                                            onChange={(e) => setSelectedSchedule(parseInt(e.target.value))}
                                        >
                                            <option value="" disabled>-- Chọn lịch khởi hành --</option>
                                            {tour.departureSchedules?.map(schedule => (
                                                <option key={schedule.id} value={schedule.id}>
                                                    {formatDate(schedule.startDate)} (Còn {(schedule.maxGuest || 0) - (schedule.numberGuestBooked || 0)} chỗ)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Số lượng khách */}
                                    <div className="form-group">
                                        <label><i className="fas fa-user"></i> Người lớn (Từ 12 tuổi)</label>
                                        <div className="counter">
                                            <button type="button" className="counter-btn" onClick={() => setAdultCount(Math.max(1, adultCount - 1))}>-</button>
                                            <input type="number" value={adultCount} readOnly />
                                            <button type="button" className="counter-btn" onClick={() => setAdultCount(adultCount + 1)}>+</button>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label><i className="fas fa-child"></i> Trẻ em (Dưới 12 tuổi)</label>
                                        <div className="counter">
                                            <button type="button" className="counter-btn" onClick={() => setChildCount(Math.max(0, childCount - 1))}>-</button>
                                            <input type="number" value={childCount} readOnly />
                                            <button type="button" className="counter-btn" onClick={() => setChildCount(childCount + 1)}>+</button>
                                        </div>
                                    </div>
                                    
                                    {/* Tổng tiền */}
                                    <div className="total-price">
                                        <span>Tổng cộng:</span>
                                        <span className="total-amount">{formatPrice(calculateTotal())}</span>
                                    </div>
                                    
                                    <button 
                                        type="button" 
                                        className="btn-book-tour" 
                                        onClick={handleBooking}
                                        disabled={!selectedSchedule}
                                        style={{ opacity: !selectedSchedule ? 0.6 : 1, cursor: !selectedSchedule ? 'not-allowed' : 'pointer' }}
                                    >
                                        <i className="fas fa-ticket-alt"></i> Đặt tour ngay
                                    </button>
                                    
                                    <button type="button" className="btn-add-favorite">
                                        <i className="far fa-heart"></i> Lưu vào yêu thích
                                    </button>
                                </form>
                                
                                <div className="contact-support">
                                    <p>Cần hỗ trợ?</p>
                                    <a href="tel:19001234" className="support-phone">
                                        <i className="fas fa-phone"></i> 1900 1234
                                    </a>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-column">
                            <div className="footer-logo">
                                <i className="fas fa-compass"></i>
                                <span>VietTravel</span>
                            </div>
                            <p>Khám phá vẻ đẹp Việt Nam cùng chúng tôi</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 VietTravel. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default TourDetail;