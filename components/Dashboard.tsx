import React, { useMemo, useState, useEffect } from 'react';
import { Manifesto } from '../types';
import { Clock, Package, Search, Box } from 'lucide-react';

interface DashboardProps {
  manifestos: Manifesto[];
  openHistory: (id: string) => void;
}

// Configuração das Colunas com as CORES SOLICITADAS
const KANBAN_COLUMNS = [
  { 
    id: 'recebido', 
    title: 'Recebido', 
    // #ff7f00
    color: '#ff7f00',
    headerClass: 'text-[#ff7f00]', 
    borderClass: 'border-[#ff7f00]',
    bgBadge: 'bg-[#ff7f00]/10'
  },
  { 
    id: 'iniciado', 
    title: 'Iniciado', 
    // #fcc502
    color: '#fcc502',
    headerClass: 'text-[#fcc502]', 
    borderClass: 'border-[#fcc502]',
    bgBadge: 'bg-[#fcc502]/10'
  },
  { 
    id: 'disponivel', 
    title: 'Disponível', 
    // #134652
    color: '#134652',
    headerClass: 'text-[#134652]', 
    borderClass: 'border-[#134652]',
    bgBadge: 'bg-[#134652]/10'
  },
  { 
    id: 'conferencia', 
    title: 'Em Conferência', 
    // #683767
    color: '#683767',
    headerClass: 'text-[#683767]', 
    borderClass: 'border-[#683767]',
    bgBadge: 'bg-[#683767]/10'
  },
  { 
    id: 'pendente', 
    title: 'Pendente', 
    // #f5293b
    color: '#f5293b',
    headerClass: 'text-[#f5293b]', 
    borderClass: 'border-[#f5293b]',
    bgBadge: 'bg-[#f5293b]/10'
  },
  { 
    id: 'completo', 
    title: 'Completo', 
    // #0b5fcf
    color: '#0b5fcf',
    headerClass: 'text-[#0b5fcf]', 
    borderClass: 'border-[#0b5fcf]',
    bgBadge: 'bg-[#0b5fcf]/10'
  },
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  manifestos, openHistory
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  // Atualiza relógio geral e força re-render dos cronômetros a cada segundo
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

  // Função para calcular o tempo decorrido (Cronômetro)
  const getElapsedTime = (m: Manifesto, colId: string) => {
    let dateStr = '';
    
    switch(colId) {
        case 'recebido': dateStr = m.dataHoraRecebido; break;
        case 'iniciado': dateStr = m.dataHoraIniciado || m.dataHoraRecebido; break;
        case 'disponivel': dateStr = m.dataHoraDisponivel || m.dataHoraIniciado; break;
        case 'conferencia': dateStr = m.dataHoraConferencia || m.dataHoraDisponivel; break;
        case 'pendente': dateStr = m.dataHoraPendente || m.dataHoraConferencia; break;
        case 'completo': dateStr = m.dataHoraCompleto || m.dataHoraPendente; break;
        default: dateStr = m.carimboDataHR || '';
    }

    if (!dateStr) return '--:--';

    const safeDate = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const startDate = new Date(safeDate);
    
    if (isNaN(startDate.getTime())) return '--:--';

    const diffMs = currentTime.getTime() - startDate.getTime();
    
    // Se for negativo (data no futuro por erro de fuso), zera
    if (diffMs < 0) return '00:00';

    const diffSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSecs / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);
    // const seconds = diffSecs % 60; // Opcional, se quiser segundos descomente abaixo

    // Formato HH:MM
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col lg:h-[200vh] h-screen bg-gray-100 overflow-hidden">
      
      {/* HEADER SIMPLIFICADO - Responsivo */}
      <header className="flex-none bg-white border-b border-gray-200 px-4 py-2 flex flex-col md:flex-row items-center justify-between shadow-sm z-10 gap-2 md:gap-0 min-h-[60px]">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
           <div className="flex items-center gap-3">
               <div className="bg-[#690c76] text-white p-2 rounded-lg shadow-sm">
                  <Box size={24} />
               </div>
               <h1 className="text-xl font-bold text-gray-800 tracking-tight whitespace-nowrap">Painel SMO</h1>
           </div>
        </div>

        {/* Relógio Central Completo e Extenso - Reordenado para mobile */}
        <div className="flex flex-col items-center order-3 md:order-2">
           <div className="text-2xl md:text-3xl font-bold text-gray-700 leading-none font-mono">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
           </div>
        </div>

        {/* Busca Compacta */}
        <div className="w-full md:w-[300px] relative order-2 md:order-3">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="Buscar manifesto..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#690c76] focus:ring-1 focus:ring-[#690c76] transition-all"
           />
        </div>
      </header>

      {/* ÁREA DO KANBAN - Responsivo: Scroll Vertical no Mobile, Overflow Hidden no Desktop (mas com altura 200vh) */}
      <main className="flex-1 w-[98%] mx-auto pt-2 pb-0 lg:overflow-hidden overflow-y-auto lg:h-[calc(200vh-60px)] h-auto">
         {/* Grid: 1 coluna no mobile, 6 colunas no Desktop */}
         <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 lg:h-full pb-2">
             {KANBAN_COLUMNS.map(col => {
                const items = columnsData[col.id as keyof typeof columnsData] || [];
                
                return (
                  <div key={col.id} className="flex flex-col lg:h-full min-h-[500px] bg-gray-50 rounded-t-xl rounded-b-md border border-gray-200 shadow-sm overflow-hidden mb-4 lg:mb-0">
                     
                     {/* Header da Coluna */}
                     <div className={`p-3 border-b border-gray-200 bg-white flex justify-between items-center border-t-[5px]`} style={{ borderColor: col.color }}>
                        <h2 className={`font-bold text-lg uppercase tracking-tight`} style={{ color: col.color }}>
                           {col.title}
                        </h2>
                        <span className={`px-2.5 py-1 rounded-md text-sm font-bold ${col.bgBadge}`} style={{ color: col.color }}>
                           {items.length}
                        </span>
                     </div>

                     {/* Lista de Cards */}
                     <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar bg-gray-100/50">
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
                              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg`} style={{ backgroundColor: col.color }}></div>

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
                                    {/* Cronômetro */}
                                    <div className={`flex items-center gap-1 text-sm font-bold`} style={{ color: col.color }}>
                                       <Clock size={14} />
                                       {getElapsedTime(m, col.id)}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}

                        {items.length === 0 && (
                           <div className="h-full flex flex-col items-center justify-center opacity-30 pb-20">
                              <Box className="mb-2 text-gray-400" size={48} />
                              <span className="text-sm font-medium text-gray-400">Sem itens nesta etapa</span>
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