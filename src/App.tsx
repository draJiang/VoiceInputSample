import { useCallback, useEffect, useRef, useState } from "react"
import { Mic, Square } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

function App() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef("")
  const recognitionStartTimeRef = useRef<number>(0)

  const SpeechRecognitionAPI =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  const stopRecording = useCallback(() => {
    const recognition = recognitionRef.current
    if (recognition) {
      recognition.stop()
      recognitionRef.current = null
    }
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/410ced30-775d-4191-8b02-5afdfc6a11fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:startRecording',message:'startRecording entry',data:{hasAPI:!!SpeechRecognitionAPI,origin:typeof window!=='undefined'?location.origin:'',protocol:typeof window!=='undefined'?location.protocol:''},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!SpeechRecognitionAPI) {
      setError("您的浏览器不支持语音识别，请使用 Chrome 或 Edge")
      return
    }

    setError(null)
    finalTranscriptRef.current = transcript

    const recognition = new SpeechRecognitionAPI() as SpeechRecognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "zh-CN"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ""
      let finalTranscript = finalTranscriptRef.current

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalTranscript += text
          finalTranscriptRef.current = finalTranscript
        } else {
          interimTranscript += text
        }
      }
      setTranscript(finalTranscript + interimTranscript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // #region agent log
      const elapsed = recognitionStartTimeRef.current ? Date.now() - recognitionStartTimeRef.current : 0;
      fetch('http://127.0.0.1:7246/ingest/410ced30-775d-4191-8b02-5afdfc6a11fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:onerror',message:'recognition onerror',data:{error:event.error,message:(event as unknown as { message?: string }).message,elapsedMs:elapsed},timestamp:Date.now(),hypothesisId:'B,C'})}).catch(()=>{});
      // #endregion
      if (event.error !== "aborted" && event.error !== "no-speech") {
        const isSecure =
          typeof window !== "undefined" && window.location?.protocol === "https:"
        const message =
          event.error === "network"
            ? isSecure
              ? "无法连接语音服务（网络错误）。请检查网络、防火墙或 VPN 是否允许访问 Google 语音服务，或稍后重试。"
              : "语音识别需要 HTTPS 环境，请使用 https://localhost:5173 访问。"
            : `识别错误: ${event.error}`
        // #region agent log
        if (event.error === "network" && isSecure) {
          fetch('http://127.0.0.1:7246/ingest/410ced30-775d-4191-8b02-5afdfc6a11fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:setError',message:'setError network-https',data:{error:event.error,origin:typeof window!=='undefined'?window.location?.origin:''},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
        }
        // #endregion
        setError(message)
      }
    }

    recognition.onend = () => {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/410ced30-775d-4191-8b02-5afdfc6a11fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:onend',message:'recognition onend',data:{refEqualsRecognition:recognitionRef.current===recognition},timestamp:Date.now(),hypothesisId:'D,E'})}).catch(()=>{});
      // #endregion
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null
        setIsRecording(false)
      }
    }

    recognitionRef.current = recognition
    // #region agent log
    recognitionStartTimeRef.current = Date.now();
    fetch('http://127.0.0.1:7246/ingest/410ced30-775d-4191-8b02-5afdfc6a11fa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.tsx:start',message:'recognition.start() called',data:{},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    recognition.start()
    setIsRecording(true)
  }, [transcript, SpeechRecognitionAPI])

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  useEffect(() => {
    return () => stopRecording()
  }, [stopRecording])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        语音转文字
      </h1>

      <div className="w-full max-w-lg space-y-4">
        <div className="min-h-[120px] rounded-lg border bg-muted/50 p-4 text-foreground">
          {transcript ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {transcript}
            </p>
          ) : (
            <p className="text-muted-foreground">
              {isRecording ? "正在聆听..." : "点击按钮开始录音，说话即可转成文字"}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={toggleRecording}
            className="gap-2"
          >
            {isRecording ? (
              <>
                <Square className="size-5" />
                停止录音
              </>
            ) : (
              <>
                <Mic className="size-5" />
                开始录音
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
