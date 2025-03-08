
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container-custom py-12 text-center page-transition">
        <div className="max-w-md mx-auto">
          <ShoppingCart className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
          <h1 className="heading-lg mb-4">Your cart is empty</h1>
          <p className="paragraph mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/women">
            <Button className="px-8 py-6">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12 page-transition">
      <h1 className="heading-lg mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Cart Items */}
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
                <div className="sm:w-32 sm:h-32 overflow-hidden rounded-md">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  {item.selectedSize && (
                    <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 border rounded-md"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="px-2 py-1 border rounded-md"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clear Cart Button */}
          <Button
            variant="outline"
            className="mt-6"
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout">
            <Button className="w-full mt-6 py-6 group">
              <span>Checkout</span>
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Taxes and shipping calculated at checkout
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
