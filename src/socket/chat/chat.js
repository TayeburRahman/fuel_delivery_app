const Admin = require("../../app/modules/admin/admin.model");
const User = require("../../app/modules/auth/auth.model");
const Conversation = require("../../app/modules/conversation/conversation.model"); 
const Message = require("../../app/modules/message/message.modal");


const handleChat = async (io, socket, currentUserId, onlineUser) => {
  // message page--------------------------------------------
  socket.on("message-page", async (id) => {
    let userDetails;

    const adminUserDetails = await Admin.findById(id);

    if (adminUserDetails) {
      userDetails = adminUserDetails;
    }
    const dentalUserDetails = await User.findById(id);

    if (dentalUserDetails) {
      userDetails = dentalUserDetails;
    }
    if (userDetails) {
      const payload = {
        _id: userDetails._id,
        name: userDetails.name,
        profile_image: userDetails?.profile_image,
        online: onlineUser.has(id),
      };
      socket.emit("message-user", payload);
    } else {
      console.log("User not found");
    }
    //get previous message----------------------------------------
    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: id },
        { sender: id, receiver: currentUserId },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    // console.log("previous conversation message", getConversationMessage);

    socket.emit("message", getConversationMessage?.messages || []);
  });

  // new message----------------------------------------------
  socket.on("new-message", async (data) => {
    let conversation = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    });
    // if conversation is not available then create a new conversation---------------
    if (!conversation) {
      conversation = await Conversation.create({
        sender: data?.sender,
        receiver: data?.receiver,
        senderModel: data?.senderModel,
        receiverModel: data?.receiverModel,
      });
    }
    const messageData = {
      msgByUserId: data?.msgByUserId,
      text: data?.text,
      videoUrl: data?.videoUrl,
      imageUrl: data?.imageUrl,
    };
    const saveMessage = await Message.create(messageData);
    // update the conversaton---------------------------
    const updateConversation = await Conversation.updateOne(
      {
        _id: conversation?._id,
      },
      {
        $push: { messages: saveMessage?._id },
      }
    );

    // get conversation message -----------------------------------------
    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: data?.sender, receiver: data?.receiver },
        { sender: data?.receiver, receiver: data?.sender },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    // send to the client side -----------------------------------------------------
    io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
    io.to(data?.receiver).emit(
      "message",
      getConversationMessage?.messages || []
    );
    //send conversation
    const conversationSender = await getConversation(data?.sender);
    const conversationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conversationSender);
    io.to(data?.receiver).emit("conversation", conversationReceiver);
  });

  // get conversationMessage
  const getConversation = async (crntUserId) => {
    if (crntUserId) {
      try {
        const currentUserConversation = await Conversation.find({
          $or: [{ sender: crntUserId }, { receiver: crntUserId }],
        })
          .sort({ updatedAt: -1 })
          .populate({
            path: "messages",
            model: "Message",
          })
          .populate("sender")
          .populate("receiver");
  
        const conversation = currentUserConversation.map((conv) => {
          const countUnseenMessage = conv.messages.reduce((prev, curr) => {
            const msgByUserId = curr.msgByUserId.toString();
  
            if (msgByUserId !== crntUserId) {
              return prev + (curr.seen ? 0 : 1);
            } else {
              return prev;
            }
          }, 0);
  
          return {
            _id: conv._id,
            sender: conv.sender,
            receiver: conv.receiver,
            unseenMsg: countUnseenMessage,
            lastMsg: conv.messages[conv.messages.length - 1],
          };
        });
  
        return conversation;
      } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }
    } else {
      return [];
    }
  };

  const conversation = await getConversation(currentUserId);
  socket.emit("conversation", conversation);

  // Handle seen event
  socket.on("seen", async (msgByUserId) => {
    try {
      // Fetch the conversation between the current user and the message sender
      const conversation = await Conversation.findOne({
        $or: [
          { sender: currentUserId, receiver: msgByUserId },
          { sender: msgByUserId, receiver: currentUserId },
        ],
      });

      if (!conversation) {
        console.log("Conversation not found");
        return;
      }

      const conversationMessageIds = conversation.messages || [];

      // Update message status to 'seen'
      await Message.updateMany(
        { _id: { $in: conversationMessageIds }, msgByUserId: msgByUserId },
        { $set: { seen: true } }
      );

      // Fetch and emit updated conversations
      const conversationSender = await getConversation(currentUserId);
      const conversationReceiver = await getConversation(msgByUserId);

      io.to(currentUserId).emit("conversation", conversationSender);
      io.to(msgByUserId).emit("conversation", conversationReceiver);
    } catch (error) {
      console.error("Error handling seen event:", error);
    }
  });

};

module.exports = handleChat;
