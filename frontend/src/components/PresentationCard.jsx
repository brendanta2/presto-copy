import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PresentationContainer = styled.div`
  max-width: 300px;
  min-width: 100px;
  width: 300px;
  min-height: 50px;
  max-height: 150px;
  aspect-ratio: 2 / 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  white-space: nowrap;
  overflow: clip;
  margin: 10px;
  border: 1px solid black;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const PresentationThumbnailContainer = styled.div`
  width: 100%;
  height: 65%;
  position: relative;
`;

const PresentationThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultThumbnail = styled.div`
  background-color: gray;
  height: 100%;
  width: 100%;
`;

const StyledHeader = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  padding-left: 10px;
  ${(props) => !props.$hasDescription && 'margin-bottom: 15px;'}
`;

const StyledDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  padding: 0 0 5px 10px;
`;

const SlidesCountContainer = styled.div`
  position: absolute;
  z-index: 1;
  right: 5px;
  bottom: 5px;
  width: 20%;
  background-color: white;
  border-radius: 15px;
  text-align: center;
`;

/**
 * Card component to display presentations in the dashboard
 *
 * @param {
 *  title: string,
 *  description: string,
 *  thumbnail: string,
 *  numSlides: number,
 *  presId: number
 * }
 * @returns
 */
const PresentationCard = ({
  title,
  description,
  thumbnail,
  numSlides,
  presId
}) => {
  const navigate = useNavigate();

  // Display only the first 25 characters of the title and 35 characters of the description
  const displayTitle = title.length > 25 ? `${title.slice(0, 25)}...` : title;
  const displayDescription = !description
    ? null
    : description.length > 35
      ? `${description.slice(0, 35)}...`
      : description;

  return (
    <PresentationContainer onClick={() => navigate(`/edit/${presId}/0`)}>
      <PresentationThumbnailContainer>
        {thumbnail
          ? (
          <PresentationThumbnail src={thumbnail} alt="Presentation Thumbnail" />
            )
          : (
          <DefaultThumbnail aria-label="default-presentation-thumbnail" />
            )}
        <SlidesCountContainer>{numSlides}</SlidesCountContainer>
      </PresentationThumbnailContainer>
      <StyledHeader $hasDescription={!!displayDescription}>
        {displayTitle}
      </StyledHeader>
      {displayDescription && (
        <StyledDescription>{displayDescription}</StyledDescription>
      )}
    </PresentationContainer>
  );
};

export default PresentationCard;
