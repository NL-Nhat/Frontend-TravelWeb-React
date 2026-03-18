import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Hiệu ứng đổi màu Header khi cuộn chuột
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="header">
        <nav className="navbar">
            <div className="container">
                <div className="nav-content">
                    <div className="logo">
                        <i className="fas fa-compass"></i>
                        <span>VietTravel</span>
                    </div>
                    
                    <div className="nav-menu">
                        {/* 🌟 3. Thay thẻ <a> thành <Link to="..."> */}
                        <Link to="/" className="nav-link active">Trang chủ</Link>
                        <Link to="/tours" className="nav-link">Tour du lịch</Link>
                        <Link to="/ai-advisor" className="nav-link">AI Tư vấn</Link>
                        <Link to="/about" className="nav-link">Về chúng tôi</Link>
                    </div>
                    
                    <div className="nav-actions">
                        <Link to="/favorites" className="nav-icon">
                            <i className="far fa-heart"></i>
                            <span className="badge">3</span>
                        </Link>
                        <Link to="/account" className="nav-icon">
                            <i className="far fa-user"></i>
                        </Link>
                        <button className="btn-primary">Đăng nhập</button>
                    </div>
                    
                    <button className="mobile-menu-btn">
                        <i className="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </nav>
    </header>
  );
};

export default Header;