import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants";


class SocketService {
    private socket: Socket;

    constructor() {
        this.socket = io(SOCKET_URL);
    }

    receiveMessage() {
        this.socket.on('message', (data) => {
            console.log('message:',data);
        })
    }

    handleMessaging(message: string) {
        this.socket.emit('message', message);
    }
}

export const socketService = new SocketService();
// export default socketService;