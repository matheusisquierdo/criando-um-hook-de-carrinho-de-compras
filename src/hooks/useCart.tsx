import { AxiosResponse } from 'axios';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { isConstructorDeclaration } from 'typescript';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => Promise<void>;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

class StockAmountExpcetion {
  message: String = 'Quantidade solicitada fora de estoque';
  constructor(private productId: number, private value: number) {}

  toString() {
    return this.message;
  }
}

class ProductNotExists {
  message: String = 'Producto não existen no estoque';
  constructor(private productId: number) {}

  toString() {
    return this.message;
  }
}

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const getStock = async (productId: number) => {
    const responseStock = await api.get<{ productId: number; amount: number }>(
      `stock/${productId}`
    );
    return responseStock?.data;
  };

  const verifyStock = async (productId: number, amount: number) => {
    const stock = await getStock(productId);

    if (stock?.amount >= amount) return;

    throw new StockAmountExpcetion(productId, amount);
  };

  const updateStock = async (id: number, amount: number) => {
    // const stock = await getStock(id);

    // if (!stock) throw new ProductNotExists(id);

    // const responseStock = await api.patch<{
    //   productId: number;
    //   amount: number;
    // }>(`stock/${id}`, { amount: stock.amount + amount });

    return null; // responseStock?.data?.amount >= amount;
  };

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      //Verifica se existe o produto ja no cart
      const existsProduct = cart.findIndex((c) => c.id === productId);
      let newCart = [];

      if (existsProduct > -1) {
        const productInCart = cart[existsProduct];
        await verifyStock(productId, productInCart.amount + 1);
        newCart = [
          ...cart.slice(0, existsProduct),
          { ...cart[existsProduct], amount: cart[existsProduct].amount + 1 },
          ...cart.slice(existsProduct + 1),
        ];

        setCart(newCart);
      } else {
        await verifyStock(productId, 1);
        //Em caso de nao existir busca na api os dados dele
        const responseProductNew = await api.get<Product>(
          `products/${productId}`
        );
        newCart = [...cart, { ...responseProductNew.data, amount: 1 }];
        setCart(newCart);
      }

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

      await updateStock(productId, -1);
    } catch (e) {
      if (e instanceof StockAmountExpcetion)
        toast.error((e as StockAmountExpcetion).toString());
      else toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      const existsProduct = cart.findIndex((c) => c.id === productId);
      const productRemove = cart[existsProduct];
      if (existsProduct > -1) {
        const newCart = [
          ...cart.slice(0, existsProduct),
          ...cart.slice(existsProduct + 1),
        ];

        setCart(newCart);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }

      await updateStock(productId, productRemove.amount);
    } catch (e) {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) return;

      const existsProduct = cart.findIndex((c) => c.id === productId);

      await verifyStock(productId, amount);

      if (existsProduct > -1) {
        const newCart = [
          ...cart.slice(0, existsProduct),
          amount > 0 ? { ...cart[existsProduct], amount } : null,
          ...cart.slice(existsProduct + 1),
        ].filter(Boolean) as Product[];

        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }

      await updateStock(productId, -1);
    } catch (e) {
      if (e instanceof StockAmountExpcetion)
        toast.error((e as StockAmountExpcetion).toString());
      else toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addProduct,
        removeProduct,
        updateProductAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
