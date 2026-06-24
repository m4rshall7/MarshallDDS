import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  query, orderBy, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { CATEGORIES, INCOME_CATS, EXPENSE_CATS, SHEETS_PROXY_URL } from './constants';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// ─── helpers ────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat('ru-RU').format(Math.round(n || 0));
const today = () => format(new Date(), 'yyyy-MM-dd');

// ─── tiny components ────────────────────────────────────
function Spinner() {
  return (
    <div style={{display:'flex',justifyContent:'center',padding:32}}>
      <div style={{width:32,height:32,border:'3px solid #e2e8f0',borderTop:'3px solid #0F3460',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',
      background: type==='error'?'#922B21':'#1B6B40',
      color:'#fff',padding:'12px 20px',borderRadius:12,
      fontSize:14,fontWeight:600,zIndex:1000,
      boxShadow:'0 4px 20px rgba(0,0,0,0.3)',maxWidth:300,textAlign:'center'
    }}>{msg}</div>
  );
}

// ─── ADD TRANSACTION SCREEN ──────────────────────────────
function AddScreen({ onAdd, onClose }) {
  const [step, setStep]       = useState(1); // 1=type, 2=amount, 3=category, 4=confirm
  const [txType, setTxType]   = useState('');
  const [amount, setAmount]   = useState('');
  const [cat, setCat]         = useState(null);
  const [comment, setComment] = useState('');
  const [date, setDate]       = useState(today());
  const [loading, setLoading] = useState(false);

  const cats = txType === 'Поступление' ? INCOME_CATS : EXPENSE_CATS;

  const handleAmount = (v) => {
    if (v === 'del') { setAmount(p => p.slice(0,-1)); return; }
    if (v === '.' && amount.includes('.')) return;
    if (amount.length >= 12) return;
    setAmount(p => p + v);
  };

  const handleSubmit = async () => {
    if (!amount || !cat) return;
    setLoading(true);
    try {
      const tx = {
        date,
        category: cat.name,
        type: txType,
        activity: cat.activity,
        amount: parseFloat(amount),
        comment,
        synced: false,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'transactions'), tx);
      onAdd(tx);
      onClose();
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isIncome = txType === 'Поступление';
  const accentColor = isIncome ? '#1B6B40' : '#922B21';
  const accentLight = isIncome ? '#D5F5E3' : '#FADBD8';

  return (
    <div style={{
      position:'fixed',inset:0,background:'#fff',zIndex:100,
      display:'flex',flexDirection:'column',fontFamily:'Arial,sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background:'#1A1A2E',color:'#fff',padding:'16px 20px',
        display:'flex',alignItems:'center',gap:12
      }}>
        <button onClick={onClose} style={{background:'none',border:'none',color:'#fff',fontSize:22,cursor:'pointer',padding:4}}>←</button>
        <div>
          <div style={{fontSize:18,fontWeight:700}}>Новая операция</div>
          <div style={{fontSize:12,color:'#94a3b8'}}>
            {step===1?'Шаг 1: Тип':step===2?'Шаг 2: Сумма':step===3?'Шаг 3: Статья':'Шаг 4: Подтверждение'}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{display:'flex',height:4}}>
        {[1,2,3,4].map(s=>(
          <div key={s} style={{flex:1,background:step>=s?accentColor:'#e2e8f0',transition:'background 0.3s'}}/>
        ))}
      </div>

      <div style={{flex:1,overflowY:'auto',padding:20}}>

        {/* STEP 1: TYPE */}
        {step===1 && (
          <div>
            <div style={{fontSize:16,fontWeight:700,color:'#1A1A2E',marginBottom:20}}>Что это?</div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {[
                {type:'Поступление',emoji:'📈',desc:'Деньги пришли',bg:'#D5F5E3',color:'#1B6B40'},
                {type:'Выплата',    emoji:'📉',desc:'Деньги ушли',  bg:'#FADBD8',color:'#922B21'},
              ].map(o=>(
                <button key={o.type} onClick={()=>{setTxType(o.type);setStep(2);}}
                  style={{
                    background:o.bg,border:`2px solid ${o.color}`,borderRadius:16,
                    padding:'24px 20px',display:'flex',alignItems:'center',gap:16,
                    cursor:'pointer',textAlign:'left'
                  }}>
                  <span style={{fontSize:40}}>{o.emoji}</span>
                  <div>
                    <div style={{fontSize:20,fontWeight:700,color:o.color}}>{o.type}</div>
                    <div style={{fontSize:14,color:'#64748b'}}>{o.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: AMOUNT */}
        {step===2 && (
          <div>
            <div style={{fontSize:16,fontWeight:700,color:'#1A1A2E',marginBottom:8}}>
              {isIncome?'📈 Поступление':'📉 Выплата'}
            </div>

            {/* Amount display */}
            <div style={{
              background:accentLight,borderRadius:16,padding:'20px 16px',
              textAlign:'center',marginBottom:16,minHeight:80,
              display:'flex',alignItems:'center',justifyContent:'center'
            }}>
              <span style={{fontSize:40,fontWeight:700,color:accentColor,letterSpacing:2}}>
                {amount || '0'} ₽
              </span>
            </div>

            {/* Date */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,color:'#64748b',marginBottom:4,display:'block'}}>Дата</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                style={{width:'100%',padding:'10px 14px',borderRadius:10,
                  border:'1.5px solid #e2e8f0',fontSize:15,boxSizing:'border-box'}}/>
            </div>

            {/* Numpad */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
              {['1','2','3','4','5','6','7','8','9','.',  '0','del'].map(k=>(
                <button key={k} onClick={()=>handleAmount(k)}
                  style={{
                    padding:'18px 0',fontSize:22,fontWeight:k==='del'?400:600,
                    background: k==='del'?'#f1f5f9':'#fff',
                    border:'1.5px solid #e2e8f0',borderRadius:12,
                    cursor:'pointer',color:'#1A1A2E',
                    transition:'background 0.15s'
                  }}>
                  {k==='del'?'⌫':k}
                </button>
              ))}
            </div>

            <button onClick={()=>amount&&setStep(3)} disabled={!amount}
              style={{
                width:'100%',padding:16,borderRadius:14,border:'none',
                background:amount?accentColor:'#e2e8f0',
                color:amount?'#fff':'#94a3b8',
                fontSize:17,fontWeight:700,cursor:amount?'pointer':'not-allowed'
              }}>
              Далее →
            </button>
          </div>
        )}

        {/* STEP 3: CATEGORY */}
        {step===3 && (
          <div>
            <div style={{fontSize:16,fontWeight:700,color:'#1A1A2E',marginBottom:16}}>Выбери статью</div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
              {cats.map(c=>(
                <button key={c.name} onClick={()=>{setCat(c);setStep(4);}}
                  style={{
                    background: cat?.name===c.name ? accentLight : '#f8fafc',
                    border: cat?.name===c.name ? `2px solid ${accentColor}` : '1.5px solid #e2e8f0',
                    borderRadius:12,padding:'14px 16px',
                    display:'flex',alignItems:'center',gap:12,
                    cursor:'pointer',textAlign:'left',transition:'all 0.15s'
                  }}>
                  <span style={{fontSize:22}}>{c.emoji}</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:'#1A1A2E'}}>{c.name}</div>
                    <div style={{fontSize:12,color:'#64748b'}}>{c.activity}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRM */}
        {step===4 && cat && (
          <div>
            <div style={{fontSize:16,fontWeight:700,color:'#1A1A2E',marginBottom:20}}>Проверь и сохрани</div>

            {/* Summary card */}
            <div style={{
              background:accentLight,borderRadius:20,padding:24,marginBottom:20,
              border:`2px solid ${accentColor}`
            }}>
              <div style={{fontSize:13,color:'#64748b',marginBottom:4}}>Сумма</div>
              <div style={{fontSize:36,fontWeight:700,color:accentColor,marginBottom:16}}>
                {isIncome?'+':'-'}{fmt(parseFloat(amount))} ₽
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[
                  ['📅 Дата', date],
                  ['🏷 Статья', `${cat.emoji} ${cat.name}`],
                  ['📊 Тип', txType],
                  ['🏗 Деятельность', cat.activity],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:13,color:'#64748b'}}>{k}</span>
                    <span style={{fontSize:13,fontWeight:600,color:'#1A1A2E'}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:13,color:'#64748b',marginBottom:6,display:'block'}}>Комментарий (необязательно)</label>
              <input value={comment} onChange={e=>setComment(e.target.value)}
                placeholder="Например: оплата поставщику Иванову"
                style={{width:'100%',padding:'12px 14px',borderRadius:12,
                  border:'1.5px solid #e2e8f0',fontSize:14,boxSizing:'border-box'}}/>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              style={{
                width:'100%',padding:18,borderRadius:16,border:'none',
                background:accentColor,color:'#fff',
                fontSize:17,fontWeight:700,cursor:'pointer',
                boxShadow:`0 4px 16px ${accentColor}44`
              }}>
              {loading ? '⏳ Сохраняем...' : '✅ Сохранить операцию'}
            </button>

            <button onClick={()=>setStep(3)}
              style={{width:'100%',padding:14,marginTop:10,borderRadius:12,
                border:'1.5px solid #e2e8f0',background:'#fff',
                fontSize:15,color:'#64748b',cursor:'pointer'}}>
              ← Изменить статью
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD SCREEN ───────────────────────────────────
function DashboardScreen({ transactions }) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd   = endOfMonth(now);

  const monthTx = transactions.filter(tx => {
    try {
      const d = parseISO(tx.date);
      return isWithinInterval(d, { start: monthStart, end: monthEnd });
    } catch { return false; }
  });

  const income  = monthTx.filter(t=>t.type==='Поступление').reduce((s,t)=>s+t.amount,0);
  const expense = monthTx.filter(t=>t.type==='Выплата').reduce((s,t)=>s+t.amount,0);
  const balance = income - expense;

  const monthName = format(now, 'LLLL yyyy', {locale: ru});

  // Top expense categories
  const catTotals = {};
  monthTx.filter(t=>t.type==='Выплата').forEach(t=>{
    catTotals[t.category] = (catTotals[t.category]||0) + t.amount;
  });
  const topCats = Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxCat  = topCats[0]?.[1] || 1;

  return (
    <div style={{padding:'0 16px 16px',fontFamily:'Arial,sans-serif'}}>
      <div style={{fontSize:13,color:'#64748b',marginBottom:16,textTransform:'capitalize'}}>
        {monthName}
      </div>

      {/* KPI cards */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        {[
          {label:'Поступления',val:income,  color:'#1B6B40',bg:'#D5F5E3',icon:'📈'},
          {label:'Расходы',    val:expense, color:'#922B21',bg:'#FADBD8',icon:'📉'},
        ].map(k=>(
          <div key={k.label} style={{
            background:k.bg,borderRadius:16,padding:'16px 14px',
            border:`1.5px solid ${k.color}22`
          }}>
            <div style={{fontSize:11,color:k.color,fontWeight:600,marginBottom:4}}>{k.icon} {k.label}</div>
            <div style={{fontSize:20,fontWeight:700,color:k.color}}>{fmt(k.val)} ₽</div>
          </div>
        ))}
      </div>

      {/* Balance */}
      <div style={{
        background: balance>=0?'#0E6655':'#922B21',
        borderRadius:16,padding:'18px 16px',marginBottom:16,
        display:'flex',justifyContent:'space-between',alignItems:'center'
      }}>
        <div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.8)',marginBottom:4}}>Чистый поток за месяц</div>
          <div style={{fontSize:28,fontWeight:700,color:'#fff'}}>
            {balance>=0?'+':''}{fmt(balance)} ₽
          </div>
        </div>
        <div style={{fontSize:36}}>{balance>=0?'🟢':'🔴'}</div>
      </div>

      {/* Top expenses */}
      {topCats.length>0 && (
        <div style={{background:'#f8fafc',borderRadius:16,padding:'16px',marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1A1A2E',marginBottom:12}}>
            📊 Топ расходов за месяц
          </div>
          {topCats.map(([name,sum])=>{
            const cat = CATEGORIES.find(c=>c.name===name);
            return (
              <div key={name} style={{marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:13,color:'#1A1A2E'}}>{cat?.emoji||'•'} {name}</span>
                  <span style={{fontSize:13,fontWeight:700,color:'#922B21'}}>{fmt(sum)} ₽</span>
                </div>
                <div style={{background:'#e2e8f0',borderRadius:4,height:6}}>
                  <div style={{
                    background:'#922B21',borderRadius:4,height:6,
                    width:`${(sum/maxCat)*100}%`,transition:'width 0.5s'
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unsynced warning */}
      {transactions.filter(t=>!t.synced).length > 0 && (
        <div style={{
          background:'#FEF9E7',borderRadius:12,padding:'12px 14px',
          border:'1.5px solid #F39C12',fontSize:13,color:'#784212'
        }}>
          ⚠️ {transactions.filter(t=>!t.synced).length} операций не синхронизированы с Google Sheets
        </div>
      )}
    </div>
  );
}

// ─── HISTORY SCREEN ─────────────────────────────────────
function HistoryScreen({ transactions, onDelete }) {
  const [filter, setFilter] = useState('all');

  const filtered = transactions.filter(t => {
    if (filter==='income')  return t.type==='Поступление';
    if (filter==='expense') return t.type==='Выплата';
    return true;
  });

  // Group by date
  const grouped = {};
  filtered.forEach(t => {
    const key = t.date || 'unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });
  const sortedDates = Object.keys(grouped).sort((a,b)=>b.localeCompare(a));

  return (
    <div style={{padding:'0 16px 16px',fontFamily:'Arial,sans-serif'}}>
      {/* Filter tabs */}
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        {[['all','Все'],['income','Приход'],['expense','Расход']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{
              padding:'8px 16px',borderRadius:20,border:'none',fontSize:13,fontWeight:600,
              background:filter===v?'#1A1A2E':'#f1f5f9',
              color:filter===v?'#fff':'#64748b',cursor:'pointer'
            }}>{l}</button>
        ))}
      </div>

      {sortedDates.length===0 && (
        <div style={{textAlign:'center',color:'#94a3b8',padding:40,fontSize:15}}>
          Операций пока нет
        </div>
      )}

      {sortedDates.map(date=>(
        <div key={date} style={{marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:'#64748b',
            textTransform:'uppercase',letterSpacing:1,marginBottom:8}}>
            {date}
          </div>
          {grouped[date].map(tx=>{
            const isIn = tx.type==='Поступление';
            const cat = CATEGORIES.find(c=>c.name===tx.category);
            return (
              <div key={tx.id} style={{
                background:'#fff',borderRadius:14,padding:'14px 16px',
                marginBottom:8,boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
                display:'flex',alignItems:'center',gap:12,
                border:`1px solid ${isIn?'#D5F5E3':'#FADBD8'}`
              }}>
                <div style={{
                  width:42,height:42,borderRadius:12,
                  background:isIn?'#D5F5E3':'#FADBD8',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:20,flexShrink:0
                }}>{cat?.emoji||'💰'}</div>

                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:'#1A1A2E',
                    whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {tx.category}
                  </div>
                  {tx.comment && (
                    <div style={{fontSize:12,color:'#94a3b8',marginTop:2,
                      whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {tx.comment}
                    </div>
                  )}
                  <div style={{fontSize:11,color:tx.synced?'#1B6B40':'#F39C12',marginTop:2}}>
                    {tx.synced?'✓ синхр.':'● не синхр.'}
                  </div>
                </div>

                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:16,fontWeight:700,color:isIn?'#1B6B40':'#922B21'}}>
                    {isIn?'+':'-'}{fmt(tx.amount)} ₽
                  </div>
                  <button onClick={()=>onDelete(tx.id)}
                    style={{background:'none',border:'none',color:'#e2e8f0',
                      fontSize:16,cursor:'pointer',padding:'4px 0',marginTop:2}}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── SYNC SCREEN ────────────────────────────────────────
function SyncScreen({ transactions, onSynced, sheetsUrl }) {
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);

  const unsynced = transactions.filter(t=>!t.synced);

  const handleSync = async () => {
    if (!sheetsUrl) {
      setResult({ok:false, msg:'URL Apps Script не настроен. Смотри инструкцию ниже.'});
      return;
    }
    if (unsynced.length===0) {
      setResult({ok:true, msg:'Все операции уже синхронизированы!'});
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const rows = unsynced.map(t=>({
        date: t.date,
        category: t.category,
        type: t.type,
        activity: t.activity,
        amount: t.amount,
        comment: t.comment||'',
        id: t.id,
      }));

      const resp = await fetch('/api/sheets', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({transactions: rows})
      });
      const data = await resp.json();

      if (data.ok) {
        await onSynced(unsynced.map(t=>t.id));
        setResult({ok:true, msg:`✅ ${unsynced.length} операций успешно отправлены в Google Sheets!`});
      } else {
        setResult({ok:false, msg:`❌ Ошибка: ${data.error}`});
      }
    } catch(e) {
      setResult({ok:false, msg:`❌ Ошибка соединения: ${e.message}`});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:'0 16px 16px',fontFamily:'Arial,sans-serif'}}>
      {/* Status */}
      <div style={{
        background: unsynced.length===0?'#D5F5E3':'#FEF9E7',
        borderRadius:16,padding:'20px 16px',marginBottom:20,
        border:`1.5px solid ${unsynced.length===0?'#1B6B40':'#F39C12'}`,
        textAlign:'center'
      }}>
        <div style={{fontSize:36,marginBottom:8}}>
          {unsynced.length===0?'✅':'📤'}
        </div>
        <div style={{fontSize:18,fontWeight:700,color:'#1A1A2E',marginBottom:4}}>
          {unsynced.length===0
            ? 'Всё синхронизировано'
            : `${unsynced.length} операций ожидают`
          }
        </div>
        <div style={{fontSize:13,color:'#64748b'}}>
          {unsynced.length===0
            ? 'Все операции отправлены в Google Sheets'
            : 'Нажми кнопку чтобы отправить в Google Sheets'
          }
        </div>
      </div>

      <button onClick={handleSync} disabled={loading||unsynced.length===0}
        style={{
          width:'100%',padding:18,borderRadius:16,border:'none',
          background:unsynced.length>0&&!loading?'#0F3460':'#e2e8f0',
          color:unsynced.length>0&&!loading?'#fff':'#94a3b8',
          fontSize:17,fontWeight:700,cursor:unsynced.length>0?'pointer':'not-allowed',
          marginBottom:16,boxShadow:unsynced.length>0?'0 4px 16px #0F346044':'none'
        }}>
        {loading?'⏳ Отправляем...':'📤 Синхронизировать с Google Sheets'}
      </button>

      {result && (
        <div style={{
          background:result.ok?'#D5F5E3':'#FADBD8',
          borderRadius:12,padding:'14px 16px',marginBottom:16,
          fontSize:14,color:result.ok?'#1B6B40':'#922B21',fontWeight:600
        }}>{result.msg}</div>
      )}

      {/* Stats */}
      <div style={{background:'#f8fafc',borderRadius:16,padding:16,marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:700,color:'#1A1A2E',marginBottom:12}}>
          📊 Статистика
        </div>
        {[
          ['Всего операций',       transactions.length],
          ['Синхронизировано',     transactions.filter(t=>t.synced).length],
          ['Ожидают синхронизации',unsynced.length],
        ].map(([k,v])=>(
          <div key={k} style={{display:'flex',justifyContent:'space-between',
            padding:'8px 0',borderBottom:'1px solid #e2e8f0',fontSize:13}}>
            <span style={{color:'#64748b'}}>{k}</span>
            <span style={{fontWeight:700,color:'#1A1A2E'}}>{v}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{background:'#EBF5FB',borderRadius:16,padding:16}}>
        <div style={{fontSize:13,fontWeight:700,color:'#0F3460',marginBottom:10}}>
          🔧 Как настроить синхронизацию
        </div>
        {[
          '1. Открой Google Sheets и создай новую таблицу',
          '2. Перейди в Расширения → Apps Script',
          '3. Вставь код из файла apps-script.js (в репозитории)',
          '4. Нажми "Развернуть" → Новое развёртывание → Веб-приложение',
          '5. Скопируй URL и добавь в переменную REACT_APP_SHEETS_URL в Vercel',
        ].map((s,i)=>(
          <div key={i} style={{fontSize:12,color:'#1e40af',marginBottom:6,lineHeight:1.5}}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────
export default function App() {
  const [tab, setTab]           = useState('dashboard');
  const [showAdd, setShowAdd]   = useState(false);
  const [transactions, setTxs]  = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type='success') => setToast({msg, type});

  // Load transactions
  useEffect(() => {
    const load = async () => {
      try {
        const q = query(collection(db,'transactions'), orderBy('createdAt','desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d=>({id:d.id,...d.data()}));
        setTxs(data);
      } catch(e) {
        console.error(e);
        showToast('Ошибка загрузки данных','error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = useCallback((tx) => {
    setTxs(prev => [tx, ...prev]);
    showToast('Операция сохранена! 💾');
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Удалить операцию?')) return;
    try {
      await deleteDoc(doc(db,'transactions',id));
      setTxs(prev=>prev.filter(t=>t.id!==id));
      showToast('Удалено');
    } catch(e) {
      showToast('Ошибка удаления','error');
    }
  }, []);

  const handleSynced = useCallback(async (ids) => {
    for (const id of ids) {
      try { await updateDoc(doc(db,'transactions',id),{synced:true}); } catch{}
    }
    setTxs(prev=>prev.map(t=>ids.includes(t.id)?{...t,synced:true}:t));
  }, []);

  const tabs = [
    {id:'dashboard',label:'Дашборд',icon:'📊'},
    {id:'history',  label:'История', icon:'📋'},
    {id:'sync',     label:'Синхр.',  icon:'📤'},
  ];

  const unsyncedCount = transactions.filter(t=>!t.synced).length;

  return (
    <div style={{
      maxWidth:430,margin:'0 auto',minHeight:'100vh',
      background:'#f8fafc',fontFamily:'Arial,sans-serif',
      position:'relative'
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        body { margin: 0; background: #f8fafc; }
        input, button { font-family: Arial, sans-serif; }
      `}</style>

      {/* Header */}
      <div style={{
        background:'#1A1A2E',color:'#fff',
        padding:'16px 20px 12px',
        display:'flex',justifyContent:'space-between',alignItems:'center',
        position:'sticky',top:0,zIndex:50
      }}>
        <div>
          <div style={{fontSize:20,fontWeight:700}}>Marshall DDS</div>
          <div style={{fontSize:11,color:'#94a3b8'}}>Учёт движения денег</div>
        </div>
        <button onClick={()=>setShowAdd(true)}
          style={{
            background:'#0F3460',border:'none',color:'#fff',
            width:48,height:48,borderRadius:14,fontSize:26,
            cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 2px 8px rgba(15,52,96,0.5)'
          }}>+</button>
      </div>

      {/* Content */}
      <div style={{paddingTop:16, paddingBottom:80}}>
        {loading ? <Spinner/> : (
          <>
            {tab==='dashboard' && <DashboardScreen transactions={transactions}/>}
            {tab==='history'   && <HistoryScreen transactions={transactions} onDelete={handleDelete}/>}
            {tab==='sync'      && <SyncScreen transactions={transactions} onSynced={handleSynced} sheetsUrl={SHEETS_PROXY_URL}/>}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',
        width:'100%',maxWidth:430,
        background:'#fff',borderTop:'1px solid #e2e8f0',
        display:'flex',zIndex:50,
        boxShadow:'0 -4px 16px rgba(0,0,0,0.08)'
      }}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{
              flex:1,padding:'10px 0',border:'none',background:'none',
              cursor:'pointer',display:'flex',flexDirection:'column',
              alignItems:'center',gap:3,transition:'all 0.15s',
              position:'relative'
            }}>
            <span style={{fontSize:22}}>{t.icon}</span>
            <span style={{fontSize:11,fontWeight:600,
              color:tab===t.id?'#0F3460':'#94a3b8'}}>
              {t.label}
            </span>
            {t.id==='sync' && unsyncedCount>0 && (
              <div style={{
                position:'absolute',top:6,right:'calc(50% - 18px)',
                background:'#F39C12',color:'#fff',
                fontSize:10,fontWeight:700,
                width:16,height:16,borderRadius:'50%',
                display:'flex',alignItems:'center',justifyContent:'center'
              }}>{unsyncedCount}</div>
            )}
            {tab===t.id && (
              <div style={{position:'absolute',top:0,left:'20%',right:'20%',
                height:3,background:'#0F3460',borderRadius:2}}/>
            )}
          </button>
        ))}
      </div>

      {/* Add overlay */}
      {showAdd && (
        <AddScreen
          onAdd={handleAdd}
          onClose={()=>setShowAdd(false)}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}
