import React, { useState } from 'react';
import { Camera, Check, Upload, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { processTimecardImage, TimecardData } from '../services/TimecardService';
import Sidebar from '../components/Sidebar';

const Timekeeping: React.FC = () => {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TimecardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setData(null);
            setError(null);
        }
    };

    const handleProcess = async () => {
        if (!image) return;
        setLoading(true);
        setError(null);
        try {
            const result = await processTimecardImage(image);
            setData(result);
        } catch (err: any) {
            setError(err.message || "Erro ao processar imagem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-slate-100 min-h-screen">
            <Sidebar activePage="rh" />

            <main className="flex-1 p-8 ml-64 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Leitura de Cartão Ponto 📸</h1>
                        <p className="text-slate-500">Use a Inteligência Artificial para digitalizar os pontos do papel.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-[#007a33]" />
                            Carregar Foto
                        </h2>

                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center hover:bg-slate-50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-96 mx-auto rounded shadow-sm" />
                            ) : (
                                <div className="space-y-2">
                                    <Camera size={48} className="mx-auto text-slate-400" />
                                    <p className="text-slate-500 font-medium">Clique ou arraste a foto aqui</p>
                                    <p className="text-xs text-slate-400">Suporta JPG, PNG</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleProcess}
                            disabled={!image || loading}
                            className="w-full mt-4 bg-[#007a33] hover:bg-[#009a43] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Lendo Imagem com IA...
                                </>
                            ) : (
                                <>
                                    <FileText size={20} />
                                    Extrair Dados
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 text-sm font-medium border border-red-100">
                                <AlertTriangle size={18} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Check size={20} className="text-[#007a33]" />
                            Dados Extraídos
                        </h2>

                        {!data ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[400px]">
                                <FileText size={48} className="opacity-20 mb-4" />
                                <p>Aguardando processamento...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Funcionário Detectado</span>
                                        <p className="text-lg font-bold text-slate-800">{data.employeeName || "Não identificado"}</p>
                                    </div>
                                    <div className="w-1/3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <span className="text-xs text-slate-500 uppercase font-bold">Período</span>
                                        <p className="text-lg font-bold text-slate-800">
                                            {data.period === "1" ? "1ª Quinzena" : "2ª Quinzena"}
                                        </p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-600">
                                                <th className="p-2 text-center rounded-l-lg">Dia</th>
                                                <th className="p-2 text-center">Entrada 1</th>
                                                <th className="p-2 text-center">Saída 1</th>
                                                <th className="p-2 text-center">Entrada 2</th>
                                                <th className="p-2 text-center rounded-r-lg">Saída 2</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {data.entries.map((entry, index) => (
                                                <tr key={index} className="hover:bg-slate-50">
                                                    <td className="p-2 text-center font-bold text-slate-700">{entry.day}</td>
                                                    <td className="p-2 text-center font-mono text-slate-600">{entry.morningIn || '-'}</td>
                                                    <td className="p-2 text-center font-mono text-slate-600">{entry.morningOut || '-'}</td>
                                                    <td className="p-2 text-center font-mono text-slate-600">{entry.afternoonIn || '-'}</td>
                                                    <td className="p-2 text-center font-mono text-slate-600">{entry.afternoonOut || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex justify-end">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                                        Confirmar e Salvar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Timekeeping;
