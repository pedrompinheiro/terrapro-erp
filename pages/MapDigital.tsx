
import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Zap, Battery, Signal, Navigation, Search, Key, Gauge, Radio, Locate, MapPin, RefreshCw, X, Play, Pause, ChevronLeft, ChevronRight, AlertTriangle, Info, Clock, Layers, Maximize } from 'lucide-react';
import { dashboardService } from '../services/api';
import { Asset } from '../types';

type ViewMode = 'LIVE' | 'HISTORY';

interface HistoryPoint {
   id: number;
   lat: number;
   lng: number;
   timestamp: string;
   speed: number;
   ignition: boolean;
   event?: 'STOP' | 'START' | 'SPEEDING' | 'GEOFENCE';
}

const mockHistoryData: HistoryPoint[] = Array.from({ length: 50 }, (_, i) => ({
   id: i,
   lat: 30 + (i * 0.5), // Simulated coords
   lng: 40 + (Math.sin(i) * 10),
   timestamp: `30/01/2026 17:${String(i).padStart(2, '0')}:12`,
   speed: i % 10 === 0 ? 0 : Math.floor(Math.random() * 60),
   ignition: i % 10 !== 0,
   event: i % 15 === 0 ? 'SPEEDING' : i % 10 === 0 ? 'STOP' : undefined
}));

