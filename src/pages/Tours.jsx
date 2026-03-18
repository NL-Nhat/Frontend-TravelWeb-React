import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../services/api'; // Đường dẫn tới file cấu hình axios của bạn
import Header from '../components/Header';
import '../styles/tours.css';

const Tours = () => {
    // 1. Quản lý State
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    
    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 9;

    // Tìm kiếm, Lọc và Sắp xếp
    const [searchText, setSearchText] = useState('');
    const [sortOption, setSortOption] = useState('popular');
    const [filters, setFilters] = useState({
        city: [],
        priceFrom: 0,
        priceTo: 10000000,
        numberStar: []
    });

    // Các hằng số cho Filter UI
    const cities = ['Đà Nẵng', 'Hà Nội', 'Quảng Nam', 'Quảng Ninh', 'Kiên Giang'];
    const ratings = [5, 4, 3];

    // 2. Các hàm gọi API
    const fetchDefaultTours = async (page) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/tours/all-by-status`, {
                params: { page: page, size: pageSize }
            });
            // Ánh xạ dữ liệu dựa trên Map trả về từ Backend
            setTours(response.data.data || []); 
            setTotalPages(response.data.totalPages || 1);
            setTotalItems(response.data.total || 0);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách tour:", error);
        } finally {
            setLoading(false);
        }
    };

    const executeSearch = async (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (!searchText.trim()) {
                fetchDefaultTours(1);
                return;
            }
            setLoading(true);
            try {
                const response = await axiosClient.get(`/tours/search-tour`, {
                    params: { text: searchText }
                });
                setTours(response.data);
                setTotalPages(1); // API trả về List không phân trang
                setTotalItems(response.data.length);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const executeFilter = async () => {
        setLoading(true);
        try {
            // Tạo payload khớp với SearchRequestDTO
            const payload = {
                city: filters.city.length > 0 ? filters.city : null,
                priceFrom: filters.priceFrom,
                priceTo: filters.priceTo,
                numberStar: filters.numberStar.length > 0 ? filters.numberStar : null
                // dateFrom, dateTo có thể thêm vào đây nếu cần
            };

            const response = await axiosClient.post(`/tours/filter-tour`, payload);
            setTours(response.data);
            setTotalPages(1); // API trả về List không phân trang
            setTotalItems(response.data.length);
        } catch (error) {
            console.error("Lỗi khi lọc tour:", error);
        } finally {
            setLoading(false);
        }
    };

    // 3. Effects
    useEffect(() => {
        // Chỉ gọi default nếu đang không search/filter
        if (!searchText && filters.city.length === 0 && filters.numberStar.length === 0 && filters.priceTo === 10000000) {
            fetchDefaultTours(currentPage);
        }
    }, [currentPage]);

    // 4. Các hàm xử lý UI (Xử lý thay đổi Checkbox, Reset, Sort)
    const handleCityChange = (cityStr) => {
        setFilters(prev => ({
            ...prev,
            city: prev.city.includes(cityStr) 
                ? prev.city.filter(c => c !== cityStr) 
                : [...prev.city, cityStr]
        }));
    };

    const handleRatingChange = (star) => {
        setFilters(prev => ({
            ...prev,
            numberStar: prev.numberStar.includes(star)
                ? prev.numberStar.filter(s => s !== star)
                : [...prev.numberStar, star]
        }));
    };

    const resetFilters = () => {
        setSearchText('');
        setFilters({ city: [], priceFrom: 0, priceTo: 10000000, numberStar: [] });
        setCurrentPage(1);
        fetchDefaultTours(1);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Sắp xếp dữ liệu trên Frontend
    const sortedTours = [...tours].sort((a, b) => {
        switch (sortOption) {
            case 'price-asc': return a.adultPrice - b.adultPrice;
            case 'price-desc': return b.adultPrice - a.adultPrice;
            case 'rating-desc': return b.averageRating - a.averageRating;
            case 'newest': return b.id - a.id;
            default: return 0; // Phổ biến nhất (giữ nguyên)
        }
    });

    return (
        <>
            <Header />
            {/* Page Header */}
            <section className="page-header">
                <div className="container">
                    <h1>Khám Phá Tour Du Lịch</h1>
                    <p>Tìm kiếm và khám phá hơn {totalItems}+ tour du lịch độc đáo khắp Việt Nam</p>
                </div>
            </section>

            {/* Tours Listing */}
            <section className="tours-listing">
                <div className="container">
                    <div className="listing-layout">
                        
                        {/* Sidebar Filters */}
                        <aside className="filters-sidebar">
                            <div className="filter-section">
                                <h3 className="filter-title"><i className="fas fa-filter"></i> Bộ lọc</h3>
                                <button className="btn-reset" onClick={resetFilters}>
                                    <i className="fas fa-redo"></i> Đặt lại
                                </button>
                            </div>

                            {/* Tìm kiếm */}
                            <div className="filter-group">
                                <label className="filter-label">Tìm kiếm</label>
                                <div className="search-input">
                                    <i className="fas fa-search" onClick={executeSearch} style={{cursor: 'pointer'}}></i>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm tour..." 
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyDown={executeSearch}
                                    />
                                </div>
                            </div>

                            {/* Điểm đến */}
                            <div className="filter-group">
                                <label className="filter-label"><i className="fas fa-map-marker-alt"></i> Điểm đến</label>
                                <div className="filter-options">
                                    {cities.map(city => (
                                        <label key={city} className="checkbox-option">
                                            <input 
                                                type="checkbox" 
                                                checked={filters.city.includes(city)}
                                                onChange={() => handleCityChange(city)}
                                            />
                                            <span>{city}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Khoảng giá */}
                            <div className="filter-group">
                                <label className="filter-label"><i className="fas fa-money-bill-wave"></i> Khoảng giá (Tối đa)</label>
                                <div className="price-range">
                                    <input 
                                        type="range" 
                                        min="0" max="10000000" step="100000" 
                                        value={filters.priceTo}
                                        onChange={(e) => setFilters({...filters, priceTo: parseInt(e.target.value)})}
                                        onMouseUp={executeFilter} // Kéo xong tự động lọc
                                    />
                                    <div className="price-values">
                                        <span>0đ</span>
                                        <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{formatPrice(filters.priceTo)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Đánh giá */}
                            <div className="filter-group">
                                <label className="filter-label"><i className="fas fa-star"></i> Đánh giá</label>
                                <div className="filter-options">
                                    {ratings.map(star => (
                                        <label key={star} className="checkbox-option">
                                            <input 
                                                type="checkbox"
                                                checked={filters.numberStar.includes(star)}
                                                onChange={() => handleRatingChange(star)}
                                            />
                                            <span>
                                                {[...Array(5)].map((_, index) => (
                                                    <i key={index} className={index < star ? "fas fa-star" : "far fa-star"}></i>
                                                ))} 
                                                {star < 5 ? " trở lên" : ""}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Nút Áp dụng Filter */}
                            <button className="btn-primary" style={{width: '100%', marginTop: '1rem'}} onClick={executeFilter}>
                                Áp dụng bộ lọc
                            </button>
                        </aside>

                        {/* Main Content */}
                        <main className="tours-main">
                            {/* Toolbar */}
                            <div className="tours-toolbar">
                                <div className="results-info">
                                    <span className="results-count">Tìm thấy <strong>{totalItems}</strong> tour</span>
                                </div>
                                
                                <div className="toolbar-actions">
                                    <div className="sort-dropdown">
                                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                            <option value="popular">Sắp xếp: Phổ biến nhất</option>
                                            <option value="price-asc">Giá thấp đến cao</option>
                                            <option value="price-desc">Giá cao đến thấp</option>
                                            <option value="rating-desc">Đánh giá cao nhất</option>
                                            <option value="newest">Mới nhất</option>
                                        </select>
                                    </div>
                                    
                                    <div className="view-toggle">
                                        <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                                            <i className="fas fa-th"></i>
                                        </button>
                                        <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                                            <i className="fas fa-list"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tours Grid */}
                            {loading ? (
                                <div style={{textAlign: 'center', padding: '50px'}}>Đang tải dữ liệu...</div>
                            ) : sortedTours.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '50px'}}>Không tìm thấy tour nào phù hợp.</div>
                            ) : (
                                <div className={`tours-results ${viewMode === 'list' ? 'list-view' : ''}`}>
                                    {sortedTours.map((tour) => (
                                        <div key={tour.id} className="tour-item">
                                            <div className="tour-image">
                                                <img src={tour.tourImage || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"} alt={tour.tourName} />
                                                <button className="tour-favorite">
                                                    <i className="far fa-heart"></i>
                                                </button>
                                            </div>
                                            <div className="tour-info">
                                                <div className="tour-header">
                                                    <div className="tour-location">
                                                        <i className="fas fa-map-marker-alt"></i>
                                                        <span>{tour.destination}</span>
                                                    </div>
                                                    <div className="tour-rating">
                                                        <i className="fas fa-star"></i>
                                                        <span>{tour.averageRating || 0}</span>
                                                    </div>
                                                </div>
                                                <h3 className="tour-name">{tour.tourName}</h3>
                                                <p className="tour-desc">{tour.describe}</p>
                                                <div className="tour-features">
                                                    {tour.startDate && <span><i className="fas fa-calendar"></i> Khởi hành: {tour.startDate}</span>}
                                                    <span><i className="fas fa-users"></i> {tour.slot} chỗ</span>
                                                </div>
                                                <div className="tour-footer">
                                                    <div className="tour-price">
                                                        <span className="price-label">Từ</span>
                                                        <span className="price-value">{formatPrice(tour.adultPrice)}</span>
                                                    </div>
                                                    <div className="tour-actions">
                                                        <Link to={`/tour-detail/${tour.id}`} className="btn-detail">Chi tiết</Link>
                                                        <Link to={`/booking/${tour.id}`} className="btn-book-now">Đặt ngay</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && totalPages > 1 && (
                                <div className="pagination">
                                    <button 
                                        className="page-btn" 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                    
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button 
                                            key={i + 1} 
                                            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button 
                                        className="page-btn" 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                        </main>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Tours;