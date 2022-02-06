import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';
import { AxiosResponse } from 'axios';
import { isNumericLiteral } from 'typescript';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    sumAmount[product.id] = (sumAmount[product.id] || 0) + product.amount;
    return sumAmount;
  }, {} as CartItemsAmount);

  useEffect(() => {
    async function loadProducts() {
      const response = await api.get<Product[]>('products');
      setProducts([
        ...response.data.map<ProductFormatted>((p) => {
          return {
            ...p,
            priceFormatted: new Intl.NumberFormat('pt-BR', {
              currency: 'BRL',
              style: 'currency',
            }).format(p.price),
          };
        }),
      ]);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map(({ title, priceFormatted: price, image, id }) => {
        return (
          <li key={id}>
            <img src={image} alt="Tênis de Caminhada Leve Confortável" />
            <strong>{title}</strong>
            <span>{price}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {cartItemsAmount[id] || 0}
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        );
      })}
    </ProductList>
  );
};

export default Home;
