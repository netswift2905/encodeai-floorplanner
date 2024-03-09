function Sofa(props) {
  const objectProperties = props.product
  const sofaHeight = objectProperties.depth / props.scale
  const sofaWidth = objectProperties.width / props.scale

  const sofaColour = objectProperties.colour

  // checking for presence of the sections in the JSON, and using default values if not.
  const mainLength =
    objectProperties.additionalDetails.mainSection?.numberOfSeatCushions ?? 2
  const rightLength =
    objectProperties.additionalDetails.right?.numberOfSeatCushions ?? null
  const leftLength =
    objectProperties.additionalDetails.left?.numberOfSeatCushions ?? null

  const leftChaise = objectProperties.additionalDetails.left?.isChaise ?? false
  const rightChaise =
    objectProperties.additionalDetails.right?.isChaise ?? false

  const sideLength = Math.max(rightLength, leftLength) + 1

  return (
    // main section
    <div
      style={{
        width: `${sofaWidth}px`,
        height: `${sofaHeight}px`,
        // border: '2px solid blue',
        zIndex: 3,
        display: 'grid',
        gridTemplateColumns: `repeat(${mainLength}}, 1fr)`,
        gridTemplateRows: `repeat(${sideLength},1fr)`,
      }}
    >
      <div
        style={{
          gridArea: `1 / 1 / 2 / ${mainLength + 1}`,
          display: 'flex',
        }}
      >
        {Array.from({ length: mainLength }).map((_, i) => {
          const corner = []
          if (i + 1 === 1) {
            corner.push('left')
          }
          if (i + 1 === mainLength) {
            corner.push('right')
          }
          return (
            <SeatCushion
              key={i}
              corner={corner}
              section="main"
              sofaColour={sofaColour}
            />
          )
        })}
      </div>
      {/* left section */}
      <div
        style={{
          display: 'flex',
          gridArea: `2 / 1 / ${leftLength + 2} / 2`,
          flexDirection: 'column',
          // 2: 1 because of grid, 1 because of mainSection
        }}
      >
        {Array.from({ length: leftLength }).map((_, i) => (
          <SeatCushion
            key={i}
            section="left"
            chaise={leftChaise}
            sofaColour={sofaColour}
          />
        ))}
      </div>
      {/* right section  */}
      <div
        style={{
          display: 'flex',
          gridArea: `2 / ${mainLength} / ${rightLength + 2} / ${mainLength + 1}`,
          flexDirection: 'column',
        }}
      >
        {Array.from({ length: rightLength }).map((_, i) => (
          <SeatCushion
            key={i}
            section="right"
            chaise={rightChaise}
            sofaColour={sofaColour}
          />
        ))}
      </div>
    </div>
  )
}

function SeatCushion(props) {
  const sofaSeatRadius = 3
  const seatBorderColour = '#3C4142'
  let backrestHeight = '25%'
  let backrestWidth = 'calc(100% + 2px)' // add 2px because of the -1px margin all around
  let justify
  let backrestRadius = '0 0 6px 6px'
  let shadow = '0px 1px 1px rgba(0, 0, 0, 0.6)'
  const sofaCol = props.sofaColour

  // non-corner seats
  if (!props.corner || props.corner?.length === 0) {
    // vertical backrest
    if (props.section !== 'main') {
      backrestHeight = 'calc(100% + 2px)'
      backrestWidth = '25%'
      backrestRadius = '0 6px 6px 0'
      shadow = '1px 0px 1px rgba(0, 0, 0, 0.6)'
    }

    // align backrest
    if (props.section === 'right') {
      justify = 'flex-end'
      backrestRadius = '6px 0 0 6px'
      shadow = '-1px 0px 1px rgba(0, 0, 0, 0.6)'
    }

    return (
      <div
        style={{
          display: 'flex',
          border: `1px solid ${seatBorderColour}`,
          borderRadius: `${sofaSeatRadius}px`,
          flexGrow: 1,
          justifyContent: `${justify}`,
          backgroundColor: sofaCol,
        }}
      >
        {!props.chaise && (
          <div
            style={{
              height: backrestHeight,
              width: backrestWidth,
              border: `1px solid ${seatBorderColour}`,
              margin: '-1px',
              borderRadius: backrestRadius,
              // backgroundColor: 'rgba(0,137,0,1)',
              boxShadow: shadow,
            }}
          />
        )}
      </div>
    )
  }
  // corner seats
  return (
    <div
      style={{
        display: 'flex',
        border: `1px solid ${seatBorderColour}`,
        borderRadius: `${sofaSeatRadius}px`,
        flexGrow: 1,
        justifyContent: `${justify}`,
        backgroundColor: sofaCol,
        position: 'relative',
      }}
    >
      <div
        style={{
          height: '25%',
          width: 'calc(100% + 2px)',
          border: `1px solid ${seatBorderColour}`,
          margin: '-1px',
          borderRadius: backrestRadius,
          position: 'absolute',
          boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.6)',
          backgroundColor: 'inherit',
        }}
      >
        {/* overlapping div for corner border bits */}
        <div
          style={{
            backgroundColor: 'inherit',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            borderRadius: backrestRadius,
            zIndex: '3',
            position: 'relative',
          }}
        />
      </div>
      {props.corner?.includes('left') && (
        <div
          style={{
            height: 'calc(100% + 2px)',
            width: '25%',
            border: `1px solid ${seatBorderColour}`,
            margin: '-1px',
            borderRadius: backrestRadius,
            boxShadow: '1px 0px 1px rgba(0, 0, 0, 0.6)',
            backgroundColor: 'inherit',
            zIndex: '0',
          }}
        />
      )}

      {props.corner?.includes('right') && (
        <div
          style={{
            height: 'calc(100% + 2px)',
            width: '25%',
            border: `1px solid ${seatBorderColour}`,
            margin: '-1px',
            borderRadius: backrestRadius,
            marginLeft: 'auto',
            boxShadow: '-1px 0px 1px rgba(0, 0, 0, 0.6)',
            backgroundColor: 'inherit',
            zIndex: '2',
          }}
        />
      )}
    </div>
  )
}

export default Sofa
