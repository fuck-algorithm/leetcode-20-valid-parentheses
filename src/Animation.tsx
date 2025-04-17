import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const defaultInput = '([{}])';
const errorInput = '([)]';
const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
const LEFTS = Object.values(PAIRS);
const RIGHTS = Object.keys(PAIRS);

// 括号类型映射
const BRACKET_NAMES: Record<string, string> = {
  '(': '小括号',
  ')': '小括号',
  '[': '中括号',
  ']': '中括号',
  '{': '大括号',
  '}': '大括号'
};

interface Step {
  index: number;
  char: string;
  stack: string[];
  action: 'push' | 'pop' | 'error' | 'none';
  matchIndex?: number;
  result?: boolean;
}

function getSteps(s: string): Step[] {
  const steps: Step[] = [];
  const stack: {char: string, idx: number}[] = [];
  
  // 初始化步骤
  steps.push({ index: -1, char: '', stack: [], action: 'none' });
  
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (LEFTS.includes(ch)) {
      stack.push({char: ch, idx: i});
      steps.push({ index: i, char: ch, stack: stack.map(x=>x.char), action: 'push' });
    } else if (RIGHTS.includes(ch)) {
      if (stack.length === 0 || stack[stack.length-1].char !== PAIRS[ch]) {
        steps.push({ index: i, char: ch, stack: stack.map(x=>x.char), action: 'error', matchIndex: stack.length?stack[stack.length-1].idx:undefined, result: false });
        return steps;
      } else {
        const matchIdx = stack[stack.length-1].idx;
        stack.pop();
        steps.push({ index: i, char: ch, stack: stack.map(x=>x.char), action: 'pop', matchIndex: matchIdx });
      }
    } else {
      steps.push({ index: i, char: ch, stack: stack.map(x=>x.char), action: 'none' });
    }
  }
  
  if (stack.length === 0) {
    steps.push({ index: s.length, char: '', stack: [], action: 'none', result: true });
  } else {
    steps.push({ index: s.length, char: '', stack: stack.map(x=>x.char), action: 'error', result: false });
  }
  return steps;
}

