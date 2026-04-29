import '../styles/aboutStyle.css';
import profileImg from '../assets/cool-profile-pictures-fake-smile.webp';


export default function About(){

    return(
        <div className='aboutContainer' id='aboutContainer'>
            
            <div className='aboutTitle'>
                <h1>About</h1>
            </div>

            <div className='aboutBody'>
                <div className='aboutParagraph'>
                    <p>
                        Hi there!
                    </p>
                    <br />
                    <p>
                        My name is Jon, and I am a full stack developer. I earned my degree at Central Connecticut State University, with honors (?) and having earned the Bryan Something-or-other award for _________. I am capable of both front and back end development, but back end is where my real passion is. 
                    </p>
                    <br />
                    <p>
                        I hope that this site can show off some of my capabilities. It shows react web development, complex data manipulation, API calls, Cloud Hosting, and more. 
                    </p>
                </div>
                
                <div className='aboutProfile'>
                    <img src={profileImg} alt="Description" />
                </div>
            </div>


            
            

        </div>
    )
}