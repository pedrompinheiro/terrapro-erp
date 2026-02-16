
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Asset, AssetStatus } from '../types';
import { Truck, Activity, ShieldCheck, MapPin, Gauge, Plus, Save, BookOpen, Search, Trash2, Download, FileText, Upload, FileSpreadsheet, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { fleetManagementService } from '../services/fleetService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as xlsx from 'xlsx';

const FleetManagement: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importAssetId, setImportAssetId] = useState<string>('');
  const [importProgress, setImportProgress] = useState<number>(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);

  const handleImportGPS = async () => {
    if (!importFile || !importAssetId) return;
    setIsImporting(true);
    setImportLog([]);
    setImportProgress(0);

    try {
      const buffer = await importFile.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Ler todas as colunas
      const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

      setImportLog(prev => [...prev, `Linhas encontradas: ${rows.length}`]);

      const BATCH_SIZE = 500;
      let batch: any[] = [];
      let processed = 0;

      let minDate: Date | null = null;
      let maxDate: Date | null = null;

      for (const row of rows) {
        // Mapeamento de Colunas (Flexível)
        const latVal = row['Latitude'] || row['Lat'] || row['latitude'];
        const lngVal = row['Longitude'] || row['Lng'] || row['longitude'] || row['Long'];
        // Suporte a Data/Hora Evento, Data, DataHora, timestamp
        const dateVal = row['Data/Hora Evento'] || row['Data'] || row['DataHora'] || row['data_hora'] || row['timestamp'];

        const speedVal = row['Velocidade'] || row['Velocidade (km/h)'] || row['speed'] || 0;
        const ignVal = row['Ignição'] || row['Ignition'] || row['ignicao'] || 'OFF';

        // Tratamento de Lat/Lng (converter vírgula para ponto)
        const parseCoord = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
          return 0;
        };

        const lat = parseCoord(latVal);
        const lng = parseCoord(lngVal);

        if (!lat || !lng || lat === 0 || lng === 0) continue;

        // Tratamento de Data
        let timestamp = null;
        if (typeof dateVal === 'number') {
          // Excel Serial Date
          const excelEpoch = new Date(1899, 11, 30);
          const days = Math.floor(dateVal);
          const ms = Math.round((dateVal - days) * 86400000);
          const localDate = new Date(excelEpoch.getTime() + days * 86400000 + ms);
          timestamp = localDate.toISOString();
        } else if (typeof dateVal === 'string') {
          if (dateVal.includes('/')) {
            // DD/MM/YYYY HH:mm:ss
            const [dStr, tStr] = dateVal.split(' ');
            if (dStr && tStr) {
              const [day, month, year] = dStr.split('/');
              // Assumindo UTC para salvar no banco corretamente
              timestamp = `${year}-${month}-${day}T${tStr}.000Z`;
            }
          } else {
            // Tenta converter direto
            try { timestamp = new Date(dateVal).toISOString(); } catch { }
          }
        }

        if (!timestamp) continue;

        // Date Tracking
        const dObj = new Date(timestamp);
        if (!minDate || dObj < minDate) minDate = dObj;
        if (!maxDate || dObj > maxDate) maxDate = dObj;

        // Ignição
        let ignition = false;
        if (typeof ignVal === 'boolean') ignition = ignVal;
        else {
          const s = String(ignVal).toUpperCase();
          ignition = ['VERDADEIRO', 'TRUE', 'LIGADA', 'ON', '1'].some(v => s.includes(v));
        }

        batch.push({
          asset_id: importAssetId,
          latitude: lat,
          longitude: lng,
          timestamp: timestamp,
          speed: typeof speedVal === 'string' ? parseFloat(speedVal.replace(',', '.')) : speedVal,
          ignition: ignition,
          meta: { source: 'manual_import', original: row }
        });

        if (batch.length >= BATCH_SIZE) {
          const { error } = await supabase.from('asset_positions').insert(batch);
          if (error) throw error;
          batch = [];
          processed += BATCH_SIZE;
          setImportProgress(Math.min(100, Math.round((processed / rows.length) * 100)));
        }
      }

      if (batch.length > 0) {
        const { error } = await supabase.from('asset_positions').insert(batch);
        if (error) throw error;
      }

      setImportLog(prev => [...prev, `✅ Sucesso! Total importado: ${processed + batch.length}`]);

      if (minDate && maxDate) {
        setImportLog(prev => [...prev, `🔄 Recalculando operações de ${minDate?.toLocaleDateString()} a ${maxDate?.toLocaleDateString()}...`]);

        const { error: rpcError } = await supabase.rpc('recalculate_operations', {
          target_asset_id: importAssetId,
          start_date: minDate.toISOString().split('T')[0],
          end_date: maxDate.toISOString().split('T')[0]
        });

        if (rpcError) {
          console.error('RPC Error:', rpcError);
          setImportLog(prev => [...prev, `⚠️ Erro ao recalcular: ${rpcError.message}`]);
        } else {
          setImportLog(prev => [...prev, `✅ Operações recalculadas com sucesso!`]);
        }
      }

      setTimeout(() => {
        setIsImportModalOpen(false);
        alert("Importação Concluída com Sucesso!");
        queryClient.invalidateQueries({ queryKey: ['fleet'] });
      }, 1500);

    } catch (error: any) {
      console.error(error);
      setImportLog(prev => [...prev, `❌ Erro: ${error.message || error}`]);
    } finally {
      setIsImporting(false);
    }
  };

  // React Query: Fetch Assets
  const { data: fleetData = [], isLoading } = useQuery({
    queryKey: ['fleet'],
    queryFn: fleetManagementService.getAssets,
    staleTime: 1000 * 60, // 1 min (mock data constraint)
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: fleetManagementService.createAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fleet'] })
  });

  const updateMutation = useMutation({
    mutationFn: fleetManagementService.updateAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fleet'] })
  });

  const deleteMutation = useMutation({
    mutationFn: fleetManagementService.deleteAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fleet'] })
  });

  // New Asset State
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    id: '',
    name: '',
    model: '',
    status: AssetStatus.AVAILABLE
  });

  const openEditModal = (asset: Asset) => {
    setNewAsset({ ...asset });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newAsset.name || !newAsset.id) return;

    const existingIds = fleetData.map(a => a.id);
    const isEdit = existingIds.includes(newAsset.id!);

    const assetToSave: Asset = {
      id: newAsset.id!,
      name: newAsset.name!,
      model: newAsset.model || 'Modelo Padrão',
      status: newAsset.status || AssetStatus.AVAILABLE,
      horometer: newAsset.horometer || 0,
      nextRevision: newAsset.nextRevision || '100h',
      efficiency: newAsset.efficiency || 100,
      coordinates: newAsset.coordinates || { lat: -22.2, lng: -54.8 },
      telemetry: newAsset.telemetry || {
        lastUpdate: new Date().toLocaleString(),
        speed: 0,
        ignition: false,
        voltage: 24,
        batteryLevel: 100,
        satelliteCount: 10,
        address: 'Base Central',
        deviceModel: 'Tracker V1'
      },
      manuals: newAsset.manuals || []
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(assetToSave);
      } else {
        await createMutation.mutateAsync(assetToSave);
      }
      setIsModalOpen(false);
      setNewAsset({ id: '', name: '', model: '', status: AssetStatus.AVAILABLE });
    } catch (error) {
      console.error("Failed to save asset", error);
      alert("Erro ao salvar ativo.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este ativo?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('TerraPro ERP', 14, 20);
    doc.setFontSize(12);
    doc.text('Relatório Geral de Frota', 14, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 50);
    doc.text(`Total de Ativos: ${fleetData.length}`, 14, 55);

    const tableColumn = ["ID", "Nome / Modelo", "Status", "Horímetro", "Localização (Última Posição)"];
    const tableRows = fleetData.map(asset => [
      asset.id,
      `${asset.name}\n${asset.model}`,
      asset.status,
      `${asset.horometer} h`,
      asset.telemetry?.address || 'N/A'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' }, // Emerald-600 headers
      styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
      alternateRowStyles: { fillColor: [240, 253, 244] }, // Emerald-50
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 30 },
        3: { halign: 'right' }
      }
    });

    // Summary by Status
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    if (finalY < 250) {
      doc.setFontSize(14);
      doc.text('Resumo por Status', 14, finalY);

      const stats = fleetData.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      let yPos = finalY + 10;
      doc.setFontSize(10);
      Object.entries(stats).forEach(([status, count]) => {
        doc.text(`• ${status}: ${count}`, 14, yPos);
        yPos += 7;
      });
    }

    doc.save('relatorio_frota_terrapro.pdf');
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Frota Ativa</h2>
          <p className="text-slate-500 mt-1">Monitoramento em tempo real de ativos e telemetria.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 transition-all text-white px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-700 flex items-center gap-2"
          >
            <Upload size={18} />
            Importar GPS
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-slate-800 hover:bg-slate-700 transition-all text-white px-6 py-2.5 rounded-xl text-sm font-bold border border-slate-700 flex items-center gap-2"
          >
            <Download size={18} />
            Exportar Relatório
          </button>
          <button
            onClick={() => {
              setNewAsset({ id: '', name: '', model: '', status: AssetStatus.AVAILABLE });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 transition-all text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            <Plus size={18} />
            Cadastrar Novo Ativo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fleetData.map((asset) => (
          <div
            key={asset.id}
            onClick={() => openEditModal(asset)}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all group relative cursor-pointer"
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-slate-500 transition-all z-10"
              title="Excluir Ativo"
            >
              <Trash2 size={16} />
            </button>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-blue-600 transition-colors">
                  <Truck size={24} className="text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${asset.status === AssetStatus.OPERATING ? 'bg-emerald-500/10 text-emerald-500' :
                  asset.status === AssetStatus.MAINTENANCE ? 'bg-red-500/10 text-red-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                  {asset.status}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white leading-tight truncate pr-8">{asset.name}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{asset.id} • {asset.model}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/50">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Horímetro</p>
                  <div className="flex items-center gap-1.5 text-white font-black">
                    <Gauge size={14} className="text-blue-500" />
                    {asset.horometer}h
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Endereço</p>
                  <p className="text-[10px] text-white font-bold truncate">{asset.telemetry?.address || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-slate-500">Bateria</span>
                  <span className={(asset.telemetry?.batteryLevel || 0) < 20 ? 'text-red-500' : 'text-slate-300'}>{asset.telemetry?.batteryLevel}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${(asset.telemetry?.batteryLevel || 0) < 20 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${asset.telemetry?.batteryLevel || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); navigate('/map'); }}
              className="w-full py-4 bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Activity size={14} /> Ver Telemetria Detalhada
            </button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Ativo (Rastreável)"
      >
        <div className="space-y-6">
          {/* Identification Section */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Identificação e Especificações</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Identificador</label>
                <input placeholder="AAA-0001" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-5 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Rastreável</label>
                <input placeholder="MN08 - MOTONIVELADORA 140M" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>Motoniveladora</option>
                  <option>Escavadeira</option>
                  <option>Caminhão Basculante</option>
                  <option>Trator de Esteira</option>
                </select>
              </div>

              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Marca</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>CATERPILLAR</option>
                  <option>VOLVO</option>
                  <option>KOMATSU</option>
                  <option>SCANIA</option>
                </select>
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
                <input placeholder="140M" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Ano</label>
                <input placeholder="2014" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Cor</label>
                <input placeholder="AMARELO" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Control & Docs Section */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Documentação e Controle</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Chassis / Série</label>
                <input placeholder="Chassis" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Renavam</label>
                <input placeholder="Renavam" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Vencimento Docto</label>
                <input type="date" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Telemetry Section */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Telemetria e Combustível</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Quilometragem</label>
                <input placeholder="0.0" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Horímetro</label>
                <input placeholder="0.0" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none" />
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Combustível</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>Diesel</option>
                  <option>Gasolina</option>
                  <option>Etanol</option>
                  <option>Elétrico</option>
                </select>
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Limite Velocidade</label>
                <div className="relative">
                  <input placeholder="80" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none pr-8" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Management Section */}
          <div>
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Gestão</h4>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Cliente / Projeto</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>TRANSPORTADORA E TERRAPLANAGEM TERRA</option>
                </select>
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Departamento</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>Selecione Departamento</option>
                  <option>Obras</option>
                  <option>Mineração</option>
                </select>
              </div>
              <div className="col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Motorista Padrão</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-blue-500 outline-none">
                  <option>Sem Motorista</option>
                  <option>João da Silva</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Tabs Placeholder */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['Alertas', 'Manuais Técnicos', 'Cercas Virtuais', 'Entradas', 'Saídas', 'Periféricos', 'Motoristas', 'Rastreamento', 'Dispositivos'].map(tab => (
                <button key={tab} className="whitespace-nowrap px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2">
                  {tab === 'Alertas' && <ShieldCheck size={12} />}
                  {tab === 'Manuais Técnicos' && <BookOpen size={12} />}
                  {tab === 'Cercas Virtuais' && <MapPin size={12} />}
                  {tab}
                </button>
              ))}
            </div>

            {/* Manuais Técnicos Content (PROSIS Style) */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#003057] rounded-lg flex items-center justify-center font-black text-white text-lg border border-white/20">
                    V
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Volvo Impact 3.0</h4>
                    <p className="text-xs text-slate-500">Catálogo de Peças e Serviços (Rede Local)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open('http://192.168.100.168:8800/impact3/application/#partsTab', '_blank')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download size={14} /> Abrir em Nova Janela
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Conectado: 192.168.100.168</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white relative h-[500px]">
                <iframe
                  src="http://192.168.100.168:8800/impact3/application/#partsTab"
                  className="w-full h-full border-none"
                  title="Volvo Impact"
                />

                {/* Overlay asking for confirm if iframe fails */}
                <div className="absolute top-0 left-0 w-full h-full bg-slate-100 pointer-events-none opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <p className="px-4 py-2 bg-black/75 text-white text-xs rounded-lg backdrop-blur pointer-events-auto">
                    Se não carregar aqui, use o botão "Abrir em Nova Janela"
                  </p>
                </div>
              </div>

              {/* Meus Manuais Section */}
              <div className="mt-6 border-t border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" /> Meus Manuais & Documentos Técnicos
                  </h4>
                  <button className="px-3 py-1.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 border border-blue-600/20">
                    <Upload size={12} /> Upload Manual PDF
                  </button>
                </div>

                {newAsset.manuals && newAsset.manuals.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {newAsset.manuals.map(doc => (
                      <div key={doc.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between group hover:border-blue-500/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500/10 rounded flex items-center justify-center">
                            <FileText size={16} className="text-red-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{doc.title}</p>
                            <p className="text-[10px] text-slate-500">{doc.category} • {doc.fileSize}</p>
                          </div>
                        </div>
                        <Download size={14} className="text-slate-500 hover:text-white" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500">Nenhum manual cadastrado para este ativo.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alertas Content Placeholder (Hidden when Manuals is active - simplificação para demo, o ideal seria state para tabs) */}
            {/* ... */}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2"
            >
              <Save size={18} />
              Salvar Rastreável
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Upload className="text-blue-600" /> Importar Histórico GPS
              </h2>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selecione o Veículo</label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white text-slate-900"
                  value={importAssetId}
                  onChange={e => setImportAssetId(e.target.value)}
                >
                  <option value="">-- Escolha um Ativo --</option>
                  {fleetData?.map(a => (
                    <option key={a.id} value={a.id}>{a.title || a.name || a.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo Excel/CSV</label>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative"
                  onClick={() => document.getElementById('gps-upload-input')?.click()}
                >
                  <input
                    id="gps-upload-input"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={e => setImportFile(e.target.files?.[0] || null)}
                  />
                  <FileSpreadsheet className="text-slate-400 mb-2" size={32} />
                  <span className="text-sm text-slate-600 font-medium">
                    {importFile ? importFile.name : "Clique para selecionar arquivo"}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Suporta .xlsx e .csv (Selsyn)</span>
                </div>
              </div>

              {importLog.length > 0 && (
                <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono h-32 overflow-y-auto text-slate-600 border border-slate-200">
                  {importLog.map((l, i) => <div key={i}>{l}</div>)}
                </div>
              )}

              {isImporting && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                  disabled={isImporting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportGPS}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                  disabled={!importFile || !importAssetId || isImporting}
                >
                  {isImporting ? <><RefreshCw className="animate-spin" size={16} /> Processando...</> : 'Iniciar Importação'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetManagement;
