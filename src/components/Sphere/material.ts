import aladino from './../../scripts/aladino'
import vertex from './vert'
import fragment from './frag'

const material = aladino.material({
  vertex,
  fragment,
})

export default material
