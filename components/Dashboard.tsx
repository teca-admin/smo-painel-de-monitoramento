import React, { useMemo, useState, useEffect } from 'react';
import { Manifesto } from '../types';
import { Clock, Package, Box } from 'lucide-react';

interface DashboardProps {
  manifestos: Manifesto[];
  openHistory: (id: string) => void;
}

// Configuração das Colunas
// Cores mantidas apenas para uso interno nos cronômetros dos cards
const KANBAN_COLUMNS = [
  { 
    id: 'recebido', 
    title: 'Recebido', 
    color: '#ff7f00'
  },
  { 
    id: 'iniciado', 
    title: 'Iniciado', 
    color: '#fcc502'
  },
  { 
    id: 'disponivel', 
    title: 'Disponível', 
    color: '#134652'
  },
  { 
    id: 'conferencia', 
    title: 'Em Conferência', 
    color: '#683767'
  },
  { 
    id: 'pendente', 
    title: 'Pendente', 
    color: '#f5293b'
  },
  { 
    id: 'completo', 
    title: 'Completo', 
    color: '#0b5fcf'
  }
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  manifestos, openHistory
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
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
  }, [manifestos]);

  // Cronômetro
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
    if (diffMs < 0) return '00:00';

    const diffSecs = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSecs / 3600);
    const minutes = Math.floor((diffSecs % 3600) / 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Cores por CIA
  const getCiaColor = (cia: string) => {
    const name = cia?.toLowerCase().trim() || '';
    switch(name) {
        case 'azul': return '#0b5fcf';
        case 'latam': return '#f5293b';
        case 'total': return '#134652';
        case 'gol': return '#ff7f00';
        case 'modern': return '#28a745'; // Verde
        default: return '#9ca3af';
    }
  };

  return (
    <div className="flex flex-col lg:h-[200vh] min-h-screen bg-gray-100 overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-none bg-white border-b border-gray-200 px-4 py-2 flex flex-col md:flex-row items-center justify-between shadow-sm z-10 gap-2 md:gap-0 min-h-[60px]">
        
        {/* Esquerda: Logo, Título e Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
           <div className="flex items-center gap-3">
               <div className="bg-[#690c76] text-white p-2 rounded-lg shadow-sm">
                  <Box size={24} />
               </div>
               <div className="flex flex-col">
                  {/* Título Principal na cor solicitada */}
                  <h1 className="text-xl font-bold tracking-tight whitespace-nowrap leading-tight" style={{ color: '#191919' }}>
                    SMO - Painel de Monitoramento
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                      painel em tempo real
                    </span>
                  </div>
               </div>
           </div>
        </div>

        {/* Direita: Relógio */}
        <div className="flex flex-col items-end md:items-end">
           <div className="text-2xl md:text-3xl font-bold text-gray-700 leading-none font-mono">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="text-[10px] md:text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
           </div>
        </div>
      </header>

      {/* ÁREA DO KANBAN */}
      <main className="flex-1 w-[98%] mx-auto pt-2 pb-0 lg:overflow-hidden overflow-y-auto lg:h-[calc(200vh-60px)] h-auto">
         {/* Mobile: 1 coluna com gap maior. Desktop: 6 colunas */}
         <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 lg:gap-2 lg:h-full pb-4 lg:pb-2">
             {KANBAN_COLUMNS.map(col => {
                const items = columnsData[col.id as keyof typeof columnsData] || [];
                
                return (
                  <div key={col.id} className="flex flex-col lg:h-full min-h-[250px] bg-gray-50 rounded-t-xl rounded-b-md border border-gray-200 shadow-sm overflow-hidden">
                     
                     {/* Header da Coluna - NEUTRO (Sem linhas coloridas) */}
                     <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center border-t-4 border-gray-300">
                        {/* Título na cor exata #191919 */}
                        <h2 className="font-bold text-lg uppercase tracking-tight" style={{ color: '#191919' }}>
                           {col.title}
                        </h2>
                        {/* Contador Neutro com cor exata #191919 */}
                        <span className="px-2.5 py-1 rounded-md text-sm font-bold bg-gray-200" style={{ color: '#191919' }}>
                           {items.length}
                        </span>
                     </div>

                     {/* Lista de Cards */}
                     <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar bg-gray-100/50">
                        {items.map(m => {
                           const ciaColor = getCiaColor(m.cia);

                           return (
                              <div 
                                key={m.id}
                                onClick={() => openHistory(m.id)}
                                className={`
                                   relative bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer
                                   hover:shadow-md hover:border-gray-300 transition-all group
                                `}
                              >
                                 {/* Faixa lateral (Cor da CIA) */}
                                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg`} style={{ backgroundColor: ciaColor }}></div>

                                 <div className="pl-3.5">
                                    <div className="flex justify-between items-start mb-2.5">
                                       {/* ID do Manifesto com cor #191919 */}
                                       <span className="text-xl font-bold leading-none" style={{ color: '#191919' }}>
                                          {m.id.split('-').pop()}
                                          <span className="text-xs font-normal text-gray-400 block mt-0.5">{m.id}</span>
                                       </span>
                                       {/* Badge CIA (Cor da CIA) */}
                                       <span 
                                          className="text-xs font-bold px-2 py-1 rounded border"
                                          style={{ 
                                             color: ciaColor, 
                                             borderColor: `${ciaColor}40`, 
                                             backgroundColor: `${ciaColor}10` 
                                          }}
                                       >
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
                                       {/* Cronômetro (Cor da etapa para referência de status) */}
                                       <div className={`flex items-center gap-1 text-sm font-bold`} style={{ color: col.color }}>
                                          <Clock size={14} />
                                          {getElapsedTime(m, col.id)}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}

                        {items.length === 0 && (
                           <div className="h-full flex flex-col items-center justify-center opacity-30 pb-20 min-h-[100px]">
                              <Box className="mb-2 text-gray-400" size={48} />
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