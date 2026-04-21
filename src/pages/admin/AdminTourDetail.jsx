import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axiosClient from '../../services/api';
import s from '../../styles/adminTourDetail.module.css';
import sharedStyles from '../../styles/adminTour.module.css'; // Để dùng chung style Modal

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

// ── NotificationModal ───────────────────────────────────────────────
const NotificationModal = ({ isOpen, message, type, onClose }) => {
    if (!isOpen) return null;
    
    const isSuccess = type === 'success';
    const iconClass = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    const title = isSuccess ? 'Thành công' : 'Lỗi';
    const color = isSuccess ? '#04AA8A' : '#E53E3E';

    return (
        <div className={sharedStyles['modal-overlay']} onClick={onClose} style={{ zIndex: 9999 }}>
            <div className={`${sharedStyles['modal-dialog']} ${sharedStyles['modal-sm']}`} onClick={e => e.stopPropagation()} style={{ animation: 'slideIn 0.3s ease-out' }}>
                <div className={sharedStyles['modal-content']}>
                    <div className={sharedStyles['modal-body']} style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
                        <i className={iconClass} style={{ fontSize: '4rem', color: color, marginBottom: '1.2rem', display: 'block' }} />
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#2D3748', fontSize: '1.5rem' }}>{title}</h3>
                        <p style={{ color: '#4A5568', fontSize: '1rem', margin: 0, lineHeight: '1.5' }}>{message}</p>
                    </div>
                    <div className={sharedStyles['modal-footer']} style={{ justifyContent: 'center', borderTop: 'none', paddingBottom: '1.5rem' }}>
                        <button 
                            className={sharedStyles['btn-primary']} 
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
const DeleteModal = ({ isOpen, itemId, title, message, btnText, onClose, onConfirm, deleting }) => {
    if (!isOpen || !itemId) return null;
    return (
        <div className={sharedStyles['modal-overlay']} onClick={onClose} style={{ zIndex: 9999 }}>
            <div className={`${sharedStyles['modal-dialog']} ${sharedStyles['modal-sm']}`} onClick={e => e.stopPropagation()}>
                <div className={sharedStyles['modal-content']}>
                    <div className={`${sharedStyles['modal-header']} ${sharedStyles['danger']}`}>
                        <h3><i className="fas fa-exclamation-triangle" /> {title || 'Xác nhận xóa'}</h3>
                        <button className={sharedStyles['btn-close-modal']} onClick={onClose}><i className="fas fa-times" /></button>
                    </div>
                    <div className={sharedStyles['modal-body']}>
                        <p style={{ color: '#4A5568' }}>{message || 'Bạn có chắc chắn muốn xóa không?'}</p>
                        <div className={sharedStyles['warning-box']} style={{ marginTop: '1rem' }}><i className="fas fa-info-circle" /> Hành động này không thể hoàn tác!</div>
                    </div>
                    <div className={sharedStyles['modal-footer']}>
                        <button className={sharedStyles['btn-secondary']} onClick={onClose} disabled={deleting}>Hủy</button>
                        <button className={sharedStyles['btn-danger']} onClick={onConfirm} disabled={deleting}>
                            {deleting ? <><i className="fas fa-spinner fa-spin" /> Đang xóa...</> : <><i className="fas fa-trash" /> {btnText || 'Xóa'}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── ScheduleModal ───────────────────────────────────────────────
const ScheduleModal = ({ isOpen, onClose, onSuccess, showNotification, idTour }) => {
    const [form, setForm] = useState({ startDate: '', startTime: '', endDate: '', endTime: '', idHuongDanVien: '', maxGuest: '' });
    const [schedules, setSchedules] = useState([]);

    const [guides, setGuides] = useState([]);
    const [loadingGuides, setLoadingGuides] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setForm({ startDate: '', startTime: '', endDate: '', endTime: '', idHuongDanVien: '', maxGuest: '' });
            setSchedules([]);
            setErrors({});
            fetchGuides();
        }
    }, [isOpen]);

    const fetchGuides = async () => {
        setLoadingGuides(true);
        try {
            const res = await axiosClient.get('/users/guides');
            setGuides(res.data || []);
        } catch (err) {
            showNotification('Không thể tải danh sách hướng dẫn viên', 'error');
        } finally {
            setLoadingGuides(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: undefined }));
    };

    const handleAddScheduleItem = () => {
        setSchedules(prev => [...prev, { id: Date.now(), date: '', time: '', work: '', describe: '' }]);
    };

    const handleRemoveScheduleItem = (id) => {
        setSchedules(prev => prev.filter(s => s.id !== id));
    };

    const handleScheduleItemChange = (id, field, value) => {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
        setErrors(p => {
            const newErrs = { ...p };
            Object.keys(newErrs).forEach(k => {
                if (k.startsWith('schedule_')) delete newErrs[k]; // Xóa lỗi cũ khi sửa
            });
            return newErrs;
        });
    };

    const validate = () => {
        const e = {};
        if (!form.startDate) e.startDate = 'Vui lòng chọn ngày khởi hành';
        if (!form.startTime) e.startTime = 'Vui lòng chọn giờ khởi hành';
        if (!form.endDate) e.endDate = 'Vui lòng chọn ngày về';
        if (!form.endTime) e.endTime = 'Vui lòng chọn giờ về';
        if (!form.maxGuest || Number(form.maxGuest) <= 0) e.maxGuest = 'Số khách tối đa phải > 0';
        if (!form.idHuongDanVien) e.idHuongDanVien = 'Vui lòng chọn hướng dẫn viên';
        
        if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
            e.endDate = 'Ngày về không được trước ngày khởi hành';
        }
        
        schedules.forEach((item, idx) => {
            if (!item.date) e[`schedule_${idx}_date`] = 'Vui lòng chọn ngày';
            if (!item.time) e[`schedule_${idx}_time`] = 'Vui lòng chọn giờ';
            if (!item.work.trim()) e[`schedule_${idx}_work`] = 'Vui lòng nhập hoạt động';
        });

        return e;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        
        setSaving(true);
        try {
            const payload = {
                startDate: form.startDate,
                startTime: form.startTime,
                endDate: form.endDate,
                endTime: form.endTime,
                idHuongDanVien: parseInt(form.idHuongDanVien),
                maxGuest: parseInt(form.maxGuest),
                schedules: schedules.map(s => ({
                    date: s.date,
                    time: s.time,
                    work: s.work,
                    describe: s.describe
                }))
            };
            const res = await axiosClient.post(`/departureSchedules/${idTour}`, payload);
            const msg = (typeof res.data === 'string' ? res.data : res.data?.message) || 'Thêm lịch khởi hành thành công!';
            showNotification(msg, 'success');
            onSuccess();
            onClose();
        } catch (err) {
            let msg = 'Thêm lịch thất bại.';
            if (err.response?.data) {
                msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || msg);
            }
            showNotification(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className={sharedStyles['modal-overlay']} onClick={onClose} style={{ zIndex: 999 }}>
            <div className={`${sharedStyles['modal-dialog']} ${sharedStyles['modal-lg']}`} onClick={e => e.stopPropagation()}>
                <div className={sharedStyles['modal-content']}>
                    <div className={sharedStyles['modal-header']}>
                        <h3><i className="fas fa-calendar-plus" /> Thêm lịch khởi hành</h3>
                        <button className={sharedStyles['btn-close-modal']} onClick={onClose}><i className="fas fa-times" /></button>
                    </div>
                    <div className={sharedStyles['modal-body']}>
                        <div className={sharedStyles['form-section']}>
                            <h4><i className="fas fa-clock" /> Thời gian</h4>
                            <div className={sharedStyles['form-row']}>
                                <div className={sharedStyles['form-group']}>
                                    <label>Ngày khởi hành <span className={sharedStyles['required']}>*</span></label>
                                    <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
                                    {errors.startDate && <span className={sharedStyles['field-error']}>{errors.startDate}</span>}
                                </div>
                                <div className={sharedStyles['form-group']}>
                                    <label>Giờ khởi hành <span className={sharedStyles['required']}>*</span></label>
                                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} />
                                    {errors.startTime && <span className={sharedStyles['field-error']}>{errors.startTime}</span>}
                                </div>
                            </div>
                            <div className={sharedStyles['form-row']}>
                                <div className={sharedStyles['form-group']}>
                                    <label>Ngày về <span className={sharedStyles['required']}>*</span></label>
                                    <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
                                    {errors.endDate && <span className={sharedStyles['field-error']}>{errors.endDate}</span>}
                                </div>
                                <div className={sharedStyles['form-group']}>
                                    <label>Giờ về <span className={sharedStyles['required']}>*</span></label>
                                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange} />
                                    {errors.endTime && <span className={sharedStyles['field-error']}>{errors.endTime}</span>}
                                </div>
                            </div>
                        </div>

                        <div className={sharedStyles['form-section']}>
                            <h4><i className="fas fa-users" /> Nhân sự & Chỗ ngồi</h4>
                            <div className={sharedStyles['form-row']}>
                                <div className={sharedStyles['form-group']}>
                                    <label>Hướng dẫn viên <span className={sharedStyles['required']}>*</span></label>
                                    <select name="idHuongDanVien" value={form.idHuongDanVien} onChange={handleChange} disabled={loadingGuides}>
                                        <option value="">-- Chọn hướng dẫn viên --</option>
                                        {guides.map(g => (
                                            <option key={g.id} value={g.id}>{g.fullName || g.userName}</option>
                                        ))}
                                    </select>
                                    {loadingGuides && <small style={{ color: '#718096', display: 'block', marginTop: '0.3rem' }}><i className="fas fa-spinner fa-spin"/> Đang tải HDV...</small>}
                                    {errors.idHuongDanVien && <span className={sharedStyles['field-error']}>{errors.idHuongDanVien}</span>}
                                </div>
                                <div className={sharedStyles['form-group']}>
                                    <label>Số khách tối đa <span className={sharedStyles['required']}>*</span></label>
                                    <input type="number" name="maxGuest" value={form.maxGuest} onChange={handleChange} min="1" />
                                    {errors.maxGuest && <span className={sharedStyles['field-error']}>{errors.maxGuest}</span>}
                                </div>
                            </div>
                        </div>

                        <div className={sharedStyles['form-section']}>
                            <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span><i className="fas fa-list-ul" /> Lịch trình chi tiết</span>
                                <button type="button" onClick={handleAddScheduleItem} className={sharedStyles['btn-primary']} style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>
                                    <i className="fas fa-plus" /> Thêm hoạt động
                                </button>
                            </h4>
                            {schedules.length === 0 ? (
                                <p style={{ color: '#718096', fontSize: '0.9rem', fontStyle: 'italic', margin: '0.5rem 0' }}>Chưa có hoạt động nào trong lịch trình. Hãy bấm "Thêm hoạt động" để tạo mới.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    {schedules.map((s, idx) => (
                                        <div key={s.id} style={{ background: '#F7FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0', position: 'relative' }}>
                                            <button type="button" onClick={() => handleRemoveScheduleItem(s.id)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background='#FED7D7'} onMouseLeave={e => e.currentTarget.style.background='none'} title="Xóa hoạt động">
                                                <i className="fas fa-trash" />
                                            </button>
                                            <h5 style={{ margin: '0 0 0.8rem 0', color: '#2D3748', fontSize: '0.95rem' }}>Hoạt động {idx + 1}</h5>
                                            
                                            <div className={sharedStyles['form-row']}>
                                                <div className={sharedStyles['form-group']}>
                                                    <label>Ngày <span className={sharedStyles['required']}>*</span></label>
                                                    <input type="date" value={s.date} onChange={e => handleScheduleItemChange(s.id, 'date', e.target.value)} />
                                                    {errors[`schedule_${idx}_date`] && <span className={sharedStyles['field-error']}>{errors[`schedule_${idx}_date`]}</span>}
                                                </div>
                                                <div className={sharedStyles['form-group']}>
                                                    <label>Giờ <span className={sharedStyles['required']}>*</span></label>
                                                    <input type="time" value={s.time} onChange={e => handleScheduleItemChange(s.id, 'time', e.target.value)} />
                                                    {errors[`schedule_${idx}_time`] && <span className={sharedStyles['field-error']}>{errors[`schedule_${idx}_time`]}</span>}
                                                </div>
                                            </div>
                                            
                                            <div className={sharedStyles['form-group']}>
                                                <label>Hoạt động <span className={sharedStyles['required']}>*</span></label>
                                                <input type="text" value={s.work} onChange={e => handleScheduleItemChange(s.id, 'work', e.target.value)} placeholder="Ví dụ: Tham quan bảo tàng, Ăn trưa..." />
                                                {errors[`schedule_${idx}_work`] && <span className={sharedStyles['field-error']}>{errors[`schedule_${idx}_work`]}</span>}
                                            </div>
                                            
                                            <div className={sharedStyles['form-group']} style={{ marginBottom: 0 }}>
                                                <label>Mô tả chi tiết</label>
                                                <textarea rows={2} value={s.describe} onChange={e => handleScheduleItemChange(s.id, 'describe', e.target.value)} placeholder="Nhập thêm chi tiết (tùy chọn)..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #CBD5E0', borderRadius: '4px', fontFamily: 'inherit', fontSize: '0.9rem' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={sharedStyles['modal-footer']}>
                        <button className={sharedStyles['btn-secondary']} onClick={onClose} disabled={saving}>Hủy</button>
                        <button className={sharedStyles['btn-primary']} onClick={handleSubmit} disabled={saving}>
                            {saving ? <><i className="fas fa-spinner fa-spin" /> Đang lưu...</> : <><i className="fas fa-plus" /> Thêm lịch</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── AdminTourDetail ───────────────────────────────────────────
const AdminTourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData]       = useState(null);   // TourDetailResponse
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // Modal states
    const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState({ open: false, imgId: null, deleting: false });
    const [deleteScheduleModal, setDeleteScheduleModal] = useState({ open: false, scheduleId: null, deleting: false });
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ open: true, message, type });
    }, []);

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
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const fd = new FormData();
            for (let i = 0; i < files.length; i++) {
                fd.append('files', files[i]);
            }
            await axiosClient.post(`/imagetours/${id}`, fd);
            await fetchDetail();
            showNotification('Thêm ảnh thành công!', 'success');
        } catch (err) { 
            showNotification(err.response?.data?.message || err.response?.data || 'Upload ảnh thất bại. Vui lòng thử lại.', 'error');
        } finally { 
            setUploading(false); 
            e.target.value = ''; 
        }
    };

    // ── Xóa ảnh phụ ─────────────────────────────────────────
    const handleDeleteClick = (imgId) => {
        setDeleteModal({ open: true, imgId, deleting: false });
    };

    const confirmDeleteImage = async () => {
        if (!deleteModal.imgId) return;
        setDeleteModal(p => ({ ...p, deleting: true }));
        try {
            const res = await axiosClient.delete(`/imagetours/${deleteModal.imgId}`);
            setDeleteModal({ open: false, imgId: null, deleting: false });
            
            const msg = (typeof res.data === 'string' ? res.data : res.data?.message) || 'Xóa ảnh thành công!';
            showNotification(msg, 'success');
            await fetchDetail();
        } catch (err) { 
            setDeleteModal(p => ({ ...p, deleting: false }));
            let msg = 'Xóa ảnh thất bại.';
            if (err.response?.data) {
                msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || msg);
            }
            showNotification(msg, 'error');
        }
    };

    // ── Xóa lịch khởi hành ──────────────────────────────────
    const handleDeleteScheduleClick = (scheduleId) => {
        setDeleteScheduleModal({ open: true, scheduleId, deleting: false });
    };

    const confirmDeleteSchedule = async () => {
        if (!deleteScheduleModal.scheduleId) return;
        setDeleteScheduleModal(p => ({ ...p, deleting: true }));
        try {
            const res = await axiosClient.delete(`/departureSchedules/${deleteScheduleModal.scheduleId}`);
            setDeleteScheduleModal({ open: false, scheduleId: null, deleting: false });
            
            const msg = (typeof res.data === 'string' ? res.data : res.data?.message) || 'Xóa lịch khởi hành thành công!';
            showNotification(msg, 'success');
            await fetchDetail();
        } catch (err) { 
            setDeleteScheduleModal(p => ({ ...p, deleting: false }));
            let msg = 'Xóa lịch thất bại.';
            if (err.response?.data) {
                msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || msg);
            }
            showNotification(msg, 'error');
        }
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
                        <i className="fas fa-images" /> Hình ảnh tour
                        <span style={{ fontWeight: 400, color: '#718096', fontSize: '0.85rem' }}>({images.length} ảnh)</span>
                    </h3>
                    <label className={s['btn-primary']} style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                        <input type="file" accept="image/*" multiple onChange={handleAddImage} style={{ display: 'none' }} disabled={uploading} />
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
                                        <button className={s['gallery-delete-btn']} onClick={() => handleDeleteClick(img.id)} title="Xóa ảnh">
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
                    <button className={s['btn-primary']} onClick={() => setScheduleModalOpen(true)}>
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
                                                    <button className={s['btn-icon-sm']} title="Xóa" onClick={() => handleDeleteScheduleClick(sc.id)}>
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

            <NotificationModal isOpen={notification.open} message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, open: false })} />
            <DeleteModal isOpen={deleteModal.open} itemId={deleteModal.imgId} message="Bạn có chắc chắn muốn xóa hình ảnh này không?" btnText="Xóa ảnh" deleting={deleteModal.deleting} onClose={() => setDeleteModal({ open: false, imgId: null, deleting: false })} onConfirm={confirmDeleteImage} />
            <DeleteModal isOpen={deleteScheduleModal.open} itemId={deleteScheduleModal.scheduleId} message="Bạn có chắc chắn muốn xóa lịch khởi hành này không?" btnText="Xóa lịch" deleting={deleteScheduleModal.deleting} onClose={() => setDeleteScheduleModal({ open: false, scheduleId: null, deleting: false })} onConfirm={confirmDeleteSchedule} />
            <ScheduleModal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} onSuccess={fetchDetail} showNotification={showNotification} idTour={id} />
        </AdminLayout>
    );
};

export default AdminTourDetail;
