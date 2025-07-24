import { useState, useEffect } from 'react';

const kanaGroups = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<string[]>([]);
  const [machine, setMachine] = useState('');
  const [kana, setKana] = useState('');
  const [state, setState] = useState('');
  const [investment, setInvestment] = useState('');
  const [capital, setCapital] = useState('');
  const [closeGap, setCloseGap] = useState('閉店時間非考慮');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const allMachines = [
    'わた婚', 'L絶対衝撃', 'DMC5', 'ULTRAMAN', 'いざ番長', 'ギルクラ2', 'ガンダムSEED',
    'よう実', 'L緑ドン', 'L吉宗', 'ミリマス', 'Lうしとら', 'Lゴジラ', 'マギレコ', 'Lバイオ5',
    'Lカイジ', '東京喰種', 'スーパーブラックジャック', 'Lスーパービンゴネオ', 'ダンベル',
    'モンハンライズ', 'かぐや様', 'イーター', 'L炎炎', '番長4', 'チバリヨ2', 'モンキーV',
    '乙女4', 'L北斗', 'からくりサーカス', 'ヴヴヴ'
  ];

  const machineMap: { [key: string]: string } = {
    'わた婚': 'watakon', 'L絶対衝撃': 'zettai', 'DMC5': 'dmc5', 'ULTRAMAN': 'ultraman',
    'いざ番長': 'izabancho', 'ギルクラ2': 'guilty', 'ガンダムSEED': 'seed', 'よう実': 'youjitsu',
    'L緑ドン': 'midori', 'L吉宗': 'yoshimune', 'ミリマス': 'mirimasu', 'Lうしとら': 'ushitora',
    'Lゴジラ': 'gojira', 'マギレコ': 'magireco', 'Lバイオ5': 'bio5', 'Lカイジ': 'kaiji',
    '東京喰種': 'tokyoghoul', 'スーパーブラックジャック': 'sbj', 'Lスーパービンゴネオ': 'superbingo',
    'ダンベル': 'dumbbell', 'モンハンライズ': 'rise', 'かぐや様': 'kaguya', 'イーター': 'eater',
    'L炎炎': 'enen', '番長4': 'bancho4', 'チバリヨ2': 'chibariyo2', 'モンキーV': 'monkeyv',
    '乙女4': 'otome4', 'L北斗': 'hokuto', 'からくりサーカス': 'karakuri', 'ヴヴヴ': 'vvv'
  };

  const handleKanaSelect = (k: string) => {
    setKana(k);
    const filtered = allMachines.filter(name => name.startsWith(k));
    setFilteredMachines(filtered);
    setMachine('');
  };

  useEffect(() => {
    if (!machine) return;
    fetch(`/neraime_l_${machineMap[machine]}.json`)
      .then(res => res.json())
      .then(json => setData(json));
  }, [machine]);

  const handleSearch = () => {
    const filtered = data.filter(d => d.状態 === state && d.投資区分 === investment && d[`資金_${capital}`]);
    setResults(filtered);
    setSearched(true);
  };

  return (
    <main className="p-4 max-w-xl mx-auto text-sm">
      <h1 className="text-xl font-bold mb-4 text-center">狙い目早見表</h1>

      <div className="grid gap-2 mb-4 grid-cols-5">
        {kanaGroups.map(k => (
          <button key={k} onClick={() => handleKanaSelect(k)} className={`border p-2 rounded ${kana === k ? 'bg-blue-500 text-white' : ''}`}>{k}行</button>
        ))}
      </div>

      {kana && (
        <select value={machine} onChange={(e) => setMachine(e.target.value)} className="border p-2 rounded mb-4">
          <option value=''>機種を選択</option>
          {filteredMachines.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      )}

      <select value={state} onChange={(e) => setState(e.target.value)} className="border p-2 rounded mb-2">
        <option value=''>状態を選択</option>
        <option value='リセ後'>リセ後</option>
        <option value='AT後'>AT後</option>
      </select>

      <select value={investment} onChange={(e) => setInvestment(e.target.value)} className="border p-2 rounded mb-2">
        <option value=''>投資区分を選択</option>
        <option value='再プレイ'>再プレイ</option>
        <option value='46-52/460枚'>46-52/460枚</option>
        <option value='46-52/現金'>46-52/現金</option>
      </select>

      <select value={capital} onChange={(e) => setCapital(e.target.value)} className="border p-2 rounded mb-4">
        <option value=''>資金帯を選択</option>
        <option value='20万円以上'>20万円以上</option>
        <option value='50万円以上'>50万円以上</option>
        <option value='100万円以上'>100万円以上</option>
      </select>

      <button onClick={handleSearch} className="bg-blue-600 text-white py-2 rounded mb-4 w-full" disabled={!state || !investment || !capital}>検索</button>

      {searched && results.length > 0 ? (
        <div className="grid gap-6">
          {results.map((r, i) => (
            <div key={i} className="border rounded-xl p-4 shadow-md bg-white">
              <div className="text-xs text-blue-600 underline mb-1">
                {r.参考リンク && <a href={r.参考リンク} target="_blank">ツールはこちら</a>}
                {r.PASS && <div className="text-xs">PASS：{r.PASS}</div>}
                {r.PASS2 && <div className="text-xs">PASS2：{r.PASS2}</div>}
              </div>
              <div className="font-bold mb-1">🎯 {r[`資金_${capital}`]}</div>
              {r.差枚 && <div className="text-sm">差枚：{r.差枚}</div>}
              {r.その他条件 && <div className="text-sm">{r.その他条件}</div>}
              {r.その他条件2 && <div className="text-sm">{r.その他条件2}</div>}
            </div>
          ))}
        </div>
      ) : searched ? (
        <p className="text-center text-sm text-gray-500">条件に合うデータが見つかりませんでした。</p>
      ) : null}
    </main>
  );
}
