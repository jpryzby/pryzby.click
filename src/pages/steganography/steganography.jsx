import './steganographyStyle.css';
import Nav from '../../components/nav.jsx';
import TableOfContents from '../tableOfContents.jsx';
import { useState, useRef } from "react";

export default function Steganography() {

    // Mode: "encode" or "decode"
    const [mode, setMode] = useState("encode");

    // Encode state
    const [tab, setTab] = useState("type");
    const [message, setMessage] = useState("");
    const [txtFile, setTxtFile] = useState(null);
    const [bitDepth, setBitDepth] = useState(1);
    const [encodeImgFile, setEncodeImgFile] = useState(null);
    const [encodeImgPreviewUrl, setEncodeImgPreviewUrl] = useState(null);
    const [txtDragOver, setTxtDragOver] = useState(false);
    const [encodeImgDragOver, setEncodeImgDragOver] = useState(false);
    const txtInputRef = useRef(null);
    const encodeImgInputRef = useRef(null);
    
    // Decode state
    const [decodeImgFile, setDecodeImgFile] = useState(null);
    const [decodeImgPreviewUrl, setDecodeImgPreviewUrl] = useState(null);
    const [decodeImgDragOver, setDecodeImgDragOver] = useState(false);
    const [decodedMessage, setDecodedMessage] = useState("");
    const decodeImgInputRef = useRef(null);


    // --- Text file handlers ---
    const handleTxtFile = (file) => {
        if (!file) return;
        if (!file.name.endsWith(".txt") && file.type !== "text/plain") {
            alert("Please upload a .txt file.");
            return;
        }
        setTxtFile(file);
    };

    const onTxtChange = (e) => handleTxtFile(e.target.files[0]);

    const onTxtDrop = (e) => {
        e.preventDefault();
        setTxtDragOver(false);
        handleTxtFile(e.dataTransfer.files[0]);
    };

    const clearTxt = () => {
        setTxtFile(null);
        if (txtInputRef.current) txtInputRef.current.value = "";
    };

    // --- Encode image handlers ---
    const handleEncodeImgFile = (file) => {
        if (!file) return;
        if (!["image/png", "image/jpeg"].includes(file.type)) {
            alert("Please upload a PNG or JPG image.");
            return;
        }
        setEncodeImgFile(file);
        setEncodeImgPreviewUrl(URL.createObjectURL(file));
    };

    const onEncodeImgChange = (e) => handleEncodeImgFile(e.target.files[0]);

    const onEncodeImgDrop = (e) => {
        e.preventDefault();
        setEncodeImgDragOver(false);
        handleEncodeImgFile(e.dataTransfer.files[0]);
    };

    const clearEncodeImg = () => {
        if (encodeImgPreviewUrl) URL.revokeObjectURL(encodeImgPreviewUrl);
        setEncodeImgFile(null);
        setEncodeImgPreviewUrl(null);
        if (encodeImgInputRef.current) encodeImgInputRef.current.value = "";
    };

    // --- Decode image handlers ---
    const handleDecodeImgFile = (file) => {
        if (!file) return;
        if (!["image/png", "image/jpeg"].includes(file.type)) {
            alert("Please upload a PNG or JPG image.");
            return;
        }
        setDecodeImgFile(file);
        setDecodeImgPreviewUrl(URL.createObjectURL(file));
    };

    const onDecodeImgChange = (e) => handleDecodeImgFile(e.target.files[0]);

    const onDecodeImgDrop = (e) => {
        e.preventDefault();
        setDecodeImgDragOver(false);
        handleDecodeImgFile(e.dataTransfer.files[0]);
    };

    const clearDecodeImg = () => {
        if (decodeImgPreviewUrl) URL.revokeObjectURL(decodeImgPreviewUrl);
        setDecodeImgFile(null);
        setDecodeImgPreviewUrl(null);
        setDecodedMessage("");
        if (decodeImgInputRef.current) decodeImgInputRef.current.value = "";
    };

    //encode text file or input text, depending on mode
    const handleEncode = () => {
        if (tab === "type") {
            runEncode(message);
        } else {
            // if reading from text file, Resolve the message text then run
            const reader = new FileReader();
            reader.onload = (e) => runEncode(e.target.result);
            reader.readAsText(txtFile);
        }
    };

    //encode header and message into image
    const runEncode = (text) => {
        //Set up download
        const link = document.createElement("a");
        link.href = encodeImgPreviewUrl;
        link.download = `encoded_${encodeImgFile.name}`;

        // Set up Encoding visualization
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = encodeImgPreviewUrl;
        

        // Draw Image
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);


            //Get metadata
            const headerLength = 16;
            const totalBits = (text.length + headerLength) * 16;
            // const totalBits = text.length * 16;
            const totalPixels = canvas.width * canvas.height;
            const pixelsNeeded = Math.ceil(totalBits / (3 * bitDepth));
            const imagePayload = totalPixels * bitDepth * 3 / 16;


            //if too much text, abort
            if (pixelsNeeded > totalPixels) {
                alert("The provided image is not large enough to contain this much text. This image can support " + imagePayload + " characters and this message is " + totalBits/16 + " characters long.");
                return;
            }

            if (pixelsNeeded > 99999999) {
                alert("The provided message is too large.");
                return;
            }

            //get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            // encode header
            const header = `${String(pixelsNeeded).padStart(16, '0')}`;
            
            
            //get message bits
            const messageBits = (header + text).split('').map(char =>
            // const messageBits = (text).split('').map(char =>
                char.charCodeAt(0).toString(2).padStart(16, '0')
            ).join('');

            


            //encode message
            //for each pixel, cycle through each color value. 
            //replace the N least significant bits with the data we are encoding, where N is the bitdepth
            let bitPointer = 0;
            for (let index = 0; index < pixelsNeeded; index++) {
                const offset = index * 4;
                for (let rgba = 0; rgba < 3; rgba++) {
                    const oldColorValue = pixels[offset + rgba].toString(2).padStart(8, '0');
                    const newColorBits = messageBits.substring(bitPointer, bitPointer + bitDepth);
                    const newColorBase2 = oldColorValue.slice(0, 8 - bitDepth) + newColorBits;
                    pixels[offset + rgba] = parseInt(newColorBase2, 2);
                    bitPointer += bitDepth;
                }
            }

            for (let i = 3; i < pixels.length; i += 4) {
                pixels[i] = 255;
            }
            ctx.putImageData(imageData, 0, 0);




            link.href = canvas.toDataURL("image/png");
            link.click();
        };
    };

    //decode text from image
    const handleDecode = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = decodeImgPreviewUrl;

        img.onload = () => {
            //Get image data
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;

            //Get Header/endpoint
            let bits = '';
            for (let i = 0; bits.length < 256; i++) {
                const offset = i * 4;
                for (let rgba = 0; rgba < 3; rgba++) {
                    const pixelValue = pixels[offset + rgba].toString(2).padStart(8, '0');
                    bits += pixelValue.slice(8 - bitDepth);
                }
            }
            const endpoint = parseInt(bitsToText(bits.substring(0, 256)));

            //Decode text from image
            bits = '';
            for (let i = 0; i < endpoint; i++) {
                const offset = i * 4;
                for (let rgba = 0; rgba < 3; rgba++) {
                    const pixelValue = pixels[offset + rgba].toString(2).padStart(8, '0');
                    bits += pixelValue.slice(8 - bitDepth);
                }
            }

            //send output to text box
            const output = bitsToText(bits).substring(16);
            setDecodedMessage(output);

        }
       
    };

    // Convert bits to text
    const bitsToText = (bits) => {
        let text = '';
        for (let i = 0; i < bits.length; i += 16) {
            text += String.fromCharCode(parseInt(bits.slice(i, i + 16), 2));
        }
        return text;
    };

    //handler for go button
    const handleGo = () => {
        if (mode === "encode") {
            const hasMessage = (tab === "type") ? (message !== "") : (txtFile !== null)
            const hasImage = (encodeImgFile !== null);

            if (!hasMessage && !hasImage) {
                alert("Please provide a message and a cover image.");
                return;
            }
            if (!hasMessage) {
                alert("Please provide a message to hide.");
                return;
            }
            if (!hasImage) {
                alert("Please provide a cover image.");
                return;
            }
            

            handleEncode();

        } else {
            if (!decodeImgFile) {
                alert("Please provide an encoded image.");
                return;
            }

            handleDecode();
        }
    };

    return (
        <div className='pageContainer'>

            <Nav />

            <div className='projectTitle'>
                <h1>Image Steganography</h1>
            </div>

            <TableOfContents />

            <div id="project-body" className='projectBody'>
                <div className='steg-root'>

                    {/* Mode toggle */}
                    <div className='steg-mode-row'>
                        <button
                            onClick={() => setMode("encode")}
                            className={`steg-mode-btn ${mode === "encode" ? "steg-mode-btn--active" : ""}`}
                        >
                            Encode
                        </button>
                        <button
                            onClick={() => setMode("decode")}
                            className={`steg-mode-btn ${mode === "decode" ? "steg-mode-btn--active" : ""}`}
                        >
                            Decode
                        </button>
                    </div>


                    {/* Bit depth slider */}
                    <input
                        type="range"
                        min={1}
                        max={8}
                        value={bitDepth}
                        onChange={(e) => setBitDepth(Number(e.target.value))}
                    />
                    <span className='steg-bit-depth-label'>{bitDepth} bit{bitDepth > 1 ? "s" : ""} per channel</span>

                    {/* ---- ENCODE MODE ---- */}
                    {mode === "encode" && (
                        <>
                            {/* Message section */}
                            <p className='steg-section-label'>Message</p>
                            <div className='steg-panel'>

                                <div className='steg-tab-row'>
                                    <button
                                        onClick={() => setTab("type")}
                                        className={`steg-tab ${tab === "type" ? "steg-tab--active" : ""}`}
                                    >
                                        Type text
                                    </button>
                                    <button
                                        onClick={() => setTab("upload")}
                                        className={`steg-tab ${tab === "upload" ? "steg-tab--active" : ""}`}
                                    >
                                        Upload .txt
                                    </button>
                                </div>

                                {tab === "type" && (
                                    <div>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Enter the secret message to hide…"
                                            className='steg-textarea'
                                        />
                                        <div className='steg-char-count'>{message.length} chars</div>
                                    </div>
                                )}

                                {tab === "upload" && (
                                    <div>
                                        <div
                                            className={`steg-drop-zone ${txtDragOver ? "steg-drop-zone--hover" : ""}`}
                                            onDragOver={(e) => { e.preventDefault(); setTxtDragOver(true); }}
                                            onDragLeave={() => setTxtDragOver(false)}
                                            onDrop={onTxtDrop}
                                            onClick={() => txtInputRef.current?.click()}
                                        >
                                            <input
                                                ref={txtInputRef}
                                                type="file"
                                                accept=".txt,text/plain"
                                                onChange={onTxtChange}
                                                className='steg-hidden-input'
                                            />
                                            <span className='steg-drop-icon'>📄</span>
                                            <div className='steg-drop-label'>Drop your .txt file here or click to browse</div>
                                            <div className='steg-drop-hint'>Plain text files only</div>
                                        </div>

                                        {txtFile && (
                                            <div className='steg-file-badge'>
                                                <span>📄 {txtFile.name}</span>
                                                <button onClick={clearTxt} className='steg-remove-btn' aria-label="Remove file">×</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Cover image section */}
                            <p className='steg-section-label'>Cover image</p>
                            <div className='steg-panel'>
                                <div
                                    className={`steg-drop-zone ${encodeImgDragOver ? "steg-drop-zone--hover" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setEncodeImgDragOver(true); }}
                                    onDragLeave={() => setEncodeImgDragOver(false)}
                                    onDrop={onEncodeImgDrop}
                                    onClick={() => encodeImgInputRef.current?.click()}
                                >
                                    <input
                                        ref={encodeImgInputRef}
                                        type="file"
                                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                        onChange={onEncodeImgChange}
                                        className='steg-hidden-input'
                                    />
                                    <span className='steg-drop-icon'>🖼️</span>
                                    <div className='steg-drop-label'>Drop a PNG or JPG here or click to browse</div>
                                    <div className='steg-drop-hint'>PNG · JPG · JPEG</div>
                                </div>

                                {encodeImgFile && (
                                    <div>
                                        <div className='steg-img-file-row'>
                                            <span className='steg-file-badge'>🖼️ {encodeImgFile.name}</span>
                                            <button onClick={clearEncodeImg} className='steg-file-badge steg-file-badge--remove'>✕ remove</button>
                                        </div>
                                        <img src={encodeImgPreviewUrl} alt="Cover image preview" className='steg-preview' />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ---- DECODE MODE ---- */}
                    {mode === "decode" && (
                        <>
                            {/* Encoded image upload */}
                            <p className='steg-section-label'>Encoded image</p>
                            <div className='steg-panel'>
                                <div
                                    className={`steg-drop-zone ${decodeImgDragOver ? "steg-drop-zone--hover" : ""}`}
                                    onDragOver={(e) => { e.preventDefault(); setDecodeImgDragOver(true); }}
                                    onDragLeave={() => setDecodeImgDragOver(false)}
                                    onDrop={onDecodeImgDrop}
                                    onClick={() => decodeImgInputRef.current?.click()}
                                >
                                    <input
                                        ref={decodeImgInputRef}
                                        type="file"
                                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                        onChange={onDecodeImgChange}
                                        className='steg-hidden-input'
                                    />
                                    <span className='steg-drop-icon'>🖼️</span>
                                    <div className='steg-drop-label'>Drop your encoded image here or click to browse</div>
                                    <div className='steg-drop-hint'>PNG · JPG · JPEG</div>
                                </div>

                                {decodeImgFile && (
                                    <div>
                                        <div className='steg-img-file-row'>
                                            <span className='steg-file-badge'>🖼️ {decodeImgFile.name}</span>
                                            <button onClick={clearDecodeImg} className='steg-file-badge steg-file-badge--remove'>✕ remove</button>
                                        </div>
                                        <img src={decodeImgPreviewUrl} alt="Encoded image preview" className='steg-preview' />
                                    </div>
                                )}
                            </div>

                            {/* Decoded message output */}
                            <p className='steg-section-label'>Decoded message</p>
                            <div className='steg-panel'>
                                <textarea
                                    value={decodedMessage}
                                    readOnly
                                    placeholder="The hidden message will appear here…"
                                    className='steg-textarea steg-textarea--readonly'
                                />
                            </div>
                        </>
                    )}

                <div className='steg-go-row'>
                    <button onClick={handleGo} className='steg-go-btn'>
                        Go
                    </button>
                </div>

                </div>
            </div>

            <div id="project-description" className="projectDescription">
                <h2>Project Description</h2>
                <div className='projectParagraph'>
                    <p>This tool is an image steganography encoder and decoder. The encoder is capable of taking large volumns of text and 'hiding' them in an image. It does this by subtly tweaking the color value of each pixel. The decoder can then later 'extract' these slight color differences to rebuild the message. </p>
                    <p>Each pixel has a Red, Green, Blue, and Alpha value. Alpha is a measure of transparency, which browsers will often alter when images are rendered, so we will ignore this channel. That leaves us with 3 values to tweak; Red, Blue, and Green. Each of these values is an integer between 0 and 255, which can be represented as an 8 bit number. So if some pixel has the following values (Red: 11110000 Green: 00000000 Blue: 11110000) it will show as bright purple.</p>
                    <p>When we use binary to describe a color value, not all bits are created equal. As we move from left to right, the 'value' of each bit is halved. So the first bit has a value of 128, the second has a value of 64, the third has a value of 32, and so on. This means that we can alter the right-most, or "least significant" bits, without having a noticable impact on the visual appearance of the pixel. We can rewrite the last 4 bits of each color value of each pixel with our own data, and have it affect each color value by no more than 1/16th of the full range of that color.</p>
                    <p>We can later go through this same picture and read the last 4 bits of each color value. We string these extracted bits together and interpret them as text, thus "extracting" the text we wrote in earlier. Using this method, the user can encode __________ characters into a _________px by _________px image, without visually altering it. Thats the first 5 books from "Game of Thrones"!</p>
                    <p>How does the decoder know when to stop? Each image is encoded with a header that tells the decoder how long the hidden message is. This prevents the decoder from reading millions of bits of junk data after it finishes the intended message.</p>

                </div>
            </div>

            <div id="how-to-use" className="projectInstructions">
                <h2>How do I use this?</h2>
                <div className='projectParagraph'>
                    <p>1) Select "Encode" or "Decode". To write text into an image, Select "Encode". To pull text out of an already altered image, select "Decode".</p>
                    <p>2) Select your "bits per Channel". This is a measure of how many bits per color value you are using. A higher "bits per Channel" can encode more text, but will be more visably different to the user. If you are decoding, you MUST use the same Bits per Channel that was used when encoding the image.</p>
                    <p>3) If you are encoding, select "Type Text" or "Upload Text". Type Text allows the user to type a message into the text box, then encode that message. Upload text allows the user to upload a larger .txt file. The text in that file will then be encoded.</p>
                    <p>4) Select an image to upload. If you are encoding, this will be the image that you are encoding text into. If you are decoding, this will be the image that you are attempting to pull text out of.</p>
                    <p>5) Hit the "GO" button. If encoding, an altered image will automatically begin downloading. If decoding, your message will be desplayed in the output text box. If no output is desplayed, double check that you are using a previously encoded image, and are using the correct "Bits per Channel" for that image.</p>
                </div>
            </div>
            <div id="improvements" className="projectImprovements">
                <h2>What can still be improved?</h2>
                <div className='projectParagraph'>
                    <p>1) Auto detect bit depth when encoding. The user may have a short message and use a very high bit deapth. This would result in the top few lines of pixels being HIGHLY edited, without editing the bottom 95% of the image. Instead, it would be preferable if the encoder calculated the lowest possible bit deapth needed to encode the text. This would result in a much subtler change to each pixel, and have those changes spread across more of the image.</p>
                    <p>2) Auto detect bit depth when decoding. I could make the header a fixed bit deapth, and have the encoder read that header, then change its bitdepth to match the rest of the image. This would eliminate the possible error of a user inputing the wrong bit depth and not being able to extract their message.</p>
                    <p>3) Utilize Alpha Channels? By not using Alpha, we are leaving 25% of the possible payload of the image untapped. The issue is that some browsers tweak Alpha values when rendering. This would garble any text we have encoded.</p>
                    <p>4) Image file compression. The images that are output by the encoder have large file sizes. This is because no compression has been performed on them, for fear of garbling the encoded message. There are likely compression methods that keep values pixel perfect, I just havent looked into them.</p>
                    <p>Lorem ipsum dolor sit amet...</p>
                </div>
            </div>

        </div>
    );
}