// src/features/about/AboutPage.jsx
import React from 'react';
import Layout from '../../components/ui/Layout';
import ErrorBoundary from '../../components/ErrorBoundary';
import CareerTimeline from './components/CareerTimeline';
import Search from '../search/Search';
import { useSearch } from '../../hooks/useSearch';

const AboutPage = () => {
  const [isSearchActive, toggleSearch] = useSearch();

  return (
    <>
      <Layout toggleSearch={toggleSearch}>
        <ErrorBoundary>
          <div className="space-y-12 max-w-4xl mx-auto">
            {/* About Section */}
            <section>
              <h1 className="text-3xl font-bold mb-6 text-[var(--text-primary)]">About</h1>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg mb-4">
                  Hi there. My name is Sam. I am a Texan living in Lisbon. I work at Cloudflare.
                </p>
                <p className="text-lg mb-4">
                  I'm probably busy right now building an application for a hobby project that doesn't need one. Or{' '}
                  <a 
                    href="https://blog.samrhea.com/posts/2022/a-serra-and-new-friends"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    walking a dog
                  </a>
                  {' '}we named after the second-worst highway in Austin.
                </p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4">Austin → Lisbon</h2>
                <p className="text-lg mb-4">
                  I'm an Austinite, but I left my hometown in 2019 to help open Cloudflare's office in{' '}
                  <a 
                    href="https://blog.samrhea.com/posts/2020/one-year-lisbon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Lisbon, Portugal
                  </a>
                  . What was supposed to be a one year assignment has evolved into an open-ended tenure for me and my family. We like it here and I think you would too -{' '}
                  <a 
                    href="https://www.cloudflare.com/careers/jobs/?location=Lisbon%2C+Portugal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    we're hiring!
                  </a>
                </p>
              </div>
            </section>

            {/* Career Timeline (includes Work, Education, and Patents) */}
            <section>
              <CareerTimeline />
            </section>

            {/* Teaching and Studying Section */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-semibold mb-4">Teaching & Studying</h2>
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-3">Teaching</h3>
                <p className="mb-4">
                  I will be teaching <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Intro to Product Management</code> at{' '}
                  <a 
                    href="https://www.novasbe.unl.pt/en/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    NOVA SBE
                  </a>
                  {' '}this fall. Are you a student interested in the class? Please reach out!
                </p>

                <h3 className="text-xl font-semibold mb-3 mt-6">Studying</h3>
                <p className="mb-4">
                  I studied in the{' '}
                  <a 
                    href="https://liberalarts.utexas.edu/plan2/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Plan II Program
                  </a>
                  {' '}at The University of Texas at Austin. Yes, it is a major in and of itself.
                </p>
                <p className="mb-4">
                  My diploma doesn't matter at all, though. Where we went to school <em>maybe</em> impacts our first job. I bring it up here because <strong>I loved Plan II</strong>. The admittedly weird curriculum seems well-equipped to prepare students for whatever oddball form the future will take. I served on the Board of Visitors before I moved to Portugal and I continue to believe that Plan II is a model worth replicating.
                </p>
                <p>
                  You know what else doesn't really matter? Your grades. I had a perfect GPA in all coursework across every subject and department they sent Plan II students to attend - and the only time that achievement impacts my life is when I wake up in a cold sweat thinking I bombed a test and lost my precious <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">4.0</code>, something that amuses my wife endlessly. Your grades only count if they become something your spouse enjoys teasing you about.
                </p>
              </div>
            </section>
          </div>
        </ErrorBoundary>
      </Layout>
      {isSearchActive && <Search toggleSearch={toggleSearch} />}
    </>
  );
};

export default AboutPage;
