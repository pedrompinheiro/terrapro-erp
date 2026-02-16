
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Radio, Search, Gauge, Map as MapIcon, Key, Battery, Signal, Zap, MapPin, Locate, ChevronLeft, Layers, Play, Pause, Maximize, AlertTriangle, CloudRain, Sun, Moon, Calendar, History, Settings } from 'lucide-react';
import { fleetManagementService } from '../services/fleetService';
import { Asset, AssetStatus } from '../types';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, CircleMarker, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';

// Fix Leaflet Default Icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
   iconUrl: markerIcon,
   shadowUrl: markerShadow,
   iconSize: [25, 41],
   iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const createVehicleIcon = (type: string, status: AssetStatus, isSelected: boolean) => {
   let color = status === 'OPERATING' ? '#10b981' : status === 'IDLE' ? '#f59e0b' : '#64748b';
   if (isSelected) color = '#3b82f6';

   const html = `
        <div style="
            background-color: ${color};
            width: ${isSelected ? '40px' : '32px'};
            height: ${isSelected ? '40px' : '32px'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
        </div>
        <div style="margin-top:4px;background:rgba(0,0,0,0.8);color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;text-align:center;white-space:nowrap;">
            ${type}
        </div>
    `;

   return L.divIcon({ html, className: '', iconSize: [32, 50], iconAnchor: [16, 50] });
};

const createEventIcon = (type: 'START' | 'STOP') => {
   return L.divIcon({
      html: `<div style="background:${type === 'START' ? '#10b981' : '#ef4444'};width:12px;height:12px;border-radius:50%;border:2px solid white;"></div>`,
      className: '', iconSize: [12, 12]
   });
};

type ViewMode = 'LIVE' | 'HISTORY';

const MapUpdater = ({ center }: { center: [number, number] | null }) => {
   const map = useMap();
   useEffect(() => { if (center) map.flyTo(center, 15); }, [center, map]);
   return null;
};

