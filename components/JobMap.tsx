'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface Job {
  id: string;
  title: string;
  category: string;
  type: string;
  salary: string;
  location: string;
  url: string;
  lat: number;
  lng: number;
}

const TYPE_COLORS: Record<string, string> = {
  'Full-time':           '#f97316',
  'Part-time':           '#3b82f6',
  'Full-time / Part-time': '#8b5cf6',
  'Flexible':            '#10b981',
  'Evening':             '#8b5cf6',
  'Weekend':             '#ec4899',
  'Traineeship':         '#0ea5e9',
  'Temporary':           '#f59e0b',
};

function colorFor(type: string) {
  return TYPE_COLORS[type] || '#6b7280';
}

function makeIcon(type: string, active = false) {
  const color = colorFor(type);
  const size = active ? 38 : 30;
  const border = active ? 4 : 3;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${color};border:${border}px solid ${active ? '#111' : 'white'};box-shadow:0 2px 8px rgba(0,0,0,${active ? '0.4' : '0.25'});transform:rotate(-45deg);transition:all 0.15s"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(45deg);font-size:${active ? 15 : 12}px">💼</div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 6)],
  });
}

interface Props {
  jobs: Job[];
  selected?: Job | null;
  onSelect?: (job: Job) => void;
}

export default function JobMap({ jobs, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [52.3702, 4.8952],
      zoom: 11,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Re-render markers whenever jobs list changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    jobs.forEach((job) => {
      if (!job.lat || !job.lng) return;
      const color = colorFor(job.type);
      const marker = L.marker([job.lat, job.lng], { icon: makeIcon(job.type) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:210px;padding:4px 0">
          <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:4px;line-height:1.3">${job.title}</div>
          <div style="font-size:11px;color:#777;margin-bottom:6px">📍 ${job.location} · ${job.category}</div>
          <div style="display:inline-block;background:${color}22;color:${color};font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px;margin-bottom:8px">${job.type}</div>
          <div style="font-size:13px;font-weight:700;color:#f97316;margin-bottom:10px">${job.salary}</div>
          <a href="${job.url}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;background:#f97316;color:white;padding:6px 0;border-radius:99px;font-size:12px;font-weight:600;text-decoration:none">View job →</a>
        </div>
      `, { maxWidth: 270 });

      marker.on('click', () => {
        onSelectRef.current?.(job);
      });

      markersRef.current[job.id] = marker;
    });
  }, [jobs]);

  // Fly to + highlight selected job (triggered by sidebar click or pin click)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Reset all marker icons
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const job = jobs.find(j => j.id === id);
      if (job) marker.setIcon(makeIcon(job.type, false));
    });

    if (!selected) return;
    const marker = markersRef.current[selected.id];
    if (!marker) return;

    marker.setIcon(makeIcon(selected.type, true));
    map.flyTo([selected.lat, selected.lng], 14, { duration: 0.7 });
    marker.openPopup();
  }, [selected, jobs]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
