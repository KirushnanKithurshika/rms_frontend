import React, { forwardRef } from 'react'; // Import forwardRef from React
import './DropdownButton.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const DropdownButton = forwardRef((props, ref) => {
    const { selectedItem, open, toggle } = props; // Destructure selectedItem from props
    
    return (
        <div 
            onClick={toggle}
            className={`dropdown-btn ${open ? 'button-open' : ''}`}
            ref={ref}
        >
            <span className="dropdown-button-text">{selectedItem}</span> {/* Use selectedItem here */}
            <span className="Arrow-icons">
                {open ? <FaChevronUp /> : <FaChevronDown />}
            </span>
        </div>
    );
});

export default DropdownButton;
