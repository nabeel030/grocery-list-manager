import { createContext, useState } from 'react';

export const ItemsContext = createContext();

export const ItemsProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [itemsBought, setItemsBought] = useState([]);
    const [itemsTotal, setItemsTotal] = useState(0)
    const [itemsBoughtTotal, setItemsBoughtTotal] = useState(0)
  
    return (
      <ItemsContext.Provider value={{ items, setItems, itemsBought,  setItemsBought, itemsTotal, setItemsTotal, itemsBoughtTotal, setItemsBoughtTotal }}>
        {children}
      </ItemsContext.Provider>
    );
};

// export {
//   ItemsContext,
//   ItemsProvider
// }
  