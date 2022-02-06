import React from 'react';
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline,
} from 'react-icons/md';

import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../util/format';
import { Container, ProductTable, Total } from './styles';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();

  const cartFormatted = cart.map((product) => {
    return {
      ...product,
      priceFormatted: formatPrice(product.price),
      subTotal: formatPrice(product.amount * product.price),
    };
  });
  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      return (sumTotal += product.amount * product.price);
    }, 0)
  );

  function handleProductIncrement({ id: productId, amount }: Product) {
    updateProductAmount({ productId, amount: amount + 1 });
  }

  function handleProductDecrement({ id: productId, amount }: Product) {
    updateProductAmount({ productId, amount: amount - 1 });
  }

  async function handleRemoveProduct(productId: number) {
    await removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted && cartFormatted.length
            ? cartFormatted.map((product) => {
                const {
                  image,
                  title,
                  priceFormatted: price,
                  amount,
                  id,
                  subTotal,
                } = product;
                return (
                  <tr data-testid="product" key={id}>
                    <td>
                      <img src={image} alt={title} />
                    </td>
                    <td>
                      <strong>{title}</strong>
                      <span>{price}</span>
                    </td>
                    <td>
                      <div>
                        <button
                          type="button"
                          data-testid="decrement-product"
                          disabled={product.amount <= 1}
                          onClick={() => handleProductDecrement(product)}
                        >
                          <MdRemoveCircleOutline size={20} />
                        </button>
                        <input
                          type="text"
                          data-testid="product-amount"
                          readOnly
                          value={amount}
                        />
                        <button
                          type="button"
                          data-testid="increment-product"
                          onClick={() => handleProductIncrement(product)}
                        >
                          <MdAddCircleOutline size={20} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <strong>{subTotal}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        data-testid="remove-product"
                        onClick={async () =>
                          await handleRemoveProduct(product.id)
                        }
                      >
                        <MdDelete size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })
            : null}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