const MapDigital: React.FC = () => {
   const [assets, setAssets] = useState<Asset[]>([]);
   const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<ViewMode>('LIVE');
   const [mapCenter, setMapCenter] = useState<[number, number]>([-15.6014, -56.0979]);

   // History State
   const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);
   const [historyPoints, setHistoryPoints] = useState<any[]>([]);
   const [playbackIndex, setPlaybackIndex] = useState(0);
   const [isPlaying, setIsPlaying] = useState(false);
   const playbackInterval = useRef<NodeJS.Timeout | null>(null);

   // Load Live Data
   useEffect(() => {
      const loadAssets = async () => {
         if (assets.length === 0) setLoading(true);
         try {
            const data = await fleetManagementService.getAssets();
            setAssets(data);
            if (!selectedAssetId && data.length > 0) {
               const first = data.find(a => a.coordinates?.lat && a.coordinates.lat !== 0);
               if (first) setMapCenter([first.coordinates!.lat, first.coordinates!.lng]);
            }
         } catch (error) { console.error(error); } finally { setLoading(false); }
      };
      loadAssets();
      const interval = setInterval(loadAssets, 10000);
      return () => clearInterval(interval);
   }, []);

   // Load History Data
   useEffect(() => {
      if (viewMode === 'HISTORY' && selectedAssetId) {
         const loadHistory = async () => {
            const { data, error } = await supabase
               .from('asset_positions')
               .select('*')
               .eq('asset_id', selectedAssetId)
               .gte('timestamp', `${historyDate}T00:00:00`)
               .lte('timestamp', `${historyDate}T23:59:59`)
               .order('timestamp', { ascending: true });

            if (data && data.length > 0) {
               let lastIgn = false;
               const points = data.map((d, i) => {
                  let evt = null;
                  if (d.ignition && !lastIgn) evt = 'START';
                  if (!d.ignition && lastIgn) evt = 'STOP';
                  lastIgn = d.ignition;
                  return { ...d, lat: d.latitude, lng: d.longitude, event: evt, index: i };
               });
               setHistoryPoints(points);
               setPlaybackIndex(0);
               setMapCenter([points[0].lat, points[0].lng]);
            } else {
               setHistoryPoints([]);
               if (!isLoadingAsset) alert("Nenhum histórico encontrado para esta data.");
            }
         };
         loadHistory();
      }
   }, [viewMode, selectedAssetId, historyDate]);

   // Playback Function
   useEffect(() => {
      if (isPlaying) {
         playbackInterval.current = setInterval(() => {
            setPlaybackIndex(p => (p >= historyPoints.length - 1 ? (setIsPlaying(false), p) : p + 1));
         }, 200);
      } else if (playbackInterval.current) {
         clearInterval(playbackInterval.current);
      }
      return () => clearInterval(playbackInterval.current!);
   }, [isPlaying, historyPoints]);

   const filteredAssets = assets.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase())
   );
   const connectedCount = assets.filter(a => a.coordinates && a.coordinates.lat !== 0).length;
   const selectedAsset = assets.find(a => a.id === selectedAssetId);
   const validAssets = filteredAssets.filter(a => a.coordinates && a.coordinates.lat !== 0);
   const historyPolyline = historyPoints.map(p => [p.lat, p.lng] as [number, number]);
   const currentHistoryPoint = historyPoints[playbackIndex];
   const isLoadingAsset = loading && assets.length === 0;

   // Auto-Tracker (Frontend-based Backup for History)
   useEffect(() => {
      if (assets.length === 0) return;

      const tracker = async () => {
         console.log("🛠️ Auto-Tracker: Verificando posições...");
         try {
            const { fetchFleetPositions } = await import('../services/selsyn');
            const positions = await fetchFleetPositions();

            if (positions.length > 0) {
               const inserts: any[] = [];
               for (const pos of positions) {
                  // Normalize logic
                  const pName = pos.rastreavel ? pos.rastreavel.toUpperCase().replace(/[\s-]/g, '') : '';
                  const pCode = pos.identificador.toUpperCase().replace(/[\s-]/g, '');

                  const asset = assets.find(a => {
                     const aCode = a.code.toUpperCase().replace(/[\s-]/g, '');
                     const aName = a.name.toUpperCase().replace(/[\s-]/g, '');
                     return pCode === aCode || pName === aCode || pName === aName;
                  });

                  if (asset) {
                     inserts.push({
                        asset_id: asset.id,
                        latitude: pos.latitude,
                        longitude: pos.longitude,
                        speed: pos.velocidade || 0,
                        ignition: pos.ignicao || false,
                        timestamp: pos.dataHora || new Date().toISOString(),
                        meta: pos
                     });
                  }
               }

               if (inserts.length > 0) {
                  const { error } = await supabase.from('asset_positions').insert(inserts);
               }
            }
         } catch (e) { console.error("AutoTracker Exception:", e); }
      };

      // Run immediately ensuring no duplicates if recently run? No, just loop.
      const interval = setInterval(tracker, 60000); // Reativado: Servidor Selsyn voltou
      return () => clearInterval(interval);
   }, [assets]);

   return (
      <div className="flex h-full overflow-hidden bg-slate-950 text-white font-sans">
         {/* SIDEBAR */}
         <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900 z-20 shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800">
               <div className="flex items-center justify-between mb-4">
                  <h1 className="font-bold flex items-center gap-2 text-lg">
                     <MapIcon className="text-blue-500" /> Mapa Digital
                  </h1>
                  <div className="flex bg-slate-800 rounded p-1">
                     <button onClick={() => setViewMode('LIVE')} className={`px-3 py-1 text-xs rounded ${viewMode === 'LIVE' ? 'bg-blue-600' : 'text-slate-400'}`}>Ao Vivo</button>
                     <button onClick={() => setViewMode('HISTORY')} className={`px-3 py-1 text-xs rounded ${viewMode === 'HISTORY' ? 'bg-blue-600' : 'text-slate-400'}`}>Histórico</button>
                  </div>
               </div>

               {/* Controls */}
               {viewMode === 'LIVE' ? (
                  <div className="space-y-2">
                     <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{connectedCount} Rastreando</span>
                        {connectedCount === 0 && <span className="text-red-400 flex items-center gap-1"><AlertTriangle size={10} /> Sem Sinal</span>}
                     </div>
                     {connectedCount === 0 && (
                        <button onClick={async () => {
                           if (!confirm("Sincronizar base de veículos?")) return;
                           try {
                              const { importSelsynVehicles } = await import('../services/selsynImporter');
                              await importSelsynVehicles(console.log);
                              alert("Sincronizado! Recarregando...");
                              window.location.reload();
                           } catch (e) { alert("Erro: " + e); }
                        }} className="w-full bg-emerald-500/10 text-emerald-500 text-xs py-2 rounded hover:bg-emerald-500/20">
                           🔄 Sincronizar Cadastro
                        </button>
                     )}
                  </div>
               ) : (
                  <div className="space-y-2">
                     <label className="text-xs text-slate-400">Data do Histórico</label>
                     <div className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                        <Calendar size={14} className="text-slate-500" />
                        <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)} className="bg-transparent text-sm w-full outline-none" />
                     </div>
                     {!selectedAssetId && <p className="text-xs text-yellow-500">Selecione um veículo abaixo.</p>}
                  </div>
               )}

               <div className="mt-4 relative">
                  <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                  <input
                     value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                     placeholder="Buscar veículo..."
                     className="w-full bg-slate-950 rounded pl-9 pr-3 py-2 text-sm outline-none border border-slate-800 focus:border-blue-500"
                  />
               </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
               {filteredAssets.map(asset => (
                  <div key={asset.id} onClick={() => { setSelectedAssetId(asset.id); if (asset.coordinates?.lat) setMapCenter([asset.coordinates.lat, asset.coordinates.lng]); }}
                     className={`p-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800 ${selectedAssetId === asset.id ? 'bg-slate-800 border-l-4 border-l-blue-500' : ''}`}
                  >
                     <div className="flex justify-between">
                        <span className="font-bold text-sm">{asset.code}</span>
                        <span className={`text-[10px] px-1 rounded ${asset.status === 'OPERATING' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>{asset.status}</span>
                     </div>
                     <p className="text-xs text-slate-400 truncate">{asset.name}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* MAP AREA */}
         <div className="flex-1 relative">
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
               <LayersControl position="topright">
                  <LayersControl.BaseLayer name="Satélite (Esri)">
                     <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                     />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer checked name="Modo Escuro (Dark)">
                     <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                     />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Mapa de Ruas (Light)">
                     <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
                     />
                  </LayersControl.BaseLayer>
               </LayersControl>

               <MapUpdater center={viewMode === 'LIVE' ? (selectedAssetId && selectedAsset?.coordinates?.lat ? [selectedAsset.coordinates.lat, selectedAsset.coordinates.lng] : mapCenter) : (currentHistoryPoint ? [currentHistoryPoint.lat, currentHistoryPoint.lng] : mapCenter)} />

               {viewMode === 'LIVE' ? (
                  validAssets.map(asset => (
                     <Marker key={asset.id} position={[asset.coordinates!.lat, asset.coordinates!.lng]} icon={createVehicleIcon(asset.code, asset.status, selectedAssetId === asset.id)}
                        eventHandlers={{ click: () => { setSelectedAssetId(asset.id); setMapCenter([asset.coordinates!.lat, asset.coordinates!.lng]); } }}>
                        <Popup><b className="text-slate-900">{asset.name}</b></Popup>
                     </Marker>
                  ))
               ) : (
                  <>
                     {historyPoints.length > 0 && <Polyline positions={historyPolyline} color="#3b82f6" weight={3} opacity={0.7} />}
                     {historyPoints.map((p, i) => p.event && (
                        <Marker key={i} position={[p.lat, p.lng]} icon={createEventIcon(p.event)}>
                           <Popup>{p.event} at {new Date(p.timestamp).toLocaleTimeString()}</Popup>
                        </Marker>
                     ))}
                     {currentHistoryPoint && (
                        <Marker position={[currentHistoryPoint.lat, currentHistoryPoint.lng]} icon={createVehicleIcon(selectedAsset?.code || '?', AssetStatus.OPERATING, true)} zIndexOffset={100} />
                     )}
                  </>
               )}
            </MapContainer>

            {/* OVERLAYS */}
            {viewMode === 'HISTORY' && historyPoints.length > 0 && (
               <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl flex items-center gap-4 z-[1000]">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500">
                     {isPlaying ? <Pause fill="white" /> : <Play fill="white" className="ml-1" />}
                  </button>
                  <div className="flex-1">
                     <input type="range" min={0} max={historyPoints.length - 1} value={playbackIndex}
                        onChange={e => { setPlaybackIndex(Number(e.target.value)); setIsPlaying(false); }}
                        className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>{new Date(historyPoints[0].timestamp).toLocaleTimeString()}</span>
                        <span className="text-white font-bold">{new Date(currentHistoryPoint?.timestamp).toLocaleTimeString()}</span>
                        <span>{new Date(historyPoints[historyPoints.length - 1].timestamp).toLocaleTimeString()}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-xs text-slate-400">Velocidade</div>
                     <div className="font-mono font-bold text-lg">{currentHistoryPoint?.speed || 0} km/h</div>
                  </div>
               </div>
            )}

            {/* Live Card Info */}
            {viewMode === 'LIVE' && selectedAsset && (
               <div className="absolute top-6 right-6 w-72 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl z-[1000] shadow-2xl">
                  <h3 className="font-bold text-white mb-4">{selectedAsset.name}</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                     <div className="bg-slate-800 p-2 rounded"><span className="text-[10px] block text-slate-400">Velocidade</span><span className="font-mono text-lg">{selectedAsset.telemetry?.speed} km/h</span></div>
                     <div className="bg-slate-800 p-2 rounded"><span className="text-[10px] block text-slate-400">Voltagem</span><span className="font-mono text-lg">{selectedAsset.telemetry?.voltage} V</span></div>
                  </div>
                  <div className="text-[10px] text-slate-500 text-right">{selectedAsset.telemetry?.lastUpdate}</div>
               </div>
            )}
         </div>
      </div>
   );
};

export default MapDigital;
