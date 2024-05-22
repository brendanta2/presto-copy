import styled from 'styled-components';

// Custom slide component can modify as desired
const Slide = styled.div`
  background: ${(props) => props?.background};
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 85vh;
`;

export default Slide;
