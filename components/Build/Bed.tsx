function Bed(props) {
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
          borderRadius: '5px',
          backgroundColor: `${colour}`,
          backgroundSize: '100% 100%',
          backgroundImage: 'url(/doublebed.png)',
          zIndex: 3,
        }}
      ></div>
    </>
  )
}

export default Bed
