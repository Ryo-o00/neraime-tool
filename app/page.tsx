'use client';

import { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const matchPlus = raw.match(/^(\d+)[～~](\d+)\+@$/);
  if (matchPlus) {
    const from = parseInt(matchPlus[1]);
    const to = parseInt(matchPlus[2]);
    return `${from + added}～${to + added}+@`;
  }

  return raw;
}

const machineOptions = [
  '機種を選択',
  'L吉宗',
  'ミリマス',
  'Lゴジラ',
  'L絶対衝撃',
  'ULTRAMAN',
  'ギルクラ2',
  'ガンダムSEED',
  'よう実',
  'DMC5',
  'いざ番長',
  'L緑ドン',
  'マギレコ',
];
const stateOptions = ['リセ後', 'AT後'];
const investmentOptions = ['再プレイ', '46-52/460枚', '46-52/現金'];
const capitalOptions = ['20万円以上', '50万円以上', '100万円以上'];
const closeOptions = ['閉店時間非考慮', '閉店3h前', '閉店2h前', '閉店1h前'];

export default function Home() {
  const [data, setData] = useState<RowData[]>([]);
  const [machine, setMachine] = useState('');
  const [state, setState] = useState('');
  const [investment, setInvestment] = useState('');
  const [capital, setCapital] = useState('');
  const [closeGap, setCloseGap] = useState('閉店時間非考慮');
  const [results, setResults] = useState<RowData[]>([]);

  useEffect(() => {
    if (!machine || machine === '機種を選択') return;
    const map: Record<string, string> = {
      L吉宗: 'yoshimune',
      ミリマス: 'mirimasu',
      Lゴジラ: 'gojira',
      L絶対衝撃: 'zettai',
      ULTRAMAN: 'ultraman',
      ギルクラ2: 'guilty',
      ガンダムSEED: 'seed',
      よう実: 'youjitsu',
      DMC5: 'dmc5',
      いざ番長: 'izabancho',
      L緑ドン: 'midori',
      マギレコ: 'magireco',
    };
    fetch(`/neraime_l_${map[machine]}.json`).then((res) => res.json()).then(setData);
  }, [machine]);

  const parsePlus = (value: string | number | null | undefined) => {
    if (!value || value === '不明') return 0;
    const cleaned = value.toString().replace(/[^\d-]/g, '');
    const parsed = parseInt(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSearch = () => {
    const filtered = data
      .filter((item) => item.状態?.includes(state) && item.投資区分.replace('46/52', '46-52') === investment)
      .map((item) => {
        const base = item[`資金_${capital}`]?.toString().trim().replace(/[\s　]/g, '');

        const plusRaw =
          closeGap === '閉店3h前'
            ? item['閉店3h前加算']
            : closeGap === '閉店2h前'
            ? item['閉店2h前加算']
            : closeGap === '閉店1h前'
            ? item['閉店1h前加算']
            : null;

        if (closeGap !== '閉店時間非考慮' && plusRaw === '不明') {
          return { ...item, 狙い目G数: base, 調整後G数: '不明', 加算値: '不明' };
        }

        const 加算 =
          closeGap === '閉店3h前'
            ? parsePlus(item['閉店3h前加算'])
            : closeGap === '閉店2h前'
            ? parsePlus(item['閉店2h前加算'])
            : closeGap === '閉店1h前'
            ? parsePlus(item['閉店1h前加算'])
            : 0;

        const isPlain = /^((CZ|AT)間)?\d+$/i.test(base);
        const adjusted = closeGap === '閉店時間非考慮' || !isPlain ? undefined : adjustRange(base, 加算);

        return { ...item, 狙い目G数: base, 調整後G数: adjusted, 加算値: 加算 };
      });

    const filteredWithout540 = filtered.filter(item => parsePlus(item[`資金_${capital}`]) !== 540);
    const insertIndex = filteredWithout540.findIndex(item => item.条件 === '0スルー' && parsePlus(item[`資金_${capital}`]) >= 450);
    const insertData = filtered.find(item => parsePlus(item[`資金_${capital}`]) === 540);

    if (insertIndex !== -1 && insertData) {
      filteredWithout540.splice(insertIndex, 0, insertData);
    }

    setResults(filteredWithout540);
  };

  return (
    <main className="p-4 max-w-xl mx-auto text-sm">
      <h1 className="text-xl font-bold mb-4 text-center">狙い目早見表</h1>

      <div className="grid gap-3 mb-4">
        <select value={machine} onChange={(e) => setMachine(e.target.value)} className="border p-2 rounded">
          {machineOptions.map((opt) => (
            <option key={opt} value={opt === '機種を選択' ? '' : opt}>{opt}</option>
          ))}
        </select>
        <select value={state} onChange={(e) => setState(e.target.value)} className="border p-2 rounded">
          <option value="">状態を選択</option>
          {stateOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select value={investment} onChange={(e) => setInvestment(e.target.value)} className="border p-2 rounded">
          <option value="">投資区分を選択</option>
          {investmentOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select value={capital} onChange={(e) => setCapital(e.target.value)} className="border p-2 rounded">
          <option value="">資金帯を選択</option>
          {capitalOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select value={closeGap} onChange={(e) => setCloseGap(e.target.value)} className="border p-2 rounded">
          {closeOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">検索</button>
      </div>
    </main>
  );
}
