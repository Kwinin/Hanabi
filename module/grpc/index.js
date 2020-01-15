const grpc = require('grpc')
const uuidv1 = require('uuid/v1')
const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};

const protoLoader = require('@grpc/proto-loader');
const packageDefinition= protoLoader.loadSync(__dirname + '/protoFiles/chat.proto', options)

const proto = grpc.loadPackageDefinition(packageDefinition)
const server = new grpc.Server()

let users = [];

function join(call, callback) {
  users.push(call);
  notifyChat({ user: "Server", text: "new user joined ..." });
}

function send(call, callback) {
  notifyChat(call.request);
}

function notifyChat(message) {
  users.forEach(user => {
    user.write(message);
  });
}

// Define server with the methods and start it
server.addService(proto.example.Chat.service, { join: join, send: send });

server.bind('192.168.9.164:50051',
  grpc.ServerCredentials.createInsecure())
console.log('Server running at 192.168.9.164:50051')
server.start()
