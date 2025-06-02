// src/components/FilterBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const FilterBar = ({ options, currentOption, onOptionClick, useNavLink = false }) => {  
  return (
    <div className="w-full mb-8 flex justify-center">
      <div className="flex space-x-2">
        {options.map((option) => {
          // *** THE FIX IS HERE ***
          // 1. Alias the icon to a variable starting with a capital letter.
          const IconComponent = option.icon;

          const buttonContent = (
            <div className="flex items-center">
              <span className={currentOption === option.id ? "mr-2" : ""}>
                {/* 2. Check the type and render the capitalized variable as a component. */}
                {typeof IconComponent === 'function' 
                  ? <IconComponent size={18} /> 
                  : IconComponent // This handles string emojis like '⭐'
                }
              </span>
              {currentOption === option.id && <span>{option.label}</span>}
            </div>
          );
          
          const commonClasses = `flex items-center justify-center rounded-full transition-all
            ${currentOption === option.id
              ? 'bg-blue-500 text-white px-5 py-3'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 p-3'
            }
            ${currentOption === option.id ? 'min-w-20' : 'aspect-square'} flex-shrink-0`;
          
          return useNavLink ? (
            <NavLink
              key={option.id}
              to={option.path}
              className={commonClasses}
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