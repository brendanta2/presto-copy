import { render, screen } from '@testing-library/react';
import React from 'react';
import PresentationCard from '../components/PresentationCard';

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUseNavigate
}));

describe('PresentationCard', () => {
  const setup = (title, description, thumbnail, numSlides, presId) =>
    render(
      <PresentationCard
        title={title}
        description={description}
        thumbnail={thumbnail}
        numSlides={numSlides}
        presId={presId}
      />
    );

  it('shows title, description and numSlides correctly', () => {
    setup('presentation title', 'presentation description', '', 5, 1);
    expect(screen.getByText('presentation title')).toBeInTheDocument();
    expect(screen.getByText('presentation description')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('title is truncated to 25 characters', () => {
    setup('this is a very long title that should be truncated', '', '', 0, 1);
    expect(
      screen.getByText('this is a very long title...')
    ).toBeInTheDocument();
  });

  it('description is truncated to 35 characters', () => {
    setup(
      'title',
      'this is a very long description that should be truncated',
      '',
      0,
      1
    );
    expect(
      screen.getByText('this is a very long description tha...')
    ).toBeInTheDocument();
  });

  it('thumbnail is displayed if given', () => {
    setup('title', 'description', 'thumbnail', 0, 1);
    expect(screen.getByAltText('Presentation Thumbnail')).toBeInTheDocument();
  });

  it('default thumbnail is displayed if thumbnail is not given', () => {
    setup('title', 'description', '', 0, 1);
    expect(
      screen.getByLabelText('default-presentation-thumbnail')
    ).toBeInTheDocument();
  });

  it('navigates to correct path on click', () => {
    setup('title', 'description', '', 0, 1);
    screen.getByText('title').click();
    expect(mockUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockUseNavigate).toHaveBeenCalledWith('/edit/1/0');
  });
});
