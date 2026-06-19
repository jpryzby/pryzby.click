import './aboutStyle.css';
import profileImg from '../../../assets/cool-profile-pictures-fake-smile.webp';


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
                        My name is Jon, and I am a full stack developer. I earned my degree at Central Connecticut State University, having earned the Bryan Something-or-other award for _________. I am capable of both front and back end development, but back end is where my real passion is. 
                    </p>
                    <br />
                    <p>
                        I hope that this site can highlight my technical capabilities. It shows React web development, complex JavaScript backend systems, advanced data processing, Cloud Hosting, and more. 
                    </p>
                    <br />
                    <p>
                        If you want to reach me, send me an email at jpryzby@gmail.com.
                    </p>
                </div>
                
                <div className='aboutProfile'>
                    <img src={profileImg} alt="Description" />
                </div>
            </div>


            
            

        </div>
    )
}