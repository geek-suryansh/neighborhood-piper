'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const JOBS = [
  { id: 1, title: "Warehouse Associate", company: "PostNL", neighborhood: "Amsterdam Noord", type: "Full-time", lat: 52.3953, lng: 4.9088, desc: "Loading and sorting packages. No Dutch required.", salary: "€13/hr" },
  { id: 2, title: "Kitchen Helper", company: "Pllek Restaurant", neighborhood: "Amsterdam Noord", type: "Part-time", lat: 52.3971, lng: 4.9012, desc: "Prep work and dishwashing. Meals included.", salary: "€12.50/hr" },
  { id: 3, title: "Bicycle Courier", company: "Gorillas", neighborhood: "Centrum", type: "Flexible", lat: 52.3738, lng: 4.8910, desc: "Deliver groceries. Bike provided. App-based.", salary: "€13/hr" },
  { id: 4, title: "Cleaning Staff", company: "Sodexo", neighborhood: "Zuidas", type: "Full-time", lat: 52.3386, lng: 4.8700, desc: "Office cleaning, early morning shifts. Steady hours.", salary: "€12.50/hr" },
  { id: 5, title: "Market Stall Helper", company: "Albert Cuyp Markt", neighborhood: "De Pijp", type: "Part-time", lat: 52.3540, lng: 4.8969, desc: "Help vendors set up and manage stalls. Cash pay.", salary: "€11/hr" },
  { id: 6, title: "Hotel Housekeeper", company: "NH Hotels", neighborhood: "Centrum", type: "Full-time", lat: 52.3702, lng: 4.8952, desc: "Room cleaning and turndown. Uniform provided.", salary: "€13.50/hr" },
  { id: 7, title: "Construction Laborer", company: "VolkerWessels", neighborhood: "Sloterdijk", type: "Full-time", lat: 52.3886, lng: 4.8363, desc: "General site labor. Safety training provided.", salary: "€14/hr" },
  { id: 8, title: "Supermarket Cashier", company: "Albert Heijn", neighborhood: "Oost", type: "Part-time", lat: 52.3612, lng: 4.9358, desc: "Scanning and bagging. Basic Dutch helpful.", salary: "€12/hr" },
  { id: 9, title: "Dishwasher", company: "Cafe de Jaren", neighborhood: "Centrum", type: "Evening shifts", lat: 52.3672, lng: 4.8960, desc: "Evenings and weekends. No experience needed.", salary: "€12/hr" },
  { id: 10, title: "Flower Packer", company: "Royal FloraHolland", neighborhood: "Westpoort", type: "Full-time", lat: 52.4012, lng: 4.8201, desc: "Packing and quality checking in the greenhouse.", salary: "€13/hr" },
  { id: 11, title: "Care Assistant", company: "Cordaan", neighborhood: "Jordaan", type: "Part-time", lat: 52.3748, lng: 4.8806, desc: "Assist elderly residents. Training provided.", salary: "€14/hr" },
  { id: 12, title: "Logistics Picker", company: "Bol.com", neighborhood: "Bijlmer", type: "Full-time", lat: 52.3121, lng: 4.9474, desc: "Pick and pack orders in distribution center.", salary: "€13.50/hr" },
];

const TYPE_COLORS: Record<string, string> = {
  "Full-time": "#f97316",
  "Part-time": "#3b82f6",
  "Flexible": "#10b981",
  "Evening shifts": "#8b5cf6",
};

function makeIcon(type: string) {
  const color = TYPE_COLORS[type] || "#6b7280";
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px;height:36px;border-radius:50% 50% 50% 0;
        background:${color};border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        transform:rotate(-45deg);
      ">
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%) rotate(45deg);
          font-size:14px;line-height:1;
        ">💼</div>
      </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

export default function JobMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [52.3702, 4.8952],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    JOBS.forEach((job) => {
      const marker = L.marker([job.lat, job.lng], { icon: makeIcon(job.type) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:200px;padding:4px 0">
          <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:4px">${job.title}</div>
          <div style="font-size:12px;color:#555;margin-bottom:2px">🏢 ${job.company}</div>
          <div style="font-size:12px;color:#555;margin-bottom:6px">📍 ${job.neighborhood}</div>
          <div style="display:inline-block;background:${TYPE_COLORS[job.type] || '#6b7280'}22;color:${TYPE_COLORS[job.type] || '#6b7280'};font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;margin-bottom:8px">${job.type}</div>
          <div style="font-size:12px;color:#374151;margin-bottom:8px">${job.desc}</div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:13px;font-weight:700;color:#f97316">${job.salary}</span>
            <a href="#" style="font-size:12px;background:#f97316;color:white;padding:4px 12px;border-radius:99px;text-decoration:none;font-weight:600">Apply</a>
          </div>
        </div>
      `, { maxWidth: 260 });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
