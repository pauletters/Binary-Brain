import React from 'react'
import Quiz from '../../client/src/components/Quiz.js'

describe('<Quiz />', () => {
  const mockQuestions = [
    {
      question: 'What is 2+2?',
      answers: [
        { text: '4', isCorrect: true },
        { text: '22', isCorrect: false },
        { text: '5', isCorrect: false },
        { text: '10', isCorrect: false }
      ]
    },
    {
      question: 'What color is the sky?',
      answers: [
        { text: 'Blue', isCorrect: true },
        { text: 'Green', isCorrect: false },
        { text: 'Yellow', isCorrect: false },
        { text: 'Red', isCorrect: false }
      ]
    }
  ]

  beforeEach(() => {
    cy.intercept('GET', '/api/questions/random', {
      statusCode: 200,
      body: mockQuestions
    }).as('getQuestions')
  })

  it('should render the Quiz component', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Quiz />)
    cy.get('button').contains('Start Quiz').click();
  });

  it('should start the quiz and display a random question', () => {
    cy.mount(<Quiz />);
    // Start the quiz on click
    cy.get('button').contains('Start Quiz').click();
    // Wait for the API call to complete
    cy.wait('@getQuestions');
    // Check if the question is displayed
    cy.get('h2').should('exist').and('have.text', mockQuestions[0].question);
    // Check if the answers are displayed
    mockQuestions[0].answers.forEach((answer) => {
      cy.contains('.alert', answer.text).should('exist')
    })
  });
});