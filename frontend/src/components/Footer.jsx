const Footer = () => {
  return (
    <footer className="w-full bg-black text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-sm">
          &copy; {new Date().getFullYear()} GYM-HUB. All rights reserved.
        </div>
        <div className="text-sm text-white/70">
          Built with care · Terms · Privacy
        </div>
      </div>
    </footer>
  );
};

export default Footer;