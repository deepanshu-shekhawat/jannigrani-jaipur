import React from 'react';
import { ShieldAlert, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#102D27] text-stone-300 pt-16 pb-12 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                JanNigrani <span className="text-emerald-400 font-normal text-sm">| जननिगरानी</span>
              </span>
            </div>
            <p className="text-sm text-stone-300 font-display italic">
              “See the issue. Find the authority. Follow the action.”
            </p>
            <p className="text-xs text-stone-400 leading-relaxed">
              An AI-assisted civic intelligence platform that helps citizens report local problems, discover the appropriate statutory authority, explore related public records, and follow complaint progress across Jaipur, Rajasthan.
            </p>
            <div className="inline-flex items-center text-[11px] px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-300">
              Built for transparent reporting and evidence-led civic accountability.
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-display">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition">
                  Product Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/map')} className="hover:text-white transition">
                  Jaipur Civic Map (OSM)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/report')} className="hover:text-white transition">
                  AI Issue Reporting Wizard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/public-works')} className="hover:text-white transition">
                  Public Works & Tender Registry
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/authorities')} className="hover:text-white transition">
                  Authority Discovery Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="hover:text-white transition">
                  Reviewer Workspace (Demo)
                </button>
              </li>
            </ul>
          </div>

          {/* Official Gov Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-display">
              Official Gov Portals
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <a
                  href="https://www.jaipurmc.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>Jaipur MC Portal</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.jaipurmc.org/presentation/Others/JTender.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>JMC E-Tenders (JTender)</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://samadhan.jaipurmc.org/ComplaintRegistrationByWebsite/AddComplaintRegistrationByWebsite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between text-emerald-400 font-medium"
                >
                  <span>Samadhan: File Complaint</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://samadhan.jaipurmc.org/ComplaintRegistrationByWebsite/SearchComplains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>Samadhan: Track Complaint</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://jda.urban.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>JDA Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://jdafa.rajasthan.gov.in/TenderEMD"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>JDA Tender EMD Portal</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://jdaservice.rajasthan.gov.in/JDAMicroPortalProject/About/FAQDetail/1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>JDA MicroPortal & FAQs</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://shpp.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>SHPP State Procurement</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.eproc.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center justify-between"
                >
                  <span>Rajasthan eProc</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Statutory Acts & Open Data Sources */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-display">
              Statutory Basis & Sources
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>Rajasthan Municipalities Act, 2009 (Sec 200-241)</li>
              <li>Jaipur Development Authority Act, 1982 (Sec 38)</li>
              <li>State Public Procurement Portal (SHPP Rajasthan)</li>
              <li>JMC Greater Delimitation Gazette</li>
              <li>Map tiles: © OpenStreetMap contributors</li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Legal Notice */}
        <div className="pt-8 border-t border-emerald-900/60 text-[11px] text-stone-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            JanNigrani Demonstration Prototype. Authority routing and notifications are simulated within this prototype. No official government complaint is dispatched without authorized municipal integration.
          </p>
          <div className="flex items-center space-x-1 text-stone-400">
            <span>Crafted for Jaipur Civic Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
