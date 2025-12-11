import React, { useMemo, useState, useEffect } from 'react';
import { Manifesto } from '../types';
import { Clock, Plane, Package, Box, Search } from 'lucide-react';

interface DashboardProps {
  manifestos: Manifesto[];
  openHistory: (id: string) => void;
}

// Configuração das Colunas do Kanban
const KANBAN_COLUMNS = [
  { id: 'recebido', title: 'Manifesto Recebido', color: '#ff6c00', lightColor: 'bg-orange-50', borderColor: 'border-orange-500', textColor: 'text-orange-700' },
  { id: 'iniciado', title: 'Manifesto Iniciado', color: '#fbbc04', lightColor: 'bg-yellow-50', borderColor: 'border-yellow-500', textColor: 'text-yellow-700' },
  { id: 'disponivel', title: 'Manifesto Disponível', color: '#0c343d', lightColor: 'bg-cyan-50', borderColor: 'border-cyan-600', textColor: 'text-cyan-800' },
  { id: 'conferencia', title: 'Em Conferência', color: '#50284f', lightColor: 'bg-purple-50', borderColor: 'border-purple-600', textColor: 'text-purple-800' },
  { id: 'pendente', title: 'Manifesto Pendente', color: '#db091b', lightColor: 'bg-red-50', borderColor: 'border-red-500', textColor: 'text-red-700' },
  { id: 'completo', title: 'Entregue / Completo', color: '#198754', lightColor: 'bg-green-50', borderColor: 'border-green-500', textColor: 'text-green-700' },
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
    <div className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* HEADER SUPERIOR */}
      <header className="bg-white px-6 py-3 shadow-sm border-b border-slate-200 shrink-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
           {/* Logo / Título */}
           <div className="bg-[#690c76] text-white p-2 rounded-lg shadow-md">
              <Box size={24} strokeWidth={2} />
           </div>
           <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Painel de Monitoramento</h1>
              <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 Operação em Tempo Real
              </div>
           </div>
        </div>

        {/* Relógio Central */}
        <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
           <div className="text-3xl font-bold text-slate-700 tracking-wider font-mono">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
           </div>
        </div>

        {/* Busca */}
        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Filtrar Manifesto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:ring-2 focus:ring-[#690c76] outline-none text-slate-700 w-[240px] transition-all"
              />
           </div>
        </div>
      </header>

      {/* ÁREA KANBAN */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-100">
        <div className="flex h-full gap-5 min-w-max pb-2">
          
          {KANBAN_COLUMNS.map((col) => {
            const items = columnsData[col.id as keyof typeof columnsData] || [];
            
            return (
              <div key={col.id} className="flex flex-col w-[320px] h-full rounded-2xl bg-slate-200/60 border border-white/50 shadow-inner backdrop-blur-sm">
                
                {/* Cabeçalho da Coluna */}
                <div className={`p-4 rounded-t-2xl bg-white border-t-4 ${col.borderColor} shadow-sm flex justify-between items-center shrink-0 z-10`}>
                   <h2 className={`font-bold text-sm uppercase tracking-wide ${col.textColor}`}>{col.title}</h2>
                   <span className={`text-xs font-bold px-2 py-1 rounded-md ${col.lightColor} ${col.textColor} border ${col.borderColor}/20`}>
                      {items.length}
                   </span>
                </div>

                {/* Lista de Cartões */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                   {items.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                         <div className="bg-slate-300/50 p-4 rounded-full mb-3">
                            <Box size={24} />
                         </div>
                         <span className="text-xs font-medium">Sem manifestos</span>
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
                                group relative bg-white rounded-xl p-4 shadow-sm border border-slate-200 cursor-pointer 
                                transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-[#690c76]/50
                                ${isRecent ? 'ring-2 ring-blue-400/30' : ''}
                              `}
                           >
                              {/* Indicador Lateral de Cor da Coluna */}
                              <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-md`} style={{ backgroundColor: col.color }}></div>

                              {/* Cabeçalho do Card */}
                              <div className="flex justify-between items-start mb-3 pl-3">
                                 <div>
                                    <div className="text-lg font-bold text-slate-800 leading-none mb-1">{m.id.split('-').pop()}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{m.id}</div>
                                 </div>
                                 <span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold uppercase text-slate-600 border border-slate-200">
                                    {m.cia}
                                 </span>
                              </div>

                              {/* Conteúdo Principal (Cargas) */}
                              <div className="flex gap-2 mb-3 pl-3">
                                 <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col items-center justify-center">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">IN/H</span>
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                       <Package size={12} className="text-slate-400" /> {m.cargasINH}
                                    </span>
                                 </div>
                                 <div className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-100 flex flex-col items-center justify-center">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">IZ</span>
                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                       <Package size={12} className="text-slate-400" /> {m.cargasIZ}
                                    </span>
                                 </div>
                              </div>

                              {/* Rodapé do Card */}
                              <div className="flex justify-between items-center pl-3 pt-2 border-t border-slate-100">
                                 <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" title={`Turno: ${m.turno}`}>
                                    <Plane size={12} className="text-slate-400" />
                                    <span>{m.turno?.replace('Turno', 'T') || '-'}</span>
                                 </div>
                                 <div className={`flex items-center gap-1 text-xs font-bold ${col.textColor} bg-white px-2 py-0.5 rounded-full shadow-sm border ${col.borderColor}/20`}>
                                    <Clock size={11} />
                                    {relevantTime.time}
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