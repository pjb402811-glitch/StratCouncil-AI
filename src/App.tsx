import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';
import {
  Database,
  CloudUpload,
  FileText,
  BarChart2,
  History,
  Settings,
  Brain,
  Search,
  Key,
  FileDown,
  Users,
  Reply,
  ArrowLeftRight,
  Lightbulb,
  MessageSquare,
  Send,
  User,
  X,
  Loader2,
  RefreshCw,
  TrendingUp,
  Cpu,
  PieChart,
  ShieldAlert,
  Leaf,
  Handshake,
  Scale,
  AlertCircle,
  CreditCard,
  Target,
  Megaphone,
  Plus,
  Bot,
  HeartHandshake,
  Palette
} from 'lucide-react';

const PERSONAS = {
  // 제1그룹: 거시 전략 및 재무 (Strategy & Finance)
  A: { id: 'A', name: '경영전략 및 평가 전문가', desc: 'DNA: McKinsey & Company. 피라미드 구조(결론 선행), MECE(중복/누락 방지) 기반의 S등급 달성 전략 제시', color: 'bg-blue-600', icon: TrendingUp },
  C: { id: 'C', name: '재무 및 투자 분석가', desc: 'DNA: Goldman Sachs. ROI 최적화, 데이터 기반 리스크 헤지, 예산 효율화 및 투자 포트폴리오 분석', color: 'bg-emerald-600', icon: PieChart },
  
  // 제2그룹: 혁신 및 인프라 (Innovation & Infra)
  B: { id: 'B', name: '철도 인프라 및 기술 혁신가', desc: 'DNA: Gartner. 하이프 사이클 검증, 총소유비용(TCO) 분석, 레거시 시스템 통합 방안', color: 'bg-indigo-600', icon: Cpu },
  I: { id: 'I', name: 'AI 거버넌스 및 업무 자동화 실행가', desc: 'DNA: Accenture. 어플라이드 인텔리전스, 애자일 실행, 비개발자 워크플로우 혁신 및 보안 리스크 점검', color: 'bg-violet-600', icon: Bot },
  
  // 제3그룹: 리스크 및 현장 관리 (Risk & Operation)
  G: { id: 'G', name: '실무 리스크 관리자', desc: 'DNA: Bain & Company. 결과 중심주의, 병목 구간 타파, 현장 수용성 및 노조 반발 리스크 점검', color: 'bg-slate-600', icon: Scale },
  D: { id: 'D', name: '안전 및 재난 관리 전문가', desc: 'DNA: DuPont. 무관용 원칙(Zero-Tolerance), 선제적 예방 모델, 주도적인 안전 문화 구축', color: 'bg-red-600', icon: ShieldAlert },
  
  // 제4그룹: 지속가능성 및 상생 (Sustainability & Society)
  E: { id: 'E', name: 'ESG 및 환경 경영 전문가', desc: 'DNA: BlackRock. 이중 중대성 평가, 장기 가치 창출, 글로벌 규제(RE100 등) 선제적 대응', color: 'bg-green-600', icon: Leaf },
  F: { id: 'F', name: '상생 협력 및 지역 발전 전문가', desc: 'DNA: FSG - Michael Porter. 공유가치창출(CSV), 비즈니스 모델형 상생 전략 기획', color: 'bg-orange-600', icon: Handshake },
  
  // 제5그룹: 사람 및 커뮤니케이션 (People & Comm)
  J: { id: 'J', name: '차세대 HR 및 조직문화 변혁가', desc: 'DNA: Mercer. 직무 가치 중심 설계, 직원 경험(EX) 극대화, 세대 간 인식 격차 해소', color: 'bg-rose-500', icon: HeartHandshake },
  H: { id: 'H', name: '브랜드 커뮤니케이션 전문가', desc: 'DNA: Ogilvy. 강력한 브랜드 아키텍처, 스토리텔링 중심의 대국민 메시징 및 위기 관리', color: 'bg-pink-600', icon: Megaphone },
  K: { id: 'K', name: '시민 중심 공공 서비스 디자이너', desc: 'DNA: IDEO. 디자인 씽킹, 인간 중심 디자인(HCD), 사용자 여정 기반 페인 포인트 해결', color: 'bg-amber-500', icon: Palette },
};

