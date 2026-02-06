import { useEffect, useState } from 'react'
import { Spinner, NonIdealState } from '@blueprintjs/core'
import { api } from '../api/client'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error) return <NonIdealState icon="error" title="Failed to load products" description={error} />
  if (!products.length) return <NonIdealState icon="shop" title="No products" />

  return (
    <>
      <h2>Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  )
}
