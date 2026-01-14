import { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api'; // Import instance axios bạn đã tạo

const Home = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Gọi API lấy 5 tour hot
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await api.get('/tours/top5tour');
        setTours(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tour:", error);
        setLoading(false);
      }
    };
    fetchTours();
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
                <span className="stat-number">100+</span>
                <span className="stat-label">Tour du lịch</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50K+</span>
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

      {/* Featured Tours Section - ĐÃ CẬP NHẬT GỌI API */}
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
                    {/* Sử dụng ảnh từ API, nếu không có thì dùng ảnh mặc định */}
                    <img src={tour.tourImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgAJeADANmONtmC_JNoOKy6Hvo2a8_aboRew&s"} alt={tour.tourName}/>
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

      <section class="destinations">
        <div class="container">
            <div class="section-header">
                <span class="section-tag">Điểm đến</span>
                <h2 class="section-title">Khám Phá Việt Nam</h2>
                <p class="section-subtitle">Từ Bắc chí Nam, từ núi đến biển</p>
            </div>
            
            <div class="destinations-grid">
                <div class="destination-card large">
                    <div class="destination-image">
                        <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800" alt="Miền Trung"/>
                    </div>
                    <div class="destination-content">
                        <h3>Miền Trung</h3>
                        <p>15 tour du lịch</p>
                        <a href="tours.html?region=trung" class="destination-link">
                            Khám phá <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div class="destination-card">
                    <div class="destination-image">
                        <img src="https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800" alt="Miền Bắc"/>
                    </div>
                    <div class="destination-content">
                        <h3>Miền Bắc</h3>
                        <p>20 tour du lịch</p>
                        <a href="tours.html?region=bac" class="destination-link">
                            Khám phá <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div class="destination-card">
                    <div class="destination-image">
                        <img src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800" alt="Miền Nam"/>
                    </div>
                    <div class="destination-content">
                        <h3>Miền Nam</h3>
                        <p>18 tour du lịch</p>
                        <a href="tours.html?region=nam" class="destination-link">
                            Khám phá <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ai-advisor-teaser">
        <div class="container">
            <div class="advisor-content">
                <div class="advisor-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="advisor-text">
                    <h2>Trợ Lý AI Du Lịch</h2>
                    <p>Để AI giúp bạn lên kế hoạch chuyến đi hoàn hảo với sở thích và ngân sách của bạn</p>
                </div>
                <a href="ai-advisor.html" class="btn-advisor">
                    Tư vấn ngay <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>

    <section class="reviews">
        <div class="container">
            <div class="section-header">
                <span class="section-tag">Đánh giá</span>
                <h2 class="section-title">Khách Hàng Nói Gì</h2>
                <p class="section-subtitle">Những trải nghiệm thực tế từ khách hàng</p>
            </div>
            
            <div class="reviews-slider">
                <div class="review-card">
                    <div class="review-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <p class="review-text">"Chuyến đi Bà Nà thật tuyệt vời! Hướng dẫn viên nhiệt tình, lịch trình hợp lý. Gia đình tôi rất hài lòng."</p>
                    <div class="review-author">
                        <img src="https://i.pravatar.cc/150?img=1" alt="User"/>
                        <div class="author-info">
                            <h4>Nguyễn Văn An</h4>
                            <p>Tour Bà Nà Hills - Tháng 12/2025</p>
                        </div>
                    </div>
                </div>
                
                <div class="review-card">
                    <div class="review-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    <p class="review-text">"Hạ Long đẹp không thể tả. Du thuyền 5 sao sang trọng, đồ ăn ngon. Xứng đáng từng đồng!"</p>
                    <div class="review-author">
                        <img src="https://i.pravatar.cc/150?img=2" alt="User"/>
                        <div class="author-info">
                            <h4>Trần Thị Bình</h4>
                            <p>Du thuyền Hạ Long - Tháng 12/2025</p>
                        </div>
                    </div>
                </div>
                
                <div class="review-card">
                    <div class="review-rating">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="far fa-star"></i>
                    </div>
                    <p class="review-text">"Hội An về đêm thật lãng mạn. Chỉ tiếc là thời gian hơi ngắn, mong có tour 2 ngày."</p>
                    <div class="review-author">
                        <img src="https://i.pravatar.cc/150?img=3" alt="User"/>
                        <div class="author-info">
                            <h4>Lê Hoàng Long</h4>
                            <p>Hội An đêm - Tháng 12/2025</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="cta">
        <div class="container">
            <div class="cta-content">
                <h2>Sẵn Sàng Cho Chuyến Đi?</h2>
                <p>Đăng ký ngay để nhận ưu đãi đặc biệt và cập nhật tour mới nhất</p>
                <div class="cta-form">
                    <input type="email" placeholder="Nhập email của bạn"/>
                    <button class="btn-submit">Đăng ký</button>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-column">
                    <div class="footer-logo">
                        <i class="fas fa-compass"></i>
                        <span>VietTravel</span>
                    </div>
                    <p>Khám phá vẻ đẹp Việt Nam cùng chúng tôi. Mang đến những trải nghiệm du lịch đáng nhớ nhất.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                        <a href="#"><i class="fab fa-youtube"></i></a>
                        <a href="#"><i class="fab fa-tiktok"></i></a>
                    </div>
                </div>
                
                <div class="footer-column">
                    <h4>Dịch vụ</h4>
                    <ul>
                        <li><a href="tours.html">Tour du lịch</a></li>
                        <li><a href="ai-advisor.html">AI tư vấn</a></li>
                        <li><a href="#">Đặt vé</a></li>
                        <li><a href="#">Thuê xe</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Hỗ trợ</h4>
                    <ul>
                        <li><a href="#">Trung tâm trợ giúp</a></li>
                        <li><a href="#">Chính sách</a></li>
                        <li><a href="#">Điều khoản</a></li>
                        <li><a href="#">Liên hệ</a></li>
                    </ul>
                </div>
                
                <div class="footer-column">
                    <h4>Liên hệ</h4>
                    <ul class="contact-info">
                        <li>
                            <i class="fas fa-phone"></i>
                            <span>1900 1234</span>
                        </li>
                        <li>
                            <i class="fas fa-envelope"></i>
                            <span>support@viettravel.com</span>
                        </li>
                        <li>
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Đà Nẵng, Việt Nam</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; 2026 VietTravel. All rights reserved.</p>
                <div class="payment-methods">
                    <i class="fab fa-cc-visa"></i>
                    <i class="fab fa-cc-mastercard"></i>
                    <i class="fab fa-cc-paypal"></i>
                </div>
            </div>
        </div>
    </footer>

      {/* Footer giữ nguyên */}
    </div>
  );
};

export default Home;