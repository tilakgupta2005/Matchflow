import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-foreground text-background py-10">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
      <Link to="/" className="text-lg font-bold tracking-tight">
        <span className="text-primary">Match</span>flow
      </Link>
      <div className="text-center text-sm opacity-50">
        <p>© 2026 Matchflow. All rights reserved.</p>
        <p className="mt-1">Created by <a href="https://tilak-dev.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:opacity-100 transition-colors underline">Tilak Gupta</a></p>
      </div>
      <a href="mailto:tilakgupta2005@gmail.com" className="text-sm opacity-70 hover:opacity-100 transition-opacity">tilakgupta2005@gmail.com</a>
    </div>
  </footer>
);

export default Footer;
