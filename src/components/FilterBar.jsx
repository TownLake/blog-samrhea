// src/components/FilterBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const FilterBar = ({ options, currentOption, onOptionClick, useNavLink = false }) => {  
  return (
    <div className="w-full mb-8 flex justify-center">
      <div className="flex space-x-2">
        {options.map((option) => {
          // Prepare the common content
          const buttonContent = (
            <div className="flex items-center">
              <span className={currentOption === option.id ? "mr-2" : ""}>{option.icon}</span>
              {currentOption === option.id && <span>{option.label}</span>}
            </div>
          );
          
          // Common classes for both button and NavLink
          const commonClasses = `flex items-center justify-center rounded-full transition-all
            ${currentOption === option.id
              ? 'bg-blue-500 text-white px-5 py-3'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 p-3'
            }
            ${currentOption === option.id ? 'min-w-20' : 'aspect-square'} flex-shrink-0`;
          
          // Return either NavLink or button based on the prop
          return useNavLink ? (
            <NavLink
              key={option.id}
              to={option.path}
              className={({ isActive }) => commonClasses}
            >
              {buttonContent}
            </NavLink>
          ) : (
            <button
              key={option.id}
              onClick={() => onOptionClick(option.id)}
              className={commonClasses}
            >
              {buttonContent}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;