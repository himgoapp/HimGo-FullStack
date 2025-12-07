let io = null;

exports.setIO = (server) => {
    io = server;
};

exports.getIO = () => io;
