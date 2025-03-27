import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants";


class SocketService {
    private socket: Socket;

    constructor() {
        this.socket = io(SOCKET_URL);
    }

    handleSomething() {
        console.log('something');
    }
} 

export const socketService = new SocketService();
// export default socketService;