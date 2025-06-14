import React, { forwardRef } from 'react'; 
import './dropdownlanbtn.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const DropdownButton = forwardRef((props, ref) => {
    const { selectedItem, open, toggle } = props; 
    
    return (
        <div 
            onClick={toggle}
            className={`dropdown-btn ${open ? 'button-open' : ''}`}
            ref={ref}
        >
            <span className="dropdown-button-text">{selectedItem}</span> 
            <span className="Arrow-icons">
                {open ? <FaChevronUp /> : <FaChevronDown />}
            </span>
        </div>
    );
});

export default DropdownButton;
