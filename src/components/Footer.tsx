import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-foreground text-background py-10">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
      <Link to="/" className="text-lg font-bold tracking-tight">
        <span className="text-primary">Match</span>flow
      </Link>
      <p className="text-sm opacity-50">© 2026 Matchflow. All rights reserved.</p>
      <a href="mailto:hello@matchflow.com" className="text-sm opacity-70 hover:opacity-100 transition-opacity">hello@matchflow.com</a>
    </div>
  </footer>
);

export default Footer;
