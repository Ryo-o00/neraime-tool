'use client';

import { useEffect, useState } from 'react';

type RowData = {
  機種名: string;
  状態: string;
  投資条件: string;
  大見出し?: string;
  中見出し?: string;
  小見出し?: string;
  狙い目?: string | number;
  補足?: string;
  差枚?: string;
  その他条件?: string;
  その他条件2?: string;
  ツール?: string;
  PASS?: string;
  ツール2?: string;
  PASS2?: string;
  ['打ち方、示唆など']?: string;
  [key: string]: any;
};

export default function Home() {
  const [data, setData] = useState<RowData[]>([]);
  const [machine, setMachine] = useState('');
  const [state, setState] = useState('');
  const [investment, setInvestment] = useState('');
  const [results, setResults] = useState<RowData[]>([]);
  const [searched, setSearched] = useState(false);
  const [howToUrl, setHowToUrl] = useState<string | null>(null);

  const machineOptions = [
    '機種を選択',
    '沖ドキ！GOLD',
    'からくりサーカス',
    'L北斗の拳',
    'モンキーターンV',
    'ゴッドイーター',
    'かぐや様は告らせたい',
    'モンスターハンターライズ',
    'スーパーブラックジャック',
    'L東京喰種',
    'Lバイオ5',
    'マギアレコード',
    '機動戦士ガンダムSEED',
    '緑ドンVIVA！情熱南米編REVIVAL',
    'ようこそ実力至上主義の教室へ',
    'L吉宗',
    'L麻雀物語',
    'いざ！番長',
    'デビルメイクライ5',
    'ギルティクラウン2',
    'ULTRAMAN',
    'わたしの幸せな結婚'
  ];

  const stateOptions = ['リセ後', 'AT後'];
  const investmentOptions = ['メダル無限', '46-52/メダル460枚', '46-52/現金投資'];

  useEffect(() => {
    fetch('/neraime_list.json')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  useEffect(() => {
    if (machine && data.length > 0) {
      const match = data.find(item => item.機種名 === machine && item['打ち方、示唆など']);
      setHowToUrl(match?.['打ち方、示唆など'] || null);
    } else {
      setHowToUrl(null);
    }
  }, [machine, data]);

  const handleSearch = () => {
    const filtered = data.filter(item =>
      item.機種名 === machine &&
      item.状態?.includes(state) &&
      item.投資条件 === investment
    );

    setResults(filtered);
    setSearched(true);
  };

  const groupedResults = results.reduce<{
    [major: string]: { [middle: string]: { [minor: string]: RowData[] } };
  }>((acc, item) => {
    const major = item.大見出し || '';
    const middle = item.中見出し || '';
    const minor = item.小見出し || '全体';

    if (!acc[major]) acc[major] = {};
    if (!acc[major][middle]) acc[major][middle] = {};
    if (!acc[major][middle][minor]) acc[major][middle][minor] = [];
    acc[major][middle][minor].push(item);

    return acc;
  }, {});

  return (
    <main className="p-4 max-w-xl mx-auto text-sm">
      <h1 className="text-xl font-bold mb-4 text-center">狙い目早見表</h1>

      <div className="grid gap-3 mb-4">
        <select value={machine} onChange={(e) => setMachine(e.target.value)} className="border p-2 rounded">
          {machineOptions.map((opt, idx) => (
            <option key={idx} value={opt === '機種を選択' ? '' : opt}>{opt}</option>
          ))}
        </select>

        {howToUrl && (
          <div className="text-sm text-blue-600 underline text-center mb-1">
            <a href={howToUrl} target="_blank" rel="noopener noreferrer">
              打ち方や各種示唆はこちら
            </a>
          </div>
        )}

        <select value={state} onChange={(e) => setState(e.target.value)} className="border p-2 rounded">
          <option value="">状態を選択</option>
          {stateOptions.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>

        <select value={investment} onChange={(e) => setInvestment(e.target.value)} className="border p-2 rounded">
          <option value="">投資条件を選択</option>
          {investmentOptions.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white py-2 rounded"
          disabled={!state || !investment || !machine}
        >
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

                      

                      <ul className="list-disc pl-5 space-y-1">
                        {items.map((item, idx) => (
                          <li key={idx}>
{item.狙い目 != null && (
  <span className="text-red-600 font-semibold">🎯 {item.狙い目}</span>
)}

{item.差枚 && (
  <div className="text-sm font-bold text-red-600 mb-1">
    差枚：{item.差枚}
  </div>
)}


                            {[item.その他条件, item.その他条件2]
                              .filter(Boolean)
                              .map((c, i) => (
                                <div key={i} className="text-xs text-gray-600">{c}</div>
                              ))}
                            {item.補足 && <div className="text-xs text-gray-600">補足：{item.補足}</div>}

{item.ツール && (
  <div className="text-xs text-blue-600 underline">
    <a href={item.ツール} target="_blank" rel="noopener noreferrer">
      ツールはこちら
    </a>
    {item.PASS && <span className="ml-2 text-gray-700">（PASS: {item.PASS}）</span>}
  </div>
)}

{item.ツール2 && (
  <div className="text-xs text-blue-600 underline mt-1">
    <a href={item.ツール2} target="_blank" rel="noopener noreferrer">
      ツール2はこちら
    </a>
    {item.PASS2 && <span className="ml-2 text-gray-700">（PASS2: {item.PASS2}）</span>}
  </div>
)}
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
