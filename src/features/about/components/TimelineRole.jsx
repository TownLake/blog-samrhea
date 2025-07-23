// src/features/about/components/TimelineRole.jsx
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const TimelineRole = ({
  role,
  isLastRole = false,
  renderAchievement
}) => {
  const { darkMode } = useTheme();

  const hasAchievements = role.achievements && role.achievements.length > 0;
  const firstAchievement = hasAchievements ? role.achievements[0] : null;
  const subsequentAchievements = hasAchievements ? role.achievements.slice(1) : [];

  return (
    <div className="relative">
      <div
        className={`
            absolute left-0 top-1.5 w-3 h-3 rounded-full shadow-sm
            bg-[var(--timeline-dot-color)]
            transition-colors duration-200
        `}
      ></div>

      {!isLastRole && (
        <div
            className={`
                absolute left-1.5 top-4 w-[1px] h-full -mb-4
                bg-[var(--timeline-line-color)]
                transition-colors duration-200
            `}
        ></div>
      )}

      <div className="pl-5">
        <h3
            className={`
                font-semibold text-lg mb-1
                text-[var(--timeline-title-color)]
                transition-colors duration-200
            `}
        >
          {role.title}
        </h3>

        <p className="text-sm mb-2 text-[var(--text-muted)] transition-colors duration-200">
          {role.period}
        </p>

        {firstAchievement && (
          <p
            className="text-sm text-[var(--text-secondary)] mb-2 text-wrap-pretty transition-colors duration-200"
            style={{ letterSpacing: '-0.01em' }}
          >
             {renderAchievement(firstAchievement)}
          </p>
        )}

        {subsequentAchievements.length > 0 && (
          <ul className="space-y-1 text-sm text-[var(--text-secondary)] transition-colors duration-200">
            {subsequentAchievements.map((achievement, index) => (
              <li
                key={index}
                className="flex items-baseline text-wrap-pretty"
                style={{ letterSpacing: '-0.01em' }}
              >
                <span className={`achievement-bullet mr-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>•</span>
                <span>{renderAchievement(achievement)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TimelineRole;
