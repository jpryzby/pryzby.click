import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home/home'
import Landing from './pages/Home/sections/landing'
import About from './pages/Home/sections/about'
import Projects from './pages/Home/sections/projects'
import Contact from './pages/Home/sections/contact'
import Steganography from './pages/steganography/steganography'


import SportsBetNN from './pages/SportsBetNN/sportsBetNN'
import RunescapeBot from './pages/RSBot/runescapeBot'




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
