import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-yellow-500 text-white">
      <div className="relative mx-auto max-w-7xl px-6 py-6">
        {/* Main Content */}
        <div className="mb-4 flex flex-col items-center justify-between md:flex-row">
          {/* Logo Section */}
          <div className="mb-4 flex items-center space-x-4 md:mb-0">
            <div className="rounded-xl border border-white/20 bg-white p-2 shadow">
              <Link to="/" className="block">
                <img
                  src="/web-logo.png"
                  alt="TalentBridge"
                  className="h-10 w-10 rounded-lg object-contain"
                />
              </Link>
            </div>

            <div className="text-center md:text-left">
              <h4 className="text-lg font-bold tracking-wide uppercase">
                TalentBridge
              </h4>
              <p className="text-xs font-medium italic opacity-90">
                Kết nối tài năng, tạo dựng tương lai
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="flex items-center space-x-4">
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 transition hover:bg-white/30"
            >
              <img
                src="facebook-logo.png"
                alt="Facebook logo"
                className="h-5 w-5"
              />
            </a>

            <div className="text-center md:text-right">
              <p className="text-sm font-bold">Kết nối đam mê</p>
              <div className="text-xs text-orange-100">
                Founder & Developer
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-4">
          <div className="flex flex-col items-center justify-between text-xs md:flex-row">
            <p className="mb-1 text-center font-medium md:mb-0 md:text-left">
              © 2025 TalentBridge. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-orange-100">
              <span>Hệ thống hoạt động ổn định</span>
              <span>•</span>
              <span>Phiên bản 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
