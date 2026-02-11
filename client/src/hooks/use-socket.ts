import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { WS_EVENTS } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSocket(matchId: number) {
  const socket = getSocket();
  const queryClient = useQueryClient();
  const matchIdRef = useRef(matchId);

  useEffect(() => {
    matchIdRef.current = matchId;
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    socket.connect();
    socket.emit(WS_EVENTS.JOIN_MATCH, matchId);

    const handleUpdate = (data: any) => {
      queryClient.setQueryData([api.matches.get.path, matchIdRef.current], data);
    };

    const handleTimer = (data: { prepTime: number, banTime: number }) => {
      // Could sync local timer state here if complex
    };

    socket.on(WS_EVENTS.UPDATE_MATCH, handleUpdate);
    socket.on(WS_EVENTS.TIMER_UPDATE, handleTimer);

    return () => {
      socket.off(WS_EVENTS.UPDATE_MATCH, handleUpdate);
      socket.off(WS_EVENTS.TIMER_UPDATE, handleTimer);
      socket.emit('leave_match', matchId);
    };
  }, [matchId, queryClient]);

  const emitDraftAction = (type: 'ban' | 'pick', charId: string) => {
    socket.emit(WS_EVENTS.DRAFT_ACTION, { matchId, type, charId });
  };

  return { socket, emitDraftAction };
}
