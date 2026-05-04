import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/home'
import Landing from './sections/landing'
import About from './sections/about'
import Projects from './sections/projects'
import Contact from './sections/contact'
import Steganography from './pages/steganography'
import SportsBetNN from './pages/sportsBetNN'
import RunescapeBot from './pages/runescapeBot'




function App() {

  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="landing" element={<Landing />} />
          <Route path="about" element={<About />} />
          <Route path="projects" element={<Projects />} />
          <Route path="contact" element={<Contact />} />
          <Route path="steganography" element={<Steganography />} />
          <Route path="sportsBetNN" element={<SportsBetNN />} />
          <Route path="runescapeBot" element={<RunescapeBot />} />
        </Routes>
      </main>
    </BrowserRouter>
    
  )
}

export default App
