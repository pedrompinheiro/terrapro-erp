
import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Calendar } from 'lucide-react';

interface WorkShift {
    id?: string;
    name: string;
    start_time: string;
    break_start: string;
    break_end: string;
    end_time: string;
    work_days: string[];
}

interface WorkShiftFormProps {
    shiftId?: string | null;
    initialData?: WorkShift;
    onClose: () => void;
    onSuccess: () => void;
}

const DAYS_OF_WEEK = [
    { key: 'Monday', label: 'Segunda-feira', short: 'SEG' },
    { key: 'Tuesday', label: 'Terça-feira', short: 'TER' },
    { key: 'Wednesday', label: 'Quarta-feira', short: 'QUA' },
    { key: 'Thursday', label: 'Quinta-feira', short: 'QUI' },
    { key: 'Friday', label: 'Sexta-feira', short: 'SEX' },
    { key: 'Saturday', label: 'Sábado', short: 'SÁB' },
    { key: 'Sunday', label: 'Domingo', short: 'DOM' },
];

const WorkShiftForm: React.FC<WorkShiftFormProps> = ({ shiftId, initialData, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<WorkShift>({
        name: '',
        start_time: '07:00',
        break_start: '11:00',
        break_end: '12:00',
        end_time: '17:00',
        work_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const toggleDay = (dayKey: string) => {
        setFormData(prev => {
            const current = prev.work_days || [];
            if (current.includes(dayKey)) {
                return { ...prev, work_days: current.filter(d => d !== dayKey) };
            } else {
                return { ...prev, work_days: [...current, dayKey] };
            }
        });
    };

    const calculateTotalHours = () => {
        // Assume formato HH:MM
        const toMinutes = (time: string) => {
            if (!time) return 0;
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        const start = toMinutes(formData.start_time);
        const end = toMinutes(formData.end_time);
        const breakStart = toMinutes(formData.break_start);
        const breakEnd = toMinutes(formData.break_end);

        if (end < start) return '00:00'; // Não lida com virada de dia simples aqui

        const totalBreak = (breakEnd > breakStart) ? (breakEnd - breakStart) : 0;
        const totalWork = (end - start) - totalBreak;

        if (totalWork <= 0) return '00:00';

        const h = Math.floor(totalWork / 60);
        const m = totalWork % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Dê um nome ao turno (Ex: Administrativo)');

        setLoading(true);
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const supabase = createClient(supabaseUrl, supabaseKey);

            const payload = { ...formData };
            if (!shiftId) delete payload.id;
            // Se for novo, remove id do payload

            // Verifica se WorkShifts já existe. Se der erro, avisa usuario para rodar script.
            const { error: checkError } = await supabase.from('work_shifts').select('count').limit(1);
            if (checkError && checkError.code === '42P01') { // undefined_table
                throw new Error('Tabela work_shifts não existe. Execute o script SQL de migração.');
            }

            const { error } = await supabase
                .from('work_shifts')
                .upsert(payload)
                .select(); // Retorna dados para confirmar

            if (error) throw error;

            onSuccess();
        } catch (error: any) {
            console.error(error);
            alert('Erro ao salvar turno: ' + (error.message || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="text-blue-500" />
                            {shiftId ? 'Editar Turno de Trabalho' : 'Novo Turno de Trabalho'}
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Configure os horários e dias de trabalho padrão.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {/* Nome */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Nome do Turno</label>
                        <input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Comercial, Administrativo, Turno A..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none font-bold"
                        />
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-2 gap-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-2"><Clock size={12} /> Hora Entrada</label>
                                <input
                                    type="time"
                                    value={formData.start_time}
                                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 transition-colors font-mono tracking-widest text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2"><Clock size={12} /> Saída Intervalo</label>
                                <input
                                    type="time"
                                    value={formData.break_start}
                                    onChange={e => setFormData({ ...formData, break_start: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-amber-500 transition-colors font-mono tracking-widest text-lg"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-rose-500 uppercase flex items-center gap-2"><Clock size={12} /> Hora Saída</label>
                                <input
                                    type="time"
                                    value={formData.end_time}
                                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-rose-500 transition-colors font-mono tracking-widest text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-blue-500 uppercase flex items-center gap-2"><Clock size={12} /> Volta Intervalo</label>
                                <input
                                    type="time"
                                    value={formData.break_end}
                                    onChange={e => setFormData({ ...formData, break_end: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors font-mono tracking-widest text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-slate-400">Total Horas Diárias (Estimado):</span>
                        <span className="text-2xl font-black text-white font-mono">{calculateTotalHours()}</span>
                    </div>

                    <hr className="border-slate-800" />

                    {/* Dias da Semana */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={12} /> Dias de Trabalho</label>
                        <div className="flex justify-between gap-2 overflow-x-auto pb-2">
                            {DAYS_OF_WEEK.map(day => {
                                const isSelected = formData.work_days?.includes(day.key);
                                return (
                                    <button
                                        key={day.key}
                                        onClick={() => toggleDay(day.key)}
                                        className={`flex-1 min-w-[60px] py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${isSelected
                                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50'
                                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                                            }`}
                                    >
                                        <span className="text-[10px] font-bold">{day.short}</span>
                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full mt-1"></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`px-8 py-2.5 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 ${loading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {loading && <Clock size={16} className="animate-spin" />}
                        Salvar Turno
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkShiftForm;
