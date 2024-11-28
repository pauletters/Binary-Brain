describe('Quiz Flow', () => {
  beforeEach(() => {
    // Load questions from fixture and intercept the API call
    cy.fixture('questions.json').then((data) => {
      cy.intercept('GET', '/api/questions/random', {
        statusCode: 200,
        body: data.questions
      }).as('getQuestions')
    });
// Visit the page where the quiz is located
    cy.visit('http://localhost:3001/')
  });

  it('should complete a full quiz journey', () => {
    // start the quiz
    cy.get('button').contains('Start Quiz').click();
    cy.wait('@getQuestions');

    // Answer all questions randomly
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * 4);
      cy.get('.btn-primary').eq(randomIndex).click();
    }

    // Check if the quiz is completed and the user can take a new quiz
    cy.contains('Quiz Completed').should('exist');
    cy.contains('Take New Quiz').should('exist').click();
    cy.wait('@getQuestions');
    cy.get('h2').should('exist') // New question is displayed
    cy.get('.alert-success').should('not.exist') // Quiz results are not displayed
    cy.contains('Quiz Completed').should('not.exist') // Quiz completed message is not displayed
  });
});