import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Sliders from './pages/Sliders';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Success from './pages/Success';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="sliders" element={<Sliders />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="registration" element={<Registration />} />
        <Route path="success" element={<Success />} />
      </Route>
    </Routes>
  );
}

export default App;