const MapDigital: React.FC = () => {
   const [assets, setAssets] = useState<Asset[]>([]);
   const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<ViewMode>('LIVE');

   // History State
   const [historyPoints, setHistoryPoints] = useState<HistoryPoint[]>([]);
   const [isPlaying, setIsPlaying] = useState(false);
   const [playbackIndex, setPlaybackIndex] = useState(0);
   const playbackInterval = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {
      const loadAssets = async () => {
         try {
            const data = await dashboardService.getAssets() as Asset[];
            setAssets(data);
            if (data.length > 0) setSelectedAssetId(data[0].id);
         } catch (error) {
            console.error("Failed to load assets", error);
         } finally {
            setLoading(false);
         }
      };
      loadAssets();
   }, []);

   // Load history when entering history mode
   useEffect(() => {
      if (viewMode === 'HISTORY') {
         setHistoryPoints(mockHistoryData);
         setPlaybackIndex(0);
      }
   }, [viewMode]);

   // Playback Logic
   useEffect(() => {
      if (isPlaying) {
         playbackInterval.current = setInterval(() => {
            setPlaybackIndex(prev => {
               if (prev >= historyPoints.length - 1) {
                  setIsPlaying(false);
                  return prev;
               }
               return prev + 1;
            });
         }, 500);
      } else {
         if (playbackInterval.current) clearInterval(playbackInterval.current);
      }
      return () => {
         if (playbackInterval.current) clearInterval(playbackInterval.current);
      };
   }, [isPlaying, historyPoints]);

   const selectedAsset = assets.find(a => a.id === selectedAssetId);
   const filteredAssets = assets.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const activeCount = assets.filter(a => a.status === 'OPERATING').length;

   if (loading) {
      return (
         <div className="flex h-full items-center justify-center bg-slate-950 text-white">
            <div className="flex flex-col items-center gap-4">
               <RefreshCw className="animate-spin text-emerald-500" size={40} />
               <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Carregando Satélites...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="flex h-full overflow-hidden bg-slate-950">
         {/* Sidebar toggle based on mode */}
         {viewMode === 'LIVE' ? (
            <div className="w-96 border-r border-slate-800 flex flex-col bg-slate-900 z-10 transition-all">
               <div className="p-4 border-b border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                     <h2 className="font-bold text-white flex items-center gap-2">
                        <Radio size={18} className="text-emerald-500 animate-pulse" />
                        Frota Conectada
                     </h2>
                     <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
                        {activeCount} Online
                     </span>
                  </div>
                  <div className="relative">
                     <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                     <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar ativo ou placa..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {filteredAssets.map(asset => (
                     <div
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`p-4 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors group ${selectedAssetId === asset.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                           }`}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <span className="font-bold text-white text-sm">{asset.name}</span>
                           {asset.telemetry?.ignition ? (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">
                                 <Key size={10} /> ON
                              </span>
                           ) : (
                              <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-500/10 px-1.5 py-0.5 rounded">
                                 <Key size={10} /> OFF
                              </span>
                           )}
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400">
                           <span>{asset.id}</span>
                           <span className="flex items-center gap-1">
                              <Gauge size={12} /> {asset.telemetry?.speed || 0} km/h
                           </span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 truncate flex items-center gap-1">
                           <MapIcon size={10} />
                           {asset.telemetry?.address || 'Localização não disponível'}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ) : null}

         {/* Main Map Visualization */}
         <div className="flex-1 relative bg-[#0f1014] overflow-hidden">
            {/* Simulated Map Background - Darker for History */}
            <div
               className="absolute inset-0 opacity-30"
               style={{
                  backgroundImage: viewMode === 'HISTORY'
                     ? 'url(https://mt1.google.com/vt/lyrs=s&x=1&y=1&z=1)' // Mock Satellite texture concept
                     : 'radial-gradient(#334155 1px, transparent 1px)',
                  backgroundSize: 'cover',
                  backgroundColor: '#0f1710' // Dark green tint for satellite feel
               }}
            >
               {/* CSS Grid Overlay */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            {/* Map Controls (Top Left) */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
               <button className="p-2 bg-white text-slate-900 rounded-lg shadow-xl hover:bg-slate-200"><Search size={20} /></button>
               <button className="p-2 bg-white text-slate-900 rounded-lg shadow-xl hover:bg-slate-200"><Maximize size={20} /></button>
            </div>
            {/* Map Layer Controls (Top Right - Inside Map) */}
            <div className="absolute top-4 right-4 z-20 bg-white p-2 rounded-lg shadow-xl flex flex-col gap-2">
               <button className="p-1 hover:bg-slate-100 rounded" title="Map Layers"><Layers size={20} className="text-slate-700" /></button>
            </div>

            {/* Render LIVE Assets or HISTORY Path */}
            {viewMode === 'LIVE' ? (
               assets.map((asset, index) => (
                  <div
                     key={asset.id}
                     onClick={() => setSelectedAssetId(asset.id)}
                     className={`absolute cursor-pointer transition-all duration-500 flex flex-col items-center group
                                        ${selectedAssetId === asset.id ? 'z-50 scale-110' : 'z-0 opacity-70 hover:opacity-100'}
                                    `}
                     style={{
                        top: `${40 + (index * 15)}%`,
                        left: `${30 + (index * 20)}%`
                     }}
                  >
                     <div className={`
                                        relative flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-2xl transition-all
                                        ${selectedAssetId === asset.id
                           ? 'bg-blue-600 border-white shadow-blue-500/50'
                           : asset.telemetry?.ignition
                              ? 'bg-emerald-600 border-slate-900 group-hover:border-emerald-400'
                              : 'bg-slate-700 border-slate-900 group-hover:border-slate-500'
                        }
                                    `}>
                        <Navigation size={20} className="text-white fill-white transform rotate-45" />
                        {asset.telemetry?.speed && asset.telemetry.speed > 0 && (
                           <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30 animate-ping"></span>
                        )}
                     </div>
                     <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-all ${selectedAssetId === asset.id ? 'bg-white text-black scale-100' : 'bg-slate-900 text-white scale-0 group-hover:scale-100'}`}>
                        {asset.name}
                     </div>
                  </div>
               ))
            ) : (
               // HISTORY SVG PATH OVERLAY
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <defs>
                     <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                        <path d="M0,0 L0,10 L10,5 z" fill="#10b981" />
                     </marker>
                  </defs>
                  {/* Simulation of a chaotic path */}
                  <polyline
                     points="200,100 250,150 220,200 300,300 400,250 500,350"
                     fill="none"
                     stroke="#3b82f6"
                     strokeWidth="4"
                     strokeDasharray="10,5"
                  />
                  {/* Drawing simulated points */}
                  {historyPoints.slice(0, playbackIndex + 1).map((pt, i) => (
                     <g key={i} transform={`translate(${200 + (i * 10)}, ${100 + (Math.sin(i) * 50) + (i * 5)})`}>
                        <circle r="4" fill={pt.event === 'STOP' ? '#ef4444' : pt.event === 'SPEEDING' ? '#f59e0b' : '#10b981'} stroke="white" strokeWidth="2" />
                     </g>
                  ))}
                  {/* Current Playback Head */}
                  <g transform={`translate(${200 + (playbackIndex * 10)}, ${100 + (Math.sin(playbackIndex) * 50) + (playbackIndex * 5)})`}>
                     <circle r="10" fill="white" className="animate-pulse" />
                     <circle r="6" fill="#10b981" />
                  </g>
               </svg>
            )}

            {/* Floating Detail Card (LIVE) */}
            {viewMode === 'LIVE' && selectedAsset && (
               <div className="absolute top-6 right-6 w-96 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-right-4 z-30">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                        <h3 className="text-xl font-black text-white">{selectedAsset.name}</h3>
                        <p className="text-sm font-bold text-slate-500">{selectedAsset.id} • {selectedAsset.telemetry?.deviceModel}</p>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Última Atualização</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded">
                           {selectedAsset.telemetry?.lastUpdate.split(' ')[1]}
                        </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                           <Zap size={14} className="text-yellow-400" />
                           <span className="text-[10px] uppercase font-bold text-slate-400">Voltagem</span>
                        </div>
                        <p className="text-lg font-black text-white">{selectedAsset.telemetry?.voltage} V</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                           <Battery size={14} className={selectedAsset.telemetry?.batteryLevel && selectedAsset.telemetry.batteryLevel < 30 ? 'text-red-400' : 'text-emerald-400'} />
                           <span className="text-[10px] uppercase font-bold text-slate-400">Bateria Int.</span>
                        </div>
                        <p className="text-lg font-black text-white">{selectedAsset.telemetry?.batteryLevel}%</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                           <Gauge size={14} className="text-blue-400" />
                           <span className="text-[10px] uppercase font-bold text-slate-400">Velocidade</span>
                        </div>
                        <p className="text-lg font-black text-white">{selectedAsset.telemetry?.speed} km/h</p>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                           <Signal size={14} className="text-purple-400" />
                           <span className="text-[10px] uppercase font-bold text-slate-400">Satélites</span>
                        </div>
                        <p className="text-lg font-black text-white">{selectedAsset.telemetry?.satelliteCount}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex dark:bg-slate-950 p-3 rounded-xl border border-slate-800 gap-3">
                        <MapPin className="text-slate-400 shrink-0 mt-0.5" size={16} />
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Localização Atual</p>
                           <p className="text-xs font-bold text-slate-200 leading-relaxed">
                              {selectedAsset.telemetry?.address}
                           </p>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2">
                           <Locate size={14} /> Rastrear Agora
                        </button>
                        <button
                           onClick={() => setViewMode('HISTORY')}
                           className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase transition-colors"
                        >
                           Histórico
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* History Sidebar (Right Side) */}
         {viewMode === 'HISTORY' && (
            <div className="w-[400px] border-l border-slate-800 flex flex-col bg-white z-20 shadow-2xl animate-in slide-in-from-right">
               {/* History Header */}
               <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-3">
                     <button onClick={() => setViewMode('LIVE')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <ChevronLeft size={20} className="text-gray-600" />
                     </button>
                     <div>
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-wide">Histórico</h2>
                        <p className="text-xs text-gray-500 font-bold">{selectedAsset?.name}</p>
                     </div>
                  </div>
                  <div className="flex gap-1">
                     <button className="p-2 text-gray-600 hover:bg-gray-200 rounded"><RefreshCw size={16} /></button>
                     <button className="p-2 text-gray-600 hover:bg-gray-200 rounded"><layers size={16} /></button>
                  </div>
               </div>

               {/* Timeline Controls */}
               <div className="p-4 bg-gray-100 border-b border-gray-200 space-y-3">
                  <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                     <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                     >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                     </button>
                     <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Playback</p>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(playbackIndex / historyPoints.length) * 100}%` }}></div>
                        </div>
                     </div>
                     <span className="text-xs font-mono font-bold text-gray-600">{playbackIndex}/{historyPoints.length}</span>
                  </div>
               </div>

               {/* Events List Table */}
               <div className="flex-1 overflow-y-auto bg-white">
                  <table className="w-full text-left">
                     <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr className="text-[10px] uppercase font-black text-gray-500 tracking-wider">
                           <th className="px-4 py-3">Data/Hora</th>
                           <th className="px-2 py-3 text-center">Vel</th>
                           <th className="px-2 py-3 text-center">Ignição</th>
                           <th className="px-2 py-3 text-center">Evento</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {historyPoints.map((pt, idx) => (
                           <tr
                              key={pt.id}
                              onClick={() => setPlaybackIndex(idx)}
                              className={`cursor-pointer transition-colors hover:bg-blue-50 ${idx === playbackIndex ? 'bg-blue-100 ring-2 ring-inset ring-blue-500' : ''}`}
                           >
                              <td className="px-4 py-3 text-xs font-mono font-medium text-gray-700">{pt.timestamp}</td>
                              <td className="px-2 py-3 text-center text-xs font-bold text-gray-800">{pt.speed} km/h</td>
                              <td className="px-2 py-3 text-center">
                                 <div className="flex justify-center">
                                    {pt.ignition ?
                                       <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center"><Zap size={12} className="text-emerald-600" fill="currentColor" /></div> :
                                       <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center"><Zap size={12} className="text-gray-400" /></div>
                                    }
                                 </div>
                              </td>
                              <td className="px-2 py-3 text-center">
                                 {pt.event && (
                                    <div className="flex justify-center tooltip" title={pt.event}>
                                       {pt.event === 'STOP' && <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center"><OctagonPause size={12} className="text-red-600" /></div>}
                                       {pt.event === 'SPEEDING' && <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center"><AlertTriangle size={12} className="text-amber-600" /></div>}
                                    </div>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}
      </div>
   );
};

// Start Icon helper
const OctagonPause = ({ size, className }: { size: number, className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <rect x="9" y="8" width="2" height="8" fill="currentColor" stroke="none" />
      <rect x="13" y="8" width="2" height="8" fill="currentColor" stroke="none" />
   </svg>
);

export default MapDigital;