const STRATEGIES = [
  { id: 'longterm', name: '중장기 경영전략', members: ['A', 'C', 'J', 'H'], quickActions: ['2026년 경영평가 대응 전략', '중장기 비전 및 핵심가치 슬로건', '조직 혁신 방안'], requiredMaterials: '귀 사의 중장기 경영전략, 비전 체계도, 이전 경영평가 결과 보고서 등을 좌측 [자문 참고 자료 업로드] 메뉴를 통해 업로드해 주세요.' },
  { id: 'esg', name: 'ESG경영 전략', members: ['E', 'D', 'F', 'K'], quickActions: ['탄소중립 실현 방안', '윤리 경영 강화', '안전 및 환경 리스크'], requiredMaterials: '지속가능경영보고서, 탄소배출량 데이터, 윤리경영 지침, 사회공헌 활동 내역 등을 좌측 [자문 참고 자료 업로드] 메뉴를 통해 업로드해 주세요.' },
  { id: 'innovation', name: '혁신 전략', members: ['I', 'B', 'J', 'G'], quickActions: ['디지털 전환(DX) 추진', '업무 프로세스 혁신', '현장 수용성 제고'], requiredMaterials: '디지털 전환(DX) 추진 계획서, 업무 프로세스 매뉴얼, IT 인프라 현황 자료 등을 좌측 [자문 참고 자료 업로드] 메뉴를 통해 업로드해 주세요.' },
  { id: 'winwin', name: '중소기업 동반성장 전략', members: ['F', 'I', 'K', 'H'], quickActions: ['협력사 상생 프로그램', '지역 경제 활성화 기여', '동반성장 리스크 관리'], requiredMaterials: '상생협력 프로그램 운영 결과, 지역사회 공헌 실적, 중소기업 지원 예산 내역 등을 좌측 [자문 참고 자료 업로드] 메뉴를 통해 업로드해 주세요.' },
];

