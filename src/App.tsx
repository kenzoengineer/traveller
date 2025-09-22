import { useState } from "react";
import { calculate, fCredits, tradeGoods, type Result } from "./data/calculate";
import Autocomplete from "./components/Autocomplete";
import Item from "./components/Item";

export interface ItemSelection {
  item: string;
  maxQty: number;
  buyCoefficent: number;
  sellMod: string;
}

function App() {
  const [selected, setSelected] = useState<ItemSelection[]>([]);

  const [cargoSpace, setCargoSpace] = useState("192");
  const [funds, setFunds] = useState("500000");

  const [result, setResult] = useState<Result | null>(null);

  const [loading, setLoading] = useState(false);

  const allTradeGoods = tradeGoods;

  const handleClick = () => {
    setLoading(true);
    try {
      const res = calculate(Number(cargoSpace), Number(funds), selected);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (s: string) => {
    console.log(s);
    setSelected([
      ...selected,
      {
        item: s,
        maxQty: 0,
        buyCoefficent: 100,
        sellMod: "0",
      } as ItemSelection,
    ]);
  };
  return (
    <div className="bg-zinc-900 text-green-100 p-10 min-h-screen">
      <div className="mb-10">
        <h1 className="text-6xl ">SPECULATIVE TRADING TERMINAL</h1>
      </div>
      <div className="flex">
        <div>
          <div>
            <div className="text-lg">Add an Item</div>
            <Autocomplete
              items={Object.values(allTradeGoods).map((obj) => obj.type)}
              onFormSelect={onSelect}
            />
          </div>
          <div className="flex flex-col w-[46rem] min-h-screen">
            {selected.length === 0 ? (
              <>
                <p className="my-10 text-red-300">ERROR: NO ITEMS SELECTED.</p>
              </>
            ) : (
              selected.map((item) => {
                return (
                  <Item item={item} items={selected} updateKey={setSelected} />
                );
              })
            )}
          </div>
        </div>
        <div className="border-l-2 pl-20 ml-20 flex flex-col">
          <div className="flex flex-row gap-x-10 mb-10">
            <div className="flex flex-col">
              <p className="text-lg">Cargo Space (Tons): </p>
              <input
                className="text-green-300 border-b-2"
                value={cargoSpace}
                onChange={(e) => {
                  setCargoSpace(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-lg">Funds Available (Cr): </p>
              <input
                className="text-green-300 border-b-2"
                value={funds}
                onChange={(e) => {
                  setFunds(e.target.value);
                }}
              />
            </div>
            <div
              className="border-2 h-min px-4 py-2 text-lg cursor-pointer hover:text-green-50"
              onClick={handleClick}
            >
              CALCULATE
            </div>
          </div>
          <div className="flex">
            {result && !loading && (
              <div>
                <div>
                  <div className="text-3xl flex items-center mb-5">
                    <p className="w-70 inline-block">Total Profit: </p>
                    <span
                      className={`${
                        result.profit > 0 ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {fCredits(result.profit)} Cr
                    </span>
                    <span className="opacity-50 text-sm pl-5">
                      ({result.profit})
                    </span>
                  </div>
                </div>
                <div className="mb-5">
                  {result.selections.map((selection) => {
                    return (
                      <div className="flex">
                        <p className="w-70">{selection.key}</p>
                        <p className="text-green-300 min-w-20">
                          {" "}
                          x {selection.qty}
                        </p>
                        <p className="text-green-300 opacity-50">
                          ({fCredits(selection.cost)} Cr)
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div className="text-md">
                    <p className="w-70 inline-block">Total Cargo Used: </p>
                    <span className="text-green-300">{result.cargoUsed} T</span>
                  </div>
                </div>
                <div>
                  <div className="text-md">
                    <p className="w-70 inline-block">Total Funds Used: </p>
                    <span className="text-green-300">
                      {fCredits(result.moneyUsed)} Cr
                    </span>
                  </div>
                </div>
              </div>
            )}
            {loading && <div>LOADING</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
