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
    '東京喰種'
  ];

  const stateOptions = ['リセ後', 'AT後'];
  const investmentOptions = ['再プレイ', '46-52/460枚', '46-52/現金'];
  const capitalOptions = ['20万円以上', '50万円以上', '100万円以上'];
  const closeOptions = ['閉店時間非考慮', '閉店3h前', '閉店2h前', '閉店1h前'];

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
      'マギレコ': 'magireco',
      '東京喰種': 'tokyoghoul'
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
      .filter(item => item.状態?.includes(state) && item.投資区分.replace('46/52', '46-52') === investment)
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

        const isAdjustable = /^((CZ|AT)間)?\d+(pt)?$/i.test(baseValue);
        const 調整後G数 = (closeGap === '閉店時間非考慮' || !isAdjustable) ? undefined : adjustRange(baseValue, 加算);

        return {
          ...item,
          狙い目G数: baseValue,
          調整後G数,
          加算値: 加算
        };
      });

    setResults(filtered);
  };

  const groupedResults = results.reduce<{ [key: string]: { [key: string]: RowData[] } }>((acc, item) => {
    const major = item.狙い分類 || 'その他';

    if (machine === '東京喰種') {
      const pt = item.中カテゴリ || item.条件4 || 'pt不明';
      const sur = item.条件 || 'スルー不明';
      if (!acc[pt]) acc[pt] = {};
      if (!acc[pt][sur]) acc[pt][sur] = [];
      acc[pt][sur].push(item);
      return acc;
    }

    const minorSource = item.中カテゴリ || item.条件4 || '';
    let minor = '';
    if (minorSource.includes('前回AT300枚以下')) {
      minor = '前回AT300枚以下';
    } else if (minorSource.includes('前回AT600枚以上')) {
      minor = '前回AT600枚以上';
    } else if (minorSource.includes('前回AT300枚以上') || minorSource.includes('前回AT300～600枚')) {
      minor = '前回AT300枚以上';
    }
    if (!acc[major]) acc[major] = {};
    const mid = minor || '全体';
    if (!acc[major][mid]) acc[major][mid] = [];
    acc[major][mid].push(item);
    return acc;
  }, {});

  return (/* unchanged UI part */);
}
