// src/components/FilterBar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const FilterBar = ({ options, currentOption, onOptionClick, useNavLink = false }) => {  
  return (
    <div className="w-full mb-8 flex justify-center">
      <div className="flex space-x-2">
        {options.map((option) => {
          // Get the icon from the option. It could be a string (emoji) or a component.
          const Icon = option.icon;

          // Prepare the common content
          const buttonContent = (
            <div className="flex items-center">
              <span className={currentOption === option.id ? "mr-2" : ""}>
                {/* Check if the Icon is a function (meaning it's a component).
                  If so, render it as a JSX element with a size prop.
                  Otherwise, render it directly as a string (emoji).
                */}
                {typeof Icon === 'function' ? <Icon size={18} /> : Icon}
              </span>
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