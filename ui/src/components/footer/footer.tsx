export function Footer() {
  return (
    <footer className="bg-[#f6f8f7] border-t border-[#e6f4ee]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2 font-bold text-[#0e1b17]">
              <span className="h-3 w-3 rounded-full bg-[#17cf91]" />
              Rent-Ease
            </div>
            <p className="text-sm text-[#4e977f]">
              Making property management easier, faster, and more profitable
              for everyone.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#0e1b17]">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-[#4e977f]">
              <li>Features</li>
              <li>Pricing</li>
              <li>Case Studies</li>
              <li>Reviews</li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#0e1b17]">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-[#4e977f]">
              <li>About Us</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#0e1b17]">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-[#4e977f]">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[#e6f4ee] pt-6 text-xs text-[#4e977f] md:flex-row md:justify-between">
          <span>© 2026 Rent-Ease Inc. All rights reserved.</span>
          <span>Security · Status · API</span>
        </div>
      </div>
    </footer>
  );
}
