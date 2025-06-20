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

export default function Home() {
  const [data, setData] = useState<RowData[]>([]);
  const [machine, setMachine] = useState('');
  const [state, setState] = useState('');
  const [investment, setInvestment] = useState('');
  const [capital, setCapital] = useState('');
  const [closeGap, setCloseGap] = useState('閉店時間非考慮');
  const [results, setResults] = useState<RowData[]>([]);
  const [searched, setSearched] = useState(false);

  const machineOptions = ['機種を選択', 'L吉宗', 'ミリマス', 'Lゴジラ', 'L絶対衝撃', 'ULTRAMAN', 'ギルクラ2', 'ガンダムSEED', 'よう実', 'DMC5', 'いざ番長', 'L緑ドン'];
  const stateOptions = ['リセ後', 'AT後'];
  const investmentOptions = ['再プレイ', '46/52/460枚', '46/52現金'];
  const capitalOptions = ['30万円以下', '50万円前後', '100万円以上'];
  const closeOptions = ['閉店時間非考慮', '閉店3h前', '閉店2h前', '閉店1h前'];

  useEffect(() => {
    if (!machine || machine === '機種を選択') return;
    const map: { [key: string]: string } = {
      'L吉宗': 'yoshimune',
      'ミリマス': 'mirimasu',
      'Lゴジラ': 'godzilla',
      'L絶対衝撃': 'zettai',
      'ULTRAMAN': 'ultraman',
      'ギルクラ2': 'guilty',
      'ガンダムSEED': 'seed',
      'よう実': 'youjitsu',
      'DMC5': 'dmc5',
      'いざ番長': 'izabancho',
      'L緑ドン': 'midori'
    };
    fetch(`/neraime_l_${map[machine]}.json`)
      .then(res => res.json())
      .then(json => setData(json));
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
      .filter(item => item.状態?.includes(state) && item.投資区分 === investment)
      .map(item => {
        const baseValue = item[`資金_${capital}`]?.toString().trim().replace(/[\s　]/g, '');

        const plusRaw = closeGap === '閉店3h前' ? item['閉店3h前加算'] :
                        closeGap === '閉店2h前' ? item['閉店2h前加算'] :
                        closeGap === '閉店1h前' ? item['閉店1h前加算'] : null;

        if (closeGap !== '閉店時間非考慮' && plusRaw === '不明') {
          return {
            ...item,
            狙い目G数: baseValue,
            調整後G数: '不明',
            加算値: '不明'
          };
        }

        const 加算 = closeGap === '閉店3h前' ? parsePlus(item['閉店3h前加算']) :
                     closeGap === '閉店2h前' ? parsePlus(item['閉店2h前加算']) :
                     closeGap === '閉店1h前' ? parsePlus(item['閉店1h前加算']) : 0;

        const isCZorAT = /^((CZ|AT)間)?\d+$/i.test(baseValue);
        const 調整後G数 = (closeGap === '閉店時間非考慮' || !isCZorAT) ? undefined : adjustRange(baseValue, 加算);

        return {
          ...item,
          狙い目G数: baseValue,
          調整後G数,
          加算値: 加算
        };
      });

    setResults(filtered);
  };

  return (
    <main className="p-4 max-w-xl mx-auto text-sm">
      <h1 className="text-xl font-bold mb-4 text-center">狙い目早見表</h1>

      <div className="grid gap-3 mb-4">
        <select value={machine} onChange={(e) => setMachine(e.target.value)} className="border p-2 rounded">
          {machineOptions.map((opt, idx) => <option key={idx} value={opt === '機種を選択' ? '' : opt}>{opt}</option>)}
        </select>

        <select value={state} onChange={(e) => setState(e.target.value)} className="border p-2 rounded">
          <option value="">状態を選択</option>
          {stateOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
        </select>

        <select value={investment} onChange={(e) => setInvestment(e.target.value)} className="border p-2 rounded">
          <option value="">投資区分を選択</option>
          {investmentOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
        </select>

        <select value={capital} onChange={(e) => setCapital(e.target.value)} className="border p-2 rounded">
          <option value="">資金帯を選択</option>
          {capitalOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
        </select>

        <select value={closeGap} onChange={(e) => setCloseGap(e.target.value)} className="border p-2 rounded">
          {closeOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
        </select>

        <button onClick={handleSearch} className="bg-blue-600 text-white py-2 rounded" disabled={!state || !investment || !capital}>検索</button>
      </div>

      {searched && results.length > 0 ? (
        <div className="grid gap-4">
          {results.map((item, idx) => (
            <div key={idx} className="border rounded-xl p-4 shadow-md bg-white">
              {item.条件 && <p><strong>条件：</strong>{item.条件}</p>}
              {item.条件2 && <p><strong>条件2：</strong>{item.条件2}</p>}
              {item.条件3 && <p><strong>条件3：</strong>{item.条件3}</p>}
              {item.条件4 && <p><strong>条件4：</strong>{item.条件4}</p>}
              {item.その他条件 && <p><strong>その他条件：</strong>{item.その他条件}</p>}
              {item.補足 && <p><strong>補足：</strong>{item.補足}</p>}
              <p className="text-red-600 font-bold">🎯 狙い目G数：{item.狙い目G数}</p>
              {item.調整後G数 && closeGap !== '閉店時間非考慮' && searched && (
                <p className="text-orange-600 font-bold">🕒 {closeGap}なら：{item.調整後G数}</p>
              )}
              {item.参考リンク && <a href={item.参考リンク} target="_blank" className="text-blue-500 underline mt-2 inline-block">🔗 詳細リンク</a>}
            </div>
          ))}
        </div>
      ) : searched ? (
        <p className="text-center text-sm text-gray-500">条件に合うデータが見つかりません。</p>
      ) : null}
    </main>
  );
}