// 样例面板组件
const ExamplesPanel: React.FC<{
  practiceList: string[];
  currentExample: string;
  onSelectExample: (example: string) => void;
  showPractice: boolean;
  practiceIdx: number;
  handlePractice: (idx: number) => void;
}> = ({ practiceList, currentExample, onSelectExample, showPractice, practiceIdx, handlePractice }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginBottom: '1vh',
      padding: '1vh 0',
      borderBottom: '1px solid #e0e7ff'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0.8vw',
        width: '100%',
        maxWidth: '95vw',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginRight: '1vw'
        }}>
          <span style={{
            fontSize: 'min(1.3vw, 16px)',
            fontWeight: 600,
            marginRight: '0.5vw',
            color: '#1976d2'
          }}>
            输入示例:
          </span>
          <input
            value={currentExample}
            onChange={(e) => onSelectExample(e.target.value)}
            style={{
              fontSize: 'min(1.3vw, 16px)',
              padding: '0.5vh 0.8vw',
              width: 'min(20vw, 230px)',
              textAlign: 'center',
              borderRadius: 8,
              border: '1px solid #1976d2',
              boxShadow: '0 0 4px #1976d2'
            }}
          />
        </div>
        
        <div style={{
          display: 'flex',
          gap: '0.5vw',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            onClick={() => onSelectExample(errorInput)}
            style={{
              fontSize: 'min(1.2vw, 14px)',
              padding: '0.4vh 0.8vw',
              borderRadius: 6,
              border: '1px solid #f44336',
              background: '#fff',
              color: '#f44336'
            }}
          >
            无效案例
          </button>
          
          <button
            onClick={() => onSelectExample(randomBracketString())}
            style={{
              fontSize: 'min(1.2vw, 14px)',
              padding: '0.4vh 0.8vw',
              borderRadius: 6,
              border: '1px solid #1976d2',
              background: '#fff',
              color: '#1976d2'
            }}
          >
            随机生成
          </button>
          
          {/* 示例数据块 */}
          <div style={{
            display: 'flex',
            gap: '0.4vw',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            {practiceList.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handlePractice(idx)}
                style={{
                  fontSize: 'min(1.2vw, 14px)',
                  padding: '0.4vh 0.6vw',
                  borderRadius: 6,
                  border: '1px solid #1976d2',
                  background: showPractice && practiceIdx === idx ? '#e3f2fd' : '#fff',
                  color: '#1976d2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 'min(15vw, 180px)'
                }}
              >
                {idx + 1}: {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const speedMap = { slow: 1500, normal: 900, fast: 400 };

// 底部控制面板组件
const ControlPanel: React.FC<{
  steps: Step[];
  stepIdx: number;
  playing: boolean;
  speed: 'slow' | 'normal' | 'fast';
  onPrev: () => void;
  onNext: () => void;
  onPause: () => void;
  onPlay: () => void;
  onReset: () => void;
  onSpeedChange: (s: 'slow' | 'normal' | 'fast') => void;
  onStepChange: (idx: number) => void;
  result?: boolean;
}> = ({ 
  steps, stepIdx, playing, speed, onPrev, onNext, onPause, onPlay, onReset, onSpeedChange, onStepChange, result 
}) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      background: '#f8fafc',
      borderTop: '1px solid #e0e7ff',
      padding: '1.5vh 2vw',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      zIndex: 100
    }}>
      {/* 进度条 */}
      {steps.length > 0 && (
        <div style={{
          width: '96%',
          margin: '0 auto 1.5vh auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5vh'
          }}>
            <span style={{fontSize: 'min(1.2vw, 14px)', color: '#666'}}>步骤: {stepIdx + 1}/{steps.length}</span>
            {result !== undefined && (
              <span style={{
                fontSize: 'min(1.2vw, 14px)', 
                fontWeight: 600, 
                color: result ? '#4caf50' : '#f44336',
                padding: '0.3vh 1vw',
                background: result ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                borderRadius: '4px'
              }}>
                {result ? '有效括号' : '无效括号'}
              </span>
            )}
            <span style={{
              fontSize: 'min(1.2vw, 14px)', 
              color: '#666', 
              display: 'flex', 
              alignItems: 'center'
            }}>
              速度:
              <input 
                type="range" 
                min={0} 
                max={2} 
                value={['slow','normal','fast'].indexOf(speed)}
                onChange={e => onSpeedChange(['slow','normal','fast'][Number(e.target.value)] as any)}
                style={{width: 'min(8vw, 100px)', margin: '0 0.5vw'}} 
              />
              {speed === 'slow' ? '慢' : speed === 'fast' ? '快' : '中'}
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e0e7ff',
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <input 
              type="range" 
              min={0} 
              max={steps.length - 1} 
              value={stepIdx} 
              onChange={(e) => onStepChange(Number(e.target.value))}
              style={{
                width: '100%',
                position: 'absolute',
                top: '-8px',
                left: 0,
                height: '24px',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 2
              }} 
            />
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${(stepIdx / (steps.length - 1)) * 100}%`,
              background: '#1976d2',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>
      )}
      
      {/* 控制按钮 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5vw',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={onPlay}
          disabled={playing || steps.length === 0}
          style={{
            fontSize: 'min(1.3vw, 16px)',
            padding: '0.6vh 1.2vw',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: !playing && steps.length > 0 ? '#fff' : '#eee',
            color: '#4caf50',
            cursor: !playing && steps.length > 0 ? 'pointer' : 'not-allowed',
            minWidth: 'min(10vw, 120px)'
          }}
        >播放</button>

        <button
          onClick={onPause}
          disabled={!playing}
          style={{
            fontSize: 'min(1.3vw, 16px)',
            padding: '0.6vh 1.2vw',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: playing ? '#fff' : '#eee',
            color: '#1976d2',
            cursor: playing ? 'pointer' : 'not-allowed',
            minWidth: 'min(10vw, 120px)'
          }}
        >暂停</button>
        <button
          onClick={onPrev}
          disabled={stepIdx === 0 || steps.length === 0}
          style={{
            fontSize: 'min(1.3vw, 16px)',
            padding: '0.6vh 1.2vw',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#1976d2',
            cursor: 'pointer',
            minWidth: 'min(10vw, 120px)'
          }}
        >上一步</button>
        <button
          onClick={onNext}
          disabled={stepIdx >= steps.length - 1 || steps.length === 0}
          style={{
            fontSize: 'min(1.3vw, 16px)',
            padding: '0.6vh 1.2vw',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#1976d2',
            cursor: 'pointer',
            minWidth: 'min(10vw, 120px)'
          }}
        >下一步</button>
        <button
          onClick={onReset}
          style={{
            fontSize: 'min(1.3vw, 16px)',
            padding: '0.6vh 1.2vw',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: '#fff',
            color: '#1976d2',
            cursor: 'pointer',
            minWidth: 'min(10vw, 120px)'
          }}
        >重置</button>
      </div>
    </div>
  );
};

// 随机生成括号字符串
const randomBracketString = () => {
  const brackets = ['()', '[]', '{}'];
  let result = '';
  const length = Math.floor(Math.random() * 6) + 4; // 4-10个字符
  
  // 确保生成有效的括号字符串
  const generateValid = () => {
    const stack: string[] = [];
    let str = '';
    
    for (let i = 0; i < length; i++) {
      if (i < length/2 || (stack.length > 0 && Math.random() > 0.5)) {
        // 添加左括号
        const bracketType = Math.floor(Math.random() * brackets.length);
        str += brackets[bracketType][0];
        stack.push(brackets[bracketType][1]);
      } else if (stack.length > 0) {
        // 添加匹配的右括号
        str += stack.pop();
      }
    }
    
    // 添加剩余的右括号
    while (stack.length > 0) {
      str += stack.pop();
    }
    
    return str;
  };
  
  result = generateValid();
  
  // 50%的概率生成无效括号
  if (Math.random() > 0.5) {
    const pos = Math.floor(Math.random() * result.length);
    const chars = result.split('');
    
    if (LEFTS.includes(chars[pos])) {
      // 将左括号替换为随机右括号
      chars[pos] = RIGHTS[Math.floor(Math.random() * RIGHTS.length)];
    } else if (RIGHTS.includes(chars[pos])) {
      // 将右括号替换为随机左括号
      chars[pos] = LEFTS[Math.floor(Math.random() * LEFTS.length)];
    }
    
    result = chars.join('');
  }
  
  return result;
};

const Animation: React.FC = () => {
  const [input, setInput] = useState(defaultInput);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<'slow'|'normal'|'fast'>('normal');
  const [showPractice, setShowPractice] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceHint, setPracticeHint] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);

  const practiceList = [
    '([])',
    '([)]',
    '{[()]}',
    '((())',
    '(){[]}',
    '([{}])',
    '([}}])',
    '(){[({})]}'
  ];

  // 计算步骤但不自动播放
  const calculateSteps = () => {
    const st = getSteps(input);
    setSteps(st);
    setStepIdx(0);
    setPlaying(false); // 确保不会自动播放
  };
  
  // 开始播放动画
  const start = () => {
    setPlaying(true);
  };
  
  // 重置动画
  const reset = () => {
    // 重新计算步骤而不是清空
    const st = getSteps(input);
    setSteps(st);
    setStepIdx(0);
    setPlaying(false);
  };
  
  // 下一步
  const next = () => {
    if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1);
  };
  
  // 上一步
  const prev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };
  
  // 暂停
  const pause = () => setPlaying(false);

  // 当输入变化时仅计算步骤，不自动开始播放
  useEffect(() => {
    if (input) {
      calculateSteps();
    }
  }, [input]);

  // 播放动画效果
  useEffect(() => {
    if (!playing) return;
    
    if (stepIdx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    
    timer.current = setTimeout(() => {
      setStepIdx(idx => idx + 1);
    }, speedMap[speed]);
    
    return () => { 
      if (timer.current) clearTimeout(timer.current); 
    };
  }, [playing, stepIdx, steps.length, speed]);

  const curr = steps[stepIdx] || { index: -1, char: '', stack: [], action: 'none' };
  const result = steps.find(s => s.result !== undefined)?.result;

  // UI 辅助函数
  const getCharColor = (i: number) => {
    if (curr.index === i) {
      if (curr.action === 'error') return '#f44336';
      if (curr.action === 'pop') return '#4caf50';
      return '#1976d2';
    }
    if (curr.action === 'pop' && curr.matchIndex === i) return '#4caf50';
    if (curr.action === 'error' && curr.matchIndex === i) return '#f44336';
    return '#888';
  };
  
  const getStackColor = (i: number) => {
    // 栈顶元素是数组的最后一个元素
    if (curr.action === 'pop' && i === curr.stack.length - 1) return '#4caf50';
    if (curr.action === 'error' && i === curr.stack.length - 1) return '#f44336';
    return '#1976d2';
  };

  // 信息面板内容
  const getInfoPanel = () => {
    if (steps.length === 0) return '请输入括号字符串，算法将自动执行';
    
    if (stepIdx === 0) return '正在解析字符串...';
    
    if (curr.action === 'push') {
      const bracketType = BRACKET_NAMES[curr.char] || '括号';
      return `左${bracketType} ${curr.char} 入栈`;
    }
    
    if (curr.action === 'pop') {
      const matchChar = input[curr.matchIndex ?? 0];
      const bracketTypeCurr = BRACKET_NAMES[curr.char] || '括号';
      const bracketTypeMatch = BRACKET_NAMES[matchChar] || '括号';
      return `右${bracketTypeCurr} ${curr.char} 与栈顶的左${bracketTypeMatch} ${matchChar} 匹配`;
    }
    
    if (curr.action === 'error') {
      if (curr.matchIndex !== undefined) {
        const matchChar = input[curr.matchIndex];
        const bracketTypeCurr = BRACKET_NAMES[curr.char] || '括号';
        const bracketTypeMatch = BRACKET_NAMES[matchChar] || '括号';
        return `右${bracketTypeCurr} ${curr.char} 与栈顶的左${bracketTypeMatch} ${matchChar} 不匹配`;
      }
      const bracketType = BRACKET_NAMES[curr.char] || '括号';
      return `右${bracketType} ${curr.char} 没有可匹配的左括号`;
    }
    
    if (curr.result !== undefined) {
      return result ? '所有括号匹配成功，字符串有效' : '括号未全部匹配，字符串无效';
    }
    
    return '正在解析字符串...';
  };

  // 进度条拖动
  const handleProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStepIdx(Number(e.target.value));
    setPlaying(false);
  };

  // 更新输入并计算步骤，但不自动播放
  const handleInputChange = (newInput: string) => {
    setInput(newInput);
    // 计算步骤将在useEffect中触发，但不会自动播放
  };

  // 练习区
  const handlePractice = (idx: number) => {
    setShowPractice(true);
    setPracticeIdx(idx);
    setInput(practiceList[idx]);
    // 不需要自动开始，将在useEffect中触发calculateSteps()
    setPracticeHint(false);
  };
  
  const showHint = () => {
    setPracticeHint(true);
  };

  // 页面底部的空白区域，为控制面板腾出空间
  const controlPanelHeight = 'min(120px, 18vh)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100vh',
      width: '100%',
      background: '#f8fafc',
      overflow: 'hidden',
      padding: '1vh 2vw',
      paddingBottom: controlPanelHeight, // 为底部控制面板留出空间
      boxSizing: 'border-box',
      maxHeight: '100vh',
      position: 'relative' // 添加相对定位以便放置GitHub徽标
    }}>
      {/* 左上角返回链接 */}
      <a 
        href="https://fuck-algorithm.github.io/leetcode-hot-100/" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: '1vh',
          left: '2vw',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          color: '#1976d2',
          textDecoration: 'none',
          fontSize: 'min(1.4vw, 16px)',
          fontWeight: 500,
          transition: 'transform 0.2s ease',
          background: 'rgba(227, 242, 253, 0.7)',
          padding: '0.5vh 1vw',
          borderRadius: '4px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateX(5px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.5vw'}}>
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回LeetCode Hot 100
      </a>

      {/* GitHub徽标 */}
      <a 
        href="https://github.com/fuck-algorithm/leetcode-20-valid-parentheses" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: '1vh',
          right: '2vw',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333',
          textDecoration: 'none',
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
      </a>

      <h2 
        onClick={() => window.open('https://leetcode.cn/problems/valid-parentheses/description/', '_blank')}
        style={{
          fontSize: 'min(3vw, 32px)', 
          textAlign: 'center', 
          margin: '1vh 0', 
          color: '#1976d2',
          fontWeight: 700,
          cursor: 'pointer',
          textDecoration: 'none',
          position: 'relative',
          display: 'inline-block',
          transition: 'transform 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)';
          e.currentTarget.style.textDecoration = 'underline';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.textDecoration = 'none';
        }}
      >
        LeetCode 20 - 有效的括号动画演示
      </h2>
      
      {/* 样例面板 */}
      <ExamplesPanel 
        practiceList={practiceList}
        currentExample={input}
        onSelectExample={handleInputChange}
        showPractice={showPractice}
        practiceIdx={practiceIdx}
        handlePractice={handlePractice}
      />
      
      {/* 主要内容区：字符串解析区和栈区域 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '100%',
        gap: '3vw',
        flexGrow: 1,
        margin: '2vh 0',
        maxWidth: '95vw'
      }}>
        {/* 字符串区 */}
        <div style={{
          flex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 0,
          height: '100%',
          justifyContent: 'center',
          border: '2px solid #1976d2',
          borderRadius: 16,
          padding: '2vh 2vw',
          background: '#f5f9ff',
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
        }}>
          <div style={{
            fontSize: 'min(2vw, 24px)',
            marginBottom: '2vh',
            color: '#1976d2',
            fontWeight: 600
          }}>
            字符串
          </div>
          <div style={{
            display: 'flex',
            gap: '1.5vw',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70%'
          }}>
            {input.split('').map((ch, i) => (
              <span 
                key={i} 
                style={{
                  fontSize: 'min(4.5vw, 56px)',
                  fontWeight: 700,
                  transition: 'color .3s, transform .3s',
                  color: getCharColor(i),
                  transform: curr.index === i ? 'scale(1.3)' : 'scale(1)'
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
        
        {/* 栈区域 */}
        <div style={{
          flex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 'min(25vw, 300px)',
          height: '100%'
        }}>
          <div style={{
            fontSize: 'min(2vw, 24px)',
            marginBottom: '1vh',
            color: '#1976d2',
            fontWeight: 600
          }}>
            栈结构
          </div>
          <div style={{
            border: '2px solid #1976d2',
            borderRadius: 16,
            height: '90%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '2vh 2vw',
            background: '#f5f9ff',
            position: 'relative',
            overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
          }}>
            {/* 栈底部指示 */}
            {curr.stack.length > 0 && (
              <div style={{
                width: '80%',
                borderBottom: '2px dashed #90caf9',
                marginBottom: '1vh',
                paddingBottom: '0.5vh',
                textAlign: 'center',
                color: '#90caf9',
                fontSize: 'min(1.2vw, 14px)'
              }}>
                栈底
              </div>
            )}
            
            {/* 栈内元素 */}
            {curr.stack.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "10px",
                  width: "100%",
                  textAlign: "center",
                  border: i === curr.stack.length - 1 ? `2px dashed #f44336` : "1px solid #1976d2",
                  borderRadius: "4px",
                  margin: "4px 0",
                  backgroundColor: getStackColor(i),
                  color: "#fff",
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <span style={{
                  fontSize: "min(3.5vw, 40px)",
                  fontWeight: 700,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
                }}>
                  {item}
                </span>
                {i === curr.stack.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "-70px",
                      transform: "translateY(-50%)",
                      backgroundColor: "#f44336",
                      color: "#fff",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span>栈顶元素</span>
                    <span style={{ fontSize: "16px", marginLeft: "4px" }}>←</span>
                  </div>
                )}
              </div>
            ))}
            
            {/* 空栈提示 */}
            {curr.stack.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%'
              }}>
                <div style={{
                  color: '#bbb',
                  fontSize: 'min(1.8vw, 22px)',
                  marginBottom: '2vh'
                }}>
                  空栈
                </div>
                <div style={{
                  width: '80%',
                  borderTop: '2px dashed #90caf9',
                  color: '#90caf9',
                  paddingTop: '1vh',
                  fontSize: 'min(1.2vw, 14px)',
                  textAlign: 'center'
                }}>
                  栈底部 (左括号将从这里入栈)
                </div>
              </div>
            )}
            
            {/* 栈顶入口标识 */}
            <div style={{
              position: 'absolute',
              top: '-1px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#e3f2fd',
              padding: '0.4vh 2vw',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
              color: '#1976d2',
              fontSize: 'min(1.2vw, 14px)',
              fontWeight: 600,
              border: '2px solid #1976d2',
              borderTop: 'none'
            }}>
              栈顶入口
            </div>
            
            {/* 栈操作说明 */}
            {curr.action === 'push' && (
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '-15px',
                transform: 'translateY(-50%)',
                background: '#4caf50',
                color: 'white',
                padding: '0.5vh 1vw',
                borderRadius: '50%',
                fontSize: 'min(1.5vw, 16px)',
                fontWeight: 700,
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
                ⬇
              </div>
            )}
            {curr.action === 'pop' && (
              <div style={{
                position: 'absolute',
                top: '50%',
                right: '-15px',
                transform: 'translateY(-50%)',
                background: '#f44336',
                color: 'white',
                padding: '0.5vh 1vw',
                borderRadius: '50%',
                fontSize: 'min(1.5vw, 16px)',
                fontWeight: 700,
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}>
                ⬆
              </div>
            )}
          </div>
          
          {/* 栈简要说明 */}
          <div style={{
            fontSize: 'min(1.2vw, 14px)',
            color: '#777',
            marginTop: '1vh',
            textAlign: 'center',
            maxWidth: '90%'
          }}>
            栈用于存储左括号，当遇到右括号时与栈顶匹配
          </div>
        </div>
      </div>
      
      {/* 分镜：信息面板 */}
      <div style={{
        minHeight: 'min(6vh, 60px)',
        padding: '1.5vh 3vw',
        background: '#e3f2fd',
        borderRadius: 12,
        fontSize: 'min(1.8vw, 20px)',
        color: '#1976d2',
        fontWeight: 600,
        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
        maxWidth: '95vw',
        textAlign: 'center',
        margin: '2vh 0',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {getInfoPanel()}
        {showPractice && practiceHint && (
          <span style={{marginLeft: '1vw', color: '#f44336'}}>
            提示：{practiceList[practiceIdx].includes(')') && practiceList[practiceIdx].includes('(') ? 
              '注意括号嵌套顺序' : '尝试匹配所有括号'}
          </span>
        )}
      </div>
      
      {/* 控制面板 */}
      <ControlPanel 
        steps={steps}
        stepIdx={stepIdx}
        playing={playing}
        speed={speed}
        onPrev={prev}
        onNext={next}
        onPause={pause}
        onPlay={start}
        onReset={reset}
        onSpeedChange={setSpeed}
        onStepChange={(idx) => {
          setStepIdx(idx);
          setPlaying(false);
        }}
        result={result}
      />
    </div>
  );
};

export default Animation;