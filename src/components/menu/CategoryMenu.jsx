import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@mdi/react';
import { mdiChevronDown } from '@mdi/js';

const CategoryMenu = ({ title, items, to }) => {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    const renderItems = (itemsToRender) => {
        return itemsToRender.map((item, index) => {
            if (item.items?.length) {
                const isLongSection = item.items.length > 10;
                return (
                    <li key={index} className={`nested-category ${isLongSection ? 'multi-column' : ''}`}>
                        <span className="nested-title">{item.text}</span>
                        <ul className="nested-items">{renderItems(item.items)}</ul>
                    </li>
                );
            }
            return (
                <li key={index}>
                    <Link to={item.to} onClick={() => setIsOpen(false)}>
                        {item.icon && <Icon path={item.icon} size={0.7} className="item-icon" style={{ marginRight: '8px', verticalAlign: 'middle', opacity: 0.7 }} />}
                        <span style={{ verticalAlign: 'middle' }}>{item.text}</span>
                    </Link>
                </li>
            );
        });
    };

    const isMegaMenu = items.some((item) => item.items?.length > 10);

    return (
        <div className="category-menu-wrapper" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <div className={`category-trigger ${isOpen ? 'active' : ''}`}>
                {to ? (
                    <Link to={to} className="category-link">
                        {title}
                    </Link>
                ) : (
                    <span>{title}</span>
                )}
                <Icon path={mdiChevronDown} size={0.6} className={`chevron ${isOpen ? 'rotated' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`category-dropdown ${isMegaMenu ? 'mega-menu' : ''}`}
                    >
                        {renderItems(items)}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryMenu;
