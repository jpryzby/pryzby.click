import '../styles/contactStyle.css';

export default function Contact(){
    return(
        <div className='contactContainer'>
            <h2>contact</h2>

            <h6>email</h6>
            <textarea name="email" id="" defaultValue={'Your Email'}></textarea>

            <h6>subject</h6>
            <textarea name="subject" id="" defaultValue={'Subject Line'}></textarea>

            <h6>message</h6>
            <textarea className="messagebox" name="message" id="" defaultValue={'Add your message here'}rows={5}></textarea>
        </div>
    )
}            