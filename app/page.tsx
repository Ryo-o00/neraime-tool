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

/* ===== ここから追加：compact を展開するユーティリティ ===== */

const INVESTMENT_KEYS = ['メダル無限', '46-52/メダル460枚', '46-52/現金投資'] as const;
type InvestmentKey = typeof INVESTMENT_KEYS[number];

type CompactRule = {
  大見出し: string;
  補足?: string;
  その他条件?: string;
  その他条件2?: string;
  差枚?: string;
  ツール?: string;
  PASS?: string;
  ツール2?: string;
  PASS2?: string;
  中見出し?: string;
  小見出し?: string;
  状態?: Record<string, any>;
  リセ後?: any;
  AT後?: any;
};

type CompactMachine = {
  機種名: string;
  ID?: string;
  五十音?: string;
  ['打ち方、示唆など']?: string;
  ルール: CompactRule[];
};

const toStr = (v: any) => (v === undefined || v === null ? '' : String(v));

const isInvestmentMap = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  return INVESTMENT_KEYS.some((k) => k in obj && obj[k] !== undefined && obj[k] !== null);
};

const pickStates = (rule: CompactRule): Record<string, any> => {
  if (rule.状態 && typeof rule.状態 === 'object') return rule.状態 as Record<string, any>;
  const out: Record<string, any> = {};
  if (rule.リセ後) out['リセ後'] = rule.リセ後;
  if (rule.AT後) out['AT後'] = rule.AT後;
  return out;
};

const emitFromInvestmentMap = (params: {
  rows: RowData[];
  machine: CompactMachine;
  rule: CompactRule;
  stateKey: string;
  mid?: string;
  small?: string;
  invMap: Record<string, any>;
}) => {
  const { rows, machine, rule, stateKey, mid, small, invMap } = params;

  INVESTMENT_KEYS.forEach((invKey) => {
    if (invMap[invKey] === undefined) return;
    rows.push({
      機種名: machine.機種名,
      ID: machine.ID ?? '',
      五十音: machine.五十音 ?? '',
      状態: stateKey,
      投資条件: invKey,
      大見出し: rule.大見出し,
      中見出し: toStr(mid ?? rule.中見出し ?? ''),
      小見出し: toStr(small ?? rule.小見出し ?? ''),
      狙い目: toStr(invMap[invKey]),
      補足: toStr(rule.補足 ?? ''),
      差枚: toStr(rule.差枚 ?? ''),
      その他条件: toStr(rule.その他条件 ?? ''),
      その他条件2: toStr(rule.その他条件2 ?? ''),
      ツール: toStr(rule.ツール ?? ''),
      PASS: toStr(rule.PASS ?? ''),
      ツール2: toStr(rule.ツール2 ?? ''),
      PASS2: toStr(rule.PASS2 ?? ''),
      ['打ち方、示唆など']: toStr(machine['打ち方、示唆など'] ?? '')
    });
  });
};

const emitFromFixed = (params: {
  rows: RowData[];
  machine: CompactMachine;
  rule: CompactRule;
  stateKey: string;
  mid?: string;
  small?: string;
  fixed: any;
}) => {
  const { rows, machine, rule, stateKey, mid, small, fixed } = params;
  rows.push({
    機種名: machine.機種名,
    ID: machine.ID ?? '',
    五十音: machine.五十音 ?? '',
    状態: stateKey,
    投資条件: '', // 固定は投資条件に依存しない
    大見出し: rule.大見出し,
    中見出し: toStr(mid ?? rule.中見出し ?? ''),
    小見出し: toStr(small ?? rule.小見出し ?? ''),
    狙い目: toStr(fixed?.狙い目 ?? ''),
    補足: toStr(fixed?.補足 ?? rule.補足 ?? ''),
    差枚: toStr(fixed?.差枚 ?? rule.差枚 ?? ''),
    その他条件: toStr(fixed?.その他条件 ?? rule.その他条件 ?? ''),
    その他条件2: toStr(fixed?.その他条件2 ?? rule.その他条件2 ?? ''),
    ツール: toStr(rule.ツール ?? ''),
    PASS: toStr(rule.PASS ?? ''),
    ツール2: toStr(rule.ツール2 ?? ''),
    PASS2: toStr(rule.PASS2 ?? ''),
    ['打ち方、示唆など']: toStr(machine['打ち方、示唆など'] ?? '')
  });
};

