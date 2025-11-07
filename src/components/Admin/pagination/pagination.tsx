import './pagination.css';
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

type Props = {
    page: number; // 1-based
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
};

const Pagination: React.FC<Props> = ({ page, pageSize, total, onPageChange, onPageSizeChange }) => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 10)));
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);

    const goFirst = () => onPageChange(1);
    const goPrev = () => onPageChange(Math.max(1, page - 1));
    const goNext = () => onPageChange(Math.min(totalPages, page + 1));
    const goLast = () => onPageChange(totalPages);

    return (
        <div className="custom-pagination">
            <div className="pagination-left">
                <span className="pagination-label">Rows per page</span>
                <select
                    className="pagination-select"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>

                <span className="pagination-count">
                    {start}-{end} of {total}
                </span>
            </div>

            <div className="pagination-right">
                <button className="page-btn" onClick={goFirst} disabled={page === 1} aria-label="First page"><FaAngleDoubleLeft /></button>
                <button className="page-btn" onClick={goPrev} disabled={page === 1} aria-label="Previous page"><FaAngleLeft /></button>

                <button className="page-number active" aria-current="page">{page}</button>
                <span className="page-ellipsis">/ {totalPages}</span>

                <button className="page-btn" onClick={goNext} disabled={page >= totalPages} aria-label="Next page"><FaAngleRight /></button>
                <button className="page-btn" onClick={goLast} disabled={page >= totalPages} aria-label="Last page"><FaAngleDoubleRight /></button>
            </div>
        </div>
    );
};

export default Pagination;
