import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../services/api';
import '../styles/auth.css';

const Register = () => {
    const navigate = useNavigate();

    // 1. Quản lý State cho Form
    const [formData, setFormData] = useState({
        fullName: '',
        userName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        passWord: '',
        confirmPassword: '',
        agreeTerms: false
    });

    // Quản lý State ẩn/hiện mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Quản lý lỗi và trạng thái loading
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    // Xử lý khi người dùng nhập liệu
    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [id]: type === 'checkbox' ? checked : value
        });
        
        // Xóa lỗi của trường đó khi người dùng bắt đầu nhập lại
        if (errors[id]) {
            setErrors({ ...errors, [id]: '' });
        }
        setApiError('');
    };

    // 2. Hàm Kiểm tra dữ liệu (Validation) khớp với DTO
    const validateForm = () => {
        let newErrors = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Họ và tên không được để trống";
        }
        
        if (!formData.userName.trim()) {
            newErrors.userName = "Tên đăng nhập không được để trống";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email không được để trống";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Email không đúng định dạng";
        }

        const phoneRegex = /^0\d{9}$/;
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Số điện thoại không được để trống";
        } else if (!phoneRegex.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";
        }

        if (!formData.gender) {
            newErrors.gender = "Vui lòng chọn giới tính";
        }

        if (!formData.passWord.trim()) {
            newErrors.passWord = "Mật khẩu không được để trống";
        } else if (formData.passWord.length < 8) {
            newErrors.passWord = "Mật khẩu phải tối thiểu 8 ký tự";
        }

        if (formData.passWord !== formData.confirmPassword) {
            newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = "Bạn phải đồng ý với Điều khoản dịch vụ";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
    };

    // 3. Hàm Xử lý Gửi Đăng ký
    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setApiError('');

        try {
            // Chuẩn bị payload khớp với RegisterRequestDTO
            const payload = {
                userName: formData.userName,
                passWord: formData.passWord,
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                gender: parseInt(formData.gender, 10) // Ép kiểu sang số nguyên
            };

            // Gọi API Đăng ký
            await axiosClient.post('/auth/register', payload);

            // Đăng ký thành công, thông báo và chuyển hướng sang trang đăng nhập
            alert("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate('/login');

        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            if (err.response && err.response.data) {
                // Backend ném ra Exception chuỗi String hoặc Object báo lỗi
                setApiError(typeof err.response.data === 'string' ? err.response.data : "Lỗi: Dữ liệu đã tồn tại hoặc không hợp lệ");
            } else {
                setApiError("Có lỗi xảy ra khi kết nối đến máy chủ.");
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
                            <h2>Bắt đầu hành trình</h2>
                            <p>Tạo tài khoản để khám phá những điều tuyệt vời</p>
                        </div>
                        <div className="visual-benefits">
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <i className="fas fa-gift"></i>
                                </div>
                                <div className="benefit-text">
                                    <h4>Ưu đãi độc quyền</h4>
                                    <p>Giảm giá đặc biệt cho thành viên mới</p>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <i className="fas fa-bell"></i>
                                </div>
                                <div className="benefit-text">
                                    <h4>Thông báo sớm</h4>
                                    <p>Cập nhật tour mới và khuyến mãi</p>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="benefit-text">
                                    <h4>Tích điểm thưởng</h4>
                                    <p>Nhận điểm cho mỗi chuyến đi</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="visual-slider">
                        <div className="slider-dots">
                            <span className="dot active"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h1>Tạo tài khoản mới</h1>
                            <p>Điền thông tin để bắt đầu</p>
                        </div>

                        {/* Social Register */}
                        <div className="social-login">
                            <button type="button" className="social-btn google">
                                <i className="fab fa-google"></i>
                                <span>Đăng ký với Google</span>
                            </button>
                            <button type="button" className="social-btn facebook">
                                <i className="fab fa-facebook-f"></i>
                                <span>Đăng ký với Facebook</span>
                            </button>
                        </div>

                        <div className="divider">
                            <span>hoặc</span>
                        </div>

                        {/* Register Form */}
                        <form className="auth-form" onSubmit={handleRegister}>
                            
                            {/* Dòng 1: Họ và tên & Tên đăng nhập */}
                            <div className="form-row two-columns">
                                <div className="form-group">
                                    <label htmlFor="fullName">
                                        <i className="fas fa-user"></i>
                                        Họ và tên *
                                    </label>
                                    <input 
                                        type="text" 
                                        id="fullName" 
                                        placeholder="Nguyễn Văn A"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={errors.fullName ? 'error' : ''}
                                    />
                                    {errors.fullName && <span className="error-message show">{errors.fullName}</span>}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="userName">
                                        <i className="fas fa-user-circle"></i>
                                        Tên đăng nhập *
                                    </label>
                                    <input 
                                        type="text" 
                                        id="userName" 
                                        placeholder="username123"
                                        value={formData.userName}
                                        onChange={handleChange}
                                        className={errors.userName ? 'error' : ''}
                                    />
                                    {errors.userName && <span className="error-message show">{errors.userName}</span>}
                                </div>
                            </div>

                            {/* Dòng 2: Email */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <i className="fas fa-envelope"></i>
                                        Email *
                                    </label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'error' : ''}
                                    />
                                    {errors.email && <span className="error-message show">{errors.email}</span>}
                                </div>
                            </div>

                            {/* Dòng 3: Số điện thoại & Giới tính */}
                            <div className="form-row two-columns">
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">
                                        <i className="fas fa-phone"></i>
                                        Số điện thoại *
                                    </label>
                                    <input 
                                        type="tel" 
                                        id="phoneNumber" 
                                        placeholder="0123456789"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={errors.phoneNumber ? 'error' : ''}
                                    />
                                    {errors.phoneNumber && <span className="error-message show">{errors.phoneNumber}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="gender">
                                        <i className="fas fa-venus-mars"></i>
                                        Giới tính *
                                    </label>
                                    <select 
                                        id="gender" 
                                        value={formData.gender} 
                                        onChange={handleChange}
                                        className={errors.gender ? 'error' : ''}
                                    >
                                        <option value="">Chọn giới tính</option>
                                        <option value="1">Nam</option>
                                        <option value="2">Nữ</option>
                                        <option value="3">Khác</option>
                                    </select>
                                    {errors.gender && <span className="error-message show">{errors.gender}</span>}
                                </div>
                            </div>

                            {/* Dòng 4: Mật khẩu */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="passWord">
                                        <i className="fas fa-lock"></i>
                                        Mật khẩu *
                                    </label>
                                    <div className="password-input">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            id="passWord" 
                                            placeholder="Tối thiểu 8 ký tự"
                                            value={formData.passWord}
                                            onChange={handleChange}
                                            className={errors.passWord ? 'error' : ''}
                                        />
                                        <button 
                                            type="button" 
                                            className="toggle-password" 
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"}></i>
                                        </button>
                                    </div>
                                    {errors.passWord && <span className="error-message show">{errors.passWord}</span>}
                                </div>
                            </div>

                            {/* Dòng 5: Xác nhận mật khẩu */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">
                                        <i className="fas fa-lock"></i>
                                        Xác nhận mật khẩu *
                                    </label>
                                    <div className="password-input">
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            id="confirmPassword" 
                                            placeholder="Nhập lại mật khẩu"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={errors.confirmPassword ? 'error' : ''}
                                        />
                                        <button 
                                            type="button" 
                                            className="toggle-password" 
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <i className={showConfirmPassword ? "far fa-eye-slash" : "far fa-eye"}></i>
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span className="error-message show">{errors.confirmPassword}</span>}
                                </div>
                            </div>

                            {/* Điều khoản */}
                            <div className="form-group-checkbox">
                                <label className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        id="agreeTerms" 
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                    />
                                    <span>Tôi đồng ý với <Link to="/terms" target="_blank">Điều khoản dịch vụ</Link> và <Link to="/privacy" target="_blank">Chính sách bảo mật</Link></span>
                                </label>
                                {errors.agreeTerms && <div className="error-message show" style={{marginTop: '4px', paddingLeft: '28px'}}>{errors.agreeTerms}</div>}
                            </div>

                            {/* Hiển thị lỗi API trả về */}
                            {apiError && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>{apiError}</div>}

                            {/* Nút Submit */}
                            <button type="submit" className="btn-submit" disabled={loading}>
                                <span>{loading ? "Đang xử lý..." : "Đăng ký"}</span>
                                {!loading && <i className="fas fa-arrow-right"></i>}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
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
                    <p>Đang tạo tài khoản...</p>
                </div>
            </div>
        </div>
    );
};

export default Register;