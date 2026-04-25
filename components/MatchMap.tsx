'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MatchedJobPin {
  id: string;
  title: string;
  type: string;
  salary: string;
  location: string;
  url: string;
  lat?: number | null;
  lng?: number | null;
  score?: number;
  similarity?: number;
}

export function scoreColor(score: number): string {
  if (score >= 0.70) return '#00e5a0';
  if (score >= 0.55) return '#f59e0b';
  return '#ff6b35';
}

function makePin(score: number, rank: number, active = false): L.DivIcon {
  const color = scoreColor(score);
  const size = active ? 40 : 32;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${active ? 3 : 2}px solid ${active ? '#fff' : 'rgba(255,255,255,0.85)'};box-shadow:0 ${active ? 3 : 2}px ${active ? 12 : 6}px rgba(0,0,0,${active ? 0.5 : 0.3});display:flex;align-items:center;justify-content:center;font-size:${active ? 14 : 11}px;font-weight:800;color:#0a0a0f;font-family:system-ui,sans-serif;transition:all 0.15s;">${rank}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 8)],
  });
}

interface Props {
  jobs: MatchedJobPin[];
  selected?: MatchedJobPin | null;
  onSelect?: (job: MatchedJobPin) => void;
}

export default function MatchMap({ jobs, selected, onSelect }: Props) {
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
      zoom: 10,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Place markers when jobs load
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};

    const placed = jobs.filter(j => j.lat && j.lng);
    placed.forEach((job, idx) => {
      const rank = idx + 1;
      const score = job.score ?? job.similarity ?? 0;
      const color = scoreColor(score);
      const pct = Math.round(score * 100);

      const marker = L.marker([job.lat!, job.lng!], { icon: makePin(score, rank) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px 0">
          <div style="margin-bottom:6px">
            <span style="background:${color};color:#0a0a0f;font-size:11px;font-weight:800;padding:2px 9px;border-radius:99px">#${rank} &nbsp;·&nbsp; ${pct}% match</span>
          </div>
          <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:3px;line-height:1.3">${job.title}</div>
          <div style="font-size:11px;color:#777;margin-bottom:4px">📍 ${job.location}</div>
          <div style="font-size:11px;color:#888;margin-bottom:10px">⏰ ${job.type} &nbsp;·&nbsp; 💶 ${job.salary}</div>
          <a href="${job.url}" target="_blank" rel="noopener noreferrer"
             style="display:block;text-align:center;background:${color};color:#0a0a0f;padding:7px 0;border-radius:99px;font-size:12px;font-weight:700;text-decoration:none">
            Solliciteren →
          </a>
        </div>
      `, { maxWidth: 260 });

      marker.on('click', () => onSelectRef.current?.(job));
      markersRef.current[job.id] = marker;
    });

    if (placed.length > 1) {
      const group = L.featureGroup(Object.values(markersRef.current));
      map.fitBounds(group.getBounds().pad(0.12), { maxZoom: 13, animate: false });
    }
  }, [jobs]);

  // Highlight selected marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const placed = jobs.filter(j => j.lat && j.lng);
    placed.forEach((job, idx) => {
      const marker = markersRef.current[job.id];
      if (marker) marker.setIcon(makePin(job.score ?? job.similarity ?? 0, idx + 1, false));
    });

    if (!selected?.lat || !selected?.lng) return;
    const selIdx = placed.findIndex(j => j.id === selected.id);
    const marker = markersRef.current[selected.id];
    if (!marker) return;

    marker.setIcon(makePin(selected.score ?? selected.similarity ?? 0, selIdx + 1, true));
    map.flyTo([selected.lat, selected.lng], 14, { duration: 0.6 });
    marker.openPopup();
  }, [selected, jobs]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
