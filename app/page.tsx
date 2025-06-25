'use client';

import { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

type RowData = {
  状態: string;
  投資区分: string;
  台番: string;
  加算値?: string | number;
  狙い目G数?: string;
  調整後G数?: string;
  補足?: string;
  その他条件?: string;
  狙い分類?: string;
  中カテゴリ?: string;
  条件?: string;
  条件2?: string;
  条件3?: string;
  条件4?: string;
  参考リンク?: string;
  [key: `資金_${string}`]: string;
  [key: string]: any;
};

function adjustRange(range: string | number, plus: number): string {
  if (range === null || range === undefined || isNaN(plus)) return String(range);
  const raw = typeof range === 'number' ? range.toString() : range.toString().trim();
  const added = parseInt(plus.toString());

  const matchPlain = raw.match(/^(CZ|AT)(間)?(\d+)$/);
  if (matchPlain) {
    const prefix = matchPlain[1];
    const num = parseInt(matchPlain[3]);
    return `${prefix}間${num + added}`;
  }

  if (/^\d+$/.test(raw)) {
    return `${parseInt(raw) + added}`;
  }

  if (/^(\d+)[～~](\d+)$/.test(raw)) {
    const [fromStr, toStr] = raw.split(/[～~]/);
    const from = parseInt(fromStr.trim());
    const to = parseInt(toStr.trim());
    return `${from + added}～${to + added}`;
  }

  if (/^\d+\+@$/.test(raw)) {
    const base = parseInt(raw);
    return `${base + added}+@`;
  }

  const match = raw.match(/^(\d+)[～~](\d+)\+@$/);
  if (match) {
    const from = parseInt(match[1]);
    const to = parseInt(match[2]);
    return `${from + added}～${to + added}+@`;
  }

  return raw;
}

// 追加：スルー数とptを数値化するヘルパー
const getSuru = (item: RowData): number => {
  const targets = [item.条件, item.条件2, item.条件3, item.条件4];
  for (const t of targets) {
    if (t && t.includes('スルー')) {
      const m = t.match(/(\d+)スルー/);
      if (m) return parseInt(m[1]);
    }
  }
  return 99; // スルー情報が無いものは最後へ
};

const getPt = (item: RowData): number => {
  const raw = item.狙い目G数?.toString() || '';
  const n = parseInt(raw.replace(/[^\d]/g, ''));
  return isNaN(n) ? 0 : n;
};

export default function Home() {
  const [data, setData] = useState<RowData[]>([]);
  const [machine, setMachine] = useState('');
  const [state, setState] = useState('');
  const [investment, setInvestment] = useState('');
  const [capital, setCapital] = useState('');
  const [closeGap, setCloseGap] = useState('閉店時間非考慮');
  const [results, setResults] = useState<RowData[]>([]);
  const [searched, setSearched] = useState(false);

  const machineOptions = ['機種を選択', 'L吉宗', 'ミリマス', 'Lゴジラ', 'L絶対衝撃', 'ULTRAMAN', 'ギルクラ2', 'ガンダムSEED', 'よう実', 'DMC5', 'いざ番長', 'L緑ドン', 'マギレコ'];
  const stateOptions = ['リセ後', 'AT後'];
  const investmentOptions = ['再プレイ', '46-52/460枚', '46-52/現金'];
  const capitalOptions = ['20万円以上', '50万円以上', '100万円以上'];
  const closeOptions = ['閉店時間非考慮', '閉店3h前', '閉店2h前', '閉店1h前'];

  // JSON 読み込み
  useEffect(() => {
    if (!machine || machine === '機種を選択') return;
    const map: { [key: string]: string } = {
      'L吉宗': 'yoshimune',
      'ミリマス': 'mirimasu',
      'Lゴジラ': 'gojira',
      'L絶対衝撃': 'zettai',
      'ULTRAMAN': 'ultraman',
      'ギルクラ2': 'guilty',
      'ガンダムSEED': 'seed',
      'よう実': 'youjitsu',
      'DMC5': 'dmc5',
      'いざ番長': 'izabancho',
      'L緑ドン': 'midori',
      'マギレコ': 'magireco'
    };
    fetch(`/neraime_l_${map[machine]}.json`).then(r => r.json()).then(j => setData(j));
  }, [machine]);

  const parsePlus = (value: string | number | null | undefined) => {
    if (!value || value === '不明') return 0;
    const cleaned = value.toString().replace(/[^\d-]/g, '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSearch = () => {
    setSearched(true);
    const filtered = data
      .filter(item => item.状態?.includes(state) && item.投資区分.replace('46/52', '46-52') === investment)
      .map(item => {
        const baseValue = item[`資金_${capital}`]?.toString().trim().replace(/[\s　]/g, '');
        const plusRaw = closeGap === '閉店3h前' ? item['閉店3h前加算'] :
                        closeGap === '閉店2h前' ? item['閉店2h前加算'] :
                        closeGap === '閉店1h前' ? item['閉店1h前加算'] : null;

        if (closeGap !== '閉店時間非考慮' && plusRaw === '不明') {
          return { ...item, 狙い目G数: baseValue, 調整後G数: '不明', 加算値: '不明' };
        }

        const 加算 = closeGap === '閉店3h前' ? parsePlus(item['閉店3h前加算']) :
                     closeGap === '閉店2h前' ? parsePlus(item['閉店2h前加算']) :
                     closeGap === '閉店1h前' ? parsePlus(item['閉店1h前加算']) : 0;

        const isCZorAT = /^((CZ|AT)間)?\d+$/i.test(baseValue);
        const 調整後G数 = (closeGap === '閉店時間非考慮' || !isCZorAT) ? undefined : adjustRange(baseValue, 加算);

        return { ...item, 狙い目G数: baseValue, 調整後G数, 加算値: 加算 };
      })
      // ★ 追加：スルー数 → pt の順で並べ替え
      .sort((a, b) => {
        const sDiff = getSuru(a) - getSuru(b);
        if (sDiff !== 0) return sDiff;
        return getPt(a) - getPt(b);
      });

    setResults(filtered);
  };

  // グルーピング
  const groupedResults = results.reduce<{ [key: string]: { [key: string]: RowData[] } }>((acc, item) => {
    const major = item.狙い分類 || 'その他';
    const minorSource = item.中カテゴリ || item.条件4 || '';
    const minor = minorSource.includes('前回AT300枚以下') ? '前回AT300枚以下' :
                  (minorSource.includes('前回AT300枚以上') || minorSource.includes('前回AT300～600枚')) ? '前回AT300枚以上' : '';
    if (!acc[major]) acc[major] = {};
    const mid = minor || '全体';
    if (!acc[major][mid]) acc[major][mid] = [];
    acc[major][mid].push(item);
    return acc;
  }, {});

  return (
    <main className="p-4 max-w-xl mx-auto text-sm">
      <h1 className="text-xl font-bold mb-4 text-center">狙い目早見表</h1>

      <div className="grid gap-3 mb-4">
        <select value={machine} onChange={e => setMachine(e.target.value)} className="border p-2 rounded">
          {machineOptions.map((o, i) => <option key={i} value={o === '機種を選択' ? '' : o}>{o}</option>)}
        </select>
        <select value={state} onChange={e => setState(e.target.value)} className="border p-2 rounded">
          <option value="">状態を選択</option>{stateOptions.map((o,i)=><option key={i}>{o}</option>)}
        </select>
        <select value={investment} onChange={e => setInvestment(e.target.value)} className="border p-2 rounded">
          <option value="">投資区分を選択</option>{investmentOptions.map((o,i)=><option key={i}>{o}</option>)}
        </select>
        <select value={capital} onChange={e => setCapital(e.target.value)} className="border p-2 rounded">
          <option value="">資金帯を選択</option>{capitalOptions.map((o,i)=><option key={i}>{o}</option>)}
        </select>
        <select value={closeGap} onChange={e => setCloseGap(e.target.value)} className="border p-2 rounded">
          {closeOptions.map((o,i)=><option key={i}>{o}</option>)}
        </select>
        <button onClick={handleSearch} className="bg-blue-600 text-white py-2 rounded" disabled={!state||!investment||!capital}>検索</button>
      </div>

      {searched && Object.keys(groupedResults).length ? (
        <div className="grid gap-6">
          {Object.entries(groupedResults).map(([cat, minors]) => (
            <div key={cat} className="border rounded-xl p-4 shadow-md bg-white">
              <h2 className="font-bold text-base mb-2">{cat}</h2>
              {Object.entries(minors).map(([minor, items]) => (
                <div key={minor} className="mb-3">
                  {minor!=='全体' && <h3 className="text-sm font-semibold mb-1">{minor}</h3>}
                  {items[0]?.参考リンク && (
                    <div className="text-xs text-blue-600 underline mb-1">
                      <a href={items[0].参考リンク} target="_blank" rel="noopener noreferrer">打ち方や各種示唆はこちら</a>
                    </div>
                  )}
                  <ul className="list-disc pl-4 space-y-1">
                    {items.map((item,idx)=>(
                      <li key={idx}>
                        {item.狙い目G数 && <span className="text-red-600 font-semibold">🎯 {item.狙い目G数}</span>}
                        {item.調整後G数 && closeGap!=='閉店時間非考慮' && searched && (
                          <span className="text-orange-600 ml-2">🕒 {closeGap}：{item.調整後G数}</span>
                        )}
                        {[item.条件,item.条件2,item.条件3].filter(Boolean).map((c,i)=>(
                          <div key={i} className="text-xs text-gray-600">{c}</div>
                        ))}
                        {item.補足 && <div className="text-xs text-gray-600">補足：{item.補足}</div>}
                      </li>))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : searched ? <p className="text-center text-sm text-gray-500">条件に合うデータが見つかりません。</p> : null}
    </main>
  );
}
