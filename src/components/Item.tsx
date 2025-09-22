import type { ItemSelection } from "../App";

interface ItemProps {
  item: ItemSelection;
  items: ItemSelection[];
  updateKey(i: ItemSelection[]): void;
}

const Item = ({ item, items, updateKey }: ItemProps) => {
  return (
    <div className="border-4 p-4 w-[47rem] my-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl">{item.item}</h2>
        <div
          className="text-red-300 hover:text-red-100 cursor-pointer"
          onClick={() => {
            const sans = items.filter((i) => i.item !== item.item);
            updateKey(sans);
          }}
        >
          DELETE
        </div>
      </div>
      <div className="flex">
        <p className="mr-2">Max Quantity (Tons): </p>
        <input
          className="text-green-300 border-b-2"
          value={item.maxQty}
          onChange={(e) => {
            const updated = items.map((i) => {
              if (i.item === item.item) {
                if (isNaN(Number(e.target.value))) {
                  return i;
                }
                return { ...i, maxQty: Number(e.target.value) };
              }
              return i;
            });
            updateKey(updated);
          }}
        />
      </div>
      <div className="flex">
        <p className="mr-2">Buy Coefficient: </p>
        <input
          className="text-green-300 border-b-2"
          value={item.buyCoefficent}
          onChange={(e) => {
            const updated = items.map((i) => {
              if (i.item === item.item) {
                if (isNaN(Number(e.target.value))) {
                  return i;
                }
                return { ...i, buyCoefficent: Number(e.target.value) };
              }
              return i;
            });
            updateKey(updated);
          }}
        />
      </div>
      <div className="flex">
        <p className="mr-2">Sell Modifier: </p>
        <input
          className="text-green-300 border-b-2"
          value={item.sellMod}
          onChange={(e) => {
            const updated = items.map((i) => {
              if (i.item === item.item) {
                return { ...i, sellMod: e.target.value };
              }
              return i;
            });
            updateKey(updated);
          }}
        />
      </div>
      <div className="opacity-50 text-sm">{JSON.stringify(item)}</div>
    </div>
  );
};

export default Item;
