import styled from 'styled-components';

export const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FormContainerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 30px 10px;
  height: 60%;
  width: 60%;
  border-radius: 20px;

  @media (max-width: 1000px) {
    width: 90%;
    height: 90%;
  }
`;

export const FormContainer = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
`;

export const FormHeading = styled.h1`
  padding-bottom: 15px;
`;

export const AlternativePromo = styled.p`
  padding-top: 20px;
  opacity: 75%;
  font-size: 0.9rem;
  margin: 0;
`;
