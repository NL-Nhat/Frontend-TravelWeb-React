import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../services/api';
import styles from '../../styles/admin.module.css';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Kiểm tra quyền admin
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        const isAuth = localStorage.getItem('isAuthenticated');
        if (!isAuth || role !== 'ROLE_ADMIN') {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/auth/logout');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            window.dispatchEvent(new Event('authStatusChanged'));
            navigate('/login');
        } catch (err) {
            console.error('Lỗi khi đăng xuất:', err);
        }
    };

    const navItems = [
        { path: '/admin', icon: 'fas fa-home', label: 'Dashboard' },
        { path: '/admin/tours', icon: 'fas fa-map-marked-alt', label: 'Quản lý Tour' },
        { path: '/admin/bookings', icon: 'fas fa-ticket-alt', label: 'Đặt Tour' },
        { path: '/admin/users', icon: 'fas fa-users', label: 'Người dùng' },
        { path: '/admin/guides', icon: 'fas fa-user-tie', label: 'Hướng dẫn viên' },
        { path: '/admin/schedules', icon: 'fas fa-calendar-alt', label: 'Lịch khởi hành' },
        { path: '/admin/reviews', icon: 'fas fa-star', label: 'Đánh giá' },
        { path: '/admin/payments', icon: 'fas fa-dollar-sign', label: 'Thanh toán' },
        { path: '/admin/reports', icon: 'fas fa-chart-line', label: 'Báo cáo' },
        { path: '/admin/settings', icon: 'fas fa-cog', label: 'Cài đặt' },
    ];

    return (
        <div className={styles['admin-body']}>
            {/* Sidebar */}
            <aside
                className={styles['admin-sidebar']}
                style={{
                    transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'all 0.3s',
                }}
            >
                <div className={styles['sidebar-header']}>
                    <div className={styles.logo}>
                        <i className="fas fa-compass"></i>
                        <span>VietTravel Admin</span>
                    </div>
                    <button
                        className={styles['sidebar-toggle']}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
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
                    {navItems.map((item) => (
                        <a
                            key={item.path}
                            href={item.path}
                            className={`${styles['nav-item']} ${location.pathname === item.path ? styles['active'] : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(item.path);
                            }}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </nav>

                <div className={styles['sidebar-footer']}>
                    <a href="#" className={styles['logout-btn']} onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Đăng xuất</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className={styles['admin-main']}
                style={{
                    marginLeft: isSidebarOpen ? '280px' : '0',
                    transition: 'all 0.3s',
                    width: '100%',
                }}
            >
                {/* Header */}
                <header className={styles['admin-header']}>
                    <div className={styles['header-left']}>
                        <button
                            className={styles['mobile-toggle']}
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <div className={styles['search-box']}>
                            <i className="fas fa-search"></i>
                            <input type="text" placeholder="Tìm kiếm..." />
                        </div>
                    </div>
                    <div className={styles['header-right']}>
                        <button className={styles['header-icon']}>
                            <i className="fas fa-bell"></i>
                            <span className={styles['notification-badge']}>5</span>
                        </button>
                        <button className={styles['header-icon']}>
                            <i className="fas fa-envelope"></i>
                            <span className={styles['notification-badge']}>3</span>
                        </button>
                        <div className={styles['header-user']}>
                            <img src="https://i.pravatar.cc/150?img=12" alt="Admin" />
                            <span>Admin</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className={styles['admin-content']}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
