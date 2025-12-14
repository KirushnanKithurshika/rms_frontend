import './pagination.css';
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const Pagination = () => {
    return (
        <div className="custom-pagination">
            <div className="pagination-left">
                <span className="pagination-label">Rows per page</span>
                <select className="pagination-select">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                </select>

                <span className="pagination-count">of 140 rows</span>
            </div>

            <div className="pagination-right">
                <button className="page-btn"><FaAngleDoubleLeft /></button>
                <button className="page-btn"><FaAngleLeft /></button>

                <button className="page-number active">1</button>
                <button className="page-number">2</button>
                <button className="page-number">3</button>
                <span className="page-ellipsis">...</span>
                <button className="page-number">10</button>

                <button className="page-btn"><FaAngleRight /></button>
                <button className="page-btn"><FaAngleDoubleRight /></button>
            </div>
        </div>
    );
};

export default Pagination;
