import '../styles/homeStyle.css';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Nav from '../components/nav.jsx';
import Footer from '../components/footer.jsx';
import About from '../sections/about.jsx';
import Projects from '../sections/projects.jsx';
import Contact from '../sections/contact.jsx';
import Landing from '../sections/landing.jsx';

export default function Home() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.scrollTo) {
            const el = document.getElementById(location.state.scrollTo);

            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }

            
            navigate('.', { replace: true, state: {} });
        }
    }, [location, navigate]);

    return (
        <div className='pageContainer'>
            <Landing />
            <Nav />
            <About />
            <Projects />
            <Contact />
            <Footer />
        </div>
    );
}