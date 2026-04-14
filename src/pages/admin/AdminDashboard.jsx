import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../services/api';
import styles from '../../styles/admin.module.css';

const AdminDashboard = () => {
    const cx = (...classes) => classes.map((name) => styles[name] || name).join(' ');
    const navigate = useNavigate();
    
    // State quản lý UI
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Kiểm tra quyền (Bảo vệ Route)
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const isAuth = localStorage.getItem('isAuthenticated');
        
        if (!isAuth || role !== 'ROLE_ADMIN') {
            // Nếu không phải Admin thì đá về trang đăng nhập
            navigate('/login');
        }
    }, [navigate]);

    // Xử lý Đăng xuất cho Admin
    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/auth/logout');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            window.dispatchEvent(new Event('authStatusChanged'));
            navigate('/login');
        } catch (err) {
            console.error("Lỗi khi đăng xuất:", err);
        }
    };

    return (
        <div className={cx('admin-body', isSidebarOpen ? '' : 'sidebar-closed')}>
            {/* Sidebar */}
            <aside className={styles['admin-sidebar']} id="sidebar" style={{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'all 0.3s' }}>
                <div className={styles['sidebar-header']}>
                    <div className={styles.logo}>
                        <i className="fas fa-compass"></i>
                        <span>VietTravel Admin</span>
                    </div>
                    <button className={styles['sidebar-toggle']} id="sidebarToggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <i className="fas fa-bars"></i>
                    </button>
                </div>

                <div className={styles['sidebar-user']}>
                    <img src="https://i.pravatar.cc/150?img=12" alt="Admin" />
                    <div className={styles['user-info']}>
                        <h4>Admin User</h4>
                        <span>Quản trị viên</span>
                    </div>
                </div>

                <nav className={styles['sidebar-nav']}>
                    <a href="#dashboard" className={cx('nav-item', activeTab === 'dashboard' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
                        <i className="fas fa-home"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#tours" className={cx('nav-item', activeTab === 'tours' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('tours'); }}>
                        <i className="fas fa-map-marked-alt"></i>
                        <span>Quản lý Tour</span>
                    </a>
                    <a href="#bookings" className={cx('nav-item', activeTab === 'bookings' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('bookings'); }}>
                        <i className="fas fa-ticket-alt"></i>
                        <span>Đặt Tour</span>
                    </a>
                    <a href="#users" className={cx('nav-item', activeTab === 'users' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}>
                        <i className="fas fa-users"></i>
                        <span>Người dùng</span>
                    </a>
                    <a href="#guides" className={cx('nav-item', activeTab === 'guides' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('guides'); }}>
                        <i className="fas fa-user-tie"></i>
                        <span>Hướng dẫn viên</span>
                    </a>
                    <a href="#schedules" className={cx('nav-item', activeTab === 'schedules' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('schedules'); }}>
                        <i className="fas fa-calendar-alt"></i>
                        <span>Lịch khởi hành</span>
                    </a>
                    <a href="#reviews" className={cx('nav-item', activeTab === 'reviews' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('reviews'); }}>
                        <i className="fas fa-star"></i>
                        <span>Đánh giá</span>
                    </a>
                    <a href="#payments" className={cx('nav-item', activeTab === 'payments' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('payments'); }}>
                        <i className="fas fa-dollar-sign"></i>
                        <span>Thanh toán</span>
                    </a>
                    <a href="#reports" className={cx('nav-item', activeTab === 'reports' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}>
                        <i className="fas fa-chart-line"></i>
                        <span>Báo cáo</span>
                    </a>
                    <a href="#settings" className={cx('nav-item', activeTab === 'settings' ? 'active' : '')} onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>
                        <i className="fas fa-cog"></i>
                        <span>Cài đặt</span>
                    </a>
                </nav>

                <div className={styles['sidebar-footer']}>
                    <a href="#" className={styles['logout-btn']} onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Đăng xuất</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div className={styles['admin-main']} style={{ marginLeft: isSidebarOpen ? '260px' : '0', transition: 'all 0.3s', width: '100%' }}>
                {/* Top Bar */}
                <header className={styles['admin-header']}>
                    <div className={styles['header-left']}>
                        <button className={styles['mobile-toggle']} id="mobileToggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className={styles['search-box']}>
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Tìm kiếm..." />
                        </div>
                    </div>

                    <div className={styles['header-right']}>
                        <button className={styles['header-icon']} id="notificationBtn">
                            <i className="fas fa-bell"></i>
                            <span className={styles['notification-badge']}>5</span>
                        </button>
                        <button className={styles['header-icon']}>
                            <i className="fas fa-envelope"></i>
                            <span className={styles['notification-badge']}>3</span>
                        </button>
                        <div className={styles['header-user']}>
                            <img src="https://i.pravatar.cc/150?img=12" alt="User" />
                            <span>Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className={styles['admin-content']}>
                    
                    {/* Dashboard Tab */}
                    <div className={cx('page-content', activeTab === 'dashboard' ? 'active' : '')} style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
                        <div className={styles['page-header-admin']}>
                            <h1>Dashboard</h1>
                            <div className={styles['page-actions']}>
                                <select className={styles['filter-select']}>
                                    <option>7 ngày qua</option>
                                    <option>30 ngày qua</option>
                                    <option>3 tháng qua</option>
                                    <option>Năm nay</option>
                                </select>
                                <button className="btn-primary">
                                    <i className="fas fa-download"></i> Xuất báo cáo
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className={styles['stats-grid']}>
                            <div className={styles['stat-card']}>
                                <div className={cx('stat-icon', 'blue')}>
                                    <i className="fas fa-ticket-alt"></i>
                                </div>
                                <div className={styles['stat-content']}>
                                    <span className={styles['stat-label']}>Tổng đặt tour</span>
                                    <h3 className={styles['stat-value']}>1,234</h3>
                                    <span className={cx('stat-change', 'positive')}>
                                        <i className="fas fa-arrow-up"></i> 12.5% so với tháng trước
                                    </span>
                                </div>
                            </div>
                            <div className={styles['stat-card']}>
                                <div className={cx('stat-icon', 'green')}>
                                    <i className="fas fa-dollar-sign"></i>
                                </div>
                                <div className={styles['stat-content']}>
                                    <span className={styles['stat-label']}>Doanh thu</span>
                                    <h3 className={styles['stat-value']}>245M</h3>
                                    <span className={cx('stat-change', 'positive')}>
                                        <i className="fas fa-arrow-up"></i> 8.2% so với tháng trước
                                    </span>
                                </div>
                            </div>
                            <div className={styles['stat-card']}>
                                <div className={cx('stat-icon', 'orange')}>
                                    <i className="fas fa-users"></i>
                                </div>
                                <div className={styles['stat-content']}>
                                    <span className={styles['stat-label']}>Khách hàng mới</span>
                                    <h3 className={styles['stat-value']}>456</h3>
                                    <span className={cx('stat-change', 'positive')}>
                                        <i className="fas fa-arrow-up"></i> 15.3% so với tháng trước
                                    </span>
                                </div>
                            </div>
                            <div className={styles['stat-card']}>
                                <div className={cx('stat-icon', 'red')}>
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className={styles['stat-content']}>
                                    <span className={styles['stat-label']}>Đánh giá TB</span>
                                    <h3 className={styles['stat-value']}>4.8/5</h3>
                                    <span className={cx('stat-change', 'positive')}>
                                        <i className="fas fa-arrow-up"></i> 0.2 so với tháng trước
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className={styles['charts-row']}>
                            <div className={styles['chart-card']}>
                                <div className={styles['chart-header']}>
                                    <h3>Doanh thu theo tháng</h3>
                                    <select>
                                        <option>2026</option>
                                        <option>2025</option>
                                    </select>
                                </div>
                                <div className={styles['chart-placeholder']}>
                                    <canvas id="revenueChart" height="300"></canvas>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity & Popular Tours */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                            <div className={styles['activity-section']}>
                                <div className={styles['section-header']} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3>Hoạt động gần đây</h3>
                                    <a href="#" className={styles['view-all']}>Xem tất cả</a>
                                </div>
                                <div className={styles['activity-list']}>
                                    <div className={styles['activity-item']}>
                                        <div className={cx('activity-icon', 'booking')}><i className="fas fa-ticket-alt"></i></div>
                                        <div className={styles['activity-content']}>
                                            <p><strong>Nguyễn Văn A</strong> đã đặt tour <strong>Bà Nà Hills</strong></p>
                                            <span className={styles['activity-time']}>5 phút trước</span>
                                        </div>
                                        <span className={cx('activity-badge', 'new')}>Mới</span>
                                    </div>
                                    <div className={styles['activity-item']}>
                                        <div className={cx('activity-icon', 'payment')}><i className="fas fa-dollar-sign"></i></div>
                                        <div className={styles['activity-content']}>
                                            <p>Thanh toán <strong>2.500.000đ</strong> từ <strong>Trần Thị B</strong></p>
                                            <span className={styles['activity-time']}>15 phút trước</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles['popular-tours-section']}>
                                <div className={styles['section-header']} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3>Tour phổ biến</h3>
                                    <a href="#tours" className={styles['view-all']} onClick={() => setActiveTab('tours')}>Xem tất cả</a>
                                </div>
                                <div className={styles['popular-tours-grid']}>
                                    <div className={styles['popular-tour-card']}>
                                        <img src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400" alt="Tour" />
                                        <div className={styles['tour-info']}>
                                            <h4>Tour Bà Nà Hills</h4>
                                            <div className={styles['tour-stats']}>
                                                <span><i className="fas fa-ticket-alt"></i> 156 đặt</span>
                                                <span><i className="fas fa-star"></i> 4.8</span>
                                            </div>
                                            <div className={styles['tour-revenue']}>1.250.000đ x 156 = <strong>195M</strong></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tours Tab */}
                    <div className={cx('page-content', activeTab === 'tours' ? 'active' : '')} style={{ display: activeTab === 'tours' ? 'block' : 'none' }}>
                        <div className={styles['page-header-admin']}>
                            <h1>Quản lý Tour</h1>
                            <button className="btn-primary">
                                <i className="fas fa-plus"></i> Thêm tour mới
                            </button>
                        </div>
                        <div className={styles['content-placeholder']}>
                            <p>Nội dung trang Quản lý Tour</p>
                        </div>
                    </div>

                    {/* Các Tab khác */}
                    <div className={cx('page-content', activeTab === 'bookings' ? 'active' : '')} style={{ display: activeTab === 'bookings' ? 'block' : 'none' }}>
                        <div className={styles['page-header-admin']}><h1>Quản lý Đặt Tour</h1></div>
                        <div className={styles['content-placeholder']}><p>Nội dung trang Đặt Tour</p></div>
                    </div>
                    <div className={cx('page-content', activeTab === 'users' ? 'active' : '')} style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
                        <div className={styles['page-header-admin']}><h1>Quản lý Người dùng</h1></div>
                        <div className={styles['content-placeholder']}><p>Nội dung trang Người dùng</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;