import React, { useEffect } from 'react';
import { Manifesto, ManifestoEvent } from '../types';
import { History, ArrowRight } from 'lucide-react';

interface HistoryModalProps {
  data: Manifesto;
  events?: ManifestoEvent[];
  onClose: () => void;
}

const getStatusClass = (status: string) => {
  const s = status ? status.toLowerCase().replace(/\s+/g, '-') : '';
  switch (s) {
    case 'manifesto-cancelado': return 'bg-gradient-to-br from-[#6c757d] to-[#495057]';
    case 'manifesto-recebido': return 'bg-gradient-to-br from-[#ff7f00] to-[#e65c00]';
    case 'manifesto-iniciado': return 'bg-gradient-to-br from-[#fcc502] to-[#e6b400]';
    case 'manifesto-disponível': return 'bg-gradient-to-br from-[#134652] to-[#0e353f]';
    case 'manifesto-em-conferência': return 'bg-gradient-to-br from-[#683767] to-[#4d284c]';
    case 'manifesto-pendente': return 'bg-gradient-to-br from-[#f5293b] to-[#d61f2f]';
    case 'manifesto-completo': 
    case 'manifesto-entregue': return 'bg-gradient-to-br from-[#0b5fcf] to-[#084b9e]';
    default: return 'bg-gray-500';
  }
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ data, events = [], onClose }) => {
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Não registrado";
    const safeDate = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const d = new Date(safeDate);
    if (isNaN(d.getTime())) return dateStr;
    
    return d.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });
  };

  const renderRow = (label: string, value: string | undefined, isStatus: boolean = false) => {
    const hasValue = !!value && value !== "Não registrado";
    return (
       <div className="flex justify-between items-center py-[8px] border-b border-[#f0f0f0] last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
          <span className="text-[#555] text-[13px] font-medium">{label}:</span>
          {isStatus ? (
             <span className={`p-[2px_8px] rounded-[6px] text-white text-[11px] font-bold shadow-sm uppercase tracking-wide ${getStatusClass(value || '')}`}>
                {value}
             </span>
          ) : (
             <span className={`text-[13px] font-bold text-right ${hasValue ? 'text-[#333]' : 'text-[#db091b] opacity-70 italic'}`}>
                {hasValue ? value : "Não registrado"}
             </span>
          )}
       </div>
    );
  };
  
  const renderTimelineRow = (label: string, value: string | undefined) => {
     return renderRow(label, value ? formatDate(value) : undefined);
  };

  const getEventDiff = (currentEvent: ManifestoEvent, index: number) => {
    if (index === 0) return null;
    const prevEvent = events[index - 1];
    const diffs: { field: string, old: string | number, new: string | number }[] = [];
    
    const monitoredFields: (keyof ManifestoEvent)[] = ['CIA', 'Cargas_(IN/H)', 'Cargas_(IZ)', 'Manifesto_Puxado', 'Manifesto_Recebido'];
    const fieldLabels: Record<string, string> = {
        'CIA': 'CIA',
        'Cargas_(IN/H)': 'Cargas IN/H',
        'Cargas_(IZ)': 'Cargas IZ',
        'Manifesto_Puxado': 'Data Puxado',
        'Manifesto_Recebido': 'Data Recebido'
    };

    monitoredFields.forEach(key => {
        const val1 = prevEvent[key];
        const val2 = currentEvent[key];
        if (String(val1) !== String(val2)) {
            let oldVal = val1;
            let newVal = val2;
            if (key.includes('Manifesto_')) {
               oldVal = formatDate(String(val1));
               newVal = formatDate(String(val2));
            }
            diffs.push({
                field: fieldLabels[key] || key,
                old: oldVal as string | number,
                new: newVal as string | number
            });
        }
    });

    return diffs.length > 0 ? diffs : null;
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/85 z-[10000] flex items-center justify-center backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
      <div className="bg-white rounded-[20px] w-full max-w-[1000px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-slideInUp border-2 border-[#007bff] flex flex-col relative my-8">
        
        <div className="p-[20px] text-center border-b border-[#eee]">
          <div className="flex justify-center items-center gap-3">
             <span className="text-[20px]">📋</span>
             <div className="flex items-center gap-2">
                <span className={`p-[4px_10px] rounded-[6px] text-white text-[12px] font-bold shadow-sm uppercase tracking-wide ${getStatusClass(data.status || '')}`}>
                    {data.status}
                </span>
                <span className="bg-[#007bff] text-white p-[5px_12px] rounded-[8px] text-[13px] font-bold tracking-wide">{data.id}</span>
             </div>
          </div>
          <h3 className="text-[#007bff] text-[18px] font-bold mt-2">Histórico Completo</h3>
        </div>
        
        <div className="p-[30px] overflow-y-auto max-h-[70vh] custom-scrollbar">
           
           <div className="bg-white border-2 border-[#007bff] rounded-[12px] p-[25px] shadow-sm mb-6">
              <h4 className="text-[#007bff] text-[15px] font-bold mb-4 flex items-center gap-2">
                 <History size={18} /> Estado Atual do Manifesto
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <h5 className="text-[#007bff] text-[13px] font-bold uppercase tracking-wider border-b border-[#007bff]/20 pb-2 text-center">Informações</h5>
                  <div className="flex flex-col">
                     {renderRow("Usuário Sistema", data.usuario)}
                     {renderRow("Usuário Operação", data.usuarioOperacao)}
                     {renderRow("Usuário Ação", data.usuarioAcao)}
                     {renderRow("Turno", data.turno)}
                     {renderRow("CIA", data.cia)}
                     {renderRow("Cargas (IN/H)", String(data.cargasINH))}
                     {renderRow("Cargas (IZ)", String(data.cargasIZ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                   <h5 className="text-[#007bff] text-[13px] font-bold uppercase tracking-wider border-b border-[#007bff]/20 pb-2 text-center">Timeline Operacional</h5>
                   <div className="flex flex-col">
                      {renderTimelineRow("Manifesto Puxado", data.dataHoraPuxado)}
                      {renderTimelineRow("Manifesto Recebido", data.dataHoraRecebido)}
                      <div className="my-1 border-t border-dashed border-gray-200 opacity-50"></div>
                      {renderTimelineRow("Manifesto Iniciado", data.dataHoraIniciado)}
                      {renderTimelineRow("Manifesto Disponível", data.dataHoraDisponivel)}
                      {renderTimelineRow("Manifesto Em Conferência", data.dataHoraConferencia)}
                      {renderTimelineRow("Manifesto Pendente", data.dataHoraPendente)}
                      {renderTimelineRow("Manifesto Completo", data.dataHoraCompleto)}
                   </div>
                </div>
              </div>
           </div>

           {events.length > 0 && (
             <div className="bg-gray-50 border border-gray-200 rounded-[12px] p-[25px]">
                <h4 className="text-[#007bff] text-[15px] font-bold mb-6 flex items-center gap-2">
                   Registro de Alterações
                </h4>
                
                <div className="relative border-l-2 border-[#007bff]/30 ml-3 space-y-8">
                   {events.map((event, index) => {
                      const isEdit = event.Ação === "Edição de Dados";
                      const diffs = isEdit ? getEventDiff(event, index) : null;
                      
                      return (
                        <div key={event.id} className="relative pl-8">
                           <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                              isEdit ? 'bg-orange-500' : 
                              event.Ação.includes('Cancel') ? 'bg-red-500' : 'bg-[#007bff]'
                           }`}></div>

                           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                                 <span className="font-bold text-[#333] text-sm">{event.Ação}</span>
                                 <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {formatDate(event["Carimbo_Data/HR"])}
                                 </span>
                              </div>
                              
                              <div className="text-xs text-gray-600 mb-2">
                                 <strong className="text-[#007bff]">Usuário Ação:</strong> {event["Usuario_Ação"] || event.Usuario_Action || event.Usuario_Sistema}
                              </div>
                              
                              {event.Justificativa && (
                                 <div className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100 mb-3">
                                    "{event.Justificativa}"
                                 </div>
                              )}

                              {diffs && (
                                 <div className="mt-3">
                                    <h6 className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Alterações Realizadas</h6>
                                    <div className="grid gap-2">
                                       {diffs.map((diff, i) => (
                                          <div key={i} className="flex items-center text-xs bg-orange-50 border border-orange-100 p-2 rounded">
                                             <span className="font-semibold text-gray-700 w-[100px] shrink-0">{diff.field}:</span>
                                             <span className="text-red-500 line-through mr-2 opacity-70 truncate max-w-[120px]" title={String(diff.old)}>
                                                {diff.old}
                                             </span>
                                             <ArrowRight size={12} className="text-gray-400 mx-1 shrink-0" />
                                             <span className="text-green-600 font-bold truncate max-w-[120px]" title={String(diff.new)}>
                                                {diff.new}
                                             </span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
           )}
        </div>

        <div className="p-[15px] border-t border-[#eee] bg-[#f9f9f9] rounded-b-[20px] flex justify-center">
           <button onClick={onClose} className="w-full max-w-[300px] bg-gradient-to-br from-[#007bff] to-[#0056b3] text-white border-none p-[10px] rounded-[8px] cursor-pointer font-semibold text-[14px] shadow-[0_4px_15px_rgba(0,123,255,0.3)] hover:-translate-y-[1px] transition-all uppercase tracking-wide">
             Fechar
           </button>
        </div>
      </div>
    </div>
  );
};