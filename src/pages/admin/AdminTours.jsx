import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosClient from '../../services/api';
import styles from '../../styles/adminTour.module.css';

const formatPrice = (v) => v == null ? '—' : new Intl.NumberFormat('vi-VN').format(v) + 'đ';
const PAGE_SIZE = 10;
const STATUS_ACTIVE = 'Đang mở';
const STATUS_INACTIVE = 'Tạm dừng';

// ── TourRow ──────────────────────────────────────────────────
const TourRow = ({ tour, isSelected, onSelect, onDelete, onEdit }) => {
    const navigate = useNavigate();
    const [imgErr, setImgErr] = useState(false);
    const isActive = tour.status === STATUS_ACTIVE;

    return (
        <tr>
            <td><input type="checkbox" checked={isSelected} onChange={() => onSelect(tour.id)} /></td>
            <td>
                <div className={styles['tour-info-cell']}>
                    {tour.image && !imgErr
                        ? <img src={tour.image} alt={tour.tourName} onError={() => setImgErr(true)} />
                        : <div className={styles['tour-img-placeholder']}><i className="fas fa-image" /></div>
                    }
                    <div className={styles['tour-details']}>
                        <strong>{tour.tourName}</strong>
                    </div>
                </div>
            </td>
            <td>
                <span className={styles['destination-badge']}>
                    <i className="fas fa-map-marker-alt" /> {tour.city || '—'}
                </span>
            </td>
            <td>
                <div className={styles['price-cell']}>
                    <span className={styles['price-adult']}>{formatPrice(tour.adultPrice)}</span>
                    <span className={styles['price-child']}>{formatPrice(tour.childPrice)}</span>
                </div>
            </td>
            <td>
                <div className={styles['rating-cell']}>
                    <span className={styles['rating-value']}><i className="fas fa-star" /> {tour.averageRating ? Number(tour.averageRating).toFixed(1) : 'Chưa có đánh giá'}</span>
                    {/* <span className={styles['rating-count']}>({tour.numberOfReview ?? 0} đánh giá)</span> */}
                </div>
            </td>
            <td>
                <span className={`${styles['status-badge']} ${isActive ? styles['active'] : styles['inactive']}`}>
                    <i className={`fas ${isActive ? 'fa-check-circle' : 'fa-pause-circle'}`} />
                    {tour.status}
                </span>
            </td>
            <td>
                <div className={styles['action-buttons']}>
                    <button className={styles['btn-icon']} title="Xem chi tiết" onClick={() => navigate(`/admin/tours/${tour.id}`)}>
                        <i className="fas fa-eye" />
                    </button>
                    <button className={styles['btn-icon']} title="Chỉnh sửa tour" onClick={() => onEdit(tour)}>
                        <i className="fas fa-edit" />
                    </button>
                    <button className={`${styles['btn-icon']} ${styles['danger']}`} title="Xóa" onClick={() => onDelete(tour)}>
                        <i className="fas fa-trash" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

// ── TourModal (Thêm/Sửa tour) ─────────────────────────────────────
const TourModal = ({ isOpen, onClose, onSuccess, showNotification, editTour }) => {
    const [form, setForm] = useState({ tourName: '', describe: '', adultPrice: '', childPrice: '', status: STATUS_ACTIVE, idDestination: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [destinations, setDestinations] = useState([]);
    const [destLoading, setDestLoading] = useState(false);
    const [destError, setDestError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const loadDestinations = useCallback(async () => {
        setDestLoading(true);
        setDestError(null);
        try {
            const r = await axiosClient.get('/destinations');
            const list = Array.isArray(r.data) ? r.data : [];
            setDestinations(list);
            if (list.length === 0) setDestError('Không có điểm đến nào.');
            return list;
        } catch (err) {
            console.error('Lỗi tải điểm đến:', err);
            setDestError('Không thể tải danh sách điểm đến.');
            return [];
        } finally {
            setDestLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        setErrors({});
        loadDestinations().then(list => {
            if (editTour) {
                const destId = list?.find(d => d.city === editTour.city)?.id || '';
                setForm({
                    tourName: editTour.tourName || '',
                    describe: editTour.describe || '',
                    adultPrice: editTour.adultPrice || '',
                    childPrice: editTour.childPrice || '',
                    status: editTour.status || STATUS_ACTIVE,
                    idDestination: destId
                });
                setImagePreview(editTour.image || '');
                setImageFile(null); // Backend API sửa tour chưa hỗ trợ đổi ảnh
            } else {
                setForm({ tourName: '', describe: '', adultPrice: '', childPrice: '', status: STATUS_ACTIVE, idDestination: '' });
                setImageFile(null);
                setImagePreview('');
            }
        });
    }, [isOpen, editTour, loadDestinations]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: undefined }));
    };

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setImageFile(f);
        setImagePreview(URL.createObjectURL(f));
    };

    const validate = () => {
        const e = {};
        if (!form.tourName.trim()) e.tourName = 'Vui lòng nhập tên tour';
        if (!form.idDestination) e.idDestination = 'Vui lòng chọn điểm đến';
        if (!form.adultPrice || Number(form.adultPrice) < 0) e.adultPrice = 'Giá không hợp lệ';
        if (!form.childPrice || Number(form.childPrice) < 0) e.childPrice = 'Giá không hợp lệ';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        setSaving(true);
        try {
            const dto = { tourName: form.tourName, describe: form.describe, adultPrice: parseFloat(form.adultPrice), childPrice: parseFloat(form.childPrice), status: form.status, idDestination: parseInt(form.idDestination) };
            
            const fd = new FormData();
            fd.append('dto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
            if (imageFile) fd.append('file', imageFile);

            if (editTour) {
                // Sửa tour: PUT (truyền FormData)
                const res = await axiosClient.put(`/tours/${editTour.id}`, fd);
                const msg = (typeof res.data === 'string' ? res.data : res.data?.message) || 'Sửa tour thành công!';
                if (showNotification) showNotification(msg, 'success');
                onSuccess(); // Báo cập nhật xong
                onClose();
            } else {
                // Thêm tour: POST (truyền FormData)
                const res = await axiosClient.post('/tours', fd);
                const msg = (typeof res.data === 'string' ? res.data : res.data?.message) || 'Thêm tour thành công!';
                if (showNotification) showNotification(msg, 'success');
                onSuccess(res.data?.idTour); // Chuyển đến trang chi tiết
                onClose();
            }
        } catch (err) {
            let msg = 'Có lỗi xảy ra. Vui lòng thử lại.';
            if (err.response?.data) {
                msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || msg);
            }
            if (showNotification) {
                showNotification(msg, 'error');
            } else {
                alert(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={`${styles['modal-dialog']} ${styles['modal-lg']}`} onClick={e => e.stopPropagation()}>
                <div className={styles['modal-content']}>
                    <div className={styles['modal-header']}>
                        <h3><i className={editTour ? "fas fa-edit" : "fas fa-plus-circle"} /> {editTour ? 'Chỉnh sửa tour' : 'Thêm tour mới'}</h3>
                        <button className={styles['btn-close-modal']} onClick={onClose}><i className="fas fa-times" /></button>
                    </div>
                    <div className={styles['modal-body']}>
                        {/* Thông tin cơ bản */}
                        <div className={styles['form-section']}>
                            <h4><i className="fas fa-info-circle" /> Thông tin cơ bản</h4>
                            <div className={styles['form-row']}>
                                <div className={styles['form-group']}>
                                    <label>Tên Tour <span className={styles['required']}>*</span></label>
                                    <input type="text" name="tourName" value={form.tourName} onChange={handleChange} />
                                    {errors.tourName && <span className={styles['field-error']}>{errors.tourName}</span>}
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Trạng thái <span className={styles['required']}>*</span></label>
                                    <select name="status" value={form.status} onChange={handleChange}>
                                        <option value={STATUS_ACTIVE}>Đang mở</option>
                                        <option value={STATUS_INACTIVE}>Tạm dừng</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles['form-group']}>
                                <label>
                                    Điểm đến <span className={styles['required']}>*</span>
                                    {destLoading && <i className="fas fa-spinner fa-spin" style={{ marginLeft: '0.4rem', color: '#FF6B35', fontSize: '0.8rem' }} />}
                                </label>
                                <select
                                    name="idDestination"
                                    value={form.idDestination}
                                    onChange={handleChange}
                                    disabled={destLoading}
                                >
                                    {destLoading
                                        ? <option value="">Đang tải danh sách điểm đến...</option>
                                        : destError
                                            ? <option value="">⚠ {destError}</option>
                                            : (
                                                <>
                                                    <option value="">-- Chọn điểm đến --</option>
                                                    {destinations.map(d => (
                                                        <option key={d.id} value={d.id}>{d.city}</option>
                                                    ))}
                                                </>
                                            )
                                    }
                                </select>
                                {destError && !destLoading && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', fontSize: '0.78rem', color: '#C05621' }}>
                                        <i className="fas fa-exclamation-circle" />
                                        {destError}
                                        <button
                                            type="button"
                                            onClick={loadDestinations}
                                            style={{ background: 'none', border: 'none', color: '#FF6B35', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '0.78rem' }}
                                        >
                                            Thử lại
                                        </button>
                                    </span>
                                )}
                                {errors.idDestination && <span className={styles['field-error']}>{errors.idDestination}</span>}
                            </div>
                            <div className={styles['form-group']}>
                                <label>Mô tả</label>
                                <textarea name="describe" value={form.describe} onChange={handleChange} rows={3} />
                            </div>
                        </div>
                        {/* Giá */}
                        <div className={styles['form-section']}>
                            <h4><i className="fas fa-tags" /> Giá tour</h4>
                            <div className={styles['form-row']}>
                                <div className={styles['form-group']}>
                                    <label>Giá người lớn (VNĐ) <span className={styles['required']}>*</span></label>
                                    <input type="number" name="adultPrice" value={form.adultPrice} onChange={handleChange} min="0" />
                                    {errors.adultPrice && <span className={styles['field-error']}>{errors.adultPrice}</span>}
                                </div>
                                <div className={styles['form-group']}>
                                    <label>Giá trẻ em (VNĐ) <span className={styles['required']}>*</span></label>
                                    <input type="number" name="childPrice" value={form.childPrice} onChange={handleChange} min="0" />
                                    {errors.childPrice && <span className={styles['field-error']}>{errors.childPrice}</span>}
                                </div>
                            </div>
                        </div>
                        {/* Hình ảnh */}
                        <div className={styles['form-section']}>
                            <h4><i className="fas fa-image" /> Hình ảnh chính</h4>
                            <div className={styles['form-group']}>
                                <label className={styles['upload-label']}>
                                    <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
                                    <i className="fas fa-cloud-upload-alt" />
                                    <span>{imageFile ? imageFile.name : (editTour ? 'Nhấn để chọn ảnh mới (sẽ thay thế ảnh cũ)' : 'Nhấn để chọn ảnh từ thiết bị')}</span>
                                </label>
                                {imagePreview && <div className={styles['image-preview']}><img src={imagePreview} alt="preview" /></div>}
                            </div>
                        </div>
                    </div>
                    <div className={styles['modal-footer']}>
                        <button className={styles['btn-secondary']} onClick={onClose} disabled={saving}>Hủy</button>
                        <button className={styles['btn-primary']} onClick={handleSubmit} disabled={saving}>
                            {saving ? <><i className="fas fa-spinner fa-spin" /> Đang lưu...</> : <><i className={editTour ? "fas fa-save" : "fas fa-plus"} /> {editTour ? 'Lưu thay đổi' : 'Thêm tour'}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── NotificationModal ───────────────────────────────────────────────
const NotificationModal = ({ isOpen, message, type, onClose }) => {
    if (!isOpen) return null;
    
    const isSuccess = type === 'success';
    const iconClass = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    const title = isSuccess ? 'Thành công' : 'Lỗi';
    const color = isSuccess ? '#04AA8A' : '#E53E3E';

    return (
        <div className={styles['modal-overlay']} onClick={onClose} style={{ zIndex: 9999 }}>
            <div className={`${styles['modal-dialog']} ${styles['modal-sm']}`} onClick={e => e.stopPropagation()} style={{ animation: 'slideIn 0.3s ease-out' }}>
                <div className={styles['modal-content']}>
                    <div className={styles['modal-body']} style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                        <i className={iconClass} style={{ fontSize: '4rem', color: color, marginBottom: '1.2rem', display: 'block' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2D3748', fontSize: '1.5rem' }}>{title}</h3>
                        <p style={{ color: '#4A5568', fontSize: '1rem', margin: 0, lineHeight: '1.5' }}>{message}</p>
                    </div>
                    <div className={styles['modal-footer']} style={{ justifyContent: 'center', borderTop: 'none', paddingBottom: '1.5rem' }}>
                        <button 
                            className={styles['btn-primary']} 
                            onClick={onClose} 
                            style={{ backgroundColor: color, padding: '0.6rem 2rem', borderRadius: '50px' }}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── DeleteModal ───────────────────────────────────────────────
const DeleteModal = ({ isOpen, tour, onClose, onConfirm, deleting }) => {
    if (!isOpen || !tour) return null;
    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div className={`${styles['modal-dialog']} ${styles['modal-sm']}`} onClick={e => e.stopPropagation()}>
                <div className={styles['modal-content']}>
                    <div className={`${styles['modal-header']} ${styles['danger']}`}>
                        <h3><i className="fas fa-exclamation-triangle" /> Xác nhận xóa</h3>
                        <button className={styles['btn-close-modal']} onClick={onClose}><i className="fas fa-times" /></button>
                    </div>
                    <div className={styles['modal-body']}>
                        <p style={{ color: '#4A5568' }}>Bạn có chắc chắn muốn xóa tour này?</p>
                        <div className={styles['delete-info']}>
                            <strong>{tour.tourName}</strong><br />
                            <span style={{ color: '#718096', fontSize: '0.85rem' }}>#{tour.id} • {tour.city}</span>
                        </div>
                        <div className={styles['warning-box']}><i className="fas fa-info-circle" /> Hành động này không thể hoàn tác!</div>
                    </div>
                    <div className={styles['modal-footer']}>
                        <button className={styles['btn-secondary']} onClick={onClose} disabled={deleting}>Hủy</button>
                        <button className={styles['btn-danger']} onClick={onConfirm} disabled={deleting}>
                            {deleting ? <><i className="fas fa-spinner fa-spin" /> Đang xóa...</> : <><i className="fas fa-trash" /> Xóa tour</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Pagination ────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, totalElements, onPageChange }) => {
    if (totalPages === 0) return null;
    const start = currentPage * PAGE_SIZE + 1;
    const end = Math.min((currentPage + 1) * PAGE_SIZE, totalElements);
    const pages = [];
    for (let i = 0; i < totalPages; i++) pages.push(i);
    const visible = pages.filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1);
    return (
        <div className={styles['pagination']}>
            <div className={styles['pagination-info']}>Hiển thị <strong>{start}–{end}</strong> / <strong>{totalElements}</strong> tours</div>
            <div className={styles['pagination-buttons']}>
                <button className={styles['page-btn']} disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}><i className="fas fa-chevron-left" /></button>
                {visible.map((p, idx) => {
                    const prev = visible[idx - 1];
                    return (
                        <React.Fragment key={p}>
                            {prev != null && p - prev > 1 && <span className={styles['page-ellipsis']}>…</span>}
                            <button className={`${styles['page-btn']} ${p === currentPage ? styles['active'] : ''}`} onClick={() => onPageChange(p)}>{p + 1}</button>
                        </React.Fragment>
                    );
                })}
                <button className={styles['page-btn']} disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(currentPage + 1)}><i className="fas fa-chevron-right" /></button>
            </div>
        </div>
    );
};

// ── AdminTours (main page) ────────────────────────────────────
const AdminTours = () => {
    const navigate = useNavigate();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [cityInput, setCityInput] = useState('');
    const [searchKw, setSearchKw] = useState('');
    const [filterCity, setFilterCity] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [tourToEdit, setTourToEdit] = useState(null); // Tour đang được sửa
    const [deleteModal, setDeleteModal] = useState({ open: false, tour: null, deleting: false });
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, avgRating: '—' });
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ open: true, message, type });
    }, []);

    const fetchTours = useCallback(async (page = 0, status = '') => {
        setLoading(true); setError(null); setSelectedIds([]);
        try {
            const r = await axiosClient.get('/tours/status', { params: { status, page, size: PAGE_SIZE, sort: 'id,desc' } });
            const d = r.data;
            setTours(d.content || []);
            setCurrentPage(d.page ?? page);
            setTotalPages(d.totalPages ?? 1);
            setTotalElements(d.totalElements ?? 0);
        } catch { setError('Không thể tải dữ liệu. Vui lòng thử lại.'); }
        finally { setLoading(false); }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const r = await axiosClient.get('/tours/status', { params: { status: '', page: 0, size: 9999 } });
            const all = r.data.content || [];
            const active = all.filter(t => t.status === STATUS_ACTIVE).length;
            const ratings = all.filter(t => t.averageRating).map(t => Number(t.averageRating));
            const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
            setStats({ total: r.data.totalElements || all.length, active, inactive: all.length - active, avgRating: avg });
        } catch {}
    }, []);

    useEffect(() => { fetchTours(0, ''); fetchStats(); }, [fetchTours, fetchStats]);
    useEffect(() => { fetchTours(0, filterStatus); }, [filterStatus, fetchTours]);

    const displayed = tours.filter(t => {
        const kw = searchKw.toLowerCase();
        return (!kw || t.tourName?.toLowerCase().includes(kw) || t.city?.toLowerCase().includes(kw))
            && (!filterCity || t.city?.toLowerCase().includes(filterCity.toLowerCase()));
    });

    const handleSuccess = (idTour) => {
        if (idTour) {
            // Trường hợp thêm mới, idTour sẽ tồn tại -> chuyển đến trang chi tiết
            navigate(`/admin/tours/${idTour}`);
        } else {
            // Trường hợp sửa thành công -> fetch lại dữ liệu
            fetchTours(currentPage, filterStatus); fetchStats();
        }
    };

    const openCreateModal = () => {
        setTourToEdit(null);
        setModalOpen(true);
    };

    const openEditModal = (tour) => {
        setTourToEdit(tour);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        setDeleteModal(p => ({ ...p, deleting: true }));
        try {
            const res = await axiosClient.delete(`/tours/${deleteModal.tour.id}`);
            setDeleteModal({ open: false, tour: null, deleting: false });
            const msg = (typeof res.data === 'string' ? res.data : res.data?.message) || 'Xóa tour thành công!';
            showNotification(msg, 'success');
            fetchTours(currentPage, filterStatus); fetchStats();
        } catch (err) { 
            let msg = 'Không thể xóa. Vui lòng thử lại.';
            if (err.response?.data) {
                msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || msg);
            }
            setDeleteModal(p => ({ ...p, deleting: false })); 
            showNotification(msg, 'error');
        }
    };

    const statCards = [
        { label: 'Tổng tour', value: stats.total, icon: 'fa-map-marked-alt', bg: 'linear-gradient(135deg,#667EEA,#764BA2)' },
        { label: 'Đang mở', value: stats.active, sub: stats.total > 0 ? `${Math.round(stats.active / stats.total * 100)}%` : '0%', icon: 'fa-check-circle', bg: 'linear-gradient(135deg,#06D6A0,#04AA8A)' },
        { label: 'Tạm dừng', value: stats.inactive, sub: stats.total > 0 ? `${Math.round(stats.inactive / stats.total * 100)}%` : '0%', icon: 'fa-pause-circle', bg: 'linear-gradient(135deg,#FFD23F,#FF6B35)' },
        { label: 'Đánh giá TB', value: stats.avgRating, icon: 'fa-star', bg: 'linear-gradient(135deg,#FF6B35,#EF476F)' },
    ];

    return (
        <AdminLayout>
            <div className={styles['page-header']}>
                <div className={styles['header-content']}>
                    <h1>Quản lý Tour</h1>
                    <p>Thêm, sửa, xóa và quản lý tất cả các tour du lịch</p>
                </div>
                <div className={styles['header-actions']}>
                    <button className={styles['btn-primary']} onClick={openCreateModal}>
                        <i className="fas fa-plus" /> Thêm tour mới
                    </button>
                </div>
            </div>

            <div className={styles['stats-grid']}>
                {statCards.map(c => (
                    <div key={c.label} className={styles['stat-card']}>
                        <div className={styles['stat-icon']} style={{ background: c.bg }}><i className={`fas ${c.icon}`} /></div>
                        <div className={styles['stat-content']}>
                            <div className={styles['stat-label']}>{c.label}</div>
                            <div className={styles['stat-value']}>{c.value}</div>
                            {c.sub && <div className={styles['stat-change']}>{c.sub} tổng số</div>}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles['content-card']}>
                <div className={styles['filters-bar']}>
                    <div className={styles['filters-left']}>
                        <div className={styles['filter-group']}>
                            <i className="fas fa-search" />
                            <input type="text" placeholder="Tìm tên tour..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setSearchKw(searchInput), setFilterCity(cityInput))} />
                        </div>
                        <div className={styles['filter-group']}>
                            <i className="fas fa-map-marker-alt" />
                            <input type="text" placeholder="Lọc thành phố..." value={cityInput} onChange={e => setCityInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setSearchKw(searchInput), setFilterCity(cityInput))} />
                        </div>
                        <div className={styles['filter-group']}>
                            <i className="fas fa-toggle-on" />
                            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="">Tất cả trạng thái</option>
                                <option value={STATUS_ACTIVE}>Đang mở</option>
                                <option value={STATUS_INACTIVE}>Tạm dừng</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles['filters-right']}>
                        <button className={styles['btn-filter']} onClick={() => { setSearchKw(searchInput); setFilterCity(cityInput); }}><i className="fas fa-filter" /> Lọc</button>
                        <button className={styles['btn-reset']} onClick={() => { setSearchInput(''); setCityInput(''); setSearchKw(''); setFilterCity(''); setFilterStatus(''); }}><i className="fas fa-redo" /> Đặt lại</button>
                    </div>
                </div>

                <div className={styles['table-container']}>
                    <table className={styles['data-table']}>
                        <thead>
                            <tr>
                                <th style={{ width: 50 }}><input type="checkbox" onChange={e => setSelectedIds(e.target.checked ? displayed.map(t => t.id) : [])} checked={selectedIds.length > 0 && selectedIds.length === displayed.length} ref={el => { if (el) el.indeterminate = selectedIds.length > 0 && selectedIds.length < displayed.length; }} /></th>
                                <th>Thông tin tour</th>
                                <th>Điểm đến</th>
                                <th>Giá</th>
                                <th>Đánh giá</th>
                                <th>Trạng thái</th>
                                <th style={{ width: 110 }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7}><div className={styles['loading-spinner']}><i className="fas fa-circle-notch" /><span>Đang tải...</span></div></td></tr>
                            ) : error ? (
                                <tr><td colSpan={7}><div className={styles['error-state']}><i className="fas fa-exclamation-circle" /><span>{error}</span><button className={styles['btn-retry']} onClick={() => fetchTours(currentPage, filterStatus)}><i className="fas fa-redo" /> Thử lại</button></div></td></tr>
                            ) : displayed.length === 0 ? (
                                <tr><td colSpan={7}><div className={styles['empty-state']}><i className="fas fa-map-marked-alt" /><p>Không tìm thấy tour nào</p></div></td></tr>
                            ) : displayed.map(tour => (
                                <TourRow key={tour.id} tour={tour} isSelected={selectedIds.includes(tour.id)} onSelect={id => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])} onDelete={t => setDeleteModal({ open: true, tour: t, deleting: false })} onEdit={t => openEditModal(t)} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedIds.length > 0 && (
                    <div className={styles['bulk-actions']}>
                        <span className={styles['selected-count']}>Đã chọn <strong>{selectedIds.length}</strong> tour</span>
                        <div className={styles['bulk-buttons']}>
                            <button className={`${styles['btn-bulk']} ${styles['danger']}`}><i className="fas fa-trash" /> Xóa</button>
                        </div>
                    </div>
                )}

                {!loading && !error && <Pagination currentPage={currentPage} totalPages={totalPages} totalElements={totalElements} onPageChange={p => fetchTours(p, filterStatus)} />}
            </div>

            <TourModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={handleSuccess} showNotification={showNotification} editTour={tourToEdit} />
            <DeleteModal isOpen={deleteModal.open} tour={deleteModal.tour} onClose={() => setDeleteModal({ open: false, tour: null, deleting: false })} onConfirm={handleDelete} deleting={deleteModal.deleting} />
            <NotificationModal isOpen={notification.open} message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, open: false })} />
        </AdminLayout>
    );
};

export default AdminTours;
