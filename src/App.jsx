import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HumanChatUnreadProvider } from './contexts/HumanChatUnreadContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Sliders from './pages/Sliders';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Profile from './pages/Profile';
import Success from './pages/Success';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import HumanChat from './pages/HumanChat';

function App() {
  return (
    <AuthProvider>
      <HumanChatUnreadProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="sliders" element={<Sliders />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="registration" element={<Registration />} />
          <Route path="profile" element={<Profile />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="human-chat" element={<HumanChat />} />
          <Route path="success" element={<Success />} />
          </Route>
        </Routes>
      </HumanChatUnreadProvider>
    </AuthProvider>
  );
}

export default App;
