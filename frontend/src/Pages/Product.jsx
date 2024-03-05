import React, { useContext } from 'react'
import { ShopContext } from '../Context/ShopContext'
import { useParams } from 'react-router-dom'
import { Breadcrumb } from '../Components/Breadcrumbs/Breadcrumb'
import { ProductDisplay } from '../Components/ProductDisplay/ProductDisplay'
import { DescriptionBox } from '../Components/DescriptionBox/DescriptionBox'
import { RelatedProducts } from '../Components/RelatedProducts/RelatedProducts'
const Product = () => {
  const {allProducts}=useContext(ShopContext)
  const {productId}=useParams();
  const product=allProducts.find((e)=>e.id===Number(productId))

  return (
    <div>
      <Breadcrumb product={product}></Breadcrumb>
      <ProductDisplay product={product}></ProductDisplay>
      <DescriptionBox></DescriptionBox>
      <RelatedProducts></RelatedProducts>
    </div>
  )
}

export default Product