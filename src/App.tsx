import { CalendarClock, DoorOpen, Github, Sparkles } from 'lucide-react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { RoomBookingPage } from './q1/RoomBookingPage';
import { FindTimePage } from './q2/FindTimePage';

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/q1-room-booking" aria-label="Roomly home">
          <span className="brand-mark"><DoorOpen size={18} strokeWidth={2.2} /></span>
          <span>roomly<span className="brand-dot">.</span></span>
        </NavLink>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/q1-room-booking" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <DoorOpen size={15} /> Room queue <span className="nav-tag">Q1</span>
          </NavLink>
          <NavLink to="/q2-find-a-time" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <CalendarClock size={15} /> Find a time <span className="nav-tag">Q2</span>
          </NavLink>
        </nav>
        <a className="topbar-link" href="https://github.com" target="_blank" rel="noreferrer">
          <Github size={15} /> <span>Project</span>
        </a>
      </header>
      <main className="page-wrap">
        <Routes>
          <Route path="/q1-room-booking" element={<RoomBookingPage />} />
          <Route path="/q2-find-a-time" element={<FindTimePage />} />
          <Route path="*" element={<Navigate to="/q1-room-booking" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span><Sparkles size={13} /> Roomly · make space for good work</span>
        <span>Built for fairer meetings</span>
      </footer>
    </div>
  );
}

export default App;
