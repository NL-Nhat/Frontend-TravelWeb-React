import { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api'; // Import instance axios bạn đã tạo

const Home = () => {
  const [tours, setTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tourCount, setTourCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi cả 2 API cùng lúc
        const [toursRes, tourCountRes, userCountRes, reviewsRes] = await Promise.all([
          api.get('/tours/top5tour'),
          api.get('/tours/count-all-tour'),
          api.get('/users/count-user'),
          api.get('/reviews/top3review')
        ]);

        setTours(toursRes.data);
        setTourCount(tourCountRes.data);
        setUserCount(userCountRes.data);
        setReviews(reviewsRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Hiệu ứng Intersection Observer (Chạy sau khi đã có dữ liệu tours)
  useEffect(() => {
    if (tours.length === 0) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.tour-card, .destination-card, .review-card');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tours]); // Chạy lại hiệu ứng khi danh sách tour thay đổi

  // Hàm format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Hàm render sao dựa trên numberStar
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i key={i} className={i <= rating ? "fas fa-star" : "far fa-star"}></i>
      );
    }
    return stars;
  };

  return (
    <div className="home-page">
      <Header />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <video autoPlay muted loop className="hero-video">
            <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-with-turquoise-water-1084-large.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Khám Phá</span>
              <span className="title-line highlight">Việt Nam</span>
              <span className="title-line">Của Bạn</span>
            </h1>
            <p className="hero-subtitle">Trải nghiệm những chuyến đi đáng nhớ với hơn 100+ tour du lịch độc đáo</p>
            
            <div className="hero-search">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Bạn muốn đi đâu?"/>
              </div>
              <div className="search-filter">
                <i className="fas fa-calendar"></i>
                <input type="date" />
              </div>
              <div className="search-filter">
                <i className="fas fa-users"></i>
                <select>
                  <option>Số người</option>
                  <option>1 người</option>
                  <option>2 người</option>
                  <option>3-5 người</option>
                </select>
              </div>
              <button className="btn-search">
                <i className="fas fa-search"></i> Tìm kiếm
              </button>
            </div>
                
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{tourCount}+</span>
                <span className="stat-label">Tour du lịch</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userCount}+</span>
                <span className="stat-label">Khách hàng</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">Đánh giá</span>
              </div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Cuộn xuống</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      <section className="featured-tours">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Xu hướng</span>
            <h2 className="section-title">Tour Nổi Bật</h2>
            <p className="section-subtitle">Những điểm đến được yêu thích nhất</p>
          </div>
          
          <div className="tours-grid">
            {loading ? (
              <p>Đang tải danh sách tour...</p>
            ) : (
              tours.map((tour) => (
                <div key={tour.id} className="tour-card">
                  <div className="tour-image">
                    <img src={tour.tourImage} alt={tour.tourName}/>
                    <div className="tour-badge">Bán chạy</div>
                    <button className="tour-favorite">
                      <i className="far fa-heart"></i>
                    </button>
                    <div className="tour-overlay">
                      <a href={`/tour-detail/${tour.id}`} className="btn-view">Xem chi tiết</a>
                    </div>
                  </div>
                  <div className="tour-content">
                    <div className="tour-header">
                      <div className="tour-location">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{tour.destination}</span>
                      </div>
                      <div className="tour-rating">
                        <i className="fas fa-star"></i>
                        <span>{tour.averageRating || 0} ({tour.numberOfReview || 0})</span>
                      </div>
                    </div>
                    <h3 className="tour-title">{tour.tourName}</h3>
                    <p className="tour-description">{tour.describe ? tour.describe.substring(0, 60) + "..." : "Khám phá hành trình thú vị"}</p>
                    <div className="tour-features">
                      <span className="feature-item">
                        <i className="fas fa-clock"></i> 1 ngày
                      </span>
                      <span className="feature-item">
                        <i className="fas fa-users"></i> {tour.slot} chỗ
                      </span>
                    </div>
                    <div className="tour-footer">
                      <div className="tour-price">
                        <span className="price-from">Từ</span>
                        <span className="price-amount">{formatPrice(tour.adultPrice)}</span>
                      </div>
                      <button className="btn-book">Đặt ngay</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="section-footer">
            <a href="/tours" className="btn-secondary">
              Xem tất cả tour <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </section>

      <section className="destinations">
        <div className="container">
            <div className="section-header">
                <span className="section-tag">Điểm đến</span>
                <h2 className="section-title">Khám Phá Việt Nam</h2>
                <p className="section-subtitle">Từ Bắc chí Nam, từ núi đến biển</p>
            </div>
            
            <div className="destinations-grid">
                <div className="destination-card large">
                    <div className="destination-image">
                        <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800" alt="Miền Trung"/>
                    </div>
                    <div className="destination-content">
                        <h3>Miền Trung</h3>
                        <p>15 tour du lịch</p>
                        <a href="tours.html?region=trung" className="destination-link">
                            Khám phá <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div className="destination-card">
                    <div className="destination-image">
                        <img src="https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800" alt="Miền Bắc"/>
                    </div>
                    <div className="destination-content">
                        <h3>Miền Bắc</h3>
                        <p>20 tour du lịch</p>
                        <a href="tours.html?region=bac" className="destination-link">
                            Khám phá <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div className="destination-card">
                    <div className="destination-image">
                        <img src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800" alt="Miền Nam"/>
                    </div>
                    <div className="destination-content">
                        <h3>Miền Nam</h3>
                        <p>18 tour du lịch</p>
                        <a href="tours.html?region=nam" className="destination-link">
                            Khám phá <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section className="ai-advisor-teaser">
        <div className="container">
            <div className="advisor-content">
                <div className="advisor-icon">
                    <i className="fas fa-robot"></i>
                </div>
                <div className="advisor-text">
                    <h2>Trợ Lý AI Du Lịch</h2>
                    <p>Để AI giúp bạn lên kế hoạch chuyến đi hoàn hảo với sở thích và ngân sách của bạn</p>
                </div>
                <a href="ai-advisor.html" className="btn-advisor">
                    Tư vấn ngay <i className="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>

    <section className="reviews">
        <div className="container">
            <div className="section-header">
                <span className="section-tag">Đánh giá</span>
                <h2 className="section-title">Khách Hàng Nói Gì</h2>
                <p className="section-subtitle">Những trải nghiệm thực tế từ khách hàng</p>
            </div>
            
            <div className="reviews-slider">
                {loading ? (
                  <p>Đang tải đánh giá...</p>
                ) : reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={index} className="review-card">
                        <div className="review-rating">
                            {renderStars(review.numberStar)}
                        </div>
                        <p className="review-text">"{review.comment}"</p>
                        <div className="review-author">
                            <img 
                              src={review.avatar} 
                              alt={review.avatar}
                            />
                            <div className="author-info">
                                <h4>{review.userName}</h4>
                                <p>{review.tourName} - {new Date(review.createAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                  ))
                ) : (
                  <p>Chưa có đánh giá nào.</p>
                )}
            </div>
        </div>
      </section>

    <section className="cta">
        <div className="container">
            <div className="cta-content">
                <h2>Sẵn Sàng Cho Chuyến Đi?</h2>
                <p>Đăng ký ngay để nhận ưu đãi đặc biệt và cập nhật tour mới nhất</p>
                <div className="cta-form">
                    <input type="email" placeholder="Nhập email của bạn"/>
                    <button className="btn-submit">Đăng ký</button>
                </div>
            </div>
        </div>
    </section>

    <footer className="footer">
        <div className="container">
            <div className="footer-content">
                <div className="footer-column">
                    <div className="footer-logo">
                        <i className="fas fa-compass"></i>
                        <span>VietTravel</span>
                    </div>
                    <p>Khám phá vẻ đẹp Việt Nam cùng chúng tôi. Mang đến những trải nghiệm du lịch đáng nhớ nhất.</p>
                    <div className="social-links">
                        <a href="#"><i className="fab fa-facebook"></i></a>
                        <a href="#"><i className="fab fa-instagram"></i></a>
                        <a href="#"><i className="fab fa-youtube"></i></a>
                        <a href="#"><i className="fab fa-tiktok"></i></a>
                    </div>
                </div>
                
                <div className="footer-column">
                    <h4>Dịch vụ</h4>
                    <ul>
                        <li><a href="tours.html">Tour du lịch</a></li>
                        <li><a href="ai-advisor.html">AI tư vấn</a></li>
                        <li><a href="#">Đặt vé</a></li>
                        <li><a href="#">Thuê xe</a></li>
                    </ul>
                </div>
                
                <div className="footer-column">
                    <h4>Hỗ trợ</h4>
                    <ul>
                        <li><a href="#">Trung tâm trợ giúp</a></li>
                        <li><a href="#">Chính sách</a></li>
                        <li><a href="#">Điều khoản</a></li>
                        <li><a href="#">Liên hệ</a></li>
                    </ul>
                </div>
                
                <div className="footer-column">
                    <h4>Liên hệ</h4>
                    <ul className="contact-info">
                        <li>
                            <i className="fas fa-phone"></i>
                            <span>1900 1234</span>
                        </li>
                        <li>
                            <i className="fas fa-envelope"></i>
                            <span>support@viettravel.com</span>
                        </li>
                        <li>
                            <i className="fas fa-map-marker-alt"></i>
                            <span>Đà Nẵng, Việt Nam</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; 2026 VietTravel. All rights reserved.</p>
                <div className="payment-methods">
                    <i className="fab fa-cc-visa"></i>
                    <i className="fab fa-cc-mastercard"></i>
                    <i className="fab fa-cc-paypal"></i>
                </div>
            </div>
        </div>
    </footer>

    </div>
  );
};

export default Home;