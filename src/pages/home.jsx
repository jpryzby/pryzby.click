import '../styles/homeStyle.css';
import Nav from '../components/nav.jsx';
import Footer from '../components/footer.jsx';
import About from '../sections/about.jsx';
import Projects from '../sections/projects.jsx';
import Contact from '../sections/contact.jsx';
import Landing from '../sections/landing.jsx';

export default function Home(){

    return(
        <div className='pageContainer'>
            
            <Landing />
            <Nav />
            <About />
            <Projects />
            <Contact />
            <Footer />

        </div>
    )
}   