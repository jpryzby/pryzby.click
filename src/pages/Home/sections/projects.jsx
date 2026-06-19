import './projectsStyle.css';

import neuralNetImg from '../../../assets/Neural Net.png';
import steganographyImg from '../../../assets/steganography.png';
import runescapeImg from '../../../assets/2004scape.jpeg';

import { Link } from 'react-router-dom';


export default function Projects(){

    return(
        <div className='projectsContainer' id='projectsContainer'>

            <div className='projectsTitle'>
                <h1>Projects</h1>
            </div>

            <Link to="/sportsBetNN" className="projectContainer">
                <div className='projectTitle'>
                    <h2>Sports Betting Neural Network</h2>
                </div>
                <div className='projectCard'>
                    <div className='projectDescription'>
                        <p>
                            This is a feedforward neural network that was trained on NBA Basketball data sets. It's purpose is to predict the winner of games.    
                        </p>
                        <br />
                        <p>
                            The network makes its predictions by looking at each teams recent game history. It takes in stats like the average number of fouls, the average free-throw hit rate, the average number of successful blocks, and much more, from their previous 10 games. It also looks at the recent win/loss history from the last few times these teams played each other. This data then feeds through a neural network, outputting a single number value between 0 and 1, which we interpret as a home team win or loss. It predicts the correct winner roughly 62% of the time.
                        </p>
                    </div>
                    <div className='projectImg'>
                        <img src={neuralNetImg} alt="Description" />
                    </div>
                </div>
            </Link>
            

            <Link to="/steganography" className="projectContainer">
                <div className='projectTitle'>
                    <h2>Image Steganography Encoder/Decoder</h2>
                </div>
                <div className='projectCard'>
                    <div className='projectDescription'>
                        <p>
                            This is a tool that "hides" a block of text within an image, such that it can be later retreived. It works by converting the text to an array of bits, then "distributing" those bits to the color values of each pixel. The result is that the image is subtley altered, in such a way that is not noticable to the human eye, but is noticable when directly comparing color values.
                        </p>
                        <br />
                        <p>
                            The user can choose the "bit depth", which determines how much data is stored in each pixel (and also how distorted the image looks). A lower bit depth produces an image that is more faithful to the original. A higher bit depth can store more data.
                        </p>
                        <br />
                        <p>
                            This tool can hide 3,750,000 characters in a 2500x2000 image with a bit depth of 4, without noticably altering the image. Thats the entire 1st book of "Game of Thrones". Twice!
                        </p>
                    </div>
                    <div className='projectImg'>
                        <img src={steganographyImg} alt="Description" />
                    </div>
                </div>
            </Link>

            <div className="projectContainer projectContainerDisabled">
                <div className='projectTitle'>
                    <h2>Runescape Bot</h2>
                </div>
                <div className='projectCard'>
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
                    <div className='projectImg'>
                        <img src={runescapeImg} alt="A profile picture of a nice young man" />
                    </div>
                </div>
                <div className='underConstructionBanner'>UNDER CONSTRUCTION</div>
            </div>
        </div>
    )
}