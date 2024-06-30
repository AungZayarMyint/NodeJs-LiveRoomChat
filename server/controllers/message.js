const Message = require("../models/Message");
const OPENED_ROOMS = ["js", "node"];

exports.getOldMessage = (req, res, next) => {
  const { roomName } = req.params;

  if (OPENED_ROOMS.includes(roomName)) {
    Message.find({ room: roomName })
      .select("username message send_at")
      .then((messages) => {
        res.status(200).json(messages);
      });
  } else {
    res.status(403).json("Room is not open!");
  }
};
