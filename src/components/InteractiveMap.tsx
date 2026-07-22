/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Plus, 
  Minus, 
  Layers, 
  Compass, 
  Train, 
  Coffee, 
  ShoppingBag, 
  Trees, 
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';

interface InteractiveMapProps {
  locationName: string;
  price: number;
}

interface POI {
  id: string;
  name: string;
  type: 'transit' | 'food' | 'shop' | 'park';
  distance: string;
  time: string;
  x: number; // Percent from left
  y: number; // Percent from top
}

export default function InteractiveMap({ locationName, price }: InteractiveMapProps) {
  const [zoom, setZoom] = useState(15);
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'street'>('map');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [streetYaw, setStreetYaw] = useState(0); // For simulated street view panning
  const [markerCoords, setMarkerCoords] = useState({ x: 50, y: 45 });
  const [isDragging, setIsDragging] = useState(false);

  // Simulated Points of Interest relative to the main pin
  const [pois, setPois] = useState<POI[]>([
    { id: 'transit', name: 'Downtown Express Station', type: 'transit', distance: '0.3 mi', time: '6 min walk', x: 35, y: 30 },
    { id: 'coffee', name: 'Roasters Artisan Coffee', type: 'food', distance: '0.1 mi', time: '2 min walk', x: 62, y: 38 },
    { id: 'shopping', name: 'Supermarket & Retail Center', type: 'shop', distance: '0.5 mi', time: '10 min walk', x: 48, y: 72 },
    { id: 'park', name: 'Oakwood Community Park', type: 'park', distance: '0.4 mi', time: '8 min walk', x: 28, y: 55 },
  ]);

  // Handle auto-focus on selected POI or marker
  useEffect(() => {
    // Clear success message after search
    if (searchSuccess) {
      const timer = setTimeout(() => setSearchSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchSuccess]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 12));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Add a new simulated POI at a random spot close to the marker
    const newId = `custom-${Date.now()}`;
    const newPoi: POI = {
      id: newId,
      name: searchQuery,
      type: 'shop',
      distance: `${(0.1 + Math.random() * 0.5).toFixed(1)} mi`,
      time: `${Math.round(2 + Math.random() * 8)} min walk`,
      x: markerCoords.x + (Math.random() * 20 - 10),
      y: markerCoords.y + (Math.random() * 20 - 10)
    };

    setPois(prev => [newPoi, ...prev]);
    setSelectedPoi(newPoi);
    setSearchQuery('');
    setSearchSuccess(true);
  };

  const getPoiIcon = (type: POI['type']) => {
    switch (type) {
      case 'transit': return <Train className="w-3.5 h-3.5" />;
      case 'food': return <Coffee className="w-3.5 h-3.5" />;
      case 'shop': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'park': return <Trees className="w-3.5 h-3.5" />;
    }
  };

  const getPoiColor = (type: POI['type']) => {
    switch (type) {
      case 'transit': return 'bg-blue-600 text-white';
      case 'food': return 'bg-amber-500 text-white';
      case 'shop': return 'bg-purple-600 text-white';
      case 'park': return 'bg-emerald-600 text-white';
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mapType === 'street') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Smoothly set marker coordinates
    setMarkerCoords({ x, y });
    setSelectedPoi(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[480px]">
      
      {/* Map Widget Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Compass className="w-4.5 h-4.5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Listing Map Location</h3>
            <p className="text-[11px] text-slate-500 font-medium">Interactive neighbourhood safety & transit scan</p>
          </div>
        </div>

        {/* Search nearby */}
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 w-full max-w-[240px] shadow-2xs">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <input
            type="text"
            placeholder="Search nearby places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[11px] outline-none w-full font-bold text-slate-900 placeholder:text-slate-400"
          />
          {searchSuccess && (
            <span className="text-emerald-600 flex items-center shrink-0 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
            </span>
          )}
        </form>

        {/* Map view type controls */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button
            onClick={() => setMapType('map')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              mapType === 'map' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              mapType === 'satellite' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapType('street')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
              mapType === 'street' ? 'bg-white text-blue-600 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Street View
          </button>
        </div>
      </div>

      {/* Main Map Visualizer Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-100 select-none">
        
        {/* MAP VIEW GRAPHIC */}
        {mapType === 'map' && (
          <div 
            onClick={handleMapClick}
            className="absolute inset-0 transition-transform duration-300 cursor-crosshair"
            style={{ 
              transform: `scale(${zoom / 15})`,
              transformOrigin: `${markerCoords.x}% ${markerCoords.y}%`
            }}
          >
            {/* Base grid street network rendering */}
            <div className="absolute inset-0 bg-[#E2EAF4]">
              {/* Main River / Water Body */}
              <div className="absolute top-[10%] left-[-10%] w-[120%] h-[30%] bg-[#A5C9FF] transform -rotate-12 opacity-80 blur-xs"></div>
              
              {/* Primary Green Area / Parks */}
              <div className="absolute top-[45%] left-[15%] w-[25%] h-[20%] bg-[#D5EED3] rounded-[40px] opacity-90">
                <span className="absolute bottom-2 left-4 text-[9px] font-bold text-emerald-700/60 uppercase tracking-widest">Oakwood Park</span>
              </div>
              <div className="absolute top-[15%] left-[65%] w-[20%] h-[15%] bg-[#D5EED3] rounded-[24px] opacity-90"></div>

              {/* Major Roads / Grid Network */}
              {/* Horizontal primary freeway */}
              <div className="absolute top-[40%] left-[-10%] w-[120%] h-6 bg-white border-y border-slate-300 shadow-2xs"></div>
              <div className="absolute top-[40%] left-[-10%] w-[120%] h-1 bg-yellow-400 mt-2.5 border-dashed border-t border-yellow-300"></div>

              {/* Major arterial highway vertical */}
              <div className="absolute left-[50%] top-[-10%] w-6 h-[120%] bg-white border-x border-slate-300 shadow-2xs">
                <div className="absolute left-2.5 top-0 w-[2px] h-full bg-yellow-400 border-dashed"></div>
              </div>

              {/* Grid local streets */}
              <div className="absolute top-[20%] left-[-10%] w-[120%] h-2.5 bg-white border-y border-slate-200"></div>
              <div className="absolute top-[65%] left-[-10%] w-[120%] h-2.5 bg-white border-y border-slate-200"></div>
              <div className="absolute top-[80%] left-[-10%] w-[120%] h-2.5 bg-white border-y border-slate-200"></div>

              <div className="absolute left-[20%] top-[-10%] w-2.5 h-[120%] bg-white border-x border-slate-200"></div>
              <div className="absolute left-[80%] top-[-10%] w-2.5 h-[120%] bg-white border-x border-slate-200"></div>

              {/* Interactive road names */}
              <div className="absolute top-[37%] left-[6%] text-[8px] font-bold text-slate-500 uppercase tracking-wider">Broad Street Freeway</div>
              <div className="absolute left-[52%] top-[10%] text-[8px] font-bold text-slate-500 uppercase tracking-wider rotate-90 origin-left">2nd Avenue Blvd</div>
            </div>
          </div>
        )}

        {/* SATELLITE VIEW GRAPHIC */}
        {mapType === 'satellite' && (
          <div 
            onClick={handleMapClick}
            className="absolute inset-0 transition-transform duration-300 cursor-crosshair"
            style={{ 
              transform: `scale(${zoom / 15})`,
              transformOrigin: `${markerCoords.x}% ${markerCoords.y}%`
            }}
          >
            {/* Satellite photography simulation */}
            <div className="absolute inset-0 bg-[#0F172A] opacity-95">
              {/* Simulated fields, rooftops, forest patches using high contrast gradients */}
              <div className="absolute top-[10%] left-[-10%] w-[120%] h-[30%] bg-[#1E293B] transform -rotate-12 opacity-80 border-b border-indigo-900"></div>
              <div className="absolute top-[45%] left-[15%] w-[25%] h-[20%] bg-[#064E3B] rounded-[40px] opacity-70 border border-emerald-900"></div>
              <div className="absolute top-[15%] left-[65%] w-[20%] h-[15%] bg-[#064E3B] rounded-[24px] opacity-60"></div>

              {/* Roads showing as grey streaks */}
              <div className="absolute top-[40%] left-[-10%] w-[120%] h-5 bg-[#334155] border-y border-[#1E293B]"></div>
              <div className="absolute left-[50%] top-[-10%] w-5 h-[120%] bg-[#334155] border-x border-[#1E293B]"></div>

              {/* Roof outlines and buildings */}
              <div className="absolute top-[55%] left-[55%] w-8 h-8 bg-slate-500/80 border border-slate-600 rounded-xs shadow-md"></div>
              <div className="absolute top-[52%] left-[62%] w-10 h-7 bg-slate-400/80 border border-slate-500 rounded-xs shadow-md"></div>
              <div className="absolute top-[68%] left-[58%] w-12 h-8 bg-slate-500/80 border border-slate-600 rounded-xs shadow-md"></div>
              <div className="absolute top-[75%] left-[20%] w-7 h-10 bg-slate-600/80 border border-slate-500 rounded-xs shadow-md"></div>
            </div>
          </div>
        )}

        {/* STREET VIEW GRAPHIC (Simulated 360 viewer) */}
        {mapType === 'street' && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col justify-between p-4">
            {/* Panoramic street container */}
            <div className="absolute inset-0 overflow-hidden">
              <div 
                className="w-[300%] h-full flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${33.3 + (streetYaw * 0.15)}%)` }}
              >
                {/* 3 stitched neighborhood scenery panels */}
                <div className="w-full h-full relative bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-50 flex items-end">
                  <div className="w-full h-40 bg-[#D8E6D3] relative">
                    <div className="absolute bottom-0 w-full h-16 bg-slate-600"></div>
                    {/* Sidewalk & Houses */}
                    <div className="absolute bottom-16 left-12 w-28 h-20 bg-slate-100 border border-slate-300 rounded-t-lg shadow-sm"></div>
                    <div className="absolute bottom-16 left-44 w-32 h-16 bg-amber-50 border border-slate-200 rounded-t-lg shadow-sm"></div>
                    <div className="absolute bottom-16 left-[280px] w-4 h-24 bg-emerald-700 rounded-full"></div>
                  </div>
                </div>
                <div className="w-full h-full relative bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-50 flex items-end border-x-2 border-dashed border-white/20">
                  {/* Central Street Focus - where the item location likely is */}
                  <div className="w-full h-40 bg-[#D1E0CC] relative">
                    <div className="absolute bottom-0 w-full h-16 bg-slate-600"></div>
                    {/* Real-estate lawn sign */}
                    <div className="absolute bottom-12 left-[45%] w-10 h-10 bg-blue-600 text-white p-1 rounded border-2 border-white flex flex-col items-center justify-center font-bold text-[7px] shadow-lg animate-bounce">
                      <span>FOR</span>
                      <span>SALE</span>
                    </div>
                    {/* Beautiful green tree */}
                    <div className="absolute bottom-16 left-[15%] w-16 h-28 bg-emerald-600 rounded-full border border-emerald-700 flex items-center justify-center shadow-lg">
                      <Trees className="w-8 h-8 text-emerald-800/40" />
                    </div>
                    {/* Elegant villa facade */}
                    <div className="absolute bottom-16 left-[58%] w-44 h-24 bg-white border border-slate-200 rounded-t-xl shadow-lg flex flex-col justify-end p-2">
                      <div className="flex gap-1 justify-center mb-1">
                        <span className="w-4 h-6 bg-slate-700 rounded-t-sm"></span>
                        <span className="w-4 h-6 bg-slate-700 rounded-t-sm"></span>
                        <span className="w-4 h-6 bg-slate-700 rounded-t-sm"></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="w-full h-full relative bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-50 flex items-end">
                  <div className="w-full h-40 bg-[#D8E6D3] relative">
                    <div className="absolute bottom-0 w-full h-16 bg-slate-600"></div>
                    {/* Neighborhood shops / commercial zone */}
                    <div className="absolute bottom-16 left-6 w-36 h-24 bg-slate-800 border-2 border-slate-700 rounded-t-lg shadow-sm p-2 flex flex-col justify-between">
                      <span className="text-[9px] text-amber-400 font-bold tracking-widest text-center border-b border-slate-700 pb-1">DELICATESSEN</span>
                      <div className="h-6 w-full bg-slate-700 rounded-sm"></div>
                    </div>
                    <div className="absolute bottom-16 left-[200px] w-24 h-18 bg-white border border-slate-200 rounded-t-lg shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Street View Overlay HUD */}
            <div className="relative z-10 flex items-start justify-between">
              <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-mono tracking-widest rounded-lg flex items-center gap-1.5 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>360° IMMERSIVE PANORAMA</span>
              </span>
              <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs text-slate-300 text-[9px] font-bold rounded-lg border border-white/10">
                Yaw: {streetYaw}° (Relative)
              </span>
            </div>

            {/* Street View Panning Controls */}
            <div className="relative z-10 flex justify-between items-center w-full px-2">
              <button 
                onClick={() => setStreetYaw(prev => Math.max(prev - 25, -150))}
                className="w-10 h-10 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-white/15 flex items-center justify-center cursor-pointer transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setStreetYaw(prev => Math.min(prev + 25, 150))}
                className="w-10 h-10 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white border border-white/15 flex items-center justify-center cursor-pointer transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Location indicator */}
            <div className="relative z-10 bg-slate-900/80 backdrop-blur-xs text-white p-2.5 rounded-xl border border-white/10 text-center text-[11px] font-semibold max-w-sm mx-auto">
              Approximate neighborhood view near <span className="text-blue-400">{locationName}</span>. Exact listing address is kept private until contact is made.
            </div>
          </div>
        )}

        {/* DRAGGABLE LISTING PIN (Only shown on Map & Satellite) */}
        {mapType !== 'street' && (
          <div 
            className="absolute z-20 cursor-pointer group"
            style={{ 
              left: `${markerCoords.x}%`, 
              top: `${markerCoords.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Animated Ring Ripple */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-blue-500/20 rounded-full animate-ping pointer-events-none"></div>
            
            {/* Custom Location Card Popup */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg font-bold shadow-lg flex items-center gap-1 whitespace-nowrap opacity-90 group-hover:opacity-100 transition border border-white/10 pointer-events-none">
              <span className="text-blue-400">₹{price.toLocaleString('en-IN')} Listing</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-400">Perfect Spot</span>
            </div>

            {/* Pins Body */}
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition">
              <MapPin className="w-4 h-4 fill-white text-blue-600" />
            </div>
          </div>
        )}

        {/* POI PINS ON MAP */}
        {mapType !== 'street' && pois.map(poi => {
          const isSelected = selectedPoi?.id === poi.id;
          return (
            <div
              key={poi.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoi(poi);
              }}
              className="absolute z-10 cursor-pointer group transition-all duration-300"
              style={{
                left: `${poi.x}%`,
                top: `${poi.y}%`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              {/* Path connector line (if selected) */}
              {isSelected && (
                <svg className="absolute overflow-visible pointer-events-none" style={{ left: 8, top: 12, width: 200, height: 200 }}>
                  <path
                    d={`M 0 0 L ${(markerCoords.x - poi.x) * 3} ${(markerCoords.y - poi.y) * 3}`}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    className="animate-dash"
                  />
                </svg>
              )}

              {/* Pin representation */}
              <div className={`p-1.5 rounded-lg flex items-center gap-1 shadow-sm transition ${
                isSelected 
                  ? 'bg-slate-900 text-white ring-2 ring-blue-500 scale-110 z-30' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:scale-105 hover:z-20'
              }`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? 'bg-blue-600' : getPoiColor(poi.type)}`}>
                  {getPoiIcon(poi.type)}
                </div>
                {isSelected && (
                  <span className="text-[9px] font-black tracking-tight">{poi.name}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Map scale, coordinates & HUD overlay */}
        {mapType !== 'street' && (
          <>
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 rounded-lg shadow-sm border border-slate-200/50 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Area: {locationName}</span>
              </span>
            </div>

            {/* Compass HUD */}
            <div className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-xs rounded-lg border border-slate-200/50 shadow-sm pointer-events-auto cursor-pointer" onClick={() => setMarkerCoords({ x: 50, y: 45 })}>
              <Compass className="w-4 h-4 text-slate-600 hover:text-blue-600" />
            </div>

            {/* Map Actions Grid / Zoom Controls */}
            <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1.5">
              <button 
                onClick={handleZoomIn}
                className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200/80 shadow-sm flex items-center justify-center font-bold text-sm transition cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={handleZoomOut}
                className="w-8 h-8 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200/80 shadow-sm flex items-center justify-center font-bold text-sm transition cursor-pointer active:scale-95"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Map instructions on how to use */}
            <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/50 text-[10px] text-slate-500 font-semibold pointer-events-none">
              Click anywhere on map to update pin position
            </div>
          </>
        )}
      </div>

      {/* Neighborhood Transit / Amenities Panel (Interactive POI list) */}
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {pois.map(poi => (
          <button
            key={poi.id}
            onClick={() => setSelectedPoi(poi)}
            className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              selectedPoi?.id === poi.id 
                ? 'bg-blue-50/80 border-blue-200 ring-1 ring-blue-400/20' 
                : 'bg-white border-slate-200/60 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-800">
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${getPoiColor(poi.type)}`}>
                {getPoiIcon(poi.type)}
              </div>
              <span className="truncate">{poi.id.startsWith('custom') ? 'Custom Place' : poi.id.toUpperCase()}</span>
            </div>
            
            <div className="mt-1">
              <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">{poi.name}</div>
              <div className="text-[9px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <span>{poi.distance}</span>
                <span>•</span>
                <span className="text-blue-600 font-semibold">{poi.time}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
