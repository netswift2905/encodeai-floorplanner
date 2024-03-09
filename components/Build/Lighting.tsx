function Lighting(props) {
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
          //   backgroundColor: colour,
          borderRadius: '5px',
          backgroundImage: 'url("/lighting.png")',
          zIndex: 3,
          backgroundSize: '100% 100%',
        }}
      ></div>
    </>
  )
}

export default Lighting
