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

  it('should progress through questions when answers are clicked', () => {
    cy.mount(<Quiz />);
    cy.get('button').contains('Start Quiz').click();
    cy.wait('@getQuestions');
    // Answer the first question
    cy.get('.btn-primary').first().click();
    // Check if the next question is displayed
    cy.get('h2').should('exist').and('have.text', mockQuestions[1].question);
  });

  it('should display the quiz results when all questions are answered', () => {
    cy.mount(<Quiz />);
    cy.get('button').contains('Start Quiz').click();
    cy.wait('@getQuestions');
    // Answer all questions
    mockQuestions.forEach(() => {
      cy.get('.btn-primary').first().click();
    });
    // Check if the quiz results are displayed
    cy.contains('h2', 'Quiz Completed').should('exist');
    cy.contains('.alert', `Your score: ${mockQuestions.length}/${mockQuestions.length}`).should('exist');
  });

  it ('should allow the user to start a new quiz after completing one', () => {
    cy.mount(<Quiz />);
    cy.get('button').contains('Start Quiz').click();
    cy.wait('@getQuestions');
    // Answer all questions
    mockQuestions.forEach(() => {
      cy.get('.btn-primary').first().click();
    });
     // Check if the quiz results are displayed
     cy.contains('h2', 'Quiz Completed').should('exist');
     cy.contains('.alert', `Your score: ${mockQuestions.length}/${mockQuestions.length}`).should('exist');
    // Start a new quiz
    cy.get('button').contains('Take New Quiz').click();
    cy.wait('@getQuestions');
    // Check if the first question is displayed
    cy.get('h2').should('exist').and('have.text', mockQuestions[0].question);
  });

  it('should handle API errors', () => {
    cy.intercept('GET', '/api/questions/random', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('getQuestionsError');
    cy.mount(<Quiz />);
    cy.get('button').contains('Start Quiz').click();
    // Wait for the error response
    cy.wait('@getQuestionsError');
    // Verify loading state appears
    cy.get('.spinner-border').should('exist');
  });
});