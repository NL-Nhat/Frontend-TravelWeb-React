import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../services/api';

const Header = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authStatus = localStorage.getItem('isAuthenticated');
        if (authStatus === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    // Hiệu ứng đổi màu Header khi cuộn chuột
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 100);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hàm xử lý Đăng xuất
    const handleLogout = async () => {
        try {
            // Gọi API logout để Backend xóa Cookie (maxAge = 0)
            await axiosClient.post('/auth/logout');
            
            // Xóa cờ đăng nhập ở Frontend
            localStorage.removeItem('isAuthenticated');
            setIsAuthenticated(false);
            
            // Chuyển hướng về trang chủ
            navigate('/');
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        }
    };

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

                            {/* Kiểm tra isAuthenticated: 
                                Nếu đã đăng nhập -> Chuyển đến /account
                                Nếu chưa đăng nhập -> Chuyển đến /login
                            */}
                            <Link to={isAuthenticated ? "/account" : "/login"} className="nav-icon">
                                <i className="far fa-user"></i>
                            </Link>

                            {/* Nút Đăng nhập / Đăng xuất */}
                            {isAuthenticated ? (
                                <button className="btn-secondary" onClick={handleLogout}>Đăng xuất</button>
                            ) : (
                                <Link to="/login">
                                    <button className="btn-primary">Đăng nhập</button>
                                </Link>
                            )}
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