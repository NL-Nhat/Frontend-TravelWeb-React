import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../services/api';
import styles from '../styles/auth.module.css';

const Login = () => {
    const cx = (...classes) => classes.map((name) => styles[name] || name).join(' ');
    const navigate = useNavigate();

    // Tự động chuyển hướng nếu người dùng đã đăng nhập từ trước
    useEffect(() => {
        if (localStorage.getItem('isAuthenticated') === 'true') {
            const role = localStorage.getItem('userRole');
            if (role === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/account');
            }
        }
    }, [navigate]);
    
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
            const response = await axiosClient.post('/auth/login', {
                userName: userName,
                passWord: passWord
            });

            // Lấy Role từ JSON response của Backend (VD: "ROLE_USER")
            const userRole = response.data.role;

            if (userRole === 'ROLE_HUONGDANVIEN') {
                // Gọi API logout ngay lập tức để xóa HttpOnly Cookie vừa được set
                await axiosClient.post('/auth/logout');
                setError("Chức năng của Hướng dẫn viên chưa được phát triển!");
                setLoading(false);
                return;
            }

            // Lưu trạng thái đăng nhập và Role
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', userRole);
            
            // Kích hoạt event để Header (nếu có) tự cập nhật giao diện
            window.dispatchEvent(new Event('authStatusChanged'));
            
            // Điều hướng dựa trên Role
            if (userRole === 'ROLE_ADMIN') {
                navigate('/admin');
            } else {
                navigate('/account');
            }

        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            if (err.response && err.response.data) {
                setError(typeof err.response.data === 'string' ? err.response.data : err.response.data.message);
            } else {
                setError("Có lỗi xảy ra khi kết nối đến máy chủ.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['auth-page']}>
            <div className={styles['auth-container']}>
                {/* Left Side - Visual */}
                <div className={styles['auth-visual']}>
                    <div className={styles['visual-overlay']}></div>
                    <div className={styles['visual-content']}>
                        <Link to="/" className={styles['auth-logo']}>
                            <i className="fas fa-compass"></i>
                            <span>VietTravel</span>
                        </Link>
                        <div className={styles['visual-text']}>
                            <h2>Khám phá Việt Nam</h2>
                            <p>Hàng trăm điểm đến tuyệt vời đang chờ đón bạn</p>
                        </div>
                        <div className={styles['visual-features']}>
                            <div className={styles['feature-item']}>
                                <i className="fas fa-check-circle"></i>
                                <span>100+ Tour du lịch</span>
                            </div>
                            <div className={styles['feature-item']}>
                                <i className="fas fa-check-circle"></i>
                                <span>Giá tốt nhất</span>
                            </div>
                            <div className={styles['feature-item']}>
                                <i className="fas fa-check-circle"></i>
                                <span>Hỗ trợ 24/7</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles['visual-slider']}>
                        <div className={styles['slider-dots']}>
                            <span className={cx('dot', 'active')}></span>
                            <span className={styles.dot}></span>
                            <span className={styles.dot}></span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className={styles['auth-form-container']}>
                    <div className={styles['auth-form-wrapper']}>
                        <div className={styles['auth-header']}>
                            <h1>Chào mừng trở lại!</h1>
                            <p>Đăng nhập để tiếp tục hành trình của bạn</p>
                        </div>

                        {/* Social Login */}
                        <div className={styles['social-login']}>
                            <button className={cx('social-btn', 'google')}>
                                <i className="fab fa-google"></i>
                                <span>Đăng nhập với Google</span>
                            </button>
                            <button className={cx('social-btn', 'facebook')}>
                                <i className="fab fa-facebook-f"></i>
                                <span>Đăng nhập với Facebook</span>
                            </button>
                        </div>

                        <div className={styles.divider}>
                            <span>hoặc</span>
                        </div>

                        {/* Login Form */}
                        <form className={styles['auth-form']} onSubmit={handleLogin}>
                            <div className={styles['form-group']}>
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

                            <div className={styles['form-group']}>
                                <label htmlFor="password">
                                    <i className="fas fa-lock"></i>
                                    Mật khẩu
                                </label>
                                <div className={styles['password-input']}>
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
                                        className={styles['toggle-password']} 
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"}></i>
                                    </button>
                                </div>
                            </div>

                            {/* Hiển thị lỗi nếu có */}
                            {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>{error}</div>}

                            <div className={styles['form-options']}>
                                <label className={styles['remember-me']}>
                                    <input type="checkbox" id="rememberMe" />
                                    <span>Ghi nhớ đăng nhập</span>
                                </label>
                                <Link to="/forgot-password" className={styles['forgot-password']}>Quên mật khẩu?</Link>
                            </div>

                            <button type="submit" className={styles['btn-submit']} disabled={loading}>
                                <span>{loading ? "Đang xử lý..." : "Đăng nhập"}</span>
                                {!loading && <i className="fas fa-arrow-right"></i>}
                            </button>
                        </form>

                        <div className={styles['auth-footer']}>
                            <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
                        </div>

                        <div className={styles['auth-help']}>
                            <p>Cần hỗ trợ? <Link to="/contact">Liên hệ chúng tôi</Link></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            <div className={cx('loading-overlay', loading ? 'show' : '')}>
                <div className={styles['loading-spinner']}>
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Đang đăng nhập...</p>
                </div>
            </div>
        </div>
    );
};

export default Login;