import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../services/api';
import Header from '../components/Header';
import '../styles/account.css'; 

const Account = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            // Không cần kiểm tra ID từ localStorage nữa
            // Chỉ cần gọi thẳng API, Cookie chứa Token sẽ tự động được gửi đi nhờ cấu hình `withCredentials: true`
            try {
                const response = await axiosClient.get(`/users/get-profile`);
                setProfile(response.data);
                
                // Lưu avatar vào localStorage để Header đồng bộ
                if (response.data.avatar) {
                    localStorage.setItem('userAvatar', response.data.avatar);
                    window.dispatchEvent(new Event('avatarUpdated'));
                }
            } catch (err) {
                console.error("Lỗi lấy thông tin cá nhân:", err);
                
                // Bắt lỗi 401 từ Backend (Chưa đăng nhập hoặc Token hết hạn)
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('userAvatar');
                    window.dispatchEvent(new Event('avatarUpdated'));
                    navigate('/login');
                } else {
                    setError('Không thể tải thông tin. Vui lòng thử lại.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    // Xử lý đăng xuất
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/auth/logout');
            
            // Xóa sạch lịch sử đăng nhập dưới LocalStorage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userAvatar');
            
            // Báo Header cập nhật và về trang đăng nhập
            window.dispatchEvent(new Event('avatarUpdated'));
            navigate('/login');
        } catch (err) {
            console.error("Lỗi khi đăng xuất:", err);
        }
    };

    if (loading) return <div><Header /><div style={{textAlign: 'center', padding: '100px'}}><h2>Đang tải dữ liệu...</h2></div></div>;
    if (error) return <div><Header /><div style={{textAlign: 'center', padding: '100px'}}><h2>{error}</h2></div></div>;
    if (!profile) return null;

    return (
        <>
            <Header />
            <main className="account-page">
                <div className="container">
                    <div className="account-layout">
                        {/* Sidebar Menu */}
                        <aside className="account-sidebar">
                            <div className="user-profile">
                                <img src={profile.avatar || "https://i.pravatar.cc/150"} alt="Avatar" className="profile-avatar" />
                                <h3>{profile.fullName}</h3>
                                <p>{profile.email}</p>
                            </div>
                            
                            <nav className="account-menu">
                                <a href="#profile" className="menu-item active">
                                    <i className="fas fa-user"></i>
                                    <span>Thông tin cá nhân</span>
                                </a>
                                <a href="#bookings" className="menu-item">
                                    <i className="fas fa-ticket-alt"></i>
                                    <span>Tour đã đặt</span>
                                    <span className="badge">0</span>
                                </a>
                                <a href="#favorites" className="menu-item">
                                    <i className="fas fa-heart"></i>
                                    <span>Yêu thích</span>
                                </a>
                                <a href="#reviews" className="menu-item">
                                    <i className="fas fa-star"></i>
                                    <span>Đánh giá</span>
                                </a>
                                <a href="#ai-history" className="menu-item">
                                    <i className="fas fa-robot"></i>
                                    <span>Lịch sử tư vấn</span>
                                </a>
                                <a href="#settings" className="menu-item">
                                    <i className="fas fa-cog"></i>
                                    <span>Cài đặt</span>
                                </a>
                                <a href="#" className="menu-item logout" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span>Đăng xuất</span>
                                </a>
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <div className="account-content">
                            <section id="profile" className="content-section active">
                                <h2>Thông tin cá nhân</h2>
                                <div className="profile-card">
                                    <div className="avatar-upload">
                                        <img src={profile.avatar || "https://i.pravatar.cc/150"} alt="Avatar" />
                                        <button className="btn-upload">
                                            <i className="fas fa-camera"></i>
                                        </button>
                                    </div>
                                    
                                    <form className="profile-form">
                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Họ và tên</label>
                                                <input type="text" defaultValue={profile.fullName || ''} readOnly />
                                            </div>
                                            <div className="form-field">
                                                <label>Email</label>
                                                <input type="email" defaultValue={profile.email || ''} readOnly />
                                            </div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Số điện thoại</label>
                                                <input type="tel" defaultValue={profile.phoneNumber || ''} readOnly />
                                            </div>
                                            <div className="form-field">
                                                <label>Ngày sinh</label>
                                                <input type="date" defaultValue={profile.doB ? profile.doB.substring(0, 10) : ''} readOnly />
                                            </div>
                                        </div>
                                        
                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Giới tính</label>
                                                <select value={profile.gender || ''} disabled>
                                                    <option value="">Chưa cập nhật</option>
                                                    <option value="1">Nam</option>
                                                    <option value="2">Nữ</option>
                                                    <option value="3">Khác</option>
                                                </select>
                                            </div>
                                            <div className="form-field">
                                                <label>Địa chỉ</label>
                                                <input type="text" defaultValue={profile.address || ''} readOnly />
                                            </div>
                                        </div>
                                        
                                        <button type="button" className="btn-save">
                                            <i className="fas fa-save"></i> Cập nhật thông tin
                                        </button>
                                    </form>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <div className="footer-bottom">
                        <p>&copy; 2026 VietTravel. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Account;