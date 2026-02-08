
import React, { useState, useEffect } from 'react';
import { Lock, MapPin, Navigation, AlertTriangle, CheckCircle2, Search, Camera } from 'lucide-react';
import { dashboardService } from '../services/api';
import { Asset } from '../types';

const DailyControl: React.FC = () => {
  const [step, setStep] = useState<'LOCATION' | 'EQUIPMENT' | 'VALIDATION' | 'WORKING'>('LOCATION');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [justification, setJustification] = useState('');

  // Mock User Location (Dourados/MS center for demo)
  const getUserLocation = () => {
    // Simulating GPS fetch
    setTimeout(() => {
      setUserLocation({ lat: -22.2560, lng: -54.8320 }); // Near CAT 320
    }, 1500);
  };

  useEffect(() => {
    const loadAssets = async () => {
      const data = await dashboardService.getAssets();
      setAssets(data as Asset[]);
    };
    loadAssets();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in metres
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    if (userLocation && asset.coordinates) {
      const dist = calculateDistance(
        userLocation.lat, userLocation.lng,
        asset.coordinates.lat, asset.coordinates.lng
      );
      setDistance(Math.round(dist));
      setStep('VALIDATION');
    } else {
      // Fallback if no coords
      setDistance(0);
      setStep('VALIDATION');
    }
  };

  // Step 1: Location Access
  if (step === 'LOCATION') {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
        <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <MapPin size={48} className="text-blue-500" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Iniciar Turno Operacional</h2>
        <p className="text-slate-500 mb-8">Precisamos da sua localização para validar o equipamento e iniciar o apontamento digital.</p>

        {!userLocation ? (
          <button
            onClick={getUserLocation}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
          >
            <Navigation size={20} />
            Compartilhar Localização
          </button>
        ) : (
          <div className="w-full space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-bold text-emerald-500">Localização Capturada</p>
                <p className="text-[10px] text-emerald-400/70">Precisão: 12 metros</p>
              </div>
            </div>
            <button
              onClick={() => setStep('EQUIPMENT')}
              className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Select Equipment
  if (step === 'EQUIPMENT') {
    return (
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white">Selecione o Equipamento</h2>
          <p className="text-slate-500 mt-2">Você só pode operar **um** equipamento por vez.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Buscar por Prefixo ou Modelo..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-3">
          {assets.map(asset => (
            <button
              key={asset.id}
              onClick={() => handleAssetSelect(asset)}
              disabled={asset.status === 'MAINTENANCE'}
              className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${asset.status === 'MAINTENANCE'
                  ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-800 hover:border-blue-500 hover:bg-slate-800'
                }`}
            >
              <div className="text-left">
                <p className="font-bold text-white text-lg">{asset.name}</p>
                <p className="text-xs text-slate-500 font-mono">{asset.id} • {asset.model}</p>
              </div>
              {asset.status === 'MAINTENANCE' ? (
                <span className="text-[10px] font-black uppercase bg-red-500/10 text-red-500 px-2 py-1 rounded">Em Manutenção</span>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-slate-700 group-hover:border-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 3: Validation
  if (step === 'VALIDATION' && selectedAsset) {
    const isFar = (distance || 0) > 300; // 300 meters threshold

    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center relative">
          <img
            src={`https://ui-avatars.com/api/?name=${selectedAsset.model}&background=0f172a&color=fff`}
            alt="Asset"
            className="rounded-full w-full h-full opacity-50"
          />
          <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-950 ${isFar ? 'bg-amber-500' : 'bg-emerald-500'
            }`}>
            {isFar ? <AlertTriangle size={18} className="text-black" /> : <CheckCircle2 size={18} className="text-white" />}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-black text-white">{selectedAsset.name}</h2>
          <p className="text-slate-500 text-sm mt-1">Prefixo: {selectedAsset.id}</p>
        </div>

        <div className={`p-4 rounded-xl border ${isFar ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
          }`}>
          <p className="text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70">Distância do Equipamento</p>
          <p className={`text-3xl font-black ${isFar ? 'text-amber-500' : 'text-emerald-500'}`}>
            {distance} metros
          </p>
          {isFar && (
            <p className="text-xs text-amber-200 mt-2 font-bold">
              Atenção: Você está longe do equipamento. O gestor será notificado.
            </p>
          )}
        </div>

        {isFar && (
          <div className="text-left space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Justificativa Obrigatória</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Por que você está longe do equipamento? (Ex: Equipamento em trânsito, GPS com erro...)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-amber-500 outline-none"
              rows={3}
            />
            <button className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-700 transition-all">
              <Camera size={16} /> Anexar Foto do Local
            </button>
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button
            onClick={() => setStep('EQUIPMENT')}
            className="flex-1 py-4 bg-slate-900 text-slate-400 font-bold rounded-xl hover:text-white transition-all"
          >
            Trocar
          </button>
          <button
            onClick={() => setStep('WORKING')}
            disabled={isFar && justification.length < 10}
            className={`flex-1 py-4 font-bold rounded-xl shadow-xl transition-all ${isFar && justification.length < 10
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isFar
                  ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
          >
            {isFar ? 'Justificar e Iniciar' : 'Confirmar e Iniciar'}
          </button>
        </div>
      </div>
    );
  }

  // Step 4: Active Working State
  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Operação em Andamento
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">Painel do Operador</h2>
        <p className="text-slate-500">
          Equipamento: <strong className="text-white">{selectedAsset?.name} ({selectedAsset?.id})</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tempo de Turno</p>
          <p className="text-3xl font-black text-white mt-1">00:00:15</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status da Conexão</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-xl font-bold text-white">Sincronizado</p>
          </div>
        </div>
        <button
          onClick={() => setStep('LOCATION')} // Reset for demo
          className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl hover:bg-red-900/30 transition-all text-left group"
        >
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
            <Lock size={12} /> Encerrar Turno
          </p>
          <p className="text-xl font-black text-white mt-1 group-hover:text-red-400 transition-colors">Fechar Ponto</p>
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-500 mb-4">Esta tela ficaria bloqueada durante a operação, permitindo apenas apontamentos de parada ou abastecimento.</p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-slate-800 rounded-xl text-white font-bold border border-slate-700 hover:bg-slate-700 uppercase text-xs tracking-wider">
            Apontar Parada
          </button>
          <button className="px-6 py-3 bg-slate-800 rounded-xl text-white font-bold border border-slate-700 hover:bg-slate-700 uppercase text-xs tracking-wider">
            Solicitar Manutenção
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyControl;
