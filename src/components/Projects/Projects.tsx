import React from 'react';
import { Link } from 'gatsby';

import * as styles from './Projects.module.scss';

interface Project {
  title: string;
  image: string;
  link: string;
}

const projects: Project[] = [
  { title: "Lisbon AI", image: "/images/lisbon-ai.png", link: "https://lisbon-ai.samrhea.com/" },
  { title: "Plan-a-Date", image: "/images/plan-a-date.png", link: "https://plan-a-date.com/" },
];

const Projects: React.FC = () => {
  return (
    <div className={styles.projectsGrid}>
      {projects.map((project, index) => (
        <Link key={index} to={project.link} className={styles.projectCard}>
          <div className={styles.imageWrapper}>
            <img src={project.image} alt={project.title} />
          </div>
          <div className={styles.projectTitle}>{project.title}</div>
        </Link>
      ))}
    </div>
  );
};

export default Projects;