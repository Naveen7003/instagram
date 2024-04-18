    const io = require( "socket.io" )();
    const userModel = require('./routes/users')
    const msgModel = require('./routes/message')
    const socketapi = {
        io: io
    };

    // Add your socket.io logic here!
    io.on( "connection", function( socket ) {
        console.log( "A user connected" );


        socket.on("join-user", async user => {
            try {
               await userModel.findOneAndUpdate(
                    { username: user },
                    { socketId: socket.id },
                    { new: true } // Return the updated document
                );
               
            } catch (error) {
                console.error("Error assigning socketId to user:", error);
            }
        });

        socket.on('disconnect', async () => {

            await userModel.findOneAndUpdate({
                socketId: socket.id
            }, {
                socketId: ""
            })
    
        })

    socket.on("send-private-message", async messageObject =>{
        await msgModel.create({
            message:messageObject.message,
            sender:messageObject.sender,
            receiver: messageObject.receiver
        })

        const receivers = await userModel.findOne({
            username: messageObject.receiver
        })

        socket.to(receivers.socketId).emit("receive-private-message",messageObject)

    })

    socket.on("fetch-conversation",async usersmessage =>{
        const receiver = await userModel.findOne({username: usersmessage.receiver})
        if(receiver){
            const allMessages = await msgModel.find({
                $or:[
                    {
                        sender : usersmessage.sender,
                        receiver: usersmessage.receiver
                    },
                    {
                        sender: usersmessage.receiver,
                        receiver: usersmessage.sender
                    }
                ]
            });
            io.to(socket.id).emit('send-conversation', allMessages);
        }else{
            const allMessages = await msgModel.find({
                receiver: usersmessage.receiver
            })
            io.to(socket.id).emit('send-conversation', allMessages)
        }
    })
    });
    // end of socket.io logic

    module.exports = socketapi;