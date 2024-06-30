import React, { useEffect, useRef, useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const Room = ({ username, room, socket }) => {
  const navigate = useNavigate();
  const [roomUsers, setRoomUsers] = useState([]);
  const [receivedMessage, setReceivedMessage] = useState([]);
  const [message, setMessage] = useState("");
  const boxDivRef = useRef(null);

  const getOldMessage = async () => {
    const response = await fetch(`${import.meta.env.VITE_SERVER}/chat/${room}`);
    if (response.status === 403) {
      return navigate("/");
    }

    const data = await response.json();
    setReceivedMessage((prev) => [...prev, ...data]);
  };

  useEffect((_) => {
    getOldMessage();
  }, []);

  useEffect(
    (_) => {
      //send joined userinfo to server
      socket.emit("joined_room", { username, room });

      //get message from server
      socket.on("message", (data) => {
        setReceivedMessage((prev) => [...prev, data]);
      });

      //get room users from server
      socket.on("room_users", (data) => {
        let previousRoomUsers = [...roomUsers];
        data.forEach((user) => {
          const index = previousRoomUsers.findIndex(
            (previousUser) => previousUser.id === user.id
          );

          if (index !== -1) {
            previousRoomUsers[index] = { ...previousRoomUsers[index], ...data };
          } else {
            previousRoomUsers.push(user);
          }

          setRoomUsers(previousRoomUsers);
        });
      });

      return () => socket.disconnect();
    },
    [socket]
  );

  const sendMessage = () => {
    if (message.trim().length > 0) {
      socket.emit("message_send", message);
      setMessage("");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  useEffect(
    (_) => {
      if (boxDivRef.current) {
        boxDivRef.current.scrollTop = boxDivRef.current.scrollHeight;
      }
    },
    [receivedMessage]
  );

  return (
    <section className="flex gap-4 h-screen">
      {/* left side */}
      <div className="w-1/3 bg-red-600 text-white font-medium relative">
        <p className="text-3xl font-bold text-center mt-5">ROOM.io</p>
        <div className="mt-10 ps-2">
          <p className="text-lg flex items-end gap-1">
            {" "}
            <ChatBubbleLeftRightIcon width={30} /> Room Name
          </p>
          <p className="text-red-600 bg-white ps-5 py-2 rounded-tl-full rounded-bl-full my-2">
            {room}
          </p>
        </div>
        <div className="mt-5 ps-2">
          <p className="flex items-end gap-1 text-lg mb-3">
            {" "}
            <UserGroupIcon width={30} /> Users
          </p>
          {roomUsers.map((user, i) => (
            <p key={i} className="flex items-end gap-1 text-sm my-2">
              {" "}
              <UserCircleIcon width={24} />{" "}
              {user.username === username ? "YOU" : user.username}
            </p>
          ))}
        </div>
        <button
          type="button"
          className="absolute bottom-0 p-2.5 flex items-center gap-1 w-full mx-2 mb-2 text-lg "
          onClick={leaveRoom}
        >
          {" "}
          <ArrowRightStartOnRectangleIcon width={30} /> Leave Room
        </button>
      </div>

      {/* right side */}
      <div className="w-full pt-5 relative">
        <div className="h-[30rem] overflow-y-auto " ref={boxDivRef}>
          {receivedMessage.map((msg, i) => (
            <div
              key={i}
              className="text-white bg-gray-500 mb-3 px-3 py-2 w-3/4 rounded-br-3xl rounded-tl-3xl "
            >
              <p className="text-sm font-medium font-mono">{msg.username}</p>
              <p className="text-lg font-medium">{msg.message}</p>
              <p className="text-sm font-mono font-medium text-right">
                {formatDistanceToNow(new Date(msg.send_at))}
              </p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 my-2 py-2.5 flex items-center w-full px-2 gap-4">
          <input
            type="text"
            placeholder="message.."
            className="w-full outline-none border-b text-lg me-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="button" onClick={sendMessage}>
            {" "}
            <PaperAirplaneIcon
              width={24}
              className="hover:text-red-600 hover:-rotate-45 duration-300"
            />{" "}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Room;
