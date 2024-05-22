import React, { useContext, useMemo, useRef, useState } from 'react';
import AppNavBar from '../components/Navbar';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import { LOCAL_HOST, STORE_PATH } from '../utils/constants';
import { AppContext } from '../contexts/AppContext';
import PresentationCard from '../components/PresentationCard';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const DashboardMainContainer = styled.div`
  flex-grow: 2;
  width: 95%;
  padding: 20px;
  align-self: center;
`;

// Useful to style the button to help with mobile responsiveness
const DashboardCreateBtn = styled(Button)`
  margin-left: 20px;
`;

const PresentationCardsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

const PresentationsListContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const PresentationListHeader = styled.h2`
  margin-top: 20px;
  font-size: 1.5rem;
`;

/**
 * Dashboard page that displays the user's presentations and allows them to create new ones.
 */
const Dashboard = () => {
  const { token, store, setStore } = useContext(AppContext);
  const presNameInput = useRef();
  const presDescriptionInput = useRef();

  const [errorMessage, setErrorMessage] = useState('');
  const [storeLoading, setStoreLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /**
   * Function çalled when user submits the form to create a new presentation
   */
  const handleCreatePres = async () => {
    if (!presNameInput.current.value) {
      setErrorMessage('Name cannot be empty!');
      return;
    }

    setStoreLoading(true);
    const presName = presNameInput.current.value;
    const presDescription = presDescriptionInput.current.value;
    if (!store.presentations) {
      store.presIdCounter = 0;
      store.presentations = [
        {
          id: 0,
          name: presName,
          description: presDescription,
          thumbnail: null,
          slidesIdCounter: 1,
          slides: [
            {
              id: 0,
              elements: [],
              elementsIdCounter: 0,
              background: null
            }
          ],
          defaultBackground: {
            isGradient: false,
            color: '#ffffff'
          }
        }
      ];
    } else {
      store.presIdCounter++;
      store.presentations.push({
        id: store.presIdCounter,
        name: presName,
        description: presDescription,
        thumbnail: null,
        slidesIdCounter: 1,
        slides: [
          {
            id: 0,
            elements: [],
            elementsIdCounter: 0,
            background: null
          }
        ],
        defaultBackground: {
          isGradient: false,
          color: '#ffffff'
        }
      });
    }

    try {
      await axios.put(
        LOCAL_HOST + STORE_PATH,
        { store },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStore({ ...store });
      setShowCreateModal(false);
      setStoreLoading(false);
    } catch (err) {
      setErrorMessage('Invalid token for user. Please refresh.');
      setStoreLoading(false);
    }
  };

  // Create presentation cards and do not re-calculate unless
  // presentations is modified
  const presentationCards = useMemo(
    () =>
      store.presentations?.map((presentation) => {
        return (
          <PresentationCard
            key={presentation.id}
            title={presentation.name}
            description={presentation.description}
            thumbnail={presentation.thumbnail}
            numSlides={presentation.slides.length}
            presId={presentation.id}
          />
        );
      }),
    [store]
  );

  return (
    <DashboardContainer>
      <AppNavBar />
      <DashboardMainContainer>
        <PresentationsListContainer>
          <PresentationListHeader>Recent Presentations</PresentationListHeader>
          <div>
            <DashboardCreateBtn
              variant="warning"
              onClick={() => setShowCreateModal(true)}
              size="md"
            >
              New presentation
            </DashboardCreateBtn>
            <Modal
              show={showCreateModal}
              onHide={() => {
                setShowCreateModal(false);
                setErrorMessage('');
              }}
              size="lg"
              aria-labelledby="create-presentation-modal"
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title id="create-presentation-modal">
                  Let&apos;s cook 🍳
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {!!errorMessage && (
                  <Alert
                    variant="danger"
                    onClose={() => setErrorMessage('')}
                    dismissible
                  >
                    {errorMessage}
                  </Alert>
                )}
                <Form.Label>Presentation Name</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue="Untitled"
                  autoFocus
                  ref={presNameInput}
                />
                <Form.Label>Presentation Description</Form.Label>
                <Form.Control
                  type="text"
                  defaultValue=""
                  ref={presDescriptionInput}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="dark"
                  onClick={handleCreatePres}
                  disabled={storeLoading}
                >
                  {storeLoading
                    ? (
                    <Spinner animation="border" role="status" />
                      )
                    : (
                        'Create'
                      )}
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </PresentationsListContainer>
        <hr />
        <PresentationCardsContainer>
          {presentationCards}
        </PresentationCardsContainer>
      </DashboardMainContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
