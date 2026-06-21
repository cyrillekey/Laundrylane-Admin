import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export enum SocketState {
  CONNECTING = "CONNECTING",
  OPEN = "OPEN",
  CLOSING = "CLOSING",
  CLOSED = "CLOSED",
}

interface UseWebSocketOptions {
  url: string;
  onMessageReceived?: (event: MessageEvent) => void;

  maxReconnectAttempts?: number;
  reconnectBaseDelay?: number;
  reconnectMaxDelay?: number;
}

interface UseWebSocketReturn {
  socketState: SocketState;
  isConnected: boolean;

  send: (data: string | Blob | BufferSource) => boolean;

  close: (code?: number, reason?: string) => void;
}

export function useWebSocket({
  url,
  onMessageReceived,
  maxReconnectAttempts = Infinity,
  reconnectBaseDelay = 1000,
  reconnectMaxDelay = 30000,
}: UseWebSocketOptions): UseWebSocketReturn {
  const socketRef = useRef<WebSocket | null>(null);

  const reconnectTimeoutRef = useRef<number | null>(null);

  const reconnectAttemptsRef = useRef(0);

  /**
   * Prevents reconnect after explicit close.
   */
  const permanentlyClosedRef = useRef(false);

  /**
   * Avoid stale callback references.
   */
  const messageHandlerRef = useRef(onMessageReceived);

  const pendingMessagesRef = useRef<
    (string | Blob | BufferSource)[]
  >([]);

  const [socketState, setSocketState] = useState<SocketState>(
    SocketState.CLOSED
  );

  useEffect(() => {
    messageHandlerRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const calculateReconnectDelay = useCallback(
    (attempt: number) => {
      const exponentialDelay = Math.min(
        reconnectBaseDelay * Math.pow(2, attempt),
        reconnectMaxDelay
      );

      // Full jitter
      return Math.floor(Math.random() * exponentialDelay);
    },
    [reconnectBaseDelay, reconnectMaxDelay]
  );

  const connect = useCallback(() => {
    if (permanentlyClosedRef.current) {
      return;
    }

    if (
      socketRef.current &&
      (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      )
    ) {
      return;
    }

    setSocketState(SocketState.CONNECTING);

    const ws = new WebSocket(url);

    socketRef.current = ws;

    ws.onopen = () => {
      if (permanentlyClosedRef.current) {
        ws.close();
        return;
      }

      reconnectAttemptsRef.current = 0;

      setSocketState(SocketState.OPEN);

      while (pendingMessagesRef.current.length > 0) {
        const message = pendingMessagesRef.current.shift();

        if (message !== undefined) {
          ws.send(message);
        }
      }
    };

    ws.onmessage = (event) => {
      messageHandlerRef.current?.(event);
    };

    ws.onerror = () => {
      /**
       * Allow onclose to handle reconnect logic.
       */
    };

    ws.onclose = () => {
      setSocketState(SocketState.CLOSED);

      if (permanentlyClosedRef.current) {
        return;
      }

      if (
        reconnectAttemptsRef.current >=
        maxReconnectAttempts
      ) {
        return;
      }

      const attempt = reconnectAttemptsRef.current++;

      const delay = calculateReconnectDelay(attempt);

      reconnectTimeoutRef.current = window.setTimeout(() => {        
        // eslint-disable-next-line react-hooks/immutability
        connect();
      }, delay);
    };
  }, [
    url,
    maxReconnectAttempts,
    calculateReconnectDelay,
  ]);

  useEffect(() => {
    permanentlyClosedRef.current = false;

    connect();

    return () => {
      clearReconnectTimer();

      const ws = socketRef.current;

      socketRef.current = null;

      if (
        ws &&
        (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        )
      ) {
        ws.close();
      }
    };
  }, [url, connect, clearReconnectTimer]);

  const send = useCallback<
    UseWebSocketReturn["send"]
  >((data) => {
    const ws = socketRef.current;

    if (
      ws &&
      ws.readyState === WebSocket.OPEN
    ) {
      ws.send(data);
      return true;
    }

    pendingMessagesRef.current.push(data);

    return false;
  }, []);

  const close = useCallback<
    UseWebSocketReturn["close"]
  >(
    (code = 1000, reason = "Client closed connection") => {
      permanentlyClosedRef.current = true;

      clearReconnectTimer();

      const ws = socketRef.current;

      socketRef.current = null;

      if (
        ws &&
        (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        )
      ) {
        setSocketState(SocketState.CLOSING);
        ws.close(code, reason);
      } else {
        setSocketState(SocketState.CLOSED);
      }
    },
    [clearReconnectTimer]
  );

  return {
    socketState,
    isConnected: socketState === SocketState.OPEN,
    send,
    close,
  };
}