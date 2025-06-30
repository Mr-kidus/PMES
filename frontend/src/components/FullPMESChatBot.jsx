import { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { BsRobot } from "react-icons/bs";
import { BiMicrophone, BiStopCircle, BiSend, BiPhoneCall } from "react-icons/bi";
import useThemeStore from "../store/themeStore";

// Add your instructionSets and humanInteractions here or import them
const instructionSets = {
  general: [
    { label: 'What is PMES?', value: 'PMES stands for Planning and Monitoring Evaluation System. It helps track plans, performance, and strategic outcomes.' },
    { label: 'System Features', value: 'PMES offers dashboards, planning tools, approval workflows, reporting, notifications, and performance analytics.' },
    { label: 'Target Users', value: 'PMES is designed for ministers, executives, directors, planning officers, and administrative staff.' },
    { label: 'Accessing PMES', value: 'You can access PMES via the internal government network or secure login portal.' },
    { label: 'Security Measures', value: 'PMES uses role-based access control, encrypted sessions, and audit logs to maintain data security.' },
    { label: 'Mobile Support', value: 'Currently, PMES is optimized for desktop browsers. A mobile-friendly version is under development.' },
    { label: 'How often is data updated?', value: 'Data is updated in real-time upon submission or approval of plans and reports.' },
    { label: 'Can I export my data?', value: 'Yes. Most data tables and reports can be exported to Excel or PDF formats.' },
    { label: 'What if I forget my password?', value: 'Use the "Forgot Password" link on the login page or contact your system administrator.' },
    { label: 'Language Support', value: 'Currently, the system interface is in English. Multilingual support is planned for future releases.' }
  ],
  planning: [
    { label: 'Submit New Plan', value: 'Navigate to Dashboard > New Plan. Fill out the form, attach required files, and submit for approval.' },
    { label: 'Edit Saved Plan', value: 'Go to My Plans > Drafts. Click "Edit" next to the draft you want to update.' },
    { label: 'Approval Workflow', value: 'Plans move through Work Unit > Executive > Strategic > Ministerial review stages.' },
    { label: 'Attach Files', value: 'You can upload documents, spreadsheets, and images as plan attachments.' },
    { label: 'Save as Draft', value: 'Click "Save Draft" to save your progress without submitting the plan.' },
    { label: 'Plan Versioning', value: 'Each plan revision is stored with version history to track changes over time.' },
    { label: 'Plan Status Indicators', value: 'Status includes: Draft, Pending, Approved, Rejected, or Returned for Edits.' },
    { label: 'Plan Categories', value: 'Plans are categorized by goals, strategic alignment, department, and fiscal year.' }
  ],
  reporting: [
    { label: 'Submit Quarterly Report', value: 'Go to Reports > Select Quarter. Enter KPIs and supporting data. Click "Submit".' },
    { label: 'Justify Low KPI', value: 'Any KPI score below 60% requires a detailed justification and attached evidence.' },
    { label: 'Upload Report Files', value: 'Attach performance evidence such as meeting minutes, receipts, or work photos.' },
    { label: 'Can I edit after submit?', value: 'No. Reports are locked after submission unless returned by a reviewer.' },
    { label: 'Report Approval', value: 'Reports follow the same approval chain as plans. Notifications are sent at each stage.' },
    { label: 'View Past Reports', value: 'Use the Report Archive under the Reports tab to browse and filter older submissions.' },
    { label: 'Export Reports', value: 'Finalized reports can be exported as PDF or Excel using the "Export" button.' },
    { label: 'Report Status Colors', value: 'Green means approved, yellow means pending, red means rejected.' }
  ],
  dashboard: [
    { label: 'Dashboard Overview', value: 'The dashboard provides a real-time overview of KPIs, plan status, and notifications.' },
    { label: 'Color Code Explanation', value: 'Green: >80%, Yellow: 60–80%, Red: <60%. These colors indicate performance levels.' },
    { label: 'Notifications', value: 'You will see alerts for new tasks, comments, overdue submissions, and approvals.' },
    { label: 'Filter by Unit', value: 'Use the filters at the top of the dashboard to select your department or unit.' },
    { label: 'View KPI Graphs', value: 'Click on any KPI to view trend charts and underlying data for past quarters.' },
    { label: 'What are alerts?', value: 'Alerts notify you of deadlines, missing justifications, or rejected plans.' },
    { label: 'Can I customize the view?', value: 'Yes. You can choose to show or hide certain widgets and rearrange layout.' }
  ],
  roles: [
    { label: 'Minister Role', value: 'Can view national strategic plans, approve high-level documents, and monitor all KPIs.' },
    { label: 'Strategic Leader Role', value: 'Coordinates planning, aligns activities to national goals, and validates KPIs and reports.' },
    { label: 'Executive Role', value: 'Reviews departmental plans, monitors work unit submissions, and escalates issues as needed.' },
    { label: 'Work Unit Leader Role', value: 'Creates plans and reports, initiates KPI tracking, and submits to executives.' },
    { label: 'Admin Role', value: 'Manages users, permissions, logs, and has access to system-wide settings.' },
    { label: 'Planner Role', value: 'Responsible for drafting plans and reports, adding justifications, and tracking deadlines.' },
    { label: 'Reviewer Role', value: 'Provides feedback and either approves or returns submissions for correction.' }
  ],
  moreContent: [
    // Fill this with 100+ additional extended FAQs like:
    { label: 'How are KRAs linked to KPIs?', value: 'KRAs define broad goals, while KPIs are measurable indicators of progress.' },
    { label: 'What if my KPI is missing?', value: 'Contact your planner or admin to verify the indicator setup in your unit plan.' },
    { label: 'How to request access?', value: 'Submit an access request through your department head or system admin.' },
    { label: 'Can I track other units?', value: 'Users with cross-unit access can monitor performance across multiple departments.' },
    { label: 'What is a Strategic Plan?', value: 'A long-term document aligning all organizational plans with national development goals.' },
    { label: 'Who manages account issues?', value: 'The PMES Admin team or your Ministry’s IT department handles technical issues.' },
    { label: 'What is the review turnaround?', value: 'Review periods range from 2 to 7 days depending on submission complexity.' },
    // Add 100+ more here as needed
  ]
};


const humanInteractions = [
  {
    triggers: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "greetings", "yo", "hiya"],
    responses: [
      "Hello there! 😊 How can I assist you today?",
      "Hey! 👋 Ready when you are.",
      "Hi! Anything I can help you with today?",
      "Good to see you! What would you like to do?",
      "Hey hey! Let's get started.",
      "Greetings, friend! Need help with something in PMES?",
      "Yo! I'm here and ready to support.",
    ],
  },
  {
    triggers: ["thank you", "thanks", "thanks a lot", "thank you very much", "thx", "ty", "much appreciated"],
    responses: [
      "You're very welcome! 😊",
      "No problem at all — happy to help!",
      "Always here if you need me again!",
      "Glad I could assist. 🙌",
      "My pleasure!",
      "Anytime! Don’t hesitate to reach out again.",
    ],
  },
  {
    triggers: ["bye", "goodbye", "see you", "farewell", "stop", "catch you later", "talk to you later", "peace out"],
    responses: [
      "Bye! Wishing you a productive day ahead! 👋",
      "Catch you later. Stay awesome!",
      "Take care! I'm here if you need help again.",
      "Goodbye! Don't forget to submit your report! 😄",
      "Peace out! 🕊️",
      "Talk soon. 👋",
    ],
  },
  {
    triggers: ["how are you", "how is it going", "how do you do", "what's up", "how are things", "how's life"],
    responses: [
      "I'm just a bundle of code, but I’m doing great! 🤖 How about you?",
      "All good on this end. Ready to assist!",
      "Feeling helpful and caffeinated — virtually of course. ☕",
      "Everything's running smoothly here. Hope you're doing well too!",
    ],
  },
  {
    triggers: ["what can you do", "help", "assist me", "support", "help me", "what are your features", "what services do you provide"],
    responses: [
      "I can help with planning, reporting, KPI tracking, and answering questions about PMES.",
      "Need guidance on submitting plans or tracking performance? I’ve got you covered!",
      "Ask me anything about the PMES system, from KRA definitions to report deadlines.",
      "Think of me as your PMES co-pilot. Just tell me what you need. 🚀",
    ],
  },
  {
    triggers: ["who created you", "who made you", "who built you", "who designed you", "who is your creator"],
    responses: [
      "I was crafted with care by the Ministry of Innovation and Technology to help with PMES.",
      "The IT team at the Ministry built me to assist users like you. 😊",
      "I exist to make your PMES experience smoother!",
    ],
  },
  {
    triggers: ["sorry", "apologies", "my bad", "excuse me"],
    responses: [
      "No worries at all! 😊",
      "It’s totally fine — let’s keep going.",
      "All good, really!",
      "You’re human — I get it. Let’s continue.",
    ],
  },
  {
    triggers: ["yes", "yeah", "yep", "sure", "affirmative", "correct", "indeed", "exactly", "right"],
    responses: [
      "Awesome! ✅",
      "Perfect, let’s proceed.",
      "Thanks for confirming!",
      "Good to know!",
    ],
  },
  {
    triggers: ["no", "nope", "nah", "negative", "not really", "don't"],
    responses: [
      "Okay, no problem.",
      "Alright — let me know if anything changes!",
      "Got it. Feel free to ask anytime.",
    ],
  },
  {
    triggers: ["what's your name", "who are you", "identify yourself", "your identity"],
    responses: [
      "I’m PMES Assistant — your guide for everything planning, monitoring, and evaluation!",
      "Call me PMES Bot. I specialize in helping you track and plan effectively.",
    ],
  },
  {
    triggers: ["tell me a joke", "make me laugh", "funny", "joke please"],
    responses: [
      "Why did the KPI go to therapy? Too much pressure to perform! 😄",
      "Why did the report file apply for a job? It wanted to be submitted. 😂",
      "How does a chatbot take its coffee? With artificial sweetener! 🤖",
    ],
  },
  {
    triggers: ["what time is it", "current time", "time now"],
    responses: [
      "I don't have a watch, but your device should show you the time ⏰",
      "Good question! Please check your system clock for accuracy!",
    ],
  },
  {
    triggers: ["thank you for your help", "thanks for your support", "appreciate your assistance"],
    responses: [
      "You're very welcome! 😊",
      "Anytime — I'm always here if you need me.",
      "Glad I could be of assistance.",
    ],
  },
  {
    triggers: ["how do i submit a report", "report submission", "submit report", "reporting process"],
    responses: [
      "Navigate to the Reports section, select the time period, enter KPI data, and hit 'Submit'.",
      "Make sure you justify any KPI results under 60% — that’s important!",
    ],
  },
  {
    triggers: ["how do i create a plan", "creating plan", "submit plan", "plan creation"],
    responses: [
      "Go to the Planning module, fill in the required fields, and submit your plan for review.",
      "You can save your plan as a draft and finalize it later. 😊",
    ],
  },
  {
    triggers: ["what is KPI", "define KPI", "meaning of KPI"],
    responses: [
      "KPI stands for Key Performance Indicator — a measurable value that shows progress toward goals.",
      "It’s a key part of tracking performance in PMES.",
    ],
  },
  {
    triggers: ["what is KRA", "define KRA", "meaning of KRA"],
    responses: [
      "KRA stands for Key Result Area — it defines your main responsibility areas.",
      "KRAs help align your goals with strategic objectives in the Ministry.",
    ],
  },
  {
    triggers: ["who approves plans", "plan approval process"],
    responses: [
      "Plans are approved in stages: Work Unit → Executive → Strategic Unit → Minister.",
      "Each level reviews for alignment with broader goals.",
    ],
  },
  {
    triggers: ["how to track performance", "performance tracking"],
    responses: [
      "Use the PMES dashboard to view submitted KPI data. You’ll see charts and progress bars too.",
      "Performance is updated in near real-time for quick insights.",
    ],
  },
  {
    triggers: ["how to export,", "download reports"],
    responses: [
      "Visit the report summary page and click on 'Export' — choose PDF or Excel!",
      "Exporting reports makes sharing with leadership much easier. 👍",
    ],
  },
  {
    triggers: ["how to contact support", "helpdesk", "get support"],
    responses: [
      "You can reach out to IT support via email or phone — check the intranet for contact info.",
      "Support is available Mon–Fri, during office hours.",
    ],
  },
  {
    triggers: ["what is PMES", "define PMES"],
    responses: [
      "PMES stands for Planning and Monitoring Evaluation System. It’s the Ministry’s tool to manage goals, KRAs, and KPIs.",
      "It helps ensure strategic alignment across all units.",
    ],
  },
  {
    triggers: ["i'm confused", "this is confusing", "don't understand"],
    responses: [
      "No worries — let's take it step by step. What part is unclear?",
      "I'm here to help! Could you tell me which part is confusing?",
    ],
  },
  {
    triggers: ["this is awesome", "good bot", "well done", "great job", "thank you bot"],
    responses: [
      "Aw, thank you! 😊 That means a lot!",
      "Glad to be helpful!",
      "You're awesome too!",
    ],
  },
];

