
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Map as MapIcon, Play, Pause, AlertTriangle, Calendar, Satellite, Navigation, Fuel, Clock, Gauge, Activity, Radio, Wifi, WifiOff, ChevronRight, RotateCcw, MapPin, Crosshair, Thermometer, Zap, TrendingUp } from 'lucide-react';
import { fleetManagementService } from '../services/fleetService';
import { checkSelsynKeyExpiration } from '../services/selsyn';
import { Asset, AssetStatus } from '../types';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, LayersControl } from 'react-leaflet';
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

// Status config
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; pulse?: boolean }> = {
   OPERATING: { color: '#10b981', bg: 'bg-emerald-500/15', label: 'Operando', pulse: true },
   IDLE: { color: '#f59e0b', bg: 'bg-amber-500/15', label: 'Parado' },
   MAINTENANCE: { color: '#ef4444', bg: 'bg-red-500/15', label: 'Manutenção' },
   AVAILABLE: { color: '#64748b', bg: 'bg-slate-500/15', label: 'Disponível' },
   OFFLINE: { color: '#374151', bg: 'bg-gray-700/15', label: 'Offline' },
};

const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.OFFLINE;

// Custom Icons
const createVehicleIcon = (code: string, status: AssetStatus, isSelected: boolean) => {
   const cfg = getStatusConfig(status);
   let color = cfg.color;
   if (isSelected) color = '#3b82f6';

   const size = isSelected ? 44 : 34;
   const html = `
      <div style="position:relative;">
         ${cfg.pulse && !isSelected ? `<div style="position:absolute;inset:-4px;border-radius:50%;background:${color};opacity:0.3;animation:pulse 2s infinite;"></div>` : ''}
         <div style="
            background: linear-gradient(135deg, ${color}, ${color}dd);
            width: ${size}px; height: ${size}px;
            border-radius: 50%;
            border: 3px solid ${isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 20px ${color}40;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s ease;
         ">
            <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 22 : 16}" height="${isSelected ? 22 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
         </div>
         <div style="margin-top:4px;background:rgba(0,0,0,0.85);color:white;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:700;text-align:center;white-space:nowrap;letter-spacing:0.5px;border:1px solid ${color}60;">
            ${code}
         </div>
      </div>
   `;
   return L.divIcon({ html, className: '', iconSize: [size, size + 22], iconAnchor: [size / 2, size + 22] });
};

const createEventIcon = (type: 'START' | 'STOP') => {
   const color = type === 'START' ? '#10b981' : '#ef4444';
   return L.divIcon({
      html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px ${color}80;"></div>`,
      className: '', iconSize: [14, 14], iconAnchor: [7, 7]
   });
};

type ViewMode = 'LIVE' | 'HISTORY';

const MapUpdater = ({ center }: { center: [number, number] | null }) => {
   const map = useMap();
   useEffect(() => { if (center) map.flyTo(center, 15); }, [center, map]);
   return null;
};

// Pulse animation CSS
const PulseStyle = () => (
   <style>{`
      @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.8);opacity:0} }
      @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      .fade-in { animation: fadeIn 0.3s ease-out; }
      .sidebar-scroll::-webkit-scrollbar { width: 4px; }
      .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
      .sidebar-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }
   `}</style>
);

