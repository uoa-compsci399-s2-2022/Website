/**
 * The '_landing' page is the landing page for our site.  It is shown to users who are
 * not logged in, and describes our website and its features.
 **/
import React from 'react';

const Landing: React.FC = () => {
    // TODO: this should be our landing page.  here, display some cool info
    // about our website
    return (
        <main>
            <div className=''>
                <main className="">
                    <p className="text-white text-3xl p-6">
                        a website for testing your spatial skills
                    </p>

                    <div className="">

                    </div>
                </main>

                <footer className="text-white text-xl p-6">
                    <a
                        href=""
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        CS399 Team 34 | Project 14
                    </a>
                </footer>
            </div>
        </main>
    )
};

export default Landing;