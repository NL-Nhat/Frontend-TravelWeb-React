import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
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
        return () => window.removeEventListener('avatarUpdated', checkAuth);
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 100);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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