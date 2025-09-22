import { useCombobox } from "downshift";
import { useState } from "react";
interface AutocompleteProps {
  items: string[];
  onFormSelect(p1: string): void;
}
export default function Autocomplete({
  items,
  onFormSelect,
}: AutocompleteProps) {
  const [filteredItems, setFilteredItems] = useState(items);
  const [inputValue, setInputValue] = useState("");
  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    selectItem,
  } = useCombobox({
    items: filteredItems,
    inputValue,
    onInputValueChange: ({ inputValue }) => {
      setFilteredItems(
        items.filter((item) =>
          item.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
      setInputValue(inputValue ?? "");
    },
    onSelectedItemChange: ({ selectedItem }) => {
      selectItem(null);
      if (selectedItem) {
        onFormSelect(selectedItem);
        setInputValue("");
        setFilteredItems(items);
      }
    },
  });
  return (
    <div
      style={{ position: "relative", width: 250 }}
      className="text-green-300"
    >
      <input
        {...getInputProps({
          placeholder: "Search trade good",
          style: { width: "100%", padding: "6px" },
        })}
      />
      <ul
        {...getMenuProps()}
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          margin: 0,
          padding: 0,
          border: "1px solid",
          background: "white",
          listStyle: "none",
          zIndex: 10,
        }}
      >
        {isOpen &&
          filteredItems.map((item, index) => (
            <li
              key={item}
              {...getItemProps({ item, index })}
              className={`${
                highlightedIndex === index ? "bg-zinc-800" : "bg-zinc-900"
              }`}
              style={{ padding: "4px", cursor: "pointer" }}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
}
