import '../styles/projectsStyle.css';

import neuralNetImg from '../assets/Neural Net.png';
import steganographyImg from '../assets/steganography.png';
import runescapeImg from '../assets/2004scape.jpeg';


export default function Projects(){

    return(
        <div className='projectsContainer' id='projectsContainer'>

            <div className='projectsTitle'>
                <h1>Projects</h1>
            </div>

            <div className='projectContainer'>
                <div className='projectText'>
                    <div className='projectTitle'>
                        <h2>Sports Betting Neural Network</h2>
                    </div>
                    <div className='projectDescription'>
                        <p>
                            This is a neural network that was trained on Major League Baseball data sets. It uses parameters like _______, ________, and ________, to predict the winner of games.    
                        </p>
                        <br />
                        <p>
                            It works by ____ ____ __ _ _ _____ ______ _____ ___ ________ __ _____ ____ ___ ______ ___ _ _ _____ ____ ___ _____ _____ __ _ _____ ____ ____ __ __ _____ _____. In my testing, it has predicted the correct winner __% of the time.
                        </p>
                    </div>
                </div>
                
                <div className='projectImg'>
                    <img src={neuralNetImg} alt="Description" />
                </div>
            </div>

            <div className='projectContainer'>
                
                <div className='projectImg'>
                    <img src={steganographyImg} alt="Description" />
                </div>

                <div className='projectText'>
                    <div className='projectTitle'>
                        <h2>Image Steganography Encoder/Decoder</h2>
                    </div>
                    <div className='projectDescription'>
                        <p>
                            This is a tool that "hides" a block of text within an image, such that it can be later retreived. It works by converting the text to an array of bits, then "distributing" those bits to the color values of each pixel. The result is that the image is subtley altered, in such a way that is not noticable to the human eye, but is noticable when directly comparing color values.
                        </p>
                        <br />
                        <p>
                            This tool can hide ________ characters in a 2000x2000 image. Thats the entire Harry Potter book series. Twice!
                        </p>
                    </div>
                </div>
                
            </div>

            <div className='projectContainer'>
                <div className='projectText'>
                    <div className='projectTitle'>
                        <h2>Runescape Bot</h2>
                    </div>
                    <div className='projectDescription'>
                        <p>
                            Currently under construction!
                        </p>
                        <br />
                        <p>
                            In its current state, this is a private runescape server, with several built in botting commands. For example, if the user types "::cow", the player character will walk to the Lumbridge cow farm, attack cows, gather their hides, and store them in the bank. There are 200-ish commands. 
                        </p>
                        <br />
                        <p>
                            What still needs to be done? I plan to host a server on AWS, and have it run 24/7. When the user "tunes in", they can see what the bot is up to at that current moment. Perhaps we make it pick a new random task every 30 minutes.
                        </p>
                    </div>
                </div>
                
            
                <div className='projectImg'>
                    <img src={runescapeImg} alt="A profile picture of a nice young man" />
                </div>
        </div>
    </div>
)
}