import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, className = '', type = 'button', whileHover = {}, whileTap = {}, ...rest }) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            className={`transition-colors duration-200 ${className}`}
            whileHover={Object.keys(whileHover).length > 0 ? whileHover : { scale: 1.05 }}
            whileTap={Object.keys(whileTap).length > 0 ? whileTap : { scale: 0.95 }}
            {...rest}
        >
            {children}
        </motion.button>
    );
};

export default Button;