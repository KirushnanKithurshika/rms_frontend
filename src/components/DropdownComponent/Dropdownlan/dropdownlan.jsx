import { useEffect, useState, useRef } from "react";
import DropdownButton from "../DropdownButton/DropdownButton";
import DropdownContent from "../DropdownContent/DropdownContent";
import DropdownItem from "../DropdownItem/DropdownItem"; 


const Dropdownlan = () => {
  const [open, setOpen] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [selectedItem, setSelectedItem] = useState("Select language"); 

  const dropdownRef = useRef();
  const buttonRef = useRef();
  const contentRef = useRef();


  
  const dropdownItems = [
    "Arabic",
    "English",
    
  ];

  const toggleDropdown = () => {
    if (!open) {
      const spaceRemaining =
        window.innerHeight - buttonRef.current.getBoundingClientRect().bottom;
      const contentHeight = contentRef.current.clientHeight;

      const topPosition =
        spaceRemaining > contentHeight
          ? null
          : -(contentHeight - spaceRemaining); 
      setDropdownTop(topPosition);
    }
    setOpen((prev) => !prev); 
  };

  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false); 
      }
    };

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler); 
    };
  }, [dropdownRef]);

  const handleItemClick = (item) => {
    setSelectedItem(item); 
    setOpen(false); 
  };

  return (
    <div ref={dropdownRef} className="dropdown">
      <DropdownButton ref={buttonRef} toggle={toggleDropdown} open={open} selectedItem={selectedItem}>
      </DropdownButton>
      <DropdownContent top={dropdownTop} ref={contentRef} open={open}>
        {dropdownItems.map((item, index) => (
          <DropdownItem key={index} onClick={() => handleItemClick(item)}>
            {item}
          </DropdownItem>
        ))}
      </DropdownContent>
    </div>
  );
};

export default Dropdownlan;
