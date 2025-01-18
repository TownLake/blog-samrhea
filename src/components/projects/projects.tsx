import React from 'react';
import { Link } from 'gatsby';

import * as styles from './Projects.module.scss';

interface Project {
  title: string;
  image: string;
  link: string;
}

const projects: Project[] = [
  { title: "LIS Delays", image: "/images/lis-delays.png", link: "https://lis-delays.townlake.io/" },
  { title: "Plan-a-Date", image: "/images/plan-a-date.png", link: "https://plan-a-date.com/" },
  { title: "Lisbon AI", image: "/images/lisbon-ai.png", link: "https://lisbon-ai.samrhea.com/" },
  { title: "AI Watch UI", image: "/images/ai-watch.png", link: "https://github.com/TownLake/watch-app-ai-ux" },
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