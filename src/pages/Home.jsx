import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api'; // Import instance axios bạn đã tạo
import styles from '../styles/home.module.css';

const Home = () => {
  const cx = (...classes) => classes.map((name) => styles[name] || name).join(' ');
  const [tours, setTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [tourCount, setTourCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Gọi cả 4 API cùng lúc
        const [toursRes, tourCountRes, userCountRes, reviewsRes] = await Promise.all([
          api.get('/tours/status', {
              params: {
                  status: 'Đang mở',
                  page: 0,
                  size: 9,
                  sort: 'id,desc' // Sắp xếp giảm dần theo ID để lấy tour mới nhất
              }
          }),
          api.get('/tours/count-all-tour'),
          api.get('/users/count-user'),
          api.get('/reviews/top3review')
        ]);

        // Ánh xạ data.content vì API là PageResponse
        setTours(toursRes.data.content || []);
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

    const elements = document.querySelectorAll(`.${styles['tour-card']}, .${styles['destination-card']}, .${styles['review-card']}`);
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
    <div className={styles['home-page']}>
      <Header />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles['hero-background']}>
          <div className={styles['hero-overlay']}></div>
          <video autoPlay muted loop className={styles['hero-video']}>
            <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-with-turquoise-water-1084-large.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="container">
          <div className={styles['hero-content']}>
            <h1 className={styles['hero-title']}>
              <span className={styles['title-line']}>Khám Phá</span>
              <span className={cx('title-line', 'highlight')}>Việt Nam</span>
              <span className={styles['title-line']}>Của Bạn</span>
            </h1>
            <p className={styles['hero-subtitle']}>Trải nghiệm những chuyến đi đáng nhớ với hơn 100+ tour du lịch độc đáo</p>
            
            <div className={styles['hero-search']}>
              <div className={styles['search-box']}>
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Bạn muốn đi đâu?"/>
              </div>
              <div className={styles['search-filter']}>
                <i className="fas fa-calendar"></i>
                <input type="date" />
              </div>
              <div className={styles['search-filter']}>
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
                
            <div className={styles['hero-stats']}>
              <div className={styles['stat-item']}>
                <span className={styles['stat-number']}>{tourCount}+</span>
                <span className={styles['stat-label']}>Tour du lịch</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-number']}>{userCount}+</span>
                <span className={styles['stat-label']}>Khách hàng</span>
              </div>
              <div className={styles['stat-item']}>
                <span className={styles['stat-number']}>4.9★</span>
                <span className={styles['stat-label']}>Đánh giá</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles['scroll-indicator']}>
          <span>Cuộn xuống</span>
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      <section className={styles['featured-tours']}>
        <div className="container">
          <div className={styles['section-header']}>
            <span className={styles['section-tag']}>Xu hướng</span>
            <h2 className={styles['section-title']}>Tour Nổi Bật</h2>
            <p className={styles['section-subtitle']}>Những điểm đến được yêu thích nhất</p>
          </div>
          
          <div className={styles['tours-grid']}>
            {loading ? (
              <p>Đang tải danh sách tour...</p>
            ) : (
              tours.map((tour) => (
                <div key={tour.id} className={styles['tour-card']}>
                  <div className={styles['tour-image']}>
                    <img src={tour.image} alt={tour.tourName}/>
                    <div className={styles['tour-badge']}>Bán chạy</div>
                    <button className={styles['tour-favorite']}>
                      <i className="far fa-heart"></i>
                    </button>
                    <div className={styles['tour-overlay']}>
                      <Link to={`/tour-detail/${tour.id}`} className={styles['btn-view']}>Xem chi tiết</Link>
                    </div>
                  </div>
                  <div className={styles['tour-content']}>
                    <div className={styles['tour-header']}>
                      <div className={styles['tour-location']}>
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{tour.city}</span>
                      </div>
                      <div className={styles['tour-rating']}>
                        <i className="fas fa-star"></i>
                        <span>{tour.averageRating || 0} ({tour.numberOfReview || 0})</span>
                      </div>
                    </div>
                    <h3 className={styles['tour-title']}>{tour.tourName}</h3>
                    <p className={styles['tour-description']}>{tour.describe ? tour.describe.substring(0, 60) + "..." : "Khám phá hành trình thú vị"}</p>
                    
                    <div className={styles['tour-footer']}>
                      <div className={styles['tour-price']}>
                        <span className={styles['price-from']}>Từ</span>
                        <span className={styles['price-amount']}>{formatPrice(tour.adultPrice)}</span>
                      </div>
                      <Link to={`/tour-detail/${tour.id}`} className="btn-book">Đặt ngay</Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className={styles['section-footer']}>
            <Link to="/tours" className="btn-secondary">
              Xem tất cả tour <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.destinations}>
        <div className="container">
            <div className={styles['section-header']}>
                <span className={styles['section-tag']}>Điểm đến</span>
                <h2 className={styles['section-title']}>Khám Phá Việt Nam</h2>
                <p className={styles['section-subtitle']}>Từ Bắc chí Nam, từ núi đến biển</p>
            </div>
            
            <div className={styles['destinations-grid']}>
                <div className={cx('destination-card', 'large')}>
                    <div className={styles['destination-image']}>
                        <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800" alt="Miền Trung"/>
                    </div>
                    <div className={styles['destination-content']}>
                        <h3>Miền Trung</h3>
                        <p>15 tour du lịch</p>
                        <a href="tours.html?region=trung" className={styles['destination-link']}>
                            Khám phá <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div className={styles['destination-card']}>
                    <div className={styles['destination-image']}>
                        <img src="https://images.unsplash.com/photo-1540611025311-01df3cef54b5?w=800" alt="Miền Bắc"/>
                    </div>
                    <div className={styles['destination-content']}>
                        <h3>Miền Bắc</h3>
                        <p>20 tour du lịch</p>
                        <a href="tours.html?region=bac" className={styles['destination-link']}>
                            Khám phá <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <div className={styles['destination-card']}>
                    <div className={styles['destination-image']}>
                        <img src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800" alt="Miền Nam"/>
                    </div>
                    <div className={styles['destination-content']}>
                        <h3>Miền Nam</h3>
                        <p>18 tour du lịch</p>
                        <a href="tours.html?region=nam" className={styles['destination-link']}>
                            Khám phá <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section className={styles['ai-advisor-teaser']}>
        <div className="container">
            <div className={styles['advisor-content']}>
                <div className={styles['advisor-icon']}>
                    <i className="fas fa-robot"></i>
                </div>
                <div className={styles['advisor-text']}>
                    <h2>Trợ Lý AI Du Lịch</h2>
                    <p>Để AI giúp bạn lên kế hoạch chuyến đi hoàn hảo với sở thích và ngân sách của bạn</p>
                </div>
                <a href="ai-advisor.html" className="btn-advisor">
                    Tư vấn ngay <i className="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </section>

    <section className={styles.reviews}>
        <div className="container">
            <div className={styles['section-header']}>
                <span className={styles['section-tag']}>Đánh giá</span>
                <h2 className={styles['section-title']}>Khách Hàng Nói Gì</h2>
                <p className={styles['section-subtitle']}>Những trải nghiệm thực tế từ khách hàng</p>
            </div>
            
            <div className={styles['reviews-slider']}>
                {loading ? (
                  <p>Đang tải đánh giá...</p>
                ) : reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={index} className={styles['review-card']}>
                        <div className={styles['review-author']}>
                            <img 
                              src={review.avatar} 
                              alt={review.avatar}
                            />
                            <div className={styles['author-info']}>
                                <h4>{review.fullName}</h4>
                                <div className={styles['review-rating']}>
                                    {renderStars(review.numberStar)}
                                </div>
                                <p>{new Date(review.createAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                        <p className={styles['review-text']}>"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p>Chưa có đánh giá nào.</p>
                )}
            </div>
        </div>
      </section>

    <section className={styles.cta}>
        <div className="container">
            <div className={styles['cta-content']}>
                <h2>Sẵn Sàng Cho Chuyến Đi?</h2>
                <p>Đăng ký ngay để nhận ưu đãi đặc biệt và cập nhật tour mới nhất</p>
                <div className={styles['cta-form']}>
                    <input type="email" placeholder="Nhập email của bạn"/>
                    <button className="btn-submit">Đăng ký</button>
                </div>
            </div>
        </div>
    </section>

    <footer className={styles.footer}>
        <div className="container">
            <div className={styles['footer-content']}>
                <div>
                    <div className={styles['footer-logo']}>
                        <i className="fas fa-compass"></i>
                        <span>VietTravel</span>
                    </div>
                    <p>Khám phá vẻ đẹp Việt Nam cùng chúng tôi. Mang đến những trải nghiệm du lịch đáng nhớ nhất.</p>
                    <div className={styles['social-links']}>
                        <a href="#"><i className="fab fa-facebook"></i></a>
                        <a href="#"><i className="fab fa-instagram"></i></a>
                        <a href="#"><i className="fab fa-youtube"></i></a>
                        <a href="#"><i className="fab fa-tiktok"></i></a>
                    </div>
                </div>
                
                <div>
                    <h4>Dịch vụ</h4>
                    <ul>
                        <li><a href="tours.html">Tour du lịch</a></li>
                        <li><a href="ai-advisor.html">AI tư vấn</a></li>
                        <li><a href="#">Đặt vé</a></li>
                        <li><a href="#">Thuê xe</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4>Hỗ trợ</h4>
                    <ul>
                        <li><a href="#">Trung tâm trợ giúp</a></li>
                        <li><a href="#">Chính sách</a></li>
                        <li><a href="#">Điều khoản</a></li>
                        <li><a href="#">Liên hệ</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4>Liên hệ</h4>
                    <ul className={styles['contact-info']}>
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
            
            <div className={styles['footer-bottom']}>
                <p>&copy; 2026 VietTravel. All rights reserved.</p>
                <div className={styles['payment-methods']}>
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