function getHumanResponse(text) {
  const lowerText = text.toLowerCase().trim();

  for (const interaction of humanInteractions) {
    for (const trigger of interaction.triggers) {
      if (lowerText === trigger || lowerText.includes(trigger)) {
        const responses = interaction.responses;
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  }
  return null;
}

function findBestInstructionAnswer(text) {
  const lowerText = text.toLowerCase();
  const inputWords = lowerText.split(/\W+/).filter(Boolean);

  let bestMatch = null;
  let bestScore = 0;

  const allFaqItems = Object.values(instructionSets).flat();

  for (const item of allFaqItems) {
    const labelWords = item.label.toLowerCase().split(/\W+/).filter(Boolean);
    const commonWords = inputWords.filter((word) => labelWords.includes(word));
    const overlapRatio = commonWords.length / Math.max(inputWords.length, labelWords.length);

    if (overlapRatio > bestScore) {
      bestScore = overlapRatio;
      bestMatch = item;
    }
  }

  // Only return if at least half the words match
  if (bestScore >= 0.5) {
    return bestMatch.value;
  }

  return null;
}

function FullPMESChatBot() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("general");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [historyMessages, setHistoryMessages] = useState([]);
  const [callActive, setCallActive] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState("");
  const dark = useThemeStore((state) => state.dark);

  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        setLastSpokenText(finalTranscript || interimTranscript);

        if (finalTranscript && callActive) {
          recognitionRef.current.stop();
          setRecognizing(false);
          setLastSpokenText("");

          handleCallSend(finalTranscript.trim());
        }
      };

      recognitionRef.current.onerror = () => {
        setRecognizing(false);
      };

      recognitionRef.current.onend = () => {
        setRecognizing(false);
      };
    }
  }, [callActive]);

  const speak = (text) =>
    new Promise((resolve) => {
      if (synthRef.current.speaking) synthRef.current.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 1;
      synthRef.current.speak(utter);
      setSpeaking(true);
      utter.onend = () => {
        setSpeaking(false);
        resolve();
      };
      utter.onerror = () => {
        setSpeaking(false);
        resolve();
      };
    });

  const handleChatSend = (text) => {
    if (!text.trim()) return;
    setChatMessages((prev) => [...prev, { sender: "user", text }]);
    setHistoryMessages((prev) => [...prev, text]);

    // First check human interaction triggers
    const humanResp = getHumanResponse(text);
    if (humanResp) {
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { sender: "bot", text: humanResp }]);
        speak(humanResp);
      }, 400);
      setChatInput("");
      return;
    }

    // Then try instruction sets
    const faqAnswer = findBestInstructionAnswer(text);
    if (faqAnswer) {
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { sender: "bot", text: faqAnswer }]);
        speak(faqAnswer);
      }, 400);
      setChatInput("");
      return;
    }

    const fallback = "Sorry, I don't have information on that right now.";
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: "bot", text: fallback }]);
      speak(fallback);
    }, 400);

    setChatInput("");
  };

  const handleCallSend = async (text) => {
    if (!text) return;

    setChatMessages((prev) => [...prev, { sender: "user", text }]);
    setHistoryMessages((prev) => [...prev, text]);

    if (/^(bye|goodbye|stop|exit|end)$/i.test(text.trim())) {
      const bye = "Goodbye! Ending the call mode.";
      setChatMessages((prev) => [...prev, { sender: "bot", text: bye }]);
      await speak(bye);
      setCallActive(false);
      setTab("chat");
      if (recognitionRef.current) recognitionRef.current.stop();
      setLastSpokenText("");
      return;
    }

    // First try instruction set answers in call mode
    const faqAnswer = findBestInstructionAnswer(text);
    if (faqAnswer) {
      setChatMessages((prev) => [...prev, { sender: "bot", text: faqAnswer }]);
      await speak(faqAnswer);
      return;
    }

    // Then human interaction
    const humanResp = getHumanResponse(text);
    if (humanResp) {
      setChatMessages((prev) => [...prev, { sender: "bot", text: humanResp }]);
      await speak(humanResp);
      return;
    }

    // Otherwise fallback
    const fallback = "Sorry, I don't have information on that right now.";
    setChatMessages((prev) => [...prev, { sender: "bot", text: fallback }]);
    await speak(fallback);
  };

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const startListening = () => {
    if (recognitionRef.current && !recognizing) {
      recognitionRef.current.start();
      setRecognizing(true);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setSpeaking(false);
    }
  };

  const startCall = () => {
    setCallActive(true);
    setTab("call");
    setChatMessages([]);
    setHistoryMessages([]);
    const greet = "Hello! You are connected to PMES Assistant call mode.";
    setChatMessages([{ sender: "bot", text: greet }]);
    speak(greet);
  };

  return (
    <div className="fixed bottom-0 right-6 z-50">
      {open ? (
        <div
          className={`w-[480px] h-[calc(100vh-56px-20px)] rounded-2xl shadow-2xl flex flex-col transition-all
            ${dark ? "bg-[#1f2937] text-white" : "bg-white text-gray-900"}`}
        >
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <h2 className="font-bold text-base flex items-center gap-2">
              <BsRobot size={24} /> PMES Assistant
            </h2>
            <div className="flex gap-2 items-center">
              {!callActive && (
                <button
                  onClick={startCall}
                  title="Start Call Mode"
                  className="text-green-600 hover:text-green-800 font-semibold text-lg p-1 rounded"
                >
                  <BiPhoneCall size={24} />
                </button>
              )}
              <button onClick={startListening} title="Start voice input" disabled={!callActive}>
                <BiMicrophone
                  className={`text-xl ${recognizing ? "text-green-500" : "text-gray-400 hover:text-green-500"}`}
                />
              </button>
              <button onClick={stopSpeaking} title="Stop speech">
                <BiStopCircle
                  className={`text-xl ${speaking ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
                />
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  setCallActive(false);
                  if (recognitionRef.current) recognitionRef.current.stop();
                }}
              >
                <IoClose className="text-lg hover:text-red-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 px-3 py-2 border-b text-sm overflow-x-auto">
            {Object.keys(instructionSets).map((key) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setExpandedIndex(null);
                  if (key !== "call") setCallActive(false);
                }}
                className={`capitalize px-3 py-1 rounded-full transition
                  ${
                    tab === key
                      ? dark
                        ? "bg-[#F36F21] text-white"
                        : "bg-orange-200 text-orange-900"
                      : dark
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                  }`}
              >
                {key}
              </button>
            ))}
            <button
              onClick={() => {
                setTab("chat");
                setCallActive(false);
              }}
              className={`capitalize px-3 py-1 rounded-full transition
                ${
                  tab === "chat"
                    ? dark
                      ? "bg-[#F36F21] text-white"
                      : "bg-orange-200 text-orange-900"
                    : dark
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
            >
              Chat
            </button>
            <button
              onClick={() => {
                setTab("history");
                setCallActive(false);
              }}
              className={`capitalize px-3 py-1 rounded-full transition
                ${
                  tab === "history"
                    ? dark
                      ? "bg-[#F36F21] text-white"
                      : "bg-orange-200 text-orange-900"
                    : dark
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
            >
              History
            </button>
            <button
              onClick={() => {
                setTab("call");
                setCallActive(true);
              }}
              className={`capitalize px-3 py-1 rounded-full transition
                ${
                  tab === "call"
                    ? dark
                      ? "bg-[#F36F21] text-white"
                      : "bg-orange-200 text-orange-900"
                    : dark
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                }`}
            >
              Call
            </button>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            {/* FAQ Tabs */}
            {Object.keys(instructionSets).includes(tab) && tab !== "call" && (
              <div className="space-y-2">
                {instructionSets[tab].map((item, idx) => (
                  <div key={idx} className="border rounded shadow-sm p-3 relative">
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="font-semibold w-full text-left"
                    >
                      {item.label}
                    </button>
                    {expandedIndex === idx && (
                      <div
                        className={`mt-2 text-sm ${
                          dark ? "bg-[#374151] text-gray-200" : "bg-gray-50 text-gray-900"
                        } relative rounded p-2`}
                      >
                        <button
                          onClick={() => setExpandedIndex(null)}
                          className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                          aria-label="Close"
                        >
                          <IoClose size={18} />
                        </button>
                        {item.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Chat tab */}
            {tab === "chat" && (
              <div className="flex flex-col h-full">
                <div
                  className="flex-1 overflow-y-auto mb-2 space-y-3"
                  style={{ maxHeight: "calc(100vh - 56px - 140px)" }}
                >
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded max-w-[85%] ${
                        msg.sender === "bot"
                          ? dark
                            ? "bg-[#374151] text-gray-200 self-start"
                            : "bg-gray-100 text-gray-900 self-start"
                          : "bg-[#F36F21] text-white self-end ml-auto"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChatSend(chatInput.trim());
                    setChatInput("");
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className={`flex-1 border rounded px-3 py-2 focus:outline-none ${
                      dark ? "bg-gray-900 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-300"
                    }`}
                  />
                  <button
                    type="submit"
                    className="bg-[#F36F21] hover:bg-orange-600 rounded px-4 py-2 text-white font-semibold"
                    aria-label="Send Message"
                  >
                    <BiSend size={20} />
                  </button>
                </form>
              </div>
            )}

            {/* History tab */}
            {tab === "history" && (
              <div className="space-y-2 max-h-[calc(100vh-56px-100px)] overflow-auto text-sm">
                {historyMessages.length === 0 && (
                  <p className="text-center text-gray-400">No previous conversations.</p>
                )}
                {historyMessages.map((msg, i) => (
                  <div key={i} className="border rounded p-2 break-words">
                    {msg}
                  </div>
                ))}
              </div>
            )}

            {/* Call tab */}
            {tab === "call" && (
              <div className="flex flex-col h-full">
                <div
                  className="flex-1 overflow-y-auto mb-2 space-y-3"
                  style={{ maxHeight: "calc(100vh - 56px - 210px)" }}
                >
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded max-w-[85%] ${
                        msg.sender === "bot"
                          ? dark
                            ? "bg-[#374151] text-gray-200 self-start"
                            : "bg-gray-100 text-gray-900 self-start"
                          : "bg-[#F36F21] text-white self-end ml-auto"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-col items-center text-sm space-y-1">
                  <div className="flex items-center gap-2 text-gray-400">
                    <BiMicrophone className={`text-2xl ${recognizing ? "text-green-500" : "cursor-pointer hover:text-green-500"}`} onClick={startListening} />
                    <span>{recognizing ? "Listening..." : "Tap to start speaking"}</span>
                  </div>
                  {lastSpokenText && (
                    <div
                      className={`italic text-xs px-3 py-1 rounded ${
                        dark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                      } max-w-[400px]`}
                    >
                      Heard: "{lastSpokenText}"
                    </div>
                  )}
                </div>

                {/* Robot animation only in Call Mode */}
                <div className="mt-4 flex justify-center">
                  <RobotMouthGlow />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open PMES Assistant chatbot"
          title="Open PMES Assistant"
          className={`fixed bottom-6 right-6 rounded-full p-3 shadow-lg transition
            ${dark ? "bg-[#F36F21] text-white" : "bg-orange-500 text-white"} hover:brightness-110`}
        >
          <BsRobot size={28} />
        </button>
      )}
    </div>
  );
}

function RobotMouthGlow() {
  return (
    <svg
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      {/* Head */}
      <rect x="10" y="10" width="100" height="60" rx="15" ry="15" fill="#4B5563" />
      {/* Eyes */}
      <circle cx="35" cy="35" r="8" fill="#9CA3AF" />
      <circle cx="85" cy="35" r="8" fill="#9CA3AF" />
      {/* Mouth (animated glow) */}
      <rect x="40" y="60" width="40" height="8" rx="4" ry="4" fill="url(#mouthGradient)">
        <animate attributeName="x" values="40;50;40" dur="2s" repeatCount="indefinite" />
      </rect>
      <defs>
        <linearGradient id="mouthGradient" x1="40" y1="60" x2="80" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#FB923C" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default FullPMESChatBot;