export default function App() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<{ name: string; mimeType: string; data: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('advisory'); // 'advisory', 'pool', 'data'
  const [selectedStrategyId, setSelectedStrategyId] = useState('longterm');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [additionalMembers, setAdditionalMembers] = useState<string[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentStrategy = STRATEGIES.find(s => s.id === selectedStrategyId) || STRATEGIES[0];
  const activeMemberIds = [...new Set([...currentStrategy.members, ...additionalMembers])];
  const activeMembers = activeMemberIds.map(id => PERSONAS[id as keyof typeof PERSONAS]);
  const availableToAdd = Object.keys(PERSONAS).filter(id => !activeMemberIds.includes(id));

  useEffect(() => {
    setAdditionalMembers([]);
    setIsAddMemberOpen(false);
  }, [selectedStrategyId]);

  useEffect(() => {
    const savedKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedKey) {
      setApiKeyInput(savedKey);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFiles(prev => [...prev, { name: file.name, mimeType: file.type, data: base64 }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setMessages([]);
    setInput('');
    setFiles([]);
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    const currentFiles = [...files];
    const userMsg = { role: 'user', text: input, files: currentFiles };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setFiles([]);
    setIsLoading(true);

    try {
      const savedKey = localStorage.getItem('GEMINI_API_KEY');
      if (!savedKey) {
        alert('Google API Key가 설정되지 않았습니다. 좌측 하단의 설정 버튼을 눌러 Key를 입력해주세요.');
        setIsApiModalOpen(true);
        setIsLoading(false);
        setMessages(prev => prev.slice(0, -1)); // Remove the user message we just added
        setInput(input); // Restore input
        setFiles(currentFiles); // Restore files
        return;
      }

      const ai = new GoogleGenAI({ apiKey: savedKey });

      const parts: any[] = [];
      if (input.trim()) parts.push({ text: input });
      currentFiles.forEach(f => {
        parts.push({
          inlineData: {
            mimeType: f.mimeType,
            data: f.data
          }
        });
      });

      const contents = messages.map(m => {
        const mParts: any[] = [];
        if (m.text) mParts.push({ text: m.text });
        if (m.files) {
          m.files.forEach((f: any) => {
            mParts.push({
              inlineData: {
                mimeType: f.mimeType,
                data: f.data
              }
            });
          });
        }
        return {
          role: m.role === 'user' ? 'user' : 'model',
          parts: mParts
        };
      });

      contents.push({
        role: 'user',
        parts
      });

      const personaDescriptions = activeMembers.map(m => `위원 ${m.id} (${m.name}): ${m.desc}`).join('\n');
      const formatDescriptions = activeMembers.map(m => `### 위원 ${m.id} (${m.name})\n... (출처 명시)`).join('\n\n');

      const config = {
        systemInstruction: `당신은 국가철도공단 경영전략 수립을 위한 'AI 자문 시스템'입니다.
현재 선택된 자문 분야는 '${currentStrategy.name}'입니다.
다음 ${activeMembers.length}명의 페르소나를 시뮬레이션하여 사용자의 질문이나 업로드된 문서에 대해 답변해야 합니다.

${personaDescriptions}

답변 형식:
${formatDescriptions}

### 🔄 하이브리드 분석 및 제3의 대안
인간 전문가 의견(제공된 경우)과 AI 위원들의 의견을 비교 분석하고, 상충 시 데이터 기반 제3의 대안 제시.

### 📋 종합 권고안
최종 요약 및 권고.

반드시 실시간 검색을 활용하여 관련 지침 최신판을 참조하고 출처를 명시하세요.
업로드된 문서가 있다면 해당 문서의 내용(페이지 등)을 출처로 명시하세요.`,
        tools: [{ googleSearch: {} }],
      };

      setMessages(prev => [...prev, { role: 'model', text: '', isStreaming: true }]);

      let success = false;
      let lastError: any = null;
      let fullText = '';

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          if (attempt > 1) {
            setMessages(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].text = `API 응답 지연으로 재시도 중입니다... (${attempt}/3)\n\n기존 오류: ${lastError?.message || '알 수 없는 오류'}`;
              return newMsgs;
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          if (attempt === 1) {
            // 1차 시도: 스트리밍 방식
            const responseStream = await ai.models.generateContentStream({
              model: 'gemini-3.1-pro-preview',
              contents: contents,
              config
            });

            fullText = '';
            for await (const chunk of responseStream) {
              fullText += chunk.text;
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].text = fullText;
                return newMsgs;
              });
            }
          } else {
            // 2, 3차 시도: 비스트리밍(호출 후 대기) 방식
            setMessages(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].text = `안정적인 응답을 위해 순차적 방식으로 자문단 의견을 수집 중입니다... (${attempt}/3)`;
              return newMsgs;
            });
            
            const response = await ai.models.generateContent({
              model: 'gemini-3.1-pro-preview',
              contents: contents,
              config
            });
            
            fullText = response.text || '';
            setMessages(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].text = fullText;
              return newMsgs;
            });
          }
          
          success = true;
          break;
        } catch (error: any) {
          console.error(`Attempt ${attempt} failed:`, error);
          lastError = error;
        }
      }

      if (!success) {
        const errorMessage = lastError?.message || JSON.stringify(lastError) || '알 수 없는 오류';
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = `**API 호출 실패 (3회 재시도)**\n\n오류 내용:\n\`\`\`text\n${errorMessage}\n\`\`\`\n\n잠시 후 다시 시도하거나 API 키 설정을 확인해 주세요.`;
          newMsgs[newMsgs.length - 1].isStreaming = false;
          return newMsgs;
        });
      } else {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].isStreaming = false;
          return newMsgs;
        });
      }

    } catch (error: any) {
      console.error(error);
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[newMsgs.length - 1]?.role === 'model') {
          newMsgs[newMsgs.length - 1].text = `**치명적인 오류 발생**\n\n오류 내용:\n\`\`\`text\n${error?.message || '알 수 없는 오류'}\n\`\`\``;
          newMsgs[newMsgs.length - 1].isStreaming = false;
        } else {
          newMsgs.push({ role: 'model', text: `**치명적인 오류 발생**\n\n오류 내용:\n\`\`\`text\n${error?.message || '알 수 없는 오류'}\n\`\`\``, isStreaming: false });
        }
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExportReport = () => {
    if (messages.length === 0) {
      alert('출력할 자문 내용이 없습니다.');
      return;
    }

    let reportContent = `[AI 전략혁신 자문단 리포트 - ${currentStrategy.name}]\n`;
    reportContent += `출력 일시: ${new Date().toLocaleString()}\n\n`;
    reportContent += `=================================================\n\n`;

    messages.forEach(msg => {
      if (msg.role === 'user') {
        reportContent += `[사용자 질문]\n${msg.text}\n\n`;
      } else {
        reportContent += `[트리플 에이전트 자문단 종합 분석]\n${msg.text}\n\n`;
        reportContent += `=================================================\n\n`;
      }
    });

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI자문단_리포트_${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const groupedExchanges = useMemo(() => {
    const groups: { user: any, model: any }[] = [];
    let current = { user: null as any, model: null as any };
    messages.forEach(msg => {
      if (msg.role === 'user') {
        if (current.user) {
          groups.push({ ...current });
          current = { user: null, model: null };
        }
        current.user = msg;
      } else {
        current.model = msg;
        groups.push({ ...current });
        current = { user: null, model: null };
      }
    });
    if (current.user || current.model) {
      groups.push(current);
    }
    return groups;
  }, [messages]);

  return (
    <div className="bg-background-light text-slate-900 font-display overflow-hidden h-screen flex flex-col">
      <div className="flex h-full w-full overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-surface-light border-r border-slate-200 flex flex-col justify-between shrink-0 h-full z-20">
          <div className="flex flex-col p-6 gap-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#002147] aspect-square rounded-xl size-10 flex items-center justify-center text-white">
                  <Brain size={20} />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-[#002147] text-lg font-bold leading-tight tracking-tight">전략혁신 AI자문단</h1>
                </div>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">메인 메뉴</p>
              
              {/* Strategy Menu Group */}
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setActiveTab('advisory')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${activeTab === 'advisory' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <MessageSquare size={18} className={activeTab === 'advisory' ? '' : 'group-hover:scale-110 transition-transform'} />
                  <span className="text-sm font-medium">자문 분야</span>
                </button>
                
                {/* Sub-menu for Strategies */}
                {activeTab === 'advisory' && (
                  <div className="flex flex-col ml-9 mt-1 gap-1 border-l-2 border-slate-100 pl-3">
                    {STRATEGIES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStrategyId(s.id)}
                        className={`text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedStrategyId === s.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Management Menu Group */}
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${activeTab === 'data' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Database size={18} className={activeTab === 'data' ? '' : 'group-hover:scale-110 transition-transform'} />
                  <span className="text-sm font-medium">자문 참고 자료 업로드</span>
                </button>
                
                {/* Uploaded Files Sub-menu */}
                {files.length > 0 && (
                  <div className="flex flex-col ml-9 mt-1 gap-1 border-l-2 border-slate-100 pl-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between group/file">
                        <button 
                          onClick={() => setActiveTab('data')}
                          className="text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-700 truncate max-w-[120px]"
                          title={f.name}
                        >
                          {f.name}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }} 
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover/file:opacity-100 transition-opacity p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setActiveTab('pool')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${activeTab === 'pool' ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Users size={18} className={activeTab === 'pool' ? '' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-sm font-medium">AI 자문단 Pool</span>
              </button>
            </nav>
          </div>
          
          <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
            <button onClick={handleReset} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors w-full">
              <RefreshCw size={18} />
              <span className="text-sm font-medium">초기화</span>
            </button>
            <button 
              onClick={() => setIsApiModalOpen(true)} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full ${apiKeyInput ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Key size={18} className={apiKeyInput ? 'text-blue-600' : ''} />
              <span className="text-sm font-medium">API Key 설정</span>
            </button>
            <button onClick={handleExportReport} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-light transition-colors w-full mt-2 shadow-sm">
              <FileDown size={18} />
              <span className="text-sm font-bold">리포트 출력</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light relative">

          {/* Content Area */}
          <div className="flex-1 flex flex-col p-8 pb-32 overflow-hidden">
            
            {/* Tab 1: Advisory Chat */}
            {activeTab === 'advisory' && (
              <div className="flex flex-col flex-1 min-h-0 gap-6">
                {/* Strategy Selector */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    자문 분야 선택
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {STRATEGIES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStrategyId(s.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedStrategyId === s.id ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>

                  {/* Info Card for Upload */}
                  <div className="mt-3 bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-md shrink-0">
                      <CloudUpload size={16} />
                    </div>
                    <p className="text-xs text-blue-800">
                      <strong className="font-bold mr-1">[참고자료 업로드 안내]</strong>
                      {currentStrategy.requiredMaterials}
                    </p>
                  </div>
                  
                  {/* Active Members Mini View */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 overflow-x-auto relative">
                      <span className="text-xs font-bold text-slate-500 whitespace-nowrap">배정된 위원:</span>
                      {activeMembers.map(member => {
                        const Icon = member.icon;
                        const isAdditional = additionalMembers.includes(member.id);
                        return (
                          <div 
                            key={member.id} 
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shrink-0 transition-colors ${isAdditional ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${member.color} text-white`}>
                              <Icon size={10} />
                            </div>
                            <span className="text-xs font-medium text-slate-700">{member.name}</span>
                            {isAdditional && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setAdditionalMembers(prev => prev.filter(id => id !== member.id)); }}
                                className="text-slate-400 hover:text-red-500 ml-1"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {availableToAdd.length > 0 && (
                        <div className="relative shrink-0">
                          <button 
                            onClick={() => setIsAddMemberOpen(!isAddMemberOpen)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-slate-300 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors text-xs font-medium"
                          >
                            <Plus size={12} />
                            위원 추가
                          </button>
                          
                          {isAddMemberOpen && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setIsAddMemberOpen(false)} />
                              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden">
                                <div className="p-2 bg-slate-50 border-b border-slate-100">
                                  <span className="text-xs font-bold text-slate-500">추가할 위원 선택</span>
                                </div>
                                <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-200">
                                  {availableToAdd.map(id => {
                                    const p = PERSONAS[id as keyof typeof PERSONAS];
                                    const Icon = p.icon;
                                    return (
                                      <button
                                        key={id}
                                        onClick={() => {
                                          setAdditionalMembers(prev => [...prev, id]);
                                          setIsAddMemberOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                      >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${p.color} text-white shrink-0`}>
                                          <Icon size={12} />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-xs font-bold text-slate-700">{p.name}</span>
                                          <span className="text-[10px] text-slate-500 truncate">{p.desc}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-6 pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200">
                  {messages.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex items-center justify-center min-h-[400px]">
                      <div className="p-8 text-center text-slate-500 max-w-md">
                        <Brain size={48} className="mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">'{currentStrategy.name}' 자문을 시작합니다</h3>
                        <p className="text-sm">
                          하단의 입력창에 질문을 입력하거나 <br />
                          빠른 실행 버튼을 클릭하여 <br />
                          자문단에게 의견을 구하세요.
                        </p>
                      </div>
                    </div>
                  ) : (
                    groupedExchanges.map((exchange, idx) => (
                      <div key={idx} className="flex flex-col lg:flex-row gap-6 h-[500px] shrink-0">
                        {/* User Card */}
                        <div className="w-full lg:w-1/3 shrink-0 flex flex-col bg-primary/5 border border-primary/20 rounded-xl overflow-hidden shadow-sm">
                          <div className="p-4 border-b border-primary/10 bg-white/50 flex items-center gap-3 shrink-0">
                            <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center">
                              <User size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">사용자</h4>
                              <p className="text-xs text-slate-500">질문</p>
                            </div>
                          </div>
                          <div className="p-6 overflow-y-auto flex-1 text-slate-600 text-sm leading-relaxed markdown-body scrollbar-thin scrollbar-thumb-primary/20">
                            {exchange.user ? <Markdown>{exchange.user.text}</Markdown> : <span className="text-slate-400 italic">내용 없음</span>}
                          </div>
                        </div>

                        {/* Model Card */}
                        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
                            <div className="size-8 rounded-full bg-slate-100 text-primary flex items-center justify-center">
                              <Brain size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">트리플 에이전트 자문단</h4>
                              <p className="text-xs text-slate-500">종합 분석</p>
                            </div>
                          </div>
                          <div className="p-6 overflow-y-auto flex-1 text-slate-600 text-sm leading-relaxed markdown-body scrollbar-thin scrollbar-thumb-slate-200">
                            {exchange.model ? (
                              <>
                                {exchange.model.isStreaming && !exchange.model.text && (
                                  <div className="flex items-center gap-3 text-primary h-full justify-center">
                                    <Loader2 className="animate-spin" size={24} />
                                    <span className="text-sm font-medium">자문단이 분석 중입니다...</span>
                                  </div>
                                )}
                                <Markdown>{exchange.model.text}</Markdown>
                                {exchange.model.isStreaming && exchange.model.text && (
                                  <div className="flex items-center gap-2 text-primary mt-4">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span className="text-xs font-medium">작성 중...</span>
                                  </div>
                                )}
                              </>
                            ) : (
                              isLoading ? (
                                <div className="flex items-center gap-3 text-primary h-full justify-center">
                                  <Loader2 className="animate-spin" size={24} />
                                  <span className="text-sm font-medium">자문단이 분석 중입니다...</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">답변 대기 중...</span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Advisory Pool */}
            {activeTab === 'pool' && (
              <div className="flex flex-col gap-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users size={24} className="text-primary" />
                    전체 자문단 Pool
                  </h3>
                  <p className="text-sm text-slate-500">각 전략에 맞춰 최적의 위원들이 동적으로 배정됩니다.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Object.values(PERSONAS).map(member => {
                    const Icon = member.icon;
                    return (
                      <div 
                        key={member.id} 
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary/30 transition-all flex flex-col items-center text-center relative overflow-hidden group"
                      >
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${member.color}`}></div>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 border-4 border-slate-50 shadow-sm transition-transform group-hover:scale-105 ${member.color} text-white`}>
                          <Icon size={32} />
                        </div>
                        <h4 className="text-slate-900 font-bold text-lg mb-1">위원 {member.id}</h4>
                        <p className={`font-bold text-sm mb-3 px-3 py-1 rounded-full bg-slate-50 ${member.color.replace('bg-', 'text-').replace('-500', '-600')}`}>
                          {member.name}
                        </p>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{member.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Data Management */}
            {activeTab === 'data' && (
              <div className="flex flex-col gap-6 flex-1 min-h-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Database size={24} className="text-primary" />
                    자문 참고 자료 업로드
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                  {/* Upload Area */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center border-dashed border-2 hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple onChange={handleFileUpload} />
                    <CloudUpload size={48} className="text-primary/50 mb-4" />
                    <h4 className="text-lg font-bold text-slate-800 mb-2">자료 업로드</h4>
                    <p className="text-sm text-slate-500 mb-4">PDF, TXT, CSV 등 분석에 필요한 자료를 드래그하거나 클릭하여 업로드하세요.</p>
                    <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium shadow-sm pointer-events-none">
                      파일 선택
                    </button>
                  </div>

                  {/* File List */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                    <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-primary" />
                      현재 업로드된 자료 ({files.length}개)
                    </h4>
                    
                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-slate-200">
                      {files.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                          업로드된 자료가 없습니다.
                        </div>
                      ) : (
                        files.map((f, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                <FileText size={20} />
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-slate-800 truncate">{f.name}</span>
                                <span className="text-xs text-slate-500">{f.mimeType || '알 수 없는 형식'}</span>
                              </div>
                            </div>
                            <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                              <X size={18} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar (Only visible in Advisory Tab) */}
          {activeTab === 'advisory' && (
            <div className="absolute bottom-0 left-0 right-0 bg-surface-light border-t border-slate-200 p-4 shadow-lg z-30">
              <div className="max-w-7xl mx-auto flex flex-col gap-2">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap mr-2">빠른 실행</span>
                    {currentStrategy.quickActions.map((action, idx) => (
                      <button key={idx} onClick={() => setInput(action)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border border-slate-200">
                        {action}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 w-full md:w-auto relative max-w-3xl">
                    <div className="flex items-center bg-white border border-slate-300 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                      <MessageSquare className="text-slate-400 mr-2" size={18} />
                      <input 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 text-slate-800 p-0 outline-none" 
                        placeholder="자문단 AI에게 질문하거나 위원들에게 메시지를 보내세요..." 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <button onClick={handleSend} disabled={isLoading || (!input.trim() && files.length === 0)} className="bg-primary text-white p-1.5 rounded-full hover:bg-primary-light transition-colors flex items-center justify-center ml-2 disabled:opacity-50">
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* API Key Modal */}
      {isApiModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-[480px] bg-[#1e2330] rounded-2xl shadow-2xl overflow-hidden text-slate-200 font-sans border border-slate-700/50">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-700/50">
              <h2 className="text-lg font-bold text-white">API Key 설정</h2>
              <button onClick={() => setIsApiModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Warning Box */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start">
                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                <p className="text-red-400 text-sm font-medium leading-relaxed">
                  이 앱을 사용하려면 Google AI API Key가 필요합니다.<br/>아래에서 연결을 눌러주세요.
                </p>
              </div>

              {/* Input Section */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400">API Key 연결</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="API Key를 선택하세요..." 
                    className="w-full bg-[#151923] border border-slate-700 rounded-xl pl-4 pr-10 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  />
                  <Key size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
                <p className="text-[11px] text-slate-500 italic mt-1">
                  API Key는 브라우저(localStorage)에만 안전하게 저장되며, 외부 서버로 전송되지 않습니다.
                </p>
              </div>

              {/* Instructions Box */}
              <div className="bg-[#151923] rounded-xl p-5 border border-slate-800">
                <h3 className="text-white font-bold text-sm mb-4">API Key 발급방법</h3>
                <ol className="flex flex-col gap-3 text-sm text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">1.</span>
                    <span><a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-medium">Google AI Studio</a> 페이지로 이동하여 로그인합니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span>'Get API Key' 또는 'Create API key' 버튼을 클릭합니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">3.</span>
                    <span>생성된 API Key를 복사합니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">4.</span>
                    <span>아래 'Key 저장' 버튼을 눌러 발급받은 키를 선택하거나 연결하세요.</span>
                  </li>
                </ol>
                
                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors w-fit">
                  <CreditCard size={14} />
                  <span className="text-xs">결제 및 요금제 안내 (Billing Guide)</span>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => {
                  if (apiKeyInput.trim()) {
                    localStorage.setItem('GEMINI_API_KEY', apiKeyInput.trim());
                    setIsApiModalOpen(false);
                  } else {
                    alert('API Key를 입력해주세요.');
                  }
                }}
                className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                Key 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
