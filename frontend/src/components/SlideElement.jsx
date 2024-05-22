import React, {
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import styled from 'styled-components';
import ErrorModal from './Modal/ErrorModal';
import {
  LOCAL_HOST,
  STORE_PATH,
  TEXT_ELEMENT,
  IMAGE_ELEMENT,
  VIDEO_ELEMENT,
  CODE_ELEMENT
} from '../utils/constants';
import Textbox from './SlideElements/Textbox';
import Image from './SlideElements/Image';
import Video from './SlideElements/Video';
import CodeBlock from './SlideElements/CodeBlock';
import TextboxFormModal from './Modal/TextboxFormModal';
import CodeFormModal from './Modal/CodeFormModal';
import ImageFormModal from './Modal/ImageFormModal';
import { AppContext } from '../contexts/AppContext';
import axios from 'axios';
import VideoFormModal from './Modal/VideoFormModal';
import ResizeableMoveable from './ResizeableMoveable';

/**
 * Default container for elements mentioned in section 2.3
 */
const ElementContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  resize: none;
  cursor: ${(props) => (props?.modifiable ? 'move' : 'default')};
`;

/**
 * Wrapper for all the element types listed in section 2.3
 */
const SlideElement = forwardRef(
  (
    {
      elementObj,
      slide,
      broadcastModalOpen,
      broadcastModalClose,
      slideIndexOverhead,
      updateFontSelectionEnabled,
      preventDismissalClickSelector,
      setFontSelectionEnabled,
      modifiable = true
    },
    ref
  ) => {
    const { type, id, height, width, posX, posY } = elementObj;
    const { token, store, setStore } = useContext(AppContext);
    const [errorMessage, setErrorMessage] = useState('');
    const [showEditForm, setShowEditForm] = useState(false);
    const [dimensions, setDimensions] = useState({ width, height });

    /**
     * Function called when the element is double clicked to open the edit form
     * and broadcast the modal open event
     */
    const handleDoubleClick = () => {
      setShowEditForm(true);
      broadcastModalOpen();
    };

    /**
     * Function called when the element is right clicked to delete the element
     * and make an API request to update the store
     */
    const handleDeleteElement = useCallback(
      async (e) => {
        if (e.type === 'contextmenu') {
          e.preventDefault();
          const index = slide.elements.findIndex(
            (element) => element.id === id
          );
          slide.elements.splice(index, 1);
          try {
            await axios.put(
              LOCAL_HOST + STORE_PATH,
              { store },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            setFontSelectionEnabled();
            setStore({ ...store });
          } catch (err) {
            setErrorMessage('Error deleting element. Please refresh.');
          }
        }
      },
      [slide, store, token]
    );

    /**
     * Function called when the element is dragged to update the element's position
     * and make an API request to update the store
     */
    const handleUpdateElementPosition = useCallback(
      async (e, id) => {
        if (showEditForm) return;
        const element = slide.elements.find((element) => element.id === id);
        const rect = e.target.getBoundingClientRect();
        const leftDisplacement = rect.x - ref.current.getBoundingClientRect().x;
        const topDisplacement = rect.y - ref.current.getBoundingClientRect().y;
        element.posX = leftDisplacement < 0 ? 0 : leftDisplacement;
        element.posY = topDisplacement < 0 ? 0 : topDisplacement;
        try {
          await axios.put(
            LOCAL_HOST + STORE_PATH,
            { store },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setStore({ ...store });
        } catch (err) {
          setErrorMessage("Error updating element's position. Please refresh.");
        }
      },
      [slide, ref, store, token, showEditForm]
    );

    /**
     * Function called when the element is resized to update the element's size
     * and make an API request to update the store
     */
    const handleUpdateElementSize = useCallback(
      async (e, id, direction, ref, delta, position) => {
        const element = slide.elements.find((element) => element.id === id);
        element.posX = position.x;
        element.posY = position.y;
        element.width = (ref.offsetWidth / ref.parentElement.offsetWidth) * 100;
        element.height =
          (ref.offsetWidth / ref.parentElement.offsetWidth) * 100;
        try {
          await axios.put(
            LOCAL_HOST + STORE_PATH,
            { store },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          setStore({ ...store });
        } catch (err) {
          setErrorMessage("Error updating element's position. Please refresh.");
        }
      },
      [slide, store, token]
    );

    const element = useMemo(() => {
      if (type === TEXT_ELEMENT) {
        return <Textbox elementObj={elementObj} isPreview={!modifiable} />;
      } else if (type === CODE_ELEMENT) {
        return <CodeBlock elementObj={elementObj} isPreview={!modifiable} />;
      } else if (type === IMAGE_ELEMENT) {
        return <Image elementObj={elementObj} />;
      } else if (type === VIDEO_ELEMENT) {
        return <Video elementObj={elementObj} isPreview={!modifiable} />;
      }
    }, [type, elementObj, showEditForm, slide, elementObj?.font]);

    const modal = useMemo(() => {
      if (type === TEXT_ELEMENT) {
        return (
          <TextboxFormModal
            showForm={showEditForm}
            onHide={() => {
              setShowEditForm(false);
              broadcastModalClose();
            }}
            isEditing={true}
            slide={slide}
            updateDimensions={(dimension) => setDimensions(dimension)}
            {...elementObj}
          />
        );
      } else if (type === CODE_ELEMENT) {
        return (
          <CodeFormModal
            showForm={showEditForm}
            onHide={() => {
              setShowEditForm(false);
              broadcastModalClose();
            }}
            isEditing={true}
            slide={slide}
            updateDimensions={(dimension) => setDimensions(dimension)}
            {...elementObj}
          />
        );
      } else if (type === IMAGE_ELEMENT) {
        return (
          <ImageFormModal
            showForm={showEditForm}
            onHide={() => {
              setShowEditForm(false);
              broadcastModalClose();
            }}
            slide={slide}
            updateDimensions={(dimension) => setDimensions(dimension)}
            isEditing={true}
            {...elementObj}
          />
        );
      } else if (type === VIDEO_ELEMENT) {
        return (
          <VideoFormModal
            showForm={showEditForm}
            onHide={() => {
              setShowEditForm(false);
              broadcastModalClose();
            }}
            slide={slide}
            updateDimensions={(dimension) => setDimensions(dimension)}
            isEditing={true}
            {...elementObj}
          />
        );
      }
    }, [
      type,
      elementObj,
      showEditForm,
      slide,
      setShowEditForm,
      broadcastModalClose
    ]);
    return (
      <ResizeableMoveable
        layer={id}
        height={dimensions.height}
        width={dimensions.width}
        x={slideIndexOverhead ? posX : posX / 2}
        y={slideIndexOverhead ? posY : posY / 2}
        onDragStop={(e) => handleUpdateElementPosition(e, id)}
        onResizeStop={(e, direction, ref, delta, position) => {
          setDimensions({
            width: (ref.offsetWidth / ref.parentElement.offsetWidth) * 100,
            height: (ref.offsetHeight / ref.parentElement.offsetHeight) * 100
          });
          handleUpdateElementSize(e, id, direction, ref, delta, position);
        }}
        updateFontSelectionEnabled={updateFontSelectionEnabled}
        preventDismissalClickSelector={preventDismissalClickSelector}
        modifiable={modifiable}
      >
        <ElementContainer
          // we specify both onClick and onContextMenu for the browser to tell the difference
          // between a left and right click
          onClick={modifiable ? handleDeleteElement : () => {}}
          onContextMenu={modifiable ? handleDeleteElement : () => {}}
          onDoubleClick={modifiable ? handleDoubleClick : () => {}}
          modifiable={modifiable}
        >
          {element}
        </ElementContainer>
        <ErrorModal
          errorMessage={errorMessage}
          onHide={() => setErrorMessage('')}
        />
        {modal}
      </ResizeableMoveable>
    );
  }
);

SlideElement.displayName = 'SlideElement';

export default SlideElement;
