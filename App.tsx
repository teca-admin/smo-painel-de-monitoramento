import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoadingOverlay, HistoryModal, AlertToast } from './components/Modals';
import { Manifesto, SMO_Sistema_DB, ManifestoEvent } from './types';
import { supabase } from './supabaseClient';

function App() {
  const [manifestos, setManifestos] = useState<Manifesto[]>([]);
  
  // Modal States (Apenas Visualização de Histórico mantida)
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [historyEvents, setHistoryEvents] = useState<ManifestoEvent[]>([]); 
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  const mapDatabaseRowToManifesto = (item: SMO_Sistema_DB): Manifesto => ({
    id: item.ID_Manifesto,
    usuario: item.Usuario_Sistema,
    cia: item.CIA,
    dataHoraPuxado: item.Manifesto_Puxado,
    dataHoraRecebido: item.Manifesto_Recebido,
    cargasINH: item["Cargas_(IN/H)"],
    cargasIZ: item["Cargas_(IZ)"],
    status: item.Status,
    turno: item.Turno,
    carimboDataHR: item["Carimbo_Data/HR"],
    usuarioOperacao: item["Usuario_Operação"],
    usuarioAcao: item["Usuario_Ação"] || item.Usuario_Action, 
    dataHoraIniciado: item.Manifesto_Iniciado,
    dataHoraDisponivel: item.Manifesto_Disponivel,
    dataHoraConferencia: item["Manifesto_em_Conferência"],
    dataHoraPendente: item.Manifesto_Pendente,
    dataHoraCompleto: item.Manifesto_Completo
  });

  const fetchManifestos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('SMO_Sistema')
        .select('*')
        .order('id', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        const mappedManifestos = (data as SMO_Sistema_DB[]).map(mapDatabaseRowToManifesto);
        setManifestos(mappedManifestos);
      }
    } catch (error: any) {
      // Falha silenciosa no polling
      console.error("Erro ao buscar manifestos:", error);
    }
  }, []);

  // Polling (Busca automática)
  useEffect(() => {
    // Busca inicial
    fetchManifestos();

    // Intervalo de atualização (5 segundos para monitoramento em tempo real)
    const intervalId = setInterval(() => {
      fetchManifestos();
    }, 5000); 

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchManifestos]);

  const handleOpenHistory = async (id: string) => {
    setViewingHistoryId(id);
    setHistoryEvents([]);
    setLoadingMsg("Carregando histórico...");

    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('SMO_Sistema_Eventos')
        .select('*')
        .eq('ID_Manifesto', id)
        .order('id', { ascending: true });

      if (!eventsError && eventsData) {
        setHistoryEvents(eventsData as ManifestoEvent[]);
      }
    } catch (error) {
      console.error("Erro eventos:", error);
    } finally {
        setLoadingMsg(null);
    }
  };

  return (
    <>
      <Dashboard 
        manifestos={manifestos}
        openHistory={handleOpenHistory}
      />

      {viewingHistoryId && (
        <HistoryModal 
          data={manifestos.find(m => m.id === viewingHistoryId)!} 
          events={historyEvents} 
          onClose={() => setViewingHistoryId(null)}
        />
      )}

      {loadingMsg && <LoadingOverlay msg={loadingMsg} />}
      {alert && <AlertToast type={alert.type} msg={alert.msg} />}
    </>
  );
}

export default App;