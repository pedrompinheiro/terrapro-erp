import React from 'react';
const { useState, useEffect } = React;
import { Calendar, ChevronLeft, ChevronRight, Filter, Download, Plus, Search, MapPin, Hammer, CloudRain, Clock } from 'lucide-react';
import { dashboardService } from '../services/api';
import { EquipmentTimeline, TimelineCell } from '../services/mockData';

const DAYS_IN_MONTH = 31;
const MOCK_MONTH = 'Dezembro 2024';

const OperationsMap: React.FC = () => {
    const [data, setData] = useState<EquipmentTimeline[]>([]);
    const [selectedCell, setSelectedCell] = useState<{ eqId: string, day: number } | null>(null);

    useEffect(() => {
        const load = async () => {
            const result = await dashboardService.getOperationsMapData();
            setData(result as EquipmentTimeline[]);
        };
        load();
    }, []);

    const getStatusColor = (status: TimelineCell['status']) => {
        switch (status) {
            case 'WORKED': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/40';
            case 'STANDBY': return 'bg-slate-700/50 text-slate-400 border-slate-600 hover:bg-slate-700';
            case 'MAINTENANCE': return 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/40';
            case 'RAIN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/40';
            default: return 'bg-transparent border-slate-800/50 hover:bg-slate-800';
        }
    };

    const getStatusIcon = (status: TimelineCell['status']) => {
        switch (status) {
            case 'WORKED': return <Clock size={10} />;
            case 'MAINTENANCE': return <Hammer size={10} />;
            case 'RAIN': return <CloudRain size={10} />;
            default: return null;
        }
    };

    const handleCellClick = (eqId: string, day: number) => {
        setSelectedCell({ eqId, day });
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-slate-900 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Calendar className="text-indigo-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight uppercase">Mapa de Operações</h1>
                        <p className="text-xs text-slate-500 font-bold">Controle de Alocação e Status (Timeline)</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
                        <button className="text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
                        <span className="mx-4 text-sm font-bold text-white uppercase tracking-wider">{MOCK_MONTH}</span>
                        <button className="text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-800"></div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                        <Download size={16} /> Exportar Excel
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="h-12 border-b border-slate-900 bg-slate-950/50 flex items-center px-6 gap-4 shrink-0">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 w-64">
                    <Search size={14} className="text-slate-500" />
                    <input placeholder="Filtrar Equipamento..." className="bg-transparent text-xs text-white outline-none w-full placeholder:text-slate-600" />
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Trabalhou</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-slate-700/50 border border-slate-600"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Parado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50"></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Manutenção</span>
                    </div>
                </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                {/* Header Row (Days) */}
                <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-hidden shrink-0">
                    <div className="w-64 shrink-0 p-3 border-r border-slate-800 text-xs font-black text-slate-500 uppercase tracking-wider flex items-center">
                        Equipamento / Local
                    </div>
                    <div className="flex-1 overflow-x-auto custom-scrollbar flex">
                        {Array.from({ length: DAYS_IN_MONTH }, (_, i) => (
                            <div key={i} className="w-12 shrink-0 border-r border-slate-800/50 py-2 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][i % 7]}</span>
                                <span className={`text-xs font-black ${i % 7 === 0 || i % 7 === 6 ? 'text-indigo-400' : 'text-white'}`}>{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {data.map(eq => (
                        <div key={eq.id} className="flex border-b border-slate-800/50 hover:bg-slate-900/20 transition-colors">
                            {/* Equipment Column */}
                            <div className="w-64 shrink-0 p-3 border-r border-slate-800 bg-slate-950 z-10 sticky left-0 flex flex-col justify-center">
                                <p className="text-sm font-bold text-white">{eq.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{eq.id}</p>
                            </div>

                            {/* Cells */}
                            <div className="flex-1 flex">
                                {eq.timeline.map(cell => (
                                    <div
                                        key={cell.day}
                                        onClick={() => handleCellClick(eq.id, cell.day)}
                                        className={`w-12 shrink-0 border-r border-slate-800/30 h-16 p-1 cursor-pointer transition-all relative group`}
                                    >
                                        <div className={`w-full h-full rounded border flex flex-col items-center justify-center gap-1 ${getStatusColor(cell.status)}`}>
                                            {cell.status === 'WORKED' && <span className="text-[10px] font-black">{cell.hours}h</span>}
                                            {getStatusIcon(cell.status)}
                                        </div>

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-slate-700 shadow-xl font-bold">
                                            {cell.location || 'Sem Local'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal (Enhanced) */}
            {selectedCell && (
                <EditModal
                    cell={data.find(d => d.id === selectedCell.eqId)?.timeline.find(t => t.day === selectedCell.day)!}
                    onClose={() => setSelectedCell(null)}
                    onSave={(updatedCell) => {
                        const newData = data.map(eq => {
                            if (eq.id === selectedCell.eqId) {
                                return {
                                    ...eq,
                                    timeline: eq.timeline.map(t => t.day === selectedCell.day ? updatedCell : t)
                                };
                            }
                            return eq;
                        });
                        setData(newData);
                        dashboardService.updateOperationsMapData(newData.find(d => d.id === selectedCell.eqId)!);
                        setSelectedCell(null);
                    }}
                />
            )}
        </div>
    );
};

const EditModal: React.FC<{ cell: TimelineCell, onClose: () => void, onSave: (cell: TimelineCell) => void }> = ({ cell, onClose, onSave }) => {
    const [status, setStatus] = useState<TimelineCell['status']>(cell.status);
    const [location, setLocation] = useState(cell.location || 'PEDREIRA');
    const [startTime, setStartTime] = useState(cell.startTime || '07:30');
    const [endTime, setEndTime] = useState(cell.endTime || '17:00');
    const [hasLunchBreak, setHasLunchBreak] = useState(cell.hasLunchBreak || false);
    const [lunchStartTime, setLunchStartTime] = useState(cell.lunchStartTime || '12:00');
    const [lunchEndTime, setLunchEndTime] = useState(cell.lunchEndTime || '13:00');

    // Auto-calculate hours
    const calculateHours = () => {
        if (status !== 'WORKED') return 0;
        if (!startTime || !endTime) return 0;

        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        let diffMs = end.getTime() - start.getTime();

        if (hasLunchBreak && lunchStartTime && lunchEndTime) {
            const lStart = new Date(`2000-01-01T${lunchStartTime}`);
            const lEnd = new Date(`2000-01-01T${lunchEndTime}`);
            const lunchDiff = lEnd.getTime() - lStart.getTime();
            diffMs -= lunchDiff;
        }

        const hours = diffMs / (1000 * 60 * 60);
        return Math.max(0, Number(hours.toFixed(2))); // Ensure non-negative
    };

    const calculatedHours = calculateHours();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-[450px] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">x</button>
                <h3 className="text-white font-bold text-lg mb-4">Editar Apontamento</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setStatus('WORKED')} className={`p-3 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${status === 'WORKED' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
                            <Clock size={20} /> Trabalhou
                        </button>
                        <button onClick={() => setStatus('STANDBY')} className={`p-3 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${status === 'STANDBY' ? 'bg-slate-600/50 text-white border-slate-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
                            <div className="w-5 h-5 rounded border-2 border-current"></div> Parado
                        </button>
                        <button onClick={() => setStatus('MAINTENANCE')} className={`p-3 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${status === 'MAINTENANCE' ? 'bg-red-500/20 text-red-500 border-red-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
                            <Hammer size={20} /> Manutenção
                        </button>
                        <button onClick={() => setStatus('RAIN')} className={`p-3 rounded-xl border font-bold text-sm flex flex-col items-center gap-2 transition-all ${status === 'RAIN' ? 'bg-blue-500/20 text-blue-500 border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}>
                            <CloudRain size={20} /> Chuva
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Local / Obra</label>
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1">
                            <MapPin size={14} className="text-slate-500" />
                            <input
                                className="bg-transparent text-white text-sm w-full outline-none"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    {status === 'WORKED' && (
                        <div className="space-y-4 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Início Operação</label>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-white focus:border-indigo-500 transition-colors"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Término Operação</label>
                                    <input
                                        type="time"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-white focus:border-indigo-500 transition-colors"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="lunchBreak"
                                    checked={hasLunchBreak}
                                    onChange={e => setHasLunchBreak(e.target.checked)}
                                    className="accent-indigo-500 w-4 h-4"
                                />
                                <label htmlFor="lunchBreak" className="text-sm text-white font-bold select-none cursor-pointer">Apontar Parada para Almoço</label>
                            </div>

                            {hasLunchBreak && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Início Almoço</label>
                                        <input
                                            type="time"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-white focus:border-indigo-500 transition-colors"
                                            value={lunchStartTime}
                                            onChange={e => setLunchStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Término Almoço</label>
                                        <input
                                            type="time"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mt-1 text-white focus:border-indigo-500 transition-colors"
                                            value={lunchEndTime}
                                            onChange={e => setLunchEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">Total Horas</span>
                                <span className="text-lg font-black text-emerald-400">{calculatedHours}h</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => onSave({
                            ...cell,
                            status,
                            location,
                            hours: calculatedHours,
                            startTime,
                            endTime,
                            hasLunchBreak,
                            lunchStartTime,
                            lunchEndTime
                        })}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg mt-2 transition-all hover:scale-[1.02]"
                    >
                        Salvar Apontamento
                    </button>
                </div>
            </div>
        </div>
    );
};


export default OperationsMap;
