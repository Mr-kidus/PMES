import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuthStore from "../../store/auth.store";
import useThemeStore from "../../store/themeStore";

const backendUrl = "http://localhost:1221";

function FilePreviewModal({ file, onRemove, onSend, loading }) {
  const dark = useThemeStore((s) => s.dark);
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm px-4">
      <div className={`${dark ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-[#040613] text-black"} rounded-lg shadow-lg w-full max-w-lg p-6`}>
        <button className="absolute top-2 right-2 text-2xl text-gray-400 hover:text-red-500" onClick={onRemove} disabled={loading}>
          &times;
        </button>
        <div className="mb-2 font-semibold text-sm truncate">{file.name}</div>
        <div className="mb-4 text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
        <div className="flex flex-col items-center mb-4">
          {/\.(jpe?g|png|gif|webp)$/i.test(file.name) && (
            <img src={URL.createObjectURL(file)} alt={file.name} className="max-h-60 rounded" />
          )}
          {/\.(mp3|wav|ogg)$/i.test(file.name) && <audio controls src={URL.createObjectURL(file)} className="w-full mt-2" />}
          {/\.(mp4|webm)$/i.test(file.name) && <video controls src={URL.createObjectURL(file)} className="w-full max-h-60 mt-2" />}
          {/\.(pdf)$/i.test(file.name) && <iframe src={URL.createObjectURL(file)} title={file.name} className="w-full h-60 mt-2" />}
          {!/\.(jpe?g|png|gif|webp|mp3|wav|ogg|mp4|webm|pdf)$/i.test(file.name) && (
            <div className="text-gray-600 dark:text-gray-300 mt-4 text-sm">No preview available.</div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button className="bg-[#F36F21] hover:bg-orange-600 text-white px-4 py-1 rounded text-sm" onClick={onRemove} disabled={loading}>
            Remove
          </button>
          <button className="bg-[#040613] hover:bg-blue-800 text-white px-4 py-1 rounded text-sm" onClick={onSend} disabled={loading}>
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ user, group }) {
  const dark = useThemeStore((s) => s.dark);
  const authUser = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const normalizeFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("/uploads/")) return url;
    return url.startsWith("uploads/") ? "/" + url : "/uploads/" + url;
  };

  const fetchMessages = async () => {
    try {
      const res = group
        ? await axios.get(`${backendUrl}/api/chat/group-messages/${group._id}`, { withCredentials: true })
        : await axios.get(`${backendUrl}/api/chat/messages/${user._id}`, { withCredentials: true })
              .then(r => axios.post(`${backendUrl}/api/chat/mark-seen/${user._id}`, {}, { withCredentials: true }).then(() => r));

      setMessages(res.data.map(m => ({ ...m, fileUrl: normalizeFileUrl(m.fileUrl) })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchMessages(); }, [user, group]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && !file) return;
    if (file) { setShowFileModal(true); return; }

    try {
      const endpoint = group ? "send-group" : "send";
      await axios.post(`${backendUrl}/api/chat/${endpoint}/${group?._id || user._id}`, { text: input }, { withCredentials: true });
      setInput("");
      await fetchMessages();
    } catch {
      alert("Failed to send message.");
    }
  };

  const handleConfirmFile = async () => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    group ? form.append("groupId", group._id) : form.append("to", user._id);
    try {
      const url = group ? 'upload-group-file' : 'upload-file';
      await axios.post(`${backendUrl}/api/chat/${url}`, form, { withCredentials: true });
      await fetchMessages();
    } catch {
      alert("File upload failed");
    } finally {
      setFile(null);
      setShowFileModal(false);
      setUploading(false);
    }
  };

  const handleFileChange = (e) => { if (e.target.files[0]) { setFile(e.target.files[0]); setShowFileModal(true); } };
  const handleRemoveFile = () => { setShowFileModal(false); setFile(null); };

  const chatBg = dark ? "bg-gray-900" : "bg-white";
  const inputBg = dark ? "bg-gray-800 text-white border-gray-600" : "bg-white text-black border-gray-300";
  const sentBg = dark ? "bg-[#0D2A5C]" : "bg-[#040613]";
  const recBg = dark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800";

  return (
    <div className={`flex flex-col h-full w-full`}>
      <div className={`${chatBg} flex-1 overflow-y-auto p-3 sm:p-4 max-h-[calc(100vh-160px)]`}>
        {messages.map((m, i) => (
          <div key={m._id || i} className={`mb-2 flex ${m.isMe ? "justify-end" : "justify-start"}`}>
            <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              <div className={`px-3 py-2 rounded-lg ${m.isMe ? `${sentBg} text-white` : recBg}`}>
                {!m.isMe && group && m.from?.fullName && <div className="text-xs font-semibold mb-1">{m.from.fullName}</div>}
                {m.text && <div>{m.text}</div>}
                {m.fileUrl && (
                  <div className="mt-2">
                    <a href={`${backendUrl}${m.fileUrl}`} target="_blank" rel="noopener noreferrer">
                      {( /\.(jpe?g|png|gif|webp)$/i.test(m.fileUrl) && (
                        <img src={`${backendUrl}${m.fileUrl}`} alt={m.fileUrl} className="max-h-40 rounded border mb-1" />
                      )) ||
                        ( /\.(mp3|wav|ogg)$/i.test(m.fileUrl) && <audio controls src={`${backendUrl}${m.fileUrl}`} className="w-full mb-1" /> ) ||
                        ( /\.(mp4|webm)$/i.test(m.fileUrl) && <video controls src={`${backendUrl}${m.fileUrl}`} className="max-h-40 w-full mb-1" /> ) ||
                        ( /\.(pdf)$/i.test(m.fileUrl) && <iframe src={`${backendUrl}${m.fileUrl}`} title="" className="w-full h-60 rounded border mb-1" /> )}
                      <div className="text-blue-600 underline text-sm truncate">📎 {m.fileName}</div>
                    </a>
                  </div>
                )}
                <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className={`flex flex-col sm:flex-row items-center gap-2 p-3 border-t ${dark ? "border-gray-700" : "border-gray-300"} shadow-inner bg-${dark ? "gray-800" : "white"}`}>
        <label className="flex items-center justify-center bg-[#F36F21] hover:bg-orange-500 text-white px-4 py-2 rounded cursor-pointer text-sm">
          📎<input type="file" onChange={handleFileChange} className="hidden" />
        </label>
        <input
          className={`flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#040613] text-sm ${inputBg}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-[#040613] hover:bg-blue-800 text-white px-6 py-2 rounded-full font-semibold text-sm">
          Send
        </button>
      </form>

      {showFileModal && file && (
        <FilePreviewModal file={file} onRemove={handleRemoveFile} onSend={handleConfirmFile} loading={uploading} />
      )}
    </div>
  );
}
