import '../styles/navStyle.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Nav() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavClick = (targetId) => {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: targetId } });
        } else {
            document.getElementById(targetId)?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className='navBar'>
            <div className='navElement' onClick={() => handleNavClick('landingContainer')}>
                <h3>Home</h3>
            </div>

            <div className='navElement' onClick={() => handleNavClick('projectsContainer')}>
                <h3>See My Work</h3>
            </div>

            <div className='navElement' onClick={() => handleNavClick('aboutContainer')}>
                <h3>About Me</h3>
            </div>

            <div className='navElement' onClick={() => handleNavClick('contactContainer')}>
                <h3>Contact</h3>
            </div>
        </div>
    );
}