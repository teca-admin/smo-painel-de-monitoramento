import React, { useMemo, useState, useEffect } from 'react';
import { Manifesto } from '../types';
import { Clock, Package, Search, Box } from 'lucide-react';

interface DashboardProps {
  manifestos: Manifesto[];
  openHistory: (id: string) => void;
}

// Configuração das Colunas (Cores Originais)
const KANBAN_COLUMNS = [
  { 
    id: 'recebido', 
    title: 'Recebido', 
    headerColor: 'text-[#ff6c00]', 
    borderColor: 'border-[#ff6c00]',
    bgBadge: 'bg-[#ff6c00]/10'
  },
  { 
    id: 'iniciado', 
    title: 'Iniciado', 
    headerColor: 'text-[#fbbc04]', 
    borderColor: 'border-[#fbbc04]',
    bgBadge: 'bg-[#fbbc04]/10'
  },
  { 
    id: 'disponivel', 
    title: 'Disponível', 
    headerColor: 'text-[#0c343d]', 
    borderColor: 'border-[#0c343d]',
    bgBadge: 'bg-[#0c343d]/10'
  },
  { 
    id: 'conferencia', 
    title: 'Em Conferência', 
    headerColor: 'text-[#50284f]', 
    borderColor: 'border-[#50284f]',
    bgBadge: 'bg-[#50284f]/10'
  },
  { 
    id: 'pendente', 
    title: 'Pendente', 
    headerColor: 'text-[#db091b]', 
    borderColor: 'border-[#db091b]',
    bgBadge: 'bg-[#db091b]/10'
  },
  { 
    id: 'completo', 
    title: 'Completo', 
    headerColor: 'text-[#198754]', 
    borderColor: 'border-[#198754]',
    bgBadge: 'bg-[#198754]/10'
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  manifestos, openHistory
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Atualiza relógio
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
      // Filtro de busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches = m.id.toLowerCase().includes(searchLower) || 
                        m.cia.toLowerCase().includes(searchLower) ||
                        m.usuario.toLowerCase().includes(searchLower);
        if (!matches) return;
      }

      const status = m.status?.toLowerCase().trim() || '';
      
      if (status.includes('cancelado')) return;

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

  // Helper para mostrar qual horário exibir
  const getRelevantTime = (m: Manifesto, colId: string) => {
    switch(colId) {
        case 'recebido': return formatTime(m.dataHoraRecebido);
        case 'iniciado': return formatTime(m.dataHoraIniciado || m.dataHoraRecebido);
        case 'disponivel': return formatTime(m.dataHoraDisponivel || m.dataHoraIniciado);
        case 'conferencia': return formatTime(m.dataHoraConferencia || m.dataHoraDisponivel);
        case 'pendente': return formatTime(m.dataHoraPendente || m.dataHoraConferencia);
        case 'completo': return formatTime(m.dataHoraCompleto || m.dataHoraPendente);
        default: return formatTime(m.carimboDataHR);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      
      {/* HEADER SIMPLIFICADO */}
      <header className="flex-none bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10 h-[75px]">
        <div className="flex items-center gap-4">
           <div className="bg-[#690c76] text-white p-2.5 rounded-lg shadow-sm">
              <Box size={28} />
           </div>
           <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Painel Operacional SMO</h1>
        </div>

        {/* Relógio Central */}
        <div className="flex flex-col items-center">
           <div className="text-4xl font-bold text-gray-700 leading-none font-mono">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest mt-1">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
           </div>
        </div>

        {/* Busca */}
        <div className="w-[350px] relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <input 
             type="text" 
             placeholder="Buscar manifesto..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-base focus:outline-none focus:border-[#690c76] focus:ring-1 focus:ring-[#690c76] transition-all"
           />
        </div>
      </header>

      {/* ÁREA DO KANBAN - 98% Width & 100% Vertical */}
      <main className="flex-1 w-[98%] mx-auto py-3 overflow-hidden">
         <div className="grid grid-cols-6 gap-3 h-full">
             {KANBAN_COLUMNS.map(col => {
                const items = columnsData[col.id as keyof typeof columnsData] || [];
                
                return (
                  <div key={col.id} className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                     
                     {/* Header da Coluna */}
                     <div className={`p-3 border-b border-gray-200 bg-white flex justify-between items-center border-t-4 ${col.borderColor}`}>
                        <h2 className={`font-bold text-lg uppercase tracking-tight ${col.headerColor}`}>
                           {col.title}
                        </h2>
                        <span className={`px-2.5 py-1 rounded-md text-sm font-bold ${col.bgBadge} ${col.headerColor}`}>
                           {items.length}
                        </span>
                     </div>

                     {/* Lista de Cards */}
                     <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                        {items.map(m => (
                           <div 
                             key={m.id}
                             onClick={() => openHistory(m.id)}
                             className={`
                                relative bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer
                                hover:shadow-md hover:border-gray-300 transition-all group
                             `}
                           >
                              {/* Faixa lateral de cor */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${col.headerColor.replace('text-', 'bg-')}`}></div>

                              <div className="pl-3.5">
                                 <div className="flex justify-between items-start mb-2.5">
                                    <span className="text-xl font-bold text-gray-800 leading-none">
                                       {m.id.split('-').pop()}
                                       <span className="text-xs font-normal text-gray-400 block mt-0.5">{m.id}</span>
                                    </span>
                                    <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                       {m.cia}
                                    </span>
                                 </div>

                                 <div className="flex gap-2 mb-2.5">
                                    <div className="flex-1 bg-gray-50 rounded p-2 flex flex-col items-center border border-gray-100">
                                       <span className="text-[10px] text-gray-400 font-bold uppercase">IN/H</span>
                                       <span className="text-base font-bold text-gray-700 flex items-center gap-1">
                                          <Package size={14} className="text-gray-400" /> {m.cargasINH}
                                       </span>
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded p-2 flex flex-col items-center border border-gray-100">
                                       <span className="text-[10px] text-gray-400 font-bold uppercase">IZ</span>
                                       <span className="text-base font-bold text-gray-700 flex items-center gap-1">
                                          <Package size={14} className="text-gray-400" /> {m.cargasIZ}
                                       </span>
                                    </div>
                                 </div>

                                 <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
                                    <span className="text-xs text-gray-500 font-medium">
                                       {m.turno?.replace('Turno', 'T') || '-'}
                                    </span>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${col.headerColor}`}>
                                       <Clock size={14} />
                                       {getRelevantTime(m, col.id)}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}

                        {items.length === 0 && (
                           <div className="text-center py-10 opacity-40">
                              <Box className="mx-auto mb-2 text-gray-400" size={32} />
                              <span className="text-sm font-medium text-gray-400">Sem itens</span>
                           </div>
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