import '../styles/steganographyStyle.css';
import Nav from '../components/nav.jsx';


export default function Steganography(){

    return(
        <div className='pageContainer'>
            
            <Nav />

            <div className='projectTitle'>
                <h1>Project Title</h1>
            </div>
            <div className='projectBody'>
                <p>project body</p>
            </div>
            <div className='projectDescription'>
                <h2>Project Description</h2>
                <div className='projectParagraph'>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod earum beatae, deleniti quae eveniet reiciendis id incidunt blanditiis repellat harum quidem magnam adipisci minima, nihil officia voluptatem, cumque facilis quis.</p>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda cumque officiis modi, consequuntur saepe eveniet! Mollitia nam, quae autem eius deserunt similique omnis maiores aperiam ullam blanditiis expedita quod necessitatibus!</p>
                </div>
            </div>
            <div className='projectInstructions'>
                <h2>How To Use</h2>
                <div className='projectParagraph'>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod earum beatae, deleniti quae eveniet reiciendis id incidunt blanditiis repellat harum quidem magnam adipisci minima, nihil officia voluptatem, cumque facilis quis.</p>
                    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda cumque officiis modi, consequuntur saepe eveniet! Mollitia nam, quae autem eius deserunt similique omnis maiores aperiam ullam blanditiis expedita quod necessitatibus!</p>
                </div>
            </div>
        </div>
    )
}   