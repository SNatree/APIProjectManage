import { Server } from "socket.io";
import { subscribers } from "./index.js";
// const server = http.createServer(app);
// const io = new Server(server);
let instance = null;
export class SocketService {
  static Initialize(server) {
    instance = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    instance.on("connection", (socket) => {
      // console.log("rooms", socket.rooms);
      // console.log("connected", socket.client.sockets);
      // console.log("socket.id", socket.id);
      // socket.emit("userconnected", {
      //   socketid: socket.id,
      // });
      socket.join(socket.id);

      // const _username = socket.handshake.headers["x-user-id"] ?? "";
      // const sends = subscribers[_username] ?? [];
      // const subs = sends.filter((f) => f["close"] === false);
      // for (let i = 0; i < subs.length; i++) {
      //   const s = subs[i];
      //   instance.to(socket.id).emit("message", s["body"]);
      // }

      socket.on("disconnecting", (socketid) => {
        //console.log("disconnecting", socket.id);
        // console.log("begin", socket.rooms); // the Set contains at least the socket ID
        socket.leave(socketid);
        // console.log("client_conn", client_conn);
      });
      socket.on("disconnect", (socket) => {
        // console.log("disconnected");
      });
    });

    return instance;
  }

  static getInstance() {
    return instance;
  }
}

// https://socket.io/get-started/private-messaging-part-1/
