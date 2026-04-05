import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../services/api';
import Header from '../components/Header';
import '../styles/account.css';

const Account = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Reference để kích hoạt input file ẩn

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // State quản lý form cập nhật
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        doB: '',
        gender: '',
        address: ''
    });

    // State quản lý ảnh avatar tải lên
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState('');

    // Hàm gọi API lấy Profile
    const fetchProfile = async () => {
        try {
            const response = await axiosClient.get(`/users/profile`);
            const data = response.data;
            
            setProfile(data);
            
            // Khởi tạo dữ liệu form từ API
            setFormData({
                fullName: data.fullName || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                doB: data.doB ? data.doB.substring(0, 10) : '',
                gender: data.gender || '',
                address: data.address || ''
            });
            
            setPreviewAvatar(data.avatar || "https://i.pravatar.cc/150");

            // Lưu avatar vào localStorage để Header đồng bộ
            if (data.avatar) {
                localStorage.setItem('userAvatar', data.avatar);
                window.dispatchEvent(new Event('avatarUpdated'));
            }
        } catch (err) {
            console.error("Lỗi lấy thông tin cá nhân:", err);
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

    useEffect(() => {
        fetchProfile();
    }, [navigate]);

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Xử lý chọn ảnh
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Tạo URL tạm thời để hiển thị ngay trên UI
            const fileUrl = URL.createObjectURL(file);
            setPreviewAvatar(fileUrl);
        }
    };

    // Gọi API Cập nhật Profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const submitData = new FormData();

            // Nếu người dùng có chọn ảnh mới thì append vào form
            if (selectedFile) {
                submitData.append('file', selectedFile);
            }

            // Chuẩn bị DTO và ép kiểu dữ liệu cho đúng với UserRequestDTO ở Backend
            const dto = {
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                doB: formData.doB || null,
                gender: formData.gender ? parseInt(formData.gender, 10) : null,
                address: formData.address
            };

            // Spring Boot @RequestPart("dto") yêu cầu định dạng application/json
            submitData.append('dto', new Blob([JSON.stringify(dto)], {
                type: "application/json"
            }));

            const response = await axiosClient.put('/users/profile', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert(response.data.message || "Cập nhật thành công!");
            
            // Xóa file đã chọn và gọi lại API get profile để lấy URL ảnh Cloudinary mới nhất (nếu có update)
            setSelectedFile(null);
            await fetchProfile();

        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert("Cập nhật thất bại! Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Xử lý đăng xuất
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/auth/logout');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userAvatar');
            window.dispatchEvent(new Event('avatarUpdated'));
            navigate('/login');
        } catch (err) {
            console.error("Lỗi khi đăng xuất:", err);
        }
    };

    if (loading) return <div><Header /><div style={{ textAlign: 'center', padding: '100px' }}><h2>Đang tải dữ liệu...</h2></div></div>;
    if (error) return <div><Header /><div style={{ textAlign: 'center', padding: '100px' }}><h2>{error}</h2></div></div>;
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
                                <img src={previewAvatar} alt="Avatar" className="profile-avatar" />
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
                                    
                                    {/* Upload Avatar */}
                                    <div className="avatar-upload">
                                        <img src={previewAvatar} alt="Avatar" />
                                        <button type="button" className="btn-upload" onClick={() => fileInputRef.current.click()}>
                                            <i className="fas fa-camera"></i>
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            style={{ display: 'none' }} 
                                            accept="image/*" 
                                            onChange={handleImageChange} 
                                        />
                                    </div>

                                    {/* Edit Profile Form */}
                                    <form className="profile-form" onSubmit={handleUpdateProfile}>
                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Họ và tên</label>
                                                <input 
                                                    type="text" 
                                                    name="fullName" 
                                                    value={formData.fullName} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Email</label>
                                                {/* Thường email đăng nhập không được đổi, nhưng nếu API của bạn cho phép thì để onChange */}
                                                <input 
                                                    type="email" 
                                                    name="email" 
                                                    value={formData.email} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Số điện thoại</label>
                                                <input 
                                                    type="tel"  
                                                    name="phoneNumber" 
                                                    value={formData.phoneNumber} 
                                                    onChange={handleInputChange} 
                                                    required 
                                                />
                                            </div>
                                            <div className="form-field">
                                                <label>Ngày sinh</label>
                                                <input 
                                                    type="date" 
                                                    name="doB" 
                                                    value={formData.doB} 
                                                    onChange={handleInputChange} 
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-field">
                                                <label>Giới tính</label>
                                                <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                                    <option value="">Chưa cập nhật</option>
                                                    <option value="1">Nam</option>
                                                    <option value="2">Nữ</option>
                                                    <option value="3">Khác</option>
                                                </select>
                                            </div>
                                            <div className="form-field">
                                                <label>Địa chỉ</label>
                                                <input 
                                                    type="text" 
                                                    name="address" 
                                                    value={formData.address} 
                                                    onChange={handleInputChange} 
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn-save" disabled={isUpdating}>
                                            <i className={isUpdating ? "fas fa-spinner fa-spin" : "fas fa-save"}></i> 
                                            {isUpdating ? " Đang cập nhật..." : " Lưu thay đổi"}
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