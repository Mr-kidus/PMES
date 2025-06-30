import { Clock } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "Joined New User",
    color: "bg-green-600",
    title: "New Registration: Finibus Bonorum et Malorum",
    message:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium",
    user: "Allen Deu",
    time: "24 Nov 2018 at 9:30 AM",
  },
  {
    id: 2,
    type: "Message",
    color: "bg-orange-400",
    title: "Darren Smith sent new message",
    message:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium",
    user: "Darren",
    time: "24 Nov 2018 at 9:30 AM",
  },
  {
    id: 3,
    type: "Comment",
    color: "bg-purple-700",
    title: "Arin Ganshiram Commented on post",
    message:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium",
    user: "Arin Ganshiram",
    time: "24 Nov 2018 at 9:30 AM",
  },
];

export default function Notifications() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">NOTIFICATIONS</h2>
      <div className="bg-white rounded-lg shadow p-4 space-y-6">
        {notifications.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-start border-b last:border-b-0 pb-4"
          >
            <div className="flex items-start gap-3">
              <button className="text-gray-400 hover:text-gray-600">✖</button>
              <div>
                <span
                  className={`text-white text-xs font-semibold px-2 py-1 rounded ${item.color}`}
                >
                  {item.type}
                </span>
                <h3 className="mt-2 font-semibold text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.message}</p>
                <p className="text-sm font-bold text-red-600 mt-1">
                  {item.user}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}