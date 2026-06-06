import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mic, MicOff, Volume2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { interviewQuestions } from '../data/mock';

const categories = [
  { key: 'behavioral', label: 'Behavioral' },
  { key: 'technical', label: 'Technical' },
  { key: 'systemDesign', label: 'System Design' },
];

const difficultyVariant = { Easy: 'emerald', Medium: 'amber', Hard: 'rose' };

export default function InterviewPrep() {
  const [openId, setOpenId] = useState(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
    setTranscript('');
  };

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Interview Prep</h2>
        <p className="page-subtitle">Practice questions with voice recording</p>
      </div>

      <Card className="flex flex-col items-center py-6">
        <p className="text-sm text-slate-600 mb-4">Record your practice answer</p>
        <button
          onClick={toggleRecording}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
            recording ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
          }`}
        >
          {recording && (
            <>
              <span className="absolute inset-0 rounded-full bg-rose-400 opacity-20 animate-pulse-ring" />
              <span className="absolute inset-0 rounded-full bg-rose-400 opacity-10 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
            </>
          )}
          {recording ? <MicOff className="w-8 h-8 relative z-10" /> : <Mic className="w-8 h-8" />}
        </button>
        <p className="text-sm text-slate-500 mt-3">{recording ? 'Recording... Click to stop' : 'Click to start recording'}</p>

        {transcript && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 w-full max-w-xl">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700">
              <Volume2 className="w-4 h-4" /> Transcript
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4 border border-slate-200">{transcript}</p>
          </motion.div>
        )}
      </Card>

      {categories.map((cat) => (
        <div key={cat.key}>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">{cat.label}</h3>
          <div className="space-y-2">
            {interviewQuestions[cat.key]?.map((q) => (
              <Card key={q.id} className="p-0 overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === q.id ? null : q.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-800 flex-1">{q.question}</span>
                    <Badge variant={difficultyVariant[q.difficulty]} className="flex-shrink-0">{q.difficulty}</Badge>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 ml-3 flex-shrink-0 transition-transform ${openId === q.id ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openId === q.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                        <p className="text-sm text-slate-600 leading-relaxed mt-3">{q.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
