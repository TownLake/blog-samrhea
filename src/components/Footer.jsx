// src/components/Footer.jsx
import React from 'react';
import { Github, Linkedin, X } from 'lucide-react'; // Using the 'X' icon for X/Twitter

const socialLinks = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com/LakeAustinBlvd',
    icon: X,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/samrhea/',
    icon: Linkedin,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/TownLake/',
    icon: Github,
  },
];

const Footer = () => {
  return (
    <footer className="mt-16 mb-8"> {/* Add top/bottom margin */}
      <div className="flex justify-center space-x-6">
        {socialLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Sam Rhea on ${link.label}`}
              // Subtle text color, changes on hover, respects dark mode via CSS variable
              className="text-gray-500 dark:text-gray-400 hover:text-[var(--text-primary)] transition-colors"
            >
              <Icon size={20} /> {/* Adjust size as needed */}
            </a>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;