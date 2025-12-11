import React, { useMemo, useState, useEffect } from 'react';
import { Manifesto } from '../types';
import { Clock, Plane, Package, Box, Search } from 'lucide-react';

interface DashboardProps {
  manifestos: Manifesto[];
  openHistory: (id: string) => void;
}

// Configuração das Colunas do Kanban
const KANBAN_COLUMNS = [
  { id: 'recebido', title: 'Manifesto Recebido', color: '#ff6c00', bgHeader: 'bg-orange-100', borderColor: 'border-orange-500', textColor: 'text-orange-800' },
  { id: 'iniciado', title: 'Manifesto Iniciado', color: '#fbbc04', bgHeader: 'bg-yellow-100', borderColor: 'border-yellow-500', textColor: 'text-yellow-800' },
  { id: 'disponivel', title: 'Manifesto Disponível', color: '#0c343d', bgHeader: 'bg-cyan-100', borderColor: 'border-cyan-700', textColor: 'text-cyan-900' },
  { id: 'conferencia', title: 'Em Conferência', color: '#50284f', bgHeader: 'bg-purple-100', borderColor: 'border-purple-700', textColor: 'text-purple-900' },
  { id: 'pendente', title: 'Manifesto Pendente', color: '#db091b', bgHeader: 'bg-red-100', borderColor: 'border-red-600', textColor: 'text-red-800' },
  { id: 'completo', title: 'Entregue / Completo', color: '#198754', bgHeader: 'bg-green-100', borderColor: 'border-green-600', textColor: 'text-green-800' },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  manifestos, openHistory
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Atualiza relógio do header
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Agrupamento dos Manifestos
  const columnsData = useMemo(() => {
    const cols: Record<string, Manifesto[]> = {
      recebido: [],
      iniciado: [],
      disponivel: [],
      conferencia: [],
      pendente: [],
      completo: []
    };

    manifestos.forEach(m => {
      // Filtro de busca simples
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = m.id.toLowerCase().includes(searchLower) || 
                        m.cia.toLowerCase().includes(searchLower) ||
                        m.usuario.toLowerCase().includes(searchLower);
        if (!matches) return;
      }

      const status = m.status?.toLowerCase().trim() || '';
      
      if (status.includes('cancelado')) return; // Ignorar cancelados no painel operacional

      if (status === 'manifesto recebido') cols.recebido.push(m);
      else if (status === 'manifesto iniciado') cols.iniciado.push(m);
      else if (status === 'manifesto disponível') cols.disponivel.push(m);
      else if (status === 'manifesto em conferência') cols.conferencia.push(m);
      else if (status === 'manifesto pendente') cols.pendente.push(m);
      else if (status === 'manifesto completo' || status === 'manifesto entregue') cols.completo.push(m);
      else cols.recebido.push(m); // Fallback
    });

    return cols;
  }, [manifestos, searchTerm]);

  // Formatação de Hora
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--:--';
    const safeDate = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const d = new Date(safeDate);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper para mostrar qual horário exibir baseado na coluna
  const getRelevantTime = (m: Manifesto, colId: string) => {
    switch(colId) {
        case 'recebido': return { label: 'Recebido', time: formatTime(m.dataHoraRecebido) };
        case 'iniciado': return { label: 'Iniciado', time: formatTime(m.dataHoraIniciado || m.dataHoraRecebido) };
        case 'disponivel': return { label: 'Disponível', time: formatTime(m.dataHoraDisponivel || m.dataHoraIniciado) };
        case 'conferencia': return { label: 'Conf.', time: formatTime(m.dataHoraConferencia || m.dataHoraDisponivel) };
        case 'pendente': return { label: 'Pendente', time: formatTime(m.dataHoraPendente || m.dataHoraConferencia) };
        case 'completo': return { label: 'Entregue', time: formatTime(m.dataHoraCompleto || m.dataHoraPendente) };
        default: return { label: 'Atualiz.', time: formatTime(m.carimboDataHR) };
    }
  };

  return (
    // CONTAINER PRINCIPAL - 98% DA TELA E CENTRALIZADO
    <div className="w-[98%] h-[97vh] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden relative">
      
      {/* HEADER SUPERIOR */}
      <header className="px-8 py-4 bg-white border-b border-slate-200 shrink-0 z-20 flex justify-between items-center h-[90px]">
        
        {/* Lado Esquerdo: Título e Status */}
        <div className="flex items-center gap-5">
           <div className="bg-gradient-to-br from-[#690c76] to-[#4a0852] text-white p-3 rounded-xl shadow-lg shadow-purple-900/20">
              <Box size={32} strokeWidth={2.5} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Painel de Monitoramento</h1>
              <div className="text-sm font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
                 <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                 Operação em Tempo Real
              </div>
           </div>
        </div>

        {/* Centro: Relógio Grande */}
        <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2 bg-slate-50 px-8 py-2 rounded-2xl border border-slate-100 shadow-inner">
           <div className="text-5xl font-black text-slate-800 tracking-widest font-mono leading-none">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
           </div>
        </div>

        {/* Lado Direito: Busca */}
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#690c76] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Filtrar Manifesto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-slate-100 border-2 border-slate-100 rounded-xl text-base font-medium focus:ring-4 focus:ring-[#690c76]/10 focus:border-[#690c76] outline-none text-slate-700 w-[300px] transition-all placeholder:text-slate-400"
              />
           </div>
        </div>
      </header>

      {/* ÁREA KANBAN - GRID DE 6 COLUNAS */}
      <main className="flex-1 overflow-hidden p-6 bg-slate-50">
        <div className="grid grid-cols-6 gap-5 h-full w-full">
          
          {KANBAN_COLUMNS.map((col) => {
            const items = columnsData[col.id as keyof typeof columnsData] || [];
            
            return (
              <div key={col.id} className="flex flex-col h-full rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
                
                {/* Cabeçalho da Coluna */}
                <div className={`p-4 border-b-4 ${col.borderColor} ${col.bgHeader} flex flex-col gap-1 shrink-0`}>
                   <div className="flex justify-between items-center">
                      <h2 className={`font-black text-lg leading-tight uppercase tracking-tight ${col.textColor} truncate`} title={col.title}>
                        {col.title.replace('Manifesto ', '')}
                      </h2>
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-lg bg-white/60 ${col.textColor} shadow-sm border border-white/50 backdrop-blur-sm`}>
                          {items.length}
                      </span>
                   </div>
                </div>

                {/* Lista de Cartões */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-50/50">
                   {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-70">
                         <Box size={40} strokeWidth={1.5} />
                         <span className="text-sm font-semibold mt-2">Vazio</span>
                      </div>
                   ) : (
                      items.map(m => {
                         const relevantTime = getRelevantTime(m, col.id);
                         const isRecent = (new Date().getTime() - new Date(m.carimboDataHR || '').getTime()) < 1000 * 60 * 5; // 5 min

                         return (
                           <div 
                              key={m.id}
                              onClick={() => openHistory(m.id)}
                              className={`
                                group relative bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 cursor-pointer 
                                transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-[#690c76] hover:ring-1 hover:ring-[#690c76]
                                ${isRecent ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                              `}
                           >
                              {/* Tarja Lateral de Status */}
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ backgroundColor: col.color }}></div>

                              {/* Conteúdo do Card */}
                              <div className="pl-3">
                                 {/* ID e CIA */}
                                 <div className="flex justify-between items-start mb-3">
                                    <div>
                                       <div className="text-2xl font-black text-slate-800 leading-none mb-1 tracking-tight">
                                          {m.id.split('-').pop()}
                                       </div>
                                       <div className="text-xs font-bold text-slate-400 font-mono tracking-wide">{m.id}</div>
                                    </div>
                                    <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-bold uppercase text-slate-600 border border-slate-200 tracking-wide">
                                       {m.cia}
                                    </span>
                                 </div>

                                 {/* Cargas (Aumentado) */}
                                 <div className="flex gap-2 mb-3">
                                    <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                                       <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">IN/H</span>
                                       <span className="text-lg font-black text-slate-700 flex items-center gap-1">
                                          <Package size={14} className="text-slate-400" /> {m.cargasINH}
                                       </span>
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                                       <span className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">IZ</span>
                                       <span className="text-lg font-black text-slate-700 flex items-center gap-1">
                                          <Package size={14} className="text-slate-400" /> {m.cargasIZ}
                                       </span>
                                    </div>
                                 </div>

                                 {/* Rodapé (Tempo e Turno) */}
                                 <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-semibold" title={`Turno: ${m.turno}`}>
                                       <Plane size={14} className="text-slate-400" />
                                       <span>{m.turno?.replace('Turno', 'T') || '-'}</span>
                                    </div>
                                    <div 
                                      className="flex items-center gap-1.5 text-sm font-bold px-2 py-1 rounded-full shadow-sm border"
                                      style={{ color: col.color, borderColor: `${col.color}30`, backgroundColor: `${col.color}10` }}
                                    >
                                       <Clock size={14} strokeWidth={2.5} />
                                       {relevantTime.time}
                                    </div>
                                 </div>
                              </div>
                           </div>
                         );
                      })
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};