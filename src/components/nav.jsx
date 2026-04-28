import '../styles/navStyle.css';

export default function Nav(){

    return(
        <div className='navBar'>
                <div className='navElement'
                    onClick={() => {
                        document.getElementById('projectsContainer').scrollIntoView({
                        behavior: 'smooth'
                        });
                    }}
                >
                    <h3>See My Work</h3>
                </div>
                <div className='navElement'
                    onClick={() => {
                        document.getElementById('aboutContainer').scrollIntoView({
                        behavior: 'smooth'
                        });
                    }}
                >
                    <h3>About Me</h3>
                </div>
                <div className='navElement'
                    onClick={() => {
                        document.getElementById('contactContainer').scrollIntoView({
                        behavior: 'smooth'
                        });
                    }}
                >
                    <h3>Contact</h3>
                </div>







            </div> 
    )}