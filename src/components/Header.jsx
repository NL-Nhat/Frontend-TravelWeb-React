import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Thêm useLocation

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation(); // Lấy đường dẫn URL hiện tại
    
    // Kiểm tra trạng thái
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userAvatar, setUserAvatar] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem('isAuthenticated');
            if (authStatus === 'true') {
                setIsAuthenticated(true);
                setUserAvatar(localStorage.getItem('userAvatar'));
            } else {
                setIsAuthenticated(false);
                setUserAvatar(null);
            }
        };

        checkAuth(); // Chạy lần đầu

        // Lắng nghe sự kiện để cập nhật Avatar lập tức khi chuyển trang
        window.addEventListener('avatarUpdated', checkAuth);
        window.addEventListener('authStatusChanged', checkAuth);
        return () => {
            window.removeEventListener('avatarUpdated', checkAuth);
            window.removeEventListener('authStatusChanged', checkAuth);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 100);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hàm kiểm tra xem menu nào đang active
    const checkActive = useCallback((path) => {
        // Nếu là trang chủ, path phải giống hệt '/'
        if (path === '/') {
            return location.pathname === '/';
        }
        // Nếu là trang Tour, giữ active cho cả danh sách tour và chi tiết tour
        if (path === '/tours') {
            return location.pathname.startsWith('/tours') || location.pathname.startsWith('/tour-detail');
        }
        // Các trang khác
        return location.pathname.startsWith(path);
    }, [location.pathname]);

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <nav className="navbar">
                <div className="container">
                    <div className="nav-content">
                        <Link to="/" className="logo">
                            <i className="fas fa-compass"></i>
                            <span>VietTravel</span>
                        </Link>
                        
                        <div className="nav-menu">
                            <Link to="/" className={`nav-link ${checkActive('/') ? 'active' : ''}`}>Trang chủ</Link>
                            <Link to="/tours" className={`nav-link ${checkActive('/tours') ? 'active' : ''}`}>Tour du lịch</Link>
                            <Link to="/ai-advisor" className={`nav-link ${checkActive('/ai-advisor') ? 'active' : ''}`}>AI Tư vấn</Link>
                            <Link to="/about" className={`nav-link ${checkActive('/about') ? 'active' : ''}`}>Về chúng tôi</Link>
                        </div>
                        
                        <div className="nav-actions">
                            <Link to="/favorites" className="nav-icon">
                                <i className="far fa-heart"></i>
                                <span className="badge">3</span>
                            </Link>

                            {/* Click icon user: Chưa login -> /login, Đã login -> /account */}
                            <Link to={isAuthenticated ? "/account" : "/login"} className="nav-icon" style={{ display: 'flex', alignItems: 'center' }}>
                                {isAuthenticated && userAvatar ? (
                                    <img 
                                        src={userAvatar} 
                                        alt="Avatar" 
                                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <i className="far fa-user"></i>
                                )}
                            </Link>
                        </div>
                        
                        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <i className="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;