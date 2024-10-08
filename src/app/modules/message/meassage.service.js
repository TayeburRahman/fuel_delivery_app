/* eslint-disable @typescript-eslint/ban-ts-comment */
const { Request, Response } = require('express');
const Conversation = require('./conversation.model');
const Message = require('./message.model');
const ApiError = require('../../../errors/ApiError');
const { Server } = require('socket.io');
const User = require('../user/user.model');
const Driver = require('../driver/driver.model');

//* One to one conversation
const sendMessage = async (data, io) => {
  const { senderId, receiverId, text } = data;

  if (!receiverId || !senderId) {
    throw new ApiError(404, 'Sender or Receiver user not found');
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    conversationId: conversation._id,
  });

  conversation.messages.push(newMessage._id);
  await Promise.all([conversation.save(), newMessage.save()]);

  if (newMessage?._id) {
    io.to(senderId).emit('single-message', newMessage);
    io.to(receiverId).emit('single-message', newMessage);
  }

  return newMessage;
};

const getMessages = async (data, io) => {
  const { senderId, receiverId, page } = data;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate({
    path: 'messages',
    options: {
      sort: { createdAt: -1 },
      skip: (page - 1) * 20,
      limit: 20,
    },
  });

  if (!conversation) {
    return 'Conversation not found';
  }
  console.log(conversation);
  io.to(senderId).emit('message', conversation?.messages || []);
  io.to(receiverId).emit('message', conversation?.messages || []);

  return conversation;
};

const conversationUser = async (data, io) => {
  const { loginId } = data;

  try {
    const conversations = await Conversation.find({
      participants: { $in: [loginId] },
    }).populate({
      path: 'messages',
      options: {
        sort: { createdAt: -1 },
        limit: 1,
      },
    });

    const updatedConversations = conversations.map(convo => {
      const filteredParticipants = convo.participants.filter(
        participantId => participantId.toString() !== loginId,
      );

      return {
        ...convo.toObject(),
        participants: filteredParticipants,
      };
    });

    const participantIds = updatedConversations.flatMap(
      convo => convo.participants,
    );
    const users = await User.find({
      _id: { $in: participantIds },
    }).select('_id name email profile_image');

    const drivers = await Driver.find({
      _id: { $in: participantIds },
    }).select('_id name email profile_image');

    const participantMap = {};
    users.forEach(user => {
      participantMap[user._id.toString()] = {
        ...user.toObject(),
        type: 'User',
      };
    });
    drivers.forEach(driver => {
      participantMap[driver._id.toString()] = {
        ...driver.toObject(),
        type: 'Driver',
      };
    });
    const conversationsWithParticipants = updatedConversations.map(convo => ({
      ...convo,
      participants: convo.participants.map(
        participantId => participantMap[participantId.toString()],
      ),
    }));

    // Emit the result to the socket
    io.to(loginId).emit(
      'get-conversation',
      conversationsWithParticipants || [],
    );

    return conversationsWithParticipants;
  } catch (error) {
    console.error('Error fetching conversations for user:', error);
    throw error;
  }
};

// module.exports = {
//   messageService: {
//     sendMessage,
//     getMessages,
//     conversationUser,
//   },
// };


const messageService = {
    sendMessage,
    getMessages,
    conversationUser,
  
  };
  
  module.exports = { messageService };
