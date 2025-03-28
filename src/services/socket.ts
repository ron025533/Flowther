import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants";
import { JoinPresentation } from "../types/socket";

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

    sendMessage(message: string) {
        this.socket.emit('message', message);
    }

    JoinPresentation(dto: JoinPresentation) {
        this.socket.emit('join-presentation', dto);
    }

    JoinedPresentation() {
        this.socket.on('join-presentation', (data) => {
            console.log(data);
        })
    }
}

export const socketService = new SocketService();
// export default socketService;