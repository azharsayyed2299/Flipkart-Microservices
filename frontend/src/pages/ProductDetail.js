import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { fallbackImage } from '../utils/image';
import './ProductDetail.css';

function ProductDetail({ user, refreshCartCount }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const images = useMemo(() => (product?.images?.length ? product.images : [fallbackImage]), [product]);
  const specs = product?.specifications ? Object.entries(product.specifications) : [];

  const addToCart = async () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    try {
      await api.post(`/cart/${user.id}/items`, { productId: product._id, quantity });
      await refreshCartCount();
      setMessage('Added to cart successfully.');
      return true;
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add to cart');
      return false;
    }
  };

  const buyNow = async () => {
    const added = await addToCart();
    if (added) navigate('/cart');
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-detail page">
      <div className="product-images card">
        <div className="main-image"><img src={images[selectedImage]} alt={product.name} /></div>
        <div className="image-thumbnails">
          {images.map((img, index) => (
            <button key={img + index} className={selectedImage === index ? 'active' : ''} onClick={() => setSelectedImage(index)}>
              <img src={img} alt={`${product.name} ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="product-details card">
        <h1>{product.name}</h1>
        <div className="product-rating-detail"><span className="rating">⭐ {(product.rating || 0).toFixed(1)}</span><span>({product.numReviews || 0} reviews)</span></div>
        <div className="product-pricing">
          <span className="detail-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          {product.originalPrice && <span className="detail-original">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>}
          {product.discount > 0 && <span className="detail-discount">{product.discount}% off</span>}
        </div>
        <p className="tax-note">Inclusive of all taxes</p>

        <div className="product-actions">
          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
          </div>
          <button className="primary-btn" onClick={addToCart} disabled={product.stock === 0}>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</button>
          <button className="secondary-btn" onClick={buyNow} disabled={product.stock === 0}>Buy Now</button>
        </div>
        {message && <div className="detail-message">{message}</div>}

        <section className="detail-section"><h3>Description</h3><p>{product.description}</p></section>
        {specs.length > 0 && (
          <section className="detail-section"><h3>Specifications</h3><table><tbody>{specs.map(([key, value]) => <tr key={key}><td>{key}</td><td>{value}</td></tr>)}</tbody></table></section>
        )}
        <div className="product-meta"><p><strong>Category:</strong> {product.category}</p><p><strong>Brand:</strong> {product.brand || 'N/A'}</p><p><strong>Stock:</strong> {product.stock} units available</p></div>
      </div>
    </div>
  );
}

export default ProductDetail;
