function Plant(props) {
  const objectProperties = props.product
  const height = objectProperties.depth / props.scale
  const width = objectProperties.width / props.scale

  return (
    <>
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: '5px',
          backgroundSize: '100% 100%',
          backgroundImage: 'url(/plant.png)',
          zIndex: 3,
        }}
      ></div>
    </>
  )
}

export default Plant
