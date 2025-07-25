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
  大カテゴリ?: string;
  中カテゴリ?: string;
  小カテゴリ?: string;
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

  const matchPlusRange = raw.match(/^(\d+)[～~](\d+)\+@$/);
  if (matchPlusRange) {
    const from = parseInt(matchPlusRange[1]);
    const to = parseInt(matchPlusRange[2]);
    return `${from + added}～${to + added}+@`;
  }

  const matchPt = raw.match(/^(\d+)pt$/);
  if (matchPt) {
    const num = parseInt(matchPt[1]);
    return `${num + added}pt`;
  }

  const matchPtRange = raw.match(/^(\d+)[～~](\d+)pt$/);
  if (matchPtRange) {
    const from = parseInt(matchPtRange[1]);
    const to = parseInt(matchPtRange[2]);
    return `${from + added}～${to + added}pt`;
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

  const machineOptions = [
    '機種を選択',
    'わた婚',
    'L絶対衝撃',
      'DMC5',
      'ULTRAMAN',
      'いざ番長',
      'ギルクラ2',
      'ガンダムSEED',
      'よう実',
      'L緑ドン',
      'L吉宗',
      'ミリマス',
      'Lうしとら',
      'Lゴジラ',
      'マギレコ',
      'Lバイオ5',
      'Lカイジ',
      '東京喰種',
      'スーパーブラックジャック',
      'Lスーパービンゴネオ',
      'ダンベル',
      'モンハンライズ',
      'かぐや様',
      'イーター',
      'L炎炎',
      '番長4',
      'チバリヨ2',
      'モンキーV',
      '乙女4',
      'L北斗',
      'からくりサーカス',
      'ヴヴヴ'
  ];

  const stateOptions = ['リセ後', 'AT後'];
  const investmentOptions = ['再プレイ', '46-52/460枚', '46-52/現金'];
  const capitalOptions = ['20万円以上', '50万円以上', '100万円以上'];
  const closeOptions = ['閉店時間非考慮', '閉店3h前', '閉店2h前', '閉店1h前'];

  useEffect(() => {
    if (!machine || machine === '機種を選択') return;
    const map: { [key: string]: string } = {
      'わた婚': 'watakon',
      'L絶対衝撃': 'zettai',
      'DMC5': 'dmc5',
      'ULTRAMAN': 'ultraman',
      'いざ番長': 'izabancho',
      'ギルクラ2': 'guilty',
      'ガンダムSEED': 'seed',
      'よう実': 'youjitsu',
      'L緑ドン': 'midori',
      'L吉宗': 'yoshimune',
      'ミリマス': 'mirimasu',
      'Lうしとら': 'ushitora',
      'Lゴジラ': 'gojira',
      'マギレコ': 'magireco',
      'Lバイオ5': 'bio5',
      'Lカイジ': 'kaiji',
      '東京喰種': 'tokyoghoul',
      'スーパーブラックジャック': 'sbj',
      'Lスーパービンゴネオ': 'superbingo',
      'ダンベル': 'dumbbell',
      'モンハンライズ': 'rise',
      'かぐや様': 'kaguya',
      'イーター': 'eater',
      'L炎炎': 'enen',
      '番長4': 'bancho4',
      'チバリヨ2': 'chibariyo2',
      'モンキーV': 'monkeyv',
      '乙女4': 'otome4',
      'L北斗': 'hokuto',
      'からくりサーカス': 'karakuri',
      'ヴヴヴ': 'vvv'
    };
    fetch(`/neraime_l_${map[machine]}.json`)
      .then(res => res.json())
      .then(json => setData(json));
  }, [machine]);

const parsePlus = (value: string | number | null | undefined) => {
  if (!value || value === '不明') return 0;
  const cleaned = value.toString().replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

  const handleSearch = () => {
  console.log('検索条件', { state, investment, capital, closeGap, machine });
  console.log('データ件数', data.length);
  console.log('データサンプル', data[0]);

  setSearched(true);

  const filtered = data
    .filter(item =>
      item.状態?.includes(state) &&
      item.投資区分.replace('46/52', '46-52') === investment
    )
    .map(item => {
      const baseValue = item[`資金_${capital}`]?.toString().trim().replace(/[\s　]/g, '');
      // ❷ plusRaw 取得はそのまま
const plusRaw = closeGap === '閉店3h前' ? item['閉店3h前加算'] :
                closeGap === '閉店2h前' ? item['閉店2h前加算'] :
                closeGap === '閉店1h前' ? item['閉店1h前加算'] : null;

// ❸ 「不明」or「狙えない」or「要調整」をまとめて処理
const isInvalid = plusRaw === '不明' || plusRaw === '狙えない' || plusRaw === '要調整';

if (closeGap !== '閉店時間非考慮' && isInvalid) {
  return {
    ...item,
    狙い目G数: baseValue,
    調整後G数: plusRaw,   // ← '不明' または '狙えない' をそのまま
    加算値: plusRaw        // ← 同上
  };
}

// ❹ ここから下は通常ケース（数値加算）
const 加算 = closeGap === '閉店3h前' ? parsePlus(item['閉店3h前加算']) :
             closeGap === '閉店2h前' ? parsePlus(item['閉店2h前加算']) :
             closeGap === '閉店1h前' ? parsePlus(item['閉店1h前加算']) : 0;

const isAdjustable = /^((CZ|AT)間)?\d+(pt)?$/i.test(baseValue);
const 調整後G数 = (closeGap === '閉店時間非考慮' || !isAdjustable)
  ? undefined
  : adjustRange(baseValue, 加算);

return {
  ...item,
  狙い目G数: baseValue,
  調整後G数,
  加算値: 加算
};

    });

  setResults(filtered);
};

  const groupedResults = results.reduce<{
  [major: string]: { [middle: string]: { [minor: string]: RowData[] } };
}>((acc, item) => {
  const major = item.大カテゴリ || 'その他';
  const middle = item.中カテゴリ || '';

  // 小カテゴリがあれば使用、なければ "全体"
  const minor = item.小カテゴリ?.trim() || '全体';

  // 三重のオブジェクト構造作成
  if (!acc[major]) acc[major] = {};
  if (!acc[major][middle]) acc[major][middle] = {};
  if (!acc[major][middle][minor]) acc[major][middle][minor] = [];

  acc[major][middle][minor].push(item);
  return acc;
}, {});          // ← 初期値あり（第2引数）

  return (
  <main className="p-4 max-w-xl mx-auto text-sm">
    <h1 className="text-xl font-bold mb-4 text-center">狙い目早見表</h1>

    <div className="grid gap-3 mb-4">
      <select value={machine} onChange={(e) => setMachine(e.target.value)} className="border p-2 rounded">
        {machineOptions.map((opt, idx) => (
          <option key={idx} value={opt === '機種を選択' ? '' : opt}>{opt}</option>
        ))}
      </select>

      <select value={state} onChange={(e) => setState(e.target.value)} className="border p-2 rounded">
        <option value="">状態を選択</option>
        {stateOptions.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>

      <select value={investment} onChange={(e) => setInvestment(e.target.value)} className="border p-2 rounded">
        <option value="">投資区分を選択</option>
        {investmentOptions.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>

      <select value={capital} onChange={(e) => setCapital(e.target.value)} className="border p-2 rounded">
        <option value="">資金帯を選択</option>
        {capitalOptions.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>

      <select value={closeGap} onChange={(e) => setCloseGap(e.target.value)} className="border p-2 rounded">
        {closeOptions.map((opt, idx) => (
          <option key={idx} value={opt}>{opt}</option>
        ))}
      </select>

      <button onClick={handleSearch} className="bg-blue-600 text-white py-2 rounded" disabled={!state || !investment || !capital}>
        検索
      </button>
    </div>

    {searched && Object.keys(groupedResults).length > 0 ? (
      <div className="grid gap-6">
        {Object.entries(groupedResults).map(([major, middleGroups]) => (
          <div key={major} className="border rounded-xl p-4 shadow-md bg-white">
            <h2 className="font-bold text-base mb-3">{major}</h2>

            {Object.entries(middleGroups).map(([middle, minorGroups]) => (
              <div key={middle} className="pl-3 border-l-4 border-blue-300 mb-4">
                <h3 className="text-base font-semibold mb-2">{middle}</h3>

                {Object.entries(minorGroups).map(([minor, items]) => (
                  <div key={minor} className="mb-3 ml-4">
                    {minor !== '全体' && <h4 className="text-sm font-bold mb-1">{minor}</h4>}

                    {items[0]?.参考リンク && (
                      <div className="text-xs text-blue-600 underline mb-1">
                        <a href={items[0].参考リンク} target="_blank" rel="noopener noreferrer">
                          打ち方や各種示唆はこちら
                        </a>
                      </div>
                    )}

                    <ul className="list-disc pl-5 space-y-1">
                      {items.map((item, idx) => (
                        <li key={idx}>
                          {item.狙い目G数 && (
                            <span className="text-red-600 font-semibold">🎯 {item.狙い目G数}</span>
                          )}
                          {item.調整後G数 && closeGap !== '閉店時間非考慮' && searched && (
                            <span className="text-orange-600 ml-2">🕒 {closeGap}：{item.調整後G数}</span>
                          )}
                          {[item.条件, item.条件2, item.条件3, item.条件4]
                            .filter(Boolean)
                            .map((c, i) => (
                              <div key={i} className="text-xs text-gray-600">{c}</div>
                            ))}
                          {item.補足 && <div className="text-xs text-gray-600">補足：{item.補足}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : searched ? (
      <p className="text-center text-sm text-gray-500">条件に合うデータが見つかりません。</p>
    ) : null}
  </main>
);

}
