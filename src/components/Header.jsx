import { useState, useEffect } from 'react';

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
    <header class="header">
        <nav class="navbar">
            <div class="container">
                <div class="nav-content">
                    <div class="logo">
                        <i class="fas fa-compass"></i>
                        <span>VietTravel</span>
                    </div>
                    
                    <div class="nav-menu">
                        <a href="index.html" class="nav-link active">Trang chủ</a>
                        <a href="tours.html" class="nav-link">Tour du lịch</a>
                        <a href="ai-advisor.html" class="nav-link">AI Tư vấn</a>
                        <a href="about.html" class="nav-link">Về chúng tôi</a>
                    </div>
                    
                    <div class="nav-actions">
                        <a href="favorites.html" class="nav-icon">
                            <i class="far fa-heart"></i>
                            <span class="badge">3</span>
                        </a>
                        <a href="account.html" class="nav-icon">
                            <i class="far fa-user"></i>
                        </a>
                        <button class="btn-primary">Đăng nhập</button>
                    </div>
                    
                    <button class="mobile-menu-btn">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>
        </nav>
    </header>
  );
};

export default Header;