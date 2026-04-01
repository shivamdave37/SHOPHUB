import { createContext, useContext, useEffect, useState } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareItems, setCompareItems] = useState([]);

  useEffect(() => {
    const storedItems = localStorage.getItem('shophub_compare_items');

    if (storedItems) {
      setCompareItems(JSON.parse(storedItems));
    }
  }, []);

  const persistItems = (items) => {
    setCompareItems(items);
    localStorage.setItem('shophub_compare_items', JSON.stringify(items));
  };

  const toggleCompare = (product) => {
    const exists = compareItems.some((item) => item.id === product.id);

    if (exists) {
      persistItems(compareItems.filter((item) => item.id !== product.id));
      return;
    }

    if (compareItems.length >= 4) {
      throw new Error('You can compare up to 4 products at a time');
    }

    persistItems([
      ...compareItems,
      {
        id: product.id,
        title: product.title,
        price: product.price,
        rating: product.rating,
        stock: product.stock,
        category_name: product.category_name,
        primary_image: product.primary_image,
        description: product.description
      }
    ]);
  };

  const removeCompareItem = (productId) => {
    persistItems(compareItems.filter((item) => item.id !== productId));
  };

  const clearCompare = () => {
    persistItems([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        toggleCompare,
        removeCompareItem,
        clearCompare
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  return useContext(CompareContext);
}
