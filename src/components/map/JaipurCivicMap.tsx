import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CivicCategory, CivicIssue, PublicWork } from '../../types';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, STATUS_CONFIG } from '../../utils/civicHelpers';
import { formatDate } from '../../utils/cn';

interface JaipurCivicMapProps {
  issues?: CivicIssue[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: CivicIssue) => void;
  publicWorks?: PublicWork[];
  selectedWorkId?: string;
  onSelectWork?: (work: PublicWork) => void;
  showIssues?: boolean;
  showPublicWorks?: boolean;
  onReportAtLocation?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  className?: string;
}

export const JAIPUR_CENTER: [number, number] = [26.9124, 75.7873];

export const JaipurCivicMap: React.FC<JaipurCivicMapProps> = ({
  issues = [],
  selectedIssueId,
  onSelectIssue,
  publicWorks = [],
  selectedWorkId,
  onSelectWork,
  showIssues = true,
  showPublicWorks = true,
  onReportAtLocation,
  center = JAIPUR_CENTER,
  zoom = 12,
  interactive = true,
  className = 'h-full w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const issuesLayerRef = useRef<L.LayerGroup | null>(null);
  const worksLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        touchZoom: interactive,
        attributionControl: true,
      });

      // Standard OSM Carto Tiles with attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Context click to report at location
      if (interactive && onReportAtLocation) {
        map.on('contextmenu', (e: L.LeafletMouseEvent) => {
          onReportAtLocation(e.latlng.lat, e.latlng.lng);
        });
      }

      mapInstanceRef.current = map;
      issuesLayerRef.current = L.layerGroup().addTo(map);
      worksLayerRef.current = L.layerGroup().addTo(map);

      // Recalculate dimensions once layout settles
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Center and Zoom
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // Update Civic Issue Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !issuesLayerRef.current) return;

    issuesLayerRef.current.clearLayers();

    if (!showIssues) return;

    issues.forEach((issue) => {
      const isSelected = issue.id === selectedIssueId;
      const catConfig = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.uncertain_other;
      const sevConfig = SEVERITY_CONFIG[issue.severity];

      const pinIcon = L.divIcon({
        className: 'custom-civic-pin-wrapper',
        html: `
          <div class="custom-civic-pin ${isSelected ? 'ring-4 ring-[#153F35] scale-125' : ''}" 
               style="background-color: ${catConfig.pinColor}; width: 30px; height: 30px; color: white;">
            <span style="font-size: 11px; font-weight: 700;">${
              issue.category === 'roads_footpaths' ? 'RD' : 
              issue.category === 'waste_sanitation' ? 'WS' : 
              issue.category === 'streetlights_electrical' ? 'LT' : 
              issue.category === 'drainage_waterlogging' ? 'DR' : 
              issue.category === 'water_supply' ? 'WT' : 'CV'
            }</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: pinIcon });

      // Popup Content
      const popupHtml = `
        <div style="width: 250px; font-family: 'Inter', sans-serif; padding: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #153F35; background: #E6EEE7; padding: 2px 6px; border-radius: 4px;">
              ${issue.id}
            </span>
            <span style="font-size: 10px; font-weight: 600; color: #6D7771;">
              ${formatDate(issue.createdAt)}
            </span>
          </div>
          <h4 style="font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 700; color: #202724; margin: 0 0 6px 0; line-height: 1.3;">
            ${issue.title}
          </h4>
          <p style="font-size: 11px; color: #6D7771; margin: 0 0 8px 0; line-height: 1.4;">
            ${issue.locationLabel}
          </p>
          <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-bottom: 10px;">
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; background: #F1F5F2; color: #153F35;">
              ${catConfig.label}
            </span>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; background: #FFF7ED; color: #C2410C;">
              ${sevConfig.label}
            </span>
          </div>
          <button id="view-issue-${issue.id}" style="width: 100%; background: #153F35; color: white; border: none; padding: 6px 10px; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer;">
            View Detailed Intelligence
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-issue-${issue.id}`);
        if (btn && onSelectIssue) {
          btn.onclick = () => onSelectIssue(issue);
        }
      });

      marker.on('click', () => {
        if (onSelectIssue) onSelectIssue(issue);
      });

      issuesLayerRef.current?.addLayer(marker);
    });
  }, [issues, selectedIssueId, showIssues]);

  // Update Public Works / Road Contractor Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !worksLayerRef.current) return;

    worksLayerRef.current.clearLayers();

    if (!showPublicWorks) return;

    publicWorks.forEach((work) => {
      const isSelected = work.id === selectedWorkId;
      const isDlp = work.projectStatus === 'dlp_active';

      // Determine Department Branding
      let deptTag = 'JMC';
      let deptBg = '#B45309'; // Amber
      if (work.department.includes('PWD')) {
        deptTag = 'PWD';
        deptBg = '#0F3D3E'; // Navy/Teal
      } else if (work.department.includes('JDA')) {
        deptTag = 'JDA';
        deptBg = '#153F35'; // Forest Green
      } else if (work.department.includes('Heritage')) {
        deptTag = 'JMC-H';
        deptBg = '#9F1239'; // Terracotta
      } else if (work.department.includes('Smart City')) {
        deptTag = 'JSCL';
        deptBg = '#4338CA'; // Indigo
      }

      const contractIcon = L.divIcon({
        className: 'custom-contract-pin-wrapper',
        html: `
          <div class="custom-contract-pin ${isDlp ? 'dlp-badge' : ''} ${isSelected ? 'ring-4 ring-[#B45309] scale-125' : ''}" 
               style="background-color: ${deptBg}; width: 34px; height: 34px; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid #ffffff; border-radius: 8px;">
            <span style="font-size: 8px; font-weight: 800; letter-spacing: 0.5px; line-height: 1; text-transform: uppercase;">${deptTag}</span>
            <span style="font-size: 9px; font-weight: 700; line-height: 1; margin-top: 2px;">NIT</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([work.latitude, work.longitude], { icon: contractIcon });

      const portalUrl = work.officialPortalUrl || 'https://shpp.rajasthan.gov.in/';
      let portalDomain = 'Gov Portal';
      try {
        portalDomain = new URL(portalUrl).hostname.replace('www.', '');
      } catch {
        portalDomain = 'Official Portal';
      }

      // Popup Content for Public Works / Contractor
      const popupHtml = `
        <div style="width: 280px; font-family: 'Inter', sans-serif; padding: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 700; color: #153F35; background: #E6EEE7; padding: 2px 6px; border-radius: 4px;">
              ${work.tenderReference.split('(')[0].trim()}
            </span>
            ${
              isDlp
                ? `<span style="font-size: 10px; font-weight: 700; color: #166534; background: #DCFCE7; padding: 2px 6px; border-radius: 4px;">
                    🛡️ DLP Active
                  </span>`
                : `<span style="font-size: 10px; font-weight: 600; color: #92400E; background: #FEF3C7; padding: 2px 6px; border-radius: 4px;">
                    In Progress
                  </span>`
            }
          </div>

          <h4 style="font-family: 'Manrope', sans-serif; font-size: 13px; font-weight: 700; color: #202724; margin: 0 0 6px 0; line-height: 1.3;">
            ${work.title}
          </h4>

          <p style="font-size: 11px; color: #6D7771; margin: 0 0 8px 0; line-height: 1.35;">
            📍 ${work.projectLocation}
          </p>

          <div style="background: #F7F7F2; border: 1px solid #E1E5DF; border-radius: 8px; padding: 8px 10px; margin-bottom: 10px; font-size: 11px; line-height: 1.45;">
            <div style="margin-bottom: 3px;">
              <strong style="color: #202724;">Contractor:</strong> 
              <span style="color: #153F35; font-weight: 600;">${work.contractorName || 'Govt Enlisted Agency'}</span>
            </div>
            ${
              work.contractorClass
                ? `<div style="font-size: 10px; color: #6D7771; margin-bottom: 3px;">
                    <span style="font-weight: 600;">Grade:</span> ${work.contractorClass}
                   </div>`
                : ''
            }
            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 4px; padding-top: 4px; border-top: 1px dashed #E1E5DF;">
              <span><strong>Value:</strong> <span style="font-family: monospace; font-weight: 700; color: #153F35;">${work.contractValue || 'Under Bid'}</span></span>
              ${
                work.dlpWarrantyExpiry
                  ? `<span><strong>DLP:</strong> ${formatDate(work.dlpWarrantyExpiry)}</span>`
                  : ''
              }
            </div>
          </div>

          ${
            work.tenderPdfUrl
              ? `<a href="${work.tenderPdfUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: #166534; color: white; padding: 7px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; text-decoration: none; margin-bottom: 6px; box-sizing: border-box;">
                   <span>View Official NIT PDF</span>
                   <span style="font-size: 12px;">↗</span>
                 </a>`
              : ''
          }

          <a href="${portalUrl}" 
             target="_blank" 
             rel="noopener noreferrer" 
             style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: #0F3D3E; color: white; padding: 8px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; text-decoration: none; margin-bottom: 6px; box-sizing: border-box; transition: background 0.2s;">
            <span>Visit Official Portal (${portalDomain})</span>
            <span style="font-size: 12px;">↗</span>
          </a>

          <button id="view-work-${work.id}" 
                  style="width: 100%; background: #FFFFFF; color: #153F35; border: 1px solid #D0DDD3; padding: 6px 10px; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer;">
            Inspect Contract Intelligence
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-work-${work.id}`);
        if (btn && onSelectWork) {
          btn.onclick = () => onSelectWork(work);
        }
      });

      marker.on('click', () => {
        if (onSelectWork) onSelectWork(work);
      });

      worksLayerRef.current?.addLayer(marker);
    });
  }, [publicWorks, selectedWorkId, showPublicWorks]);

  return <div ref={mapContainerRef} className={`relative isolate z-0 overflow-hidden ${className}`} />;
};
