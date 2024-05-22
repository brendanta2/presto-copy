import React from 'react';
import { render, screen } from '@testing-library/react';
import FontSelect from '../components/FontSelect';

describe('FontSelect', () => {
  const setup = (selectedElementId, slide) => {
    render(<FontSelect selectedElementId={selectedElementId} slide={slide} />);
  };

  it('form rendered disabled for undefined selectElementId', () => {
    setup(undefined, null);
    const fontSelectForm = screen.getByRole('combobox', {
      name: /font-select/i
    });
    expect(fontSelectForm).toBeInTheDocument();
    expect(fontSelectForm).toBeDisabled();
  });

  it('form rendered enabled for defined selectElementId', () => {
    setup(1, null);
    const fontSelectForm = screen.getByRole('combobox', {
      name: /font-select/i
    });
    expect(fontSelectForm).toBeInTheDocument();
    expect(fontSelectForm).not.toBeDisabled();
  });

  it('form shows default option selected for unfound selectedElementId in slide', () => {
    setup(1, null);
    const fontSelectForm = screen.getByRole('combobox', {
      name: /font-select/i
    });
    expect(fontSelectForm.value).toBe('default');
  });

  it("form shows selected element's font", () => {
    setup(1, {
      id: 0,
      elements: [
        {
          id: 1,
          type: 'text',
          height: 50,
          width: 50,
          displayText: 'bruh',
          fontSize: '1',
          color: '#000000',
          posX: 0,
          posY: 0,
          font: 'Times New Roman'
        }
      ],
      elementsIdCounter: 2
    });
    const fontSelectForm = screen.getByRole('combobox', {
      name: /font-select/i
    });
    expect(fontSelectForm.value).toBe('Times New Roman');
  });
});
