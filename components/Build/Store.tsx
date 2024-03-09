function Store(props) {
  const objectProperties = props.product
  const height = objectProperties.depth / props.scale
  const width = objectProperties.width / props.scale

  const colour = objectProperties.colour

  return (
    <>
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: colour,
          borderRadius: '5px',
          backgroundImage: 'url("/storage.png")',
          backgroundSize: 'contain',
          zIndex: 3,
        }}
      ></div>
    </>
  )
}

export default Store
