import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosClient from '../../services/api';
import s from '../../styles/adminTourDetail.module.css';

const formatPrice = (v) => v == null ? '—' : new Intl.NumberFormat('vi-VN').format(v) + 'đ';
const formatDate  = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const formatTime  = (t) => t ? t.slice(0, 5) : '—';   // "HH:MM:SS" → "HH:MM"

// ── Trạng thái lịch khởi hành ────────────────────────────────
const getScheduleStatus = (startDate, endDate, booked, max) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const sd = startDate ? new Date(startDate) : null;
    const ed = endDate   ? new Date(endDate)   : null;
    if (sd && sd > today) return { label: 'Sắp diễn ra', cls: 'upcoming', icon: 'fa-clock' };
    if (ed && ed < today) return { label: 'Đã kết thúc', cls: 'ended',    icon: 'fa-flag-checkered' };
    if (max > 0 && booked >= max) return { label: 'Đã đầy', cls: 'full', icon: 'fa-times-circle' };
    return { label: 'Đang diễn ra', cls: 'ongoing', icon: 'fa-play-circle' };
};

// ── AdminTourDetail ───────────────────────────────────────────
const AdminTourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData]       = useState(null);   // TourDetailResponse
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [uploading, setUploading] = useState(false);

    // ── Fetch detail ─────────────────────────────────────────
    const fetchDetail = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const r = await axiosClient.get(`/tours/${id}`);
            setData(r.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải thông tin tour.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // ── Thêm ảnh phụ ────────────────────────────────────────
    const handleAddImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('idTour', id);
            await axiosClient.post('/tours/images', fd);
            await fetchDetail();
        } catch { alert('Upload ảnh thất bại. Vui lòng thử lại.'); }
        finally { setUploading(false); e.target.value = ''; }
    };

    // ── Xóa ảnh phụ ─────────────────────────────────────────
    const handleDeleteImage = async (imgId) => {
        if (!window.confirm('Xóa ảnh này?')) return;
        try {
            await axiosClient.delete(`/tours/images/${imgId}`);
            await fetchDetail();
        } catch { alert('Xóa ảnh thất bại.'); }
    };

    // ── Render: loading ──────────────────────────────────────
    if (loading) return (
        <AdminLayout>
            <div className={`${s['center-state']} ${s['loading']}`}>
                <i className="fas fa-circle-notch" />
                <p>Đang tải thông tin tour...</p>
            </div>
        </AdminLayout>
    );

    // ── Render: error ────────────────────────────────────────
    if (error) return (
        <AdminLayout>
            <div className={`${s['center-state']} ${s['error']}`}>
                <i className="fas fa-exclamation-circle" />
                <p>{error}</p>
                <button className={s['btn-retry']} onClick={fetchDetail}><i className="fas fa-redo" /> Thử lại</button>
                <button className={s['btn-secondary']} onClick={() => navigate('/admin/tours')}><i className="fas fa-arrow-left" /> Quay lại</button>
            </div>
        </AdminLayout>
    );

    const tour      = data?.tourResponseDTO || {};
    const images    = data?.imageTours || [];
    const schedules = data?.departureSchedules || [];
    const isActive  = tour.status === 'Đang mở';

    return (
        <AdminLayout>
            {/* Back bar */}
            <div className={s['back-bar']}>
                <button className={s['btn-back']} onClick={() => navigate('/admin/tours')}>
                    <i className="fas fa-arrow-left" /> Quay lại
                </button>
                <h1>{tour.tourName || 'Chi tiết Tour'}</h1>
            </div>

            {/* ── Main info grid ──────────────────────────────── */}
            <div className={s['detail-grid']}>
                {/* Ảnh chính */}
                <div className={s['main-image-wrap']}>
                    {tour.image
                        ? <img src={tour.image} alt={tour.tourName} />
                        : <div className={s['no-image']}><i className="fas fa-image" /><span>Chưa có ảnh</span></div>
                    }
                </div>

                {/* Thông tin */}
                <div className={s['info-card']}>
                    <h2 className={s['info-title']}>{tour.tourName}</h2>

                    <span className={`${s['status-badge']} ${isActive ? s['active'] : s['inactive']}`}>
                        <i className={`fas ${isActive ? 'fa-check-circle' : 'fa-pause-circle'}`} />
                        {tour.status || '—'}
                    </span>

                    <div className={s['info-divider']} />

                    <div className={s['info-row']}>
                        <div className={`${s['info-row-icon']} ${s['purple']}`}><i className="fas fa-map-marker-alt" /></div>
                        <div className={s['info-row-content']}>
                            <div className={s['info-row-label']}>Điểm đến</div>
                            <div className={s['info-row-value']}>{tour.city || '—'}</div>
                        </div>
                    </div>

                    <div className={s['info-row']}>
                        <div className={`${s['info-row-icon']} ${s['orange']}`}><i className="fas fa-user" /></div>
                        <div className={s['info-row-content']}>
                            <div className={s['info-row-label']}>Giá người lớn</div>
                            <div className={`${s['info-row-value']} ${s['price-highlight']}`}>{formatPrice(tour.adultPrice)}</div>
                        </div>
                    </div>

                    <div className={s['info-row']}>
                        <div className={`${s['info-row-icon']} ${s['blue']}`}><i className="fas fa-child" /></div>
                        <div className={s['info-row-content']}>
                            <div className={s['info-row-label']}>Giá trẻ em</div>
                            <div className={`${s['info-row-value']} ${s['price-highlight']}`}>{formatPrice(tour.childPrice)}</div>
                        </div>
                    </div>

                    {tour.averageRating != null && (
                        <div className={s['info-row']}>
                            <div className={`${s['info-row-icon']} ${s['gold']}`}><i className="fas fa-star" /></div>
                            <div className={s['info-row-content']}>
                                <div className={s['info-row-label']}>Đánh giá</div>
                                <div className={s['info-row-value']}>{Number(tour.averageRating).toFixed(1)} ⭐ ({tour.numberOfReview ?? 0} lượt)</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Hình ảnh phụ ───────────────────────────────── */}
            <div className={s['section-card']}>
                <div className={s['section-header']}>
                    <h3 className={s['section-title']}>
                        <i className="fas fa-images" /> Hình ảnh phụ
                        <span style={{ fontWeight: 400, color: '#718096', fontSize: '0.85rem' }}>({images.length} ảnh)</span>
                    </h3>
                    <label className={s['btn-primary']} style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                        <input type="file" accept="image/*" onChange={handleAddImage} style={{ display: 'none' }} disabled={uploading} />
                        {uploading ? <><i className="fas fa-spinner fa-spin" /> Đang tải...</> : <><i className="fas fa-plus" /> Thêm ảnh</>}
                    </label>
                </div>
                <div className={s['section-body']}>
                    {images.length === 0 ? (
                        <div className={s['gallery-empty']}>
                            <i className="fas fa-images" />
                            <p>Chưa có hình ảnh phụ</p>
                        </div>
                    ) : (
                        <div className={s['gallery-grid']}>
                            {images.map(img => (
                                <div key={img.id} className={s['gallery-item']}>
                                    <img src={img.image} alt="" />
                                    <div className={s['gallery-item-overlay']}>
                                        <button className={s['gallery-delete-btn']} onClick={() => handleDeleteImage(img.id)} title="Xóa ảnh">
                                            <i className="fas fa-trash" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Lịch khởi hành ─────────────────────────────── */}
            <div className={s['section-card']}>
                <div className={s['section-header']}>
                    <h3 className={s['section-title']}>
                        <i className="fas fa-calendar-alt" /> Lịch khởi hành
                        <span style={{ fontWeight: 400, color: '#718096', fontSize: '0.85rem' }}>({schedules.length} lịch)</span>
                    </h3>
                    <button className={s['btn-primary']}>
                        <i className="fas fa-plus" /> Thêm lịch
                    </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    {schedules.length === 0 ? (
                        <div className={s['schedule-empty']}>
                            <i className="fas fa-calendar-times" />
                            <p>Chưa có lịch khởi hành nào</p>
                        </div>
                    ) : (
                        <table className={s['schedule-table']}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Ngày khởi hành</th>
                                    <th>Giờ</th>
                                    <th>Ngày về</th>
                                    <th>Đã đặt / Tối đa</th>
                                    <th>Trạng thái</th>
                                    <th style={{ width: 80 }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map((sc, idx) => {
                                    const booked = sc.numberGuestBooked ?? 0;
                                    const max    = sc.maxGuest ?? 0;
                                    const pct    = max > 0 ? Math.min(100, Math.round(booked / max * 100)) : 0;
                                    const fillCls = pct >= 100 ? s['full'] : pct >= 80 ? s['warn'] : '';
                                    const st = getScheduleStatus(sc.startDate, sc.endDate, booked, max);
                                    return (
                                        <tr key={sc.id}>
                                            <td style={{ color: '#A0AEC0', fontWeight: 600 }}>{idx + 1}</td>
                                            <td><strong>{formatDate(sc.startDate)}</strong></td>
                                            <td>{formatTime(sc.startTime)}</td>
                                            <td>{formatDate(sc.endDate)}</td>
                                            <td>
                                                <div className={s['capacity-bar-wrap']}>
                                                    <div className={s['capacity-bar']}>
                                                        <div className={`${s['capacity-fill']} ${fillCls}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className={s['capacity-text']}>{booked}/{max}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${s['schedule-badge']} ${s[st.cls]}`}>
                                                    <i className={`fas ${st.icon}`} /> {st.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                    <button className={s['btn-icon-sm']} title="Chỉnh sửa" style={{ background: '#EBF4FF', color: '#3182CE' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background='#3182CE'; e.currentTarget.style.color='white'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background='#EBF4FF'; e.currentTarget.style.color='#3182CE'; }}>
                                                        <i className="fas fa-edit" />
                                                    </button>
                                                    <button className={s['btn-icon-sm']} title="Xóa">
                                                        <i className="fas fa-trash" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTourDetail;
