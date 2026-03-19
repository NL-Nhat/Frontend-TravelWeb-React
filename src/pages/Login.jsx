import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../services/api';
import '../styles/auth.css';

const Login = () => {
    const navigate = useNavigate();
    
    // State quản lý form
    const [userName, setUserName] = useState('');
    const [passWord, setPassWord] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // State quản lý lỗi và loading
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Gọi API Đăng nhập
            const response = await axiosClient.post('/auth/login', {
                userName: userName,
                passWord: passWord
            });

            // Nếu Backend trả về thành công (Cookie sẽ tự động được set vì HttpOnly)
            // Ta lưu một cờ vào localStorage để Frontend biết user đã đăng nhập
            localStorage.setItem('isAuthenticated', 'true');
            
            // Chuyển hướng về trang chủ
            navigate('/');
            
            // Reload lại trang nhẹ để Header cập nhật trạng thái ngay lập tức
            window.location.reload(); 

        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            // Lấy message lỗi từ Backend trả về
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError("Có lỗi xảy ra khi kết nối đến máy chủ.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Visual */}
                <div className="auth-visual">
                    <div className="visual-overlay"></div>
                    <div className="visual-content">
                        <Link to="/" className="auth-logo">
                            <i className="fas fa-compass"></i>
                            <span>VietTravel</span>
                        </Link>
                        <div className="visual-text">
                            <h2>Khám phá Việt Nam</h2>
                            <p>Hàng trăm điểm đến tuyệt vời đang chờ đón bạn</p>
                        </div>
                        <div className="visual-features">
                            <div className="feature-item">
                                <i className="fas fa-check-circle"></i>
                                <span>100+ Tour du lịch</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-check-circle"></i>
                                <span>Giá tốt nhất</span>
                            </div>
                            <div className="feature-item">
                                <i className="fas fa-check-circle"></i>
                                <span>Hỗ trợ 24/7</span>
                            </div>
                        </div>
                    </div>
                    <div className="visual-slider">
                        <div className="slider-dots">
                            <span className="dot active"></span>
                            <span className="dot"></span>
                            <span class="dot"></span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h1>Chào mừng trở lại!</h1>
                            <p>Đăng nhập để tiếp tục hành trình của bạn</p>
                        </div>

                        {/* Social Login */}
                        <div className="social-login">
                            <button className="social-btn google">
                                <i className="fab fa-google"></i>
                                <span>Đăng nhập với Google</span>
                            </button>
                            <button className="social-btn facebook">
                                <i className="fab fa-facebook-f"></i>
                                <span>Đăng nhập với Facebook</span>
                            </button>
                        </div>

                        <div className="divider">
                            <span>hoặc</span>
                        </div>

                        {/* Login Form */}
                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="userName">
                                    <i className="fas fa-user"></i>
                                    Tên đăng nhập
                                </label>
                                <input 
                                    type="text" 
                                    id="userName" 
                                    placeholder="Nhập tên đăng nhập"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <i className="fas fa-lock"></i>
                                    Mật khẩu
                                </label>
                                <div className="password-input">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        id="password" 
                                        placeholder="Nhập mật khẩu"
                                        value={passWord}
                                        onChange={(e) => setPassWord(e.target.value)}
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        className="toggle-password" 
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Hiển thị lỗi nếu có */}
                            {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>{error}</div>}

                            <div className="form-options">
                                <label className="remember-me">
                                    <input type="checkbox" id="rememberMe" />
                                    <span>Ghi nhớ đăng nhập</span>
                                </label>
                                <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
                            </div>

                            <button type="submit" className="btn-submit" disabled={loading}>
                                <span>{loading ? "Đang xử lý..." : "Đăng nhập"}</span>
                                {!loading && <i className="fas fa-arrow-right"></i>}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
                        </div>

                        <div className="auth-help">
                            <p>Cần hỗ trợ? <Link to="/contact">Liên hệ chúng tôi</Link></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            <div className={`loading-overlay ${loading ? 'show' : ''}`}>
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Đang đăng nhập...</p>
                </div>
            </div>
        </div>
    );
};

export default Login;