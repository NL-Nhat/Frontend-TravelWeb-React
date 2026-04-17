import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import styles from '../../styles/admin.module.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <AdminLayout>
            {/* Dashboard Tab */}
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
                    <div className={`${styles['stat-icon']} ${styles['blue']}`}>
                        <i className="fas fa-ticket-alt"></i>
                    </div>
                    <div className={styles['stat-content']}>
                        <span className={styles['stat-label']}>Tổng đặt tour</span>
                        <h3 className={styles['stat-value']}>1,234</h3>
                        <span className={`${styles['stat-change']} ${styles['positive']}`}>
                            <i className="fas fa-arrow-up"></i> 12.5% so với tháng trước
                        </span>
                    </div>
                </div>
                <div className={styles['stat-card']}>
                    <div className={`${styles['stat-icon']} ${styles['green']}`}>
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className={styles['stat-content']}>
                        <span className={styles['stat-label']}>Doanh thu</span>
                        <h3 className={styles['stat-value']}>245M</h3>
                        <span className={`${styles['stat-change']} ${styles['positive']}`}>
                            <i className="fas fa-arrow-up"></i> 8.2% so với tháng trước
                        </span>
                    </div>
                </div>
                <div className={styles['stat-card']}>
                    <div className={`${styles['stat-icon']} ${styles['orange']}`}>
                        <i className="fas fa-users"></i>
                    </div>
                    <div className={styles['stat-content']}>
                        <span className={styles['stat-label']}>Khách hàng mới</span>
                        <h3 className={styles['stat-value']}>456</h3>
                        <span className={`${styles['stat-change']} ${styles['positive']}`}>
                            <i className="fas fa-arrow-up"></i> 15.3% so với tháng trước
                        </span>
                    </div>
                </div>
                <div className={styles['stat-card']}>
                    <div className={`${styles['stat-icon']} ${styles['red']}`}>
                        <i className="fas fa-star"></i>
                    </div>
                    <div className={styles['stat-content']}>
                        <span className={styles['stat-label']}>Đánh giá TB</span>
                        <h3 className={styles['stat-value']}>4.8/5</h3>
                        <span className={`${styles['stat-change']} ${styles['positive']}`}>
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
                            <div className={`${styles['activity-icon']} ${styles['booking']}`}>
                                <i className="fas fa-ticket-alt"></i>
                            </div>
                            <div className={styles['activity-content']}>
                                <p><strong>Nguyễn Văn A</strong> đã đặt tour <strong>Bà Nà Hills</strong></p>
                                <span className={styles['activity-time']}>5 phút trước</span>
                            </div>
                            <span className={`${styles['activity-badge']} ${styles['new']}`}>Mới</span>
                        </div>
                        <div className={styles['activity-item']}>
                            <div className={`${styles['activity-icon']} ${styles['payment']}`}>
                                <i className="fas fa-dollar-sign"></i>
                            </div>
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
                        <a
                            href="/admin/tours"
                            className={styles['view-all']}
                            onClick={(e) => { e.preventDefault(); navigate('/admin/tours'); }}
                        >
                            Xem tất cả
                        </a>
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
        </AdminLayout>
    );
};

export default AdminDashboard;