const expandStateDef = (
  rows: RowData[],
  machine: CompactMachine,
  rule: CompactRule,
  stateKey: string,
  stateDef: any
) => {
  if (!stateDef || typeof stateDef !== 'object') return;

  // 直接 投資条件マップ
  if (isInvestmentMap(stateDef)) {
    emitFromInvestmentMap({ rows, machine, rule, stateKey, invMap: stateDef });
    return;
  }

  // 中見出し
  if (stateDef.中見出し && typeof stateDef.中見出し === 'object') {
    for (const mid of Object.keys(stateDef.中見出し)) {
      const val = stateDef.中見出し[mid];
      if (isInvestmentMap(val)) {
        emitFromInvestmentMap({ rows, machine, rule, stateKey, mid, invMap: val });
      } else if (val?.小見出し && typeof val.小見出し === 'object') {
        for (const small of Object.keys(val.小見出し)) {
          const inv = val.小見出し[small];
          if (isInvestmentMap(inv)) {
            emitFromInvestmentMap({ rows, machine, rule, stateKey, mid, small, invMap: inv });
          } else if (inv?.固定) {
            emitFromFixed({ rows, machine, rule, stateKey, mid, small, fixed: inv.固定 });
          }
        }
      } else if (val?.固定) {
        emitFromFixed({ rows, machine, rule, stateKey, mid, fixed: val.固定 });
      }
    }
  }

  // 小見出し単独
  if (stateDef.小見出し && typeof stateDef.小見出し === 'object') {
    for (const small of Object.keys(stateDef.小見出し)) {
      const inv = stateDef.小見出し[small];
      if (isInvestmentMap(inv)) {
        emitFromInvestmentMap({ rows, machine, rule, stateKey, small, invMap: inv });
      } else if (inv?.固定) {
        emitFromFixed({ rows, machine, rule, stateKey, small, fixed: inv.固定 });
      }
    }
  }

  // 固定のみ
  if (stateDef.固定) {
    emitFromFixed({ rows, machine, rule, stateKey, fixed: stateDef.固定 });
  }
};

function expandCompact(machines: CompactMachine[]): RowData[] {
  const rows: RowData[] = [];
  for (const machine of machines) {
    for (const rule of machine.ルール) {
      const states = pickStates(rule);
      for (const stateKey of Object.keys(states)) {
        expandStateDef(rows, machine, rule, stateKey, states[stateKey]);
      }
    }
  }
  return rows;
}
/* ===== 追加ここまで ===== */

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
    '甲鉄城のカバネリ',
    '沖ドキ！GOLD',
    '北斗の拳',
    'からくりサーカス',
    '戦国乙女4',
    'ラブ嬢3',
    'モンキーターンV',
    'チバリヨ！2',
    '押忍！番長4',
    'L炎炎の消防隊',
    'ToLOVEるダークネス',
    'ゴッドイーター リザレクション',
    'かぐや様は告らせたい',
    'Re:ゼロから始める異世界生活 season2',
    'モンスターハンターライズ',
    'スーパービンゴネオ',
    'ダンベル何キロ持てる？',
    '東京喰種',
    'スーパーブラックジャック',
    'バイオハザード5',
    'マギアレコード',
    '吉宗',
    '機動戦士ガンダムSEED',
    'デビルメイクライ5',
    'いざ！番長',
    'ギルティクラウン2',
    'ダーリン・イン・ザ・フランキス',
    'アズールレーン'
  ];

  const stateOptions = ['リセ後', 'AT後'];
  const investmentOptions = ['メダル無限', '46-52/メダル460枚', '46-52/現金投資'];

  // ここを compact 読み込みに変更
  useEffect(() => {
    fetch('/neraime_compact.json')
      .then(res => res.json())
      .then((json: CompactMachine[]) => {
        const flat = expandCompact(json);
        // 並び順を安定させたい場合はここで sort を入れる（任意）
        setData(flat);
      })
      .catch(() => {
        // フォールバック（任意）：旧フォーマットがあれば
        fetch('/neraime_list.json')
          .then(res => res.json())
          .then(json => setData(json));
      });
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

                            {[item.その他条件, item.その他条件2]
                              .filter(Boolean)
                              .map((c, i) => (
                                <div key={i} className="text-xs text-gray-600">{c}</div>
                              ))}

                            {item.差枚 && (
                              <div className="text-xs text-gray-600">
                                差枚：{item.差枚}
                              </div>
                            )}

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