const MapDigital: React.FC = () => {
   const [assets, setAssets] = useState<Asset[]>([]);
   const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState<ViewMode>('LIVE');
   const [mapCenter, setMapCenter] = useState<[number, number]>([-15.6014, -56.0979]);
   const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

   // Selsyn Key Status
   const keyStatus = checkSelsynKeyExpiration();

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
            setLastUpdate(new Date());
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
            const { data } = await supabase
               .from('asset_positions')
               .select('*')
               .eq('asset_id', selectedAssetId)
               .gte('timestamp', `${historyDate}T00:00:00`)
               .lte('timestamp', `${historyDate}T23:59:59`)
               .order('timestamp', { ascending: true });

            if (data && data.length > 0) {
               let lastIgn = false;
               const points = data.map((d, i) => {
                  let evt: string | null = null;
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
            }
         };
         loadHistory();
      }
   }, [viewMode, selectedAssetId, historyDate]);

   // Playback
   useEffect(() => {
      if (isPlaying) {
         playbackInterval.current = setInterval(() => {
            setPlaybackIndex(p => (p >= historyPoints.length - 1 ? (setIsPlaying(false), p) : p + 1));
         }, 200);
      } else if (playbackInterval.current) {
         clearInterval(playbackInterval.current);
      }
      return () => { if (playbackInterval.current) clearInterval(playbackInterval.current); };
   }, [isPlaying, historyPoints]);

   // Computed
   const filteredAssets = useMemo(() => assets.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase())
   ), [assets, searchTerm]);

   const stats = useMemo(() => {
      const connected = assets.filter(a => a.coordinates && a.coordinates.lat !== 0);
      const operating = assets.filter(a => a.status === 'OPERATING');
      const idle = assets.filter(a => a.status === 'IDLE');
      return { total: assets.length, connected: connected.length, operating: operating.length, idle: idle.length };
   }, [assets]);

   const selectedAsset = assets.find(a => a.id === selectedAssetId);
   const validAssets = filteredAssets.filter(a => a.coordinates && a.coordinates.lat !== 0);
   const historyPolyline = historyPoints.map(p => [p.lat, p.lng] as [number, number]);
   const currentHistoryPoint = historyPoints[playbackIndex];

   // Auto-Tracker
   useEffect(() => {
      if (assets.length === 0) return;
      const tracker = async () => {
         try {
            const { fetchFleetPositions } = await import('../services/selsyn');
            const positions = await fetchFleetPositions();
            if (positions.length > 0) {
               const inserts: any[] = [];
               for (const pos of positions) {
                  const pName = pos.rastreavel ? pos.rastreavel.toUpperCase().replace(/[\s-]/g, '') : '';
                  const pCode = pos.identificador.toUpperCase().replace(/[\s-]/g, '');
                  const asset = assets.find(a => {
                     const aCode = a.code.toUpperCase().replace(/[\s-]/g, '');
                     const aName = a.name.toUpperCase().replace(/[\s-]/g, '');
                     return pCode === aCode || pName === aCode || pName === aName;
                  });
                  if (asset) {
                     inserts.push({
                        asset_id: asset.id, latitude: pos.latitude, longitude: pos.longitude,
                        speed: pos.velocidade || 0, ignition: pos.ignicao || false,
                        timestamp: pos.dataHora || new Date().toISOString(), meta: pos
                     });
                  }
               }
               if (inserts.length > 0) {
                  await supabase.from('asset_positions').insert(inserts);
               }
            }
         } catch (e) { console.error("AutoTracker:", e); }
      };
      const interval = setInterval(tracker, 60000);
      return () => clearInterval(interval);
   }, [assets]);

   return (
      <div className="flex h-full overflow-hidden bg-slate-950 text-white font-sans">
         <PulseStyle />

         {/* ═══════════ SIDEBAR ═══════════ */}
         <div className={`${sidebarCollapsed ? 'w-14' : 'w-[340px]'} flex flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 z-20 shadow-2xl transition-all duration-300`}>

            {/* Collapse Toggle */}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
               className="absolute top-4 left-full z-30 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-r-lg p-1.5 transition-colors">
               <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>

            {sidebarCollapsed ? (
               <div className="flex flex-col items-center gap-4 pt-4">
                  <MapIcon size={20} className="text-blue-500" />
                  <div className="w-8 h-px bg-slate-700" />
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-3 h-3 rounded-full bg-emerald-500" title={`${stats.operating} Operando`} />
                     <span className="text-[9px] text-slate-500">{stats.operating}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-3 h-3 rounded-full bg-amber-500" title={`${stats.idle} Parados`} />
                     <span className="text-[9px] text-slate-500">{stats.idle}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                     <div className="w-3 h-3 rounded-full bg-blue-500" title={`${stats.connected} Com GPS`} />
                     <span className="text-[9px] text-slate-500">{stats.connected}</span>
                  </div>
               </div>
            ) : (
               <>
                  {/* Header */}
                  <div className="p-4 border-b border-slate-800/60">
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                              <Satellite size={16} className="text-blue-400" />
                           </div>
                           <div>
                              <h1 className="font-bold text-sm">Rastreamento</h1>
                              <p className="text-[10px] text-slate-500">Atualizado {lastUpdate.toLocaleTimeString('pt-BR')}</p>
                           </div>
                        </div>
                        <div className="flex bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/50">
                           <button onClick={() => setViewMode('LIVE')}
                              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${viewMode === 'LIVE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}>
                              <Radio size={10} className="inline mr-1" />Ao Vivo
                           </button>
                           <button onClick={() => setViewMode('HISTORY')}
                              className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-all ${viewMode === 'HISTORY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}>
                              <Clock size={10} className="inline mr-1" />Histórico
                           </button>
                        </div>
                     </div>

                     {/* Stats Bar */}
                     <div className="grid grid-cols-4 gap-1.5 mb-3">
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/30">
                           <div className="text-base font-bold text-white">{stats.total}</div>
                           <div className="text-[9px] text-slate-500 uppercase tracking-wider">Total</div>
                        </div>
                        <div className="bg-emerald-500/10 rounded-lg p-2 text-center border border-emerald-500/20">
                           <div className="text-base font-bold text-emerald-400">{stats.operating}</div>
                           <div className="text-[9px] text-emerald-500/70 uppercase tracking-wider">Operando</div>
                        </div>
                        <div className="bg-amber-500/10 rounded-lg p-2 text-center border border-amber-500/20">
                           <div className="text-base font-bold text-amber-400">{stats.idle}</div>
                           <div className="text-[9px] text-amber-500/70 uppercase tracking-wider">Parados</div>
                        </div>
                        <div className="bg-blue-500/10 rounded-lg p-2 text-center border border-blue-500/20">
                           <div className="text-base font-bold text-blue-400">{stats.connected}</div>
                           <div className="text-[9px] text-blue-500/70 uppercase tracking-wider">GPS</div>
                        </div>
                     </div>

                     {/* Mode Controls */}
                     {viewMode === 'LIVE' ? (
                        <div className="space-y-2">
                           {stats.connected === 0 && (
                              <button onClick={async () => {
                                 if (!confirm("Sincronizar base de veículos com a Selsyn?")) return;
                                 try {
                                    const { importSelsynVehicles } = await import('../services/selsynImporter');
                                    await importSelsynVehicles(console.log);
                                    alert("Sincronizado! Recarregando...");
                                    window.location.reload();
                                 } catch (e) { alert("Erro: " + e); }
                              }} className="w-full bg-emerald-500/10 text-emerald-400 text-xs py-2 rounded-lg hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                 <RotateCcw size={12} /> Sincronizar Cadastro Selsyn
                              </button>
                           )}
                        </div>
                     ) : (
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                              <Calendar size={14} className="text-blue-400" />
                              <input type="date" value={historyDate} onChange={e => setHistoryDate(e.target.value)}
                                 className="bg-transparent text-sm w-full outline-none text-white" />
                           </div>
                           {!selectedAssetId && (
                              <p className="text-[11px] text-amber-400/80 flex items-center gap-1">
                                 <MapPin size={10} /> Selecione um veículo para ver o histórico
                              </p>
                           )}
                        </div>
                     )}

                     {/* Search */}
                     <div className="mt-3 relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                        <input
                           value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                           placeholder="Buscar por código ou nome..."
                           className="w-full bg-slate-950/80 rounded-lg pl-9 pr-3 py-2 text-sm outline-none border border-slate-700/50 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                        />
                     </div>
                  </div>

                  {/* Vehicle List */}
                  <div className="flex-1 overflow-y-auto sidebar-scroll">
                     {loading && assets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-3">
                           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                           <p className="text-xs text-slate-500">Carregando veículos...</p>
                        </div>
                     ) : filteredAssets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-500">
                           <Search size={20} />
                           <p className="text-xs">Nenhum veículo encontrado</p>
                        </div>
                     ) : (
                        filteredAssets.map(asset => {
                           const cfg = getStatusConfig(asset.status);
                           const hasGps = asset.coordinates && asset.coordinates.lat !== 0;
                           const isSelected = selectedAssetId === asset.id;

                           return (
                              <div key={asset.id}
                                 onClick={() => { setSelectedAssetId(asset.id); if (hasGps) setMapCenter([asset.coordinates!.lat, asset.coordinates!.lng]); }}
                                 className={`group px-4 py-3 border-b border-slate-800/40 cursor-pointer transition-all hover:bg-slate-800/50 ${isSelected ? 'bg-slate-800/70 border-l-[3px] border-l-blue-500' : 'border-l-[3px] border-l-transparent'}`}
                              >
                                 <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                       <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 border border-slate-700/30`}>
                                          <Navigation size={14} style={{ color: cfg.color }} />
                                       </div>
                                       <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                             <span className="font-bold text-sm text-white">{asset.code}</span>
                                             {hasGps ? (
                                                <Wifi size={10} className="text-emerald-400 flex-shrink-0" />
                                             ) : (
                                                <WifiOff size={10} className="text-slate-600 flex-shrink-0" />
                                             )}
                                          </div>
                                          <p className="text-[11px] text-slate-400 truncate">{asset.name}</p>
                                       </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                       <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${cfg.bg}`}
                                          style={{ color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                                          {cfg.label}
                                       </span>
                                       {asset.telemetry?.speed !== undefined && (
                                          <span className="text-[10px] text-slate-500 font-mono">{asset.telemetry.speed} km/h</span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           );
                        })
                     )}
                  </div>

                  {/* Selsyn Key Footer */}
                  <div className={`px-4 py-2 border-t border-slate-800/60 text-[10px] flex items-center gap-2 ${keyStatus.expired ? 'bg-red-950/30 text-red-400' : keyStatus.hoursRemaining <= 6 ? 'bg-amber-950/20 text-amber-400' : 'text-slate-500'}`}>
                     <div className={`w-2 h-2 rounded-full flex-shrink-0 ${keyStatus.expired ? 'bg-red-500' : keyStatus.hoursRemaining <= 6 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                     <span className="truncate">{keyStatus.expired ? 'Chave GPS expirada' : keyStatus.hoursRemaining <= 6 ? `Chave expira em ${Math.round(keyStatus.hoursRemaining)}h` : 'API GPS conectada'}</span>
                  </div>
               </>
            )}
         </div>

         {/* ═══════════ MAP AREA ═══════════ */}
         <div className="flex-1 relative">

            {/* Key Expiration Banner */}
            {keyStatus.expired && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] px-5 py-2.5 rounded-xl bg-red-600/95 backdrop-blur-sm text-white flex items-center gap-3 text-sm shadow-2xl shadow-red-600/30 border border-red-500/50 fade-in">
                  <AlertTriangle size={18} />
                  <div>
                     <span className="font-semibold">Chave Selsyn Expirada</span>
                     <p className="text-[11px] text-red-200">Renove a chave para restaurar o rastreamento GPS</p>
                  </div>
               </div>
            )}

            {/* Map */}
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#0f172a' }} zoomControl={false}>
               <LayersControl position="topright">
                  <LayersControl.BaseLayer name="Satélite">
                     <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer checked name="Escuro">
                     <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
                  </LayersControl.BaseLayer>
                  <LayersControl.BaseLayer name="Ruas">
                     <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; CARTO" />
                  </LayersControl.BaseLayer>
               </LayersControl>

               <MapUpdater center={viewMode === 'LIVE' ? (selectedAssetId && selectedAsset?.coordinates?.lat ? [selectedAsset.coordinates.lat, selectedAsset.coordinates.lng] : mapCenter) : (currentHistoryPoint ? [currentHistoryPoint.lat, currentHistoryPoint.lng] : mapCenter)} />

               {viewMode === 'LIVE' ? (
                  validAssets.map(asset => (
                     <Marker key={asset.id} position={[asset.coordinates!.lat, asset.coordinates!.lng]}
                        icon={createVehicleIcon(asset.code, asset.status, selectedAssetId === asset.id)}
                        eventHandlers={{ click: () => { setSelectedAssetId(asset.id); setMapCenter([asset.coordinates!.lat, asset.coordinates!.lng]); } }}>
                        <Popup className="custom-popup">
                           <div className="text-slate-900 p-1">
                              <b className="text-sm">{asset.name}</b>
                              <p className="text-xs text-slate-600">{asset.code} - {getStatusConfig(asset.status).label}</p>
                           </div>
                        </Popup>
                     </Marker>
                  ))
               ) : (
                  <>
                     {historyPoints.length > 0 && (
                        <Polyline positions={historyPolyline} color="#3b82f6" weight={4} opacity={0.8}
                           dashArray="8 4" />
                     )}
                     {historyPoints.map((p, i) => p.event && (
                        <Marker key={i} position={[p.lat, p.lng]} icon={createEventIcon(p.event)}>
                           <Popup>
                              <div className="text-slate-900 text-xs">
                                 <b>{p.event === 'START' ? 'Ignição Ligada' : 'Ignição Desligada'}</b>
                                 <p>{new Date(p.timestamp).toLocaleTimeString('pt-BR')}</p>
                              </div>
                           </Popup>
                        </Marker>
                     ))}
                     {currentHistoryPoint && (
                        <Marker position={[currentHistoryPoint.lat, currentHistoryPoint.lng]}
                           icon={createVehicleIcon(selectedAsset?.code || '?', AssetStatus.OPERATING, true)} zIndexOffset={100} />
                     )}
                  </>
               )}
            </MapContainer>

            {/* ═══════════ OVERLAYS ═══════════ */}

            {/* Live - Vehicle Detail Card */}
            {viewMode === 'LIVE' && selectedAsset && (
               <div className="absolute top-4 right-4 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl z-[1000] shadow-2xl overflow-hidden fade-in">
                  {/* Card Header */}
                  <div className="px-4 pt-4 pb-3 border-b border-slate-800/60">
                     <div className="flex items-start justify-between">
                        <div>
                           <h3 className="font-bold text-white text-sm">{selectedAsset.name}</h3>
                           <p className="text-[11px] text-slate-400 mt-0.5">{selectedAsset.code}</p>
                        </div>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${getStatusConfig(selectedAsset.status).bg}`}
                           style={{ color: getStatusConfig(selectedAsset.status).color, border: `1px solid ${getStatusConfig(selectedAsset.status).color}30` }}>
                           {getStatusConfig(selectedAsset.status).label}
                        </span>
                     </div>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="p-3 grid grid-cols-2 gap-2">
                     <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/30">
                        <div className="flex items-center gap-1.5 mb-1">
                           <Gauge size={11} className="text-blue-400" />
                           <span className="text-[9px] text-slate-400 uppercase tracking-wider">Velocidade</span>
                        </div>
                        <div className="font-mono text-xl font-bold text-white">
                           {selectedAsset.telemetry?.speed ?? '--'}
                           <span className="text-xs text-slate-500 ml-1">km/h</span>
                        </div>
                     </div>
                     <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/30">
                        <div className="flex items-center gap-1.5 mb-1">
                           <Zap size={11} className="text-amber-400" />
                           <span className="text-[9px] text-slate-400 uppercase tracking-wider">Voltagem</span>
                        </div>
                        <div className="font-mono text-xl font-bold text-white">
                           {selectedAsset.telemetry?.voltage ?? '--'}
                           <span className="text-xs text-slate-500 ml-1">V</span>
                        </div>
                     </div>
                     {selectedAsset.coordinates && (
                        <div className="col-span-2 bg-slate-800/40 rounded-xl p-3 border border-slate-700/20">
                           <div className="flex items-center gap-1.5 mb-1">
                              <Crosshair size={11} className="text-emerald-400" />
                              <span className="text-[9px] text-slate-400 uppercase tracking-wider">Coordenadas</span>
                           </div>
                           <div className="font-mono text-xs text-slate-300">
                              {selectedAsset.coordinates.lat.toFixed(6)}, {selectedAsset.coordinates.lng.toFixed(6)}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2 border-t border-slate-800/40 text-[10px] text-slate-500 flex items-center justify-between">
                     <span className="flex items-center gap-1"><Clock size={9} /> {selectedAsset.telemetry?.lastUpdate || 'Sem dados'}</span>
                     <button onClick={() => setSelectedAssetId(null)} className="text-slate-400 hover:text-white transition-colors">Fechar</button>
                  </div>
               </div>
            )}

            {/* History - Playback Controls */}
            {viewMode === 'HISTORY' && historyPoints.length > 0 && (
               <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 p-4 rounded-2xl flex items-center gap-4 z-[1000] shadow-2xl fade-in">
                  <button onClick={() => setIsPlaying(!isPlaying)}
                     className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex-shrink-0">
                     {isPlaying ? <Pause size={18} fill="white" stroke="white" /> : <Play size={18} fill="white" stroke="white" className="ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                     <input type="range" min={0} max={historyPoints.length - 1} value={playbackIndex}
                        onChange={e => { setPlaybackIndex(Number(e.target.value)); setIsPlaying(false); }}
                        className="w-full accent-blue-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                        <span>{new Date(historyPoints[0].timestamp).toLocaleTimeString('pt-BR')}</span>
                        <span className="text-white font-bold text-xs">{currentHistoryPoint ? new Date(currentHistoryPoint.timestamp).toLocaleTimeString('pt-BR') : '--'}</span>
                        <span>{new Date(historyPoints[historyPoints.length - 1].timestamp).toLocaleTimeString('pt-BR')}</span>
                     </div>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                     <div className="text-center">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider">Velocidade</div>
                        <div className="font-mono font-bold text-lg text-white">{currentHistoryPoint?.speed || 0}<span className="text-xs text-slate-500 ml-0.5">km/h</span></div>
                     </div>
                     <div className="text-center">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider">Pontos</div>
                        <div className="font-mono font-bold text-lg text-blue-400">{playbackIndex + 1}<span className="text-xs text-slate-500">/{historyPoints.length}</span></div>
                     </div>
                  </div>
               </div>
            )}

            {/* No History Data Message */}
            {viewMode === 'HISTORY' && selectedAssetId && historyPoints.length === 0 && !loading && (
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl p-8 text-center fade-in">
                  <MapPin size={32} className="text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">Sem histórico</h3>
                  <p className="text-xs text-slate-400">Nenhum dado de rastreamento encontrado para {new Date(historyDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default MapDigital;
