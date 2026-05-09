import '../styles/steganographyStyle.css';
import Nav from '../components/nav.jsx';
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

    // Decode state
    const [decodeImgFile, setDecodeImgFile] = useState(null);
    const [decodeImgPreviewUrl, setDecodeImgPreviewUrl] = useState(null);
    const [decodeImgDragOver, setDecodeImgDragOver] = useState(false);
    const [decodedMessage, setDecodedMessage] = useState("");

    const txtInputRef = useRef(null);
    const encodeImgInputRef = useRef(null);
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

    const handleEncode = () => {

        const runEncode = (text) => {
            //Set up download logic
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

                const messageBits = text.split('').map(char =>
                    char.charCodeAt(0).toString(2).padStart(8, '0')
                ).join('');

                const totalBits = text.length * 8;
                const totalPixels = canvas.width * canvas.height;
                // const totalCapacity = totalPixels * 4 * bitDepth;
                const pixelsNeeded = Math.ceil(totalBits / (4 * bitDepth));

                if (pixelsNeeded > totalPixels) {
                    alert("The provided image is not large enough to contain this much text.");
                    return;
                }

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;

                for (let index = 0; index < pixelsNeeded; index++) {
                    const offset = index * 4;
                    for (let rgba = 0; rgba < 4; rgba++) {
                        const substringStart = (offset + rgba) * bitDepth;
                        const substringEnd = substringStart + bitDepth;
                        const oldColorValue = pixels[offset + rgba].toString(2).padStart(8, '0');
                        const newColorBits = messageBits.substring(substringStart, substringEnd);
                        const newColorBase2 = oldColorValue.slice(0, 8 - bitDepth) + newColorBits;
                        pixels[offset + rgba] = parseInt(newColorBase2, 2);
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                link.href = canvas.toDataURL("image/png");
                link.click();
            };
        };

        // if reading from text file, Resolve the message text then run
        if (tab === "type") {
            console.log("here1");
            runEncode(message);
        } else {
                        console.log("here2");

            const reader = new FileReader();
            reader.onload = (e) => runEncode(e.target.result);
            reader.readAsText(txtFile);
        }
    };

    const handleDecode = () => {
        setDecodedMessage("Hello World");
    };

    const handleGo = () => {
        if (mode === "encode") {
            const hasMessage = tab === "type" ? message.trim() !== "" : txtFile !== null;//todo what the f is this?
            const hasImage = encodeImgFile !== null;

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
                <h1>Project Title</h1>
            </div>

            <div className='projectBody'>
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

            <div className='projectDescription'>
                <h2>Project Description</h2>
                <div className='projectParagraph'>
                    <p>Lorem ipsum dolor sit amet...</p>
                    <p>Lorem ipsum dolor sit amet...</p>
                </div>
            </div>

            <div className='projectInstructions'>
                <h2>How To Use</h2>
                <div className='projectParagraph'>
                    <p>Lorem ipsum dolor sit amet...</p>
                    <p>Lorem ipsum dolor sit amet...</p>
                </div>
            </div>

        </div>
    );
}